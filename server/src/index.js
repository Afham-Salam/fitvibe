import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import items from './routes/items.js'
import outfits from './routes/outfits.js'
import Item from './models/Item.js'
import { getWeather } from './services/weather.js'

const app = express()
const root = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(root, '../../.env') })
const configuredPort = process.env.PORT || 5000
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))
app.use('/uploads', express.static(path.resolve(root, '../uploads')))

app.get('/api/health', (_req, res) => res.json({ ok: true, database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }))
app.use('/api/items', items)
app.use('/api/outfits', outfits)
app.get('/api/weather', async (req, res, next) => {
  try { res.json(await getWeather(req.query.lat, req.query.lon)) } catch (error) { next(error) }
})
app.get('/api/recommendations', async (req, res, next) => {
  try {
    const wardrobe = await Item.find()
    const groups = ['Tops', 'Bottoms', 'Shoes']
    const suggestions = groups.map((category) => wardrobe.find((item) => item.category === category)).filter(Boolean)
    if (suggestions.length < 2) return res.json({ items: [], message: 'Add a top, bottom, and shoes to start getting outfit ideas.' })
    res.json({ items: suggestions, occasion: req.query.occasion || 'Everyday', rationale: 'A balanced look from pieces already in your wardrobe.' })
  } catch (error) { next(error) }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  if (error.name === 'MulterError') return res.status(400).json({ message: error.code === 'LIMIT_FILE_SIZE' ? 'Images must be 8 MB or smaller.' : error.message })
  if (error.message?.startsWith('Please upload')) return res.status(400).json({ message: error.message })
  res.status(500).json({ message: error.message || 'Something went wrong.' })
})

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((error) => console.error('MongoDB connection failed:', error.message))
} else console.warn('MONGODB_URI is not configured; database routes will be unavailable.')

app.listen(configuredPort, () => console.log(`FitVibe API listening on http://localhost:${configuredPort}`))
