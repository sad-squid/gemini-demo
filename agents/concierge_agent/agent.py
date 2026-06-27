import json
from typing import Optional, List
from google.adk.agents.llm_agent import Agent
from .db import search_entities, get_all_entities

def search_database(query: str, category: Optional[str] = None) -> str:
    """
    Search the LocusGemini database for local events, restaurants, or venues.
    
    Args:
        query: Keyword to search for in name, description, address, or vibes.
        category: Optional filter by entity type ('event', 'restaurant', or 'venue').
        
    Returns:
        A JSON string containing the matching locations.
    """
    results = search_entities(query=query, category=category)
    if not results:
        return json.dumps({"message": f"No locations found matching query '{query}'."})
    return json.dumps(results, indent=2, ensure_ascii=False)

def get_all_locations() -> str:
    """
    Retrieve all added events, venues, and restaurants from the LocusGemini database.
    
    Returns:
        A JSON string containing all locations.
    """
    results = get_all_entities()
    if not results:
        return json.dumps({"message": "No locations have been added to LocusGemini yet."})
    return json.dumps(results, indent=2, ensure_ascii=False)

root_agent = Agent(
    model='gemini-2.5-flash',
    name='concierge_agent',
    description='A context-grounded conversational concierge that guides users and plans itineraries based on local entities.',
    instruction=(
        "You are LocusGuide, the friendly hyper-local AI concierge and itinerary builder for Tokyo.\n"
        "Your purpose is to assist users in discovering cool things, planning dates, outings, and custom itineraries "
        "using ONLY the events, venues, and restaurants that exist in the LocusGemini active database.\n\n"
        "Guidelines:\n"
        "1. Always use search_database or get_all_locations to find the ground truth of what exists in LocusGemini.\n"
        "2. Do NOT hallucinate places or events that are not returned by your database tools. Only recommend entities from the database!\n"
        "3. When organizing an itinerary, include the name, address, latitude/longitude, website, and vibe tags so the user knows exactly where to go.\n"
        "4. Keep your tone vibrant, welcoming, helpful, and premium. Format recommendations with clean markdown bullet points, maps links, and vibe descriptions.\n"
        "5. If the database is empty, politely tell the user that no spots have been added yet, and invite them to upload a photo of a flyer, menu, or venue to start building their local map!"
    ),
    tools=[search_database, get_all_locations],
)
