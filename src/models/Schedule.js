import mongoose from "mongoose";
const scheduleSchema = new mongoose.Schema({
  message: { type: String, required: true },
  day: { type: String, required: true },
  time: { type: String, required: true },
  cronExpression: String,
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model("Schedule", scheduleSchema);
