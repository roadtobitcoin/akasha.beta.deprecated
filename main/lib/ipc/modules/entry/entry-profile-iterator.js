"use strict";
const Promise = require('bluebird');
const index_1 = require('../../contracts/index');
const get_entry_1 = require('./get-entry');
const execute = Promise.coroutine(function* (data) {
    let currentId = (data.start) ? data.start : yield index_1.constructed.instance.entries.getProfileEntryFirst(data.akashaId);
    if (currentId === '0') {
        return { collection: [], akashaId: data.akashaId };
    }
    let entry;
    const maxResults = (data.limit) ? data.limit : 5;
    const results = [];
    let counter = 0;
    if (!data.start) {
        entry = yield get_entry_1.default.execute({ entryId: currentId });
        results.push({ entryId: currentId, content: entry });
        counter = 1;
    }
    while (counter < maxResults) {
        currentId = yield index_1.constructed.instance.entries.getProfileEntryNext(data.akashaId, currentId);
        if (currentId === '0') {
            break;
        }
        entry = yield get_entry_1.default.execute({ entryId: currentId });
        results.push({ entryId: currentId, content: entry });
        counter++;
    }
    return { collection: results, akashaId: data.akashaId, limit: maxResults };
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = { execute, name: 'entryProfileIterator' };
//# sourceMappingURL=entry-profile-iterator.js.map