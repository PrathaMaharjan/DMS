// src/app/api/doctors/schedule-status/route.ts
import { getDoctorScheduleStatus } from "@/controller/doctor/controller";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const locationId = sp.get("locationId");
  const date = sp.get("date");

  if (!locationId || !date) {
    return NextResponse.json({ success: false, error: "locationId and date are required" }, { status: 400 });
  }

  const result = await getDoctorScheduleStatus(locationId, date);

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error, code: result.code }, { status: 400 });
  }
  return NextResponse.json({ success: true, statusCode: 200, data: { doctors: result.doctors } });
}