import { eq } from 'drizzle-orm';
import { db } from './db';
import {
  users, disasters, predictions, reports, alerts, evacuationZones, resources,
  User, InsertUser, Disaster, InsertDisaster, Prediction, InsertPrediction,
  Report, InsertReport, Alert, InsertAlert, EvacuationZone, InsertEvacuationZone,
  Resource, InsertResource
} from '../shared/schema';
import { IStorage } from './storage';

export class DBStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const insertedUsers = await db.insert(users).values(user).returning();
    return insertedUsers[0];
  }

  // Disaster operations
  async getAllDisasters(): Promise<Disaster[]> {
    return await db.select().from(disasters);
  }

  async getActiveDisasters(): Promise<Disaster[]> {
    return await db.select().from(disasters).where(eq(disasters.active, true));
  }

  async getDisasterById(id: number): Promise<Disaster | undefined> {
    const results = await db.select().from(disasters).where(eq(disasters.id, id));
    return results[0];
  }

  async createDisaster(disaster: InsertDisaster): Promise<Disaster> {
    const insertedDisasters = await db.insert(disasters).values(disaster).returning();
    return insertedDisasters[0];
  }

  async updateDisaster(id: number, disasterUpdate: Partial<Disaster>): Promise<Disaster | undefined> {
    const updated = await db.update(disasters)
      .set(disasterUpdate)
      .where(eq(disasters.id, id))
      .returning();
    return updated[0];
  }

  // Prediction operations
  async getAllPredictions(): Promise<Prediction[]> {
    return await db.select().from(predictions);
  }

  async getPredictionById(id: number): Promise<Prediction | undefined> {
    const results = await db.select().from(predictions).where(eq(predictions.id, id));
    return results[0];
  }

  async createPrediction(prediction: InsertPrediction): Promise<Prediction> {
    const insertedPredictions = await db.insert(predictions).values(prediction).returning();
    return insertedPredictions[0];
  }

  // Report operations
  async getAllReports(): Promise<Report[]> {
    return await db.select().from(reports);
  }

  async getReportsByDisasterId(disasterId: number): Promise<Report[]> {
    return await db.select().from(reports).where(eq(reports.disasterId, disasterId));
  }

  async getVerifiedReports(): Promise<Report[]> {
    return await db.select().from(reports).where(eq(reports.status, 'verified'));
  }

  async getRecentReports(limit: number): Promise<Report[]> {
    return await db.select()
      .from(reports)
      .where(eq(reports.status, 'verified'))
      .orderBy(reports.createdAt)
      .limit(limit);
  }

  async createReport(report: InsertReport): Promise<Report> {
    const insertedReports = await db.insert(reports).values(report).returning();
    return insertedReports[0];
  }

  async updateReportStatus(id: number, status: string): Promise<Report | undefined> {
    const updated = await db.update(reports)
      .set({ status })
      .where(eq(reports.id, id))
      .returning();
    return updated[0];
  }

  // Alert operations
  async getAllAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts);
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts).where(eq(alerts.active, true));
  }

  async getAlertById(id: number): Promise<Alert | undefined> {
    const results = await db.select().from(alerts).where(eq(alerts.id, id));
    return results[0];
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const insertedAlerts = await db.insert(alerts).values(alert).returning();
    return insertedAlerts[0];
  }

  async updateAlertStatus(id: number, active: boolean): Promise<Alert | undefined> {
    const updated = await db.update(alerts)
      .set({ active })
      .where(eq(alerts.id, id))
      .returning();
    return updated[0];
  }

  // Evacuation Zone operations
  async getEvacuationZones(): Promise<EvacuationZone[]> {
    return await db.select().from(evacuationZones);
  }

  async getActiveEvacuationZones(): Promise<EvacuationZone[]> {
    return await db.select().from(evacuationZones).where(eq(evacuationZones.active, true));
  }

  async getEvacuationZoneById(id: number): Promise<EvacuationZone | undefined> {
    const results = await db.select().from(evacuationZones).where(eq(evacuationZones.id, id));
    return results[0];
  }

  async getEvacuationZonesByDisasterId(disasterId: number): Promise<EvacuationZone[]> {
    return await db.select().from(evacuationZones).where(eq(evacuationZones.disasterId, disasterId));
  }

  async createEvacuationZone(zone: InsertEvacuationZone): Promise<EvacuationZone> {
    const insertedZones = await db.insert(evacuationZones).values(zone).returning();
    return insertedZones[0];
  }

  async updateEvacuationZone(id: number, zoneUpdate: Partial<EvacuationZone>): Promise<EvacuationZone | undefined> {
    const updated = await db.update(evacuationZones)
      .set(zoneUpdate)
      .where(eq(evacuationZones.id, id))
      .returning();
    return updated[0];
  }

  // Resource operations
  async getAllResources(): Promise<Resource[]> {
    return await db.select().from(resources);
  }

  async getResourcesByDisasterId(disasterId: number): Promise<Resource[]> {
    return await db.select().from(resources).where(eq(resources.disasterId, disasterId));
  }

  async getResourceById(id: number): Promise<Resource | undefined> {
    const results = await db.select().from(resources).where(eq(resources.id, id));
    return results[0];
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const insertedResources = await db.insert(resources).values(resource).returning();
    return insertedResources[0];
  }

  async updateResource(id: number, resourceUpdate: Partial<Resource>): Promise<Resource | undefined> {
    const updated = await db.update(resources)
      .set(resourceUpdate)
      .where(eq(resources.id, id))
      .returning();
    return updated[0];
  }
}