// @flow
import { apply, call, put, fork, all, select, takeEvery, takeLatest, getContext } from "redux-saga/effects";
import {
    COMMON_MODULE,
    PROFILE_MODULE,
    AUTH_MODULE,
    REGISTRY_MODULE /* UTILS_MODULE */
} from "@akashaproject/common/constants";
// import * as actionActions from '../actions/action-actions';
import * as appActions from "../actions/app-actions";
// import * as commentsActions from '../actions/comments-actions';
// import * as entryActions from '../actions/entry-actions';
import * as actions from "../actions/profile-actions";
// import * as searchActions from '../actions/search-actions';
import * as tempProfileActions from "../actions/temp-profile-actions";
import * as types from "../constants";
import * as profileService from "../services/profile-service";
import { isEthAddress } from "../../utils/dataModule";
import ChReqService from "../services/channel-request-service";
import { profileSelectors, externalProcessSelectors, appSelectors } from "../selectors";
// import * as actionStatus from '../../constants/action-status';
// import * as actionTypes from '../../constants/action-types';
import { getDisplayName } from "../../utils/dataModule";

/*::
    import type { Saga } from 'redux-saga';
 */

const TRANSFERS_ITERATOR_LIMIT = 20;
const FOLLOWERS_ITERATOR_LIMIT = 2;
const FOLLOWINGS_ITERATOR_LIMIT = 2;
const COMMENTS_ITERATOR_LIMIT = 3;

function* profileAethTransfersIterator () /* : Saga<void> */ {
    const ethAddress = yield select(profileSelectors.selectLoggedEthAddress);
    const toBlock = yield select(externalProcessSelectors.getCurrentBlockNumber);
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.transfersIterator, {
        ethAddress,
        toBlock,
        limit: TRANSFERS_ITERATOR_LIMIT
    });
}

function* profileEssenceIterator () /* : Saga<void> */ {
    const ethAddress = yield select(profileSelectors.selectLoggedEthAddress);
    const essenceIterator = yield select(profileSelectors.getEssenceIterator);
    const lastBlock =
        essenceIterator.lastBlock === null
            ? yield select(externalProcessSelectors.getCurrentBlockNumber)
            : essenceIterator.lastBlock;
    const moreRequest = !!essenceIterator.lastBlock;
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.essenceIterator, {
        ethAddress,
        lastBlock,
        lastIndex: essenceIterator.lastIndex,
        limit: 16,
        moreRequest
    });
}

function* profileBondAeth ({ actionId, amount }) /* : Saga<void> */ {
    const token = yield select(profileSelectors.getToken);
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.bondAeth, {
        actionId,
        amount,
        token
    });
}

function* profileBondAethSuccess ({ data }) /* : Saga<void> */ {
    yield put(
        appActions.showNotification({
            id: "bondAethSuccess",
            duration: 4,
            values: { amount: data.amount }
        })
    );
}

function* profileCommentsIterator ({ column }) /* : Saga<void> */ {
    const { id, value, reversed, firstBlock, firstIndex } = column;
    const lastBlock = reversed ? firstBlock : yield select(externalProcessSelectors.getCurrentBlockNumber);
    const lastIndex = reversed ? firstIndex : column.lastIndex;
    let akashaId, ethAddress;
    if (isEthAddress(value)) {
        ethAddress = value;
    } else {
        akashaId = value;
    }
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.commentsIterator, {
        columnId: id,
        limit: COMMENTS_ITERATOR_LIMIT,
        akashaId,
        ethAddress,
        lastBlock,
        lastIndex,
        reversed
    });
}

function* profileCreateEthAddress ({ passphrase, passphrase1 }) /* : Saga<void> */ {
    yield call([ChReqService, ChReqService.sendRequest], AUTH_MODULE, AUTH_MODULE.generateEthKey, {
        password: passphrase,
        password1: passphrase1
    });
}

function* profileCycleAeth ({ actionId, amount }) /* : Saga<void> */ {
    const token = yield select(profileSelectors.getToken);
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.cycleAeth, {
        actionId,
        amount,
        token
    });
}

function* profileCycleAethSuccess ({ data }) /* : Saga<void> */ {
    yield put(
        appActions.showNotification({
            id: "cycleAethSuccess",
            duration: 4,
            values: { amount: data.amount }
        })
    );
}

