import { 
  User, InsertUser, 
  Disaster, InsertDisaster, 
  Prediction, InsertPrediction, 
  Report, InsertReport, 
  Alert, InsertAlert, 
  EvacuationZone, InsertEvacuationZone, 
  Resource, InsertResource 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Disaster operations
  getAllDisasters(): Promise<Disaster[]>;
  getActiveDisasters(): Promise<Disaster[]>;
  getDisasterById(id: number): Promise<Disaster | undefined>;
  createDisaster(disaster: InsertDisaster): Promise<Disaster>;
  updateDisaster(id: number, disaster: Partial<Disaster>): Promise<Disaster | undefined>;
  
  // Prediction operations
  getAllPredictions(): Promise<Prediction[]>;
  getPredictionById(id: number): Promise<Prediction | undefined>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  
  // Report operations
  getAllReports(): Promise<Report[]>;
  getReportsByDisasterId(disasterId: number): Promise<Report[]>;
  getVerifiedReports(): Promise<Report[]>;
  getRecentReports(limit: number): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReportStatus(id: number, status: string): Promise<Report | undefined>;
  
  // Alert operations
  getAllAlerts(): Promise<Alert[]>;
  getActiveAlerts(): Promise<Alert[]>;
  getAlertById(id: number): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlertStatus(id: number, active: boolean): Promise<Alert | undefined>;
  
  // Evacuation Zone operations
  getEvacuationZones(): Promise<EvacuationZone[]>;
  getActiveEvacuationZones(): Promise<EvacuationZone[]>;
  getEvacuationZoneById(id: number): Promise<EvacuationZone | undefined>;
  getEvacuationZonesByDisasterId(disasterId: number): Promise<EvacuationZone[]>;
  createEvacuationZone(zone: InsertEvacuationZone): Promise<EvacuationZone>;
  updateEvacuationZone(id: number, zone: Partial<EvacuationZone>): Promise<EvacuationZone | undefined>;
  
  // Resource operations
  getAllResources(): Promise<Resource[]>;
  getResourcesByDisasterId(disasterId: number): Promise<Resource[]>;
  getResourceById(id: number): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resource: Partial<Resource>): Promise<Resource | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private disasters: Map<number, Disaster>;
  private predictions: Map<number, Prediction>;
  private reports: Map<number, Report>;
  private alerts: Map<number, Alert>;
  private evacuationZones: Map<number, EvacuationZone>;
  private resources: Map<number, Resource>;
  
  private userIdCounter: number;
  private disasterIdCounter: number;
  private predictionIdCounter: number;
  private reportIdCounter: number;
  private alertIdCounter: number;
  private evacuationZoneIdCounter: number;
  private resourceIdCounter: number;

  constructor() {
    this.users = new Map();
    this.disasters = new Map();
    this.predictions = new Map();
    this.reports = new Map();
    this.alerts = new Map();
    this.evacuationZones = new Map();
    this.resources = new Map();
    
    this.userIdCounter = 1;
    this.disasterIdCounter = 1;
    this.predictionIdCounter = 1;
    this.reportIdCounter = 1;
    this.alertIdCounter = 1;
    this.evacuationZoneIdCounter = 1;
    this.resourceIdCounter = 1;
    
    // Initial seed data
    this.seedData();
  }

  private seedData() {
    // Seed some initial disasters
    const wildfire: InsertDisaster = {
      name: "Wildfire",
      type: "fire",
      location: "San Bernardino County, CA",
      latitude: 34.1083,
      longitude: -117.2898,
      severity: "critical",
      status: "active",
      description: "Rapidly spreading wildfire affecting northwestern areas. 15,000+ residents in danger zone.",
      startedAt: new Date(),
      affectedArea: 78,
      detectionSource: "Satellite + Reports"
    };
    this.createDisaster(wildfire);
    
    const flooding: InsertDisaster = {
      name: "Flooding",
      type: "flood",
      location: "Miami-Dade County, FL",
      latitude: 25.7617,
      longitude: -80.1918,
      severity: "moderate",
      status: "active",
      description: "Coastal flooding affecting low-lying areas.",
      startedAt: new Date(),
      affectedArea: 45,
      detectionSource: "Weather reports"
    };
    this.createDisaster(flooding);
    
    const storm: InsertDisaster = {
      name: "Severe Storm",
      type: "storm",
      location: "Harris County, TX",
      latitude: 29.7604,
      longitude: -95.3698,
      severity: "monitoring",
      status: "active",
      description: "Severe thunderstorm with potential for flash flooding.",
      startedAt: new Date(),
      affectedArea: 120,
      detectionSource: "Weather radar"
    };
    this.createDisaster(storm);
    
    // Seed predictions
    const wildfirePrediction: InsertPrediction = {
      disasterType: "fire",
      location: "Northern California",
      latitude: 39.8283,
      longitude: -121.4221,
      probability: 0.78,
      timeFrame: "72 hours",
      source: "satellite imagery + weather conditions",
      description: "High risk of wildfire due to dry conditions and high winds."
    };
    this.createPrediction(wildfirePrediction);
    
    const floodingPrediction: InsertPrediction = {
      disasterType: "flood",
      location: "Gulf Coast region",
      latitude: 29.7604,
      longitude: -95.3698,
      probability: 0.63,
      timeFrame: "5-7 days",
      source: "precipitation models + terrain analysis",
      description: "Potential flooding due to heavy rainfall forecast."
    };
    this.createPrediction(floodingPrediction);
    
    // Seed evacuation zones
    const zoneA: InsertEvacuationZone = {
      name: "Zone A",
      status: "active",
      priority: "critical",
      disasterId: 1,
      location: "North San Bernardino",
      description: "Northern areas closest to fire front",
      instructions: "Evacuate immediately to Central High School",
      completionPercentage: 89
    };
    this.createEvacuationZone(zoneA);
    
    const zoneB: InsertEvacuationZone = {
      name: "Zone B",
      status: "active",
      priority: "critical",
      disasterId: 1,
      location: "Northwest San Bernardino",
      description: "Northwest areas in fire path",
      instructions: "Evacuate immediately to Westridge Community Center",
      completionPercentage: 65
    };
    this.createEvacuationZone(zoneB);
    
    const zoneC: InsertEvacuationZone = {
      name: "Zone C",
      status: "active",
      priority: "warning",
      disasterId: 1,
      location: "West San Bernardino",
      description: "Areas potentially at risk",
      instructions: "Be prepared to evacuate on short notice",
      completionPercentage: 42
    };
    this.createEvacuationZone(zoneC);
    
    // Seed resources
    const medicalTeams: InsertResource = {
      name: "Medical Teams",
      type: "medical",
      location: "San Bernardino County",
      latitude: 34.1083,
      longitude: -117.3,
      status: "deployed",
      quantity: 8,
      disasterId: 1
    };
    this.createResource(medicalTeams);
    
    const fireResponse: InsertResource = {
      name: "Fire Response",
      type: "fire",
      location: "San Bernardino County",
      latitude: 34.11,
      longitude: -117.28,
      status: "deployed",
      quantity: 12,
      disasterId: 1
    };
    this.createResource(fireResponse);
    
    const evacuationTransport: InsertResource = {
      name: "Evacuation Transport",
      type: "evacuation",
      location: "San Bernardino County",
      latitude: 34.09,
      longitude: -117.29,
      status: "deployed",
      quantity: 6,
      disasterId: 1
    };
    this.createResource(evacuationTransport);
    
    // Seed reports
    const roadBlockage: InsertReport = {
      title: "Road Blockage",
      description: "Fallen tree blocking Highway 18 near mile marker 42. No vehicles can pass.",
      location: "Highway 18, San Bernardino",
      latitude: 34.15,
      longitude: -117.25,
      reportType: "road blockage",
      imageUrl: "https://images.unsplash.com/photo-1552793084-49132af00ff1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      userId: 1,
      disasterId: 1,
      distance: 2.3
    };
    const report1 = this.createReport(roadBlockage);
    this.updateReportStatus(report1.id, "verified");
    
    const evacuationAssistance: InsertReport = {
      title: "Evacuation Assistance",
      description: "Elderly couple needs evacuation assistance at 742 Oakwood Dr. Unable to drive.",
      location: "742 Oakwood Dr, San Bernardino",
      latitude: 34.12,
      longitude: -117.28,
      reportType: "assistance",
      imageUrl: "https://images.unsplash.com/photo-1567935850824-e819562b1a6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      userId: 2,
      disasterId: 1,
      distance: 0.5
    };
    const report2 = this.createReport(evacuationAssistance);
    this.updateReportStatus(report2.id, "verified");
    
    const fireSpotted: InsertReport = {
      title: "Fire Spotted",
      description: "New fire spotted at western ridge. Rapidly spreading toward residential area.",
      location: "Western Ridge, San Bernardino",
      latitude: 34.11,
      longitude: -117.32,
      reportType: "fire",
      imageUrl: "https://images.unsplash.com/photo-1507529175354-e2da376eca4c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      userId: 3,
      disasterId: 1,
      distance: 1.2
    };
    const report3 = this.createReport(fireSpotted);
    this.updateReportStatus(report3.id, "verified");
    
    // Seed active alert
    const evacuationAlert: InsertAlert = {
      title: "Mandatory Evacuation Order",
      description: "Due to rapidly spreading wildfire, authorities have issued a MANDATORY EVACUATION for all residents in Zones A, B, and C. The fire is expected to reach populated areas within 2-3 hours.",
      alertType: "evacuation",
      severity: "critical",
      location: "San Bernardino County, Zones A, B & C",
      latitude: 34.1083,
      longitude: -117.2898,
      disasterId: 1,
      instructions: {
        items: [
          "Gather essential items only (medicines, documents, pets)",
          "Follow evacuation routes shown on map (avoid Highway 15)",
          "Evacuation centers: Central High School, Westridge Community Center",
          "For evacuation assistance call: (555) 123-4567"
        ]
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      active: true
    };
    this.createAlert(evacuationAlert);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Disaster methods
  async getAllDisasters(): Promise<Disaster[]> {
    return Array.from(this.disasters.values());
  }

  async getActiveDisasters(): Promise<Disaster[]> {
    return Array.from(this.disasters.values()).filter(
      (disaster) => disaster.status === "active"
    );
  }

  async getDisasterById(id: number): Promise<Disaster | undefined> {
    return this.disasters.get(id);
  }

  async createDisaster(insertDisaster: InsertDisaster): Promise<Disaster> {
    const id = this.disasterIdCounter++;
    const disaster: Disaster = { 
      ...insertDisaster, 
      id, 
      updatedAt: new Date() 
    };
    this.disasters.set(id, disaster);
    return disaster;
  }

  async updateDisaster(id: number, disasterUpdate: Partial<Disaster>): Promise<Disaster | undefined> {
    const disaster = this.disasters.get(id);
    if (!disaster) return undefined;
    
    const updatedDisaster = { 
      ...disaster, 
      ...disasterUpdate, 
      updatedAt: new Date() 
    };
    this.disasters.set(id, updatedDisaster);
    return updatedDisaster;
  }

  // Prediction methods
  async getAllPredictions(): Promise<Prediction[]> {
    return Array.from(this.predictions.values());
  }

  async getPredictionById(id: number): Promise<Prediction | undefined> {
    return this.predictions.get(id);
  }

  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const id = this.predictionIdCounter++;
    const prediction: Prediction = { 
      ...insertPrediction, 
      id, 
      createdAt: new Date() 
    };
    this.predictions.set(id, prediction);
    return prediction;
  }

  // Report methods
  async getAllReports(): Promise<Report[]> {
    return Array.from(this.reports.values());
  }

  async getReportsByDisasterId(disasterId: number): Promise<Report[]> {
    return Array.from(this.reports.values()).filter(
      (report) => report.disasterId === disasterId
    );
  }

  async getVerifiedReports(): Promise<Report[]> {
    return Array.from(this.reports.values()).filter(
      (report) => report.status === "verified"
    );
  }

  async getRecentReports(limit: number): Promise<Report[]> {
    return Array.from(this.reports.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = this.reportIdCounter++;
    const report: Report = { 
      ...insertReport, 
      id, 
      status: "pending", 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.reports.set(id, report);
    return report;
  }

  async updateReportStatus(id: number, status: string): Promise<Report | undefined> {
    const report = this.reports.get(id);
    if (!report) return undefined;
    
    const updatedReport = { 
      ...report, 
      status, 
      updatedAt: new Date() 
    };
    this.reports.set(id, updatedReport);
    return updatedReport;
  }

  // Alert methods
  async getAllAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values());
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(
      (alert) => alert.active
    );
  }

  async getAlertById(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.alertIdCounter++;
    const alert: Alert = { 
      ...insertAlert, 
      id, 
      createdAt: new Date() 
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async updateAlertStatus(id: number, active: boolean): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert = { 
      ...alert, 
      active 
    };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  // Evacuation Zone methods
  async getEvacuationZones(): Promise<EvacuationZone[]> {
    return Array.from(this.evacuationZones.values());
  }

  async getActiveEvacuationZones(): Promise<EvacuationZone[]> {
    return Array.from(this.evacuationZones.values()).filter(
      (zone) => zone.status === "active"
    );
  }

  async getEvacuationZoneById(id: number): Promise<EvacuationZone | undefined> {
    return this.evacuationZones.get(id);
  }

  async getEvacuationZonesByDisasterId(disasterId: number): Promise<EvacuationZone[]> {
    return Array.from(this.evacuationZones.values()).filter(
      (zone) => zone.disasterId === disasterId
    );
  }

  async createEvacuationZone(insertZone: InsertEvacuationZone): Promise<EvacuationZone> {
    const id = this.evacuationZoneIdCounter++;
    const zone: EvacuationZone = { 
      ...insertZone, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.evacuationZones.set(id, zone);
    return zone;
  }

  async updateEvacuationZone(id: number, zoneUpdate: Partial<EvacuationZone>): Promise<EvacuationZone | undefined> {
    const zone = this.evacuationZones.get(id);
    if (!zone) return undefined;
    
    const updatedZone = { 
      ...zone, 
      ...zoneUpdate, 
      updatedAt: new Date() 
    };
    this.evacuationZones.set(id, updatedZone);
    return updatedZone;
  }

  // Resource methods
  async getAllResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }

  async getResourcesByDisasterId(disasterId: number): Promise<Resource[]> {
    return Array.from(this.resources.values()).filter(
      (resource) => resource.disasterId === disasterId
    );
  }

  async getResourceById(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const id = this.resourceIdCounter++;
    const resource: Resource = { 
      ...insertResource, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.resources.set(id, resource);
    return resource;
  }

  async updateResource(id: number, resourceUpdate: Partial<Resource>): Promise<Resource | undefined> {
    const resource = this.resources.get(id);
    if (!resource) return undefined;
    
    const updatedResource = { 
      ...resource, 
      ...resourceUpdate, 
      updatedAt: new Date() 
    };
    this.resources.set(id, updatedResource);
    return updatedResource;
  }
}

// Import DB storage if available
import { DBStorage } from './dbStorage';

// Use database storage if DATABASE_URL is provided, otherwise use memory storage
export const storage: IStorage = process.env.DATABASE_URL 
  ? new DBStorage() 
  : new MemStorage();
