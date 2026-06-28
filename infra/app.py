"""CDK app entry point for KabanQ infrastructure."""
import os

import aws_cdk as cdk

from infra.backend_stack import BackendStack
from infra.database_stack import DatabaseStack
from infra.frontend_stack import FrontendStack
from infra.vpc_stack import VpcStack

app = cdk.App(outdir="cdk.out")

env = cdk.Environment(
    account=os.environ.get("CDK_DEFAULT_ACCOUNT"),
    region=os.environ.get("CDK_DEFAULT_REGION", "us-east-1"),
)

vpc_stack = VpcStack(app, "KabanqVpcStack", env=env)

database_stack = DatabaseStack(
    app,
    "KabanqDatabaseStack",
    vpc=vpc_stack.vpc,
    env=env,
)

backend_stack = BackendStack(
    app,
    "KabanqBackendStack",
    vpc=vpc_stack.vpc,
    cluster=database_stack.cluster,
    db_secret=database_stack.secret,
    env=env,
)

frontend_stack = FrontendStack(
    app,
    "KabanqFrontendStack",
    env=env,
)

frontend_stack.add_dependency(backend_stack)
backend_stack.add_dependency(database_stack)
database_stack.add_dependency(vpc_stack)

app.synth()
