import express from "express";
import path from "path";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { createClient } from '@supabase/supabase-js';

import { INITIAL_PROJECTS, SERVICES, CASE_STUDIES, INITIAL_SITE_TEXTS } from "./src/data.ts";

const supabaseUrl = 'https://ivtgzlneskrqvssjepjr.supabase.co';
const supabaseKey = 'sb_publishable_YcOzVLovfj2IeoZR5wNGGw_GXtr-gOR';
const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET_NAME = 'elhamc-files';

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
    } catch {
      return null;
    }
  }

  async function setData(key: string, value: any) {
    const existing = await getData(key);
    if (existing !== null) {
      await supabase.from('site_data').update({ value: JSON.stringify(value) }).eq('key', key);
    } else {
      await supabase.from('site_data').insert({ key, value: JSON.stringify(value) });
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
  // إعداد Supabase Storage للملفات
  // =========================================
  const { data: bucket } = await supabase.storage.getBucket(BUCKET_NAME);
  if (!bucket) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 104857600
    });
    console.log(`✓ Storage bucket "${BUCKET_NAME}" created`);
  }

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 },
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // =========================================
  // API Routes
  // =========================================

  app.get("/api/data", async (req, res) => {
    try {
      res.json({
        projects: await getData("projects") || INITIAL_PROJECTS,
        services: await getData("services") || SERVICES,
        caseStudies: await getData("caseStudies") || CASE_STUDIES,
        siteTexts: await getData("siteTexts") || INITIAL_SITE_TEXTS,
      });
    } catch (err) {
      console.error("Error loading data:", err);
      res.status(500).json({ error: "Failed to load data" });
    }
  });

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

  async function uploadToSupabase(file: Express.Multer.File) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, file.buffer, { contentType: file.mimetype, upsert: true });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename);
    return publicUrl;
  }

  app.post("/api/upload", upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const url = await uploadToSupabase(req.file);
      res.json({
        success: true,
        url,
        name: req.file.originalname,
        size: req.file.size,
        filename: url.split('/').pop(),
      });
    } catch (err: any) {
      console.error("Error uploading file:", err);
      res.status(500).json({ error: err.message || "Failed to upload file" });
    }
  });

  app.post("/api/upload-multiple", upload.array("files", 10), async (req: any, res) => {
    try {
      const files: Express.Multer.File[] = req.files || [];
      const results = await Promise.all(files.map(async (file) => {
        const url = await uploadToSupabase(file);
        return {
          success: true,
          url,
          name: file.originalname,
          size: file.size,
          filename: url.split('/').pop(),
        };
      }));
      res.json(results);
    } catch (err: any) {
      console.error("Error uploading files:", err);
      res.status(500).json({ error: err.message || "Failed to upload files" });
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
    console.log(`\n  🔥 ELHAMC STUDIO SERVER`);
    console.log(`  ════════════════════════`);
    console.log(`  📍 http://localhost:${PORT}`);
    console.log(`  💾 Supabase: Connected`);
    console.log(`  📂 Storage: ${BUCKET_NAME}`);
    console.log(`  🟢 Status: RUNNING\n`);
  });
}

startServer();
