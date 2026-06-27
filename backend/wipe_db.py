import os
import json
import sys

# Ensure repository root is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.concierge_agent.db import get_db_client, DB_FILE

def wipe_db():
    print("Wiping local JSON DB...")
    with open(DB_FILE, 'w') as f:
        json.dump([], f)
    print(f"Local JSON DB cleared at {DB_FILE}")

    print("Attempting to wipe Firestore collection 'entities'...")
    env = os.environ.copy()
    env["GOOGLE_GENAI_USE_VERTEXAI"] = "1"
    env["GOOGLE_CLOUD_PROJECT"] = os.environ.get("GOOGLE_CLOUD_PROJECT", "noted-fact-500702-h4")
    
    # Force project variable in case
    os.environ["GOOGLE_CLOUD_PROJECT"] = "noted-fact-500702-h4"
    
    client = get_db_client()
    if client:
        try:
            docs = client.collection("entities").stream()
            count = 0
            for doc in docs:
                doc.reference.delete()
                count += 1
            print(f"Firestore collection 'entities' cleared! Deleted {count} documents.")
        except Exception as e:
            print(f"Could not wipe Firestore collection: {e}")
    else:
        print("Firestore client not available (using fallback local DB).")

if __name__ == '__main__':
    wipe_db()
