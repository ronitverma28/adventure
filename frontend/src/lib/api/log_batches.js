const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method: 'GET'
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  try {
    const res = await get('https://adventure-zuq8.onrender.com/treks/2/availability');
    console.log("Status:", res.status);
    console.log("Batches:", JSON.stringify(res.body, null, 2));
  } catch (err) {
    console.error(err);
  }
}

run();
