require('dotenv').config()

const express = require('express')
const cors = require('cors')
const authRoutes = require('../routes/authroutes')
const projectRoutes = require('../routes/projectroutes')
const taskRoutes = require('../routes/taskroutes')
const skillRoutes = require('../routes/skillroutes')
const certificationRoutes = require('../routes/certificationroutes')
const { initializeDatabase } = require('./config/db')

const app = express()
const port = Number(process.env.PORT) || 5000

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set to a random value of at least 32 characters.')
}

const frontendOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173']

app.use(cors({ origin: frontendOrigins }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/skills', skillRoutes)
app.use('/api/certifications', certificationRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' })
})

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error)
  console.error(error)
  const status = error.status || 500
  res.status(status).json({
    message: status === 500 ? 'An unexpected server error occurred.' : error.message,
  })
})

initializeDatabase()
  .then(() => {
    app.listen(port, () => console.log(`CampusHub API listening on port ${port}`))
  })
  .catch((error) => {
    console.error('Unable to initialize the database:', error)
    process.exitCode = 1
  })
