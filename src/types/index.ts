export interface Note {
  id?: string;
  t: string;
  ts: string;
}

export interface Task {
  id: string;
  client: string;
  title: string;
  type: string;
  assigned: string;
  due: string | null; // YYYY-MM-DD
  stage: number;
  revisions: number;
  notes: Note[];
}

export interface Stage {
  id: number;
  name: string;
  who: string;
  color: string;
  text: string;
  accent: string;
}

export const STAGES: Stage[] = [
  { id: 1, name: "Brief received", who: "Client Lead", color: "#DBEAFE", text: "#1E40AF", accent: "#1E40AF" },
  { id: 2, name: "Script / concept", who: "Copywriter", color: "#EDE9FE", text: "#5B21B6", accent: "#5B21B6" },
  { id: 3, name: "Shoot / assets", who: "Client + Delivery Lead", color: "#FEF3C7", text: "#92400E", accent: "#D97706" },
  { id: 4, name: "Editing", who: "Editor", color: "#FCE7F3", text: "#9D174D", accent: "#DB2777" },
  { id: 5, name: "Internal review", who: "Delivery Lead", color: "#D1FAE5", text: "#065F46", accent: "#059669" },
  { id: 6, name: "Client approval", who: "Client Lead", color: "#FEF3C7", text: "#92400E", accent: "#D97706" },
  { id: 7, name: "Revision", who: "Editor + Client Lead", color: "#DBEAFE", text: "#1E40AF", accent: "#2563EB" },
  { id: 8, name: "Published", who: "Delivery Lead", color: "#D1FAE5", text: "#065F46", accent: "#059669" },
];

export const TEAM = ["Editor 1", "Editor 2", "Junior", "Copywriter", "Partner"];

export const TYPES = ["Reel", "Meta Ad", "Google Ad", "Story", "YouTube Short", "Caption/Copy"];
