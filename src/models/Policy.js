import mongoose from "mongoose";
const policySchema = new mongoose.Schema({
  policyNumber: { type: String, unique: true, required: true },
  startDate: Date,
  endDate: Date,
  policyCategory: String,
  companyCollectionId: String,
  userId: String,
  policyType: String,
  policyMode: String,
  premiumWritten: Number,
  premium: Number,
  csr: String,
  hasActiveClientPolicy: String,
  agent: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  lob: { type: mongoose.Schema.Types.ObjectId, ref: "LOB" },
  carrier: { type: mongoose.Schema.Types.ObjectId, ref: "Carrier" }
});
export default mongoose.model("Policy", policySchema);
