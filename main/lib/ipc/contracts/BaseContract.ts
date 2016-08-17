import { GethConnector } from '@akashaproject/geth-connector';

export default class BaseContract {
    protected contract: any;
    protected gethInstance: GethConnector;

    /**
     *
     */
    constructor() {
        this.gethInstance = GethConnector.getInstance();
    }

    /**
     * Join ipfs hash slices
     * @param ipfsHash
     * @returns {any}
     */
    flattenIpfs(ipfsHash: string[]) {
        return this.gethInstance.web3.toUtf8(`${ipfsHash[0]}${ipfsHash[1]}`);
    }
}