function* profileCyclingStates () /* : Saga<void> */ {
    const ethAddress = yield select(profileSelectors.selectLoggedEthAddress);
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.cyclingStates, {
        ethAddress
    });
}

function* profileDeleteLogged () /* : Saga<void> */ {
    try {
        yield call([profileService, profileService.profileDeleteLogged]);
        yield put(actions.profileDeleteLoggedSuccess());
    } catch (error) {
        yield put(actions.profileDeleteLoggedError(error));
    }
}

function* profileExists ({ akashaId }) /* : Saga<void> */ {
    if (akashaId.length === 1) {
        // yield put(actions.profileExistsSuccess({ akashaId, exists: false, idValid: false }));
    } else {
        yield call([ChReqService, ChReqService.sendRequest], REGISTRY_MODULE, REGISTRY_MODULE.profileExists, {
            akashaId
        });
    }
}

function* profileFaucet ({ actionId, ethAddress, withNotification }) /* : Saga<void> */ {
    if (!ethAddress) {
        ethAddress = yield select(profileSelectors.selectLoggedEthAddress);
    }
    yield call([ChReqService, ChReqService.sendRequest], COMMON_MODULE, COMMON_MODULE.requestEther, {
        address: ethAddress,
        actionId,
        withNotification
    });
}

function* profileFollow ({ actionId, ethAddress }) /* : Saga<void> */ {
    const token = yield select(profileSelectors.getToken);
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.followProfile, {
        token,
        actionId,
        ethAddress
    });
}

function* profileFollowSuccess ({ data }) /* : Saga<void> */ {
    const displayName = getDisplayName(data);
    yield put(
        appActions.showNotification({
            id: "followProfileSuccess",
            duration: 4,
            values: { displayName }
        })
    );
}

function* profileFollowersIterator ({ column, batching }) /* : Saga<void> */ {
    const { id, value } = column;
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.followersIterator, {
        columnId: id,
        ethAddress: value,
        limit: FOLLOWERS_ITERATOR_LIMIT,
        batching
    });
}

function* profileFollowingsIterator ({
    column,
    limit = FOLLOWINGS_ITERATOR_LIMIT,
    allFollowings,
    batching
}) /* : Saga<void> */ {
    const { id, value } = column;
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.followingIterator, {
        columnId: id,
        ethAddress: value,
        limit,
        allFollowings,
        batching
    });
}

function* profileFreeAeth ({ actionId, amount }) /* : Saga<void> */ {
    const token = yield select(profileSelectors.getToken);
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.freeAeth, {
        actionId,
        amount,
        token
    });
}

function* profileFreeAethSuccess () /* : Saga<void> */ {
    yield put(appActions.showNotification({ id: "freeAethSuccess", duration: 4 }));
}

function* profileGetBalance ({ unit = "ether" }) /* : Saga<void> */ {
    const ethAddress = yield select(profileSelectors.selectLoggedEthAddress);
    if (!ethAddress) {
        return;
    }
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.getBalance, {
        etherBase: ethAddress,
        unit
    });
}

function* profileGetByAddress ({ ethAddress }) /* : Saga<void> */ {
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.getByAddress, {
        ethAddress
    });
}

function* profileGetData ({ akashaId, context, ethAddress, full = false, batching }) /* : Saga<void> */ {
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.profileData, {
        akashaId,
        context,
        ethAddress,
        full,
        batching
    });
}

export function* profileGetExtraOfList (collection, context) /* : Saga<void> */ {
    const acs = yield all([
        ...collection
            .filter(prof => prof.ethAddress)
            .map(prof =>
                put(
                    actions.profileGetData({
                        context,
                        ethAddress: prof.ethAddress,
                        batching: true
                    })
                )
            )
    ]);
    if (acs.length) {
        yield fork(profileIsFollower, { followings: acs.map(action => action.ethAddress) });
    }
}

function* profileGetList ({ ethAddresses }) /* : Saga<void> */ {
    yield call(
        [ChReqService, ChReqService.sendRequest],
        PROFILE_MODULE,
        PROFILE_MODULE.getProfileList,
        ethAddresses
    );
}

