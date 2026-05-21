"use client";

import React, { useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { IconChevronDown, IconPlus } from "@tabler/icons-react";
import { Task, Stage, STAGES, TYPES } from "@/types";
import TaskCard from "./TaskCard";

interface KanbanBoardProps {
  tasks: Task[];
  onCardClick: (task: Task) => void;
  onAddTaskClick: (stageId: number) => void;
}

export default function KanbanBoard({
  tasks,
  onCardClick,
  onAddTaskClick,
}: KanbanBoardProps) {
  // Filters
  const [filterClient, setFilterClient] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);

  // Collapsed stages on Mobile
  const [collapsedStages, setCollapsedStages] = useState<Record<number, boolean>>({});

  const toggleStageCollapse = (id: number) => {
    setCollapsedStages((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Get unique clients for filtering
  const clients = Array.from(new Set(tasks.map((t) => t.client))).sort();

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesClient = filterClient ? t.client === filterClient : true;
    const matchesType = filterType ? t.type === filterType : true;
    return matchesClient && matchesType;
  });

  const handlePillClick = (client: string | null, type: string | null) => {
    setFilterClient(client);
    setFilterType(type);
  };

  return (
    <div className="flex flex-col gap-3.5 h-full">
      {/* Scrollable Filter Pills Row */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 px-1 shrink-0 -mx-4 md:mx-0 md:px-0">
        <button
          onClick={() => handlePillClick(null, null)}
          className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
            !filterClient && !filterType
              ? "bg-navy border-navy text-white shadow-sm"
              : "bg-ios-bg border-ios-border text-ios-text-secondary hover:bg-ios-bg-secondary"
          }`}
        >
          All
        </button>

        {clients.map((c) => (
          <button
            key={c}
            onClick={() => handlePillClick(c, null)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
              filterClient === c
                ? "bg-navy border-navy text-white shadow-sm"
                : "bg-ios-bg border-ios-border text-ios-text-secondary hover:bg-ios-bg-secondary"
            }`}
          >
            {c}
          </button>
        ))}

        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => handlePillClick(null, t)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
              filterType === t
                ? "bg-navy border-navy text-white shadow-sm"
                : "bg-ios-bg border-ios-border text-ios-text-secondary hover:bg-ios-bg-secondary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <LayoutGroup>
        {/* HYBRID LAYOUT WORKSPACE */}
        <div className="flex-1 w-full">
          {/* MOBILE ACCORDION VIEW (lg:hidden) */}
          <div className="lg:hidden flex flex-col gap-2.5">
            {STAGES.map((s) => {
              const stageTasks = filteredTasks.filter((t) => t.stage === s.id);
              const isCollapsed = collapsedStages[s.id] ?? false;

              return (
                <div
                  key={s.id}
                  className="bg-ios-bg border border-ios-border rounded-2xl overflow-hidden flex flex-col shadow-sm"
                >
                  {/* Stage Accordion Header */}
                  <div
                    onClick={() => toggleStageCollapse(s.id)}
                    className="flex items-center gap-3 p-3.5 cursor-pointer user-select-none hover:bg-ios-bg-secondary/40 active:bg-ios-bg-secondary transition-colors"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-extrabold shrink-0"
                      style={{ backgroundColor: s.color, color: s.text }}
                    >
                      {s.id}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-bold text-ios-text leading-tight truncate">
                        {s.name}
                      </div>
                      <div className="text-[11px] text-ios-text-tertiary font-semibold truncate mt-0.5">
                        {s.who}
                      </div>
                    </div>

                    <div
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 text-center"
                      style={{ backgroundColor: s.color, color: s.text }}
                    >
                      {stageTasks.length}
                    </div>

                    <IconChevronDown
                      size={18}
                      className={`text-ios-text-tertiary transition-transform duration-200 ${
                        !isCollapsed ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {/* Stage Accordion Body */}
                  {!isCollapsed && (
                    <div className="p-2.5 pt-0 flex flex-col gap-2 bg-ios-bg-secondary/15 border-t border-ios-border/40">
                      {stageTasks.length === 0 ? (
                        <div className="text-center py-5 text-[13px] text-ios-text-tertiary italic">
                          No tasks here
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {stageTasks.map((t) => (
                            <TaskCard
                              key={t.id}
                              task={t}
                              onClick={() => onCardClick(t)}
                            />
                          ))}
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddTaskClick(s.id);
                        }}
                        className="w-full py-2.5 border border-dashed border-ios-border-secondary hover:bg-ios-bg-secondary active:scale-[0.99] text-blue-accent font-semibold text-[13px] rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 mt-1.5"
                      >
                        <IconPlus size={14} className="stroke-[3]" /> Add to {s.name}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* DESKTOP HORIZONTAL KANBAN COLUMNS VIEW (hidden lg:flex) */}
          <div className="hidden lg:flex gap-4 overflow-x-auto pb-4 no-scrollbar items-start h-[calc(100vh-220px)] min-h-[500px]">
            {STAGES.map((s) => {
              const stageTasks = filteredTasks.filter((t) => t.stage === s.id);

              return (
                <div
                  key={s.id}
                  className="w-[300px] shrink-0 bg-ios-bg-secondary/40 border border-ios-border rounded-2xl p-3 flex flex-col gap-3 max-h-full overflow-y-auto no-scrollbar shadow-sm"
                >
                  {/* Column Sticky Header */}
                  <div className="flex items-center gap-2.5 pb-2 border-b border-ios-border shrink-0">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-extrabold shrink-0"
                      style={{ backgroundColor: s.color, color: s.text }}
                    >
                      {s.id}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-bold text-ios-text leading-tight truncate">
                        {s.name}
                      </div>
                      <div className="text-[11px] text-ios-text-tertiary font-semibold truncate mt-0.5">
                        {s.who}
                      </div>
                    </div>

                    <div
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 text-center"
                      style={{ backgroundColor: s.color, color: s.text }}
                    >
                      {stageTasks.length}
                    </div>
                  </div>

                  {/* Tasks Container */}
                  <div className="flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar min-h-[150px]">
                    {stageTasks.length === 0 ? (
                      <div className="text-center py-8 text-[13px] text-ios-text-tertiary italic border border-dashed border-ios-border/60 rounded-xl bg-ios-bg/25">
                        No tasks
                      </div>
                    ) : (
                      stageTasks.map((t) => (
                        <TaskCard
                          key={t.id}
                          task={t}
                          onClick={() => onCardClick(t)}
                        />
                      ))
                    )}
                  </div>

                  {/* Bottom Column Action */}
                  <button
                    onClick={() => onAddTaskClick(s.id)}
                    className="w-full py-2.5 border border-dashed border-ios-border-secondary bg-ios-bg hover:bg-ios-bg-secondary active:scale-[0.99] text-blue-accent font-semibold text-[13px] rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 shrink-0"
                  >
                    <IconPlus size={14} className="stroke-[3]" /> Add task
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </LayoutGroup>
    </div>
  );
}
