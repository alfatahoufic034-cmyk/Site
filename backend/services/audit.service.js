const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');
const supabase = require('../database/supabaseClient');
const metrics = require('./metrics.service');

const file = path.join(__dirname, '..', 'data', 'audit.json');
const ensure = () => { const dir = path.dirname(file); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); if (!fs.existsSync(file)) fs.writeFileSync(file, '[]'); };

const record = async (actor = {}, action = '', resource = '', resourceId = null, details = {}) => {
  try {
    const rec = { actor: { id: actor.id || null, email: actor.email || null }, action, resource, resource_id: resourceId, details, created_at: new Date().toISOString() };
    // write to supabase if available
    if (supabase) {
      try {
        const { data, error } = await supabase.from('audit_logs').insert([{ actor: rec.actor, action: rec.action, resource: rec.resource, resource_id: rec.resource_id, meta: rec.details, created_at: rec.created_at }]);
        if (error) throw error;
        metrics.increment('audit_events_total');
        logger.info('%s %s %s (supabase)', actor.email || actor.id || 'system', action, resource);
        return data && data[0] ? data[0] : rec;
      } catch (e) {
        logger.warn('Supabase audit insert failed, falling back to file: %s', e.message);
      }
    }

    // fallback to file
    ensure();
    const items = JSON.parse(fs.readFileSync(file));
    const localRec = { id: Date.now(), actor_id: actor.id || null, actor_email: actor.email || null, action, resource, resource_id: resourceId, details, created_at: rec.created_at };
    items.push(localRec);
    fs.writeFileSync(file, JSON.stringify(items, null, 2));
    metrics.increment('audit_events_total');
    logger.info('%s %s %s', actor.email || actor.id || 'system', action, resource);
    return localRec;
  } catch (err) {
    logger.error('Audit record failed: %s', err.message);
    return null;
  }
};

module.exports = { record };
