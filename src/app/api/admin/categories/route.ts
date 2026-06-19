// app/api/admin/categories/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const body = await req.json();

  const category = await prisma.category.create({
    data: {
      name: body.name,
      slug: body.slug,
      image: body.image,
    },
  });

  return NextResponse.json(category);
}