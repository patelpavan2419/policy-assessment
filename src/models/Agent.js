import mongoose from "mongoose";
const agentSchema = new mongoose.Schema({ name: { type: String, required: true }, agency_id: String });
export default mongoose.model("Agent", agentSchema);
