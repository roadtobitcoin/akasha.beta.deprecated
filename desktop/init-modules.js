"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonschema_web3_1 = require("@akashaproject/jsonschema-web3");
const constants_1 = require("@akashaproject/common/constants");
const geth_connector_1 = require("@akashaproject/geth-connector");
const ipfs_connector_1 = require("@akashaproject/ipfs-connector");
const electron_1 = require("electron");
const path_1 = require("path");
const core_1 = require("@akashaproject/core");
const common_1 = require("@akashaproject/common");
const auth_1 = require("@akashaproject/auth");
const comments_1 = require("@akashaproject/comments");
const entry_1 = require("@akashaproject/entry");
const geth_1 = require("@akashaproject/geth");
const ipfs_1 = require("@akashaproject/ipfs");
const licences_1 = require("@akashaproject/licences");
const notifications_1 = require("@akashaproject/notifications");
const pinner_1 = require("@akashaproject/pinner");
const profile_1 = require("@akashaproject/profile");
const registry_1 = require("@akashaproject/registry");
const search_1 = require("@akashaproject/search");
const indexes_1 = require("@akashaproject/search/indexes");
const tags_1 = require("@akashaproject/tags");
const tx_1 = require("@akashaproject/tx");
async function bootstrap(serviceProvider, gS) {
    core_1.default.init();
    const common = common_1.default.init(serviceProvider, gS);
    const auth = auth_1.default.init(serviceProvider, gS);
    const comments = comments_1.default.init(serviceProvider, gS);
    const entry = entry_1.default.init(serviceProvider, gS);
    const geth = geth_1.default.init(serviceProvider, gS);
    const ipfs = ipfs_1.default.init(serviceProvider, gS);
    const licences = licences_1.default.init(serviceProvider, gS);
    const notifications = notifications_1.default.init(serviceProvider, gS);
    const pinner = pinner_1.default.init(serviceProvider, gS);
    const profile = profile_1.default.init(serviceProvider, gS);
    const registry = registry_1.default.init(serviceProvider, gS);
    const search = search_1.default.init(serviceProvider, gS);
    const tags = tags_1.default.init(serviceProvider, gS);
    const tx = tx_1.default.init(serviceProvider, gS);
    const serviceValidator = function () {
        return { Validator: jsonschema_web3_1.default };
    };
    gS(constants_1.CORE_MODULE.WEB3_API).instance = geth_connector_1.GethConnector.getInstance().web3;
    gS(constants_1.CORE_MODULE.IPFS_API).instance = ipfs_connector_1.IpfsConnector.getInstance();
    serviceProvider().service(constants_1.CORE_MODULE.VALIDATOR_SCHEMA, serviceValidator);
    serviceProvider().service(constants_1.CORE_MODULE.GETH_CONNECTOR, geth_connector_1.GethConnector);
    serviceProvider().service(constants_1.CORE_MODULE.IPFS_CONNECTOR, ipfs_connector_1.IpfsConnector);
    const prefix = electron_1.app.getPath('userData') + path_1.sep;
    await indexes_1.init(prefix)
        .then(d => console.info('Finished init local db.'))
        .catch(err => console.log(`Error on local db ${err}`));
    return {
        common,
        auth,
        comments,
        entry,
        geth,
        ipfs,
        licences,
        notifications,
        pinner,
        profile,
        registry,
        search,
        tags,
        tx,
    };
}
exports.default = bootstrap;
//# sourceMappingURL=init-modules.js.map