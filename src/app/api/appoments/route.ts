import { bookAppointment } from "@/controller/appoments/controller";
import { NextRequest, NextResponse } from "next/server";
// import { bookAppointment, type BookAppointmentErrorCode } from "@/lib/controllers/appointments.controller";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = await bookAppointment(body);

  if (!result.success) {
    return NextResponse.json(
      { success: false, statusCode: status, error: result.error,  },
    );
  }

  return NextResponse.json(
    {
      success: true,
      statusCode: 201,
      data: {
        appointmentId: result.appointmentId,
        patientId: result.patientId,
        wasNewPatient: result.wasNewPatient,
      },
    },
    { status: 201 }
  );
}