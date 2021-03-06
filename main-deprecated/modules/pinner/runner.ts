import * as Promise from 'bluebird';
import { IpfsConnector } from '@akashaproject/ipfs-connector';
import contracts from '../../contracts/index';
import { unpad } from 'ethereumjs-util';
import { encodeHash } from '../ipfs/helpers';

export enum ObjectType {PROFILE = 1, ENTRY = 2, COMMENT = 3}

export enum OperationType {ADD = 1, REMOVE = 2}

const execute = Promise.coroutine(function* (data: { type: ObjectType, id: any, operation: OperationType }) {
    let hashRoot;
    switch (data.type) {
        case ObjectType.PROFILE:
            // here id is ethAddress
            let profileHex = yield contracts.instance.ProfileResolver.reverse(data.id);
            if (!!unpad(profileHex)) {
                const [, , , fn, digestSize, hash] = yield contracts.instance.ProfileResolver.resolve(profileHex);
                hashRoot = encodeHash(fn, digestSize, hash);
            }
            break;
        case ObjectType.ENTRY:
            const [fnE, digestSizeE, hashE] = yield contracts.instance.Entries.getEntry(data.id.ethAddress, data.id.entryId);
            hashRoot = encodeHash(fnE, digestSizeE, hashE);
            break;
        case ObjectType.COMMENT:
            const [, , , , fnC, digestSizeC, hashC] = yield contracts.instance.Comments.getComment(data.id.entryId, data.id.commentId);
            hashRoot = encodeHash(fnC, digestSizeC, hashC);
            break;
        default:
            throw new Error('No known type specified');
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
