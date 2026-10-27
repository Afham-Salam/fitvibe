# FitVibe

**Your wardrobe, in rhythm.** FitVibe is a React + Express + MongoDB digital wardrobe with an optional local OpenCLIP image analyzer and weather-aware outfit planner.

## Run the app

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The API runs at [http://localhost:5000](http://localhost:5000).

The project includes a local `.env` for the MongoDB connection. Never commit that file. If you need a fresh configuration, copy `.env.example` to `.env` and set `MONGODB_URI`. Uploaded images are stored in `server/uploads` and the MongoDB documents store their paths. The app can show its sample wardrobe if the API or database is unavailable; persisted operations require MongoDB.

## Local image analysis (optional)

The core app works without model dependencies. To enable free, local image suggestions, install Python 3.10+ and start the inference service in another terminal:

```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 127.0.0.1 --port 8000
```

Set `AI_SERVICE_URL=http://127.0.0.1:8000` in `.env`, then restart the Node API. The first run downloads the OpenCLIP weights. The analyzer suggests a garment category, dominant color, and style; its results are stored for user review. For fashion-specific object detection, install Ultralytics and set `YOLO_WEIGHTS` to a compatible fashion model file. YOLO detection is optional because general-purpose model weights are not a reliable fashion classifier.

The current color estimate uses image-wide pixels. For isolated garments, a future segmentation/rembg step can improve it. Review each model and dataset license before commercial deployment; model downloads may have separate terms and local inference still needs CPU/GPU resources.

## Weather

The API fetches current and daily forecast data from Open-Meteo without an API key. It currently uses its default coordinates (New York) unless latitude/longitude query parameters are provided. Check Open-Meteo’s current terms and usage limits for your deployment context.

## Included

- Wardrobe item CRUD with image uploads, category filters, and search.
- Outfit suggestions based on wardrobe categories and save/schedule actions.
- Monthly outfit planner and Open-Meteo forecast display.
- MongoDB/Mongoose API for wardrobe items and saved/planned outfits.
- Optional OpenCLIP analysis API with an optional YOLO garment detector.

Virtual try-on is not included in this starter; it is a separate advanced integration with significant model/runtime and photo-storage requirements.
