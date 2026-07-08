from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True, nullable=True) # Maps to Firebase User
    name = Column(String, index=True, nullable=True)
    username = Column(String, unique=True, index=True, nullable=True) # Null until onboarding is complete
    eco_points = Column(Integer, default=0)
    level = Column(String, default="Seed")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    category = Column(String, index=True)
    # Valid categories: Garbage Fire, Construction Dust, Industrial Emissions, Vehicle Smoke,
    # Open Waste, Plastic Waste, Water Pollution, Flooding, Burning Leaves, Chemical Spill,
    # Smoke/Haze, Industrial Smoke, Heat Alert, Crime/Safety, Other
    description = Column(String)
    location_name = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    aqi = Column(Integer)
    confidence = Column(Float)
    verified = Column(Boolean, default=False)
    
    # Trust & Verification Engine Additions
    trust_score = Column(Integer, default=0)
    trust_reason = Column(String)
    
    # Environmental Risk Index (ERI)
    eri_score = Column(Integer, default=0)
    eri_category = Column(String)
    
    # Media & Social
    image_url = Column(String, nullable=True)
    likes = Column(Integer, default=0)
    username = Column(String, nullable=True)  # Reporter's username

    # Phase 5 Additions: Incident Queue
    priority = Column(String, default="Pending") # Emergency, Critical, High, Medium, Low, Rejected
    status = Column(String, default="Open") # Open, Assigned, Resolved, Archived
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Post(Base):
    """Twitter-like user posts with location and proof photos."""
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    username = Column(String, nullable=True)
    content = Column(Text)  # Up to 280 chars
    category = Column(String, index=True)  # Pollution, Smoke, Crime/Safety, Water Issue, Heat Alert
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    location_name = Column(String, nullable=True)
    image_url = Column(String, nullable=True)  # Proof photo
    likes = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Hotspot(Base):
    __tablename__ = "hotspots"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    lat = Column(Float)
    lng = Column(Float)
    radius = Column(Float, default=2.0) # km radius
    severity = Column(String, default="High")
    active_reports_count = Column(Integer, default=1)
    status = Column(String, default="Active") # Active, Resolved
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    organizer = Column(String)
    date_str = Column(String)
    location = Column(String)
    participants = Column(Integer, default=0)
    image_color = Column(String)

class Mission(Base):
    __tablename__ = "missions"
    
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"))
    mission_name = Column(String)
    suggested_resources = Column(String) # JSON list
    estimated_time = Column(String)
    expected_aqi_improvement = Column(String)
    status = Column(String, default="Unassigned") # Unassigned, In Progress, Completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
