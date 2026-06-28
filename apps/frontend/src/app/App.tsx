import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/widgets/MainLayout";
import { BoardPage } from "@/pages/BoardPage";
import { ListPage } from "@/pages/ListPage";
import { InboxPage } from "@/pages/InboxPage";
import { ProjectPage } from "@/pages/ProjectPage";
import { CyclePage } from "@/pages/CyclePage";
import { SettingsPage } from "@/pages/SettingsPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/board" replace />} />
        <Route path="board" element={<BoardPage />} />
        <Route path="list" element={<ListPage />} />
        <Route path="inbox" element={<InboxPage />} />
        <Route path="projects/:projectId" element={<ProjectPage />} />
        <Route path="cycles/:cycleId" element={<CyclePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
