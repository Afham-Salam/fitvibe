import mongoose from 'mongoose'

const outfitSchema = new mongoose.Schema({
  name: { type: String, default: 'New outfit' },
  itemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  occasion: { type: String, default: 'Everyday' },
  scheduledFor: { type: Date, default: null },
  notes: { type: String, default: '' },
}, { timestamps: true })

export default mongoose.model('Outfit', outfitSchema)
