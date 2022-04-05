const { info, error } = require('../../util/logging/logging-util');
const { statusAndMsgs, constants } = require('../../util/constants/constants');
const { registryService } = require('../../service/registry-service');
const config = require('../../config/config');

const registryController = (req, res) => {
    let {hostName, nodeName, port, serviceName, timeOut, weight, ssl} = req.body;

    if(!(hostName && nodeName && port && serviceName)){
        error(statusAndMsgs.MSG_REGISTER_MISSING_DATA);
        res.status(statusAndMsgs.STATUS_GENERIC_ERROR).json({"message" : statusAndMsgs.MSG_REGISTER_MISSING_DATA});
        return;
    }

    serviceName = serviceName.toUpperCase();
    nodeName = nodeName.toUpperCase();
    port = Math.abs(parseInt(port));
    timeOut = Math.abs(parseInt(timeOut)) || config.heartBeatTimeOut;
    weight = Math.abs(parseInt(weight)) || 1;
    ssl = ssl || false;
    const address = `${ssl ? "https" : "http"}://${hostName}:${port}`;

    if(weight > constants.MAX_SERVER_WEIGHT){
        res.status(statusAndMsgs.STATUS_GENERIC_ERROR).json({"message" : statusAndMsgs.MSG_INVALID_WEIGHT});
        return;
    }

    const serviceObj = {
        "serviceName" : serviceName,
        "nodeName" : nodeName,
        "address": address,
        "timeOut": timeOut,
        "weight" : weight
    }

    const serviceResponse = registryService.registryService(serviceObj);
    info(serviceResponse);
    res.status(statusAndMsgs.STATUS_SUCCESS).json(serviceResponse);
}


const serverListController = (_, res) => {
    res.type('application/json');
    res.send(JSON.stringify(registryService.getCurrentlyRegisteredServers()));
}

module.exports = {
    registryController,
    serverListController
};