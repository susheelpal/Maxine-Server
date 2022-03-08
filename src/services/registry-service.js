const JsonBuilder = require("../builders/json-builder");
const { statusAndMsgs } = require("../util/constants/constants");
const { info } = require("../util/logging/logging-util");

class RegistryService{
    serviceRegistry = {};
    timeResetters = {};
    registryService = (serviceObj) => {
        const {serviceName, nodeName, address, timeOut, weight} = serviceObj;

        const id = Date.now().toString(36);

        if (!this.serviceRegistry[serviceName]){
            this.serviceRegistry[serviceName] = {offset: 0, nodes: {}};
        }

        if(this.serviceRegistry[serviceName]["nodes"][nodeName]){
            clearTimeout(this.timeResetters[this.serviceRegistry[serviceName]["nodes"][nodeName]["id"]]);
        }

        [...Array(weight).keys()].forEach(index => {
            const tempNodeName = `${nodeName}-${index}`;
            this.serviceRegistry[serviceName]["nodes"][tempNodeName] = {
                "nodeName" : tempNodeName,
                "address" : address,
                "id" : id,
                "timeOut" : timeOut,
                "registeredAt" : new Date().toLocaleString()
            }
            const timeResetter = setTimeout(() => {
                info(this.getServiceInfoIson(serviceName, tempNodeName, statusAndMsgs.MSG_SERVICE_REMOVED));
                delete this.serviceRegistry[serviceName]["nodes"][tempNodeName];
                if(Object.keys(this.serviceRegistry[serviceName]["nodes"]).length === 0){
                    delete this.serviceRegistry[serviceName];
                }
            }, ((timeOut)*1000)+500);

            this.timeResetters[id] = timeResetter;
        });

        serviceObj.id = id;
        serviceObj.registeredAt = new Date().toLocaleString();
        return serviceObj;
    }

    getCurrentlyRegisteredServers = () => this.serviceRegistry;

    getServers = (serviceName) => {
        return this.serviceRegistry[serviceName];
    }

    getNodes = (serviceName) => {
        const servers = this.getServers(serviceName) || {};
        return servers["nodes"];
    }

    getOffsetAndIncrement = (serviceName) => {
        const servers = this.getServers(serviceName) || {};
        return servers["offset"]++;
    }

    getNode = (serviceName) => {
        const nodes = this.getNodes(serviceName) || {};
        const offset = this.getOffsetAndIncrement(serviceName) || 0;
        const keys = Object.keys(nodes);
        const key = keys[offset % keys.length];
        return nodes[key];
    }

    getServiceInfoIson = (serviceName, nodeName, statusMsg) => {
        return JsonBuilder.createNewJson()
                                .put("Status", statusMsg)
                                .put(serviceName, JsonBuilder.createNewJson()
                                                             .put(nodeName, this.serviceRegistry[serviceName]["nodes"][nodeName])
                                                             .getJson())
                                .getJson();
    }
}

const registryService = new RegistryService();
module.exports = {
    registryService
}