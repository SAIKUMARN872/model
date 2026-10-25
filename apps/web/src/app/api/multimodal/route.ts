import { NextResponse } from "next/server";

import { runMultimodalOrchestrator } from "../../../services/multimodal/orchestrator";

import type {
  MultimodalInput,
  MultimodalInputType,
  MultimodalRequest,
} from "../../../services/multimodal/types";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const messageValue = formData.get("message");
    const toolValue = formData.get("tool");
    const categoryValue = formData.get("category");

    const message =
      typeof messageValue === "string" ? messageValue : "";

    const tool =
      typeof toolValue === "string" ? toolValue : undefined;

    const category =
      typeof categoryValue === "string"
        ? categoryValue
        : undefined;

    const inputs: MultimodalInput[] = [];

    const files = formData.getAll("files");

    for (const item of files) {
      if (!(item instanceof File)) {
        continue;
      }

      inputs.push({
        type: getInputType(item.type, item.name),
        name: item.name,
        mimeType: item.type || undefined,
        size: item.size,
      });
    }

    if (!message.trim() && inputs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A message or at least one input file is required.",
        },
        { status: 400 },
      );
    }

    const multimodalRequest: MultimodalRequest = {
      message,
      inputs,
      tool,
      category,
    };

    const result =
      await runMultimodalOrchestrator(multimodalRequest);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Multimodal API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process multimodal request.",
      },
      { status: 500 },
    );
  }
}

function getInputType(
  mimeType: string,
  fileName: string,
): MultimodalInputType {
  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.startsWith("audio/")) {
    return "audio";
  }

  if (mimeType.startsWith("video/")) {
    return "video";
  }

  if (mimeType === "application/pdf") {
    return "pdf";
  }

  const extension = fileName
    .split(".")
    .pop()
    ?.toLowerCase();

  if (
    extension === "txt" ||
    extension === "doc" ||
    extension === "docx"
  ) {
    return "document";
  }

  return "document";
}