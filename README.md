# 🍯 Honey Chain

### Blockchain-Powered Honey Traceability & Smart Beekeeping Platform

<p align="center">
  <strong>From Hive → Harvest → Quality → Blockchain → QR → Consumer</strong>
</p>

<p align="center">
  <a href="https://github.com/rizwtarique/sih-winners-2026">
    <img src="https://img.shields.io/badge/GitHub-Honey%20Chain-black?style=for-the-badge&logo=github" />
  </a>
  <img src="https://img.shields.io/badge/SIH%202026-PS%2026021-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/React-TypeScript-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Vite-Frontend-purple?style=for-the-badge&logo=vite" />
  <img src="https://img.shields.io/badge/IoT-Smart%20Hive-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Blockchain-Provenance-yellow?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI%2FML-Analytics-red?style=for-the-badge" />
</p>

---

## 🌐 Live Demo

**Live Prototype:**  
https://sih-winners-2026-chi.vercel.app/

**GitHub:**  
https://github.com/rizwtarique/sih-winners-2026

---

## 🐝 About Honey Chain

**Honey Chain** is a smart beekeeping and honey traceability platform designed to create a transparent digital connection between the **hive, beekeeper, harvest, honey batch, quality records, supply chain, and consumer**.

The platform brings together:

- 🐝 Smart hive monitoring
- 📡 IoT telemetry
- 🔗 Blockchain-backed provenance
- 📱 QR-based consumer verification
- 🧪 Laboratory quality records
- 🤖 AI/ML analytics
- 📊 Beekeeper dashboards
- 🏛️ Administrative dashboards
- 🛡️ Tamper detection

The core idea is simple:

> **Every honey batch should have a digital story that can be traced, verified, and understood.**

---

## 🎯 Smart India Hackathon 2026

**Problem Statement:** `SIH26021`

Honey Chain is being developed to address challenges around:

- Honey traceability
- Consumer trust
- Beekeeper digitization
- Hive monitoring
- Quality documentation
- Supply-chain transparency
- Data-driven beekeeping
- Product provenance

---

# 💡 The Vision

Honey Chain connects the complete lifecycle of honey with smart hive data.

