const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 100;
const store = new Map();

module.exports = (req, res, next) => {
  const now = Date.now();
  const key = req.ip;
  const entry = store.get(key);

  if (!entry || now > entry.expiresAt) {
    store.set(key, {
      count: 1,
      expiresAt: now + WINDOW_MS,
    });
    return next();
  }

  if (entry.count >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  }

  entry.count += 1;
  store.set(key, entry);
  next();
};
