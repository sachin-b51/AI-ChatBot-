const apiGuard = (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  const secret = req.headers['x-app-secret'];
  if (!secret || secret !== process.env.APP_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

module.exports = apiGuard;
