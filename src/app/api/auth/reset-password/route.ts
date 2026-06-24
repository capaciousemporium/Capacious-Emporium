import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Invalid or expired link" },
      { status: 400 }
    );
  }

  const hash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordHash: hash,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return NextResponse.json({
    message: "Password updated successfully",
  });
}