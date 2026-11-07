const cheerio = require("cheerio");

const ALLOWED_HOST = "otakudesu.blog";
const ORDER = ["Pdrain", "Vidhide", "GoFile", "Acefile", "Mega", "VikingFile", "ODStream", "OndesuHD"];

function clean(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}
function hostRank(name) {
  const n = name.toLowerCase();
  const i = ORDER.findIndex(x => n.includes(x.toLowerCase()));
  return i < 0 ? 999 : i;
}
function extract($, quality) {
  const out = [];
  $("li").each((_, el) => {
    const li = $(el);
    const label = clean(li.text());
    if (!new RegExp(`mp4\\s*${quality}`, "i").test(label)) return;
    li.find("a[href]").each((__, a) => {
      const href = $(a).attr("href");
      const name = clean($(a).text()) || new URL(href).hostname;
      if (!href || !/^https?:\/\//i.test(href)) return;
      let u;
      try { u = new URL(href); } catch { return; }
      if (u.hostname === ALLOWED_HOST || u.hostname.endsWith("." + ALLOWED_HOST)) return;
      out.push({ name, url: href, quality, rank: hostRank(name) });
    });
  });
  const seen = new Set();
  return out.filter(x => {
    if (seen.has(x.url)) return false;
    seen.add(x.url);
    return true;
  }).sort((a,b) => a.rank - b.rank);
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  const episode = req.query.episode;
  if (!episode) return res.status(400).json({ error: "Missing ?episode=URL" });

  let target;
  try { target = new URL(episode); } catch { return res.status(400).json({ error: "Invalid episode URL" }); }
  if (target.hostname !== ALLOWED_HOST && !target.hostname.endsWith("." + ALLOWED_HOST)) {
    return res.status(400).json({ error: "Only otakudesu.blog episode URLs are allowed" });
  }
  if (!target.pathname.includes("/episode/")) return res.status(400).json({ error: "URL must be an episode page" });

  try {
    const response = await fetch(target.href, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36",
        "Referer": "https://otakudesu.blog/"
      }
    });
    if (!response.ok) return res.status(502).json({ error: `OtakuDesu returned ${response.status}` });
    const html = await response.text();
    const $ = cheerio.load(html);

    const roads = [];
    for (const q of ["720p", "480p", "360p"]) {
      const links = extract($, q);
      if (!links.length) continue;
      roads.push({
        name: `${q} — semua mirror`,
        episodes: links.map(x => ({
          name: `${x.name} (${q})`,
          url: x.url
        }))
      });
    }

    // Also include player mirror links visible in the page's mirror sections.
    const playerLinks = [];
    $("a[href]").each((_, a) => {
      const href = $(a).attr("href");
      const name = clean($(a).text());
      if (!href || !/^https?:\/\//i.test(href)) return;
      if (!/(vidhide|mega\.nz|desustream|odstream|ondesuhd)/i.test(href + " " + name)) return;
      if (playerLinks.some(x => x.url === href)) return;
      playerLinks.push({ name: name || new URL(href).hostname, url: href });
    });
    if (playerLinks.length) {
      roads.unshift({
        name: "Mirror pemutar (cek kompatibilitas)",
        episodes: playerLinks.map(x => ({ name: x.name, url: x.url }))
      });
    }

    return res.status(200).json({ roads });
  } catch (e) {
    return res.status(500).json({ error: "Resolver error", detail: String(e.message || e) });
  }
};
