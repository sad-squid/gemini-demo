import os
import subprocess
import json
from typing import Optional
from google.adk.agents.llm_agent import Agent

def deploy_client(api_base_url: Optional[str] = None) -> str:
    """
    Builds the Vite/React frontend with the specified API base URL and deploys it to Firebase Hosting.
    
    Args:
        api_base_url: Optional absolute URL of the backend Cloud Run service.
                      (e.g., 'https://local-lens-xxxxxx-uc.a.run.app'). If omitted, the frontend
                      defaults to relative API paths, which works when served from the same container.
                      
    Returns:
        A status report with details about compilation and deployment results.
    """
    agent_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(os.path.dirname(agent_dir))
    frontend_dir = os.path.join(root_dir, "frontend")
    
    # 1. Build the Vite Frontend
    print(f"[Client Deploy] Compiling frontend at {frontend_dir}...")
    env = os.environ.copy()
    if api_base_url:
        env["VITE_API_BASE_URL"] = api_base_url.strip()
        print(f"[Client Deploy] API Base URL configured: {api_base_url}")
    else:
        print("[Client Deploy] No explicit API base URL provided. Building with relative paths.")
        
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
    
    # 2. Deploy to Firebase Hosting
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
    model='gemini-2.5-flash',
    name='client_deployment_agent',
    description='An agent that builds the React frontend and deploys it to high-speed Firebase Hosting CDN.',
    instruction=(
        "You are Local Lens's Client Deployment Agent.\n"
        "Your role is to build the latest client-side React code and deploy it to Firebase Hosting.\n\n"
        "When asked to deploy or redeploy the client/frontend:\n"
        "1. Identify if the user provided an absolute API base URL (e.g. for the Cloud Run backend). "
        "If they did, pass it to the deploy_client tool. If they did not, run deploy_client without arguments "
        "so the frontend uses relative paths.\n"
        "2. Call the deploy_client tool to compile and deploy.\n"
        "3. Wait for the tool to finish, then summarize the build logs, confirm the successful deployment, "
        "and proudly present the resulting secure URLs (e.g., https://noted-fact-500702-h4.web.app).\n"
        "4. Maintain a professional, prompt, and helpful dev-ops engineer persona."
    ),
    tools=[deploy_client],
)
