from fastapi import FastAPI, Depends, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pydantic import BaseModel
import time
import random
import json
import base64
import os
import uuid
from typing import List, Optional
from fastapi.staticfiles import StaticFiles

from database import engine, Base, get_db
import models
import ai_service

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ENVISION AI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static directory for images
os.makedirs(os.path.join("static", "images"), exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

class ReportCreate(BaseModel):
    category: str
    description: str
    lat: float
    lng: float
    image_base64: str = None  # Added for AI vision

class PostCreate(BaseModel):
    content: str
    category: str  # Pollution, Smoke, Crime/Safety, Water Issue, Heat Alert
    lat: Optional[float] = None
    lng: Optional[float] = None
    image_base64: Optional[str] = None

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

# ─────────────────────────────────────────────
# REPORTS ENDPOINTS
# ─────────────────────────────────────────────

@app.get("/api/reports")
def get_reports(db: Session = Depends(get_db)):
    reports = db.query(models.Report).filter(models.Report.status != "Archived").order_by(models.Report.created_at.desc()).all()
    result = []
    for r in reports:
        # Get username from user
        user = db.query(models.User).filter(models.User.id == r.user_id).first()
        username = user.username if user and user.username else "Citizen"
        result.append({
            "id": r.id,
            "user_id": r.user_id,
            "username": username,
            "category": r.category,
            "description": r.description,
            "location_name": r.location_name,
            "lat": r.lat,
            "lng": r.lng,
            "aqi": r.aqi,
            "confidence": r.confidence,
            "verified": r.verified,
            "trust_score": r.trust_score,
            "trust_reason": r.trust_reason,
            "eri_score": r.eri_score,
            "eri_category": r.eri_category,
            "image_url": r.image_url,
            "likes": r.likes,
            "priority": r.priority,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None
        })
    return result

def process_report_ai(report_id: int, db: Session, image_base64: str):
    import external_api_service
    
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report: return

    # 1. Computer Vision Service
    if image_base64:
        try:
            # Strip data URI prefix if present
            if "," in image_base64:
                header, encoded = image_base64.split(",", 1)
                mime_type = header.split(";")[0].split(":")[1]
            else:
                encoded = image_base64
                mime_type = "image/jpeg" # fallback
                
            image_bytes = base64.b64decode(encoded)
            
            filename = f"{uuid.uuid4()}.jpg"
            filepath = os.path.join("static", "images", filename)
            with open(filepath, "wb") as f:
                f.write(image_bytes)
            report.image_url = f"/static/images/{filename}"
            ai_result = ai_service.analyze_image(image_bytes, mime_type)
            
            report.confidence = ai_result.confidence
            report.category = ai_result.category
            report.description = f"{report.description}\n\nAI Analysis: {ai_result.explanation}"
            
            if not ai_result.is_valid:
                report.verified = False
                report.priority = "Rejected"
                report.status = "Archived"
                report.trust_score = 0
                report.trust_reason = "Image flagged as invalid/unrelated by AI."
                db.commit()
                return
        except Exception as e:
            print(f"Error processing image: {e}")
            report.confidence = random.uniform(50.0, 99.9) # Fallback
    else:
        # No image provided, fallback
        report.confidence = random.uniform(50.0, 99.9)

    # 2. Live API Data Fetching (Reverse Geocoding, WAQI, Open-Meteo)
    report.location_name = external_api_service.reverse_geocode(report.lat, report.lng)
    
    live_aqi = external_api_service.get_live_aqi(report.lat, report.lng)
    if live_aqi is not None:
        report.aqi = live_aqi
    else:
        report.aqi = 150 # fallback if api fails
        
    live_weather = external_api_service.get_live_weather(report.lat, report.lng)

    # 3. Trust & Verification Engine
    user = db.query(models.User).filter(models.User.id == report.user_id).first()
    eco_points = user.eco_points if user else 150
    
    trust_result = ai_service.calculate_trust_score(eco_points, report.confidence, report.description)
    report.trust_score = trust_result.trust_score
    report.trust_reason = trust_result.trust_reason

    if report.trust_score < 70:
        report.verified = False
        report.priority = "Rejected"
        report.status = "Archived"
        db.commit()
        return

    # Verified successfully
    report.verified = True
    
    # 4. Incident Prioritization
    if report.aqi > 300:
        report.priority = "Emergency"
    elif report.aqi > 200:
        report.priority = "Critical"
    elif report.aqi > 150:
        report.priority = "High"
    elif report.aqi > 100:
        report.priority = "Medium"
    else:
        report.priority = "Low"
        
    db.commit()
    
    # 5. ERI Calculation (Environmental Risk Index)
    grid_emissions = external_api_service.get_grid_emissions(report.lat, report.lng)
    eri_result = ai_service.calculate_eri(live_weather, report.aqi, report.category, report.priority, grid_emissions)
    report.eri_score = eri_result.eri_score
    report.eri_category = eri_result.eri_category
    db.commit()
    
    # 6. GeoAI Hotspot Detection
    lat_diff = 0.02
    lng_diff = 0.02
    nearby_reports = db.query(models.Report).filter(
        models.Report.verified == True,
        models.Report.status != "Archived",
        models.Report.lat >= report.lat - lat_diff,
        models.Report.lat <= report.lat + lat_diff,
        models.Report.lng >= report.lng - lng_diff,
        models.Report.lng <= report.lng + lng_diff
    ).all()
    
    if len(nearby_reports) >= 3:
        existing_hotspot = db.query(models.Hotspot).filter(
            models.Hotspot.lat >= report.lat - lat_diff,
            models.Hotspot.lat <= report.lat + lat_diff,
            models.Hotspot.lng >= report.lng - lng_diff,
            models.Hotspot.lng <= report.lng + lng_diff,
            models.Hotspot.status == "Active"
        ).first()
        
        if existing_hotspot:
            existing_hotspot.active_reports_count = len(nearby_reports)
            existing_hotspot.severity = "Critical" if len(nearby_reports) > 5 else "High"
        else:
            new_hotspot = models.Hotspot(
                name=f"Pollution Cluster: {report.location_name}",
                lat=report.lat,
                lng=report.lng,
                radius=2.5,
                severity="High",
                active_reports_count=len(nearby_reports)
            )
            db.add(new_hotspot)
        db.commit()

    # 7. Recommendation Engine
    if report.priority in ["Emergency", "Critical", "High", "Medium"]:
        mission_result = ai_service.generate_mission_recommendations(report.category, report.priority, report.aqi)
            
        new_mission = models.Mission(
            report_id=report.id,
            mission_name=mission_result.mission_name,
            suggested_resources=json.dumps(mission_result.suggested_resources),
            estimated_time=mission_result.estimated_time,
            expected_aqi_improvement=mission_result.expected_aqi_improvement,
            status="Unassigned"
        )
        db.add(new_mission)
        db.commit()

from database import SessionLocal
import auth

class OnboardingRequest(BaseModel):
    username: str
    name: str

@app.post("/api/auth/sync")
def sync_auth(
    decoded_token: dict = Depends(auth.verify_token),
    db: Session = Depends(get_db)
):
    uid = decoded_token.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid token payload")
        
    user = db.query(models.User).filter(models.User.firebase_uid == uid).first()
    if not user:
        user = models.User(firebase_uid=uid, eco_points=150, level="Seed")
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return {
        "needs_onboarding": user.username is None,
        "user_id": user.id
    }

@app.post("/api/users/onboarding")
def onboarding(
    req: OnboardingRequest,
    user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Check if username exists
    existing = db.query(models.User).filter(models.User.username == req.username).first()
    if existing and existing.id != user.id:
        raise HTTPException(status_code=400, detail="Username already taken")
        
    user.username = req.username
    user.name = req.name
    db.commit()
    return {"message": "Profile created"}

@app.post("/api/reports")
def create_report(
    report: ReportCreate,
    user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    image_url = None
    if report.image_base64:
        try:
            if "," in report.image_base64:
                header, encoded = report.image_base64.split(",", 1)
            else:
                encoded = report.image_base64
            image_bytes = base64.b64decode(encoded)
            filename = f"{uuid.uuid4().hex}.jpg"
            filepath = os.path.join("static", "images", filename)
            with open(filepath, "wb") as f:
                f.write(image_bytes)
            image_url = f"/static/images/{filename}"
        except Exception as e:
            print(f"Error saving image: {e}")

    new_report = models.Report(
        user_id=user.id, 
        category=report.category,
        description=report.description,
        location_name="Fetching...", 
        lat=report.lat,
        lng=report.lng,
        aqi=0, 
        confidence=0.0, 
        verified=False,
        priority="Pending",
        status="Open",
        trust_score=0,
        eri_score=0,
        image_url=image_url
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    # Process AI synchronously to return results
    process_report_ai(new_report.id, db, report.image_base64)
    db.refresh(new_report)
    
    return {
        "message": "Report received and analyzed.", 
        "report_id": new_report.id,
        "ai_results": {
            "category": new_report.category,
            "confidence": new_report.confidence,
            "verified": new_report.verified,
            "priority": new_report.priority,
            "trust_score": new_report.trust_score,
            "trust_reason": new_report.trust_reason,
            "eri_score": new_report.eri_score,
            "eri_category": new_report.eri_category,
            "location": new_report.location_name
        }
    }

@app.post("/api/reports/{report_id}/like")
def like_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.likes = (report.likes or 0) + 1
    db.commit()
    db.refresh(report)
    return {"message": "Report liked", "likes": report.likes}

# ─────────────────────────────────────────────
# TWITTER-LIKE POSTS ENDPOINTS
# ─────────────────────────────────────────────

@app.get("/api/posts")
def get_posts(db: Session = Depends(get_db)):
    posts = db.query(models.Post).order_by(models.Post.created_at.desc()).limit(50).all()
    result = []
    for p in posts:
        result.append({
            "id": p.id,
            "user_id": p.user_id,
            "username": p.username or "Citizen",
            "content": p.content,
            "category": p.category,
            "lat": p.lat,
            "lng": p.lng,
            "location_name": p.location_name,
            "image_url": p.image_url,
            "likes": p.likes,
            "created_at": p.created_at.isoformat() if p.created_at else None
        })
    return result

@app.post("/api/posts")
def create_post(
    post: PostCreate,
    user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    import external_api_service

    image_url = None
    if post.image_base64:
        try:
            if "," in post.image_base64:
                header, encoded = post.image_base64.split(",", 1)
            else:
                encoded = post.image_base64
            image_bytes = base64.b64decode(encoded)
            filename = f"post_{uuid.uuid4().hex}.jpg"
            filepath = os.path.join("static", "images", filename)
            with open(filepath, "wb") as f:
                f.write(image_bytes)
            image_url = f"/static/images/{filename}"
        except Exception as e:
            print(f"Error saving post image: {e}")

    # Reverse geocode if coordinates provided
    location_name = None
    if post.lat and post.lng:
        location_name = external_api_service.reverse_geocode(post.lat, post.lng)

    new_post = models.Post(
        user_id=user.id,
        username=user.username or "Citizen",
        content=post.content[:280],  # Enforce 280 char limit
        category=post.category,
        lat=post.lat,
        lng=post.lng,
        location_name=location_name,
        image_url=image_url,
        likes=0
    )
    db.add(new_post)
    
    # Give eco points for posting
    user.eco_points = (user.eco_points or 0) + 5
    db.commit()
    db.refresh(new_post)

    return {
        "message": "Post created!",
        "post_id": new_post.id,
        "eco_points_earned": 5
    }

@app.post("/api/posts/{post_id}/like")
def like_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.likes = (post.likes or 0) + 1
    db.commit()
    return {"message": "Post liked", "likes": post.likes}

# ─────────────────────────────────────────────
# MAP ENDPOINTS
# ─────────────────────────────────────────────

@app.get("/api/map/local-data")
def get_map_local_data(lat: float, lng: float):
    import external_api_service
    weather = external_api_service.get_live_weather(lat, lng)
    aqi = external_api_service.get_live_aqi(lat, lng)
    location_name = external_api_service.reverse_geocode(lat, lng)
    temp = weather.get("temperature", "N/A") if weather and isinstance(weather, dict) else "N/A"
    windspeed = weather.get("windspeed", "N/A") if weather and isinstance(weather, dict) else "N/A"
    humidity = weather.get("humidity", "N/A") if weather and isinstance(weather, dict) else "N/A"
    feels_like = weather.get("feels_like", temp) if weather and isinstance(weather, dict) else "N/A"
    
    # Determine if heat wave
    is_heatwave = False
    try:
        if isinstance(temp, (int, float)) and float(temp) >= 40:
            is_heatwave = True
    except:
        pass

    return {
        "temperature": temp,
        "feels_like": feels_like,
        "windspeed": windspeed,
        "humidity": humidity,
        "aqi": aqi if aqi is not None else "N/A",
        "location": location_name,
        "is_heatwave": is_heatwave
    }

@app.get("/api/map/india-zones")
def get_india_zones():
    """
    Returns color-coded zone data for all major Indian cities:
    - AQI zones (red/orange/green)
    - Heatwave zones (orange/red)
    - Water/flood zones (blue)
    """
    import external_api_service
    
    aqi_zones = external_api_service.get_india_aqi_zones()
    heatwave_zones = external_api_service.get_india_heatwave_zones()
    water_zones = external_api_service.get_india_water_stress_zones()
    
    return {
        "aqi_zones": aqi_zones,
        "heatwave_zones": heatwave_zones,
        "water_zones": water_zones,
        "total_cities": len(aqi_zones),
        "source": "WAQI + Open-Meteo + IMD"
    }

@app.get("/api/map/zone-insight")
def get_zone_insight(zone_type: str, zone_name: str, value: str, layer: str):
    """Get AI-generated safety insight for a map zone."""
    insight = ai_service.generate_zone_insight(zone_type, zone_name, value, layer)
    return {
        "safety_level": insight.safety_level,
        "travel_advice": insight.travel_advice,
        "key_risks": insight.key_risks,
        "recommendation": insight.recommendation
    }

@app.get("/api/hotspots")
def get_hotspots(db: Session = Depends(get_db)):
    return db.query(models.Hotspot).filter(models.Hotspot.status == "Active").all()

# ─────────────────────────────────────────────
# NEWS ENDPOINT
# ─────────────────────────────────────────────

@app.get("/api/news")
def get_environment_news():
    """
    Fetch real Indian environment news from RSS feeds / NewsAPI.
    Optionally summarized with Gemini.
    """
    import external_api_service
    articles = external_api_service.fetch_environment_news()
    
    # Optionally AI-summarize the first few articles
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
    if GEMINI_API_KEY and GEMINI_API_KEY != "mock_key_for_testing":
        for i, article in enumerate(articles[:5]):
            if article.get("description"):
                try:
                    article["ai_summary"] = ai_service.summarize_news_article(
                        article["title"], article["description"]
                    )
                except Exception:
                    article["ai_summary"] = article["description"]
            else:
                article["ai_summary"] = article["title"]
    else:
        for article in articles:
            article["ai_summary"] = article.get("description") or article["title"]
    
    return {"articles": articles}

# ─────────────────────────────────────────────
# KNOWLEDGE HUB ENDPOINT
# ─────────────────────────────────────────────

@app.get("/api/knowledge/articles")
def get_knowledge_articles(topic: str = "environment India", db: Session = Depends(get_db)):
    """
    Returns knowledge hub content: articles + YouTube videos.
    Combines curated content with live YouTube search.
    """
    import external_api_service

    # Curated articles database
    curated = [
        {
            "id": 1,
            "title": "Understanding PM2.5 and Its Impact on Indian Cities",
            "type": "Article",
            "category": "Air Pollution",
            "readTime": "5 min read",
            "summary": "PM2.5 particles smaller than 2.5 micrometers penetrate deep into the lungs. India's CPCB 24-hr standard is 60 μg/m³, but cities like Delhi regularly exceed 300 μg/m³. Learn how this affects your health.",
            "url": "https://www.cpcb.nic.in/ambient-air-quality-standards/",
            "source": "CPCB India",
            "image": "",
            "tags": ["Air Pollution", "Health", "PM2.5"]
        },
        {
            "id": 2,
            "title": "How to Segregate Dry and Wet Waste Correctly",
            "type": "Video",
            "category": "Waste Management",
            "readTime": "12 min watch",
            "summary": "India generates 62 million tonnes of waste annually. Proper segregation into dry (recyclable) and wet (organic) waste is the first step to responsible disposal. This guide shows you how.",
            "url": "https://www.youtube.com/results?search_query=waste+segregation+India",
            "source": "Swachh Bharat Mission",
            "image": "",
            "videoId": "dQw4w9WgXcQ",
            "tags": ["Waste Management", "Recycling"]
        },
        {
            "id": 3,
            "title": "The Urban Heat Island Effect in Indian Megacities",
            "type": "Article",
            "category": "Heat Wave",
            "readTime": "8 min read",
            "summary": "Urban areas in India are 3-5°C hotter than surrounding rural areas due to concrete, asphalt, and reduced vegetation. ISRO satellite data shows the extent of heat islands in Delhi, Mumbai, and Bangalore.",
            "url": "https://www.isro.gov.in/urban-heat-island",
            "source": "ISRO / MoEFCC",
            "image": "",
            "tags": ["Heat Wave", "Climate Change", "ISRO"]
        },
        {
            "id": 4,
            "title": "Ganga Rejuvenation: Namami Gange Progress Report",
            "type": "Article",
            "category": "Water Pollution",
            "readTime": "10 min read",
            "summary": "The Namami Gange programme has invested ₹30,000 crore to clean the Ganga. Real-time water quality data from CPCB sensors shows improvements in BOD levels at key ghats.",
            "url": "https://nmcg.nic.in/NamamiGanga.aspx",
            "source": "NMCG / Jal Shakti",
            "image": "",
            "tags": ["Water Pollution", "Government", "Ganga"]
        },
        {
            "id": 5,
            "title": "Air Purifying Plants for Your Home in India",
            "type": "Video",
            "category": "Plantation",
            "readTime": "15 min watch",
            "summary": "Snake plant, Areca palm, and Tulsi are effective air purifiers. Learn how to grow these plants in Indian climate conditions to reduce indoor pollution.",
            "url": "https://www.youtube.com/results?search_query=air+purifying+plants+India",
            "source": "MoEFCC",
            "image": "",
            "videoId": "",
            "tags": ["Plantation", "Indoor Plants", "Air Quality"]
        },
        {
            "id": 6,
            "title": "Reading an AQI Report: Complete Guide for Indians",
            "type": "Article",
            "category": "Air Pollution",
            "readTime": "6 min read",
            "summary": "India's National AQI has 6 categories: Good (0-50), Satisfactory (51-100), Moderate (101-200), Poor (201-300), Very Poor (301-400), Severe (401+). Learn what each means for your health.",
            "url": "https://app.cpcbccr.com/AQI_India/",
            "source": "CPCB India",
            "image": "",
            "tags": ["Air Pollution", "AQI", "Health"]
        },
        {
            "id": 7,
            "title": "Monsoon Flood Safety: What to Do Before and During",
            "type": "Article",
            "category": "Water / Floods",
            "readTime": "7 min read",
            "summary": "India's flood-prone areas see 10+ million people displaced annually. IMD issues flood watches via color-coded alerts. This guide explains the alert system and how to stay safe.",
            "url": "https://mausam.imd.gov.in/",
            "source": "IMD India",
            "image": "",
            "tags": ["Floods", "Monsoon", "Safety"]
        },
        {
            "id": 8,
            "title": "ISRO Satellite Data: Monitoring India's Environment",
            "type": "Article",
            "category": "Technology",
            "readTime": "9 min read",
            "summary": "ISRO's Resourcesat, Cartosat, and INSAT series satellites monitor deforestation, fires, floods, and air quality across India. Bhuvan portal provides free access to this data.",
            "url": "https://bhuvan.nrsc.gov.in/",
            "source": "ISRO / NRSC",
            "image": "",
            "tags": ["ISRO", "Technology", "Satellite"]
        }
    ]

    # Filter by topic if provided
    if topic and topic.lower() not in ["environment india", "all", ""]:
        topic_lower = topic.lower()
        filtered = [a for a in curated if 
                   topic_lower in a["category"].lower() or 
                   topic_lower in a["title"].lower() or
                   any(topic_lower in tag.lower() for tag in a.get("tags", []))]
        if filtered:
            curated = filtered

    # Fetch YouTube videos
    import external_api_service
    videos = external_api_service.search_environmental_videos(topic or "India environment pollution")

    return {
        "articles": curated,
        "videos": videos,
        "total": len(curated)
    }

# ─────────────────────────────────────────────
# OTHER ENDPOINTS
# ─────────────────────────────────────────────

@app.post("/api/chat")
def chat_endpoint(req: ChatRequest):
    messages_dict = [{"role": msg.role, "content": msg.content} for msg in req.messages]
    response_text = ai_service.chat_assistant(messages_dict)
    return {"response": response_text}

@app.get("/api/events")
def get_events(db: Session = Depends(get_db)):
    return db.query(models.Event).all()

@app.get("/api/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    return db.query(models.User).order_by(models.User.eco_points.desc()).all()

@app.get("/api/admin/incidents")
def get_admin_incidents(db: Session = Depends(get_db)):
    return db.query(models.Report).order_by(models.Report.created_at.desc()).all()

@app.get("/api/admin/missions")
def get_admin_missions(db: Session = Depends(get_db)):
    missions = db.query(models.Mission, models.Report).join(models.Report, models.Mission.report_id == models.Report.id).order_by(models.Mission.created_at.desc()).all()
    result = []
    for m, r in missions:
        result.append({
            "id": m.id,
            "mission_name": m.mission_name,
            "suggested_resources": json.loads(m.suggested_resources),
            "estimated_time": m.estimated_time,
            "expected_aqi_improvement": m.expected_aqi_improvement,
            "status": m.status,
            "report_category": r.category,
            "report_location": r.location_name,
            "report_priority": r.priority
        })
    return result

@app.get("/api/analytics")
def get_analytics():
    return {
        "active_hotspots": 142,
        "reports_increase": 18,
        "avg_resolution_hrs": 4.2,
        "ai_predictions": 456,
        "aqi_trend": [
            {"name": "Mon", "aqi": 120}, {"name": "Tue", "aqi": 180},
            {"name": "Wed", "aqi": 240}, {"name": "Thu", "aqi": 310},
            {"name": "Fri", "aqi": 280}, {"name": "Sat", "aqi": 190},
            {"name": "Sun", "aqi": 150},
        ],
        "category_reports": [
            {"name": "Garbage", "count": 45}, {"name": "Dust", "count": 32},
            {"name": "Traffic", "count": 28}, {"name": "Water", "count": 15},
        ]
    }

@app.get("/api/videos")
def get_videos(topic: str = "environmental cleanup India"):
    import external_api_service
    videos = external_api_service.search_environmental_videos(topic)
    return {"videos": videos}
