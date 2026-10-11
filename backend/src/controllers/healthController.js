const { successResponse } = require('../utils/responseUtils');

class HealthController {
  static getHealth(req, res) {
    const healthData = {
      status: 'ok',
      service: 'StudyMate AI Backend',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };

    return successResponse(res, 200, 'Server berjalan dengan baik', healthData);
  }
}

module.exports = HealthController;
