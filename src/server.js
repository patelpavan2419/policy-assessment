import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import app from "./app.js";
import { rehydrateSchedules } from "./services/scheduler.js";
dotenv.config();
const PORT = process.env.PORT || 8080;
connectDB().then(() => {
  // rehydrate scheduled jobs from DB
  rehydrateSchedules().catch((e)=>console.error('rehydrate error', e));
  app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
}).catch(err => {
  console.error('Failed to connect DB', err);
  process.exit(1);
});
