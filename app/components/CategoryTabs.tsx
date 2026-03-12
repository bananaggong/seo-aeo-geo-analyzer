"use client";

import { CATEGORY_COLORS, CategoryKey } from "@/app/lib/utils/colors";

export interface TabDef {
  key: CategoryKey;
  label: string;
  failCount: number;
  warnCount: number;
}

interface CategoryTabsProps {
  tabs: TabDef[];
  activeTab: CategoryKey;
  onTabChange: (tab: CategoryKey) => void;
}

export function CategoryTabs({ tabs, activeTab, onTabChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        const cat = CATEGORY_COLORS[tab.key];
        const issueCount = tab.failCount + tab.warnCount;
        const allPass = issueCount === 0;

        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              isActive ? "text-white" : "text-slate-400 hover:text-slate-200 bg-slate-900"
            }`}
            style={isActive ? { backgroundColor: cat.hex } : {}}
          >
            {tab.label}
            {allPass ? (
              <span className="text-xs text-green-400 font-bold">✓</span>
            ) : (
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={
                  isActive
                    ? { backgroundColor: "rgba(255,255,255,0.25)", color: "#fff" }
                    : { backgroundColor: cat.bg, color: cat.hex }
                }
              >
                {issueCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
