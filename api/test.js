// Simple test endpoint to verify environment variables
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    mongodbConfigured: !!process.env.MONGODB_URI,
    usdaConfigured: !!process.env.USDA_API_KEY,
    environment: process.env.NODE_ENV || 'development'
  });
};
