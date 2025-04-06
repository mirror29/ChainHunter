import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get form data from request
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Generate unique filename
    const fileId = uuidv4();
    const fileExtension = file.name.split(".").pop();
    const safeFilename = `${fileId}.${fileExtension}`;

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), "uploads");

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file to disk
    const filePath = join(uploadDir, safeFilename);
    await writeFile(filePath, buffer);

    // Save file metadata to database
    // In a real application, you would use Prisma to save this information
    /*
    const uploadedFile = await prisma.file.create({
      data: {
        name: file.name,
        path: filePath,
        size: file.size,
        mimeType: file.type,
        userId: session.user.id,
      },
    });
    */

    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        id: fileId,
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    );
  }
}