function* profileGetLocal ({ polling }) /* : Saga<void> */ {
    // yield call(
    //     [ChReqService, ChReqService.sendRequest],
    //     UTILS_MODULE, UTILS_MODULE.checkUpdate,
    //     {}
    // );
    yield call([ChReqService, ChReqService.sendRequest], COMMON_MODULE, COMMON_MODULE.getLocalIdentities, {
        polling
    });
}

function* getCurrentProfile () /* : Saga<void> */ {
    try {
        yield call(
            [ChReqService, ChReqService.sendRequest],
            PROFILE_MODULE,
            PROFILE_MODULE.getCurrentProfile,
            {}
        );
    } catch (ex) {
        yield call(actions.getCurrentProfileError(ex));
    }
}

export function* profileGetLogged () /* : Saga<void> */ {
    try {
        const loggedProfile = yield select(state => state.profileState.get("loggedProfile"));
        if (loggedProfile.get("ethAddress")) {
            return;
        }
        const profile = yield apply(profileService, profileService.profileGetLogged);
        yield put(actions.profileGetLoggedSuccess(profile));
        yield put(actions.profileGetBalance());
        if (profile && profile.ethAddress) {
            yield call(profileGetData, {
                ethAddress: profile.ethAddress,
                full: true,
                akashaId: profile.akashaID,
                batching: false,
                context: null
            });
        }
    } catch (error) {
        yield put(actions.profileGetLoggedError(error));
    }
}

export function* profileGetPublishingCost () /* : Saga<void> */ {
    try {
        const loggedProfile = yield select(state => state.profileState.get("loggedProfile"));
        // yield call(
        //     [ChReqService, ChReqService.sendRequest],
        //     UTILS_MODULE, UTILS_MODULE.manaCosts, {
        //         ethAddress: loggedProfile.get('ethAddress')
        //     }
        // );
    } catch (ex) {
        yield call(actions.profileGetPublishingCostError(ex));
    }
}

function* profileIsFollower ({ followings, ethAddress }) /* : Saga<void> */ {
    if (!ethAddress) {
        ethAddress = yield select(profileSelectors.selectLoggedEthAddress);
    }
    const payload = followings.map(following => ({
        ethAddressFollower: ethAddress,
        ethAddressFollowing: following
    }));
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.isFollower, payload);
}

function* profileLogin ({ data }) /* : Saga<void> */ {
    const { ...payload } = data;
    payload.password = new global.TextEncoder("utf-8").encode(payload.password);
    yield call([ChReqService, ChReqService.sendRequest], COMMON_MODULE, COMMON_MODULE.login, payload);
}

function* profileLogout () /* : Saga<void> */ {
    yield call([ChReqService, ChReqService.sendRequest], COMMON_MODULE, COMMON_MODULE.logout, {});
}

function* profileKarmaRanking () /* : Saga<void> */ {
    const following = yield select(profileSelectors.selectAllFollowings);
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.karmaRanking, {
        following
    });
}

function* profileManaBurned () /* : Saga<void> */ {
    const ethAddress = yield select(profileSelectors.selectLoggedEthAddress);
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.manaBurned, {
        ethAddress
    });
}

function* profileMoreCommentsIterator ({ column }) /* : Saga<void> */ {
    const { id, lastIndex, lastBlock, value } = column;
    let akashaId, ethAddress;
    if (isEthAddress(value)) {
        ethAddress = value;
    } else {
        akashaId = value;
    }
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.commentsIterator, {
        columnId: id,
        ethAddress,
        akashaId,
        limit: COMMENTS_ITERATOR_LIMIT,
        lastBlock,
        lastIndex,
        more: true
    });
}

function* profileMoreFollowersIterator ({ column }) /* : Saga<void> */ {
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.followersIterator, {
        columnId: column.id,
        ethAddress: column.value,
        limit: FOLLOWERS_ITERATOR_LIMIT,
        lastBlock: column.lastBlock,
        lastIndex: column.lastIndex,
        totalLoaded: column.itemsList.size
    });
}

function* profileMoreFollowingsIterator ({ column }) /* : Saga<void> */ {
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.followingIterator, {
        columnId: column.id,
        ethAddress: column.value,
        limit: FOLLOWINGS_ITERATOR_LIMIT,
        lastBlock: column.lastBlock,
        lastIndex: column.lastIndex,
        totalLoaded: column.itemList ? column.itemsList.size : 0
    });
}

