# DATA SCHEMAS: Local Lens

These data schemas define the JSON outputs produced by the **Gemini Ingestion Parser** and enriched by the **Agentic Web Enrichment Worker**. Unified typing ensures compatibility across local parsing endpoints, Firestore collections, and the client Map UI.

---

## 1. Unified GeoEntity Schema
Every parsed real-world entity is represented as a `GeoEntity`.

```typescript
type EntityType = 'event' | 'venue' | 'restaurant';

interface EnrichedEntity {
  id?: string;                                // Unique ID (UUID or slug)
  entity_type: EntityType;                    // Category of entity
  name: string;                               // Name of the event, restaurant, or venue
  description: string;                        // Enriched description incorporating verified details and context
  address: string;                            // Verified, precise physical address or location
  latitude: number;                           // Latitude coordinate
  longitude: number;                          // Longitude coordinate
  official_website?: string;                  // Verified official website or booking/ticket URL
  social_media_links?: string[];              // Verified social media links (Instagram, X, Facebook)
  rating?: number;                            // Average review rating if applicable
  date_time_verified?: string;                // Verified precise date/time for events or hours of operation
  ticket_price_or_cost_verified?: string;     // Verified ticket price, admission fee, or budget level
  vibe_tags: string[];                        // Verified mood/vibe tags
  sourceImage?: string;                       // URL to the source photo in Cloud Storage
  createdAt?: string;                         // ISO 8601 Timestamp
}
```

---

## 2. Specific Entity Metadata

### A. Event Metadata (`event`)
```typescript
interface EventMetadata {
  date: string;                    // Resolved Date in YYYY-MM-DD format
  time?: string;                   // Time range (e.g., "19:00 - 22:00")
  lineup: string[];                // Performers, speakers, or artists
  price?: {
    amount: number;
    currency: string;              // e.g. "JPY", "USD"
    displayText: string;           // e.g. "¥3,500 (1 drink included)"
  };
  bookingUrl?: string;             // Ticket booking or RSVP link (Grounding Enricher)
}
```

### B. Venue Metadata (`venue`)
```typescript
interface VenueMetadata {
  hours?: string;                  // e.g., "11:00 - 20:00 (Closed Mondays)"
  atmosphere: string[];            // e.g., ["underground", "industrial", "quiet"]
  accessibility?: string;          // Information about accessibility features
}
```

### C. Restaurant Metadata (`restaurant`)
```typescript
interface RestaurantMetadata {
  cuisine: string;                 // e.g. "Ramen", "French", "Craft Beer Bar"
  priceRange: '¥' | '¥¥' | '¥¥¥' | '¥¥¥¥'; // Price categories
  featuredItems: {
    name: string;
    price?: string;
    description?: string;
  }[];                             // Highlighted items from the menu
}
```

---

## 3. Extraction System Prompt Example
When calling the Gemini API to parse images, the system prompt will enforce structured JSON extraction matching these schemas:

```markdown
Analyze the attached image and extract structured metadata.
Determine if the subject is an EVENT (e.g., flyer, concert poster, ticket), a RESTAURANT (e.g., menu, food stand poster, storefront), or a VENUE (e.g., art gallery, club, lounge, shop).

Produce a JSON output that adheres strictly to the defined schema.
If a field cannot be resolved or is not present in the image, do not guess; omit the field or set it to null.
For relative date expressions (e.g., "Tonight", "Next Friday"), resolve them using the current reference date: {{CURRENT_DATE}}.
```
