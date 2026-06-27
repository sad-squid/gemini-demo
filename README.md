# 🗺️ Local Lens (EventLens AI) — Directory Map & Guide

Welcome to the **Local Lens** codebase! This repository is built for the **Gemini AI Tokyo Hackathon 2026**. Local Lens is a hyper-localized context builder that turns user-submitted photos (like flyers, concert posters, and menus) into beautifully structured, geolocated map entities using Google Cloud Storage, Gemini AI Multimodal Ingestion, and autonomous ADK Search Grounding agents.

## 🚀 Key Features & Capabilities

* **📸 Multimodal Mobile-First Ingestion**:
  * Desktop supports seamless drag-and-drop or file uploads.
  * Mobile features dedicated, intuitive **📸 Snap Photo** (direct-to-camera native capture using `capture="environment"`) and **🖼️ Photo Gallery** inputs to eliminate friction.
* **🗺️ Interactive Google Maps Dashboard**:
  * Displays dynamic styled markers categorized by type (event, restaurant, general spot).
  * Integrates a real-time **My Location** re-centering button with browser Geolocation APIs and a custom animated pulsing radar indicator.
* **🧠 Intelligent Gemini & ADK Ingest Engine**:
  * Leverages **Gemini 3.5 Flash** for multimodal visual layout parsing and metadata extraction.
  * Integrates with an **Active Search Grounding Agent** to automatically verify coordinates, resolve street addresses, and enrich social links.
* **📱 Premium Responsive Layout & Mobile Bottom Sheet**:
  * Bottom sheet collapses dynamically to a compact `60px` header or expands smoothly to `55vh` with fluid spring transitions.
  * Side panel and upload components use `flex-shrink: 0` to prevent vertical compression on smaller viewports.
  * Adaptive layout keeps floating buttons isolated (e.g., panel toggle sits on the bottom-left to prevent overlapping the bottom-right map controls).
* **📅 Accurate Active/Expired Status Engine**:
  * Employs standard ISO timestamp arrays for events to accurately track active vs. expired status.
  * Renders vibrant, visually stunning status badges on the UI.

This guide clarifies the project's layout, detailing what each directory and file does to help you navigate the system.

---

## 📂 Project Directory Structure

```
gemini-demo/
├── agents/                       # 🧠 Google ADK & LLM Agents
│   ├── ingestion_agent/          # Multimodal ingestion and schema parser (Gemini 3.5 Flash)
│   ├── enrichment_agent/         # Active Google Search Grounding & geolocation verification agent
│   ├── concierge_agent/          # (Future/Draft) Conversational assistant and itinerary builder
│   ├── client_deployment_agent/  # Automation script for frontend packaging and build injections
│   └── server_deployment_agent/  # Automation script for server deployment
│
├── backend/                      # ☁️ FastAPI (Python) Server on Cloud Run
│   ├── main.py                   # Server gateway exposing API routes (/api/ingest, /api/locations)
│   ├── data_store.json           # Local JSON fallback database
│   └── uploads/                  # Temporary cache for uploaded flyer images
│
├── frontend/                     # 📱 Vite + React (TypeScript) Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── MapDashboard.tsx  # Interactive Google Maps Platform view with custom styled Pin markers
│   │   │   ├── UploadZone.tsx    # Drag-and-drop ingestion with stage indicators and camera prompt
│   │   │   └── EntitySnackbar.tsx# Responsive bottom details panel with Lightbox & similarity carousel
│   │   └── App.tsx               # Main layout, state syncs, and mobile viewport stacking
│   └── index.css                 # Smooth animations, dark glassmorphic system styles, and media queries
│
├── docs/                         # 📄 Product Specifications, Schemas, & Presentations
│   ├── OVERVIEW.md               # Judging criteria, goals, and project requirements
│   ├── PRODUCT_PLAN.md           # Unified product plan, target flows, and UX specifications
│   ├── SCHEMAS.md                # JSON schemas for ExtractedEntity and Unified GeoEntity (suggested_emoji)
│   ├── DEPLOYMENT.md             # Instructions for deploying FastAPI + React directly to Cloud Run
│   ├── architecture.html         # Interactive top-down system architecture diagram (Mermaid)
│   │
│   ├── PITCH_DECK.md             # Pitch deck slides in Markdown format
│   ├── Local_Lens_Pitch_Deck.pptx# Microsoft PowerPoint presentation deck
│   └── fetch_slides.py           # Helper slide-generation and caching scripts (Google Slides API integration)
│
├── reports/                      # 📊 Hackathon Submission & Developer Portfolio
│   └── index.html                # Interactive submission portal / dashboard
│
├── tests/                        # 🧪 Unit & Integration Testing Suites
│   └── test_ingestion.py         # Mock tests for verifying GCS upload and multimodal ingestion
│
└── Dockerfile                    # Docker build configuration for unified Cloud Run deployments
```

