import { parentPort, workerData } from "worker_threads";
import fs from "fs";
import csv from "csv-parser";
import xlsx from "xlsx";
import { connectDB } from "../config/db.js";
import Agent from "../models/Agent.js";
import User from "../models/User.js";
import Account from "../models/Account.js";
import LOB from "../models/LOB.js";
import Carrier from "../models/Carrier.js";
import Policy from "../models/Policy.js";

async function processCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', () => resolve(rows))
      .on('error', (e) => reject(e));
  });
}

async function processXlsx(filePath) {
  const wb = xlsx.readFile(filePath);
  const sheetName = wb.SheetNames[0];
  const rows = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { defval: "" });
  return rows;
}

(async function() {
  const { filePath } = workerData;
  parentPort.postMessage('worker started for ' + filePath);
  try {
    await connectDB();
    const ext = filePath.split('.').pop().toLowerCase();
    const rows = ext === 'csv' ? await processCsv(filePath) : await processXlsx(filePath);

    let processed = 0;
    for (const r of rows) {
      try {
        const policyNumber = (r.policy_number || r.policyNumber || r["Policy Number"] || "").toString().trim();
        if (!policyNumber) continue;

        const agentName = (r.producer || r.agent || r.Agent || "").toString().trim();
        const agentDoc = agentName ? await Agent.findOneAndUpdate({ name: agentName }, { name: agentName }, { upsert: true, new: true }) : null;

        const email = (r.email || "").toString().trim();
        const userKey = email ? { email } : null;
        const userData = {
          firstName: r.firstname || r.FirstName || r.firstName || r["First Name"] || "",
          dob: r.dob ? new Date(r.dob) : null,
          address: r.address || r.Address || "",
          phone: r.phone || r.Phone || "",
          city: r.city || "",
          state: r.state || "",
          zip: r.zip || "",
          email,
          gender: r.gender || "",
          userType: r.userType || r.UserType || "",
          applicantId: r["Applicant ID"] || r.applicantId || ""
        };
        const userDoc = userKey ? await User.findOneAndUpdate(userKey, userData, { upsert: true, new: true }) : null;

        const accountName = (r.account || r.account_name || r["Account Name"] || "").toString().trim();
        const accountDoc = accountName ? await Account.findOneAndUpdate({ name: accountName }, { name: accountName }, { upsert: true, new: true }) : null;

        const lobName = (r.policy_category || r.category_name || r["LOB"] || r.lob || "").toString().trim();
        const lobDoc = lobName ? await LOB.findOneAndUpdate({ name: lobName }, { name: lobName }, { upsert: true, new: true }) : null;

        const carrierName = (r.company_name || r.carrier || r.carrier_name || "").toString().trim();
        const carrierDoc = carrierName ? await Carrier.findOneAndUpdate({ name: carrierName }, { name: carrierName }, { upsert: true, new: true }) : null;

        const policyData = {
          policyNumber,
          startDate: r.policy_start_date || r.startDate || r.start_date ? new Date(r.policy_start_date || r.startDate || r.start_date) : null,
          endDate: r.policy_end_date || r.endDate || r.end_date ? new Date(r.policy_end_date || r.endDate || r.end_date) : null,
          policyCategory: lobDoc ? lobDoc._id.toString() : (r.policy_category || r.category_name || ""),
          companyCollectionId: carrierDoc ? carrierDoc._id.toString() : (r.company_collection_id || ""),
          userId: userDoc ? userDoc._id.toString() : (r.user_id || ""),
          agent: agentDoc ? agentDoc._id : null,
          user: userDoc ? userDoc._id : null,
          account: accountDoc ? accountDoc._id : null,
          lob: lobDoc ? lobDoc._id : null,
          carrier: carrierDoc ? carrierDoc._id : null
        };
        await Policy.findOneAndUpdate({ policyNumber }, policyData, { upsert: true, new: true });
        processed++;
      } catch (e) {
        console.error('row error', e);
      }
    }

    parentPort.postMessage({ status: 'done', processed });
    process.exit(0);
  } catch (err) {
    parentPort.postMessage({ status: 'error', error: err.message });
    process.exit(1);
  }
})();
