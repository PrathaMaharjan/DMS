// src/app/api/appointments/[id]/route.ts
import { BookAppointmentErrorCode, getAppointment } from "@/controller/appoments/controller";
import { NextRequest, NextResponse } from "next/server";

const STATUS_BY_CODE: Record<BookAppointmentErrorCode, number> = {
  UNAUTHORIZED: 401,
  VALIDATION: 400,
  NOT_FOUND: 404,
  DOUBLE_BOOKED: 409,
  SERVER_ERROR: 500,
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getAppointment(id);

  if (!result.success) {
    const status = STATUS_BY_CODE[result.code];
    return NextResponse.json({ success: false, statusCode: status, error: result.error, code: result.code }, { status });
  }
  return NextResponse.json({ success: true, statusCode: 200, data: { appointment: result.appointment } });
}