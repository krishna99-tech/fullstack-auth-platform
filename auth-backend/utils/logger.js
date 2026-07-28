const db = require('../db');

async function logSecurityEvent(userId, event, ipAddress, location, type = 'info') {
  try {
    await db.auditLog.create({
      data: {
        userId,
        event,
        ipAddress: ipAddress || 'Unknown IP',
        location: location || 'Unknown Location',
        type
      }
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

module.exports = { logSecurityEvent };
