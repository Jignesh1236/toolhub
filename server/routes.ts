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

  // Text sharing endpoints
  app.post("/api/texts/upload", async (req, res) => {
    try {
      const { title, content, maxDownloads, expiresIn } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
      }

      let expiresAt = null;
      if (expiresIn) {
        expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn));
      }

      const sharedText = await storage.saveSharedText({
        title,
        content,
        expiresAt,
        maxDownloads: maxDownloads ? parseInt(maxDownloads) : null,
        isPublic: true
      });

      res.json({
        id: sharedText.id,
        title: sharedText.title,
        content: sharedText.content,
        uploadedAt: sharedText.uploadedAt,
        shareUrl: `${req.protocol}://${req.get('host')}/shared-text/${sharedText.id}`
      });
    } catch (error) {
      console.error("Text upload error:", error);
      res.status(500).json({ error: "Failed to upload text" });
    }
  });

  app.get("/api/texts", async (req, res) => {
    try {
      const texts = await storage.getAllSharedTexts();
      res.json(texts);
    } catch (error) {
      console.error("Get texts error:", error);
      res.status(500).json({ error: "Failed to get texts" });
    }
  });

  app.get("/api/texts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const sharedText = await storage.getSharedText(id);
      
      if (!sharedText) {
        return res.status(404).json({ error: "Text not found" });
      }

      // Check if text has expired
      if (sharedText.expiresAt && new Date() > sharedText.expiresAt) {
        return res.status(410).json({ error: "Text has expired" });
      }

      // Check download limit
      if (sharedText.maxDownloads && sharedText.downloadCount >= sharedText.maxDownloads) {
        return res.status(403).json({ error: "View limit reached" });
      }

      res.json(sharedText);
    } catch (error) {
      console.error("Get text error:", error);
      res.status(500).json({ error: "Failed to get text" });
    }
  });

  app.post("/api/texts/:id/view", async (req, res) => {
    try {
      const { id } = req.params;
      const sharedText = await storage.getSharedText(id);
      
      if (!sharedText) {
        return res.status(404).json({ error: "Text not found" });
      }

      // Check if text has expired
      if (sharedText.expiresAt && new Date() > sharedText.expiresAt) {
        return res.status(410).json({ error: "Text has expired" });
      }

      // Check download limit
      if (sharedText.maxDownloads && sharedText.downloadCount >= sharedText.maxDownloads) {
        return res.status(403).json({ error: "View limit reached" });
      }

      // Increment view count
      await storage.incrementTextViewCount(id);

      res.json({ success: true });
    } catch (error) {
      console.error("Text view error:", error);
      res.status(500).json({ error: "Failed to record view" });
    }
  });

  app.delete("/api/texts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const sharedText = await storage.getSharedText(id);
      
      if (!sharedText) {
        return res.status(404).json({ error: "Text not found" });
      }

      // Delete from storage
      await storage.deleteSharedText(id);

      res.json({ success: true });
    } catch (error) {
      console.error("Text delete error:", error);
      res.status(500).json({ error: "Failed to delete text" });
    }
  });

  // File sharing endpoints
  app.post("/api/files/upload", sharedUpload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { maxDownloads, expiresIn } = req.body;
      let expiresAt = null;
      
      if (expiresIn) {
        expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn));
      }

      const sharedFile = await storage.saveSharedFile({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        expiresAt,
        maxDownloads: maxDownloads ? parseInt(maxDownloads) : null,
        isPublic: true
      });

      res.json({
        id: sharedFile.id,
        filename: sharedFile.originalName,
        size: sharedFile.fileSize,
        uploadedAt: sharedFile.uploadedAt,
        shareUrl: `${req.protocol}://${req.get('host')}/shared/${sharedFile.id}`
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getAllSharedFiles();
      res.json(files);
    } catch (error) {
      console.error("Get files error:", error);
      res.status(500).json({ error: "Failed to get files" });
    }
  });

  app.get("/api/files/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const sharedFile = await storage.getSharedFile(id);
      
      if (!sharedFile) {
        return res.status(404).json({ error: "File not found" });
      }

      // Check if file has expired
      if (sharedFile.expiresAt && new Date() > sharedFile.expiresAt) {
        return res.status(410).json({ error: "File has expired" });
      }

      // Check download limit
      if (sharedFile.maxDownloads && (sharedFile.downloadCount || 0) >= sharedFile.maxDownloads) {
        return res.status(403).json({ error: "Download limit reached" });
      }

      res.json(sharedFile);
    } catch (error) {
      console.error("Get file error:", error);
      res.status(500).json({ error: "Failed to get file" });
    }
  });

  app.get("/api/files/:id/download", async (req, res) => {
    try {
      const { id } = req.params;
      const sharedFile = await storage.getSharedFile(id);
      
      if (!sharedFile) {
        return res.status(404).json({ error: "File not found" });
      }

      // Check if file has expired
      if (sharedFile.expiresAt && new Date() > sharedFile.expiresAt) {
        return res.status(410).json({ error: "File has expired" });
      }

      // Check download limit
      if (sharedFile.maxDownloads && (sharedFile.downloadCount || 0) >= sharedFile.maxDownloads) {
        return res.status(403).json({ error: "Download limit reached" });
      }

      const fs = await import('fs');
      const path = await import('path');
      
      const filePath = path.join('shared_uploads', sharedFile.filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found on disk" });
      }

      // Increment download count
      await storage.incrementDownloadCount(id);

      res.setHeader('Content-Type', sharedFile.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${sharedFile.originalName}"`);
      res.sendFile(path.resolve(filePath));
      
    } catch (error) {
      console.error("File download error:", error);
      res.status(500).json({ error: "Failed to download file" });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const sharedFile = await storage.getSharedFile(id);
      
      if (!sharedFile) {
        return res.status(404).json({ error: "File not found" });
      }

      const fs = await import('fs');
      const path = await import('path');
      
      const filePath = path.join('shared_uploads', sharedFile.filename);
      
      // Delete file from disk
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete from storage
      await storage.deleteSharedFile(id);

      res.json({ success: true });
    } catch (error) {
      console.error("File delete error:", error);
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  // Get all tools endpoint
  app.get("/api/tools", async (req, res) => {
    try {
      // Return tools list (in a real app, this would come from database)
      const tools = [
        { id: 'image-resizer', name: 'Image Resizer', category: 'media' },
        { id: 'pdf-merger', name: 'PDF Merger', category: 'media' },
        { id: 'json-formatter', name: 'JSON Formatter', category: 'developer' },
        { id: 'password-generator', name: 'Password Generator', category: 'security' },
        // Add more tools as needed
      ];
      res.json(tools);
    } catch (error) {
      console.error("Tools list error:", error);
      res.status(500).json({ error: "Failed to get tools list" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
