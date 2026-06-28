import * as React from "react";
import { useAppStore } from "@/features/todos";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

export function SettingsPage() {
  const {
    statuses,
    labels,
    projects,
    cycles,
    customFields,
    createStatus,
    updateStatus,
    deleteStatus,
    createLabel,
    updateLabel,
    deleteLabel,
    createProject,
    deleteProject,
    createCycle,
    deleteCycle,
    createCustomField,
    deleteCustomField,
  } = useAppStore();

  return (
    <div className="flex h-full flex-col">
      <header className="border-b bg-card px-6 py-3">
        <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
      </header>

      <main className="flex-1 overflow-auto px-6 py-6">
        <Tabs defaultValue="statuses" className="w-full max-w-3xl">
          <TabsList>
            <TabsTrigger value="statuses">Statuses</TabsTrigger>
            <TabsTrigger value="labels">Labels</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="cycles">Cycles</TabsTrigger>
            <TabsTrigger value="custom-fields">Custom fields</TabsTrigger>
          </TabsList>

          <TabsContent value="statuses" className="space-y-4">
            <StatusManager
              statuses={statuses}
              onCreate={createStatus}
              onUpdate={updateStatus}
              onDelete={deleteStatus}
            />
          </TabsContent>

          <TabsContent value="labels" className="space-y-4">
            <LabelManager
              labels={labels}
              onCreate={createLabel}
              onUpdate={updateLabel}
              onDelete={deleteLabel}
            />
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <ProjectManager
              projects={projects}
              onCreate={createProject}
              onDelete={deleteProject}
            />
          </TabsContent>

          <TabsContent value="cycles" className="space-y-4">
            <CycleManager
              cycles={cycles}
              onCreate={createCycle}
              onDelete={deleteCycle}
            />
          </TabsContent>

          <TabsContent value="custom-fields" className="space-y-4">
            <CustomFieldManager
              customFields={customFields}
              onCreate={createCustomField}
              onDelete={deleteCustomField}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatusManager({ statuses, onCreate, onDelete }: any) {
  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState("#94a3b8");

  const handleCreate = async () => {
    const slug = name.toLowerCase().replace(/\s+/g, "_");
    await onCreate({ name, slug, color, position: statuses.length });
    setName("");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Status name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-sm"
        />
        <Input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-8 w-14 px-1"
        />
        <Button size="sm" onClick={handleCreate} disabled={!name.trim()}>
          Add
        </Button>
      </div>
      <div className="space-y-2">
        {statuses.map((s: any) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-md border px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-sm">{s.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(s.id)}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function LabelManager({ labels, onCreate, onDelete }: any) {
  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState("#94a3b8");

  const handleCreate = async () => {
    await onCreate({ name, color });
    setName("");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Label name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-sm"
        />
        <Input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-8 w-14 px-1"
        />
        <Button size="sm" onClick={handleCreate} disabled={!name.trim()}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {labels.map((l: any) => (
          <div
            key={l.id}
            className="flex items-center gap-2 rounded-md border px-2 py-1"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: l.color }}
            />
            <span className="text-sm">{l.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-1"
              onClick={() => onDelete(l.id)}
            >
              ×
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectManager({ projects, onCreate, onDelete }: any) {
  const [name, setName] = React.useState("");

  const handleCreate = async () => {
    await onCreate({ name, description: "", color: "#6366f1" });
    setName("");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-sm"
        />
        <Button size="sm" onClick={handleCreate} disabled={!name.trim()}>
          Add
        </Button>
      </div>
      <div className="space-y-2">
        {projects.map((p: any) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-md border px-3 py-2"
          >
            <span className="text-sm">{p.name}</span>
            <Button variant="ghost" size="sm" onClick={() => onDelete(p.id)}>
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CycleManager({ cycles, onCreate, onDelete }: any) {
  const [name, setName] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");

  const handleCreate = async () => {
    await onCreate({
      name,
      start_date: startDate || null,
      end_date: endDate || null,
    });
    setName("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Cycle name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-sm"
        />
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="h-8 text-sm"
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="h-8 text-sm"
        />
        <Button size="sm" onClick={handleCreate} disabled={!name.trim()}>
          Add
        </Button>
      </div>
      <div className="space-y-2">
        {cycles.map((c: any) => (
          <div
            key={c.id}
            className="flex items-center justify-between rounded-md border px-3 py-2"
          >
            <span className="text-sm">{c.name}</span>
            <Button variant="ghost" size="sm" onClick={() => onDelete(c.id)}>
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomFieldManager({ customFields, onCreate, onDelete }: any) {
  const [name, setName] = React.useState("");
  const [fieldType, setFieldType] = React.useState("text");

  const handleCreate = async () => {
    await onCreate({ name, field_type: fieldType, options: "" });
    setName("");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Field name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-sm"
        />
        <select
          value={fieldType}
          onChange={(e) => setFieldType(e.target.value)}
          className="h-8 rounded-md border bg-background px-2 text-sm"
        >
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="date">Date</option>
          <option value="select">Select</option>
        </select>
        <Button size="sm" onClick={handleCreate} disabled={!name.trim()}>
          Add
        </Button>
      </div>
      <div className="space-y-2">
        {customFields.map((cf: any) => (
          <div
            key={cf.id}
            className="flex items-center justify-between rounded-md border px-3 py-2"
          >
            <span className="text-sm">
              {cf.name} ({cf.field_type})
            </span>
            <Button variant="ghost" size="sm" onClick={() => onDelete(cf.id)}>
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
