const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const counters = {};
const ensureCounter = (name, help) => {
  if (!counters[name]) {
    counters[name] = new client.Counter({ name, help: help || name, registers: [register] });
  }
  return counters[name];
};

const increment = (name, value = 1) => {
  const c = ensureCounter(name, name);
  c.inc(value);
};

const metricsMiddleware = async (req, res, next) => {
  increment('http_requests_total');
  next();
};

module.exports = { register, increment, metricsMiddleware };
