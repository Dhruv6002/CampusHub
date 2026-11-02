const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../src/config/db')
const { authenticateToken } = require('../middleware/authmiddleware')

const router = express.Router()

function createToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  )
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 120) {
    return res.status(400).json({ message: 'Name must be between 2 and 120 characters.' })
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Enter a valid email address.' })
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    return res.status(400).json({ message: 'Password must be between 8 and 72 characters.' })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [normalizedEmail])
  if (existing.length) return res.status(409).json({ message: 'An account with this email already exists.' })

  const passwordHash = await bcrypt.hash(password, 12)
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name.trim(), normalizedEmail, passwordHash, 'student'],
  )
  const user = { id: result.insertId, name: name.trim(), email: normalizedEmail, role: 'student' }
  res.status(201).json({ token: createToken(user), user })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (typeof email !== 'string' || typeof password !== 'string' || password.length < 1 || password.length > 72) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }
  const [rows] = await pool.execute(
    'SELECT id, name, email, role, password_hash FROM users WHERE email = ?',
    [email.trim().toLowerCase()],
  )
  const user = rows[0]
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: 'Email or password is incorrect.' })
  }
  const publicUser = { id: user.id, name: user.name, email: user.email, role: user.role }
  res.json({ token: createToken(publicUser), user: publicUser })
})

router.get('/me', authenticateToken, async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT id, name, email, role FROM users WHERE id = ?',
    [req.user.id],
  )
  if (!rows.length) return res.status(401).json({ message: 'This account no longer exists.' })
  res.json({ user: rows[0] })
})

module.exports = router