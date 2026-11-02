const createResourceRouter = require('../src/resourceRouter')

module.exports = createResourceRouter({
  table: 'certifications',
  required: ['name'],
  fields: {
    name: { type: 'string', maxLength: 180, required: true },
    issuer: { type: 'string', maxLength: 180, nullable: true },
    issue_date: { type: 'date', nullable: true },
    credential_url: { type: 'url', maxLength: 500, nullable: true },
  },
})