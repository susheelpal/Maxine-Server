require('./src/util/logging/log-generic-exceptions')();
const loggingUtil = require('./src/util/logging/logging-util');
const { constants } = require('./src/util/constants/constants');
const actuator = require('express-actuator');
const AppBuilder = require('./src/builders/app-builder');
const { statusMonitorConfig, actuatorConfig } = require('./src/config/config');
const { logRequest } = require('./src/util/logging/logging-util');
const maxineRoutes = require('./src/routes/routes');
const expressStatusMonitor = require('express-status-monitor');
const logWebExceptions = require('./src/util/logging/log-web-exceptins');

// below starts to send requests to it self
require('./src/routines/routine').startRoutines();

const app = AppBuilder.createNewApp()
                .ifPropertyOnce("statusMonitor.enabled")
                        .use(expressStatusMonitor(statusMonitorConfig))
                .use(logRequest)
                .ifPropertyOnce("actuator.enabled")
                        .use(actuator(actuatorConfig))                
                .use('/',maxineRoutes)
                .use(logWebExceptions)
                .getApp();

app.listen(constants.PORT, loggingUtil.initApp);

module.exports = app;