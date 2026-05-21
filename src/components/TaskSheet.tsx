"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconRefresh, IconTrash, IconPlus, IconMessage } from "@tabler/icons-react";
import { Task, STAGES, TEAM, TYPES } from "@/types";
import { dueStatus, dueLabel } from "./TaskCard";

interface TaskSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "detail";
  initialStageId?: number;
  task?: Task;
  onAddTask?: (task: {
    client: string;
    title: string;
    type: string;
    assigned: string;
    due: string;
    stage: number;
    note: string;
  }) => Promise<void>;
  onMoveStage?: (taskId: string, stageId: number) => Promise<void>;
  onAddNote?: (taskId: string, noteContent: string) => Promise<void>;
  onAddRevision?: (taskId: string) => Promise<void>;
  onDeleteTask?: (taskId: string) => Promise<void>;
}

export default function TaskSheet({
  isOpen,
  onClose,
  mode,
  initialStageId = 1,
  task,
  onAddTask,
  onMoveStage,
  onAddNote,
  onAddRevision,
  onDeleteTask,
}: TaskSheetProps) {
  // Add task state
  const [client, setClient] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [assigned, setAssigned] = useState(TEAM[0]);
  const [stageId, setStageId] = useState(initialStageId);
  const [due, setDue] = useState("");
  const [noteText, setNoteText] = useState("");
  
  // Detail mode state
  const [newNote, setNewNote] = useState("");

  // Reset fields on open
  useEffect(() => {
    if (isOpen && mode === "add") {
      setClient("");
      setTitle("");
      setType(TYPES[0]);
      setAssigned(TEAM[0]);
      setStageId(initialStageId);
      setDue(new Date().toISOString().slice(0, 10));
      setNoteText("");
    }
  }, [isOpen, mode, initialStageId]);

  const handleSubmitAdd = async () => {
    const trimmedClient = client.trim();
    const trimmedTitle = title.trim();
    if (!trimmedClient || !trimmedTitle) {
      alert("Enter client name and content title");
      return;
    }
    if (onAddTask) {
      await onAddTask({
        client: trimmedClient,
        title: trimmedTitle,
        type,
        assigned,
        due,
        stage: stageId,
        note: noteText.trim(),
      });
      onClose();
    }
  };

  const handleSaveNote = async () => {
    const trimmedNote = newNote.trim();
    if (!trimmedNote || !task || !onAddNote) return;
    await onAddNote(task.id, trimmedNote);
    setNewNote("");
  };

  const handleAddRevision = async () => {
    if (!task || !onAddRevision) return;
    await onAddRevision(task.id);
  };

  const handleDelete = async () => {
    if (!task || !onDeleteTask) return;
    if (window.confirm("Delete this task?")) {
      await onDeleteTask(task.id);
      onClose();
    }
  };

  const status = task ? dueStatus(task.due) : "";
  const label = task ? dueLabel(task.due, status) : "";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 z-40 flex items-end justify-center"
          />

          {/* iOS Bottom Sheet Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 max-h-[92vh] overflow-y-auto bg-ios-bg rounded-t-[20px] p-5 pb-8 z-50 shadow-2xl flex flex-col gap-4 max-w-lg mx-auto border-t border-ios-border"
          >
            {/* Sheet Handle Indicator */}
            <div className="w-9 h-1 bg-ios-border-secondary rounded-full mx-auto mb-1 flex-shrink-0" />

            {mode === "add" ? (
              <>
                <h3 className="font-bold text-[17px] text-ios-text text-center flex-shrink-0">
                  New content task
                </h3>
                
                <div className="flex flex-col gap-3.5">
                  <div>
                    <label className="text-[12px] font-semibold text-ios-text-secondary mb-1 block">
                      Client name
                    </label>
                    <input
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      placeholder="e.g. Zara Boutique"
                      className="w-full bg-ios-bg-secondary border border-ios-border rounded-xl px-3.5 py-2.5 text-[15px] text-ios-text focus:outline-none focus:border-blue-accent"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-semibold text-ios-text-secondary mb-1 block">
                      Content title
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Summer reel – new arrivals"
                      className="w-full bg-ios-bg-secondary border border-ios-border rounded-xl px-3.5 py-2.5 text-[15px] text-ios-text focus:outline-none focus:border-blue-accent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[12px] font-semibold text-ios-text-secondary mb-1 block">
                        Content type
                      </label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full bg-ios-bg-secondary border border-ios-border rounded-xl px-3 py-2.5 text-[15px] text-ios-text focus:outline-none appearance-none"
                      >
                        {TYPES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-ios-text-secondary mb-1 block">
                        Assign to
                      </label>
                      <select
                        value={assigned}
                        onChange={(e) => setAssigned(e.target.value)}
                        className="w-full bg-ios-bg-secondary border border-ios-border rounded-xl px-3 py-2.5 text-[15px] text-ios-text focus:outline-none appearance-none"
                      >
                        {TEAM.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[12px] font-semibold text-ios-text-secondary mb-1 block">
                        Start stage
                      </label>
                      <select
                        value={stageId}
                        onChange={(e) => setStageId(parseInt(e.target.value))}
                        className="w-full bg-ios-bg-secondary border border-ios-border rounded-xl px-3 py-2.5 text-[15px] text-ios-text focus:outline-none appearance-none"
                      >
                        {STAGES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.id}. {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-ios-text-secondary mb-1 block">
                        Due date
                      </label>
                      <input
                        type="date"
                        value={due}
                        onChange={(e) => setDue(e.target.value)}
                        className="w-full bg-ios-bg-secondary border border-ios-border rounded-xl px-3 py-2 text-[15px] text-ios-text focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[12px] font-semibold text-ios-text-secondary mb-1 block">
                      Brief notes
                    </label>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Key details, references, links…"
                      rows={3}
                      className="w-full bg-ios-bg-secondary border border-ios-border rounded-xl px-3.5 py-2.5 text-[14px] text-ios-text focus:outline-none focus:border-blue-accent resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSubmitAdd}
                    className="w-full bg-navy hover:opacity-90 active:scale-[0.98] text-white rounded-xl py-3.5 text-[16px] font-bold transition-all mt-2 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <IconPlus size={18} className="stroke-[3]" /> Add to pipeline
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full bg-ios-bg-secondary border border-ios-border hover:opacity-90 active:scale-[0.98] text-ios-text-secondary rounded-xl py-3 text-[15px] font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              task && (
                <>
                  <div className="text-center flex-shrink-0 border-b border-ios-border pb-3">
                    <h3 className="font-bold text-[18px] text-ios-text leading-snug">
                      {task.title}
                    </h3>
                    <p className="text-[13px] font-semibold text-ios-info-text mt-1">
                      {task.client}
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-3.5 bg-ios-bg-secondary p-3.5 rounded-xl border border-ios-border">
                      <div>
                        <span className="text-[10px] font-bold text-ios-text-tertiary uppercase tracking-wider block">
                          Type
                        </span>
                        <span className="text-[14px] text-ios-text font-semibold">
                          {task.type}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-ios-text-tertiary uppercase tracking-wider block">
                          Assigned
                        </span>
                        <span className="text-[14px] text-ios-text font-semibold">
                          {task.assigned}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-ios-text-tertiary uppercase tracking-wider block">
                          Due
                        </span>
                        <span
                          className={`text-[14px] font-semibold ${
                            status === "overdue"
                              ? "text-ios-danger-text font-bold"
                              : status === "urgent"
                              ? "text-ios-warning-text font-bold"
                              : "text-ios-text"
                          }`}
                        >
                          {task.due ? label : "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-ios-text-tertiary uppercase tracking-wider block">
                          Revisions
                        </span>
                        <span className="text-[14px] text-ios-text font-semibold">
                          {task.revisions} / 2
                        </span>
                      </div>
                    </div>

                    {/* Move Stage Selector */}
                    <div>
                      <label className="text-[12px] font-semibold text-ios-text-secondary mb-1 block">
                        Move to stage
                      </label>
                      <select
                        value={task.stage}
                        onChange={(e) => onMoveStage?.(task.id, parseInt(e.target.value))}
                        className="w-full bg-ios-bg-secondary border border-ios-border rounded-xl px-3.5 py-2.5 text-[15px] text-ios-text focus:outline-none appearance-none"
                      >
                        {STAGES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.id}. {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Notes List */}
                    <div>
                      <label className="text-[12px] font-semibold text-ios-text-secondary mb-2 block flex items-center gap-1">
                        <IconMessage size={14} /> Notes
                      </label>
                      <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto no-scrollbar">
                        {task.notes.length > 0 ? (
                          task.notes.map((n, i) => (
                            <div
                              key={n.id || i}
                              className="bg-ios-bg-secondary border border-ios-border rounded-xl p-2.5 flex flex-col gap-0.5"
                            >
                              <span className="text-[10px] text-ios-text-tertiary font-semibold">
                                {n.ts}
                              </span>
                              <p className="text-[13px] text-ios-text leading-relaxed whitespace-pre-wrap">
                                {n.t}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-[13px] text-ios-text-tertiary text-center py-2 bg-ios-bg-secondary/40 rounded-xl border border-dashed border-ios-border">
                            No notes yet
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Add Note Section */}
                    <div>
                      <label className="text-[12px] font-semibold text-ios-text-secondary mb-1 block">
                        Add note
                      </label>
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Client feedback, revision instructions…"
                        rows={2}
                        className="w-full bg-ios-bg-secondary border border-ios-border rounded-xl px-3.5 py-2.5 text-[14px] text-ios-text focus:outline-none focus:border-blue-accent resize-none"
                      />
                      <button
                        onClick={handleSaveNote}
                        disabled={!newNote.trim()}
                        className="w-full bg-navy hover:opacity-90 disabled:opacity-50 active:scale-[0.98] text-white rounded-xl py-2.5 text-[14px] font-semibold transition-all mt-2 cursor-pointer disabled:cursor-not-allowed"
                      >
                        Save note
                      </button>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-ios-border">
                      {task.revisions < 2 ? (
                        <button
                          onClick={handleAddRevision}
                          className="w-full bg-ios-bg-secondary border border-ios-border hover:opacity-90 active:scale-[0.98] text-ios-text-secondary rounded-xl py-3 text-[14px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <IconRefresh size={16} /> Mark revision (+1)
                        </button>
                      ) : (
                        <div className="text-center text-[13px] text-ios-danger-text font-bold py-2 bg-ios-danger rounded-xl border border-ios-border/30">
                          Max 2 revisions reached
                        </div>
                      )}

                      <button
                        onClick={handleDelete}
                        className="w-full bg-ios-danger hover:bg-ios-danger-text/10 active:scale-[0.98] text-ios-danger-text rounded-xl py-3 text-[14px] font-semibold transition-all cursor-pointer border border-ios-danger-text/20 flex items-center justify-center gap-1.5"
                      >
                        <IconTrash size={16} /> Delete task
                      </button>

                      <button
                        onClick={onClose}
                        className="w-full bg-ios-bg-secondary border border-ios-border hover:opacity-90 active:scale-[0.98] text-ios-text-secondary rounded-xl py-3 text-[14px] font-semibold transition-all cursor-pointer mt-2"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </>
              )
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
