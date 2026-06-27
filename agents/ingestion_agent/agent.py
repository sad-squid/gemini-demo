from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from google.adk.agents.llm_agent import Agent

class EntityType(str, Enum):
    EVENT = 'event'
    RESTAURANT = 'restaurant'
    VENUE = 'venue'

class ExtractedEntity(BaseModel):
    entity_type: EntityType = Field(
        ..., 
        description="The type of entity extracted from the visual upload (event, restaurant, or venue)"
    )
    name: str = Field(
        ..., 
        description="The primary name of the event, restaurant, or venue"
    )
    description: str = Field(
        ..., 
        description="A rich, descriptive summary of the entity extracted from the flyer or menu"
    )
    address: str = Field(
        ..., 
        description="The location, address, or venue name text extracted from the image"
    )
    date_time: Optional[str] = Field(
        None, 
        description="Specific date and time for events, or opening hours for restaurants"
    )
    event_dates: Optional[List[str]] = Field(
        default_factory=list, 
        description="Standardized ISO 8601 date strings or ISO 8601 datetime strings (e.g., YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS) representing the dates of the event."
    )
    ticket_price_or_cost: Optional[str] = Field(
        None, 
        description="Ticket pricing/admission fee or average dining cost/budget info"
    )
    contact_info: Optional[str] = Field(
        None, 
        description="Phone number, email, official website URL or social media handles mentioned"
    )
    suggested_emoji: Optional[str] = Field(
        None, 
        description="A single relevant emoji representing the vibe or category of this event, restaurant, or venue (e.g. 🏮 for traditional festivals, 🍜 for ramen, 🎸 for rock concerts, 🎫 for exhibition events)"
    )
    vibe_tags: List[str] = Field(
        default_factory=list, 
        description="A list of 2-5 atmospheric vibe tags representing the mood (e.g. Cozy, Underground, Cyberpunk, Acoustic)"
    )

root_agent = Agent(
    model='gemini-3.5-flash',
    name='ingestion_agent',
    description='A multimodal ingestion agent that extracts structured information from flyer, menu, and context images.',
    instruction=(
        "You are Local Lens's visual parser. Analyse the uploaded multimodal image ( flyer, menu, ticket, billboard, etc.) "
        "and extract the relevant event, venue, or restaurant details. Return them strictly adhering to the output_schema structure."
    ),
    output_schema=ExtractedEntity,
)
