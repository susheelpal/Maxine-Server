const loggingUtil = require('./src/util/logging/maxine-logging-util');
const { constants } = require('./src/util/constants/constants');
const AppBuilder = require('./src/builders/AppBuilder');

const app = AppBuilder.createNewApp()
                .registerExpressStatusMonitorEndpoint()
                .registerRequestLogger()
                .enableActuator()                
                .mapUrlPatterns()
                .handleExceptions()                
                .getApp();

app.listen(constants.PORT, loggingUtil.initApp);