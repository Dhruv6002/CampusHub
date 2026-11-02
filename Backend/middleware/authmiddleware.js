const jwt = require('jsonwebtoken')

function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Authentication is required.' })

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' })
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' })
    }
    next()
  }
}

module.exports = { authenticateToken, authorizeRoles }