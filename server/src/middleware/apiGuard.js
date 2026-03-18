const apiGuard = (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  const secret = req.headers['x-app-secret'];
  if (!secret || secret !== (process.env.APP_SECRET || 'any_random_secret_string')) {
    console.warn(`Auth Failed: Provided secret: ${secret ? '***' : 'None'}, Expected: ${process.env.APP_SECRET ? 'Configured' : 'Fallback'}`);
    return res.status(401).json({ error: 'Unauthorized: Secret Mismatch' });
  }
  next();
};

module.exports = apiGuard;
