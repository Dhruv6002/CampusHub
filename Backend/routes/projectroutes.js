const express = require('express')
const { pool } = require('../src/config/db')
const { authenticateToken, authorizeRoles } = require('../middleware/authmiddleware')
const createResourceRouter = require('../src/resourceRouter')

const router = createResourceRouter({
  table: 'projects',
  required: ['title'],
  fields: {
    title: { type: 'string', maxLength: 180, required: true },
    description: { type: 'string', maxLength: 5000, nullable: true },
    category: { type: 'string', maxLength: 100, nullable: true },
    status: { type: 'enum', values: ['planning', 'in-progress', 'completed'] },
    due_date: { type: 'date', nullable: true },
    repository_url: { type: 'url', maxLength: 500, nullable: true },
    submission_url: { type: 'url', maxLength: 500, nullable: true },
  },
  listQuery: `SELECT projects.*, users.name AS student_name
    FROM projects JOIN users ON projects.user_id = users.id
    WHERE (? = 'faculty' OR projects.user_id = ?)
    ORDER BY projects.updated_at DESC`,
})

const feedback = express.Router({ mergeParams: true })
feedback.use(authenticateToken)

feedback.get('/', async (req, res) => {
  const [projects] = await pool.execute(
    'SELECT user_id FROM projects WHERE id = ?',
    [req.params.projectId],
  )
  if (!projects.length) return res.status(404).json({ message: 'Project not found.' })
  if (req.user.role === 'student' && projects[0].user_id !== req.user.id) {
    return res.status(403).json({ message: 'You cannot view feedback for this project.' })
  }
  const [items] = await pool.execute(
    `SELECT feedback.*, users.name AS faculty_name
     FROM feedback JOIN users ON feedback.faculty_id = users.id
     WHERE feedback.project_id = ? ORDER BY feedback.created_at DESC`,
    [req.params.projectId],
  )
  res.json({ items })
})

feedback.post('/', authorizeRoles('faculty'), async (req, res) => {
  const { comment, grade } = req.body
  if (typeof comment !== 'string' || !comment.trim() || comment.trim().length > 5000) {
    return res.status(400).json({ message: 'Feedback must be between 1 and 5000 characters.' })
  }
  const parsedGrade = grade === '' || grade === null || grade === undefined ? null : Number(grade)
  if (parsedGrade !== null && (!Number.isFinite(parsedGrade) || parsedGrade < 0 || parsedGrade > 100)) {
    return res.status(400).json({ message: 'Grade must be between 0 and 100.' })
  }
  const [projects] = await pool.execute('SELECT id FROM projects WHERE id = ?', [req.params.projectId])
  if (!projects.length) return res.status(404).json({ message: 'Project not found.' })
  const [result] = await pool.execute(
    'INSERT INTO feedback (project_id, faculty_id, comment, grade) VALUES (?, ?, ?, ?)',
    [req.params.projectId, req.user.id, comment.trim(), parsedGrade],
  )
  const [items] = await pool.execute(
    `SELECT feedback.*, users.name AS faculty_name
     FROM feedback JOIN users ON feedback.faculty_id = users.id WHERE feedback.id = ?`,
    [result.insertId],
  )
  res.status(201).json({ item: items[0] })
})

router.use('/:projectId/feedback', feedback)
module.exports = router