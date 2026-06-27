import os
import json
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../backend/data_store.json")

def get_db_client():
    """
    Returns a Firestore client if authenticated and configured,
    otherwise returns None (indicating fallback to local JSON DB).
    """
    if os.environ.get("GOOGLE_APPLICATION_CREDENTIALS") or os.environ.get("GOOGLE_GENAI_USE_VERTEXAI") == "1":
        try:
            from google.cloud import firestore
            project_id = os.environ.get("GOOGLE_CLOUD_PROJECT")
            if project_id:
                return firestore.Client(project=project_id)
            return firestore.Client()
        except Exception as e:
            logger.warning(f"Failed to initialize Firestore client (falling back to JSON store): {e}")
    return None

def load_local_db() -> List[Dict[str, Any]]:
    """Loads entities from local data_store.json file."""
    if not os.path.exists(DB_FILE):
        os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
        with open(DB_FILE, 'w') as f:
            json.dump([], f)
        return []
    try:
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading local DB file: {e}")
        return []

def save_local_db(data: List[Dict[str, Any]]) -> bool:
    """Saves entities to local data_store.json file."""
    try:
        os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
        with open(DB_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving to local DB file: {e}")
        return False

def add_entity(entity: Dict[str, Any]) -> bool:
    """Adds a new entity to Firestore or local JSON DB."""
    client = get_db_client()
    if client:
        try:
            # Save to Firestore collection 'entities'
            doc_id = entity.get("name", "").lower().replace(" ", "_")
            if not doc_id:
                doc_id = "entity_" + str(len(list(client.collection("entities").stream())))
            entity["id"] = doc_id
            client.collection("entities").document(doc_id).set(entity)
            return True
        except Exception as e:
            logger.warning(f"Firestore add_entity failed, writing locally: {e}")
    
    # Local fallback
    data = load_local_db()
    # Check for duplicate
    data = [item for item in data if item.get("name") != entity.get("name")]
    
    if "id" not in entity:
        entity["id"] = entity.get("name", "").lower().replace(" ", "_") or f"entity_{len(data)}"
        
    data.append(entity)
    return save_local_db(data)

def search_entities(query: str, category: Optional[str] = None) -> List[Dict[str, Any]]:
    """Searches entities by keywords in name/description and optional category filtering."""
    client = get_db_client()
    results = []
    
    if client:
        try:
            ref = client.collection("entities")
            if category:
                query_ref = ref.where("entity_type", "==", category.lower())
                docs = query_ref.stream()
            else:
                docs = ref.stream()
            
            for doc in docs:
                data = doc.to_dict()
                # Simple keyword match on name and description
                q = query.lower()
                name_match = q in data.get("name", "").lower()
                desc_match = q in data.get("description", "").lower()
                addr_match = q in data.get("address", "").lower()
                if not q or name_match or desc_match or addr_match:
                    results.append(data)
            return results
        except Exception as e:
            logger.warning(f"Firestore search_entities failed, reading locally: {e}")

    # Local fallback
    local_data = load_local_db()
    q = query.lower()
    for item in local_data:
        if category and item.get("entity_type", "").lower() != category.lower():
            continue
        name_match = q in item.get("name", "").lower()
        desc_match = q in item.get("description", "").lower()
        addr_match = q in item.get("address", "").lower()
        if not q or name_match or desc_match or addr_match:
            results.append(item)
    return results

def get_all_entities() -> List[Dict[str, Any]]:
    """Retrieves all entities from database."""
    client = get_db_client()
    if client:
        try:
            docs = client.collection("entities").stream()
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            logger.warning(f"Firestore get_all_entities failed, reading locally: {e}")
            
    return load_local_db()
