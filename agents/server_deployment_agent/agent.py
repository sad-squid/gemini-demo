import os
import subprocess
import json
from typing import Optional
from google.adk.agents.llm_agent import Agent

def deploy_server_infra() -> str:
    """
    Builds the unified container via Cloud Build and deploys it to Google Cloud Run.
    
    Returns:
        A status report with details about Cloud Run build and deployment results.
    """
    agent_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(os.path.dirname(agent_dir))
    
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "noted-fact-500702-h4")
    region = os.environ.get("GOOGLE_CLOUD_LOCATION", "asia-northeast1")
    
    print(f"[Server Deploy] Initiating Cloud Run deployment for project {project_id} in {region}...")
    
    # 1. Construct the gcloud deploy command
    deploy_cmd = [
        "gcloud", "run", "deploy", "gemini-demo",
        "--source", ".",
        "--project", project_id,
        "--region", region,
        "--platform", "managed",
        "--allow-unauthenticated",
        "--quiet",
        f"--set-env-vars=ENV=production,GOOGLE_GENAI_USE_VERTEXAI=1,GOOGLE_CLOUD_PROJECT={project_id},GOOGLE_CLOUD_LOCATION={region}"
    ]
    
    print(f"[Server Deploy] Executing: {' '.join(deploy_cmd)}")
    
    deploy_result = subprocess.run(
        deploy_cmd,
        capture_output=True,
        text=True,
        cwd=root_dir
    )
    
    if deploy_result.returncode != 0:
        error_msg = (
            f"Google Cloud Run deployment failed!\n"
            f"Stderr: {deploy_result.stderr}\n"
            f"Stdout: {deploy_result.stdout}"
        )
        print(f"[Server Deploy] Error: {error_msg}")
        return json.dumps({"status": "error", "message": error_msg})
        
    print("[Server Deploy] Cloud Run deployment completed successfully.")
    
    # Simple regex to extract Service URL from stdout/stderr if possible
    # gcloud run deploy outputs lines like: Service [local-lens] revision [local-lens-xxxx] has been deployed and is serving 100% of traffic.
    # Service URL: https://local-lens-xxxx-uc.a.run.app
    service_url = f"https://local-lens-xxxxxx-uc.a.run.app"  # Fallback format
    for line in (deploy_result.stdout + deploy_result.stderr).split("\n"):
        if "Service URL:" in line:
            service_url = line.split("Service URL:")[1].strip()
            break
            
    success_report = {
        "status": "success",
        "message": "Unified container server-side infrastructure deployed successfully!",
        "service_url": service_url,
        "region": region,
        "project_id": project_id,
        "command_output_excerpt": (deploy_result.stdout + deploy_result.stderr)[-1000:] # include ending lines
    }
    return json.dumps(success_report, indent=2)

root_agent = Agent(
    model='gemini-3.5-flash',
    name='server_deployment_agent',
    description='An agent that builds the unified container image using Cloud Build and deploys it to Google Cloud Run.',
    instruction=(
        "You are Local Lens's Server Deployment Agent.\n"
        "Your role is to deploy the backend FastAPI + ADK Agent unified service to Google Cloud Run.\n\n"
        "When asked to deploy or redeploy the server, backend, or cloud infra:\n"
        "1. Call the deploy_server_infra tool to build and deploy.\n"
        "2. Wait for the tool execution to finish.\n"
        "3. Parse the results. If successful, print the secure Service URL returned by Google Cloud Run.\n"
        "4. Provide a neat summary of the deployment, reminding the user that the runtime Service Account "
        "requires the 'Vertex AI User' role to call the predictions and search grounding models.\n"
        "5. Maintain a professional, clear, and reassuring dev-ops architect persona."
    ),
    tools=[deploy_server_infra],
)
