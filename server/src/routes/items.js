import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import Item from '../models/Item.js'

const router = Router()
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
})
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  if (['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.mimetype)) cb(null, true)
  else cb(new Error('Please upload a JPG, PNG, WEBP, or AVIF image.'))
} })

router.get('/', async (_req, res, next) => {
  try { res.json(await Item.find().sort({ createdAt: -1 })) } catch (error) { next(error) }
})

router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    const { name, category, color, brand, season, occasion } = req.body
    if (!name?.trim() || !category) return res.status(400).json({ message: 'Name and category are required.' })
    let aiSuggestions = null
    if (req.file && process.env.AI_SERVICE_URL) {
      try {
        const form = new FormData()
        form.append('image', new Blob([await readFile(req.file.path)], { type: req.file.mimetype }), req.file.filename)
        const response = await fetch(`${process.env.AI_SERVICE_URL.replace(/\/$/, '')}/analyze`, { method: 'POST', body: form, signal: AbortSignal.timeout(45000) })
        if (response.ok) aiSuggestions = await response.json()
      } catch (error) { console.warn('Local image analysis unavailable:', error.message) }
    }
    const item = await Item.create({ name, category, color, brand, season, occasion, aiSuggestions, imageUrl: req.file ? `/uploads/${req.file.filename}` : '' })
    res.status(201).json(item)
  } catch (error) { next(error) }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, { ...req.body, aiStatus: 'confirmed' }, { new: true, runValidators: true })
    if (!item) return res.status(404).json({ message: 'Item not found.' })
    res.json(item)
  } catch (error) { next(error) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ message: 'Item not found.' })
    res.status(204).end()
  } catch (error) { next(error) }
})

export default router
