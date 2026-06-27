import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/drive']

def main():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Point to the user's downloaded client secret
            client_secret_path = os.path.expanduser('~/Downloads/client_secret_78876629361-tvd7m8cebfmhgo4kje57tf85vfm8cqdo.apps.googleusercontent.com.json')
            flow = InstalledAppFlow.from_client_secrets_file(client_secret_path, SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    service = build('drive', 'v3', credentials=creds)

    # File ID of the Google Slides presentation from the user's link
    file_id = '1sGDZZ5CGJaRgsBzGVnsp7aOMr3DFwftZ'

    print(f"Attempting to update presentation ID: {file_id} with Local_Lens_Pitch_Deck.pptx...")
    
    # Upload the PPTX file to overwrite the presentation
    media = MediaFileUpload('Local_Lens_Pitch_Deck.pptx',
                            mimetype='application/vnd.openxmlformats-officedocument.presentationml.presentation',
                            resumable=True)

    try:
        updated_file = service.files().update(
            fileId=file_id,
            media_body=media
        ).execute()
        print(f"Successfully updated file ID: {updated_file.get('id')}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == '__main__':
    main()
