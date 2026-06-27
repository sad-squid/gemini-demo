---
theme: default
class: text-center
style: |
  section {
    background-image: radial-gradient(circle at 10% 20%, rgba(66, 133, 244, 0.05) 0%, transparent 40%),
                      radial-gradient(circle at 90% 80%, rgba(234, 67, 53, 0.05) 0%, transparent 40%);
    font-family: 'Google Sans', 'Roboto', sans-serif;
  }
  h1 { color: #202124; }
  h2 { color: #4285F4; }
---

# SceneScout
**Hyperlocalized Context Builder from Everyday Photos**

Gemini AI Tokyo Hackathon 2026
Developer: Cuong Duong 
cuongduong.git@gmail.com

---

# 1. The Problem
**Physical Discoveries Fade Quickly**

- You walk down the street and see a flyer for an underground concert, a pop-up menu, or an event poster.
- You snap a picture, but it just sits in your camera roll.
- There is no instant, frictionless way to convert visual, real-world objects into mapped, actionable, and structured data.

---

# 2. The Solution: SceneScout
**From Raw Pixel to Enriched Intelligence**

SceneScout instantly bridges the physical world with a digital, interactive hyperlocal map.

By uploading a single photo, SceneScout uses **Multimodal Gemini AI** to generate a rich structured model of an event, venue, or restaurant. 
It doesn't stop there: our **Agentic Search** fetches the missing pieces—like exact coordinates, links, and real-time schedules—fully autonomously.

---

# 3. How It Works (The 3-Step Magic)

1. **Capture & Parse:** 
   User uploads a photo of a flyer. **Gemini Vision API** instantly extracts the unstructured text and maps it into a precise JSON schema (Event, Venue, etc.).
2. **Agentic Enrichment:** 
   An autonomous agent queries the web to find exact geo-coordinates, official ticketing links, and resolves ambiguous dates (e.g., "Next Friday" -> exact date).
3. **Interactive Map & Concierge:** 
   The data is dropped onto a shared, live map dashboard. Users can ask the **LocusGuide Chatbot** (powered by Gemini) for recommendations based purely on the uploaded data.

---

# 4. Architecture & Tech Stack
**Powered by Google Cloud**

*   **Frontend:** React/Next.js with an interactive Mapbox/Leaflet UI.
*   **Backend:** Node.js/Express API handling orchestration.
*   **AI & Agents:** 
    *   **Gemini Multimodal Vision API** (Ingestion)
    *   **Gemini Text API** (LocusGuide Chatbot & Autonomous Search Agent)
*   **Database:** Google Cloud Firestore (Storing venues, events, geo-indices).
*   **Infrastructure:** Deployed scalably on **Google Cloud Run**.

---

# 5. Innovation: Why SceneScout Stands Out
**Leveraging the Latest Gemini Capabilities**

- **Multimodal Generation:** We don't rely on users typing out event forms. The AI "sees" the flyer, understands the visual hierarchy, and extracts meaning automatically.
- **Managed Agent Workflows:** The app isn't just a static wrapper. It spins up backend agents that actively crawl the web to find the *missing context* the flyer didn't explicitly state.
- **Grounded Chat:** The LocusGuide concierge isn't hallucinating—it explicitly grounds its answers in the exact entities stored in our Firestore database.

---

# 6. Core Features at a Glance

*   **Snap & Build:** Frictionless visual ingestion of data.
*   **Pulse Feed & Vibe Filters:** Explore Tokyo events by vibe (e.g., *Cyberpunk*, *Cozy*, *Underground*).
*   **LocusGuide Concierge:** "What acoustic gigs are near Shibuya tonight?"
*   **Real-time Shared Map:** A collaborative map built entirely from user-submitted photography.

---

# 7. Demo Walkthrough
**What You'll See in the Video**

1. Uploading a raw, complex event flyer image.
2. The UI immediately displaying the successfully structured JSON extraction.
3. The background agent enriching the location into latitude/longitude coordinates.
4. The event dynamically popping up on our interactive map.
5. Asking the LocusGuide Chatbot to plan an itinerary around the new event.

---

# 8. Thank You!
**Ready to explore the real world, better.**

- **Developer:** Cuong Duong
- **Source Code:** [github.com/sad-squid/gemini-demo](https://github.com/sad-squid/gemini-demo)
- **Live Portal:** [Demo App Portal](#)

*(All hackathon requirements—Google Cloud usage, Innovation, and Completeness—have been met!)*