function* profileResolveIpfsHash ({ ipfsHash, columnId, akashaIds }) /* : Saga<void> */ {
    yield call(
        [ChReqService, ChReqService.sendRequest],
        PROFILE_MODULE,
        PROFILE_MODULE.resolveProfileIpfsHash,
        {
            ipfsHash,
            columnId,
            akashaIds
        }
    );
}

function* profileSaveLastBlockNr () /* : Saga<void> */ {
    const ethAddress = yield select(profileSelectors.selectLoggedEthAddress);
    const blockNr = yield select(externalProcessSelectors.getCurrentBlockNumber);
    try {
        yield call([profileService, profileService.profileSaveLastBlockNr], { ethAddress, blockNr });
    } catch (error) {
        yield put(actions.profileSaveLastBlockNrError(error));
    }
}

function* profileSaveLogged (loggedProfile) /* : Saga<void> */ {
    try {
        yield call([profileService, profileService.profileSaveLogged], loggedProfile);
    } catch (error) {
        yield put(actions.profileSaveLoggedError(error));
    }
}

function* profileSendTip ({
    actionId,
    akashaId,
    ethAddress,
    receiver,
    value,
    tokenAmount
}) /* : Saga<void> */ {
    const token = yield select(profileSelectors.getToken);
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.sendTip, {
        token,
        actionId,
        akashaId,
        ethAddress,
        receiver,
        value,
        tokenAmount
    });
}

function* profileSendTipSuccess ({ data }) /* : Saga<void> */ {
    const displayName = getDisplayName(data);
    yield put(
        appActions.showNotification({
            id: "sendTipSuccess",
            duration: 4,
            values: { displayName }
        })
    );
}

function* profileToggleDonations ({ actionId, status }) /* : Saga<void> */ {
    const token = yield select(profileSelectors.getToken);
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.toggleDonations, {
        token,
        actionId,
        status
    });
}

function* profileToggleDonationsSuccess () /* : Saga<void> */ {
    const profile = yield call([profileService, profileService.profileGetLogged]);
    if (profile && profile.ethAddress) {
        yield call(profileGetData, {
            batching: false,
            context: null,
            akashaId: profile.akashaId,
            ethAddress: profile.ethAddress,
            full: true
        });
    }
    yield put(
        appActions.showNotification({
            id: "toggleDonationsSuccess",
            duration: 4
        })
    );
}

function* profileTransferToken ({ actionId, akashaId, ethAddress, tokenAmount }) /* : Saga<void> */ {
    const token = yield select(profileSelectors.getToken);
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.transfer, {
        token,
        actionId,
        akashaId,
        ethAddress,
        tokenAmount
    });
}

function* profileTransferAethSuccess ({ data }) /* : Saga<void> */ {
    const displayName = getDisplayName(data);
    yield put(
        appActions.showNotification({
            id: "transferAethSuccess",
            duration: 4,
            values: { displayName, tokenAmount: data.tokenAmount }
        })
    );
}

function* profileTransferEth ({ actionId, akashaId, ethAddress, value }) /* : Saga<void> */ {
    const token = yield select(profileSelectors.getToken);
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.transfer, {
        token,
        actionId,
        akashaId,
        ethAddress,
        value
    });
}

function* profileTransferEthSuccess ({ data }) /* : Saga<void> */ {
    const displayName = getDisplayName(data);
    yield put(
        appActions.showNotification({
            id: "transferEthSuccess",
            duration: 4,
            values: { displayName, value: data.value }
        })
    );
}

function* profileTransformEssence ({ actionId, amount }) /* : Saga<void> */ {
    const token = yield select(profileSelectors.getToken);
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.transformEssence, {
        actionId,
        amount,
        token
    });
}

function* profileTransformEssenceSuccess ({ data }) /* : Saga<void> */ {
    yield put(
        appActions.showNotification({
            id: "transformEssenceSuccess",
            duration: 4,
            values: { amount: data.amount }
        })
    );
}

function* profileUnfollow ({ actionId, ethAddress }) /* : Saga<void> */ {
    const token = yield select(profileSelectors.getToken);
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.unFollowProfile, {
        token,
        actionId,
        ethAddress
    });
}

