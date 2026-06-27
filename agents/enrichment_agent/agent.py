from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from google.adk.agents.llm_agent import Agent
from google.adk.tools.google_search_tool import GoogleSearchTool

class EntityType(str, Enum):
    EVENT = 'event'
    RESTAURANT = 'restaurant'
    VENUE = 'venue'

class EnrichedEntity(BaseModel):
    entity_type: EntityType = Field(..., description="The verified type of entity (event, restaurant, or venue)")
    name: str = Field(..., description="The verified name of the entity")
    description: str = Field(..., description="An enriched description incorporating verified details and context")
    address: str = Field(..., description="The verified, precise physical address or location")
    latitude: float = Field(..., description="Latitude coordinate of the location, resolved from map search")
    longitude: float = Field(..., description="Longitude coordinate of the location, resolved from map search")
    official_website: Optional[str] = Field(None, description="Verified official website or booking/ticket URL")
    social_media_links: List[str] = Field(default_factory=list, description="Verified social media links (Instagram, X, Facebook)")
    rating: Optional[float] = Field(None, description="Average review rating (e.g. 4.5) if applicable")
    date_time_verified: Optional[str] = Field(None, description="Verified precise date/time for events or verified hours of operation")
    ticket_price_or_cost_verified: Optional[str] = Field(None, description="Verified ticket price, admission fee, or budget level")
    vibe_tags: List[str] = Field(default_factory=list, description="Verified mood/vibe tags representing the place or event")

root_agent = Agent(
    model='gemini-2.5-flash',
    name='enrichment_agent',
    description='An autonomous search agent that verifies and enriches extracted entities with geolocations, ratings, and social handles.',
    instruction=(
        "You are Local Lens's active enrichment agent. Given an extracted entity from a visual upload, "
        "use the google_search tool to perform search grounding. Your job is to:\n"
        "1. Verify and clean up the name, description, and physical address of the entity.\n"
        "2. Find the exact latitude and longitude for the physical address.\n"
        "3. Retrieve official links, social media handles, and ticket booking links or menus/ratings.\n"
        "4. Resolve any temporal ambiguities (e.g. 'next Friday') based on the current date and time (June 2026).\n\n"
        "You must output ONLY a valid JSON object matching the following structure. Do not include any explanations or other text outside the JSON. "
        "Your output must be wrapped in a single ```json and ``` block.\n\n"
        "JSON Schema Structure:\n"
        "{\n"
        "  \"entity_type\": \"event\" | \"restaurant\" | \"venue\",\n"
        "  \"name\": \"string (verified name)\",\n"
        "  \"description\": \"string (enriched description incorporating verified details and context)\",\n"
        "  \"address\": \"string (verified, precise physical address or location)\",\n"
        "  \"latitude\": float (latitude coordinate of the location, resolved from map search),\n"
        "  \"longitude\": float (longitude coordinate of the location, resolved from map search),\n"
        "  \"official_website\": \"string or null (verified official website or booking/ticket URL)\",\n"
        "  \"social_media_links\": [\"string\" (verified social media links like Instagram, X, Facebook)],\n"
        "  \"rating\": float or null (average review rating if applicable, e.g. 4.5),\n"
        "  \"date_time_verified\": \"string or null (verified precise date/time for events or verified hours of operation)\",\n"
        "  \"ticket_price_or_cost_verified\": \"string or null (verified ticket price, admission fee, or budget level)\",\n"
        "  \"vibe_tags\": [\"string\" (verified mood/vibe tags representing the place or event)]\n"
        "}"
    ),
    tools=[GoogleSearchTool()],
)