```text
🐝 HIVE
   │
   ▼
🌿 APIARY
   │
   ▼
🧺 HARVEST
   │
   ▼
🍯 HONEY BATCH
   │
   ▼
🧪 QUALITY TEST
   │
   ▼
🔗 INTEGRITY RECORD
   │
   ▼
📱 QR CODE
   │
   ▼
👤 CONSUMER



At the same time:

Sensors
   ↓
ESP32
   ↓
IoT
   ↓
Backend
   ↓
Database
   ↓
AI / ML
   ↓
Hive Health
   ↓
Productivity Insights
✨ Features
🐝 Smart Beekeeper Dashboard

A centralized workspace for beekeepers to manage their operations.

Features include:

Apiary management
Hive management
Harvest records
Honey batches
Hive telemetry
Alerts
Traceability
QR verification
Analytics
AI insights
🍯 Honey Batch Traceability

Each honey batch receives a unique digital identity.

Example:

Batch ID       HC-2026-0101
Hive           HIVE-042
Apiary         North Valley Apiary
Honey Type     Wild Mustard
Harvest Date   22 September 2026
Quantity       22 kg

The batch can move through:

HARVESTED
    ↓
EXTRACTED
    ↓
PROCESSED
    ↓
TESTED
    ↓
PACKAGED
    ↓
VERIFIED
📱 QR Consumer Verification

Consumers can scan a QR code attached to a honey product and access its digital provenance.

🍯 Honey Jar
     ↓
📱 Scan QR
     ↓
🌐 Honey Chain
     ↓
🔍 Verify Batch
     ↓
📋 View Provenance

The consumer can potentially view:

Batch information
Beekeeper
Apiary
Hive
Harvest date
Processing history
Quality information
Verification status
Blockchain integrity information

The experience is designed so that the consumer does not need to understand blockchain technology.

🧪 Laboratory Quality Records

Honey Chain can associate laboratory information with individual honey batches.

Potential records include:

Laboratory
Analyst
Test date
Moisture
HMF
C4 sugar/adulteration indicator
Certificate ID
Supporting documents

The system separates scientific quality evidence from record integrity.

LABORATORY
     ↓
Scientific Quality Evidence


BLOCKCHAIN
     ↓
Integrity of Submitted Records

Blockchain does not prove honey purity.

Actual honey quality and purity require appropriate scientific testing.

🔗 Blockchain Provenance

Blockchain provides an integrity layer for important traceability records.

Potential blockchain information includes:

Batch identifier
Traceability event
Cryptographic commitment
Document hash
Timestamp
Transaction hash
Contract information

Large application data remains off-chain.

                 APPLICATION
                    DATA
                      │
                      ▼
                 PostgreSQL
                      │
                  Hash / Proof
                      │
                      ▼
                 BLOCKCHAIN
                      │
                      ▼
                 VERIFICATION

This approach keeps the system more practical and scalable.

🛡️ Tamper Detection

Honey Chain demonstrates how cryptographic hashes can be used to detect changes to committed records.

Original Data
     ↓
Generate Hash
     ↓
Create Commitment
     ↓
Store Record
     ↓
Data Modified
     ↓
Generate Hash Again
     ↓
Compare
     ↓
Mismatch
     ↓
⚠️ Potential Tampering

This provides a clear demonstration of how record integrity can be checked.

📡 Smart Hive Monitoring

Honey Chain is designed to support IoT-enabled hive monitoring.

Potential measurements include:

🌡️ Temperature
💧 Humidity
⚖️ Hive Weight
🔊 Acoustic Activity

Planned architecture:

Temperature Sensor
        │
Humidity Sensor
        │
Weight Sensor
        │
        ▼
      ESP32
        │
        ▼
   HTTP / MQTT
        │
        ▼
   IoT Backend
        │
        ▼
   PostgreSQL
        │
        ▼
 Beekeeper Dashboard
        │
        ▼
      AI / ML

The current prototype can use simulated telemetry so development is not dependent on physical hardware.

🤖 AI / Machine Learning

Future versions of Honey Chain will use hive and environmental data for decision-support analytics.

Colony Health

Potential inputs:

Temperature
Humidity
Hive Weight
Weight Trend
Acoustic Features
Historical Data
        ↓
     ML Model
        ↓
Health / Risk Score
Disease Risk

Potential output:

🟢 LOW
🟡 MEDIUM
🔴 HIGH
Productivity Prediction
Historical Harvest
        +
Hive Weight
        +
Environmental Data
        +
Seasonal Information
        ↓
      ML Model
        ↓
Expected Productivity

AI results should be treated as estimates or risk indicators unless validated using appropriate real-world datasets.

🏛️ Platform Roles

Honey Chain is designed around multiple roles.

🐝 Beekeeper
Dashboard
   ↓
Apiaries
   ↓
Hives
   ↓
Sensors
   ↓
Harvest
   ↓
Honey Batch
   ↓
QR
🧪 Laboratory
Honey Batch
     ↓
Testing
     ↓
Certificate
     ↓
Quality Record
     ↓
Traceability
🏛️ Administrator
Users
 ↓
Beekeepers
 ↓
Apiaries
 ↓
Hives
 ↓
Batches
 ↓
Quality Records
 ↓
Alerts
 ↓
Analytics
👤 Consumer
Scan QR
   ↓
Verify Batch
   ↓
View Journey
   ↓
View Quality Evidence
   ↓
Check Integrity
🏗️ System Architecture
                         USERS
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
      BEEKEEPER          ADMIN          CONSUMER
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                  ┌─────────────────┐
                  │  WEB APPLICATION│
                  │ React / Next.js │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │    BACKEND API  │
                  │     FastAPI     │
                  └───────┬─────────┘
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
        PostgreSQL      AI / ML    Blockchain
             │                         │
             │                         │
             └────────────┬────────────┘
                          │
                          ▼
                         QR
                          │
                          ▼
                      CONSUMER
🧩 Technology Stack
Current Prototype
Layer	Technology
Frontend	React
Language	TypeScript
Build Tool	Vite
Styling	Tailwind CSS
Icons	Lucide React
Animation	Motion
AI Integration	Google GenAI
Data	Prototype / In-memory
IoT	Simulated Telemetry
Blockchain	Prototype Provenance Layer
Planned Architecture
Layer	Technology
Frontend	Next.js + React + TypeScript
Backend	Python + FastAPI
Database	PostgreSQL
Blockchain	Solidity + EVM
Smart Contracts	Solidity
IoT Hardware	ESP32
Communication	HTTP / MQTT
AI/ML	Python
Containers	Docker
Version Control	Git + GitHub
📂 Project Structure

Current:

sih-winners-2026/
│
├── src/
│   ├── components/
│   ├── data/
│   ├── utils/
│   ├── types.ts
│   └── App.tsx
│
├── public/
│
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md

Planned:

honey-chain/
│
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── RULES.md
│   ├── PHASES.md
│   ├── DESIGN.md
│   ├── MEMORY.md
│   └── LEARNING.md
│
├── frontend/
├── backend/
│
├── blockchain/
│   ├── contracts/
│   ├── scripts/
│   └── tests/
│
├── ai/
│   ├── datasets/
│   ├── training/
│   ├── models/
│   └── inference/
│
├── iot/
│   ├── firmware/
│   └── simulator/
│
├── database/
│   └── migrations/
│
├── tests/
├── scripts/
├── README.md
└── .env.example
⚙️ Getting Started
Requirements

Install:

Node.js
npm
Git
Clone Repository
git clone https://github.com/rizwtarique/sih-winners-2026.git
cd sih-winners-2026
Install Dependencies
npm install
Start Development Server
npm run dev

Open:

http://localhost:3000
🧪 Available Commands
Development
npm run dev
Production Build
npm run build
Preview Production Build
npm run preview
Lint / Type Check
npm run lint
🗺️ Development Roadmap
Phase 01 — Foundation
Project architecture
Documentation
Development environment
Engineering rules
Phase 02 — Web MVP
Landing page
Authentication
Beekeeper dashboard
Consumer verification
Admin dashboard
Phase 03 — Database
PostgreSQL
Users
Roles
Apiaries
Hives
Harvests
Honey batches
Phase 04 — Traceability
Batch lifecycle
Processing events
Quality records
QR generation
Consumer verification
Phase 05 — Blockchain
Solidity smart contracts
Local blockchain
Contract testing
Backend integration
Transaction verification
Phase 06 — IoT
ESP32
Temperature sensor
Humidity sensor
Weight sensor
Telemetry ingestion
Hive dashboard
Phase 07 — AI / ML
Dataset pipeline
Feature engineering
Colony health
Disease-risk estimation
Productivity prediction
Phase 08 — Full Integration
IoT
 │
 ▼
Backend
 ├──────────► PostgreSQL
 │
 ├──────────► AI / ML
 │
 └──────────► Blockchain
                    │
                    ▼
                   QR
                    │
                    ▼
                Consumer
Phase 09 — SIH Demonstration

The final demonstration should tell one complete story:

Hive
 ↓
Sensor Data
 ↓
Harvest
 ↓
Honey Batch
 ↓
Quality Record
 ↓
Blockchain Integrity
 ↓
QR
 ↓
Consumer Verification
 ↓
AI Insight
🎬 Final Demo Flow

The ideal SIH demonstration revolves around one honey batch.

01 — Hive

Show the hive and current telemetry.

HIVE-042

Temperature: 31.2°C
Humidity: 64%
Weight: 42.8 kg
02 — Harvest

Record a harvest.

Harvest Quantity: 22 kg
03 — Honey Batch

Create:

HC-2026-0101
04 — Quality

Attach the laboratory quality record.

05 — Blockchain

Anchor the relevant integrity information.

06 — QR

Generate the batch QR.

07 — Consumer

Open the consumer verification page.

Origin
Beekeeper
Apiary
Hive
Harvest
Processing
Quality
Verification
08 — Tamper Detection

Modify a committed value.

Original Hash ≠ Current Hash

⚠️ RECORD INTEGRITY FAILURE
09 — Smart Beekeeping

Return to the hive dashboard.

Sensor Data
     ↓
Analytics
     ↓
AI Insight
     ↓
Health / Risk / Productivity
🔐 Security Principles

Honey Chain follows these principles:

Never commit secrets.
Never expose private blockchain keys.
Never hardcode API keys.
Never store passwords in plaintext.
Validate user input.
Authenticate protected operations.
Authorize actions by role.
Protect private beekeeper information.
Do not store sensitive personal information on-chain.
Do not store large sensor datasets on-chain.
Validate uploaded documents.
Maintain auditability for important actions.
Never expose internal errors to consumers.
⚠️ Prototype Status

Honey Chain is currently an evolving prototype.

Some components are intentionally simulated.

Current Prototype
React Frontend
      ↓
Mock / In-Memory Data
      ↓
Simulated IoT
      ↓
Prototype Blockchain Flow
Target System
React / Next.js
      ↓
FastAPI
      ↓
PostgreSQL
      ↓
Real Blockchain
      ↓
ESP32 + Sensors
      ↓
AI / ML
      ↓
Production Deployment

The project should never present simulated sensor data, blockchain values, or AI results as real-world scientific validation.

🧠 Design Principles
Trust

Provide meaningful provenance information.

Transparency

Make the honey journey easy to understand.

Integrity

Protect important records from silent modification.

Intelligence

Use data to support better beekeeping decisions.

Simplicity

Hide technical complexity from the consumer.

The consumer should not need to understand:

Blockchain
Hashes
APIs
Databases
Machine Learning

They should simply understand:

"I can verify where this honey came from."

📈 Expected Impact
🐝 Beekeepers
Digital record keeping
Hive monitoring
Harvest tracking
Traceability
Alerts
Data-driven insights
🧪 Laboratories
Digital quality records
Batch association
Certificate references
Improved record integrity
🏛️ Organizations
Better visibility
Traceability analytics
Beekeeper management
Cluster-level insights
👤 Consumers
QR verification
Product provenance
Better transparency
Greater confidence in product history
🚀 Future Scope

Potential future capabilities include:

Offline-first beekeeper workflows
Native Android application
Real-time IoT monitoring
Advanced acoustic analysis
Computer vision
Disease-risk models
Yield optimization
Multi-language support
Government integrations
Laboratory APIs
Supply-chain analytics
Batch recall management
Regional analytics
Cluster-level beekeeping intelligence
🌐 Why a Web Application?

Honey Chain is designed as a responsive web application first.

One platform can work across:

Desktop
   │
Laptop
   │
Tablet
   │
Mobile

This is especially useful for QR verification because consumers can scan a product and immediately open the verification page without installing an application.

A dedicated mobile application can be introduced later while continuing to use the same backend APIs.

🤝 Development Philosophy

Honey Chain is being developed incrementally.

The project prioritizes:

Simplicity
Explainability
Security
Modularity
Testability
Honest technical claims
Practical SIH demonstration value

The goal is not to use as many technologies as possible.

The goal is to make every technology serve a clear purpose.

🏆 The Big Picture

Honey Chain is not simply a honey website.

It is designed as an integrated digital ecosystem:

                         🍯 HONEY CHAIN
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
        🐝 IoT              🔗 Blockchain           🤖 AI
          │                     │                     │
          ▼                     ▼                     ▼
      Hive Data            Traceability           Analytics
          │                     │                     │
          └─────────────────────┼─────────────────────┘
                                │
                                ▼
                           🍯 HONEY BATCH
                                │
                                ▼
                              📱 QR
                                │
                                ▼
                           👤 CONSUMER
Trace the Honey.
Understand the Hive.
Build Trust.
📜 Disclaimer

Honey Chain is a student/hackathon prototype intended for educational, research, and demonstration purposes.

Blockchain records provide integrity/provenance for submitted information. They do not independently establish the purity, authenticity, safety, or scientific quality of honey.

AI/ML outputs are decision-support estimates unless validated against appropriate real-world datasets and domain expertise.

🔗 Links

GitHub Repository:
https://github.com/rizwtarique/sih-winners-2026

Live Prototype:
https://sih-winners-2026-chi.vercel.app/
