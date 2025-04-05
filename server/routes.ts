import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertDisasterSchema, 
  insertPredictionSchema, 
  insertReportSchema, 
  insertAlertSchema, 
  insertEvacuationZoneSchema, 
  insertResourceSchema,
  insertUserSchema
} from "@shared/schema";
import * as tf from "@tensorflow/tfjs-node";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Load TensorFlow model
  let disasterPredictionModel: tf.LayersModel | null = null;
  
  try {
    // In a real application, we would load a pre-trained model
    // This is a placeholder for demonstration
    disasterPredictionModel = await createDummyModel();
  } catch (error) {
    console.error("Error loading TensorFlow model:", error);
  }
  
  // API Routes - All prefixed with /api
  
  // User routes
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });
  
  // Disaster routes
  app.get("/api/disasters", async (_req: Request, res: Response) => {
    const disasters = await storage.getAllDisasters();
    res.json(disasters);
  });
  
  app.get("/api/disasters/active", async (_req: Request, res: Response) => {
    const activeDisasters = await storage.getActiveDisasters();
    res.json(activeDisasters);
  });
  
  app.get("/api/disasters/:id", async (req: Request, res: Response) => {
    const disaster = await storage.getDisasterById(Number(req.params.id));
    if (!disaster) {
      return res.status(404).json({ message: "Disaster not found" });
    }
    res.json(disaster);
  });
  
  app.post("/api/disasters", async (req: Request, res: Response) => {
    try {
      const validatedData = insertDisasterSchema.parse(req.body);
      const disaster = await storage.createDisaster(validatedData);
      res.status(201).json(disaster);
    } catch (error) {
      res.status(400).json({ message: "Invalid disaster data", error });
    }
  });
  
  app.patch("/api/disasters/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const updatedDisaster = await storage.updateDisaster(id, req.body);
      if (!updatedDisaster) {
        return res.status(404).json({ message: "Disaster not found" });
      }
      res.json(updatedDisaster);
    } catch (error) {
      res.status(400).json({ message: "Invalid disaster update data", error });
    }
  });
  
  // Prediction routes
  app.get("/api/predictions", async (_req: Request, res: Response) => {
    const predictions = await storage.getAllPredictions();
    res.json(predictions);
  });
  
  app.post("/api/predictions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPredictionSchema.parse(req.body);
      const prediction = await storage.createPrediction(validatedData);
      res.status(201).json(prediction);
    } catch (error) {
      res.status(400).json({ message: "Invalid prediction data", error });
    }
  });
  
  // AI prediction endpoint
  app.post("/api/ai/predict", async (req: Request, res: Response) => {
    try {
      const inputSchema = z.object({
        latitude: z.number(),
        longitude: z.number(),
        temperature: z.number(),
        humidity: z.number(),
        windSpeed: z.number(),
        precipitation: z.number(),
        disasterType: z.enum(["fire", "flood", "earthquake", "storm"])
      });
      
      const validatedInput = inputSchema.parse(req.body);
      
      if (!disasterPredictionModel) {
        return res.status(500).json({ message: "AI model not loaded" });
      }
      
      // Convert input to tensor
      const inputTensor = tf.tensor2d([
        [
          validatedInput.latitude,
          validatedInput.longitude,
          validatedInput.temperature,
          validatedInput.humidity,
          validatedInput.windSpeed,
          validatedInput.precipitation
        ]
      ]);
      
      // Make prediction
      const prediction = disasterPredictionModel.predict(inputTensor) as tf.Tensor;
      const predictionData = await prediction.data();
      
      // Clean up tensors
      inputTensor.dispose();
      prediction.dispose();
      
      // Return prediction (probability between 0-1)
      const probability = Array.from(predictionData)[0];
      
      res.json({
        disasterType: validatedInput.disasterType,
        probability,
        location: `${validatedInput.latitude}, ${validatedInput.longitude}`,
        timeFrame: probability > 0.7 ? "24-48 hours" : probability > 0.5 ? "48-72 hours" : "5-7 days"
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid prediction parameters", error });
    }
  });
  
  // Report routes
  app.get("/api/reports", async (_req: Request, res: Response) => {
    const reports = await storage.getAllReports();
    res.json(reports);
  });
  
  app.get("/api/reports/verified", async (_req: Request, res: Response) => {
    const verifiedReports = await storage.getVerifiedReports();
    res.json(verifiedReports);
  });
  
  app.get("/api/reports/recent", async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 3;
    const recentReports = await storage.getRecentReports(limit);
    res.json(recentReports);
  });
  
  app.get("/api/reports/disaster/:disasterId", async (req: Request, res: Response) => {
    const disasterId = Number(req.params.disasterId);
    const reports = await storage.getReportsByDisasterId(disasterId);
    res.json(reports);
  });
  
  app.post("/api/reports", async (req: Request, res: Response) => {
    try {
      const validatedData = insertReportSchema.parse(req.body);
      const report = await storage.createReport(validatedData);
      
      // In a real application, this would use ML to verify the report
      // Here we're just setting status based on simple criteria
      const randomVerificationDelay = Math.floor(Math.random() * 3000) + 1000;
      setTimeout(async () => {
        if (validatedData.reportType === "fire" || validatedData.reportType === "road blockage") {
          await storage.updateReportStatus(report.id, "verified");
        }
      }, randomVerificationDelay);
      
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ message: "Invalid report data", error });
    }
  });
  
  app.patch("/api/reports/:id/status", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const statusSchema = z.object({ status: z.enum(["pending", "verified", "rejected"]) });
      const { status } = statusSchema.parse(req.body);
      
      const updatedReport = await storage.updateReportStatus(id, status);
      if (!updatedReport) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      res.json(updatedReport);
    } catch (error) {
      res.status(400).json({ message: "Invalid status update", error });
    }
  });
  
  // Alert routes
  app.get("/api/alerts", async (_req: Request, res: Response) => {
    const alerts = await storage.getAllAlerts();
    res.json(alerts);
  });
  
  app.get("/api/alerts/active", async (_req: Request, res: Response) => {
    const activeAlerts = await storage.getActiveAlerts();
    res.json(activeAlerts);
  });
  
  app.post("/api/alerts", async (req: Request, res: Response) => {
    try {
      const validatedData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validatedData);
      res.status(201).json(alert);
    } catch (error) {
      res.status(400).json({ message: "Invalid alert data", error });
    }
  });
  
  app.patch("/api/alerts/:id/status", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const activeSchema = z.object({ active: z.boolean() });
      const { active } = activeSchema.parse(req.body);
      
      const updatedAlert = await storage.updateAlertStatus(id, active);
      if (!updatedAlert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      res.json(updatedAlert);
    } catch (error) {
      res.status(400).json({ message: "Invalid alert status update", error });
    }
  });
  
  // Evacuation Zone routes
  app.get("/api/evacuation-zones", async (_req: Request, res: Response) => {
    const zones = await storage.getEvacuationZones();
    res.json(zones);
  });
  
  app.get("/api/evacuation-zones/active", async (_req: Request, res: Response) => {
    const activeZones = await storage.getActiveEvacuationZones();
    res.json(activeZones);
  });
  
  app.get("/api/evacuation-zones/disaster/:disasterId", async (req: Request, res: Response) => {
    const disasterId = Number(req.params.disasterId);
    const zones = await storage.getEvacuationZonesByDisasterId(disasterId);
    res.json(zones);
  });
  
  app.post("/api/evacuation-zones", async (req: Request, res: Response) => {
    try {
      const validatedData = insertEvacuationZoneSchema.parse(req.body);
      const zone = await storage.createEvacuationZone(validatedData);
      res.status(201).json(zone);
    } catch (error) {
      res.status(400).json({ message: "Invalid evacuation zone data", error });
    }
  });
  
  app.patch("/api/evacuation-zones/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const updatedZone = await storage.updateEvacuationZone(id, req.body);
      if (!updatedZone) {
        return res.status(404).json({ message: "Evacuation zone not found" });
      }
      res.json(updatedZone);
    } catch (error) {
      res.status(400).json({ message: "Invalid evacuation zone update", error });
    }
  });
  
  // Resource routes
  app.get("/api/resources", async (_req: Request, res: Response) => {
    const resources = await storage.getAllResources();
    res.json(resources);
  });
  
  app.get("/api/resources/disaster/:disasterId", async (req: Request, res: Response) => {
    const disasterId = Number(req.params.disasterId);
    const resources = await storage.getResourcesByDisasterId(disasterId);
    res.json(resources);
  });
  
  app.post("/api/resources", async (req: Request, res: Response) => {
    try {
      const validatedData = insertResourceSchema.parse(req.body);
      const resource = await storage.createResource(validatedData);
      res.status(201).json(resource);
    } catch (error) {
      res.status(400).json({ message: "Invalid resource data", error });
    }
  });
  
  app.patch("/api/resources/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const updatedResource = await storage.updateResource(id, req.body);
      if (!updatedResource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      res.json(updatedResource);
    } catch (error) {
      res.status(400).json({ message: "Invalid resource update", error });
    }
  });
  
  // AI Resource Optimization endpoint
  app.post("/api/ai/optimize-resources", async (req: Request, res: Response) => {
    try {
      const inputSchema = z.object({
        disasterId: z.number(),
        resources: z.array(z.object({
          type: z.string(),
          available: z.number()
        })),
        severity: z.number().min(1).max(10),
        populationDensity: z.number().min(1).max(10),
        areaSize: z.number()
      });
      
      const validatedInput = inputSchema.parse(req.body);
      
      // Simple algorithm to optimize resource allocation based on disaster severity and population density
      const allocationFactor = (validatedInput.severity * validatedInput.populationDensity) / 10;
      
      const optimizedResources = validatedInput.resources.map(resource => {
        // Calculate optimal allocation based on resource type and disaster factors
        let allocationPercentage = 0;
        switch(resource.type) {
          case "medical":
            allocationPercentage = Math.min(100, allocationFactor * 10);
            break;
          case "fire":
            allocationPercentage = Math.min(100, allocationFactor * 15);
            break;
          case "evacuation":
            allocationPercentage = Math.min(100, allocationFactor * 8);
            break;
          default:
            allocationPercentage = Math.min(100, allocationFactor * 5);
        }
        
        const allocated = Math.floor((resource.available * allocationPercentage) / 100);
        
        return {
          type: resource.type,
          allocated,
          remaining: resource.available - allocated
        };
      });
      
      // Return optimized allocation
      res.json({
        disasterId: validatedInput.disasterId,
        optimizedResources,
        allocationScore: allocationFactor.toFixed(2)
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid optimization parameters", error });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}

// Helper function to create a dummy TensorFlow model for demonstration
async function createDummyModel(): Promise<tf.LayersModel> {
  // Create a simple model for demonstration purposes
  const model = tf.sequential();
  
  // Add layers
  model.add(tf.layers.dense({
    inputShape: [6], // lat, long, temp, humidity, wind, precipitation
    units: 12,
    activation: 'relu'
  }));
  
  model.add(tf.layers.dense({
    units: 8,
    activation: 'relu'
  }));
  
  model.add(tf.layers.dense({
    units: 1,
    activation: 'sigmoid' // Output probability
  }));
  
  // Compile the model
  model.compile({
    optimizer: 'adam',
    loss: 'binaryCrossentropy',
    metrics: ['accuracy']
  });
  
  return model;
}
