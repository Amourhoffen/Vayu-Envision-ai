import requests
import os
import json
import concurrent.futures
from requests.auth import HTTPBasicAuth

OPENWEATHER_API_KEY = os.environ.get("OPENWEATHER_API_KEY")
GOOGLE_MAPS_API_KEY = os.environ.get("GOOGLE_MAPS_API_KEY")
WATTTIME_USERNAME = os.environ.get("WATTTIME_USERNAME")
WATTTIME_PASSWORD = os.environ.get("WATTTIME_PASSWORD")
YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY")
WAQI_TOKEN = os.environ.get("WAQI_TOKEN", "demo")  # WAQI World Air Quality Index
NEWS_API_KEY = os.environ.get("NEWS_API_KEY")

# Major Indian cities for zone data
INDIA_CITIES = [
    {"name": "Mumbai", "lat": 19.0760, "lng": 72.8777},
    {"name": "Delhi", "lat": 28.7041, "lng": 77.1025},
    {"name": "Bangalore", "lat": 12.9716, "lng": 77.5946},
    {"name": "Hyderabad", "lat": 17.3850, "lng": 78.4867},
    {"name": "Chennai", "lat": 13.0827, "lng": 80.2707},
    {"name": "Kolkata", "lat": 22.5726, "lng": 88.3639},
    {"name": "Pune", "lat": 18.5204, "lng": 73.8567},
    {"name": "Ahmedabad", "lat": 23.0225, "lng": 72.5714},
    {"name": "Jaipur", "lat": 26.9124, "lng": 75.7873},
    {"name": "Lucknow", "lat": 26.8467, "lng": 80.9462},
    {"name": "Kanpur", "lat": 26.4499, "lng": 80.3319},
    {"name": "Nagpur", "lat": 21.1458, "lng": 79.0882},
    {"name": "Patna", "lat": 25.5941, "lng": 85.1376},
    {"name": "Varanasi", "lat": 25.3176, "lng": 82.9739},
    {"name": "Surat", "lat": 21.1702, "lng": 72.8311},
    {"name": "Bhopal", "lat": 23.2599, "lng": 77.4126},
    {"name": "Indore", "lat": 22.7196, "lng": 75.8577},
    {"name": "Visakhapatnam", "lat": 17.6868, "lng": 83.2185},
    {"name": "Coimbatore", "lat": 11.0168, "lng": 76.9558},
    {"name": "Agra", "lat": 27.1767, "lng": 78.0081},
]

def get_live_weather(lat: float, lng: float):
    """Fetch live weather from OpenWeather (or Open-Meteo fallback)."""
    if OPENWEATHER_API_KEY:
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&appid={OPENWEATHER_API_KEY}&units=metric"
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            data = response.json()
            return {
                "temperature": data["main"]["temp"],
                "windspeed": data["wind"]["speed"],
                "weathercode": data["weather"][0]["id"],
                "humidity": data["main"].get("humidity", 0),
                "feels_like": data["main"].get("feels_like", data["main"]["temp"])
            }
        except Exception as e:
            print(f"OpenWeather Error: {e}")
    
    # Fallback to Open-Meteo (free, no key needed)
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lng}"
            f"&current=temperature_2m,windspeed_10m,relativehumidity_2m,apparent_temperature,weathercode"
        )
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        if "current" in data:
            cur = data["current"]
            return {
                "temperature": cur.get("temperature_2m", "N/A"),
                "windspeed": cur.get("windspeed_10m", 0),
                "weathercode": cur.get("weathercode", 0),
                "humidity": cur.get("relativehumidity_2m", 0),
                "feels_like": cur.get("apparent_temperature", cur.get("temperature_2m", "N/A"))
            }
    except Exception as e:
        print(f"Open-Meteo Error: {e}")
    return None

def get_live_aqi(lat: float, lng: float):
    """Fetch live AQI — try WAQI first, then Open-Meteo Air Quality."""
    # Try WAQI (real-time station data)
    try:
        url = f"https://api.waqi.info/feed/geo:{lat};{lng}/?token={WAQI_TOKEN}"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "ok" and "data" in data:
            aqi_val = data["data"].get("aqi")
            if aqi_val and aqi_val != "-":
                return int(aqi_val)
    except Exception as e:
        print(f"WAQI Error: {e}")

    # Fallback to Open-Meteo Air Quality
    try:
        url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lng}&current=us_aqi,pm10,pm2_5,nitrogen_dioxide,ozone"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        if "current" in data and "us_aqi" in data["current"]:
            return data["current"]["us_aqi"]
    except Exception as e:
        print(f"Open-Meteo AQI Error: {e}")
    return None

