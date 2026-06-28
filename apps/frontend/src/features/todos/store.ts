import { create } from "zustand";
import * as api from "./api";
import type {
  BoardData,
  Cycle,
  CustomField,
  Issue,
  IssueCreatePayload,
  IssueUpdatePayload,
  Label,
  Priority,
  Project,
  Status,
} from "./model";

export type ViewMode = "board" | "list";

export interface FilterState {
  status_id: number | null;
  project_id: number | null;
  cycle_id: number | null;
  label_ids: number[];
  priority: Priority | null;
  due_after: string | null;
  due_before: string | null;
  q: string;
}

interface AppState {
  issues: Issue[];
  board: BoardData | null;
  statuses: Status[];
  labels: Label[];
  projects: Project[];
  cycles: Cycle[];
  customFields: CustomField[];
  loading: boolean;
  error: string | null;
  view: ViewMode;
  filters: FilterState;
  selectedIssueIds: number[];
  darkMode: boolean;

  // Loaders
  loadBoard: (projectId?: number, cycleId?: number) => Promise<void>;
  loadIssues: () => Promise<void>;
  loadInbox: () => Promise<void>;
  loadMetadata: () => Promise<void>;
  loadIssue: (id: number) => Promise<Issue>;

  // Mutations
  createIssue: (payload: IssueCreatePayload) => Promise<Issue>;
  updateIssue: (id: number, payload: IssueUpdatePayload) => Promise<Issue>;
  deleteIssue: (id: number) => Promise<void>;
  addRelation: (issueId: number, targetId: number, relationType: string) => Promise<void>;
  removeRelation: (relationId: number) => Promise<void>;

  // Metadata mutations
  createStatus: (payload: Omit<Status, "id" | "created_at" | "updated_at">) => Promise<Status>;
  updateStatus: (id: number, payload: Omit<Status, "id" | "created_at" | "updated_at">) => Promise<Status>;
  deleteStatus: (id: number) => Promise<void>;
  createLabel: (payload: Omit<Label, "id" | "created_at" | "updated_at">) => Promise<Label>;
  updateLabel: (id: number, payload: Omit<Label, "id" | "created_at" | "updated_at">) => Promise<Label>;
  deleteLabel: (id: number) => Promise<void>;
  createProject: (payload: Omit<Project, "id" | "created_at" | "updated_at">) => Promise<Project>;
  updateProject: (id: number, payload: Omit<Project, "id" | "created_at" | "updated_at">) => Promise<Project>;
  deleteProject: (id: number) => Promise<void>;
  createCycle: (payload: Omit<Cycle, "id" | "created_at" | "updated_at">) => Promise<Cycle>;
  updateCycle: (id: number, payload: Omit<Cycle, "id" | "created_at" | "updated_at">) => Promise<Cycle>;
  deleteCycle: (id: number) => Promise<void>;

  // Custom fields
  createCustomField: (payload: Omit<CustomField, "id" | "created_at" | "updated_at">) => Promise<CustomField>;
  updateCustomField: (id: number, payload: Omit<CustomField, "id" | "created_at" | "updated_at">) => Promise<CustomField>;
  deleteCustomField: (id: number) => Promise<void>;

  // UI state
  setView: (view: ViewMode) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  toggleSelectedIssue: (id: number) => void;
  clearSelection: () => void;
  bulkUpdate: (payload: IssueUpdatePayload) => Promise<void>;
  toggleDarkMode: () => void;
  initDarkMode: () => void;
}

const defaultFilters: FilterState = {
  status_id: null,
  project_id: null,
  cycle_id: null,
  label_ids: [],
  priority: null,
  due_after: null,
  due_before: null,
  q: "",
};

