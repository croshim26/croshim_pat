const AppSetting = require("../models/app_setting");

let _cache = null;
let _cacheAt = 0;
const TTL = 30_000; // 30 seconds

async function readFlags() {
  if (_cache && Date.now() - _cacheAt < TTL) return _cache;
  const rows = await AppSetting.findAll({
    where: { key: ["ai_generator_enabled", "ai_evaluator_enabled"] },
  });
  const map = {};
  rows.forEach((r) => (map[r.key] = r.value));
  _cache = {
    aiGeneratorEnabled: map["ai_generator_enabled"] !== "false",
    aiEvaluatorEnabled: map["ai_evaluator_enabled"] !== "false",
  };
  _cacheAt = Date.now();
  return _cache;
}

function invalidateCache() {
  _cache = null;
}

async function featureFlags(req, res, next) {
  try {
    const flags = await readFlags();
    const isAdmin = req.session.isAdmin === true;
    res.locals.aiGeneratorEnabled = isAdmin || flags.aiGeneratorEnabled;
    res.locals.aiEvaluatorEnabled = isAdmin || flags.aiEvaluatorEnabled;
  } catch {
    res.locals.aiGeneratorEnabled = true;
    res.locals.aiEvaluatorEnabled = true;
  }
  next();
}

featureFlags.invalidateCache = invalidateCache;
module.exports = featureFlags;
