"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconCalendar, IconMessage, IconRefresh, IconChevronRight } from "@tabler/icons-react";
import { Task, STAGES } from "@/types";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export function dueStatus(due: string | null): "overdue" | "urgent" | "" {
  if (!due) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((new Date(due).getTime() - today.getTime()) / 864e5);
  return diff < 0 ? "overdue" : diff <= 2 ? "urgent" : "";
}

export function dueLabel(due: string | null, status: "overdue" | "urgent" | ""): string {
  if (!due) return "";
  const label = new Date(due).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
  if (status === "overdue") return `Overdue · ${label}`;
  if (status === "urgent") return `Due soon · ${label}`;
  return label;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const status = dueStatus(task.due);
  const label = dueLabel(task.due, status);
  const stage = STAGES.find((s) => s.id === task.stage) || STAGES[0];

  return (
    <motion.div
      layoutId={`card-${task.id}`}
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
      onClick={onClick}
      className="relative overflow-hidden bg-ios-bg border border-ios-border rounded-xl p-3.5 cursor-pointer active:scale-98 transition-shadow duration-200 flex flex-col gap-2"
    >
      {/* Accent left border bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-[4px]" 
        style={{ backgroundColor: stage.accent }} 
      />

      <div className="flex justify-between items-start gap-2">
        <h4 className="font-semibold text-[14px] text-ios-text leading-snug flex-1 pl-1">
          {task.title}
        </h4>
        <span className="text-[10px] font-bold px-2 py-1 rounded bg-ios-info text-ios-info-text whitespace-nowrap">
          {task.client}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pl-1">
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-ios-bg-secondary text-ios-text-secondary border border-ios-border">
          {task.type}
        </span>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#EDE9FE] text-[#5B21B6]">
          {task.assigned}
        </span>
        {task.revisions > 0 && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-ios-warning text-ios-warning-text flex items-center gap-0.5">
            <IconRefresh size={10} className="stroke-[3]" />
            Rev {task.revisions}
          </span>
        )}
        {task.notes.length > 0 && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-ios-bg-secondary text-ios-text-tertiary border border-ios-border flex items-center gap-0.5">
            <IconMessage size={10} className="stroke-[2.5]" />
            {task.notes.length}
          </span>
        )}
      </div>

      {task.due && (
        <div className="flex items-center gap-1 pl-1 mt-1 text-ios-text-tertiary">
          <IconCalendar size={13} className="stroke-[2.5]" />
          <span
            className={`text-[12px] font-medium ${
              status === "overdue"
                ? "text-ios-danger-text font-bold"
                : status === "urgent"
                ? "text-ios-warning-text font-bold"
                : ""
            }`}
          >
            {label}
          </span>
        </div>
      )}
    </motion.div>
  );
}
