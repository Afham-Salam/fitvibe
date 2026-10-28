import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import stylist from './routes/stylist.js'

const root = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(root, '../../.env') })
const app = express()
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.get('/api/health', (_req, res) => res.json({ ok: true, aiConfigured: Boolean(process.env.GEMINI_API_KEY) }))
app.use('/api/style', stylist)
app.use('/api', (_req, res) => res.status(404).json({ message: 'API route not found.' }))
app.use(express.static(path.resolve(root, '../../client/dist')))
app.get('*', (_req, res) => res.sendFile(path.resolve(root, '../../client/dist/index.html')))
app.use((error, _req, res, _next) => {
  const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : error.name === 'MulterError' ? 400 : error.status || 500
  res.status(status).json({ message: error.code === 'LIMIT_FILE_SIZE' ? 'Choose an image smaller than 8 MB.' : status === 500 ? 'Something went wrong. Please try again.' : error.message })
})
app.listen(process.env.PORT || 5000, () => console.log(`FitVibe API listening on port ${process.env.PORT || 5000}`))
