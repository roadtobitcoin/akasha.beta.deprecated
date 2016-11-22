"use strict";
const ipfs_connector_1 = require('@akashaproject/ipfs-connector');
const records_1 = require('../models/records');
function create(data) {
    const date = (new Date()).toJSON();
    const constructed = {
        content: data.content,
        date
    };
    return ipfs_connector_1.IpfsConnector.getInstance().api
        .add(constructed)
        .then((hash) => hash);
}
exports.create = create;
function getCommentContent(hash) {
    if (records_1.comments.records.getFull(hash)) {
        return Promise.resolve(records_1.comments.records.getFull(hash));
    }
    return ipfs_connector_1.IpfsConnector.getInstance().api
        .get(hash)
        .then((data) => {
        records_1.comments.records.setFull(hash, data);
        return data;
    });
}
exports.getCommentContent = getCommentContent;
//# sourceMappingURL=ipfs.js.map