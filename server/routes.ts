import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const sharedUpload = multer({ 
  dest: 'shared_uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for shared files
});

export async function registerRoutes(app: Express): Promise<Server> {
  // PDF Merger endpoint
  app.post("/api/pdf/merge", upload.array('pdf'), async (req, res) => {
    try {
      const { PDFDocument } = await import('pdf-lib');
      const fs = await import('fs');
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length < 2) {
        return res.status(400).json({ 
          error: "At least 2 PDF files are required" 
        });
      }

      // Create a new PDF document
      const mergedPdf = await PDFDocument.create();

      // Process each PDF file
      for (const file of files) {
        const pdfBytes = fs.readFileSync(file.path);
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });

        // Clean up uploaded file
        fs.unlinkSync(file.path);
      }

      // Serialize the PDF
      const mergedPdfBytes = await mergedPdf.save();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="merged-document.pdf"');
      res.send(Buffer.from(mergedPdfBytes));
      
    } catch (error) {
      console.error("PDF merge error:", error);
      res.status(500).json({ error: "Failed to merge PDFs" });
    }
  });

  // Tool usage tracking
  app.post("/api/tools/:toolId/usage", async (req, res) => {
    try {
      const { toolId } = req.params;
      const { metadata } = req.body;

      const usage = await storage.recordToolUsage({
        toolId,
        userId: "anonymous", // In a real app, get from session
        metadata
      });

      res.json(usage);
    } catch (error) {
      console.error("Tool usage tracking error:", error);
      res.status(500).json({ error: "Failed to record tool usage" });
    }
  });

  // Bookmark management
  app.post("/api/bookmarks", async (req, res) => {
    try {
      const { toolId } = req.body;
      
      const bookmark = await storage.addBookmark({
        toolId,
        userId: "anonymous" // In a real app, get from session
      });

      res.json(bookmark);
    } catch (error) {
      console.error("Bookmark creation error:", error);
      res.status(500).json({ error: "Failed to create bookmark" });
    }
  });

  // File Sharing API (Database-backed)
  app.post("/api/files", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      
      const { expiresIn } = req.body;
      const expiresAt = expiresIn ? new Date(Date.now() + parseInt(expiresIn) * 3600 * 1000) : null;

      const sharedFile = await storage.createSharedFile({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        expiresAt,
        maxDownloads: req.body.maxDownloads ? parseInt(req.body.maxDownloads) : null,
        isPublic: true
      });

      res.json(sharedFile);
    } catch (error) {
      console.error("File share error:", error);
      res.status(500).json({ error: "Failed to share file" });
    }
  });

  app.get("/api/files/:id", async (req, res) => {
    try {
      const file = await storage.getSharedFile(req.params.id);
      if (!file) return res.status(404).json({ error: "File not found" });
      res.json(file);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/files/:id/download", async (req, res) => {
    try {
      const file = await storage.getSharedFile(req.params.id);
      if (!file) return res.status(404).json({ error: "File not found" });

      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join('uploads', file.filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found on disk" });
      }

      res.download(filePath, file.originalName);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Failed to download file" });
    }
  });

  // Text Sharing API (Database-backed)
  app.post("/api/texts", async (req, res) => {
    try {
      const { title, content, expiresIn, maxDownloads } = req.body;
      const expiresAt = expiresIn ? new Date(Date.now() + parseInt(expiresIn) * 3600 * 1000) : null;

      const sharedText = await storage.createSharedText({
        title,
        content,
        expiresAt,
        maxDownloads: maxDownloads ? parseInt(maxDownloads) : null,
        isPublic: true
      });

      res.json(sharedText);
    } catch (error) {
      console.error("Text share error:", error);
      res.status(500).json({ error: "Failed to share text" });
    }
  });

  app.get("/api/texts/:id", async (req, res) => {
    try {
      const text = await storage.getSharedText(req.params.id);
      if (!text) return res.status(404).json({ error: "Text not found" });
      res.json(text);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/bookmarks/:toolId", async (req, res) => {
    try {
      const { toolId } = req.params;
      
      await storage.removeBookmark(toolId, "anonymous");
      res.json({ success: true });
    } catch (error) {
      console.error("Bookmark removal error:", error);
      res.status(500).json({ error: "Failed to remove bookmark" });
    }
  });

  // Get user bookmarks
  app.get("/api/bookmarks", async (req, res) => {
    try {
      const bookmarks = await storage.getUserBookmarks("anonymous");
      res.json(bookmarks);
    } catch (error) {
      console.error("Get bookmarks error:", error);
      res.status(500).json({ error: "Failed to get bookmarks" });
    }
  });

  // Get tool usage stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getToolStats("anonymous");
      res.json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ error: "Failed to get statistics" });
    }
  });

  // PDF Generation endpoint
  app.post("/api/generate-pdf", async (req, res) => {
    try {
      const htmlPdf = await import('html-pdf-node');
      const { html } = req.body;
      
      if (!html) {
        return res.status(400).json({ error: "HTML content is required" });
      }

      const options = {
        format: 'A4',
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        }
      };

      const file = { content: html };
      const pdfBuffer = await htmlPdf.default.generatePdf(file, options);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
      res.send(pdfBuffer);
      
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  const server = createServer(app);
  return server;
}
