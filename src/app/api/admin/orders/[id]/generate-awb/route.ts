import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (session?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const token = await getShiprocketToken();

    // shipment_id এবং courier_id
    // Shiprocket dashboard/create-order response থেকে আসবে

    const shipmentId = order.id;

    const awbResponse = await fetch(
      "https://apiv2.shiprocket.in/v1/external/courier/assign/awb",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shipment_id: shipmentId,
          courier_id: process.env.SHIPROCKET_COURIER_ID,
        }),
      }
    );

    const awbData = await awbResponse.json();

    const awbCode =
      awbData?.response?.data?.awb_code ||
      awbData?.awb_code;

    if (!awbCode) {
      return NextResponse.json(
        {
          error: "AWB not returned from Shiprocket",
        },
        { status: 400 }
      );
    }

    await prisma.order.update({
      where: { id },
      data: {
        trackingNumber: awbCode,
        trackingUrl: `https://shiprocket.co/tracking/${awbCode}`,
      },
    });

    return NextResponse.json({
      success: true,
      awb: awbCode,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to generate AWB" },
      { status: 500 }
    );
  }
}