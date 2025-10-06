import mongoose from "mongoose";
const carrierSchema = new mongoose.Schema({ name: { type: String, required: true } });
export default mongoose.model("Carrier", carrierSchema);
