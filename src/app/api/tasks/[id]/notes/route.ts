import { NextRequest, NextResponse } from "next/server";
import { addNote } from "@/lib/tasksService";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const id = params.id;
  try {
    const body = await req.json();
    const { content } = body;
    
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    
    const result = await addNote(id, content);
    
    if (!result.note) {
      return NextResponse.json({ error: "Task not found or failed to add note" }, { status: 404 });
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to add note" }, { status: 500 });
  }
}