---

## 📄 Documentation Guide (`docs/` & `reports/`)

To keep things neat, all project notes, technical specifications, slides, and diagrams are organized into dedicated files.

### 1. Product & Technical Specifications
*   [docs/OVERVIEW.md](file:///Users/c3d/git/gemini-hackathon/gemini-demo/docs/OVERVIEW.md) — The guiding star of our project. It details the Gemini Hackathon requirements, judging criteria, final submission checklists (video, slides, repository guidelines), and the initial objectives.
*   [docs/PRODUCT_PLAN.md](file:///Users/c3d/git/gemini-hackathon/gemini-demo/docs/PRODUCT_PLAN.md) — The comprehensive design blueprint. It specifies the target user journeys (Visual Ingestion "Snap & Build", Interactive Map Dashboard, and feed filtering) and system architecture.
*   [docs/SCHEMAS.md](file:///Users/c3d/git/gemini-hackathon/gemini-demo/docs/SCHEMAS.md) — The data contract. Defines the structured TypeScript interfaces for parsed objects, event lineups, restaurant menus, and the extraction system prompts that govern Gemini's JSON responses.

### 2. Architecture & Deployment
*   [docs/architecture.html](file:///Users/c3d/git/gemini-hackathon/gemini-demo/docs/architecture.html) — An interactive system architecture diagram built with Mermaid.js. It diagrams the top-down visual ingestion flow (from user image upload to GCS storage, Gemini 3.5 Flash parsing, ADK active Google Search grounding, and Firestore persistence) and Google Maps rendering.
*   [docs/DEPLOYMENT.md](file:///Users/c3d/git/gemini-hackathon/gemini-demo/docs/DEPLOYMENT.md) — Complete operations guide. Explains how to bundle the React frontend, package the application into a single Docker image, configure GCS uniform access, and deploy to Google Cloud Run.

### 3. Pitch & Presentations
*   [docs/PITCH_DECK.md](file:///Users/c3d/git/gemini-hackathon/gemini-demo/docs/PITCH_DECK.md) — Markdown-based slide structures, outlines, and theme styling.
*   [docs/Local_Lens_Pitch_Deck.pptx](file:///Users/c3d/git/gemini-hackathon/gemini-demo/docs/Local_Lens_Pitch_Deck.pptx) — Pre-compiled PowerPoint presentation matching the submission pitch.
*   [docs/generate_slides.py](file:///Users/c3d/git/gemini-hackathon/gemini-demo/docs/generate_slides.py), `docs/upload_to_slides.py`, `docs/fetch_slides.py` — Python utilities integrating with the Google Slides API to automatically compile, style, and upload our pitch slides directly to Google Drive.

### 4. Hackathon Submission Portal
*   [reports/index.html](file:///Users/c3d/git/gemini-hackathon/gemini-demo/reports/index.html) — A highly interactive, beautiful developer hub/submission portal styled with clean, googley branding, custom transitions, and tabbed slide/video preview panels. It links directly to our GitHub repository, live Cloud Run portal, and interactive architecture chart.
