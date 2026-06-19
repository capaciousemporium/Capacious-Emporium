import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (
      !session ||
      (session.role !== "admin" &&
        session.role !== "support")
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          error:
            "File too large. Max 5MB allowed.",
        },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error: "Only images are allowed",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const base64 = `data:${file.type};base64,${buffer.toString(
      "base64"
    )}`;

    const result =
      await cloudinary.uploader.upload(
        base64,
        {
          folder:
            "capacious-emporium",
          resource_type: "image",
        }
      );

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      size: `${(
        file.size / 1024
      ).toFixed(2)} KB`,
    });
  } catch (error) {
    console.error(
      "Cloudinary upload error:",
      error
    );

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}