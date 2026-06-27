from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="LocusGemini Backend")

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For hackathon local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "LocusGemini API running"}

@app.post("/api/ingest")
async def ingest_image(file: UploadFile = File(...)):
    """
    Accepts an uploaded image of a flyer/menu/poster.
    Will utilize the Google Antigravity SDK to extract structured JSON.
    """
    # Read the file bytes
    content = await file.read()
    print(f"Received file: {file.filename}, size: {len(content)} bytes")
    
    # TODO: Pass the image to the Antigravity Multimodal Agent
    # For now, return a mock response matching our SCHEMAS.md
    
    mock_response = {
        "id": "1234-abcd-5678",
        "type": "event",
        "name": f"Mock Parsed Event from {file.filename}",
        "description": "This is a mocked extraction of the event flyer.",
        "location": {
            "address": "1-2-3 Shibuya, Tokyo",
            "coordinates": {
                "latitude": 35.6620,
                "longitude": 139.7038
            }
        },
        "metadata": {
            "date": "2026-06-27",
            "lineup": ["Artist A", "Artist B"],
        },
        "tags": ["live", "cyberpunk"],
        "sourceImage": "mock-url"
    }
    
    return {"status": "success", "data": mock_response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
