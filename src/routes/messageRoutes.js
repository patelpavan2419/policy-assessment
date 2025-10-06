import express from "express";
import { scheduleMessage } from "../services/scheduler.js";
const router = express.Router();
router.post("/", async (req, res) => {
  const { message, day, time } = req.body;
  if (!message || !day || !time) return res.status(400).json({ error: "message, day, time required" });
  try { const doc = await scheduleMessage(message, day, time); res.json({ message: "Message scheduled", schedule: doc }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get("/", async (req, res) => {
  const ScheduleModel = (await import("../models/Schedule.js")).default;
  const docs = await ScheduleModel.find().lean();
  res.json(docs);
});
export default router;
