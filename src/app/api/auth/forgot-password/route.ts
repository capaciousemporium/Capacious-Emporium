import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { email } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json({
      message: "If account exists, reset link sent."
    });
  }

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.user.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExpiry: new Date(
        Date.now() + 1000 * 60 * 30
      ),
    },
  });

  const resetLink =
    `${process.env.NEXT_PUBLIC_BASE_URL}/en-IN/auth/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Password",
    html: `
      <h2>Password Reset</h2>
      <p>Click below link:</p>

      <a href="${resetLink}">
        Reset Password
      </a>
    `,
  });

  return NextResponse.json({
    message: "Reset link sent to email."
  });
}