export const useAppStore = create<AppState>((set, get) => ({
  issues: [],
  board: null,
  statuses: [],
  labels: [],
  projects: [],
  cycles: [],
  customFields: [],
  loading: false,
  error: null,
  view: "board",
  filters: { ...defaultFilters },
  selectedIssueIds: [],
  darkMode: false,

  loadBoard: async (projectId, cycleId) => {
    set({ loading: true, error: null });
    try {
      const board = await api.fetchBoard(projectId, cycleId);
      set({ board, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unknown error", loading: false });
    }
  },

  loadIssues: async () => {
    set({ loading: true, error: null });
    try {
      const filters = get().filters;
      const issues = await api.fetchIssues({
        status_id: filters.status_id ?? undefined,
        project_id: filters.project_id ?? undefined,
        cycle_id: filters.cycle_id ?? undefined,
        label_ids: filters.label_ids.length ? filters.label_ids : undefined,
        priority: filters.priority ?? undefined,
        q: filters.q || undefined,
      });
      set({ issues, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unknown error", loading: false });
    }
  },

  loadInbox: async () => {
    set({ loading: true, error: null });
    try {
      const issues = await api.fetchInbox();
      set({ issues, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unknown error", loading: false });
    }
  },

  loadMetadata: async () => {
    try {
      const [statuses, labels, projects, cycles, customFields] = await Promise.all([
        api.fetchStatuses(),
        api.fetchLabels(),
        api.fetchProjects(),
        api.fetchCycles(),
        api.fetchCustomFields(),
      ]);
      set({ statuses, labels, projects, cycles, customFields });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  loadIssue: async (id) => {
    const issue = await api.fetchIssue(id);
    return issue;
  },

  createIssue: async (payload) => {
    const res = await api.createIssue(payload);
    await get().loadBoard(get().filters.project_id ?? undefined, get().filters.cycle_id ?? undefined);
    return res.data;
  },

  updateIssue: async (id, payload) => {
    const res = await api.updateIssue(id, payload);
    await get().loadBoard(get().filters.project_id ?? undefined, get().filters.cycle_id ?? undefined);
    return res.data;
  },

  deleteIssue: async (id) => {
    await api.deleteIssue(id);
    await get().loadBoard(get().filters.project_id ?? undefined, get().filters.cycle_id ?? undefined);
  },

  addRelation: async (issueId, targetId, relationType) => {
    await api.addRelation(issueId, targetId, relationType);
  },

  removeRelation: async (relationId) => {
    await api.removeRelation(relationId);
  },

  createStatus: async (payload) => {
    const status = await api.createStatus(payload);
    await get().loadMetadata();
    await get().loadBoard();
    return status;
  },

  updateStatus: async (id, payload) => {
    const status = await api.updateStatus(id, payload);
    await get().loadMetadata();
    await get().loadBoard();
    return status;
  },

  deleteStatus: async (id) => {
    await api.deleteStatus(id);
    await get().loadMetadata();
    await get().loadBoard();
  },

  createLabel: async (payload) => {
    const label = await api.createLabel(payload);
    await get().loadMetadata();
    return label;
  },

  updateLabel: async (id, payload) => {
    const label = await api.updateLabel(id, payload);
    await get().loadMetadata();
    return label;
  },

  deleteLabel: async (id) => {
    await api.deleteLabel(id);
    await get().loadMetadata();
  },

  createProject: async (payload) => {
    const project = await api.createProject(payload);
    await get().loadMetadata();
    return project;
  },

  updateProject: async (id, payload) => {
    const project = await api.updateProject(id, payload);
    await get().loadMetadata();
    return project;
  },

  deleteProject: async (id) => {
    await api.deleteProject(id);
    await get().loadMetadata();
  },

  createCycle: async (payload) => {
    const cycle = await api.createCycle(payload);
    await get().loadMetadata();
    return cycle;
  },

  updateCycle: async (id, payload) => {
    const cycle = await api.updateCycle(id, payload);
    await get().loadMetadata();
    return cycle;
  },

  deleteCycle: async (id) => {
    await api.deleteCycle(id);
    await get().loadMetadata();
  },

  createCustomField: async (payload) => {
    const cf = await api.createCustomField(payload);
    await get().loadMetadata();
    return cf;
  },

  updateCustomField: async (id, payload) => {
    const cf = await api.updateCustomField(id, payload);
    await get().loadMetadata();
    return cf;
  },

  deleteCustomField: async (id) => {
    await api.deleteCustomField(id);
    await get().loadMetadata();
  },

  setView: (view) => set({ view }),

  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),

  resetFilters: () => set({ filters: { ...defaultFilters } }),

  toggleSelectedIssue: (id) =>
    set((state) => ({
      selectedIssueIds: state.selectedIssueIds.includes(id)
        ? state.selectedIssueIds.filter((x) => x !== id)
        : [...state.selectedIssueIds, id],
    })),

  clearSelection: () => set({ selectedIssueIds: [] }),

  bulkUpdate: async (payload) => {
    const ids = get().selectedIssueIds;
    await Promise.all(ids.map((id) => api.updateIssue(id, payload)));
    get().clearSelection();
    await get().loadBoard(get().filters.project_id ?? undefined, get().filters.cycle_id ?? undefined);
  },

  toggleDarkMode: () => {
    set((state) => {
      const darkMode = !state.darkMode;
      if (darkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("kabanq-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("kabanq-theme", "light");
      }
      return { darkMode };
    });
  },

  initDarkMode: () => {
    const saved = localStorage.getItem("kabanq-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const darkMode = saved === "dark" || (!saved && prefersDark);
    if (darkMode) document.documentElement.classList.add("dark");
    set({ darkMode });
  },
}));

// Backward compat alias
export const useTodoStore = useAppStore;
