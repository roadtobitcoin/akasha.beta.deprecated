var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as BlPromise from 'bluebird';
import * as hash from 'object-hash';
import * as initContracts from '@akashaproject/contracts.js';
import { descend, filter, head, isNil, last, prop, sortWith, take, uniq } from 'ramda';
import { AUTH_MODULE, CORE_MODULE } from '@akashaproject/common/constants';
export default function init(sp, getService) {
    class Contracts {
        constructor() {
            this.watchers = [];
        }
        init() {
            return __awaiter(this, void 0, void 0, function* () {
                this.instance = yield initContracts(getService(CORE_MODULE.WEB3_API).instance.currentProvider);
            });
        }
        reset() {
            this.instance = null;
        }
        send(data, token, cb) {
            return (getService(AUTH_MODULE.auth)).signData(data.params[0], token)
                .once('transactionHash', function (txHash) {
                cb(null, { tx: txHash });
            })
                .once('error', function (error) {
                cb(error);
            });
        }
        createWatcher(ethEvent, args, fromBlock) {
            const currentWatcher = ethEvent(args, { fromBlock });
            this.watchers.push(currentWatcher);
            return currentWatcher;
        }
        stopAllWatchers() {
            this.watchers.forEach((watcher) => {
                return watcher.stopWatching(() => {
                });
            });
            this.watchers.length = 0;
            return BlPromise.delay(1000);
        }
        fromEvent(ethEvent, args, toBlock, limit, options) {
            const step = 5300;
            const hashedEvent = hash(Array.from(arguments));
            if (getService(CORE_MODULE.STASH).eventCache.hasFull(hashedEvent) &&
                !options.reversed) {
                return Promise.resolve(getService(CORE_MODULE.STASH).eventCache.getFull(hashedEvent));
            }
            return new Promise((resolve, reject) => {
                let results = [];
                let filterIndex;
                if (!options.reversed) {
                    filterIndex = (record) => record.blockNumber < toBlock ||
                        (record.blockNumber === toBlock && record.logIndex < options.lastIndex);
                }
                else {
                    filterIndex = (record) => record.blockNumber > toBlock;
                }
                const fetch = (to) => {
                    let fromBlock = (options.reversed) ? toBlock : to - step;
                    if (fromBlock < 0) {
                        fromBlock = 0;
                    }
                    const event = ethEvent(args, { fromBlock, toBlock: (options.reversed) ? 'latest' : to });
                    event.get((err, data) => {
                        if (err) {
                            return reject(err);
                        }
                        const filteredData = (!isNil(options.lastIndex))
                            ? filter(filterIndex, data) : data;
                        results = uniq(results.concat(filteredData));
                        if (results.length < limit && fromBlock > 0 && !options.reversed) {
                            if (!options.stopOnFirst || !results.length) {
                                return fetch(fromBlock);
                            }
                        }
                        const sortedResults = take(limit, sortWith([
                            descend(prop('blockNumber')),
                            descend(prop('logIndex')),
                        ], results));
                        const lastLog = options.reversed ?
                            head(sortedResults) : last(sortedResults);
                        const lastIndex = lastLog ? lastLog.logIndex : 0;
                        let lastBlock;
                        if (options.reversed) {
                            lastBlock = lastLog ? lastLog.blockNumber : fromBlock;
                        }
                        else {
                            lastBlock = lastLog ?
                                (sortedResults.length === limit && fromBlock !== 0) ?
                                    lastLog.blockNumber : 0 : 0;
                        }
                        const result = { results: sortedResults, fromBlock: lastBlock, lastIndex };
                        getService(CORE_MODULE.STASH).eventCache.setFull(hashedEvent, result);
                        return resolve(result);
                    });
                };
                fetch(toBlock);
            });
        }
        fromEventFilter(ethEvent, args, toBlock, limit, options, aditionalFilter) {
            const step = 8300;
            const hashedEvent = hash(Array.from(arguments));
            if (getService(CORE_MODULE.STASH).eventCache.hasFull(hashedEvent) &&
                !options.reversed) {
                return Promise.resolve(getService(CORE_MODULE.STASH).eventCache.getFull(hashedEvent));
            }
            return new Promise((resolve, reject) => {
                let results = [];
                let filterIndex;
                if (!options.reversed) {
                    filterIndex = record => record.blockNumber < toBlock ||
                        (record.blockNumber === toBlock && record.logIndex < options.lastIndex);
                }
                else {
                    filterIndex = record => record.blockNumber > toBlock;
                }
                const fetch = (to) => {
                    let fromBlock = (options.reversed) ? toBlock : to - step;
                    if (fromBlock < 0) {
                        fromBlock = 0;
                    }
                    const event = ethEvent(args, {
                        fromBlock,
                        toBlock: (options.reversed) ? 'latest' : to,
                    });
                    event.get((err, data) => {
                        if (err) {
                            return reject(err);
                        }
                        const filteredData = filter(aditionalFilter, filter(filterIndex, data));
                        results = uniq(results.concat(filteredData));
                        if (results.length < limit && fromBlock > 0 && !options.reversed) {
                            return fetch(fromBlock);
                        }
                        const sortedResults = take(limit, sortWith([
                            descend(prop('blockNumber')),
                            descend(prop('logIndex')),
                        ], results));
                        const lastLog = options.reversed ?
                            head(sortedResults) : last(sortedResults);
                        const lastIndex = lastLog ? lastLog.logIndex : 0;
                        let lastBlock;
                        if (options.reversed) {
                            lastBlock = lastLog ? lastLog.blockNumber : fromBlock;
                        }
                        else {
                            lastBlock = lastLog ?
                                (sortedResults.length === limit && fromBlock !== 0) ?
                                    lastLog.blockNumber : 0 : 0;
                        }
                        const result = { results: sortedResults, fromBlock: lastBlock, lastIndex };
                        getService(CORE_MODULE.STASH).eventCache.setFull(hashedEvent, result);
                        return resolve(result);
                    });
                };
                fetch(toBlock);
            });
        }
    }
    const contracts = new Contracts();
    const service = function () {
        return contracts;
    };
    sp().service(CORE_MODULE.CONTRACTS, service);
}
//# sourceMappingURL=contracts.js.map