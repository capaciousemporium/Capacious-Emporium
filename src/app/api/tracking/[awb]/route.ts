import { NextResponse } from "next/server";
import { getShiprocketToken } from "@/lib/shiprocket";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ awb: string }> }
) {
  try {
    const { awb } = await params;

    const token = await getShiprocketToken();

    const response = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Tracking failed",
      },
      { status: 500 }
    );
  }
}