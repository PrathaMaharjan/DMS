import { updateAppointmentStatus } from "@/controller/appoments/controller";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const result = await updateAppointmentStatus(id, body?.status);

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error, code: result.code }, { status: 400 });
  }
  return NextResponse.json({ success: true, statusCode: 200, data: {} });
}