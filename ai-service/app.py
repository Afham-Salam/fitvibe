import io
import os
import numpy as np
import open_clip
import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image
from sklearn.cluster import KMeans

app = FastAPI(title='FitVibe local clothing analysis')
device = 'cuda' if torch.cuda.is_available() else 'cpu'
model, _, preprocess = open_clip.create_model_and_transforms(
    os.getenv('CLIP_MODEL', 'ViT-B-32'),
    pretrained=os.getenv('CLIP_PRETRAINED', 'laion2b_s34b_b79k'),
    device=device,
)
tokenizer = open_clip.get_tokenizer(os.getenv('CLIP_MODEL', 'ViT-B-32'))
model.eval()

labels = {
    'category': ['a photo of a shirt', 'a photo of a t-shirt', 'a photo of a sweater', 'a photo of a pair of jeans', 'a photo of trousers', 'a photo of a skirt', 'a photo of a dress', 'a photo of a jacket', 'a photo of a coat', 'a photo of shoes', 'a photo of sneakers', 'a photo of a handbag', 'a photo of an accessory'],
    'style': ['casual clothing', 'formal clothing', 'sporty clothing', 'vintage clothing', 'minimalist clothing', 'streetwear clothing', 'business clothing'],
}
category_names = ['Tops', 'Tops', 'Tops', 'Bottoms', 'Bottoms', 'Bottoms', 'Dresses', 'Outerwear', 'Outerwear', 'Shoes', 'Shoes', 'Accessories', 'Accessories']


def classify(image: Image.Image, prompts: list[str]) -> tuple[str, float]:
    tokens = tokenizer(prompts).to(device)
    image_tensor = preprocess(image).unsqueeze(0).to(device)
    with torch.no_grad():
        image_features = model.encode_image(image_tensor)
        text_features = model.encode_text(tokens)
        probabilities = (100.0 * image_features @ text_features.T).softmax(dim=-1)[0]
    index = int(probabilities.argmax())
    return prompts[index], float(probabilities[index])


def dominant_color(image: Image.Image) -> str:
    pixels = np.asarray(image.convert('RGB').resize((120, 120))).reshape(-1, 3)
    # Ignore near-white and near-black background pixels when other colors are present.
    brightness = pixels.mean(axis=1)
    garment_pixels = pixels[(brightness > 32) & (brightness < 245)]
    if len(garment_pixels) < 8:
        garment_pixels = pixels
    clusters = KMeans(n_clusters=min(3, len(garment_pixels)), n_init=3, random_state=7).fit(garment_pixels)
    rgb = clusters.cluster_centers_[int(np.argmax(np.bincount(clusters.labels_)))]
    r, g, b = (int(x) for x in rgb)
    if max(r, g, b) - min(r, g, b) < 22:
        return 'White' if (r + g + b) / 3 > 205 else 'Grey' if (r + g + b) / 3 > 85 else 'Black'
    if r > g * 1.25 and r > b * 1.2:
        return 'Red' if r < 190 else 'Coral'
    if g > r * 1.13 and g > b * 1.05:
        return 'Green'
    if b > r * 1.15 and b > g * 1.05:
        return 'Blue'
    if r > 165 and g > 120 and b < 120:
        return 'Tan'
    return 'Multicolor'


@app.get('/health')
def health():
    return {'ok': True, 'device': device, 'model': os.getenv('CLIP_MODEL', 'ViT-B-32')}


@app.post('/analyze')
async def analyze(image: UploadFile = File(...)):
    if not image.content_type or not image.content_type.startswith('image/'):
        raise HTTPException(status_code=415, detail='Upload an image file.')
    data = await image.read(8 * 1024 * 1024 + 1)
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(status_code=413, detail='Image must be 8 MB or smaller.')
    try:
        picture = Image.open(io.BytesIO(data)).convert('RGB')
    except Exception as error:
        raise HTTPException(status_code=400, detail='Could not read the image.') from error
    category_prompt, category_score = classify(picture, labels['category'])
    style_prompt, style_score = classify(picture, labels['style'])
    category_index = labels['category'].index(category_prompt)
    suggestions = {
        'category': category_names[category_index],
        'detectedLabel': category_prompt.replace('a photo of ', ''),
        'color': dominant_color(picture),
        'style': style_prompt.replace(' clothing', ''),
        'confidence': round(min(category_score, style_score), 3),
        'provider': 'OpenCLIP (local)',
    }
    weights = os.getenv('YOLO_WEIGHTS')
    if weights and os.path.isfile(weights):
        try:
            from ultralytics import YOLO
            detector = YOLO(weights)
            result = detector(picture, verbose=False)[0]
            suggestions['detections'] = [
                {'label': result.names[int(box.cls[0])], 'confidence': round(float(box.conf[0]), 3)}
                for box in result.boxes if float(box.conf[0]) >= 0.35
            ]
        except Exception as error:
            suggestions['detectorError'] = str(error)
    return suggestions
