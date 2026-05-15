const buckets = new Map();

function nowMs() {
  return Date.now();
}

export function getClientIp(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return String(forwardedFor).split(',')[0].trim();
  }

  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return String(cfIp).trim();

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return String(realIp).trim();

  return 'unknown';
}

export function checkRateLimit({
  key,
  identifier,
  limit,
  windowMs,
  currentTime = nowMs(),
}) {
  if (!key || !identifier || !limit || !windowMs) {
    return { allowed: true, remaining: limit || 0, resetTime: currentTime };
  }

  const bucketKey = `${key}:${identifier}`;
  for (const [storedKey, storedEntry] of buckets.entries()) {
    if (currentTime - storedEntry.firstHitAt >= storedEntry.windowMs) {
      buckets.delete(storedKey);
    }
  }

  const entry = buckets.get(bucketKey);

  if (!entry || currentTime - entry.firstHitAt >= windowMs) {
    const next = { firstHitAt: currentTime, count: 1, windowMs };
    buckets.set(bucketKey, next);
    return {
      allowed: true,
      remaining: Math.max(0, limit - next.count),
      resetTime: currentTime + windowMs,
    };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.firstHitAt + windowMs,
    };
  }

  entry.count += 1;
  entry.windowMs = windowMs;
  buckets.set(bucketKey, entry);

  return {
    allowed: true,
    remaining: Math.max(0, limit - entry.count),
    resetTime: entry.firstHitAt + windowMs,
  };
}
