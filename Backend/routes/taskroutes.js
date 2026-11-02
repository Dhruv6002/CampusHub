const createResourceRouter = require('../src/resourceRouter')

module.exports = createResourceRouter({
  table: 'tasks',
  required: ['title'],
  fields: {
    project_id: { type: 'integer', nullable: true },
    title: { type: 'string', maxLength: 180, required: true },
    description: { type: 'string', maxLength: 5000, nullable: true },
    status: { type: 'enum', values: ['todo', 'in-progress', 'done'] },
    priority: { type: 'enum', values: ['low', 'medium', 'high'] },
    due_date: { type: 'date', nullable: true },
  },
})