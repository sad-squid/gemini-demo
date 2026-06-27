import os
import io
import sys
import unittest
import json
import subprocess
from unittest.mock import MagicMock, patch

# Ensure project root is in path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

from fastapi.testclient import TestClient
from backend.main import app

def create_dummy_jpeg() -> bytes:
    """Generates a dummy 100x100 white pixel JPEG image in bytes."""
    try:
        from PIL import Image
        img = Image.new("RGB", (100, 100), color="white")
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format="JPEG")
        return img_byte_arr.getvalue()
    except ImportError:
        # Fallback raw byte sequence resembling a header if Pillow is missing
        return b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00\x60\x00\x60\x00\x00\xFF\xDB\x00\x43\x00\x08"

class TestLocalLensIntegration(unittest.TestCase):
    
    def setUp(self):
        self.client = TestClient(app)
        
    def test_root_endpoint(self):
        """Verifies root endpoint response is ok."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok", "message": "Local Lens API running"})
        
    def test_get_locations_endpoint(self):
        """Verifies the GET /api/locations lists markers correctly."""
        with patch("backend.main.get_all_entities") as mock_get_entities:
            mock_get_entities.return_value = [
                {
                    "name": "Tokyo Test Spot",
                    "entity_type": "restaurant",
                    "address": "Shibuya, Tokyo",
                    "latitude": 35.6620,
                    "longitude": 139.7038
                }
            ]
            response = self.client.get("/api/locations")
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["status"], "success")
            self.assertEqual(len(data["data"]), 1)
            self.assertEqual(data["data"][0]["name"], "Tokyo Test Spot")

    @patch("google.cloud.storage.Client")
    @patch("google.genai.Client")
    @patch("subprocess.run")
    @patch("backend.main.add_entity")
    def test_full_upload_ingest_flow(self, mock_add_entity, mock_sub_run, mock_genai_client, mock_storage_client):
        """
        Tests the full endpoint flow:
        Upload Flyer -> Google Cloud Storage -> Multimodal Parse -> ADK Enrichment -> DB Save.
        """
        # 1. Mock Google Cloud Storage Client
        mock_storage_inst = MagicMock()
        mock_bucket = MagicMock()
        mock_blob = MagicMock()
        mock_storage_client.return_value = mock_storage_inst
        mock_storage_inst.get_bucket.return_value = mock_bucket
        mock_bucket.blob.return_value = mock_blob
        mock_blob.public_url = "https://storage.googleapis.com/test-bucket/unique-flyer.jpg"
        
        # 2. Mock Google GenAI Client response text
        mock_genai_inst = MagicMock()
        mock_genai_client.return_value = mock_genai_inst
        mock_response = MagicMock()
        # Mock ExtractedEntity schema text
        mock_response.text = json.dumps({
            "name": "Neo Shibuya Ramen",
            "entity_type": "restaurant",
            "description": "Premium cyber ramen shop",
            "address": "Shibuya, Tokyo",
            "vibe_tags": ["Cozy", "Cyberpunk"]
        })
        mock_genai_inst.models.generate_content.return_value = mock_response
        
        # 3. Mock Subprocess run (which runs 'adk run agents/enrichment_agent')
        mock_process_result = MagicMock()
        mock_process_result.returncode = 0
        # Return enriched output mock
        mock_process_result.stdout = """
Log setup complete.
[enrichment_agent]:
```json
{
  "entity_type": "restaurant",
  "name": "Neo Shibuya Ramen",
  "description": "Verified premium cyber ramen shop in Shibuya.",
  "address": "1-2-3 Shibuya, Tokyo, Japan",
  "latitude": 35.6620,
  "longitude": 139.7038,
  "official_website": "https://cyber-ramen.jp",
  "social_media_links": ["https://instagram.com/cyber_ramen"],
  "vibe_tags": ["Cozy", "Cyberpunk", "Neon"]
}
```
"""
        mock_sub_run.return_value = mock_process_result
        
        # 4. Mock DB save
        mock_add_entity.return_value = True
        
        # Create dummy flyer image bytes
        flyer_bytes = create_dummy_jpeg()
        
        # Perform the actual POST request
        response = self.client.post(
            "/api/ingest",
            files={"file": ("flyer.jpg", flyer_bytes, "image/jpeg")}
        )
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        
        enriched_data = data["data"]
        self.assertEqual(enriched_data["name"], "Neo Shibuya Ramen")
        self.assertEqual(enriched_data["address"], "1-2-3 Shibuya, Tokyo, Japan")
        self.assertEqual(enriched_data["latitude"], 35.6620)
        self.assertEqual(enriched_data["longitude"], 139.7038)
        self.assertEqual(enriched_data["sourceImage"], "https://storage.googleapis.com/test-bucket/unique-flyer.jpg")
        
        # Verify db helper called
        mock_add_entity.assert_called_once_with(enriched_data)
        
        # Verify subprocess invoked ADK command correctly
        mock_sub_run.assert_called_once()
        called_args = mock_sub_run.call_args[0][0]
        self.assertIn("adk", called_args)
        self.assertIn("run", called_args)
        self.assertIn("agents/enrichment_agent", called_args)

    @patch("subprocess.run")
    def test_chat_endpoint_flow(self, mock_sub_run):
        """
        Tests the /api/chat endpoint flow:
        FastAPI receives chat request -> invokes concierge_agent via ADK -> parses response.
        """
        # Mock subprocess response for concierge_agent
        mock_process_result = MagicMock()
        mock_process_result.returncode = 0
        mock_process_result.stdout = """
Log setup complete.
[concierge_agent]: Hello! I can help you find premium cyber ramen shops and events around Shibuya.
"""
        mock_sub_run.return_value = mock_process_result

        # Perform the actual POST request
        response = self.client.post(
            "/api/chat",
            json={"message": "Where can I get cyber ramen?", "session_id": "test-user-session"}
        )

        # Assertions
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["response"], "Hello! I can help you find premium cyber ramen shops and events around Shibuya.")
        self.assertEqual(data["session_id"], "test-user-session")

        # Verify subprocess invoked the concierge agent correctly
        mock_sub_run.assert_called_once()
        called_args = mock_sub_run.call_args[0][0]
        self.assertIn("adk", called_args)
        self.assertIn("run", called_args)
        self.assertIn("agents/concierge_agent", called_args)
        self.assertIn("--session_id", called_args)
        self.assertIn("test-user-session", called_args)
        self.assertIn("Where can I get cyber ramen?", called_args)

if __name__ == "__main__":
    unittest.main()

