import cron from "node-cron";
import Schedule from "../models/Schedule.js";

export const scheduleMessage = async (message, day, time) => {
  const [hh, mm] = time.split(':').map(x => x.trim());
  const dow = day === '*' ? '*' : day;
  const cronExpr = `${mm} ${hh} * * ${dow}`;
  cron.schedule(cronExpr, () => {
    console.log(`📩 Scheduled message: ${message} (cron: ${cronExpr})`);
  });
  const doc = await Schedule.create({ message, day, time, cronExpression: cronExpr });
  return doc;
};

export const rehydrateSchedules = async () => {
  const docs = await Schedule.find().lean();
  for (const d of docs) {
    try {
      const cronExpr = d.cronExpression;
      if (!cronExpr) continue;
      cron.schedule(cronExpr, () => {
        console.log(`📩 (rehydrated) Scheduled message: ${d.message} (cron: ${cronExpr})`);
      });
    } catch (err) {
      console.error('Failed to rehydrate schedule', d._id, err);
    }
  }
};
