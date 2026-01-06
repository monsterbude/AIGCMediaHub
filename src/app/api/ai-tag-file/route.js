import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Dynamically import tagger to avoid errors if not available
    const { tagImage, isAITaggerEnabled } = await import("@/lib/tagger");

    // Check if AI tagging is enabled
    const enabled = await isAITaggerEnabled();
    if (!enabled) {
      return NextResponse.json(
        { error: "AI tagging is not enabled or plugin not found" },
        { status: 400 }
      );
    }

    // Tag the file
    const tags = await tagImage(fileId);

    // Fetch updated file with tags
    const file = await prisma.fileMetaInfo.findUnique({
      where: { id: fileId },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializeFile = (f) => {
      if (!f) return null;
      return {
        ...f,
        fileSize: f.fileSize.toString(),
        createdTime: f.createdTime,
        modifiedTime: f.modifiedTime,
        lastScanned: f.lastScanned,
        tags: f.tags.map(tag => ({
          ...tag,
          tag: {
            ...tag.tag
          }
        }))
      };
    };

    return NextResponse.json({
      success: true,
      tags: tags,
      file: serializeFile(file),
    });
  } catch (error) {
    console.error("[API] AI tag file error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
