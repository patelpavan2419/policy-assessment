import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Worker } from "worker_threads";
const router = express.Router();
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "file is required" });
    const worker = new Worker(path.join(process.cwd(), 'src', 'workers', 'uploadWorkerThread.js'), {
      workerData: { filePath: req.file.path }
    });
    worker.on('message', msg => console.log('Worker:', msg));
    worker.on('error', err => console.error('Worker error', err));
    worker.on('exit', code => console.log('Worker exited', code));
    return res.json({ status: "processing", file: req.file.filename });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
