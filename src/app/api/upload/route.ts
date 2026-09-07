import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { v2 as cloudinary } from "cloudinary";
import { isCloudinaryConfigured } from "@/lib/firebase/config";

export async function POST(req: Request) {
  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ error: "Image uploads aren’t available right now" }, { status: 400 });
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 8MB" }, { status: 400 });
  }
  if (file.type && !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Images only" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const root = process.env.CLOUDINARY_FOLDER || "TrisTravels";
  const purpose = form.get("purpose");
  const folder = purpose === "story" ? `${root}/story-submissions` : root;
  // Never derive public_id from the original filename — that can overwrite siblings.
  const publicId = `${Date.now()}-${randomUUID().slice(0, 8)}`;

  const uploaded = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: "image",
          overwrite: false,
          unique_filename: true,
          use_filename: false,
        },
        (err, result) => {
          if (err || !result) reject(err);
          else resolve({ secure_url: result.secure_url, public_id: result.public_id });
        },
      )
      .end(buffer);
  });

  return NextResponse.json({ url: uploaded.secure_url, publicId: uploaded.public_id });
}
