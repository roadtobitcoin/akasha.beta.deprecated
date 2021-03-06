import { Record, OrderedSet } from 'immutable';

export const IpfsStatus = Record({
    api: false,
    baseUrl: '',
    downloading: null,
    process: false,
    progress: null,
    started: null,
    starting: null,
    stopped: null,
    upgrading: null,
    version: null,
    state: null,
});

const IpfsFlags = Record({
    busyState: false,
    ipfsStarting: false,
    portsRequested: false,
    settingPorts: false,
    statusFetched: false,
});

export const IpfsRecord = Record({
    flags: new IpfsFlags(),
    lastLogTimestamp: null,
    logs: new OrderedSet(),
    status: new IpfsStatus(),
});
