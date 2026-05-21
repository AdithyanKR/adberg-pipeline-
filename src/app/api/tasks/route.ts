import { NextRequest, NextResponse } from "next/server";
import { getTasks, createTask } from "@/lib/tasksService";

export async function GET() {
  try {
    const data = await getTasks();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { client, title, type, assigned, due, stage, note } = body;
    
    if (!client || !title) {
      return NextResponse.json({ error: "Client and title are required" }, { status: 400 });
    }
    
    const result = await createTask({
      client,
      title,
      type,
      assigned,
      due: due || null,
      stage: parseInt(stage) || 1,
      note,
    });
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create task" }, { status: 500 });
  }
}
