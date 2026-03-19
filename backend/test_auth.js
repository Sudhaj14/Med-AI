const fetch = require('node-fetch'); // Using the built-in fetch if Node >= 18 or we can just use native node fetching. Wait, Node 18+ has native fetch.

async function test() {
  console.log("Registering doctor...");
  const regRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      name: 'Test Doc', 
      email: 'doc' + Date.now() + '@test.com', 
      password: 'pass', 
      role: 'doctor', 
      specialization: 'Cardio' 
    })
  });
  
  const regData = await regRes.json();
  console.log("Reg response:", regRes.status, regData);

  if (!regData.token) return;

  const token = regData.token;
  
  // parse JWT manually to verify payload
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
  console.log("Token payload:", payload);

  console.log("Fetching /api/doctor/slots...");
  const slotRes = await fetch('http://localhost:5000/api/doctor/slots', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  
  const slotData = await slotRes.json();
  console.log("Slot response:", slotRes.status, slotData);
}

test().catch(console.error);
