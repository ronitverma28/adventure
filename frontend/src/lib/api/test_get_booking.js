const https = require('https');

function post(url, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const bodyStr = JSON.stringify(data);
    const req = https.request({
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        ...headers
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method: 'GET',
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  const email = 'ukcode07@gmail.com';
  const password = '12345678Au';

  try {
    console.log("1. Logging in...");
    const loginRes = await post('https://adventure-zuq8.onrender.com/auth/login', { email, password });
    if (loginRes.status !== 200) {
      console.error("Login failed:", loginRes.body);
      return;
    }
    const token = loginRes.body.data.accessToken;

    console.log("2. Creating booking...");
    const bookingPayload = {
      batchId: 4,
      numAdults: 1,
      numChildren: 0,
      travelers: [
        {
          name: 'Ronit Verma',
          age: 25,
          gender: 'Male',
          idType: 'Aadhaar',
          idNumber: '123456789012',
          isLeader: true
        }
      ],
      emergencyContact: 'John Doe',
      emergencyPhone: '9876543210'
    };

    const createBookingRes = await post('https://adventure-zuq8.onrender.com/bookings', bookingPayload, {
      'Authorization': `Bearer ${token}`
    });
    console.log("Create Booking Status:", createBookingRes.status);
    if (createBookingRes.status !== 200) {
      console.error("Booking creation failed.");
      return;
    }

    const bookingRef = createBookingRes.body.data.bookingRef;
    console.log(`Booking created: ${bookingRef}`);

    console.log("3. Fetching booking details immediately...");
    const getBookingRes = await get(`https://adventure-zuq8.onrender.com/bookings/${bookingRef}`, {
      'Authorization': `Bearer ${token}`
    });
    console.log("Get Booking Status:", getBookingRes.status);
    console.log("Get Booking Response:", JSON.stringify(getBookingRes.body, null, 2));

  } catch (err) {
    console.error("Error occurred:", err);
  }
}

run();
