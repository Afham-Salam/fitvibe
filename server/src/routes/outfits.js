import { Router } from 'express'
import Outfit from '../models/Outfit.js'

const router = Router()
router.get('/', async (_req, res, next) => {
  try { res.json(await Outfit.find().populate('itemIds').sort({ scheduledFor: 1, createdAt: -1 })) } catch (error) { next(error) }
})
router.post('/', async (req, res, next) => {
  try {
    const { name, itemIds, occasion, scheduledFor, notes } = req.body
    if (!Array.isArray(itemIds) || itemIds.length < 2) return res.status(400).json({ message: 'Choose at least two wardrobe items.' })
    const outfit = await Outfit.create({ name, itemIds, occasion, scheduledFor: scheduledFor || null, notes })
    res.status(201).json(await outfit.populate('itemIds'))
  } catch (error) { next(error) }
})
router.delete('/:id', async (req, res, next) => {
  try { await Outfit.findByIdAndDelete(req.params.id); res.status(204).end() } catch (error) { next(error) }
})
export default router
