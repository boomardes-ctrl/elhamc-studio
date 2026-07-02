import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import initSqlJs from "sql.js";

// استيراد البيانات الافتراضية من src
import { INITIAL_PROJECTS, SERVICES, CASE_STUDIES, INITIAL_SITE_TEXTS } from "./src/data.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // =========================================
  // إعداد SQLite Database
  // =========================================
  const SQL = await initSqlJs();
  const dbPath = path.join(process.cwd(), "database.sqlite");
  let db: any;

  function initDatabase() {
    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath);
      db = new SQL.Database(buffer);
      console.log("✓ SQLite database loaded from database.sqlite");
    } else {
      db = new SQL.Database();
      console.log("✓ New SQLite database created");
    }

    // إنشاء الجداول
    db.run(`
      CREATE TABLE IF NOT EXISTS site_data (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // التحقق من وجود بيانات أولية
    const row = db.exec("SELECT COUNT(*) as count FROM site_data");
    const count = row[0]?.values[0][0] || 0;

    if (count === 0) {
      console.log("Initializing database with default data...");
      
      const insertStmt = db.prepare("INSERT OR REPLACE INTO site_data (key, value) VALUES (?, ?)");
      insertStmt.run(["projects", JSON.stringify(INITIAL_PROJECTS)]);
      insertStmt.run(["services", JSON.stringify(SERVICES)]);
      insertStmt.run(["caseStudies", JSON.stringify(CASE_STUDIES)]);
      insertStmt.run(["siteTexts", JSON.stringify(INITIAL_SITE_TEXTS)]);
      insertStmt.free();
      
      saveDatabase();
      console.log("✓ Default data saved to SQLite");
    }
  }

  function saveDatabase() {
    try {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
    } catch (err) {
      console.error("Error saving database:", err);
    }
  }

  function getData(key: string): any {
    try {
      const result = db.exec(`SELECT value FROM site_data WHERE key = '${key}'`);
      if (result.length > 0 && result[0].values.length > 0) {
        return JSON.parse(result[0].values[0][0] as string);
      }
    } catch (err) {
      console.error(`Error reading ${key}:`, err);
    }
    return null;
  }

  function setData(key: string, value: any) {
    try {
      const stmt = db.prepare("INSERT OR REPLACE INTO site_data (key, value) VALUES (?, ?)");
      stmt.run([key, JSON.stringify(value)]);
      stmt.free();
    } catch (err) {
      console.error(`Error saving ${key}:`, err);
    }
  }

  // تهيئة قاعدة البيانات
  initDatabase();

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
  app.get("/api/data", (req, res) => {
    try {
      const data = {
        projects: getData("projects") || INITIAL_PROJECTS,
        services: getData("services") || SERVICES,
        caseStudies: getData("caseStudies") || CASE_STUDIES,
        siteTexts: getData("siteTexts") || INITIAL_SITE_TEXTS,
      };
      res.json(data);
    } catch (err) {
      console.error("Error loading data:", err);
      res.status(500).json({ error: "Failed to load data" });
    }
  });

  // POST: حفظ البيانات
  app.post("/api/save", (req, res) => {
    try {
      const { projects, services, caseStudies, siteTexts } = req.body;
      if (projects) setData("projects", projects);
      if (services) setData("services", services);
      if (caseStudies) setData("caseStudies", caseStudies);
      if (siteTexts) setData("siteTexts", siteTexts);
      saveDatabase();
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
