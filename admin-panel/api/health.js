module.exports = (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    message: 'Hello from direct Vercel API endpoint!',
    timestamp: new Date().toISOString()
  });
};
