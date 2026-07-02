import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { createClient } from '@supabase/supabase-js';

// استيراد البيانات الافتراضية من src
import { INITIAL_PROJECTS, SERVICES, CASE_STUDIES, INITIAL_SITE_TEXTS } from "./src/data.ts";

const supabaseUrl = 'https://ivtgzlneskrqvssjepjr.supabase.co';
const supabaseKey = 'sb_publishable_YcOzVLovfj2IeoZR5wNGGw_GXtr-gOR';
const supabase = createClient(supabaseUrl, supabaseKey);

async function startServer() {
  const app = express();
  const PORT = 3000;

  async function getData(key: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('site_data')
        .select('value')
        .eq('key', key)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data ? JSON.parse(data.value) : null;
    } catch (err: any) {
      console.log(`No ${key} in Supabase yet`);
      return null;
    }
  }

  async function setData(key: string, value: any) {
    try {
      const existing = await getData(key);
      if (existing !== null) {
        await supabase
          .from('site_data')
          .update({ value: JSON.stringify(value) })
          .eq('key', key);
      } else {
        await supabase
          .from('site_data')
          .insert({ key, value: JSON.stringify(value) });
      }
    } catch (err: any) {
      console.error(`Error saving ${key}:`, err.message);
    }
  }

  async function initDatabase() {
    const projects = await getData("projects");
    if (!projects) {
      console.log("Initializing Supabase with default data...");
      await setData("projects", INITIAL_PROJECTS);
      await setData("services", SERVICES);
      await setData("caseStudies", CASE_STUDIES);
      await setData("siteTexts", INITIAL_SITE_TEXTS);
      console.log("✓ Default data saved to Supabase");
    } else {
      console.log("✓ Data loaded from Supabase");
    }
  }

  await initDatabase();

  // =========================================
  // إعداد رفع الملفات (multer)
  // =========================================
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB حد أقصى
  });

  // Middlewares
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // خدمة الملفات المرفوعة
  app.use("/uploads", express.static(uploadsDir));

  // =========================================
  // API Routes
  // =========================================

  // GET: استرجاع كل البيانات
  app.get("/api/data", async (req, res) => {
    try {
      const data = {
        projects: await getData("projects") || INITIAL_PROJECTS,
        services: await getData("services") || SERVICES,
        caseStudies: await getData("caseStudies") || CASE_STUDIES,
        siteTexts: await getData("siteTexts") || INITIAL_SITE_TEXTS,
      };
      res.json(data);
    } catch (err) {
      console.error("Error loading data:", err);
      res.status(500).json({ error: "Failed to load data" });
    }
  });

  // POST: حفظ البيانات
  app.post("/api/save", async (req, res) => {
    try {
      const { projects, services, caseStudies, siteTexts } = req.body;
      if (projects) await setData("projects", projects);
      if (services) await setData("services", services);
      if (caseStudies) await setData("caseStudies", caseStudies);
      if (siteTexts) await setData("siteTexts", siteTexts);
      res.json({ success: true });
    } catch (err) {
      console.error("Error saving data:", err);
      res.status(500).json({ error: "Failed to save data" });
    }
  });

  // POST: رفع ملف
  app.post("/api/upload", upload.single("file"), (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({
        success: true,
        url: fileUrl,
        name: req.file.originalname,
        size: req.file.size,
        filename: req.file.filename,
      });
    } catch (err) {
      console.error("Error uploading file:", err);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // POST: رفع ملفات متعددة
  app.post("/api/upload-multiple", upload.array("files", 10), (req: any, res) => {
    try {
      const files: any[] = req.files || [];
      const result = files.map((file: any) => ({
        success: true,
        url: `/uploads/${file.filename}`,
        name: file.originalname,
        size: file.size,
        filename: file.filename,
      }));
      res.json(result);
    } catch (err) {
      console.error("Error uploading files:", err);
      res.status(500).json({ error: "Failed to upload files" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n`);
    console.log(`  🔥 ELHAMC STUDIO SERVER`);
    console.log(`  ════════════════════════`);
    console.log(`  📍 http://localhost:${PORT}`);
    console.log(`  📁 SQLite: database.sqlite`);
    console.log(`  📂 Uploads: /uploads/`);
    console.log(`  🟢 Status: RUNNING`);
    console.log(`\n`);
  });
}

startServer();
