import * as React from "react";
import { useAppStore } from "@/features/todos";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { RichTextEditor } from "@/shared/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import { Label } from "@/shared/ui/label";
import { PRIORITIES } from "@/features/todos/model";

interface IssueDetailProps {
  issueId: number;
  onClose: () => void;
}

export function IssueDetail({ issueId, onClose }: IssueDetailProps) {
  const {
    loadIssue,
    updateIssue,
    deleteIssue,
    loadBoard,
    statuses,
    labels,
    projects,
    cycles,
    customFields,
    addRelation,
    removeRelation,
    createIssue,
  } = useAppStore();

  const [issue, setIssue] = React.useState<Awaited<ReturnType<typeof loadIssue>> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [relationTargetId, setRelationTargetId] = React.useState("");
  const [relationType, setRelationType] = React.useState("related");
  const [subIssueTitle, setSubIssueTitle] = React.useState("");

  React.useEffect(() => {
    setLoading(true);
    loadIssue(issueId)
      .then(setIssue)
      .finally(() => setLoading(false));
  }, [issueId, loadIssue]);

  const handleUpdate = async (patch: Parameters<typeof updateIssue>[1]) => {
    if (!issue) return;
    await updateIssue(issue.id, patch);
    const refreshed = await loadIssue(issue.id);
    setIssue(refreshed);
    await loadBoard();
  };

  const handleDelete = async () => {
    if (!issue) return;
    if (!confirm("Delete this issue?")) return;
    await deleteIssue(issue.id);
    await loadBoard();
    onClose();
  };

  const toggleLabel = (labelId: number) => {
    const current = issue?.label_ids ?? [];
    const next = current.includes(labelId)
      ? current.filter((id) => id !== labelId)
      : [...current, labelId];
    handleUpdate({ label_ids: next });
  };

  const addSubIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue || !subIssueTitle.trim()) return;
    await createIssue({
      title: subIssueTitle,
      description: "",
      status_id: issue.status_id ?? undefined,
      parent_id: issue.id,
    });
    setSubIssueTitle("");
    const refreshed = await loadIssue(issue.id);
    setIssue(refreshed);
    await loadBoard();
  };

  const addRelationHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue || !relationTargetId) return;
    await addRelation(issue.id, Number(relationTargetId), relationType);
    const refreshed = await loadIssue(issue.id);
    setIssue(refreshed);
    setRelationTargetId("");
  };

  const removeRelationHandler = async (relationId: number) => {
    await removeRelation(relationId);
    if (!issue) return;
    const refreshed = await loadIssue(issue.id);
    setIssue(refreshed);
  };

  if (loading || !issue) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">Loading...</DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: issue.status_color ?? "#94a3b8" }}
            />
            <span>{issue.status_name ?? "No status"}</span>
          </div>
          <DialogTitle className="sr-only">Issue detail</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            <Input
              value={issue.title}
              onChange={(e) => setIssue({ ...issue, title: e.target.value })}
              onBlur={(e) => handleUpdate({ title: e.target.value })}
              className="border-0 bg-transparent px-0 text-2xl font-semibold tracking-tight shadow-none focus-visible:ring-0"
            />

            <div className="mt-4">
              <RichTextEditor
                value={issue.description}
                onChange={(v) => setIssue({ ...issue, description: v })}
                placeholder="Add a description..."
              />
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleUpdate({ description: issue.description })}
                >
                  Save description
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="mb-2 text-sm font-medium">Sub-issues</h4>
              <div className="flex flex-col gap-2">
                {issue.sub_issues.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: sub.status_color ?? "#94a3b8" }}
                    />
                    {sub.title}
                  </div>
                ))}
                <form onSubmit={addSubIssue} className="flex gap-2">
                  <Input
                    placeholder="New sub-issue title"
                    value={subIssueTitle}
                    onChange={(e) => setSubIssueTitle(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Button type="submit" size="sm" disabled={!subIssueTitle.trim()}>
                    Add
                  </Button>
                </form>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="mb-2 text-sm font-medium">Relations</h4>
              <div className="flex flex-col gap-2">
                {issue.relations.map((rel) => (
                  <div
                    key={rel.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <span className="capitalize">{rel.relation_type.replace("_", " ")}</span>
                    <span className="text-muted-foreground">{rel.target_title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRelationHandler(rel.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <form onSubmit={addRelationHandler} className="flex gap-2">
                  <Select value={relationType} onValueChange={setRelationType}>
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="related">Related</SelectItem>
                      <SelectItem value="blocks">Blocks</SelectItem>
                      <SelectItem value="blocked_by">Blocked by</SelectItem>
                      <SelectItem value="duplicate">Duplicate</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Issue ID"
                    value={relationTargetId}
                    onChange={(e) => setRelationTargetId(e.target.value)}
                    className="h-8 text-sm"
                    type="number"
                  />
                  <Button type="submit" size="sm" disabled={!relationTargetId}>
                    Add
                  </Button>
                </form>
              </div>
            </div>
          </div>

          <aside className="w-64 border-l bg-muted/30 p-4 overflow-auto">
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select
                  value={issue.status_id ? String(issue.status_id) : "none"}
                  onValueChange={(v) =>
                    handleUpdate({ status_id: v === "none" ? null : Number(v) })
                  }
                >
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No status</SelectItem>
                    {statuses.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Priority</Label>
                <Select
                  value={issue.priority}
                  onValueChange={(v) => handleUpdate({ priority: v as any })}
                >
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Project</Label>
                <Select
                  value={issue.project_id ? String(issue.project_id) : "none"}
                  onValueChange={(v) =>
                    handleUpdate({ project_id: v === "none" ? null : Number(v) })
                  }
                >
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No project</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Cycle</Label>
                <Select
                  value={issue.cycle_id ? String(issue.cycle_id) : "none"}
                  onValueChange={(v) =>
                    handleUpdate({ cycle_id: v === "none" ? null : Number(v) })
                  }
                >
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No cycle</SelectItem>
                    {cycles.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Due date</Label>
                <Input
                  type="date"
                  value={issue.due_date ?? ""}
                  onChange={(e) =>
                    handleUpdate({ due_date: e.target.value || null })
                  }
                  className="mt-1 h-8 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Estimate (min)</Label>
                <Input
                  type="number"
                  value={issue.estimate ?? ""}
                  onChange={(e) =>
                    handleUpdate({
                      estimate: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="mt-1 h-8 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Labels</Label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {labels.map((label) => (
                    <Badge
                      key={label.id}
                      variant={
                        issue.label_ids.includes(label.id) ? "default" : "outline"
                      }
                      className="cursor-pointer text-[10px]"
                      style={
                        issue.label_ids.includes(label.id)
                          ? { backgroundColor: label.color, color: "#fff" }
                          : { borderColor: label.color, color: label.color }
                      }
                      onClick={() => toggleLabel(label.id)}
                    >
                      {label.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {customFields.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Custom fields</Label>
                  <div className="mt-1 space-y-2">
                    {customFields.map((cf) => {
                      const value =
                        issue.custom_field_values.find(
                          (v) => v.custom_field_id === cf.id
                        )?.value ?? "";
                      return (
                        <div key={cf.id}>
                          <Label className="text-[10px] text-muted-foreground">
                            {cf.name}
                          </Label>
                          <Input
                            value={value}
                            onChange={(e) => {
                              const next = issue.custom_field_values.filter(
                                (v) => v.custom_field_id !== cf.id
                              );
                              next.push({
                                custom_field_id: cf.id,
                                value: e.target.value,
                              });
                              handleUpdate({ custom_field_values: next });
                            }}
                            className="h-7 text-xs"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  className="w-full"
                >
                  Delete issue
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
