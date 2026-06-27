from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor

prs = Presentation()

# Google Colors
G_BLUE = RGBColor(66, 133, 244)
G_RED = RGBColor(234, 67, 53)
G_YELLOW = RGBColor(251, 188, 5)
G_GREEN = RGBColor(52, 168, 83)
TEXT_DARK = RGBColor(32, 33, 36)
TEXT_MUTED = RGBColor(95, 99, 104)

def set_font(font, name='Arial', size=Pt(18), color=TEXT_DARK, bold=False):
    font.name = name
    font.size = size
    font.color.rgb = color
    font.bold = bold

def add_title_slide(title, subtitle, author):
    slide_layout = prs.slide_layouts[0]
    slide = prs.slides.add_slide(slide_layout)
    title_shape = slide.shapes.title
    subtitle_shape = slide.placeholders[1]
    
    title_shape.text = title
    set_font(title_shape.text_frame.paragraphs[0].font, size=Pt(44), color=G_BLUE, bold=True)
    
    subtitle_shape.text = f"{subtitle}\n\n{author}"
    for p in subtitle_shape.text_frame.paragraphs:
        set_font(p.font, size=Pt(20), color=TEXT_MUTED)

def add_bullet_slide(title, content):
    slide_layout = prs.slide_layouts[1]
    slide = prs.slides.add_slide(slide_layout)
    
    title_shape = slide.shapes.title
    title_shape.text = title
    # Alternating header colors for fun
    color = G_BLUE
    if 'Problem' in title: color = G_RED
    elif 'Solution' in title: color = G_GREEN
    elif 'Magic' in title: color = G_YELLOW
    
    set_font(title_shape.text_frame.paragraphs[0].font, size=Pt(36), color=color, bold=True)
    
    body_shape = slide.placeholders[1]
    tf = body_shape.text_frame
    tf.text = content[0]
    set_font(tf.paragraphs[0].font, size=Pt(20), bold=True)
    
    for item in content[1:]:
        p = tf.add_paragraph()
        p.text = item
        if item.startswith('-') or item.startswith('*'):
            p.level = 1
            set_font(p.font, size=Pt(18))
        else:
            p.level = 0
            set_font(p.font, size=Pt(20), bold=True)

# Slide 1
add_title_slide("Local Lens", "Hyperlocalized Context Builder from Everyday Photos\nGemini AI Tokyo Hackathon 2026", "Developer: Cuong Duong (cuongduong.git@gmail.com)")

# Slide 2
add_bullet_slide("1. The Problem", [
    "Physical Discoveries Fade Quickly",
    "- You walk down the street and see a flyer for an underground concert or event.",
    "- You snap a picture, but it just sits in your camera roll.",
    "- There is no instant, frictionless way to convert visual, real-world objects into mapped, actionable, and structured data."
])

# Slide 3
add_bullet_slide("2. The Solution: Local Lens", [
    "From Raw Pixel to Enriched Intelligence",
    "- Local Lens instantly bridges the physical world with a digital, interactive hyperlocal map.",
    "- Upload a single photo: Local Lens uses Multimodal Gemini AI to generate a structured model.",
    "- Agentic Search fetches the missing pieces (coordinates, links, schedules) autonomously."
])

# Slide 4
add_bullet_slide("3. How It Works (The 3-Step Magic)", [
    "1. Capture & Parse",
    "- User uploads a photo. Gemini Vision API instantly extracts unstructured text to precise JSON.",
    "2. Agentic Enrichment",
    "- Autonomous agent queries the web to find exact geo-coordinates and ticketing links.",
    "3. Interactive Map & Concierge",
    "- Data drops onto a live map. Users ask the Local Lens Chatbot for recommendations based purely on uploaded data."
])

# Slide 5
add_bullet_slide("4. Architecture & Tech Stack", [
    "Powered by Google Cloud",
    "- Frontend: React/Next.js with interactive Mapbox UI.",
    "- Backend: Node.js/Express API orchestration.",
    "- AI & Agents: Gemini Multimodal Vision API & Gemini Text API (Chatbot).",
    "- Database: Google Cloud Firestore (Venues, events, geo-indices).",
    "- Infrastructure: Google Cloud Run."
])

# Slide 6
add_bullet_slide("5. Innovation: Why Local Lens Stands Out", [
    "Leveraging the Latest Gemini Capabilities",
    "- Multimodal Generation: The AI sees the flyer, understands visual hierarchy, and extracts meaning automatically.",
    "- Managed Agent Workflows: Background agents actively crawl the web to find missing context.",
    "- Grounded Chat: Local Lens concierge grounds its answers in entities stored in our Firestore."
])

# Slide 7
add_bullet_slide("6. Core Features at a Glance", [
    "What you can do:",
    "- Snap & Build: Frictionless visual ingestion of data.",
    "- Pulse Feed & Vibe Filters: Explore Tokyo events by vibe (e.g., Cyberpunk, Cozy, Underground).",
    "- Local Lens Concierge: Ask 'What acoustic gigs are near Shibuya tonight?'",
    "- Real-time Shared Map: A collaborative map built entirely from user-submitted photography."
])

# Slide 8
add_bullet_slide("7. Demo Walkthrough", [
    "What You'll See in the Video",
    "- Uploading a raw, complex event flyer image.",
    "- UI displaying the successfully structured JSON extraction.",
    "- Background agent enriching location into latitude/longitude coordinates.",
    "- Event dynamically popping up on our interactive map.",
    "- Asking Local Lens Chatbot to plan an itinerary."
])

# Slide 9
add_bullet_slide("8. Thank You!", [
    "Ready to explore the real world, better.",
    "- Developer: Cuong Duong",
    "- Source Code: github.com/sad-squid/gemini-demo",
    "- Live Portal: Local Lens App",
    "- (All hackathon requirements—Google Cloud usage, Innovation, and Completeness—have been met!)"
])

prs.save("Local_Lens_Pitch_Deck.pptx")
