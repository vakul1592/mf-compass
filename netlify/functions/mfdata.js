// Netlify serverless function — proxies mfdata.in to add CORS headers
// Endpoint: /.netlify/functions/mfdata?path=/api/v1/schemes/SCHEME_CODE

exports.handler = async (event) => {
  const path = event.queryStringParameters?.path || '';

  if (!path.startsWith('/api/v1/')) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Invalid path' })
    };
  }

  const url = `https://mfdata.in${path}`;

  // Retry up to 3 times — mfdata.in occasionally times out
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'MutualFundCompass/1.0 (https://mutualfundcompass.in)',
          'Accept': 'application/json'
        }
      });

      clearTimeout(timeout);

      if (!response.ok) {
        if (attempt < 3) continue; // retry
        return {
          statusCode: response.status,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: `Upstream error ${response.status}` })
        };
      }

      const data = await response.json();

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          // Cache for 6 hours — AUM updates monthly, NAV daily
          // 6 hours is a good balance between freshness and speed
          'Cache-Control': 'public, s-maxage=21600, max-age=3600'
        },
        body: JSON.stringify(data)
      };

    } catch (err) {
      if (attempt < 3) {
        // Wait 1s before retry
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      return {
        statusCode: 503,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Data source temporarily unavailable. Returns still work — AUM will retry shortly.' })
      };
    }
  }
};
