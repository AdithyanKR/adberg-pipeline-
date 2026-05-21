import { NextRequest, NextResponse } from "next/server";
import { updateTask, deleteTask } from "@/lib/tasksService";

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const id = params.id;
  try {
    const body = await req.json();
    const result = await updateTask(id, body);
    
    if (!result.task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const id = params.id;
  try {
    const result = await deleteTask(id);
    
    if (!result.success) {
      return NextResponse.json({ error: "Task not found or delete failed" }, { status: 404 });
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete task" }, { status: 500 });
  }
}
