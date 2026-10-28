# FitVibe — photo to outfit ideas

A focused React + Express clothing matcher powered by Google Gemini. Upload a garment, choose an occasion and style preference, and get three complete outfit ideas, color palettes, styling explanations, and three similar-style suggestions. Save up to 30 favorite outfits in your browser.

## Setup

Requirements: Node.js 20+ and npm. Create an API key in [Google AI Studio](https://aistudio.google.com/apikey). Free-tier availability, regional access, and quotas depend on your Google account and selected model; unlimited free usage is not guaranteed.

1. Copy `.env.example` to `.env` if you do not already have one. Preserve any existing settings you need.
2. Add `GEMINI_API_KEY=your_key` to `.env`. Do not share or commit the key. Rotate a key if it has been exposed.
3. Optionally set `GEMINI_MODEL` (default: `gemini-3.1-flash-lite`) to an image-capable Gemini model available to your account. Model listing/access checks do not guarantee generation access: older models can still be listed after generation is closed to new users.
4. Install and start:

```bash
npm install
npm run dev
```

Open http://localhost:5173. The API runs on port 5000. Restart the API after changing `.env`. The key is used only on the server, never bundled into React.

## Usage

- Upload one JPG, PNG, or WEBP image, up to 8 MB.
- Choose the occasion and optional style preference.
- Add a short description to guide or correct garment recognition.
- Select **Find my matches**. Analysis can take up to a minute.
- Save an outfit using its heart button; view or remove it in **Saved**.

Images are held temporarily in server memory and sent to Google Gemini for analysis, subject to Google's applicable API data terms. FitVibe does not persist new uploaded images. Favorites contain outfit text and colors, not uploaded photos; they remain only in this browser and disappear if site storage is cleared.

Similar-style images are illustrative category references from Unsplash, not exact AI-generated previews or verified products. Reference images and fonts require external network access. Recommendations are subjective, and detected garment details can be corrected before retrying.

## Production

```bash
npm run build
npm start
```

Express serves `client/dist` and the API from http://localhost:5000. Set `PORT` and `CLIENT_ORIGIN` as needed. Use infrastructure-level request limits when publishing a shared API to control AI usage.

## Verification

```bash
npm test -w server
npm run build
```

`GET /api/health` reports whether a key is configured (not whether it is valid). `POST /api/style` takes multipart fields `image`, `occasion`, `preference`, and `correction`. Provider errors are sanitized; no key is returned to the browser.

The dashboard, wardrobe management, weather, and calendar have been removed from the app. MongoDB and the old local Python inference service are no longer required. Previous uploads and legacy backend source remain available, but their routes are not mounted.
