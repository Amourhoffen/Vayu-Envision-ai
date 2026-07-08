from database import SessionLocal, engine, Base
import models

# Recreate all tables
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Seed Users
users = [
    models.User(name="Priya Patel", username="priya_p", eco_points=2450, level="Earth Champion"),
    models.User(name="Rahul Sharma", username="rahul_s", eco_points=2100, level="Climate Hero"),
    models.User(name="Anita Desai", username="anita_d", eco_points=1890, level="Eco Warrior"),
    models.User(name="Jay Mehta", username="jaymehta_eco", eco_points=840, level="Green Guardian"),
    models.User(name="Vikram Singh", username="vik_singh", eco_points=720, level="Green Guardian"),
]
db.add_all(users)
db.commit()

# Seed Reports
reports = [
    models.Report(
        user_id=1, category="Industrial Smoke", description="Heavy industrial smoke detected.",
        location_name="Mumbai", lat=19.0760, lng=72.8777,
        aqi=320, confidence=98.5, verified=True, priority="Critical", status="Open"
    ),
    models.Report(
        user_id=4, category="Water Logging", description="Reported massive water logging causing severe traffic and potential health hazards.",
        location_name="Andheri East, Mumbai", lat=19.1136, lng=72.8697,
        aqi=110, confidence=89.2, verified=True, priority="High", status="Assigned"
    )
]
db.add_all(reports)
db.commit()

# Seed Missions
missions = [
    models.Mission(
        report_id=1, mission_name="Mission-2041",
        suggested_resources='["Mobile Air Purifier Unit", "Inspection Officer"]',
        estimated_time="1.5 Hours", expected_aqi_improvement="25-40 Points",
        status="Unassigned"
    ),
    models.Mission(
        report_id=2, mission_name="Mission-2042",
        suggested_resources='["Drainage Pump", "2 Cleaning Staff"]',
        estimated_time="45 Minutes", expected_aqi_improvement="N/A",
        status="In Progress"
    )
]
db.add_all(missions)

# Seed Events
events = [
    models.Event(title="Juhu Beach Cleanup", organizer="Ocean Guardians NGO", date_str="Sunday, Oct 15 • 7:00 AM", location="Juhu Beach, Mumbai", participants=124, image_color="bg-blue-500"),
    models.Event(title="Mega Plantation Drive", organizer="Green City Initiative", date_str="Saturday, Oct 21 • 9:00 AM", location="Sanjay Gandhi National Park", participants=340, image_color="bg-green-500"),
]
db.add_all(events)
db.commit()

db.close()
print("Database seeded successfully with new Phase 5 schema!")