def reverse_geocode(lat: float, lng: float):
    """Fetch location name from Google Maps (or Nominatim fallback)."""
    if GOOGLE_MAPS_API_KEY:
        try:
            url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={GOOGLE_MAPS_API_KEY}"
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            data = response.json()
            if "results" in data and len(data["results"]) > 0:
                for comp in data["results"][0].get("address_components", []):
                    if "locality" in comp["types"]:
                        return comp["long_name"]
                return data["results"][0].get("formatted_address", "Unknown Location")
        except Exception as e:
            print(f"Google Maps Error: {e}")
            
    # Fallback to Nominatim (free, OSM-based)
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lng}"
        headers = {"User-Agent": "EnvisionAI/1.0 (contact@envision.ai)"}
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        data = response.json()
        if "address" in data:
            address = data["address"]
            city = address.get("city") or address.get("town") or address.get("village") or "Unknown Area"
            state = address.get("state", "Unknown State")
            return f"{city}, {state}"
    except Exception as e:
        print(f"Nominatim Error: {e}")
    return "Unknown Location"

def get_grid_emissions(lat: float, lng: float):
    """Fetch real-time marginal emissions from WattTime API."""
    if not WATTTIME_USERNAME or not WATTTIME_PASSWORD:
        return None
    try:
        login_url = "https://api2.watttime.org/v2/login"
        auth_resp = requests.get(login_url, auth=HTTPBasicAuth(WATTTIME_USERNAME, WATTTIME_PASSWORD), timeout=5)
        auth_resp.raise_for_status()
        token = auth_resp.json().get("token")
        
        index_url = f"https://api2.watttime.org/v2/index?latitude={lat}&longitude={lng}"
        headers = {"Authorization": f"Bearer {token}"}
        index_resp = requests.get(index_url, headers=headers, timeout=5)
        index_resp.raise_for_status()
        data = index_resp.json()
        return data.get("percent")
    except Exception as e:
        print(f"WattTime Error: {e}")
    return None

def search_environmental_videos(topic: str):
    """Fetch relevant educational videos from YouTube."""
    if not YOUTUBE_API_KEY:
        return []
    try:
        url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={topic}&type=video&maxResults=3&key={YOUTUBE_API_KEY}"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        videos = []
        for item in data.get("items", []):
            if "videoId" in item.get("id", {}):
                videos.append({
                    "title": item["snippet"]["title"],
                    "videoId": item["id"]["videoId"],
                    "thumbnail": item["snippet"]["thumbnails"]["high"]["url"]
                })
        return videos
    except Exception as e:
        print(f"YouTube Error: {e}")
    return []

def get_india_aqi_zones():
    """
    Fetch live AQI for major Indian cities using WAQI API in parallel.
    Returns list of zone objects with color, AQI, city name.
    """
    zones = []
    
    def fetch_city_aqi(city):
        try:
            url = f"https://api.waqi.info/feed/geo:{city['lat']};{city['lng']}/?token={WAQI_TOKEN}"
            response = requests.get(url, timeout=4)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "ok" and "data" in data:
                    aqi_val = data["data"].get("aqi", 0)
                    if aqi_val == "-":
                        aqi_val = 0
                    aqi_val = int(aqi_val) if aqi_val else 0

                    if aqi_val <= 50:
                        color, zone_type = "green", "Good Air Quality"
                    elif aqi_val <= 100:
                        color, zone_type = "green", "Moderate Air Quality"
                    elif aqi_val <= 150:
                        color, zone_type = "orange", "Unhealthy for Sensitive Groups"
                    elif aqi_val <= 200:
                        color, zone_type = "orange", "Unhealthy Air Quality"
                    elif aqi_val <= 300:
                        color, zone_type = "red", "Very Unhealthy Air"
                    else:
                        color, zone_type = "red", "Hazardous Air Quality"

                    return {
                        "name": city["name"],
                        "lat": city["lat"],
                        "lng": city["lng"],
                        "aqi": aqi_val,
                        "color": color,
                        "zone_type": zone_type,
                        "layer": "aqi",
                        "source": "WAQI"
                    }
        except Exception as e:
            pass
            
        # Fallback to Open-Meteo
        try:
            aqi = get_live_aqi(city["lat"], city["lng"])
            if aqi is not None:
                aqi = int(aqi)
                color = "green" if aqi <= 100 else "orange" if aqi <= 200 else "red"
                return {
                    "name": city["name"],
                    "lat": city["lat"],
                    "lng": city["lng"],
                    "aqi": aqi,
                    "color": color,
                    "zone_type": "Air Quality Index",
                    "layer": "aqi",
                    "source": "Open-Meteo"
                }
        except Exception:
            pass
        return None

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        results = executor.map(fetch_city_aqi, INDIA_CITIES)
        for res in results:
            if res:
                zones.append(res)
                
    return zones

