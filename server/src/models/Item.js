import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'] },
  color: { type: String, default: 'Unspecified' },
  brand: { type: String, default: '' },
  season: { type: String, default: 'All season' },
  occasion: { type: String, default: 'Everyday' },
  imageUrl: { type: String, default: '' },
  wearCount: { type: Number, default: 0 },
  lastWorn: { type: Date, default: null },
  aiStatus: { type: String, enum: ['review', 'confirmed'], default: 'review' },
  aiSuggestions: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true })

export default mongoose.model('Item', itemSchema)
