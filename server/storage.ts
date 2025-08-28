import { type User, type InsertUser, type Tool, type InsertTool, type ToolUsage, type InsertToolUsage, type Bookmark, type InsertBookmark, type SharedFile, type InsertSharedFile } from "@shared/schema";

interface SharedText {
  id: string;
  title: string;
  content: string;
  uploadedAt: Date;
  expiresAt?: Date | null;
  downloadCount: number;
  maxDownloads?: number | null;
  isPublic: boolean;
}

interface InsertSharedText {
  title: string;
  content: string;
  expiresAt?: Date | null;
  maxDownloads?: number | null;
  isPublic: boolean;
}
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  recordToolUsage(usage: InsertToolUsage): Promise<ToolUsage>;
  addBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  removeBookmark(toolId: string, userId: string): Promise<void>;
  getUserBookmarks(userId: string): Promise<Bookmark[]>;
  getToolStats(userId: string): Promise<{
    totalTools: number;
    usedToday: number;
    bookmarked: number;
    timeSaved: string;
  }>;
  // File sharing methods
  saveSharedFile(file: InsertSharedFile): Promise<SharedFile>;
  getSharedFile(id: string): Promise<SharedFile | undefined>;
  getAllSharedFiles(): Promise<SharedFile[]>;
  incrementDownloadCount(id: string): Promise<void>;
  deleteSharedFile(id: string): Promise<void>;
  // Text sharing methods
  saveSharedText(text: InsertSharedText): Promise<SharedText>;
  getSharedText(id: string): Promise<SharedText | undefined>;
  getAllSharedTexts(): Promise<SharedText[]>;
  incrementTextViewCount(id: string): Promise<void>;
  deleteSharedText(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private toolUsage: Map<string, ToolUsage>;
  private bookmarks: Map<string, Bookmark>;
  private sharedFiles: Map<string, SharedFile>;
  private sharedTexts: Map<string, SharedText>;

  constructor() {
    this.users = new Map();
    this.toolUsage = new Map();
    this.bookmarks = new Map();
    this.sharedFiles = new Map();
    this.sharedTexts = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async recordToolUsage(insertUsage: InsertToolUsage): Promise<ToolUsage> {
    const id = randomUUID();
    const usage: ToolUsage = {
      id,
      toolId: insertUsage.toolId || null,
      userId: insertUsage.userId || null,
      usedAt: new Date(),
      metadata: insertUsage.metadata || null
    };
    this.toolUsage.set(id, usage);
    return usage;
  }

  async addBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    // Check if bookmark already exists
    const existingBookmark = Array.from(this.bookmarks.values()).find(
      b => b.toolId === insertBookmark.toolId && b.userId === insertBookmark.userId
    );
    
    if (existingBookmark) {
      return existingBookmark;
    }

    const id = randomUUID();
    const bookmark: Bookmark = {
      id,
      toolId: insertBookmark.toolId || null,
      userId: insertBookmark.userId || null,
      createdAt: new Date()
    };
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }

  async removeBookmark(toolId: string, userId: string): Promise<void> {
    const bookmark = Array.from(this.bookmarks.values()).find(
      b => b.toolId === toolId && b.userId === userId
    );
    
    if (bookmark) {
      this.bookmarks.delete(bookmark.id);
    }
  }

  async getUserBookmarks(userId: string): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values()).filter(
      bookmark => bookmark.userId === userId
    );
  }

  async getToolStats(userId: string): Promise<{
    totalTools: number;
    usedToday: number;
    bookmarked: number;
    timeSaved: string;
  }> {
    const userUsage = Array.from(this.toolUsage.values()).filter(
      usage => usage.userId === userId
    );

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const usedToday = userUsage.filter(
      usage => usage.usedAt && new Date(usage.usedAt) >= todayStart
    ).length;

    const bookmarked = Array.from(this.bookmarks.values()).filter(
      bookmark => bookmark.userId === userId
    ).length;

    // Mock calculation for time saved (in practice, this would be based on actual tool usage metrics)
    const timeSaved = `${Math.floor(userUsage.length * 0.5)}h`;

    return {
      totalTools: 75, // Total available tools
      usedToday,
      bookmarked,
      timeSaved
    };
  }

  // File sharing implementation
  async saveSharedFile(insertFile: InsertSharedFile): Promise<SharedFile> {
    const id = randomUUID();
    const sharedFile: SharedFile = {
      id,
      filename: insertFile.filename,
      originalName: insertFile.originalName,
      mimeType: insertFile.mimeType,
      fileSize: insertFile.fileSize,
      uploadedAt: new Date(),
      expiresAt: insertFile.expiresAt || null,
      downloadCount: 0,
      maxDownloads: insertFile.maxDownloads || null,
      isPublic: insertFile.isPublic ?? true
    };
    this.sharedFiles.set(id, sharedFile);
    return sharedFile;
  }

  async getSharedFile(id: string): Promise<SharedFile | undefined> {
    return this.sharedFiles.get(id);
  }

  async getAllSharedFiles(): Promise<SharedFile[]> {
    return Array.from(this.sharedFiles.values());
  }

  async incrementDownloadCount(id: string): Promise<void> {
    const file = this.sharedFiles.get(id);
    if (file) {
      const updatedFile = { ...file, downloadCount: file.downloadCount + 1 };
      this.sharedFiles.set(id, updatedFile);
    }
  }

  async deleteSharedFile(id: string): Promise<void> {
    this.sharedFiles.delete(id);
  }

  // Text sharing implementation
  async saveSharedText(insertText: InsertSharedText): Promise<SharedText> {
    const id = randomUUID();
    const sharedText: SharedText = {
      id,
      title: insertText.title,
      content: insertText.content,
      uploadedAt: new Date(),
      expiresAt: insertText.expiresAt || null,
      downloadCount: 0,
      maxDownloads: insertText.maxDownloads || null,
      isPublic: insertText.isPublic ?? true
    };
    this.sharedTexts.set(id, sharedText);
    return sharedText;
  }

  async getSharedText(id: string): Promise<SharedText | undefined> {
    return this.sharedTexts.get(id);
  }

  async getAllSharedTexts(): Promise<SharedText[]> {
    return Array.from(this.sharedTexts.values());
  }

  async incrementTextViewCount(id: string): Promise<void> {
    const text = this.sharedTexts.get(id);
    if (text) {
      const updatedText = { ...text, downloadCount: text.downloadCount + 1 };
      this.sharedTexts.set(id, updatedText);
    }
  }

  async deleteSharedText(id: string): Promise<void> {
    this.sharedTexts.delete(id);
  }
}

export const storage = new MemStorage();
