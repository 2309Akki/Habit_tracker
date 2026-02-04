"use client";

import { useMemo, useState } from "react";
import { Hydrate } from "@/components/app/hydrate";
import { Header } from "@/components/app/header";
import { HabitList } from "@/components/habits/habit-list";
import { MonthView } from "@/components/calendar/month-view";
import { WeekView } from "@/components/calendar/week-view";
import { DayView } from "@/components/calendar/day-view";
import { DayPanel } from "@/components/tracker/day-panel";
import { AnalyticsPanel } from "@/components/analytics/analytics-panel";
import { ReportsPanel } from "@/components/reports/reports-panel";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";

type Tab = "tracker" | "analytics" | "reports" | "settings";

export function App() {
  const view = useAppSelector((s) => s.ui.view);
  const [tab, setTab] = useState<Tab>("tracker");

  const content = useMemo(() => {
    if (tab === "analytics") return <AnalyticsPanel />;
    if (tab === "reports") return <ReportsPanel />;
    if (tab === "settings") return <SettingsPanel />;

    if (view === "week") return <WeekView />;
    if (view === "day") return <DayView />;
    if (view === "list") return <DayPanel listMode />;
    return <MonthView />;
  }, [tab, view]);

  return (
    <div className="p-10 min-h-screen w-full overflow-x-hidden bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <Hydrate />
      <Header />

      <div className="flex flex-col gap-4 px-4 py-4 h-[calc(100vh-10rem)] md:grid md:grid-cols-[320px_1fr] md:h-auto md:gap-4">
        <div className="space-y-3 order-2 md:order-1">
          <div className="hidden md:flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={tab === "tracker" ? "primary" : "secondary"}
              onClick={() => setTab("tracker")}
            >
              Tracker
            </Button>
            <Button
              size="sm"
              variant={tab === "analytics" ? "primary" : "secondary"}
              onClick={() => setTab("analytics")}
            >
              Analytics
            </Button>
            <Button
              size="sm"
              variant={tab === "reports" ? "primary" : "secondary"}
              onClick={() => setTab("reports")}
            >
              Reports
            </Button>
            <Button
              size="sm"
              variant={tab === "settings" ? "primary" : "secondary"}
              onClick={() => setTab("settings")}
            >
              Settings
            </Button>
          </div>

          <div className="h-full overflow-auto">
            <HabitList />
          </div>
        </div>

        <div className="flex-1 space-y-4 order-1 md:order-2">
          <div className="flex flex-wrap gap-2 md:hidden">
            <Button
              size="sm"
              variant={tab === "tracker" ? "primary" : "secondary"}
              onClick={() => setTab("tracker")}
            >
              Tracker
            </Button>
            <Button
              size="sm"
              variant={tab === "analytics" ? "primary" : "secondary"}
              onClick={() => setTab("analytics")}
            >
              Analytics
            </Button>
            <Button
              size="sm"
              variant={tab === "reports" ? "primary" : "secondary"}
              onClick={() => setTab("reports")}
            >
              Reports
            </Button>
            <Button
              size="sm"
              variant={tab === "settings" ? "primary" : "secondary"}
              onClick={() => setTab("settings")}
            >
              Settings
            </Button>
          </div>

          <div className="flex-1 overflow-auto">
            {content}
            {tab === "tracker" && (view === "day" || view === "week") ? <DayPanel /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
