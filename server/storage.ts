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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private toolUsage: Map<string, ToolUsage>;
  private bookmarks: Map<string, Bookmark>;

  constructor() {
    this.users = new Map();
    this.toolUsage = new Map();
    this.bookmarks = new Map();
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
}

export const storage = new MemStorage();