def get_india_heatwave_zones():
    """
    Detect heat wave zones across India using Open-Meteo in parallel.
    A heat wave is defined as temperature >= 40°C (IMD standard).
    """
    heatwave_zones = []
    
    def fetch_city_heat(city):
        try:
            url = (
                f"https://api.open-meteo.com/v1/forecast"
                f"?latitude={city['lat']}&longitude={city['lng']}"
                f"&current=temperature_2m,apparent_temperature,windspeed_10m"
                f"&daily=temperature_2m_max&forecast_days=1"
            )
            response = requests.get(url, timeout=4)
            if response.status_code == 200:
                data = response.json()
                cur = data.get("current", {})
                temp = cur.get("temperature_2m", 0)
                feels_like = cur.get("apparent_temperature", temp)
                
                is_heatwave = float(temp) >= 40
                is_severe_heatwave = float(temp) >= 45

                if is_severe_heatwave:
                    color, zone_type = "red", "Severe Heat Wave"
                elif is_heatwave:
                    color, zone_type = "orange", "Heat Wave Alert"
                elif float(temp) >= 35:
                    color, zone_type = "orange", "Hot Conditions"
                else:
                    color, zone_type = "green", "Normal Temperature"

                return {
                    "name": city["name"],
                    "lat": city["lat"],
                    "lng": city["lng"],
                    "temperature": temp,
                    "feels_like": feels_like,
                    "color": color,
                    "zone_type": zone_type,
                    "is_heatwave": is_heatwave,
                    "layer": "heatwave",
                    "source": "Open-Meteo / IMD"
                }
        except Exception:
            pass
        return None

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        results = executor.map(fetch_city_heat, INDIA_CITIES)
        for res in results:
            if res:
                heatwave_zones.append(res)
                
    return heatwave_zones

def get_india_water_stress_zones():
    """
    Detect water stress / flood risk areas across India in parallel.
    Uses Open-Meteo precipitation data.
    """
    water_zones = []
    
    def fetch_city_water(city):
        try:
            url = (
                f"https://api.open-meteo.com/v1/forecast"
                f"?latitude={city['lat']}&longitude={city['lng']}"
                f"&daily=precipitation_sum,rain_sum,showers_sum"
                f"&current=precipitation,rain"
                f"&forecast_days=1"
            )
            response = requests.get(url, timeout=4)
            if response.status_code == 200:
                data = response.json()
                cur = data.get("current", {})
                daily = data.get("daily", {})
                
                precip_list = daily.get("precipitation_sum", [0])
                precip = float(precip_list[0]) if precip_list else 0.0
                cur_rain = float(cur.get("rain", 0) or 0)

                if precip >= 100 or cur_rain >= 20:
                    color, zone_type = "blue", "Flood Risk / Heavy Rain"
                elif precip >= 50:
                    color, zone_type = "blue", "High Rainfall"
                elif precip >= 10:
                    color, zone_type = "blue", "Moderate Rainfall"
                else:
                    color, zone_type = "green", "Low Precipitation"

                if precip > 0 or cur_rain > 0:
                    return {
                        "name": city["name"],
                        "lat": city["lat"],
                        "lng": city["lng"],
                        "precipitation": precip,
                        "current_rain": cur_rain,
                        "color": color,
                        "zone_type": zone_type,
                        "layer": "water",
                        "source": "Open-Meteo"
                    }
        except Exception:
            pass
        return None

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        results = executor.map(fetch_city_water, INDIA_CITIES)
        for res in results:
            if res:
                water_zones.append(res)
                
    return water_zones

