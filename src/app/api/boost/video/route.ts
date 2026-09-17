import { NextRequest, NextResponse } from "next/server";

const ENDPOINT = "https://www.googleapis.com/youtube/v3/search";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "Missing q" }, { status: 400 });
  }

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return NextResponse.json({ needsKey: true });
  }

  const url = new URL(ENDPOINT);
  url.searchParams.set("key", key);
  url.searchParams.set("q", query);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "1");
  url.searchParams.set("videoEmbeddable", "true");
  url.searchParams.set("safeSearch", "strict");

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) {
    return NextResponse.json(
      { error: `YouTube returned ${res.status}` },
      { status: 502 },
    );
  }

  const data = await res.json();
  const item = data.items?.[0];
  if (!item) return NextResponse.json({ notFound: true });

  return NextResponse.json({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
  });
}
