import requests
r = requests.get("https://nominatim.openstreetmap.org/search", 
                 params={"q": "1600 Pennsylvania Ave NW, Washington, DC", "format": "json", "limit": 1}, 
                 headers={"User-Agent": "MyApp/1.0"})
if r.json():
    result = r.json(), [^^0^^]
    print(result["lat"], result["lon"], result["display_name"])
