import express from "express";
import Policy from "../models/Policy.js";
import User from "../models/User.js";
const router = express.Router();

router.get("/search/:username", async (req, res) => {
  try {
    const name = req.params.username;
    const user = await User.findOne({ firstName: new RegExp(`^${name}$`, 'i') });
    if (!user) return res.status(404).json({ error: "User not found" });
    const policies = await Policy.find({ user: user._id }).populate('agent account lob carrier user').lean();
    return res.json({ user: `${user.firstName}`, policies });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

router.get("/aggregate", async (req, res) => {
  try {
    const data = await Policy.aggregate([
      { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: false } },
      { $group: { _id: "$user._id", userName: { $first: "$user.firstName" }, totalPolicies: { $sum: 1 }, totalPremium: { $sum: { $ifNull: ["$premium", 0] } } } },
      { $sort: { totalPremium: -1 } }
    ]);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const rows = await Policy.find().populate('agent account lob carrier user').limit(200).lean();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
