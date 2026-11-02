const express = require('express')
const { pool } = require('./config/db')
const { authenticateToken, authorizeRoles } = require('../middleware/authmiddleware')

function isValidValue(value, rule) {
  if (value === null && rule.nullable) return true
  if (typeof value !== 'string' && typeof value !== 'number') return false
  if (rule.type === 'enum') return rule.values.includes(value)
  if (rule.type === 'integer') return Number.isInteger(Number(value)) && Number(value) > 0
  if (rule.type === 'date') return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  if (rule.type === 'url') {
    if (value === '') return true
    if (value.length > rule.maxLength) return false
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol)
    } catch {
      return false
    }
  }
  if (rule.type === 'string') {
    return typeof value === 'string'
      && (!rule.required || value.trim().length > 0)
      && value.trim().length <= rule.maxLength
  }
  return false
}

function createResourceRouter({ table, fields, required, roles = ['student'], listQuery }) {
  const router = express.Router()
  router.use(authenticateToken)

  router.get('/', async (req, res) => {
    const [rows] = await pool.execute(
      listQuery || `SELECT * FROM ${table} WHERE user_id = ? ORDER BY created_at DESC`,
      listQuery ? [req.user.role, req.user.id] : [req.user.id],
    )
    res.json({ items: rows })
  })

  router.post('/', authorizeRoles(...roles), async (req, res) => {
    const body = req.body
    for (const key of required) {
      if (body[key] === undefined || body[key] === null || body[key] === '') {
        return res.status(400).json({ message: `${key} is required.` })
      }
    }
    const keys = Object.keys(body)
    if (keys.some((key) => !fields[key])) {
      return res.status(400).json({ message: 'One or more fields are not supported.' })
    }
    for (const [key, value] of Object.entries(body)) {
      if (!isValidValue(value, fields[key])) {
        return res.status(400).json({ message: `${key} is invalid.` })
      }
    }

    if (table === 'tasks' && body.project_id) {
      const [projects] = await pool.execute(
        'SELECT id FROM projects WHERE id = ? AND user_id = ?',
        [body.project_id, req.user.id],
      )
      if (!projects.length) return res.status(400).json({ message: 'Choose one of your own projects.' })
    }

    const columns = ['user_id', ...keys]
    const values = [req.user.id, ...keys.map((key) => body[key] === '' ? null : body[key])]
    const [result] = await pool.execute(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
      values,
    )
    const [created] = await pool.execute(
      `SELECT * FROM ${table} WHERE id = ? AND user_id = ?`,
      [result.insertId, req.user.id],
    )
    res.status(201).json({ item: created[0] })
  })

  router.put('/:id', authorizeRoles(...roles), async (req, res) => {
    const id = Number(req.params.id)
    const entries = Object.entries(req.body)
    if (!Number.isInteger(id) || id < 1 || !entries.length) {
      return res.status(400).json({ message: 'A valid item ID and at least one field are required.' })
    }
    if (entries.some(([key, value]) => !fields[key] || !isValidValue(value, fields[key]))) {
      return res.status(400).json({ message: 'One or more fields are invalid or not supported.' })
    }
    if (table === 'tasks' && req.body.project_id) {
      const [projects] = await pool.execute(
        'SELECT id FROM projects WHERE id = ? AND user_id = ?',
        [req.body.project_id, req.user.id],
      )
      if (!projects.length) return res.status(400).json({ message: 'Choose one of your own projects.' })
    }

    const assignments = entries.map(([key]) => `${key} = ?`).join(', ')
    const values = entries.map(([, value]) => value === '' ? null : value)
    const [result] = await pool.execute(
      `UPDATE ${table} SET ${assignments} WHERE id = ? AND user_id = ?`,
      [...values, id, req.user.id],
    )
    if (!result.affectedRows) return res.status(404).json({ message: 'Item not found.' })
    const [updated] = await pool.execute(
      `SELECT * FROM ${table} WHERE id = ? AND user_id = ?`,
      [id, req.user.id],
    )
    res.json({ item: updated[0] })
  })

  router.delete('/:id', authorizeRoles(...roles), async (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'A valid item ID is required.' })
    const [result] = await pool.execute(
      `DELETE FROM ${table} WHERE id = ? AND user_id = ?`,
      [id, req.user.id],
    )
    if (!result.affectedRows) return res.status(404).json({ message: 'Item not found.' })
    res.status(204).end()
  })

  return router
}

module.exports = createResourceRouter
