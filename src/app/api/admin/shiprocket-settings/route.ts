import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (session?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const settings =
      await prisma.shiprocketSettings.findUnique({
        where: { id: 1 },
      });

    return NextResponse.json(
      settings || {
        email: "",
        password: "",
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch Shiprocket settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (session?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { email, password } =
      await req.json();

    const settings =
      await prisma.shiprocketSettings.upsert({
        where: { id: 1 },
        update: {
          email,
          password,
        },
        create: {
          id: 1,
          email,
          password,
        },
      });

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to save Shiprocket settings" },
      { status: 500 }
    );
  }
}