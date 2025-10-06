import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  firstName: String,
  dob: Date,
  address: String,
  phone: String,
  city: String,
  state: String,
  zip: String,
  email: { type: String, unique: true, sparse: true },
  gender: String,
  userType: String,
  applicantId: String
});
export default mongoose.model("User", userSchema);