function* profileUnfollowSuccess ({ data }) /* : Saga<void> */ {
    const displayName = getDisplayName(data);
    yield put(
        appActions.showNotification({
            id: "unfollowProfileSuccess",
            duration: 4,
            values: { displayName }
        })
    );
}

function* profileUpdate ({
    actionId,
    about,
    avatar,
    backgroundImage,
    firstName,
    lastName,
    links
}) /* : Saga<void> */ {
    const isProfileEdit = select(appSelectors.selectProfileEditToggle);
    if (isProfileEdit) {
        yield put(appActions.profileEditToggle());
    }
    const token = yield select(profileSelectors.getToken);
    const ipfs = { about, avatar, backgroundImage, firstName, lastName, links };
    yield call([ChReqService, ChReqService.sendRequest], PROFILE_MODULE, PROFILE_MODULE.updateProfileData, {
        token,
        actionId,
        ipfs
    });
}

function* profileUpdateSuccess (payload) /* : Saga<void> */ {
    const { akashaId, ethAddress } = payload.data;
    // remove saved temp profile from DB
    yield put(tempProfileActions.tempProfileDeleteFull(ethAddress));
    // get updated profile data
    yield call(profileGetData, {
        akashaId,
        ethAddress: null,
        context: null,
        batching: false,
        full: true
    });
    yield put(
        appActions.showNotification({
            id: "updateProfileSuccess",
            duration: 4
        })
    );
}

function* profileUpdateLogged (loggedProfile) /* : Saga<void> */ {
    try {
        yield apply(profileService, profileService.profileUpdateLogged, [loggedProfile]);
    } catch (error) {
        yield put(actions.profileUpdateLoggedError(error));
    }
}

function* profileRegister ({
    actionId,
    akashaId,
    address,
    about,
    avatar,
    backgroundImage,
    donationsEnabled,
    firstName,
    lastName,
    links,
    ethAddress
}) /* : Saga<void> */ {
    const isProfileEdit = yield select(appSelectors.selectProfileEditToggle);
    if (isProfileEdit) {
        yield put(appActions.profileEditToggle());
    }
    const token = yield select(profileSelectors.getToken);
    const ipfs = { avatar, address, about, backgroundImage, firstName, lastName, links };
    yield call([ChReqService, ChReqService.sendRequest], REGISTRY_MODULE, REGISTRY_MODULE.registerProfile, {
        token,
        actionId,
        akashaId,
        donationsEnabled,
        ethAddress,
        ipfs
    });
}

function* profileRegisterSuccess (payload) /* : Saga<void> */ {
    const { akashaId, ethAddress } = payload.data;
    // remove saved temp profile from DB
    yield put(tempProfileActions.tempProfileDeleteFull(ethAddress));
    // get updated profile data
    yield call(profileGetData, {
        akashaId,
        ethAddress: null,
        context: null,
        batching: false,
        full: true
    });
    yield put(
        appActions.showNotification({
            id: "registerProfileSuccess",
            duration: 4
        })
    );
}

