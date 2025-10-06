import express from "express";
import cron from "node-cron";
import Schedule from "../models/Schedule.js";
const router = express.Router();

function buildCronExpression(day, time) {
  const t = String(time || "").trim();
  if (!/^[0-2]?\d:\d{2}$/.test(t)) {
    throw new Error("time must be in HH:MM format (24-hour)");
  }
  const [hh, mm] = t.split(":").map((x) => parseInt(x, 10));
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) throw new Error("invalid time");
  const d = (day || "*").toString().trim().toLowerCase();
  const dow = d === "*" ? "*" : d;
  return `${mm} ${hh} * * ${dow}`;
}

router.post("/schedule", async (req, res) => {
  try {
    const { message, day, time } = req.body;
    if (!message || !day || !time) {
      return res.status(400).json({ error: "message, day, time are required" });
    }
    const cronExpr = buildCronExpression(day, time);
    cron.schedule(cronExpr, () => {
      console.log(`📩 Scheduled message fired: ${message} (cron: ${cronExpr})`);
    }, { scheduled: true });

    const doc = await Schedule.create({ message, day, time, cronExpression: cronExpr });
    return res.json({ ok: true, schedule: doc });
  } catch (err) {
    console.error("POST /main error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
