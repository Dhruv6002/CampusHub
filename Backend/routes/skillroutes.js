const createResourceRouter = require('../src/resourceRouter')

module.exports = createResourceRouter({
  table: 'skills',
  required: ['name'],
  fields: {
    name: { type: 'string', maxLength: 120, required: true },
    level: { type: 'enum', values: ['beginner', 'intermediate', 'advanced', 'expert'] },
  },
})