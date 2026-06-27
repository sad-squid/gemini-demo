from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# Material Design 3 / Google Core Colors
G_BLUE = RGBColor(66, 133, 244)
G_RED = RGBColor(234, 67, 53)
G_YELLOW = RGBColor(251, 188, 5)
G_GREEN = RGBColor(52, 168, 83)

MD_BG = RGBColor(248, 249, 250)      # Surface variant
MD_SURFACE = RGBColor(255, 255, 255) # Clean white card
MD_TEXT_PRIMARY = RGBColor(31, 31, 31)
MD_TEXT_SECONDARY = RGBColor(68, 71, 70)
MD_OUTLINE = RGBColor(196, 199, 197)

def set_bg(slide):
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = MD_BG

def add_mui_header(slide, color):
    """Adds a clean, thick Material-style color bar at the very top"""
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.2))
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()

def add_title_slide(title, subtitle, author):
    blank_layout = prs.slide_layouts[6] 
    slide = prs.slides.add_slide(blank_layout)
    set_bg(slide)
    
    # 4-color minimalist bar
    w = prs.slide_width / 4
    colors = [G_BLUE, G_RED, G_YELLOW, G_GREEN]
    for i, c in enumerate(colors):
        s = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, i*w, 0, w, Inches(0.2))
        s.fill.solid()
        s.fill.fore_color.rgb = c
        s.line.fill.background()
    
    # Main Hero Card (MUI Style)
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(2), Inches(10.333), Inches(3.5))
    card.fill.solid()
    card.fill.fore_color.rgb = MD_SURFACE
    card.line.color.rgb = MD_OUTLINE
    card.line.width = Pt(1)
    
    tf = card.text_frame
    tf.clear()
    p = tf.paragraphs[0]
    p.text = title
    p.font.name = 'Google Sans'
    p.font.size = Pt(64)
    p.font.bold = True
    p.font.color.rgb = MD_TEXT_PRIMARY
    p.alignment = PP_ALIGN.CENTER
    
    p2 = tf.add_paragraph()
    p2.text = f"\n{subtitle}"
    p2.font.name = 'Roboto'
    p2.font.size = Pt(24)
    p2.font.color.rgb = MD_TEXT_SECONDARY
    p2.alignment = PP_ALIGN.CENTER
    
    # Author
    author_box = slide.shapes.add_textbox(Inches(1.5), Inches(6), Inches(10.333), Inches(1))
    tf3 = author_box.text_frame
    p3 = tf3.paragraphs[0]
    p3.text = f"Developer: {author}"
    p3.font.name = 'Roboto'
    p3.font.size = Pt(18)
    p3.font.color.rgb = MD_TEXT_SECONDARY
    p3.alignment = PP_ALIGN.CENTER

def add_content_slide(title, content, main_color=G_BLUE):
    blank_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank_layout)
    set_bg(slide)
    add_mui_header(slide, main_color)
    
    # Clean, large MUI Header text
    title_box = slide.shapes.add_textbox(Inches(1), Inches(0.6), Inches(11.333), Inches(1))
    tf_title = title_box.text_frame
    p_title = tf_title.paragraphs[0]
    p_title.text = title
    p_title.font.name = 'Google Sans'
    p_title.font.size = Pt(44)
    p_title.font.color.rgb = MD_TEXT_PRIMARY
    
    # MUI Surface Card for content
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1), Inches(1.8), Inches(11.333), Inches(5))
    card.fill.solid()
    card.fill.fore_color.rgb = MD_SURFACE
    card.line.color.rgb = MD_OUTLINE
    card.line.width = Pt(1)
    
    tf = card.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.5)
    tf.margin_right = Inches(0.5)
    tf.margin_top = Inches(0.5)
    
    # Subheader / First line
    p0 = tf.paragraphs[0]
    p0.text = content[0]
    p0.font.name = 'Google Sans'
    p0.font.size = Pt(28)
    p0.font.bold = True
    p0.font.color.rgb = main_color
    
    for item in content[1:]:
        p = tf.add_paragraph()
        p.text = item
        p.font.name = 'Roboto'
        if item.startswith('-') or item.startswith('*'):
            p.level = 1
            p.font.size = Pt(22)
            p.font.color.rgb = MD_TEXT_SECONDARY
            p.space_before = Pt(12)
        else:
            p.level = 0
            p.font.size = Pt(24)
            p.font.bold = True
            p.font.color.rgb = MD_TEXT_PRIMARY
            p.space_before = Pt(24)

