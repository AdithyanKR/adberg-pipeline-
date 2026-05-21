import fs from "fs";
import path from "path";
import { prisma, isDbConnected } from "./db";
import { Prisma } from "@prisma/client";

export interface NoteData {
  id?: string;
  t: string;
  ts: string;
}

export interface TaskData {
  id: string;
  client: string;
  title: string;
  type: string;
  assigned: string;
  due: string | null; // YYYY-MM-DD
  stage: number;
  revisions: number;
  notes: NoteData[];
}

const LOCAL_DATA_PATH = path.join(process.cwd(), "src/lib/local_db.json");

// Helper to generate IDs matching original client-side code
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Helper to generate timestamps matching original client-side code
function ts() {
  return new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function seedTasks(): TaskData[] {
  const d = (n: number) => {
    const x = new Date();
    x.setDate(x.getDate() + n);
    return x.toISOString().slice(0, 10);
  };
  
  return [
    {
      id: uid(),
      client: "Zara Boutique",
      title: "Summer reel – new arrivals",
      type: "Reel",
      assigned: "Editor 1",
      due: d(-2),
      stage: 4,
      notes: [{ t: "Use trending audio, keep under 30s", ts: ts() }],
      revisions: 0,
    },
    {
      id: uid(),
      client: "Zara Boutique",
      title: "Story: sale countdown",
      type: "Story",
      assigned: "Junior",
      due: d(1),
      stage: 3,
      notes: [],
      revisions: 0,
    },
    {
      id: uid(),
      client: "SpiceHouse",
      title: "Meta ad – Eid collection",
      type: "Meta Ad",
      assigned: "Editor 2",
      due: d(-5),
      stage: 6,
      notes: [{ t: "Client wants red palette", ts: ts() }],
      revisions: 1,
    },
    {
      id: uid(),
      client: "SpiceHouse",
      title: "Google search ad copy",
      type: "Google Ad",
      assigned: "Copywriter",
      due: d(3),
      stage: 2,
      notes: [],
      revisions: 0,
    },
    {
      id: uid(),
      client: "TechNest",
      title: "Product launch reel",
      type: "Reel",
      assigned: "Editor 1",
      due: d(0),
      stage: 5,
      notes: [],
      revisions: 0,
    },
    {
      id: uid(),
      client: "TechNest",
      title: "YouTube Short – unboxing",
      type: "YouTube Short",
      assigned: "Editor 2",
      due: d(7),
      stage: 1,
      notes: [],
      revisions: 0,
    },
    {
      id: uid(),
      client: "FreshBakes",
      title: "Caption pack – June",
      type: "Caption/Copy",
      assigned: "Copywriter",
      due: d(2),
      stage: 2,
      notes: [],
      revisions: 0,
    },
    {
      id: uid(),
      client: "FreshBakes",
      title: "Reel – behind the scenes",
      type: "Reel",
      assigned: "Junior",
      due: d(-1),
      stage: 3,
      notes: [],
      revisions: 0,
    },
    {
      id: uid(),
      client: "SpiceHouse",
      title: "Reel revision round 2",
      type: "Reel",
      assigned: "Editor 1",
      due: d(-3),
      stage: 7,
      notes: [{ t: "Shorten to 30s, new CTA", ts: ts() }],
      revisions: 2,
    },
    {
      id: uid(),
      client: "TechNest",
      title: "Meta ad – back to school",
      type: "Meta Ad",
      assigned: "Editor 2",
      due: d(10),
      stage: 8,
      notes: [],
      revisions: 0,
    },
  ];
}

// Local file storage functions
function readLocalData(): TaskData[] {
  try {
    if (!fs.existsSync(LOCAL_DATA_PATH)) {
      const initial = seedTasks();
      fs.writeFileSync(LOCAL_DATA_PATH, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
    const raw = fs.readFileSync(LOCAL_DATA_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read local data, returning seed data:", err);
    return seedTasks();
  }
}

function writeLocalData(data: TaskData[]) {
  try {
    fs.writeFileSync(LOCAL_DATA_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write local data:", err);
  }
}

// Unified Service API
export async function getTasks(): Promise<{ tasks: TaskData[]; dbConnected: boolean }> {
  if (isDbConnected && prisma) {
    try {
      const dbTasks = await prisma.tasks.findMany({
        orderBy: { created_at: "desc" },
      });
      
      const mappedTasks: TaskData[] = dbTasks.map(t => {
        const rawNotes = t.notes as any;
        let notesArr: NoteData[] = [];
        if (Array.isArray(rawNotes)) {
          notesArr = rawNotes;
        }

        return {
          id: t.id,
          client: t.client || "",
          title: t.title || "",
          type: t.type || "",
          assigned: t.assigned || "",
          due: t.due || null,
          stage: t.stage || 1,
          revisions: t.revisions || 0,
          notes: notesArr,
        };
      });
      
      return { tasks: mappedTasks, dbConnected: true };
    } catch (error) {
      console.error("Database read error, falling back to local file storage:", error);
    }
  }
  return { tasks: readLocalData(), dbConnected: false };
}

export async function createTask(task: Omit<TaskData, "id" | "revisions" | "notes"> & { note?: string }): Promise<{ task: TaskData; dbConnected: boolean }> {
  const newId = uid();
  const timestamp = ts();
  const newNoteArr = task.note ? [{ t: task.note, ts: timestamp }] : [];

  if (isDbConnected && prisma) {
    try {
      const created = await prisma.tasks.create({
        data: {
          id: newId,
          client: task.client,
          title: task.title,
          type: task.type,
          assigned: task.assigned,
          due: task.due,
          stage: task.stage,
          revisions: 0,
          notes: newNoteArr as any,
        },
      });
      
      const mapped: TaskData = {
        id: created.id,
        client: created.client || "",
        title: created.title || "",
        type: created.type || "",
        assigned: created.assigned || "",
        due: created.due || null,
        stage: created.stage || 1,
        revisions: created.revisions || 0,
        notes: (created.notes as any) || [],
      };
      
      return { task: mapped, dbConnected: true };
    } catch (error) {
      console.error("Database write error, falling back to local file storage:", error);
    }
  }
  
  // Local fallback
  const localTasks = readLocalData();
  const fallbackTask: TaskData = {
    id: newId,
    client: task.client,
    title: task.title,
    type: task.type,
    assigned: task.assigned,
    due: task.due,
    stage: task.stage,
    revisions: 0,
    notes: newNoteArr,
  };
  localTasks.push(fallbackTask);
  writeLocalData(localTasks);
  return { task: fallbackTask, dbConnected: false };
}

export async function updateTask(id: string, updates: Partial<Omit<TaskData, "id" | "notes">>): Promise<{ task: TaskData | null; dbConnected: boolean }> {
  if (isDbConnected && prisma) {
    try {
      const dataToUpdate: any = { ...updates };
      
      const updated = await prisma.tasks.update({
        where: { id },
        data: dataToUpdate,
      });
      
      const mapped: TaskData = {
        id: updated.id,
        client: updated.client || "",
        title: updated.title || "",
        type: updated.type || "",
        assigned: updated.assigned || "",
        due: updated.due || null,
        stage: updated.stage || 1,
        revisions: updated.revisions || 0,
        notes: (updated.notes as any) || [],
      };
      
      return { task: mapped, dbConnected: true };
    } catch (error) {
      console.error("Database update error, falling back to local file storage:", error);
    }
  }
  
  // Local fallback
  const localTasks = readLocalData();
  const taskIndex = localTasks.findIndex(t => t.id === id);
  if (taskIndex === -1) return { task: null, dbConnected: false };
  
  localTasks[taskIndex] = {
    ...localTasks[taskIndex],
    ...updates,
  };
  writeLocalData(localTasks);
  return { task: localTasks[taskIndex], dbConnected: false };
}

export async function addNote(taskId: string, content: string): Promise<{ note: NoteData | null; dbConnected: boolean }> {
  const timestamp = ts();
  const newNote: NoteData = { t: content, ts: timestamp };

  if (isDbConnected && prisma) {
    try {
      const task = await prisma.tasks.findUnique({ where: { id: taskId } });
      if (task) {
        let currentNotes = (task.notes as any) || [];
        if (!Array.isArray(currentNotes)) currentNotes = [];
        
        await prisma.tasks.update({
          where: { id: taskId },
          data: {
            notes: [...currentNotes, newNote] as any,
          }
        });
        
        return {
          note: newNote,
          dbConnected: true,
        };
      }
    } catch (error) {
      console.error("Database note error, falling back to local file storage:", error);
    }
  }
  
  // Local fallback
  const localTasks = readLocalData();
  const task = localTasks.find(t => t.id === taskId);
  if (!task) return { note: null, dbConnected: false };
  
  task.notes.push(newNote);
  writeLocalData(localTasks);
  return { note: newNote, dbConnected: false };
}

export async function deleteTask(id: string): Promise<{ success: boolean; dbConnected: boolean }> {
  if (isDbConnected && prisma) {
    try {
      await prisma.tasks.delete({
        where: { id },
      });
      return { success: true, dbConnected: true };
    } catch (error) {
      console.error("Database delete error, falling back to local file storage:", error);
    }
  }
  
  // Local fallback
  const localTasks = readLocalData();
  const filtered = localTasks.filter(t => t.id !== id);
  if (filtered.length === localTasks.length) {
    return { success: false, dbConnected: false };
  }
  writeLocalData(filtered);
  return { success: true, dbConnected: false };
}
