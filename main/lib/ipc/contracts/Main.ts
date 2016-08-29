import * as Promise from 'bluebird';
import BaseContract from './BaseContract';

export default class Main extends BaseContract {
    constructor(instance: any) {
        super();
        this.contract = Promise.promisifyAll(instance);
        this.contract.getVoteOf.callAsync = Promise.promisify(this.contract.getVoteOf.call);
        this.contract.openedToVotes.callAsync = Promise.promisify(this.contract.openedToVotes.call);
        this.contract.voteEndDate.callAsync = Promise.promisify(this.contract.voteEndDate.call);
        this.contract.getScoreOfEntry.callAsync = Promise.promisify(this.contract.getScoreOfEntry.call);
        this.contract.getFundsAddress.callAsync = Promise.promisify(this.contract.getFundsAddress.call);
        this.contract.getCommentsCount.callAsync = Promise.promisify(this.contract.getCommentsCount.call);
        this.contract.getCommentAt.callAsync = Promise.promisify(this.contract.getCommentAt.call);
        this.contract.getScoreOfComment.callAsync = Promise.promisify(this.contract.getScoreOfComment.call);
    }

    /**
     *
     * @param profile
     * @param entryAddress
     * @returns {any}
     */
    getVoteOf(profile: string, entryAddress: string) {
        return this.contract
            .getVoteOf
            .callAsync(profile, entryAddress);
    }

    /**
     *
     * @param entryAddress
     * @returns {any}
     */
    openedToVotes(entryAddress: string) {
        return this.contract
            .openedToVotes
            .callAsync(entryAddress);
    }

    /**
     *
     * @param entryAddress
     * @returns {any}
     */
    voteEndDate(entryAddress: string) {
        return this.contract
            .voteEndDate
            .callAsync(entryAddress);
    }

    /**
     *
     * @param entryAddress
     * @returns {any}
     */
    getScoreOfEntry(entryAddress: string) {
        return this.contract
            .getScoreOfEntry
            .callAsync(entryAddress);
    }

    /**
     *
     * @returns {any}
     */
    getFundsAddress() {
        return this.contract
            .getFundsAddress
            .callAsync();
    }

    /**
     *
     * @param entryAddress
     * @returns {any}
     */
    getCommentsCount(entryAddress: string) {
        return this.contract
            .getCommentsCount
            .callAsync(entryAddress);
    }

    /**
     *
     * @param entry
     * @param commentId
     * @returns {any}
     */
    getCommentAt(entry: string, commentId: number) {
        const commentIdTr = this.gethInstance.web3.fromDecimal(commentId);
        return this.contract
            .getCommentAt
            .callAsync(entry, commentIdTr);
    }

    /**
     *
     * @param entry
     * @param commentId
     * @returns {any}
     */
    getScoreOfComment(entry: string, commentId: number) {
        const commentIdTr = this.gethInstance.web3.fromDecimal(commentId);
        return this.contract
            .getScoreOfComment
            .callAsync(entry, commentIdTr);
    }

    /**
     *
     * @param hash
     * @param tags
     * @param gas
     * @returns {any}
     */
    publishEntry(hash: string[], tags: string[], gas?: number) {
        const hashTr = hash.map((v) => {
            return this.gethInstance.web3.fromUtf8(v);
        });
        const tagsTr = tags.map((v) => {
           return this.gethInstance.web3.fromUtf8(v);
        });
        return this.contract
            .publishEntryAsync(hashTr, tagsTr, {gas});
    }

    /**
     *
     * @param hash
     * @param entryAddress
     * @param gas
     * @returns {any}
     */
    updateEntry(hash: string[], entryAddress: string, gas?: number) {
        const hashTr = hash.map((v) => {
            return this.gethInstance.web3.fromUtf8(v);
        });
        return this.contract
            .updateEntryAsync(hashTr, entryAddress, {gas});
    }

    /**
     *
     * @param entryAddress
     * @param weight
     * @param gas
     * @returns {any}
     */
    upVoteEntry(entryAddress: string, weight: number, gas?: number) {
        const weightTr = this.gethInstance.web3.fromDecimal(weight);
        return this.contract
            .upVoteEntryAsync(entryAddress, weightTr, {gas});
    }

    /**
     *
     * @param entryAddress
     * @param weight
     * @param gas
     * @returns {any}
     */
    downVoteEntry(entryAddress: string, weight: number, gas?: number) {
        const weightTr = this.gethInstance.web3.fromDecimal(weight);
        return this.contract
            .downVoteEntryAsync(entryAddress, weightTr, {gas});
    }

    /**
     *
     * @param entryAddress
     * @param hash
     * @param gas
     * @returns {any}
     */
    saveComment(entryAddress: string, hash: string[], gas?: number) {
        const hashTr = hash.map((v) => {
            return this.gethInstance.web3.fromUtf8(v);
        });
        return this.contract
            .saveCommentAsync(entryAddress, hashTr, {gas});
    }

    /**
     *
     * @param entryAddress
     * @param commentId
     * @param hash
     * @param gas
     * @returns {any}
     */
    updateComment(entryAddress: string, commentId: number, hash: string[], gas?: number) {
        const hashTr = hash.map((v) => {
            return this.gethInstance.web3.fromUtf8(v);
        });
        const commentIdTr = this.gethInstance.web3.fromDecimal(commentId);
        return this.contract
            .updateCommentAsync(entryAddress, commentIdTr, hashTr, {gas});
    }

    /**
     *
     * @param entryAddress
     * @param weigth
     * @param commentId
     * @param gas
     * @returns {any}
     */
    upVoteComment(entryAddress: string, weigth: number, commentId: number, gas?: number) {
        const weigthTr = this.gethInstance.web3.fromDecimal(weigth);
        const commentIdTr = this.gethInstance.web3.fromDecimal(commentId);
        return this.contract
            .upVoteCommentAsync(entryAddress, weigthTr, commentIdTr, {gas});
    }

    /**
     *
     * @param entryAddress
     * @param weigth
     * @param commentId
     * @param gas
     * @returns {any}
     */
    downVoteComment(entryAddress: string, weigth: number, commentId: number, gas?: number) {
        const weigthTr = this.gethInstance.web3.fromDecimal(weigth);
        const commentIdTr = this.gethInstance.web3.fromDecimal(commentId);
        return this.contract
            .downVoteCommentAsync(entryAddress, weigthTr, commentIdTr, {gas});
    }
}