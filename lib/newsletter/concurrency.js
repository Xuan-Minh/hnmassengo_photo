export async function mapWithConcurrency(items, limit, mapper) {
  const results = [];
  const executing = new Set();

  for (const item of items) {
    const p = Promise.resolve().then(() => mapper(item));
    results.push(p);
    executing.add(p);

    const cleanup = () => executing.delete(p);
    p.then(cleanup).catch(cleanup);

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}
