import * as Promise from 'bluebird';
import { constructed as contracts } from '../../contracts/index';
import { filter } from './set-filter';
import { GethConnector } from '@akashaproject/geth-connector';
import getProfileData from '../profile/profile-data';
import getEntry from '../entry/get-entry';
import currentProfile from '../registry/current-profile';
import resolveProfile from '../registry/resolve-ethaddress';
import queue from './queue';

let entries;
let comments;
let votes;
let following;
let tipping;

const eventTypes = {
    VOTE: 'vote',
    COMMENT: 'comment',
    PUBLISH: 'publish',
    FOLLOWING: 'following',
    TIPPED: 'gotTipped'
};

const VALUE_UNIT = 'ether';
const hydrateWithProfile = (cb, profile, entry, extra) => {
    const batch = [];
    batch.push(getProfileData.execute({ profile: profile }));
    batch.push(getEntry.execute({ entryId: entry }));
    Promise.all(batch)
        .then((result) => {
            queue.push(cb, Object.assign(extra, { author: result[0], entry: result[1] }));
        })
        .catch((error) => {
            cb({ message: error.message }, extra)
        });
};
/**
 * Get total number of your follows
 * @type {Function}
 */
const execute = Promise.coroutine(function*(data: { stop?: boolean }, cb) {
    if (!contracts.instance) {
        return { running: false };
    }

    if (data.stop && entries) {
        // clear all pending notifs
        queue.clear();

        entries.stopWatching(() => {
            entries = null;
        });
        comments.stopWatching(() => {
            comments = null;
        });
        votes.stopWatching(() => {
            votes = null;
        });
        following.stopWatching(() => {
            following = null;
        });
        tipping.stopWatching(() => {
            tipping = null;
        });
        return { running: false };
    }

    if (entries) {
        return { running: true, warn: true };
    }

    const filterBlock = { fromBlock: filter.getBlockNr(), toBlock: 'latest' };
    const myProfile = yield currentProfile.execute();
    const profileInstance = contracts.instance.profile.contract.at(myProfile.profileAddress);
    entries = contracts.instance.entries.contract.Publish({}, filterBlock);
    comments = contracts.instance.comments.contract.Commented({}, filterBlock);
    votes = contracts.instance.votes.contract.Vote({}, filterBlock);
    following = contracts.instance.feed.contract.Follow({ following: filter.getMyAddress() }, filterBlock);
    tipping = profileInstance.Tip({}, filterBlock);

    entries.watch((err, entry) => {
        if (err) {
            cb({ message: err.message, type: eventTypes.PUBLISH });
        }
        if (filter.hasAddress(entry.args.author)) {
            hydrateWithProfile(
                cb,
                entry.args.author,
                (entry.args.entryId).toString(),
                {
                    type: eventTypes.PUBLISH,
                    profileAddress: entry.args.author,
                    blockNumber: entry.blockNumber,
                    tag: GethConnector.getInstance().web3.toUtf8(entry.args.tag)
                }
            );
        }
    });

    comments.watch((err, comment) => {
        if (err) {
            cb({ message: err.message, type: eventTypes.COMMENT });
        }
        if (filter.hasAddress(comment.args.profile)) {

            hydrateWithProfile(
                cb,
                comment.args.profile,
                (comment.args.entryId).toString(),
                {
                    type: eventTypes.COMMENT,
                    profileAddress: comment.args.profile,
                    blockNumber: comment.blockNumber,
                    commentId: (comment.args.commentId).toString()
                }
            );
        }
    });

    votes.watch((err, vote) => {
        if (err) {
            cb({ message: err.message, type: eventTypes.VOTE });
        }
        if (filter.hasAddress(vote.args.profile)) {
            hydrateWithProfile(
                cb,
                vote.args.profile,
                (vote.args.entry).toString(),
                {
                    type: eventTypes.VOTE,
                    profileAddress: vote.args.profile,
                    blockNumber: vote.blockNumber,
                    weight: (vote.args.weight).toNumber()
                }
            );
        }
    });

    following.watch((err, event) => {
        if (err) {
            cb({ message: err.message, type: eventTypes.FOLLOWING });
        }
        getProfileData
            .execute({ profile: event.args.follower })
            .then((data) => {
                queue.push(
                    cb,
                    {
                        type: eventTypes.FOLLOWING,
                        blockNumber: event.blockNumber,
                        follower: data,
                        profileAddress: event.args.following
                    }
                )
            });
    });

    tipping.watch((err, event) => {
        if (err) {
            cb({ message: err.message, type: eventTypes.TIPPED });
        }
        resolveProfile
            .execute({ ethAddress: event.args.from })
            .then((profile) => {
                const ethers = GethConnector.getInstance().web3.fromWei(event.args.value, VALUE_UNIT);
                return getProfileData.execute({ profile: profile.profileAddress })
                    .then((resolvedProfile) => {
                        queue.push(
                            cb,
                            {
                                profile: resolvedProfile,
                                blockNumber: event.blockNumber,
                                value: ethers.toString(10),
                                unit: VALUE_UNIT,
                                type: eventTypes.TIPPED
                            }
                        );
                    });
            })
            .catch((e) => {
                cb({ message: e.message, type: eventTypes.TIPPED });
            });
    });
    return { running: true }
});

export default { execute, name: 'feed' };
