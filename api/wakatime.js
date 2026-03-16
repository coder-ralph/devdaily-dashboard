/**
 * WakaTime Proxy (Vercel Serverless Function)
 * Endpoint: GET /api/wakatime
 *
 * Key priority:
 * 1. x-wakatime-key request header
 * 2. WAKATIME_API_KEY environment variable
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const rawHeader = req.headers['x-wakatime-key']

  let headerKey = null
  if (Array.isArray(rawHeader)) {
    headerKey = rawHeader[0]?.trim() || null
  } else if (typeof rawHeader === 'string') {
    headerKey = rawHeader.trim() || null
  }

  const key = headerKey || process.env.WAKATIME_API_KEY

  if (!key) {
    return res.status(503).json({
      error: 'No WakaTime API key available. Save a key in the dashboard or configure WAKATIME_API_KEY on Vercel.',
    })
  }

  const today = new Date().toISOString().slice(0, 10)
  const url = `https://wakatime.com/api/v1/users/current/summaries?start=${today}&end=${today}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const upstream = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(`${key}:`).toString('base64')}`,
      },
    })

    clearTimeout(timeout)

    if (!upstream.ok) {
      return res.status(502).json({
        error: `WakaTime API responded with ${upstream.status}`,
      })
    }

    const data = await upstream.json()

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60')

    return res.status(200).json(data)
  } catch (err) {
    clearTimeout(timeout)

    const isTimeout = err.name === 'AbortError'
    return res.status(502).json({
      error: isTimeout ? 'WakaTime API timed out' : 'Failed to reach WakaTime API',
    })
  }
}
