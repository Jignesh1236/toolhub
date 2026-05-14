import { 
  users, tools, toolUsage, bookmarks, sharedFiles, sharedTexts,
  type User, type InsertUser, type Tool, type InsertTool, 
  type ToolUsage, type InsertToolUsage, type Bookmark, type InsertBookmark, 
  type SharedFile, type InsertSharedFile, type SharedText, type InsertSharedText 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, lte, sql } from "drizzle-orm";

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

  // Sharing methods
  createSharedFile(file: InsertSharedFile): Promise<SharedFile>;
  getSharedFile(id: string): Promise<SharedFile | undefined>;
  createSharedText(text: InsertSharedText): Promise<SharedText>;
  getSharedText(id: string): Promise<SharedText | undefined>;
  getAllSharedFiles(): Promise<SharedFile[]>;
  cleanupExpiredContent(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async recordToolUsage(insertUsage: InsertToolUsage): Promise<ToolUsage> {
    const [usage] = await db.insert(toolUsage).values({
      toolId: insertUsage.toolId,
      userId: insertUsage.userId,
      metadata: insertUsage.metadata
    }).returning();
    return usage;
  }

  async addBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const [existing] = await db.select().from(bookmarks).where(
      and(
        eq(bookmarks.toolId, insertBookmark.toolId || ""),
        eq(bookmarks.userId, insertBookmark.userId || "")
      )
    );
    if (existing) return existing;

    const [bookmark] = await db.insert(bookmarks).values(insertBookmark).returning();
    return bookmark;
  }

  async removeBookmark(toolId: string, userId: string): Promise<void> {
    await db.delete(bookmarks).where(
      and(
        eq(bookmarks.toolId, toolId),
        eq(bookmarks.userId, userId)
      )
    );
  }

  async getUserBookmarks(userId: string): Promise<Bookmark[]> {
    return await db.select().from(bookmarks).where(eq(bookmarks.userId, userId));
  }

  async getToolStats(userId: string): Promise<{
    totalTools: number;
    usedToday: number;
    bookmarked: number;
    timeSaved: string;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usage = await db.select().from(toolUsage).where(
      and(
        eq(toolUsage.userId, userId),
        lte(sql`${toolUsage.usedAt}`, today)
      )
    );

    const userBookmarks = await this.getUserBookmarks(userId);

    return {
      totalTools: 75,
      usedToday: usage.length,
      bookmarked: userBookmarks.length,
      timeSaved: `${Math.floor(usage.length * 0.5)}h`
    };
  }

  async createSharedFile(file: InsertSharedFile): Promise<SharedFile> {
    const [sharedFile] = await db.insert(sharedFiles).values(file).returning();
    return sharedFile;
  }

  async getSharedFile(id: string): Promise<SharedFile | undefined> {
    const [file] = await db.select().from(sharedFiles).where(eq(sharedFiles.id, id));
    return file;
  }

  async createSharedText(text: InsertSharedText): Promise<SharedText> {
    const [sharedText] = await db.insert(sharedTexts).values(text).returning();
    return sharedText;
  }

  async getSharedText(id: string): Promise<SharedText | undefined> {
    const [text] = await db.select().from(sharedTexts).where(eq(sharedTexts.id, id));
    return text;
  }

  async getAllSharedFiles(): Promise<SharedFile[]> {
    return await db.select().from(sharedFiles).orderBy(sql`${sharedFiles.uploadedAt} DESC`);
  }

  async cleanupExpiredContent(): Promise<void> {
    const now = new Date();
    await db.delete(sharedFiles).where(lte(sharedFiles.expiresAt, now));
    await db.delete(sharedTexts).where(lte(sharedTexts.expiresAt, now));
    
    // Also clear everything older than 24h as requested
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await db.delete(sharedFiles).where(lte(sharedFiles.uploadedAt, twentyFourHoursAgo));
    await db.delete(sharedTexts).where(lte(sharedTexts.uploadedAt, twentyFourHoursAgo));
  }
}

export const storage = new DatabaseStorage();
