import { NextResponse } from "next/server";
import { ingestDocument } from "../../../../services/knowledge/ingestion";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const url = typeof body?.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: "URL is required",
        },
        { status: 400 }
      );
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid URL",
        },
        { status: 400 }
      );
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        {
          success: false,
          error: "Only HTTP and HTTPS URLs are supported",
        },
        { status: 400 }
      );
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent": "ModelNow-KnowledgeHub/1.0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch URL. HTTP ${response.status}`,
        },
        { status: 400 }
      );
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        {
          success: false,
          error: "The URL does not contain an HTML web page",
        },
        { status: 400 }
      );
    }

    const html = await response.text();

    const text = extractTextFromHtml(html);

    if (!text.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "No readable text was found on the web page",
        },
        { status: 400 }
      );
    }

    const title =
      typeof body?.title === "string" && body.title.trim()
        ? body.title.trim()
        : parsedUrl.hostname;

    const ingestion = await ingestDocument({
      title,
      content: text,
      source: parsedUrl.toString(),
      metadata: {
        sourceType: "web",
        url: parsedUrl.toString(),
        hostname: parsedUrl.hostname,
      },
    });

    if (ingestion.status === "failed") {
      return NextResponse.json(
        {
          success: false,
          error: ingestion.error ?? "URL ingestion failed",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "URL ingested successfully",
      url: parsedUrl.toString(),
      ingestion: {
        documentId: ingestion.document.id,
        title: ingestion.document.title,
        chunkCount: ingestion.chunkCount,
        embeddedCount: ingestion.embeddedCount,
        vectorStoredCount: ingestion.vectorStoredCount,
        status: ingestion.status,
      },
    });
  } catch (error) {
    console.error("Knowledge URL ingestion error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "URL ingestion failed",
      },
      { status: 500 }
    );
  }
}

function extractTextFromHtml(html: string): string {
  const withoutScripts = html.replace(
    /<script[\s\S]*?<\/script>/gi,
    " "
  );

  const withoutStyles = withoutScripts.replace(
    /<style[\s\S]*?<\/style>/gi,
    " "
  );

  const withoutComments = withoutStyles.replace(
    /<!--[\s\S]*?-->/g,
    " "
  );

  const text = withoutComments
    .replace(/<\/(p|div|section|article|main|header|footer|li|h[1-6]|br)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();

  return text;
}