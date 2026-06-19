import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getShiprocketToken() {
  const response = await fetch(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
    }
  );

  const data = await response.json();
  return data.token;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order?.trackingNumber) {
    return NextResponse.json(
      { error: "Tracking number not found" },
      { status: 404 }
    );
  }

  const token = await getShiprocketToken();

  const response = await fetch(
    `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${order.trackingNumber}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  return NextResponse.json(data);
}



export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await req.json();

    const trackingNumber = body?.trackingNumber?.trim();

    if (!trackingNumber) {
      return NextResponse.json(
        { error: "Tracking number is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: {
        id,
      },
      data: {
        trackingNumber,
      },
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Tracking save error:", error);

    return NextResponse.json(
      {
        error: "Failed to save tracking number",
      },
      {
        status: 500,
      }
    );
  }
}