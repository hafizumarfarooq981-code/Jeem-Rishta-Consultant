module.exports = (req, res) => {
  const loaded = {};
  ['express', 'cors', 'helmet', 'jsonwebtoken', 'bcryptjs'].forEach(pkg => {
    try {
      require(pkg);
      loaded[pkg] = 'LOADED';
    } catch (e) {
      loaded[pkg] = 'FAILED: ' + e.message;
    }
  });

  let seedStatus = 'UNKNOWN';
  try {
    const seed = require('./seedData.json');
    seedStatus = `LOADED (${seed.rishta_profiles?.length} profiles)`;
  } catch (e) {
    seedStatus = 'FAILED: ' + e.message;
  }

  res.status(200).json({
    message: 'Diagnostic Probe',
    url: req.url,
    method: req.method,
    modules: loaded,
    seed: seedStatus
  });
};
