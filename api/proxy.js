export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { endpoint, ...params } = req.query;
  if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });

  // Strip internal params not needed by pokemontcg.io
  const { episode, sort, ...apiParams } = params;

  // Build query string
  const q = [];
  if (apiParams.name) q.push(`name:"${apiParams.name}"`);
  if (episode) q.push(`set.name:"${episode}"`);

  const queryParams = new URLSearchParams();
  if (q.length) queryParams.set('q', q.join(' '));
  if (apiParams.page) queryParams.set('page', apiParams.page);
  if (apiParams.per_page) queryParams.set('pageSize', apiParams.per_page);
  if (sort) queryParams.set('orderBy', sort === 'number' ? 'number' : '-set.releaseDate');

  const url = `https://api.pokemontcg.io/v2/${endpoint}?${queryParams}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': process.env.PTCG_API_KEY || '',
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
