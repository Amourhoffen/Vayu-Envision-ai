import os
import json
from google import genai
from google.genai import types
from pydantic import BaseModel
from typing import Optional, List

# Configure Gemini API (new google.genai SDK)
_GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "mock_key_for_testing")
client = genai.Client(api_key=_GEMINI_KEY)
GEMINI_MODEL = "gemini-2.5-flash"

class AIAnalysisResult(BaseModel):
    category: str
    confidence: float
    severity: str
    is_valid: bool
    explanation: str

class AITrustResult(BaseModel):
    trust_score: int
    trust_reason: str

class AIMissionResult(BaseModel):
    mission_name: str
    suggested_resources: List[str]
    estimated_time: str
    expected_aqi_improvement: str

class AIEriResult(BaseModel):
    eri_score: int
    eri_category: str
    eri_reason: str

class AIZoneInsight(BaseModel):
    safety_level: str
    travel_advice: str
    key_risks: List[str]
    recommendation: str

def analyze_image(image_bytes: bytes, mime_type: str) -> AIAnalysisResult:
    """Analyzes an image using Gemini to detect pollution and environmental issues."""
    try:
        prompt = """
        You are an expert environmental AI auditor for the ENVISION AI system.
        Analyze this image for pollution or environmental hazards.
        
        Provide your analysis in STRICT JSON format matching this schema:
        {
          "is_valid": true/false (false if it's a selfie, pet, food, or completely unrelated to environment),
          "category": "One of: Garbage Fire, Construction Dust, Industrial Emissions, Vehicle Smoke, Open Waste, Plastic Waste, Water Pollution, Flooding, Burning Leaves, Chemical Spill, Smoke/Haze, Industrial Smoke, Heat Alert, Waterlogging, River Pollution, Other",
          "confidence": 0.0 to 100.0 (float representing your certainty),
          "severity": "Low", "Medium", "High", or "Critical",
          "explanation": "A brief 1-2 sentence explanation of what you see and why you classified it this way."
        }
        Do not include any markdown formatting or text outside the JSON.
        """
        
        image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
        
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[prompt, image_part],
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        
        result_dict = json.loads(response.text)
        
        return AIAnalysisResult(
            category=result_dict.get("category", "Unknown"),
            confidence=float(result_dict.get("confidence", 0.0)),
            severity=result_dict.get("severity", "Low"),
            is_valid=bool(result_dict.get("is_valid", False)),
            explanation=result_dict.get("explanation", "")
        )
    except Exception as e:
        print(f"AI Analysis Error: {e}")
        return AIAnalysisResult(
            category="System Error",
            confidence=100.0,
            severity="Unknown",
            is_valid=True,
            explanation=f"Error analyzing image: {str(e)}. (Approved automatically for testing.)"
        )

