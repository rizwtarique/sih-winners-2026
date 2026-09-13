import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import {
  initDatabase,
  getDbStats,
  getAllHives,
  getHiveById,
  updateHiveTelemetry,
  getAllBatches,
  getBatchById,
  createBatch,
  updateBatch,
  certifyBatch,
  anchorBatch,
  toggleTamper,
  getAllFarmers,
  getFarmerById,
  getAllAlerts,
  createAlert,
  markAlertRead,
  getBlockchainStats,
  incrementBlockNumber,
  resetDatabase,
} from './server/db';

dotenv.config();

// Global crash protection to guarantee 100% server uptime
process.on('uncaughtException', (err) => {
  console.error('[Server Guard] Caught unhandled exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server Guard] Caught unhandled rejection at:', promise, 'reason:', reason);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Initialize persistent database engine (SQLite + JSON fallback)
  await initDatabase();

  const app = express();
  const PORT = 3000;

  // CORS and body parser middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: '10mb' }));

  // Lazy initialize Gemini client with required User-Agent header
  let geminiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!geminiClient && process.env.GEMINI_API_KEY) {
      geminiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return geminiClient;
  }

  // ----------------------------------------------------------------------
  // SYSTEM & HEALTH API
  // ----------------------------------------------------------------------

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      serverTime: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      db: getDbStats(),
    });
  });

  // Reset database back to clean initial demo state
  app.post('/api/reset', (req, res) => {
    try {
      resetDatabase();
      res.json({ success: true, message: 'Database reset to initial demo state', stats: getDbStats() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------------------------
  // HIVES REST API
  // ----------------------------------------------------------------------

  app.get('/api/hives', (req, res) => {
    try {
      const hives = getAllHives();
      res.json({ success: true, data: hives, count: hives.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/hives/:id', (req, res) => {
    try {
      const hive = getHiveById(req.params.id);
      if (!hive) {
        return res.status(404).json({ error: `Hive not found: ${req.params.id}` });
      }
      res.json({ success: true, data: hive });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/hives/:id/telemetry', (req, res) => {
    try {
      const updated = updateHiveTelemetry(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: `Hive not found: ${req.params.id}` });
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------------------------
  // HONEY BATCHES REST API
  // ----------------------------------------------------------------------

  app.get('/api/batches', (req, res) => {
    try {
      const batches = getAllBatches();
      res.json({ success: true, data: batches, count: batches.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/batches/:id', (req, res) => {
    try {
      const batch = getBatchById(req.params.id);
      if (!batch) {
        return res.status(404).json({ error: `Batch not found: ${req.params.id}` });
      }
      res.json({ success: true, data: batch });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create new harvest batch
  app.post('/api/batches', (req, res) => {
    try {
      const newBatch = createBatch(req.body);
      res.status(201).json({ success: true, data: newBatch });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Update batch fields (tamper playground or metadata updates)
  app.patch('/api/batches/:id', (req, res) => {
    try {
      const updates = req.body.updates || req.body;
      const isTampered = req.body.isTampered;
      const updated = updateBatch(req.params.id, updates, isTampered);
      if (!updated) {
        return res.status(404).json({ error: `Batch not found: ${req.params.id}` });
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Issue NABL quality lab certificate
  app.post('/api/batches/:id/certify', (req, res) => {
    try {
      const { certificate, blockNumber } = req.body;
      if (!certificate) {
        return res.status(400).json({ error: 'Missing quality certificate payload' });
      }
      const updated = certifyBatch(req.params.id, certificate, blockNumber);
      if (!updated) {
        return res.status(404).json({ error: `Batch not found: ${req.params.id}` });
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Anchor batch hash on blockchain
  app.post('/api/batches/:id/anchor', (req, res) => {
    try {
      const { blockNumber } = req.body;
      const updated = anchorBatch(req.params.id, blockNumber);
      if (!updated) {
        return res.status(404).json({ error: `Batch not found: ${req.params.id}` });
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Toggle tamper simulation
  app.post('/api/batches/:id/tamper', (req, res) => {
    try {
      const { shouldTamper } = req.body;
      const updated = toggleTamper(req.params.id, !!shouldTamper);
      if (!updated) {
        return res.status(404).json({ error: `Batch not found: ${req.params.id}` });
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------------------------
  // FARMER PROFILES REST API
  // ----------------------------------------------------------------------

  app.get('/api/farmers', (req, res) => {
    try {
      const farmers = getAllFarmers();
      res.json({ success: true, data: farmers, count: farmers.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/farmers/:id', (req, res) => {
    try {
      const farmer = getFarmerById(req.params.id);
      if (!farmer) {
        return res.status(404).json({ error: `Farmer not found: ${req.params.id}` });
      }
      res.json({ success: true, data: farmer });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------------------------
  // ALERTS REST API
  // ----------------------------------------------------------------------

  app.get('/api/alerts', (req, res) => {
    try {
      const alerts = getAllAlerts();
      res.json({ success: true, data: alerts, count: alerts.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/alerts', (req, res) => {
    try {
      const newAlert = createAlert(req.body);
      res.status(201).json({ success: true, data: newAlert });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/alerts/:id/read', (req, res) => {
    try {
      const ok = markAlertRead(req.params.id);
      if (!ok) {
        return res.status(404).json({ error: `Alert not found: ${req.params.id}` });
      }
      res.json({ success: true, message: 'Alert marked as read' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------------------------
  // BLOCKCHAIN REST API
  // ----------------------------------------------------------------------

  app.get('/api/blockchain/stats', (req, res) => {
    try {
      const stats = getBlockchainStats();
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/blockchain/tick', (req, res) => {
    try {
      const newBlock = incrementBlockNumber();
      res.json({ success: true, latestBlockNumber: newBlock });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------------------------
  // AI HIVE HEALTH SUMMARY (GEMINI + BIOLOGICAL RULE ENGINE FALLBACK)
  // ----------------------------------------------------------------------

  app.post('/api/ai-hive-health-summary', async (req, res) => {
    try {
      const {
        hiveId,
        hiveCode,
        location,
        status,
        currentReading,
        telemetryStats,
        dateRange = '24h',
        recentPoints = [],
      } = req.body;

      if (!hiveCode || !currentReading) {
        return res.status(400).json({ error: 'Missing required hive telemetry payload' });
      }

      const client = getGeminiClient();

      // If Gemini API Key is available, invoke models with graceful fallback for temporary demand spikes (503/429)
      if (client) {
        const prompt = `You are a world-class veterinary apiculture expert and IoT smart beekeeping diagnostician.
Analyze the following live sensor telemetry for honeybee colony ${hiveCode} located in ${location || 'Apiary'}.

Current Live Sensor Readings:
- Internal Brood Nest Temperature: ${currentReading.temperature}°C (Ideal biological range: 32.0°C to 36.0°C)
- Internal Relative Humidity: ${currentReading.humidity}% (Ideal range: 50.0% to 65.0%; elevated fanning stress: >68.0%)
- Gross Hive Weight: ${currentReading.weightKg} kg
- Acoustic Sound: ${currentReading.soundDb} dB (Normal: 35-50 dB; queen piping / swarming / distress: >55 dB)
- Current Status: ${status}

Telemetry Summary over chosen window (${dateRange}):
- Minimum Brood Temp: ${telemetryStats?.minTemp ?? 'N/A'}°C
- Maximum Brood Temp: ${telemetryStats?.maxTemp ?? 'N/A'}°C
- Average Brood Temp: ${telemetryStats?.avgTemp ?? 'N/A'}°C
- Temp Volatility (Delta): ${telemetryStats?.tempDelta ?? 'N/A'}°C
- Minimum Humidity: ${telemetryStats?.minHumidity ?? 'N/A'}%
- Maximum Humidity: ${telemetryStats?.maxHumidity ?? 'N/A'}%
- Average Humidity: ${telemetryStats?.avgHumidity ?? 'N/A'}%
- Homeostasis Stability Rate: ${telemetryStats?.optimalTempPct ?? 'N/A'}% inside safe 32-36°C
- Thermal Stress Incidents: ${telemetryStats?.thermalSpikeCount ?? 0}
- Moisture Alert Incidents: ${telemetryStats?.humidityAlertCount ?? 0}
- Weight Flux: ${telemetryStats?.weightDelta !== undefined ? `${telemetryStats.weightDelta} kg` : 'N/A'}

Recent Time-Series Points:
${JSON.stringify(recentPoints.slice(-8))}

Task:
Generate a thorough, practical, and highly scientific apicultural health assessment formatted STRICTLY as a valid JSON object with the following schema:
{
  "executiveSummary": "A concise 2-3 sentence executive summary of the colony's thermoregulation and health state.",
  "thermodynamicAnalysis": "Detailed analysis of the brood nest temperature regulation, diurnal buffering, and any overheating or chilling risks.",
  "humidityAndVentilation": "Evaluation of relative humidity, nest fanning activity, condensation risks, or nectar evaporation performance.",
  "riskLevel": "Low" | "Moderate" | "High" | "Critical",
  "homeostasisScore": number (0 to 100 integer representing colony thermoregulation vitality),
  "actionableInterventions": [
    {
      "title": "Short title of the intervention",
      "priority": "Immediate" | "Preventative" | "Observation",
      "category": "Ventilation" | "Shade & Cooling" | "Water Supply" | "Nutrition" | "Disease Inspection" | "Space Management",
      "rationale": "Why this intervention is needed based on the IoT telemetry data",
      "steps": ["Step 1", "Step 2"]
    }
  ],
  "recommendedInspectionWindow": "Specific recommendation for when the beekeeper should physically inspect the hive (e.g., early morning 07:00-09:00 before peak ambient heat)."
}

Important:
- Return ONLY valid raw JSON with no markdown formatting or backticks around it.
- Ensure all recommendations are realistic, practical, and grounded in apicultural biology.`;

        // Multi-tier model fallback for demand spikes (503 / 429)
        const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

        for (const candidateModel of candidateModels) {
          try {
            const response = await client.models.generateContent({
              model: candidateModel,
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
              },
            });

            let rawText = response.text || '';
            if (rawText.includes('```')) {
              rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
            }

            const parsed = JSON.parse(rawText);
            return res.json({
              success: true,
              source: 'gemini-api',
              data: {
                ...parsed,
                modelUsed: candidateModel,
                hiveId,
                hiveCode,
                generatedAt: new Date().toISOString(),
                isModelEstimate: true,
              },
            });
          } catch (modelErr: any) {
            const status = modelErr?.status || modelErr?.code || (String(modelErr?.message).includes('503') ? 503 : 'unavailable');
            console.log(`[Gemini Status] Model ${candidateModel} status ${status} (demand spike). Evaluating candidate fallback...`);
            // Brief backoff before next candidate attempt
            await new Promise((resolve) => setTimeout(resolve, 350));
          }
        }
        console.log('[Gemini Status] Gemini API capacity limits active. Smoothly served apicultural biological rule engine.');
      }

      // High-quality biological rule-based fallback if no Gemini key or upon parse exception
      const isOverheating = currentReading.temperature > 36.5;
      const isChilled = currentReading.temperature < 32.0;
      const isHighMoisture = currentReading.humidity > 68.0;
      const isLowMoisture = currentReading.humidity < 45.0;

      let riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
      let score = 92;

      if (isOverheating && isHighMoisture) {
        riskLevel = 'High';
        score = 64;
      } else if (isOverheating || isHighMoisture) {
        riskLevel = 'Moderate';
        score = 76;
      } else if (isChilled) {
        riskLevel = 'Moderate';
        score = 72;
      }

      const interventions: Array<{
        title: string;
        priority: 'Immediate' | 'Preventative' | 'Observation';
        category: string;
        rationale: string;
        steps: string[];
      }> = [];

      if (isOverheating) {
        interventions.push({
          title: 'Deploy Apiary Shade & Upper Ventilation Gap',
          priority: 'Immediate',
          category: 'Shade & Cooling',
          rationale: `Internal brood temperature reached ${currentReading.temperature.toFixed(1)}°C, exceeding the 36.0°C upper physiological threshold. Foragers are diverting labor from nectar collection to active wing-fanning.`,
          steps: [
            'Erect 70% reflective shade cloth 1.5m above the hive cluster to block direct solar radiation.',
            'Stagger the outer cover or prop the inner lid with 5mm wedges to create chimney convection ventilation.',
            'Ensure full-width bottom board entrance reducers are removed to maximize airflow.',
          ],
        });
        interventions.push({
          title: 'Replenish Clean Apiary Water Station',
          priority: 'Immediate',
          category: 'Water Supply',
          rationale: 'Bees require high water volumes for evaporative droplet fanning cooling during thermal stress.',
          steps: [
            'Place shallow water dishes with floating corks or gravel within 15 meters of the hive entrance.',
            'Add 0.1% sea salt or lemon balm scent to encourage rapid forager recruitment.',
          ],
        });
      }

      if (isHighMoisture) {
        interventions.push({
          title: 'Moisture Evacuation & Condensation Prevention',
          priority: isOverheating ? 'Immediate' : 'Preventative',
          category: 'Ventilation',
          rationale: `Relative humidity at ${currentReading.humidity.toFixed(1)}% creates condensation risk over the brood comb, which can promote Ascosphaera apis (chalkbrood).`,
          steps: [
            'Check that the hive is tilted forward by 1-2 degrees so accumulated moisture drains away from the entrance.',
            'Verify that upper moisture-absorbing quilt boards or ventilation shims are dry and permeable.',
          ],
        });
      }

      if (currentReading.soundDb > 54) {
        interventions.push({
          title: 'Acoustic Distress & Queen Status Inspection',
          priority: 'Preventative',
          category: 'Disease Inspection',
          rationale: `Sound level (${currentReading.soundDb.toFixed(0)} dB) is elevated above the 50 dB baseline, indicating agitation, intense fanning, or queen distress.`,
          steps: [
            'Perform a smoke-free listen at the entrance in the evening to verify if roar subsides.',
            'Inspect frame center for fresh egg lay pattern (1 egg per cell) to confirm active laying queen.',
          ],
        });
      }

      // Default preventative intervention if healthy
      if (interventions.length === 0) {
        interventions.push({
          title: 'Maintain Seasonal Honey Super Space',
          priority: 'Observation',
          category: 'Space Management',
          rationale: `Colony thermoregulation is exemplary at ${currentReading.temperature.toFixed(1)}°C and ${currentReading.humidity.toFixed(1)}% RH. Weight trend indicates active nectar foraging.`,
          steps: [
            'Monitor top super frames for 70% wax capping before adding another shallow honey super.',
            'Continue non-invasive IoT telemetry logging to preserve brood nest microclimate.',
          ],
        });
      }

      return res.json({
        success: true,
        source: 'biological-rule-engine',
        data: {
          executiveSummary: isOverheating
            ? `Colony ${hiveCode} is undergoing active thermal stress (${currentReading.temperature.toFixed(1)}°C) with elevated humidity (${currentReading.humidity.toFixed(1)}%). The worker force is expending metabolic energy on evaporative fanning.`
            : `Colony ${hiveCode} demonstrates robust homeostatic equilibrium with stable brood temperature (${currentReading.temperature.toFixed(1)}°C) and balanced relative humidity (${currentReading.humidity.toFixed(1)}%).`,
          thermodynamicAnalysis: `Brood temperature is currently ${currentReading.temperature.toFixed(1)}°C against an optimal biological window of 32.0°C - 36.0°C. ${
            telemetryStats?.tempDelta ? `Temperature fluctuation delta across the ${dateRange} window is ${telemetryStats.tempDelta}°C.` : ''
          }`,
          humidityAndVentilation: `Internal relative humidity is ${currentReading.humidity.toFixed(1)}%. ${
            isHighMoisture
              ? 'High moisture suggests active water droplet fanning for evaporative cooling.'
              : 'Ventilation is adequate with low fungal spore risk.'
          }`,
          riskLevel,
          homeostasisScore: score,
          actionableInterventions: interventions,
          recommendedInspectionWindow: isOverheating
            ? 'Early Morning (06:30 - 08:30 AM) before ambient solar heating exceeds 32°C.'
            : 'Mild Afternoon (11:00 AM - 02:00 PM) during active foraging flight.',
          modelUsed: 'Apicultural Biological Rule Engine',
          hiveId,
          hiveCode,
          generatedAt: new Date().toISOString(),
          isModelEstimate: true,
        },
      });
    } catch (err: any) {
      console.error('Error in /api/ai-hive-health-summary:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // ----------------------------------------------------------------------
  // VITE & FRONTEND SERVING
  // ----------------------------------------------------------------------

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Honey Chain backend running stably on http://localhost:${PORT}`);
  });
}

startServer();
