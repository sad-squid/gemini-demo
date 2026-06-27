from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import sys
import io
import json
import re
import subprocess
import PIL.Image
from typing import Optional, List
import uuid
from google.cloud import storage

# Ensure repository root is in python path for local imports to work
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from google import genai
from google.genai import types
from agents.ingestion_agent.agent import ExtractedEntity
from agents.concierge_agent.db import add_entity, get_all_entities

app = FastAPI(title="Local Lens Backend API")

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For hackathon local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default-session"

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Local Lens API running"}

@app.get("/api/locations")
def get_locations():
    """
    Retrieve all verified events, venues, and restaurants from database.
    """
    try:
        entities = get_all_entities()
        return {"status": "success", "data": entities}
    except Exception as e:
        print(f"Error fetching locations: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/api/ingest")
async def ingest_image(file: UploadFile = File(...)):
    """
    Accepts an uploaded image of a flyer/menu/poster.
    Utilizes Google Antigravity SDK to parse and enrich extracted entities.
    """
    # 1. Upload the file to Google Cloud Storage
    content = await file.read()
    
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "noted-fact-500702-h4")
    bucket_name = f"{project_id}-uploads"
    storage_client = storage.Client(project=project_id)
    
    bucket = storage_client.bucket(bucket_name)
        
    unique_filename = f"{uuid.uuid4()}-{file.filename}"
    blob = bucket.blob(unique_filename)
    blob.upload_from_string(content, content_type=file.content_type or "image/jpeg")
    
    public_url = blob.public_url
    
    print(f"Saved uploaded flyer to GCS: {public_url}")
    
    # 2. Run multimodal parser using google-genai
    try:
        # Initialize Client. In production, this uses GOOGLE_GENAI_USE_VERTEXAI=1
        client = genai.Client()
        img = PIL.Image.open(io.BytesIO(content))
        
        prompt = (
            "Analyse the uploaded flyer, menu, or ticket image and extract the "
            "relevant event, venue, or restaurant details. Return them strictly adhering "
            "to the schema."
        )
        
        response = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=[img, prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ExtractedEntity,
            ),
        )
        
        extracted_json_str = response.text
        print(f"Multimodal parsing succeeded. Extracted: {extracted_json_str}")
        
    except Exception as e:
        print(f"Error during multimodal parsing: {e}")
        raise HTTPException(status_code=500, detail=f"Multimodal ingestion failed: {str(e)}")
        
    # 3. Pass the parsed output into enrichment agent using adk run
    try:
        env = os.environ.copy()
        env["GOOGLE_GENAI_USE_VERTEXAI"] = "1"
        env["GOOGLE_CLOUD_PROJECT"] = os.environ.get("GOOGLE_CLOUD_PROJECT", "noted-fact-500702-h4")
        env["GOOGLE_CLOUD_LOCATION"] = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
        
        cmd = [
            "adk", "run", "agents/enrichment_agent", extracted_json_str
        ]
        
        print(f"Running enrichment agent: {' '.join(cmd)}")
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            env=env,
            cwd=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        )
        
        if result.returncode != 0:
            print(f"Enrichment agent failed. Stderr: {result.stderr}")
            raise HTTPException(status_code=500, detail=f"Enrichment agent failed: {result.stderr}")
            
        agent_output = result.stdout
        print(f"Enrichment agent finished successfully.")
        
        # Parse the JSON from the output block
        # Look for ```json\n...\n```
        json_match = re.search(r"```json\s*(.*?)\s*```", agent_output, re.DOTALL)
        if json_match:
            enriched_json_str = json_match.group(1)
        else:
            json_match_raw = re.search(r"\{.*\}", agent_output, re.DOTALL)
            if json_match_raw:
                enriched_json_str = json_match_raw.group(0)
            else:
                raise HTTPException(status_code=500, detail="Failed to extract JSON from enrichment agent output")
                
        enriched_data = json.loads(enriched_json_str)
        enriched_data["sourceImage"] = public_url
        print(f"Enriched Data Resolved: {enriched_data}")
        
    except Exception as e:
        print(f"Error running enrichment agent: {e}")
        raise HTTPException(status_code=500, detail=f"Enrichment step failed: {str(e)}")
        
    # 4. Save to Database
    try:
        success = add_entity(enriched_data)
        if not success:
            raise HTTPException(status_code=500, detail="Could not save enriched location to database")
    except Exception as e:
        print(f"Error saving to DB: {e}")
        raise HTTPException(status_code=500, detail=f"Database save failed: {str(e)}")
        
    return {"status": "success", "data": enriched_data}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Handles conversational interactions.
    Maintains session history inside ADK persistent sessions.
    """
    try:
        env = os.environ.copy()
        env["GOOGLE_GENAI_USE_VERTEXAI"] = "1"
        env["GOOGLE_CLOUD_PROJECT"] = os.environ.get("GOOGLE_CLOUD_PROJECT", "noted-fact-500702-h4")
        env["GOOGLE_CLOUD_LOCATION"] = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
        
        session_id = request.session_id or "default-session"
        cmd = [
            "adk", "run", "agents/concierge_agent", "--session_id", session_id, request.message
        ]
        
        print(f"Running concierge agent: {' '.join(cmd)}")
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            env=env,
            cwd=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        )
        
        if result.returncode != 0:
            print(f"Concierge agent failed. Stderr: {result.stderr}")
            raise HTTPException(status_code=500, detail=f"Concierge agent failed: {result.stderr}")
            
        agent_output = result.stdout
        
        # Extract response from output: '[concierge_agent]: <text>'
        prefix = "[concierge_agent]:"
        if prefix in agent_output:
            response_text = agent_output.split(prefix, 1)[1].strip()
        else:
            lines = agent_output.split("\n")
            content_lines = [
                line for line in lines 
                if not line.startswith("Log setup") 
                and not "UserWarning" in line 
                and not "Session ID" in line
            ]
            response_text = "\n".join(content_lines).strip()
            
        return {
            "status": "success", 
            "response": response_text, 
            "session_id": session_id
        }
        
    except Exception as e:
        print(f"Error running concierge chat: {e}")
        raise HTTPException(status_code=500, detail=f"Chat execution failed: {str(e)}")

# Serve frontend build static files (after API routes are defined!)
FRONTEND_DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend/dist")
if os.path.exists(FRONTEND_DIST_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST_DIR, html=True), name="frontend")
else:
    print(f"Warning: Frontend distribution directory not found at {FRONTEND_DIST_DIR}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    reload = os.environ.get("ENV") == "development"
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload)
