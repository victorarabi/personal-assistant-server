//authorization middleware
function authorization(req, res, next) {
  if (req.user === undefined) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

module.exports = { authorization };
