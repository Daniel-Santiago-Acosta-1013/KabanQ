"""Backend ECS Fargate service stack."""
from aws_cdk import CfnOutput, Fn, SecretValue, Stack
from aws_cdk import aws_ec2 as ec2
from aws_cdk import aws_ecr as ecr
from aws_cdk import aws_ecs as ecs
from aws_cdk import aws_ecs_patterns as ecs_patterns
from aws_cdk import aws_rds as rds
from aws_cdk import aws_secretsmanager as secretsmanager
from constructs import Construct


class BackendStack(Stack):
    def __init__(
        self,
        scope: Construct,
        construct_id: str,
        vpc: ec2.Vpc,
        cluster: rds.DatabaseCluster,
        db_secret: secretsmanager.ISecret,
        image_uri: str | None = None,
        **kwargs,
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)

        repository = ecr.Repository(
            self,
            "BackendRepository",
            repository_name="kabanq-backend",
        )

        ecs_cluster = ecs.Cluster(
            self,
            "BackendCluster",
            vpc=vpc,
            cluster_name="kabanq-backend",
        )

        backend_security_group = ec2.SecurityGroup(
            self,
            "BackendSecurityGroup",
            vpc=vpc,
            allow_all_outbound=True,
        )

        database_url_value = Fn.join(
            "",
            [
                "postgresql://kabanq:",
                db_secret.secret_value_from_json("password").to_string(),
                "@",
                cluster.cluster_endpoint.hostname,
                ":5432/kabanq",
            ],
        )

        database_url_secret = secretsmanager.Secret(
            self,
            "DatabaseUrlSecret",
            secret_name="kabanq/database-url",
            secret_string_value=SecretValue.unsafe_plain_text(
                database_url_value
            ),
        )

        container_image = (
            ecs.ContainerImage.from_registry(image_uri)
            if image_uri
            else ecs.ContainerImage.from_ecr_repository(repository)
        )

        fargate_service = ecs_patterns.ApplicationLoadBalancedFargateService(
            self,
            "BackendService",
            cluster=ecs_cluster,
            service_name="kabanq-backend",
            cpu=256,
            memory_limit_mib=512,
            desired_count=1,
            security_groups=[backend_security_group],
            task_image_options=ecs_patterns.ApplicationLoadBalancedTaskImageOptions(
                image=container_image,
                container_port=8000,
                environment={
                    "PYTHONUNBUFFERED": "1",
                },
                secrets={
                    "DATABASE_URL": ecs.Secret.from_secrets_manager(
                        database_url_secret
                    ),
                },
            ),
            public_load_balancer=True,
        )

        fargate_service.target_group.configure_health_check(path="/api/todos")

        self.repository = repository
        self.service = fargate_service.service
        self.load_balancer = fargate_service.load_balancer

        CfnOutput(
            self,
            "RepositoryUrl",
            value=repository.repository_uri,
            description="Backend ECR repository URL",
        )
        CfnOutput(
            self,
            "LoadBalancerDnsName",
            value=fargate_service.load_balancer.load_balancer_dns_name,
            description="Backend ALB DNS name",
        )
