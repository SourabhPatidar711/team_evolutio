import { pgTable, text, serial, integer, boolean, timestamp, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").default("citizen"),
  phoneNumber: text("phone_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Disaster model
export const disasters = pgTable("disasters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // earthquake, flood, fire, etc.
  location: text("location").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  severity: text("severity").notNull(), // critical, moderate, monitoring
  status: text("status").notNull(), // active, resolved
  description: text("description"),
  startedAt: timestamp("started_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  affectedArea: real("affected_area"), // in square miles
  detectionSource: text("detection_source"), // satellite, social media, reports
  active: boolean("active").default(true), // used to filter active disasters
});

export const insertDisasterSchema = createInsertSchema(disasters).omit({
  id: true,
  updatedAt: true,
});

// Disaster Prediction model
export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  disasterType: text("disaster_type").notNull(),
  location: text("location").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  probability: real("probability").notNull(),
  timeFrame: text("time_frame").notNull(), // 48 hours, 5-7 days, etc.
  source: text("source").notNull(), // satellite, weather, social, etc.
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true,
});

// Citizen Report model
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  reportType: text("report_type").notNull(), // road blockage, fire, flood, etc.
  imageUrl: text("image_url"),
  status: text("status").default("pending"), // pending, verified, rejected
  userId: integer("user_id"),
  disasterId: integer("disaster_id"),
  distance: real("distance"), // distance from disaster zone in miles
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

// Alert model
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  alertType: text("alert_type").notNull(), // evacuation, warning, info
  severity: text("severity").notNull(), // critical, warning, info
  location: text("location").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  disasterId: integer("disaster_id"),
  instructions: json("instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  active: boolean("active").default(true),
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

// Evacuation Zone model
export const evacuationZones = pgTable("evacuation_zones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull(), // active, cleared
  priority: text("priority").notNull(), // critical, warning, info
  disasterId: integer("disaster_id").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  instructions: text("instructions"),
  completionPercentage: integer("completion_percentage").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  active: boolean("active").default(true), // used to filter active evacuation zones
});

export const insertEvacuationZoneSchema = createInsertSchema(evacuationZones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Resource model
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // medical, fire, evacuation, etc.
  location: text("location").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  status: text("status").notNull(), // deployed, available, en-route
  quantity: integer("quantity").default(1),
  disasterId: integer("disaster_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Disaster = typeof disasters.$inferSelect;
export type InsertDisaster = z.infer<typeof insertDisasterSchema>;

export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type EvacuationZone = typeof evacuationZones.$inferSelect;
export type InsertEvacuationZone = z.infer<typeof insertEvacuationZoneSchema>;

export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
