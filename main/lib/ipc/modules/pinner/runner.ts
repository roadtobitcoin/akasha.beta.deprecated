import * as Promise from 'bluebird';
import { IpfsConnector } from '@akashaproject/ipfs-connector';
import { constructed as contracts } from '../../contracts/index';
export enum ObjectType {PROFILE = 1, ENTRY = 2, COMMENT = 3}
export enum OperationType {ADD = 1, REMOVE = 2}

const execute = Promise.coroutine(function*(data: { type: ObjectType, id: string | string[], operation: OperationType }) {
    let hashRoot;
    switch (data.type) {
        case ObjectType.PROFILE:
            // here id is AKASHA ID
            const profileAddress = yield contracts.instance.registry.addressOf(data.id);
            hashRoot = yield contracts.instance.profile.getIpfs(profileAddress);
            break;
        case ObjectType.ENTRY:
            const entryEth = yield contracts.instance.entries.getEntry(data.id);
            hashRoot = entryEth.ipfsHash;
            break;
        case ObjectType.COMMENT:
            if (data.id.length !== 2 || !Array.isArray(data.id)) {
                throw new Error('Comments must provide [entryId, commentdId]');
            }
            //  id is [entryId:string, commentId: string]
            const commentEth = yield contracts.instance.comments.getComment.apply(this, data.id);
            hashRoot = commentEth.ipfsHash;
            break;
        default:
            throw new Error('No known type specified')
    }
    const pin = yield Promise.fromCallback((cb) => {
        if (data.operation === OperationType.REMOVE) {
            return IpfsConnector.getInstance().api.apiClient.pin.rm(hashRoot, { recursive: true }, cb);
        }
        if (data.operation === OperationType.ADD) {
            return IpfsConnector.getInstance().api.apiClient.pin.add(hashRoot, { recursive: true }, cb);
        }
        throw new Error('Operation for pinning not specified');
    });
    return { pin, id: data.id };
});

export default { execute, name: 'pin' };