import * as React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { CommandPalette } from "./CommandPalette";
import { useAppStore } from "@/features/todos";

export function MainLayout() {
  const initDarkMode = useAppStore((state) => state.initDarkMode);
  const loadMetadata = useAppStore((state) => state.loadMetadata);

  React.useEffect(() => {
    initDarkMode();
    loadMetadata();
  }, [initDarkMode, loadMetadata]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <CommandPalette />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
