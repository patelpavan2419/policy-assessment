import mongoose from "mongoose";
const lobSchema = new mongoose.Schema({ name: { type: String, required: true } });
export default mongoose.model("LOB", lobSchema);
