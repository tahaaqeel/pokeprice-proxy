export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { endpoint, name, episode, page, per_page } = req.query;
  if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });

  // Build search query
  const q = [];
  if (name) q.push(name);
  if (episode) q.push(episode);

  const queryParams = new URLSearchParams();
  queryParams.set('game', 'pokemon');
  if (q.length) queryParams.set('q', q.join(' '));
  if (page) queryParams.set('offset', (parseInt(page) - 1) * parseInt(per_page || 20));
  if (per_page) queryParams.set('limit', per_page);

  const url = `https://api.tcgpricelookup.com/v1/cards/search?${queryParams}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-API-Key': process.env.TCGPL_API_KEY || '',
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
