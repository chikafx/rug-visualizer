import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function imageUrlToBase64(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch the rug image.");
  }

  const contentType =
    response.headers.get("content-type") || "image/jpeg";

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return {
    data: buffer.toString("base64"),
    mimeType: contentType,
  };
}

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Gemini API key is not configured. Add GEMINI_API_KEY to .env.local.",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();

    const roomImage = formData.get("roomImage") as File | null;
    const rugImageUrl = formData.get("rugImageUrl") as string | null;
    const rugName = formData.get("rugName") as string | null;
    const rugSize = formData.get("rugSize") as string | null;

    if (!roomImage || !rugImageUrl) {
      return NextResponse.json(
        {
          error: "Both a room image and rug image are required.",
        },
        { status: 400 }
      );
    }

    const roomBuffer = Buffer.from(
      await roomImage.arrayBuffer()
    );

    const roomImageBase64 = roomBuffer.toString("base64");

    const rugImage = await imageUrlToBase64(rugImageUrl);

    const prompt = `
You are an expert interior designer and photorealistic image editor.

The first image is a photograph of a customer's actual room.

The second image is the exact rug product that the customer wants
to visualize inside that room.

TASK:
Place the exact rug from the second image naturally onto the floor
of the room shown in the first image.

IMPORTANT RULES:

1. Preserve the customer's room as accurately as possible.
2. Do not redesign or significantly alter the room.
3. Preserve the walls, furniture, windows, decorations and architecture.
4. Use the EXACT rug design, colours and pattern from the rug product image.
5. Do not invent a different rug.
6. Do not change the rug's colour or pattern.
7. Place the rug realistically on the visible floor.
8. Adjust the rug's perspective according to the camera angle.
9. Scale the rug realistically for a ${rugSize || "appropriate"} rug.
10. Match the lighting and shadows of the room.
11. The result should look like a professional interior photograph.
12. Return only the final edited room image.

Rug name: ${rugName || "Selected Rug"}
Selected size: ${rugSize || "Not specified"}
`;

    const interaction = await ai.interactions.create({
      model: "gemini-3.1-flash-image",
      input: [
        {
          type: "image",
          data: roomImageBase64,
          mime_type: roomImage.type || "image/jpeg",
        },
        {
          type: "image",
          data: rugImage.data,
          mime_type: rugImage.mimeType,
        },
        {
          type: "text",
          text: prompt,
        },
      ],
    });

    const generatedImage = interaction.output_image;

    if (!generatedImage?.data) {
      throw new Error(
        "Gemini did not return a generated image."
      );
    }

    return NextResponse.json({
      image: `data:${
        generatedImage.mime_type || "image/png"
      };base64,${generatedImage.data}`,
    });
  } catch (error) {
    console.error("Visualization error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate visualization.",
      },
      { status: 500 }
    );
  }
}
