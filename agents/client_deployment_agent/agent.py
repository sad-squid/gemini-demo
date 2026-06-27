import os
import subprocess
import json
from typing import Optional
from google.adk.agents.llm_agent import Agent

def deploy_client(api_base_url: Optional[str] = None, google_maps_api_key: Optional[str] = None) -> str:
    """
    Builds the Vite/React frontend with the specified API base URL and deploys it to Firebase Hosting.
    
    Args:
        api_base_url: Optional absolute URL of the backend Cloud Run service.
                      (e.g., 'https://local-lens-xxxxxx-uc.a.run.app'). If omitted, the frontend
                      defaults to relative API paths, which works when served from the same container.
        google_maps_api_key: Optional Google Maps Platform API key to render advance maps in frontend.
                      
    Returns:
        A status report with details about compilation and deployment results.
    """
    agent_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(os.path.dirname(agent_dir))
    frontend_dir = os.path.join(root_dir, "frontend")
    
    # 1. Resolve secrets from Secret Manager as fallback
    if not api_base_url:
        try:
            print("[Client Deploy] VITE_API_BASE_URL not explicitly provided. Querying GCP Secret Manager...")
            secret_result = subprocess.run(
                ["gcloud", "secrets", "versions", "access", "latest", "--secret=VITE_API_BASE_URL"],
                capture_output=True,
                text=True,
                check=True
            )
            api_base_url = secret_result.stdout.strip()
            print("[Client Deploy] Successfully retrieved VITE_API_BASE_URL from Secret Manager.")
        except Exception as e:
            print(f"[Client Deploy] Warning: Could not retrieve VITE_API_BASE_URL from Secret Manager. Error: {e}")

    if not google_maps_api_key:
        try:
            print("[Client Deploy] VITE_GOOGLE_MAPS_API_KEY not explicitly provided. Querying GCP Secret Manager...")
            secret_result = subprocess.run(
                ["gcloud", "secrets", "versions", "access", "latest", "--secret=VITE_GOOGLE_MAPS_API_KEY"],
                capture_output=True,
                text=True,
                check=True
            )
            google_maps_api_key = secret_result.stdout.strip()
            print("[Client Deploy] Successfully retrieved VITE_GOOGLE_MAPS_API_KEY from Secret Manager.")
        except Exception as e:
            print(f"[Client Deploy] Warning: Could not retrieve VITE_GOOGLE_MAPS_API_KEY from Secret Manager. Error: {e}")

    # 2. Build the Vite Frontend
    print(f"[Client Deploy] Compiling frontend at {frontend_dir}...")
    env = os.environ.copy()
    if api_base_url:
        env["VITE_API_BASE_URL"] = api_base_url.strip()
        print(f"[Client Deploy] API Base URL configured.")
    else:
        print("[Client Deploy] No API base URL provided. Building with relative paths.")
        
    if google_maps_api_key:
        env["VITE_GOOGLE_MAPS_API_KEY"] = google_maps_api_key.strip()
        print("[Client Deploy] Google Maps API Key configured.")

        
    build_result = subprocess.run(
        ["npm", "run", "build"],
        capture_output=True,
        text=True,
        cwd=frontend_dir,
        env=env
    )
    
    if build_result.returncode != 0:
        error_msg = (
            f"Vite frontend compilation failed!\n"
            f"Stderr: {build_result.stderr}\n"
            f"Stdout: {build_result.stdout}"
        )
        print(f"[Client Deploy] Error: {error_msg}")
        return json.dumps({"status": "error", "stage": "build", "message": error_msg})
        
    print("[Client Deploy] Frontend compilation succeeded.")
    
    # 3. Deploy to Firebase Hosting
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "noted-fact-500702-h4")
    print(f"[Client Deploy] Deploying to Firebase Hosting project {project_id}...")
    
    deploy_cmd = [
        "npx", "-y", "firebase-tools", "deploy", "--only", "hosting", "--project", project_id
    ]
    
    deploy_result = subprocess.run(
        deploy_cmd,
        capture_output=True,
        text=True,
        cwd=root_dir
    )
    
    if deploy_result.returncode != 0:
        error_msg = (
            f"Firebase Hosting deployment failed!\n"
            f"Stderr: {deploy_result.stderr}\n"
            f"Stdout: {deploy_result.stdout}"
        )
        print(f"[Client Deploy] Error: {error_msg}")
        return json.dumps({"status": "error", "stage": "deploy", "message": error_msg})
        
    print("[Client Deploy] Firebase Hosting deployment completed successfully.")
    
    success_report = {
        "status": "success",
        "message": "Frontend built and deployed successfully!",
        "hosting_url": f"https://{project_id}.web.app",
        "alternative_url": f"https://{project_id}.firebaseapp.com",
        "vite_build_output": build_result.stdout[-500:] # include last 500 chars of build log
    }
    return json.dumps(success_report, indent=2)
 
root_agent = Agent(
    model='gemini-3.5-flash',
    name='client_deployment_agent',
    description='An agent that builds the React frontend and deploys it to high-speed Firebase Hosting CDN.',
    instruction=(
        "You are Local Lens's Client Deployment Agent.\n"
        "Your role is to build the latest client-side React code and deploy it to Firebase Hosting.\n\n"
        "When asked to deploy or redeploy the client/frontend:\n"
        "1. Simply call the deploy_client tool without arguments. The tool will automatically query GCP Secret Manager "
        "to securely fetch and apply the VITE_API_BASE_URL and VITE_GOOGLE_MAPS_API_KEY environment variables.\n"
        "2. Wait for the tool to finish, then summarize the build logs, confirm the successful deployment, "
        "and proudly present the resulting secure URLs (e.g., https://noted-fact-500702-h4.web.app).\n"
        "3. Maintain a professional, prompt, and helpful dev-ops engineer persona."
    ),
    tools=[deploy_client],
)