// eslint-disable-next-line max-statements
export function* watchProfileActions () /* : Saga<void> */ {
    // eslint-disable-line max-statements
    yield takeEvery(PROFILE_MODULE.transfersIterator, profileAethTransfersIterator);
    yield takeEvery(PROFILE_MODULE.bondAeth, profileBondAeth);
    // yield takeEvery(types.PROFILE_BOND_AETH_SUCCESS, profileBondAethSuccess);
    yield takeLatest(PROFILE_MODULE.commentsIterator, profileCommentsIterator);
    yield takeLatest(AUTH_MODULE.generateEthKey, profileCreateEthAddress);
    yield takeEvery(PROFILE_MODULE.cycleAeth, profileCycleAeth);
    // yield takeEvery(types.PROFILE_CYCLE_AETH_SUCCESS, profileCycleAethSuccess);
    yield takeEvery(PROFILE_MODULE.cyclingStates, profileCyclingStates);
    yield takeLatest(types.PROFILE_DELETE_LOGGED, profileDeleteLogged);
    yield takeEvery(PROFILE_MODULE.essenceIterator, profileEssenceIterator);
    yield takeLatest(REGISTRY_MODULE.profileExists, profileExists);
    yield takeEvery(COMMON_MODULE.requestEther, profileFaucet);
    yield takeEvery(PROFILE_MODULE.followProfile, profileFollow);
    // yield takeEvery(types.PROFILE_FOLLOW_SUCCESS, profileFollowSuccess);
    yield takeEvery(PROFILE_MODULE.followersIterator, profileFollowersIterator);
    yield takeEvery(PROFILE_MODULE.followingIterator, profileFollowingsIterator);
    yield takeEvery(PROFILE_MODULE.freeAeth, profileFreeAeth);
    // yield takeEvery(types.PROFILE_FREE_AETH_SUCCESS, profileFreeAethSuccess);
    yield takeLatest(PROFILE_MODULE.getBalance, profileGetBalance);
    yield takeEvery(PROFILE_MODULE.getByAddress, profileGetByAddress);
    yield takeEvery(PROFILE_MODULE.getCurrentProfile, getCurrentProfile);
    yield takeEvery(PROFILE_MODULE.profileData, profileGetData);
    yield takeLatest(PROFILE_MODULE.getProfileList, profileGetList);
    yield takeLatest(COMMON_MODULE.getLocalIdentities, profileGetLocal);
    yield takeLatest(types.PROFILE_GET_LOGGED, profileGetLogged);
    yield takeLatest(types.PROFILE_GET_LOGGED_SUCCESS, profileGetPublishingCost);
    // yield takeLatest(types.PROFILE_GET_PUBLISHING_COST, profileGetPublishingCost);
    yield takeEvery(PROFILE_MODULE.isFollower, profileIsFollower);
    yield takeEvery(PROFILE_MODULE.karmaRanking, profileKarmaRanking);
    yield takeLatest(COMMON_MODULE.login, profileLogin);
    yield takeLatest(COMMON_MODULE.logout, profileLogout);
    yield takeEvery(PROFILE_MODULE.manaBurned, profileManaBurned);
    yield takeEvery(PROFILE_MODULE.commentsIterator, profileMoreCommentsIterator);
    yield takeEvery(PROFILE_MODULE.followersIterator, profileMoreFollowersIterator);
    yield takeEvery(PROFILE_MODULE.followingIterator, profileMoreFollowingsIterator);
    yield takeEvery(PROFILE_MODULE.resolveProfileIpfsHash, profileResolveIpfsHash);
    yield takeEvery(types.PROFILE_SAVE_LAST_BLOCK_NR, profileSaveLastBlockNr);
    yield takeEvery(PROFILE_MODULE.sendTip, profileSendTip);
    // yield takeEvery(types.PROFILE_SEND_TIP_SUCCESS, profileSendTipSuccess);
    yield takeEvery(PROFILE_MODULE.toggleDonations, profileToggleDonations);
    // yield takeEvery(types.PROFILE_TOGGLE_DONATIONS_SUCCESS, profileToggleDonationsSuccess);
    yield takeEvery(PROFILE_MODULE.transfer, profileTransferToken);
    // yield takeEvery(types.PROFILE_TRANSFER_AETH_SUCCESS, profileTransferAethSuccess);
    // yield takeEvery(types.PROFILE_TRANSFER_ETH, profileTransferEth);
    // yield takeEvery(types.PROFILE_TRANSFER_ETH_SUCCESS, profileTransferEthSuccess);
    yield takeEvery(PROFILE_MODULE.transformEssence, profileTransformEssence);
    // yield takeEvery(types.PROFILE_TRANSFORM_ESSENCE_SUCCESS, profileTransformEssenceSuccess);
    yield takeEvery(PROFILE_MODULE.unFollowProfile, profileUnfollow);
    // yield takeEvery(types.PROFILE_UNFOLLOW_SUCCESS, profileUnfollowSuccess);
    yield takeEvery(PROFILE_MODULE.updateProfileData, profileUpdate);
    // yield takeEvery(types.PROFILE_UPDATE_SUCCESS, profileUpdateSuccess);
    yield takeEvery(REGISTRY_MODULE.registerProfile, profileRegister);
    // yield takeEvery(types.PROFILE_REGISTER_SUCCESS, profileRegisterSuccess);
}
