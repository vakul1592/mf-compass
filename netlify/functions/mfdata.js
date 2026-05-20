// Netlify serverless function — proxies mfdata.in to add CORS headers
// Deployed automatically when you push to Netlify
// Accessible at: https://yourdomain.com/.netlify/functions/mfdata?path=/api/v1/schemes/119551

exports.handler = async (event) => {
  const path = event.queryStringParameters?.path || '';

  if (!path.startsWith('/api/v1/')) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid path' }) };
  }

  const url = `https://mfdata.in${path}`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'MutualFundCompass/1.0' }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: `Upstream error ${response.status}` })
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // cache 1 hour — AUM updates monthly
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
