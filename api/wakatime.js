/**
 * WakaTime Proxy (Vercel Serverless Function)
 * Endpoint: GET /api/wakatime
 *
 * Used by the DevDaily Dashboard WakaTime widget.
 * Fetches today's coding summary without exposing the API key.
 *
 * Requires: WAKATIME_API_KEY in Vercel environment variables.
 */

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const key = process.env.WAKATIME_API_KEY

  // Fail fast with a clear message if the key is not configured
  if (!key) {
    return res.status(503).json({
      error: 'WAKATIME_API_KEY is not configured on the server',
    })
  }

  const today = new Date().toISOString().slice(0, 10)
  const url = `https://wakatime.com/api/v1/users/current/summaries?start=${today}&end=${today}`

  // Use an AbortController to avoid hanging if WakaTime is slow
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000) // 8s timeout

  try {
    const upstream = await fetch(url, {
      signal: controller.signal,
      headers: {
        Authorization: `Basic ${Buffer.from(key).toString('base64')}`,
        Accept: 'application/json',
      },
    })

    clearTimeout(timeout)

    if (!upstream.ok) {
      return res.status(502).json({
        error: `WakaTime API responded with ${upstream.status}`,
      })
    }

    const data = await upstream.json()

    // Forward CORS headers so the browser accepts the response
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    res.setHeader('Content-Type', 'application/json')

    // Cache for 5 minutes on Vercel's edge to reduce upstream calls
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
