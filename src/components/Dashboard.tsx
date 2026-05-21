"use client";

import React from "react";
import { Task, STAGES } from "@/types";
import { dueStatus } from "./TaskCard";

interface DashboardProps {
  tasks: Task[];
}

export default function Dashboard({ tasks }: DashboardProps) {
  const total = tasks.length || 1;
  const done = tasks.filter((t) => t.stage === 8).length;
  const overdue = tasks.filter((t) => dueStatus(t.due) === "overdue").length;
  const urgent = tasks.filter((t) => dueStatus(t.due) === "urgent").length;
  const ontrack = tasks.filter((t) => !dueStatus(t.due)).length;

  // Aggregate workloads
  const byEditor: Record<string, number> = {};
  const byClient: Record<string, number> = {};
  const byType: Record<string, number> = {};

  tasks.forEach((t) => {
    byEditor[t.assigned] = (byEditor[t.assigned] || 0) + 1;
    byClient[t.client] = (byClient[t.client] || 0) + 1;
    byType[t.type] = (byType[t.type] || 0) + 1;
  });

  const renderBars = (obj: Record<string, number>, color: string) => {
    return Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .map(([key, val]) => {
        const pct = Math.round((val / total) * 100);
        return (
          <div key={key} className="flex items-center gap-2 mb-2.5 last:mb-0">
            <div className="text-[12px] text-ios-text font-medium w-20 shrink-0 truncate">
              {key}
            </div>
            <div className="flex-1 h-[6px] bg-ios-bg-tertiary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            <div className="text-[12px] text-ios-text-tertiary font-semibold w-4 text-right">
              {val}
            </div>
          </div>
        );
      });
  };

  return (
    <div className="flex flex-col gap-3 max-w-lg mx-auto">
      {/* 2x2 Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-ios-bg-secondary border border-ios-border rounded-2xl p-4 flex flex-col gap-0.5 shadow-sm">
          <span className="text-[26px] font-bold text-ios-text leading-none">
            {tasks.length}
          </span>
          <span className="text-[12px] font-medium text-ios-text-secondary">
            Total tasks
          </span>
        </div>
        <div className="bg-ios-bg-secondary border border-ios-border rounded-2xl p-4 flex flex-col gap-0.5 shadow-sm">
          <span className="text-[26px] font-bold text-ios-success-text leading-none">
            {done}
          </span>
          <span className="text-[12px] font-medium text-ios-text-secondary">
            Published
          </span>
        </div>
        <div className="bg-ios-bg-secondary border border-ios-border rounded-2xl p-4 flex flex-col gap-0.5 shadow-sm">
          <span className="text-[26px] font-bold text-ios-danger-text leading-none">
            {overdue}
          </span>
          <span className="text-[12px] font-medium text-ios-text-secondary">
            Overdue
          </span>
        </div>
        <div className="bg-ios-bg-secondary border border-ios-border rounded-2xl p-4 flex flex-col gap-0.5 shadow-sm">
          <span className="text-[26px] font-bold text-ios-warning-text leading-none">
            {urgent}
          </span>
          <span className="text-[12px] font-medium text-ios-text-secondary">
            Due soon
          </span>
        </div>
      </div>

      {/* Team Member Workload Card */}
      <div className="bg-ios-bg-secondary border border-ios-border rounded-2xl p-4 shadow-sm">
        <h4 className="text-[11px] font-bold text-ios-text-secondary uppercase tracking-wider mb-3">
          Workload by team member
        </h4>
        {Object.keys(byEditor).length > 0 ? (
          renderBars(byEditor, "#0F2645")
        ) : (
          <p className="text-[12px] text-ios-text-tertiary py-1">No data</p>
        )}
      </div>

      {/* Tasks by Client Card */}
      <div className="bg-ios-bg-secondary border border-ios-border rounded-2xl p-4 shadow-sm">
        <h4 className="text-[11px] font-bold text-ios-text-secondary uppercase tracking-wider mb-3">
          Tasks by client
        </h4>
        {Object.keys(byClient).length > 0 ? (
          renderBars(byClient, "#185FA5")
        ) : (
          <p className="text-[12px] text-ios-text-tertiary py-1">No data</p>
        )}
      </div>

      {/* Content Types Card */}
      <div className="bg-ios-bg-secondary border border-ios-border rounded-2xl p-4 shadow-sm">
        <h4 className="text-[11px] font-bold text-ios-text-secondary uppercase tracking-wider mb-3">
          Content types
        </h4>
        {Object.keys(byType).length > 0 ? (
          renderBars(byType, "#5B21B6")
        ) : (
          <p className="text-[12px] text-ios-text-tertiary py-1">No data</p>
        )}
      </div>

      {/* Deadline Health Card */}
      <div className="bg-ios-bg-secondary border border-ios-border rounded-2xl p-4 shadow-sm">
        <h4 className="text-[11px] font-bold text-ios-text-secondary uppercase tracking-wider mb-3">
          Deadline health
        </h4>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <div className="text-[12px] text-ios-success-text font-semibold w-20 shrink-0 truncate">
              On track
            </div>
            <div className="flex-1 h-[6px] bg-ios-bg-tertiary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-ios-success-text transition-all duration-500"
                style={{ width: `${Math.round((ontrack / total) * 100)}%` }}
              />
            </div>
            <div className="text-[12px] text-ios-text-tertiary font-semibold w-4 text-right">
              {ontrack}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-[12px] text-ios-warning-text font-semibold w-20 shrink-0 truncate">
              Due soon
            </div>
            <div className="flex-1 h-[6px] bg-ios-bg-tertiary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-ios-warning-text transition-all duration-500"
                style={{ width: `${Math.round((urgent / total) * 100)}%` }}
              />
            </div>
            <div className="text-[12px] text-ios-text-tertiary font-semibold w-4 text-right">
              {urgent}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-[12px] text-ios-danger-text font-semibold w-20 shrink-0 truncate">
              Overdue
            </div>
            <div className="flex-1 h-[6px] bg-ios-bg-tertiary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-ios-danger-text transition-all duration-500"
                style={{ width: `${Math.round((overdue / total) * 100)}%` }}
              />
            </div>
            <div className="text-[12px] text-ios-text-tertiary font-semibold w-4 text-right">
              {overdue}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
