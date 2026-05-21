"use client";

import React, { useState, useEffect } from "react";
import { 
  IconPlus, 
  IconRefresh, 
  IconLayoutKanban, 
  IconChartBar 
} from "@tabler/icons-react";
import { Task } from "@/types";
import KanbanBoard from "@/components/KanbanBoard";
import Dashboard from "@/components/Dashboard";
import TaskSheet from "@/components/TaskSheet";

export default function PipelinePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<"connecting" | "synced" | "offline">("connecting");
  const [syncMessage, setSyncMessage] = useState<string>("Connecting to shared storage…");
  
  const [activeTab, setActiveTab] = useState<"board" | "dashboard">("board");
  
  // Bottom Sheet Modal Control
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"add" | "detail">("add");
  const [addTaskStage, setAddTaskStage] = useState(1);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  // Helper to generate current timestamp string
  const getTimestamp = () => {
    return new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fetch Tasks Data
  const fetchTasks = async (showLoadingDot = false) => {
    if (showLoadingDot) {
      setSyncStatus("connecting");
      setSyncMessage("Syncing with team…");
    }
    
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Sync failed");
      const data = await res.json();
      
      setTasks(data.tasks);
      setDbConnected(data.dbConnected);
      
      if (data.dbConnected) {
        setSyncStatus("synced");
        setSyncMessage(`Team board synced · ${getTimestamp()}`);
      } else {
        setSyncStatus("offline");
        setSyncMessage("Offline — showing local data");
      }
    } catch (err) {
      console.error(err);
      setSyncStatus("offline");
      setSyncMessage("Offline — showing local data");
    }
  };

  // Poll for live updates every 15 seconds (reduced from 30s for more fluid team sync)
  useEffect(() => {
    fetchTasks(true);
    const interval = setInterval(() => {
      fetchTasks(false);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Update selected task reference if tasks state updates
  useEffect(() => {
    if (selectedTask) {
      const updated = tasks.find(t => t.id === selectedTask.id);
      if (updated) setSelectedTask(updated);
    }
  }, [tasks, selectedTask]);

  // CRUD handlers calling endpoints
  const handleAddTask = async (newTaskData: {
    client: string;
    title: string;
    type: string;
    assigned: string;
    due: string;
    stage: number;
    note: string;
  }) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTaskData),
      });
      if (res.ok) {
        await fetchTasks(false);
      }
    } catch (err) {
      console.error("Failed to add task", err);
    }
  };

  const handleMoveStage = async (taskId: string, stageId: number) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: stageId }),
      });
      if (res.ok) {
        await fetchTasks(false);
      }
    } catch (err) {
      console.error("Failed to move stage", err);
    }
  };

  const handleAddNote = async (taskId: string, noteContent: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteContent }),
      });
      if (res.ok) {
        await fetchTasks(false);
      }
    } catch (err) {
      console.error("Failed to add note", err);
    }
  };

  const handleAddRevision = async (taskId: string) => {
    const currentTask = tasks.find(t => t.id === taskId);
    if (!currentTask || currentTask.revisions >= 2) return;
    
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revisions: currentTask.revisions + 1 }),
      });
      if (res.ok) {
        await fetchTasks(false);
      }
    } catch (err) {
      console.error("Failed to increment revisions", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchTasks(false);
      }
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  // Stats calculation
  const totalCount = tasks.length;
  const inProdCount = tasks.filter(t => t.stage > 1 && t.stage < 8).length;
  const publishedCount = tasks.filter(t => t.stage === 8).length;
  const overdueCount = tasks.filter((t) => {
    if (!t.due) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((new Date(t.due).getTime() - today.getTime()) / 864e5);
    return diff < 0;
  }).length;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col gap-3">
      
      {/* iOS TOP NAVIGATION PANEL */}
      <header className="bg-navy rounded-[20px] p-4 md:p-5 flex flex-col gap-3 shadow-md text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[20px] md:text-[22px] font-black tracking-tight">
              Adberg Pipeline
            </h1>
            <p className="text-[12px] font-medium text-[#7FA8CC] mt-0.5">
              Shared team board · live sync
            </p>
          </div>
          <button
            onClick={() => {
              setAddTaskStage(1);
              setSheetMode("add");
              setSheetOpen(true);
            }}
            className="bg-white hover:bg-slate-100 active:scale-95 text-navy font-bold text-[14px] rounded-xl px-4 py-2.5 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <IconPlus size={16} className="stroke-[3]" /> Add task
          </button>
        </div>

        {/* Dynamic Metric Badges */}
        <div className="grid grid-cols-4 gap-1.5 mt-1.5">
          <div className="bg-white/10 rounded-xl p-2 text-center">
            <div className="text-[18px] md:text-[20px] font-extrabold leading-none">
              {totalCount}
            </div>
            <div className="text-[10px] text-[#7FA8CC] font-semibold mt-1">
              Total
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-2 text-center">
            <div className="text-[18px] md:text-[20px] font-extrabold leading-none">
              {inProdCount}
            </div>
            <div className="text-[10px] text-[#7FA8CC] font-semibold mt-1">
              In prod
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-2 text-center">
            <div className="text-[18px] md:text-[20px] font-extrabold leading-none text-[#f87171]">
              {overdueCount}
            </div>
            <div className="text-[10px] text-[#7FA8CC] font-semibold mt-1">
              Overdue
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-2 text-center">
            <div className="text-[18px] md:text-[20px] font-extrabold leading-none text-[#4ade80]">
              {publishedCount}
            </div>
            <div className="text-[10px] text-[#7FA8CC] font-semibold mt-1">
              Published
            </div>
          </div>
        </div>
      </header>

      {/* SYNC STATUS BAR */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 bg-ios-bg border border-ios-border rounded-xl shadow-sm">
        <span 
          className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors duration-300 ${
            syncStatus === "connecting"
              ? "bg-[#f59e0b] animate-pulse"
              : syncStatus === "offline"
              ? "bg-[#ef4444]"
              : "bg-[#22c55e]"
          }`} 
        />
        <span className="text-[12px] font-semibold text-ios-text-secondary flex-1">
          {syncMessage}
        </span>
        <button
          onClick={() => fetchTasks(true)}
          className="text-[12px] font-bold text-blue-accent flex items-center gap-0.5 hover:opacity-85 active:scale-95 transition-all cursor-pointer"
        >
          <IconRefresh size={14} className="stroke-[2.5]" /> Sync
        </button>
      </div>

      {/* SEGMENTED TAB SELECTOR */}
      <div className="flex bg-ios-bg-tertiary/60 border border-ios-border rounded-[12px] p-0.5 max-w-md mx-auto w-full shrink-0">
        <button
          onClick={() => setActiveTab("board")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] text-[13px] font-bold transition-all cursor-pointer ${
            activeTab === "board"
              ? "bg-ios-bg text-ios-text shadow"
              : "text-ios-text-secondary hover:text-ios-text"
          }`}
        >
          <IconLayoutKanban size={16} /> Board
        </button>
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] text-[13px] font-bold transition-all cursor-pointer ${
            activeTab === "dashboard"
              ? "bg-ios-bg text-ios-text shadow"
              : "text-ios-text-secondary hover:text-ios-text"
          }`}
        >
          <IconChartBar size={16} /> Dashboard
        </button>
      </div>

      {/* MAIN VIEW CONTENT CONTAINER */}
      <main className="flex-1 w-full mt-1">
        {activeTab === "board" ? (
          <KanbanBoard
            tasks={tasks}
            onCardClick={(task) => {
              setSelectedTask(task);
              setSheetMode("detail");
              setSheetOpen(true);
            }}
            onAddTaskClick={(stageId) => {
              setAddTaskStage(stageId);
              setSheetMode("add");
              setSheetOpen(true);
            }}
          />
        ) : (
          <Dashboard tasks={tasks} />
        )}
      </main>

      {/* BOTTOM SLIDING MODAL SHEET */}
      <TaskSheet
        isOpen={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setSelectedTask(undefined);
        }}
        mode={sheetMode}
        initialStageId={addTaskStage}
        task={selectedTask}
        onAddTask={handleAddTask}
        onMoveStage={handleMoveStage}
        onAddNote={handleAddNote}
        onAddRevision={handleAddRevision}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  );
}