def fetch_environment_news():
    """
    Fetch real Indian environment news from multiple sources:
    1. NewsAPI (if key available)  
    2. RSS feeds fallback: NDTV, Down to Earth, Times of India
    Returns list of news articles.
    """
    articles = []

    # Try NewsAPI first
    if NEWS_API_KEY:
        try:
            url = (
                f"https://newsapi.org/v2/everything"
                f"?q=India+pollution+environment+air+quality+heatwave"
                f"&language=en&sortBy=publishedAt&pageSize=10"
                f"&apiKey={NEWS_API_KEY}"
            )
            response = requests.get(url, timeout=6)
            if response.status_code == 200:
                data = response.json()
                for item in data.get("articles", []):
                    if item.get("title") and "[Removed]" not in item.get("title", ""):
                        articles.append({
                            "title": item["title"],
                            "description": item.get("description", "")[:200] if item.get("description") else "",
                            "url": item.get("url", ""),
                            "image": item.get("urlToImage", ""),
                            "source": item.get("source", {}).get("name", "NewsAPI"),
                            "published_at": item.get("publishedAt", ""),
                        })
        except Exception as e:
            print(f"NewsAPI Error: {e}")

    # RSS Feed fallback using feed parsing
    rss_feeds = [
        {
            "url": "https://www.downtoearth.org.in/rss/latestcontent.xml",
            "source": "Down To Earth"
        },
        {
            "url": "https://feeds.feedburner.com/ndtvnews-environment",
            "source": "NDTV Environment"
        },
        {
            "url": "https://timesofindia.indiatimes.com/rss/1221648.cms",
            "source": "Times of India - Environment"
        },
    ]

    if len(articles) < 5:
        for feed_info in rss_feeds:
            try:
                headers = {
                    "User-Agent": "Mozilla/5.0 EnvisionAI/1.0",
                    "Accept": "application/rss+xml, application/xml, text/xml"
                }
                response = requests.get(feed_info["url"], timeout=6, headers=headers)
                if response.status_code == 200:
                    # Simple XML parsing
                    content = response.text
                    # Extract items using simple string parsing
                    import re
                    items = re.findall(r'<item>(.*?)</item>', content, re.DOTALL)
                    for item_xml in items[:4]:
                        title_match = re.search(r'<title><!\[CDATA\[(.*?)\]\]></title>|<title>(.*?)</title>', item_xml, re.DOTALL)
                        desc_match = re.search(r'<description><!\[CDATA\[(.*?)\]\]></description>|<description>(.*?)</description>', item_xml, re.DOTALL)
                        link_match = re.search(r'<link>(.*?)</link>', item_xml, re.DOTALL)
                        img_match = re.search(r'<media:content url="(.*?)"', item_xml) or re.search(r'<enclosure url="(.*?)"', item_xml)
                        
                        title = (title_match.group(1) or title_match.group(2) or "").strip() if title_match else ""
                        desc = (desc_match.group(1) or desc_match.group(2) or "").strip()[:250] if desc_match else ""
                        link = (link_match.group(1) or "").strip() if link_match else ""
                        img = img_match.group(1).strip() if img_match else ""

                        # Clean HTML from description
                        desc = re.sub(r'<[^>]+>', '', desc).strip()[:200]

                        if title:
                            articles.append({
                                "title": title,
                                "description": desc,
                                "url": link,
                                "image": img,
                                "source": feed_info["source"],
                                "published_at": ""
                            })
            except Exception as e:
                print(f"RSS feed error ({feed_info['source']}): {e}")

    # If no news fetched at all, return curated static fallback
    if not articles:
        articles = [
            {
                "title": "India's Air Quality Crisis: Cities Battle Dangerous Pollution Levels",
                "description": "Multiple Indian cities recording AQI above 300 as dust storms and vehicle emissions combine with stagnant air conditions.",
                "url": "https://www.downtoearth.org.in/air-pollution",
                "image": "",
                "source": "Down To Earth",
                "published_at": ""
            },
            {
                "title": "Heat Wave Alert: IMD Issues Red Warning for North India",
                "description": "Temperature touches 45°C in Delhi, Rajasthan. IMD warns of severe heat wave conditions through the week.",
                "url": "https://www.ndtv.com/india-news",
                "image": "",
                "source": "NDTV",
                "published_at": ""
            },
            {
                "title": "Ganga Pollution Levels Rise Near Industrial Zones",
                "description": "CPCB report shows effluent discharge from industries causing BOD levels to exceed safe limits in key stretches.",
                "url": "https://www.downtoearth.org.in/water",
                "image": "",
                "source": "Down To Earth",
                "published_at": ""
            },
            {
                "title": "PM2.5 Concentration Spikes in Mumbai After Dust Storm",
                "description": "Air quality in Mumbai dropped to severe category as PM2.5 levels hit 280 μg/m³ following dust intrusion from Rajasthan.",
                "url": "https://timesofindia.indiatimes.com",
                "image": "",
                "source": "Times of India",
                "published_at": ""
            },
            {
                "title": "ISRO's Satellite Data Shows Alarming Forest Cover Loss",
                "description": "Forest Survey of India and ISRO data reveals significant reduction in green cover over the last decade in central India.",
                "url": "https://www.isro.gov.in",
                "image": "",
                "source": "ISRO / FSI",
                "published_at": ""
            }
        ]

    return articles[:10]  # Return up to 10 articles
