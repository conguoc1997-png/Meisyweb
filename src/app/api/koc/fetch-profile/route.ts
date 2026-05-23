import { NextRequest, NextResponse } from "next/server";

type ProfileResult = {
  ten: string;
  platform: string;
  linkProfile: string;
  follower: number | null;
  avatar: string | null;
  bio: string | null;
};

function detectPlatform(url: string): string {
  if (/tiktok\.com/i.test(url)) return "tiktok";
  if (/shopee\.vn/i.test(url)) return "shopee";
  if (/instagram\.com/i.test(url)) return "instagram";
  if (/facebook\.com|fb\.com/i.test(url)) return "facebook";
  return "tiktok";
}

function extractUsername(url: string, platform: string): string {
  try {
    const u = new URL(url);
    switch (platform) {
      case "tiktok": {
        // https://www.tiktok.com/@username or //@username/video/...
        const m = u.pathname.match(/^\/@([^/?]+)/);
        if (m) return m[1];
        break;
      }
      case "instagram": {
        // https://www.instagram.com/username/
        const m = u.pathname.match(/^\/([^/?]+)/);
        if (m && m[1] !== "p" && m[1] !== "reel") return m[1];
        break;
      }
      case "facebook": {
        // https://www.facebook.com/username or /profile.php?id=...
        const idParam = u.searchParams.get("id");
        if (idParam) return idParam;
        const m = u.pathname.match(/^\/([^/?]+)/);
        if (m && m[1] !== "profile.php") return m[1];
        break;
      }
      case "shopee": {
        // https://shopee.vn/seller-name or /shop/shopId
        const m = u.pathname.match(/^\/([^/?]+)/);
        if (m && m[1] !== "shop") return m[1];
        const shopM = u.pathname.match(/\/shop\/(\d+)/);
        if (shopM) return shopM[1];
        break;
      }
    }
  } catch {}
  return "";
}

// Parse follower count từ string như "1.2M", "500K", "1,234"
function parseFollower(str: string): number | null {
  if (!str) return null;
  const clean = str.replace(/,/g, "").trim();
  const m = clean.match(/([\d.]+)\s*([KkMmBb]?)/);
  if (!m) return null;
  const num = parseFloat(m[1]);
  const unit = m[2].toUpperCase();
  if (unit === "K") return Math.round(num * 1000);
  if (unit === "M") return Math.round(num * 1000000);
  if (unit === "B") return Math.round(num * 1000000000);
  return Math.round(num);
}

// Thử fetch trang để lấy og:title hoặc title
async function fetchPageMeta(url: string): Promise<{ title: string | null; description: string | null; image: string | null }> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
        "Accept": "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { title: null, description: null, image: null };
    const html = await res.text();

    // og:title
    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1];

    // title tag
    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];

    // og:description
    const ogDesc = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1]
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)?.[1];

    // og:image
    const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1];

    return {
      title: ogTitle || titleTag || null,
      description: ogDesc || null,
      image: ogImage || null,
    };
  } catch {
    return { title: null, description: null, image: null };
  }
}

// Làm sạch tên KOC từ title trang
function cleanTitle(title: string, platform: string, username: string): string {
  // TikTok: "@username · Tên thật | TikTok" → "Tên thật"
  // Instagram: "username • Instagram" → "username"
  // Facebook: "Tên KOC - Facebook" → "Tên KOC"
  let t = title.trim();

  // Bỏ phần suffix platform
  t = t.replace(/\s*[\|·•\-–]\s*(TikTok|Instagram|Facebook|Shopee)[^|·•\-–]*/gi, "").trim();
  t = t.replace(/\s*on (TikTok|Instagram|Facebook|Shopee).*/gi, "").trim();

  // TikTok: "@abc (Tên thật)" → "Tên thật"
  const parenM = t.match(/\(([^)]+)\)/);
  if (parenM && parenM[1].length > 2) return parenM[1].trim();

  // Bỏ @username prefix
  t = t.replace(new RegExp(`^@?${username}\\s*[·•\\-–]?\\s*`, "i"), "").trim();

  return t || username;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json() as { url: string };
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL không hợp lệ" }, { status: 400 });
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http")) normalizedUrl = "https://" + normalizedUrl;

    const platform = detectPlatform(normalizedUrl);
    const username = extractUsername(normalizedUrl, platform);

    // Fetch page meta
    const meta = await fetchPageMeta(normalizedUrl);

    let ten = username;
    if (meta.title) {
      ten = cleanTitle(meta.title, platform, username);
    }

    // Nếu vẫn không có tên, dùng username
    if (!ten || ten.length < 2) ten = username || "KOC mới";

    const result: ProfileResult = {
      ten: ten.slice(0, 100),
      platform,
      linkProfile: normalizedUrl,
      follower: null,
      avatar: meta.image?.startsWith("http") ? meta.image : null,
      bio: meta.description ? meta.description.slice(0, 200) : null,
    };

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: "Không thể lấy thông tin từ link này" }, { status: 500 });
  }
}
