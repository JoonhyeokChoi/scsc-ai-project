import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { db } from "./firestore.js";

const app = express();
const PORT = Number(process.env.PORT || 8080);

app.use(helmet());
app.use(cors({ origin: true }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));

/**
 * 컬렉션 구조(수집기 기준):
 * - yt_top10/{region}_{YYYY-MM-DD} : { region, date, items[...], ... }
 * - yt_top10_latest/{region}       : { region, date, ref, updated_at }
 */

app.get("/api/health", (_req: Request, res: Response) => {
  res.set("Cache-Control", "no-store");
  res.json({ ok: true, service: "yt-top10-backend-ts", time: new Date().toISOString() });
});

app.get("/api/regions", async (_req: Request, res: Response) => {
  try {
    const snap = await db.collection("yt_top10_latest").get();
    const regions = snap.docs.map(d => d.id).sort();
    res.set("Cache-Control", "public, max-age=300");
    res.json({ regions });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed_to_list_regions" });
  }
});

app.get("/api/snapshots/latest", async (req: Request, res: Response) => {
  try {
    const region = String(req.query.region || "").toUpperCase();
    if (!region) return res.status(400).json({ error: "region_required" });

    const latestDoc = await db.collection("yt_top10_latest").doc(region).get();
    if (!latestDoc.exists) return res.status(404).json({ error: "no_latest_for_region", region });

    const data = latestDoc.data() || {};
    const date = data.date as string | undefined;
    if (!date) return res.status(404).json({ error: "latest_missing_date", region });

    const docId = `${region}_${date}`;
    const snapshotDoc = await db.collection("yt_top10").doc(docId).get();
    if (!snapshotDoc.exists) return res.status(404).json({ error: "snapshot_not_found", docId });

    const sData = snapshotDoc.data() || {};
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
    res.json({
      region: sData.region,
      date: sData.date,
      count: Array.isArray(sData.items) ? sData.items.length : 0,
      items: sData.items ?? [],
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed_to_get_latest" });
  }
});

app.get("/api/snapshots/:region/:date", async (req: Request, res: Response) => {
  try {
    const region = String(req.params.region || "").toUpperCase();
    const date = String(req.params.date || "");
    if (!region || !date) return res.status(400).json({ error: "region_and_date_required" });

    const docId = `${region}_${date}`;
    const snapshotDoc = await db.collection("yt_top10").doc(docId).get();
    if (!snapshotDoc.exists) return res.status(404).json({ error: "snapshot_not_found", docId });

    const sData = snapshotDoc.data() || {};
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
    res.json({
      region: sData.region,
      date: sData.date,
      count: Array.isArray(sData.items) ? sData.items.length : 0,
      items: sData.items ?? [],
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed_to_get_snapshot" });
  }
});

app.get("/api/snapshots", async (req: Request, res: Response) => {
  try {
    const region = String(req.query.region || "").toUpperCase();
    const limit = Number(req.query.limit || 7);
    if (!region) return res.status(400).json({ error: "region_required" });

    // date 필드 인덱스 필요할 수 있음(콘솔에서 오류 메시지 통해 인덱스 생성)
    const snap = await db
      .collection("yt_top10")
      .where("region", "==", region)
      .orderBy("date", "desc")
      .limit(limit)
      .get();

    const list = snap.docs.map(d => {
      const data = d.data() || {};
      return { id: d.id, date: data.date as string | undefined };
    });

    res.set("Cache-Control", "public, max-age=300");
    res.json({ region, list });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "failed_to_list_snapshots", details: String(e?.message || e) });
  }
});

app.use((_req, res) => res.status(404).json({ error: "not_found" }));

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