# Slide 1
add_title_slide("Local Lens", "Hyperlocalized Context Builder from Everyday Photos", "Cuong Duong (cuongduong.git@gmail.com)")

# Slide 2
add_content_slide("1. The Problem", [
    "Physical Discoveries Fade Quickly",
    "- You walk down the street and see a flyer for an underground concert or event.",
    "- You snap a picture, but it just sits in your camera roll.",
    "- There is no instant, frictionless way to convert visual, real-world objects into mapped, actionable, and structured data."
], G_RED)

# Slide 3
add_content_slide("2. The Solution: Local Lens", [
    "From Raw Pixel to Enriched Intelligence",
    "- Local Lens instantly bridges the physical world with a digital, interactive hyperlocal map.",
    "- Upload a single photo: Local Lens uses Multimodal Gemini AI to generate a structured model.",
    "- Agentic Search fetches the missing pieces (coordinates, links, schedules) autonomously."
], G_GREEN)

# Slide 4
add_content_slide("3. How It Works", [
    "The 3-Step Magic",
    "- 1. Capture & Parse: User uploads a photo. Gemini Vision API instantly extracts unstructured text to precise JSON.",
    "- 2. Agentic Enrichment: Autonomous agent queries the web to find exact geo-coordinates and ticketing links.",
    "- 3. Interactive Map: Data drops onto a live map. Users ask the Local Lens Chatbot for recommendations."
], G_YELLOW)

# Slide 5
add_content_slide("4. Architecture & Tech Stack", [
    "Powered by Google Cloud",
    "- Frontend: React/Next.js with interactive Mapbox UI.",
    "- Backend: Node.js/Express API orchestration.",
    "- AI & Agents: Gemini Multimodal Vision API & Gemini Text API (Chatbot).",
    "- Database: Google Cloud Firestore (Venues, events, geo-indices).",
    "- Infrastructure: Google Cloud Run."
], G_BLUE)

# Slide 6
add_content_slide("5. Innovation", [
    "Leveraging the Latest Gemini Capabilities",
    "- Multimodal Generation: The AI sees the flyer, understands visual hierarchy, and extracts meaning automatically.",
    "- Managed Agent Workflows: Background agents actively crawl the web to find missing context.",
    "- Grounded Chat: Local Lens concierge grounds its answers in entities stored in our Firestore."
], G_RED)

# Slide 7
add_content_slide("6. Core Features", [
    "What you can do:",
    "- Snap & Build: Frictionless visual ingestion of data.",
    "- Pulse Feed & Vibe Filters: Explore Tokyo events by vibe (e.g., Cyberpunk, Cozy, Underground).",
    "- Local Lens Concierge: Ask 'What acoustic gigs are near Shibuya tonight?'",
    "- Real-time Shared Map: A collaborative map built entirely from user-submitted photography."
], G_GREEN)

# Slide 8
add_content_slide("7. Demo Walkthrough", [
    "What You'll See in the Video",
    "- Uploading a raw, complex event flyer image.",
    "- UI displaying the successfully structured JSON extraction.",
    "- Background agent enriching location into latitude/longitude coordinates.",
    "- Event dynamically popping up on our interactive map.",
    "- Asking Local Lens Chatbot to plan an itinerary."
], G_YELLOW)

# Slide 9
add_content_slide("8. Thank You!", [
    "Ready to explore the real world, better.",
    "- Developer: Cuong Duong",
    "- Source Code: github.com/sad-squid/gemini-demo",
    "- Live Portal: Local Lens App",
    "- (All hackathon requirements—Google Cloud usage, Innovation, and Completeness—have been met!)"
], G_BLUE)

prs.save("Local_Lens_Pitch_Deck.pptx")