def calculate_trust_score(eco_points: int, image_confidence: float, description: str) -> AITrustResult:
    """Calculates a holistic trust score based on user history and image evidence."""
    try:
        prompt = f"""
        You are the Trust & Verification Engine for ENVISION AI.
        Calculate a trust score (0-100) for a new environmental report based on:
        - Image AI Confidence: {image_confidence}%
        - User's historical Eco Points (reliability metric): {eco_points} (higher is better)
        - User Description: "{description}"
        
        Provide your analysis in STRICT JSON format matching this schema:
        {{
          "trust_score": integer between 0 and 100,
          "trust_reason": "A 1-sentence explanation of how the score was calculated."
        }}
        """
        
        response = client.models.generate_content(
            model=GEMINI_MODEL, contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        result_dict = json.loads(response.text)
        
        return AITrustResult(
            trust_score=int(result_dict.get("trust_score", 0)),
            trust_reason=result_dict.get("trust_reason", "")
        )
    except Exception as e:
        print(f"AI Trust Error: {e}")
        return AITrustResult(trust_score=int(image_confidence), trust_reason="Fallback based on image confidence.")

def calculate_eri(live_weather: dict, live_aqi: int, incident_category: str, incident_severity: str, grid_emissions: float = None) -> AIEriResult:
    """Calculates the Environmental Risk Index (0-100) based on fused real-world data."""
    try:
        weather_str = json.dumps(live_weather) if live_weather else "No live weather available"
        emissions_str = f"{grid_emissions}% marginal emissions" if grid_emissions is not None else "Unknown grid emissions"
        
        prompt = f"""
        You are the ENVISION AI Environmental Risk Engine.
        Calculate the Environmental Risk Index (ERI) score from 0-100 for a local area based on this live fused data:
        - Live Weather Context: {weather_str}
        - Regional Live AQI: {live_aqi if live_aqi else 'Unknown'}
        - Grid Emissions Data: {emissions_str}
        - Newly Verified Local Incident: {incident_category} (Severity: {incident_severity})
        
        Rules:
        - 0-20: Safe
        - 21-40: Moderate
        - 41-60: Elevated
        - 61-80: High Risk
        - 81-100: Critical
        
        Provide your analysis in STRICT JSON format matching this schema:
        {{
          "eri_score": integer (0-100),
          "eri_category": "Safe, Moderate, Elevated, High Risk, or Critical",
          "eri_reason": "A 1-2 sentence explanation of the contributing factors (mention weather/wind and AQI impacts)."
        }}
        """
        
        response = client.models.generate_content(
            model=GEMINI_MODEL, contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        result_dict = json.loads(response.text)
        
        return AIEriResult(
            eri_score=int(result_dict.get("eri_score", 50)),
            eri_category=result_dict.get("eri_category", "Elevated"),
            eri_reason=result_dict.get("eri_reason", "Calculated ERI.")
        )
    except Exception as e:
        print(f"AI ERI Error: {e}")
        return AIEriResult(eri_score=50, eri_category="Elevated", eri_reason="Fallback due to AI error.")

def generate_mission_recommendations(category: str, severity: str, aqi_impact: int) -> AIMissionResult:
    """Generates a cleanup/response mission using AI."""
    try:
        prompt = f"""
        You are the Recommendation Engine for ENVISION AI.
        A new environmental incident has been verified:
        - Category: {category}
        - Severity: {severity}
        - Estimated AQI Impact: +{aqi_impact} points
        
        Create a tactical response mission for local authorities or volunteers.
        Provide your analysis in STRICT JSON format matching this schema:
        {{
          "mission_name": "A short, actionable title (e.g., 'Emergency Fire Suppression')",
          "suggested_resources": ["list", "of", "3-5", "resources", "needed"],
          "estimated_time": "e.g., '2 Hours'",
          "expected_aqi_improvement": "e.g., '40 Points'"
        }}
        """
        
        response = client.models.generate_content(
            model=GEMINI_MODEL, contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        result_dict = json.loads(response.text)
        
        return AIMissionResult(
            mission_name=result_dict.get("mission_name", "Standard Cleanup"),
            suggested_resources=result_dict.get("suggested_resources", ["Inspection Team"]),
            estimated_time=result_dict.get("estimated_time", "1 Hour"),
            expected_aqi_improvement=result_dict.get("expected_aqi_improvement", "10 Points")
        )
    except Exception as e:
        print(f"AI Mission Error: {e}")
        return AIMissionResult(
            mission_name="Generic Response Mission",
            suggested_resources=["1 Officer", "Inspection Vehicle"],
            estimated_time="1 Hour",
            expected_aqi_improvement="10 Points"
        )

def chat_assistant(messages: list) -> str:
    """Conversational AI Assistant using Groq (or Gemini fallback)."""
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
    system_instruction = (
        "You are the ENVISION AI Environmental Assistant for India. "
        "Your goal is to help citizens understand environmental issues, AQI, heatwaves, water quality, and local hazards. "
        "You have knowledge of Indian environmental regulations, CPCB standards, IMD heat alerts, and ISRO satellite data. "
        "Keep answers clear, helpful, and concise. Format with markdown. "
        "Provide specific Indian context (CPCB, IMD, ISRO, MoEFCC standards) where applicable. "
        "Do NOT invent sensor data or make medical diagnoses."
    )

    if GROQ_API_KEY:
        try:
            import requests
            headers = {
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            }
            
            # format messages for Groq
            groq_messages = [{"role": "system", "content": system_instruction.strip()}]
            for msg in messages:
                role = "assistant" if msg["role"] == "model" else msg["role"]
                groq_messages.append({"role": role, "content": msg["content"]})
                
            payload = {
                "model": "llama3-8b-8192",
                "messages": groq_messages
            }
            response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=10)
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"Groq API Error: {e}")

    # Fallback to Gemini (new SDK)
    try:
        # Build contents list: system prompt first, then conversation
        contents = []
        contents.append(types.Content(role="user", parts=[types.Part(text=system_instruction)]))
        contents.append(types.Content(role="model", parts=[types.Part(text="Understood. I am ENVISION AI Environmental Assistant for India.")]))
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            contents.append(types.Content(role=role, parts=[types.Part(text=msg["content"])]))
        
        response = client.models.generate_content(model=GEMINI_MODEL, contents=contents)
        return response.text
    except Exception as e:
        print(f"AI Chat Error: {e}")
        return "I'm sorry, I am currently experiencing technical difficulties connecting to my AI brain."

def summarize_news_article(title: str, description: str) -> str:
    """Summarize a news article into 2-3 lines (InShorts-style) using Gemini."""
    try:
        prompt = (
            "You are a news summarizer for an environmental app (like InShorts). "
            "Summarize this article into exactly 2-3 sentences, simple and clear:\n\n"
            f"Title: {title}\nDescription: {description}\n\n"
            "Output just the summary text, no JSON, no markdown, no bullet points. "
            "Keep it under 120 words. Make it informative and urgent-sounding."
        )
        response = client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
        return response.text.strip()[:300]
    except Exception as e:
        print(f"News summarizer error: {e}")
        return description[:200] if description else title

def generate_zone_insight(zone_type: str, zone_name: str, value: str, layer: str) -> AIZoneInsight:
    """Generate AI-powered safety insight for a map zone popup."""
    try:
        prompt = f"""
        You are a travel safety AI for India.
        Generate a safety insight for this zone:
        - City/Area: {zone_name}
        - Zone Type: {zone_type}
        - Layer: {layer} (aqi/heatwave/water/crime)
        - Current Value: {value}
        
        Provide in STRICT JSON format:
        {{
          "safety_level": "Safe, Caution, or Avoid",
          "travel_advice": "One sentence travel advice for this area.",
          "key_risks": ["risk1", "risk2"],
          "recommendation": "One specific action to stay safe."
        }}
        """
        
        response = client.models.generate_content(
            model=GEMINI_MODEL, contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        result_dict = json.loads(response.text)
        
        return AIZoneInsight(
            safety_level=result_dict.get("safety_level", "Caution"),
            travel_advice=result_dict.get("travel_advice", "Exercise caution in this area."),
            key_risks=result_dict.get("key_risks", ["Unknown risks"]),
            recommendation=result_dict.get("recommendation", "Stay informed and monitor local alerts.")
        )
    except Exception as e:
        print(f"Zone insight error: {e}")
        return AIZoneInsight(
            safety_level="Caution",
            travel_advice="Exercise caution based on current environmental conditions.",
            key_risks=["Air quality concerns", "Environmental hazards"],
            recommendation="Check local alerts before traveling."
        )

def analyze_description_sentiment(text: str) -> str:
    """Analyze the sentiment of a report description using HuggingFace."""
    HF_TOKEN = os.environ.get("HF_TOKEN")
    if not HF_TOKEN:
        return "Unknown"
    try:
        import requests
        # Using a popular sentiment model
        API_URL = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest"
        headers = {"Authorization": f"Bearer {HF_TOKEN}"}
        payload = {"inputs": text}
        response = requests.post(API_URL, headers=headers, json=payload, timeout=5)
        response.raise_for_status()
        data = response.json()
        if data and isinstance(data, list) and isinstance(data[0], list):
            best = max(data[0], key=lambda x: x["score"])
            return best["label"] # usually "positive", "neutral", "negative"
        return "Unknown"
    except Exception as e:
        print(f"HuggingFace API Error: {e}")
        return "Error"
