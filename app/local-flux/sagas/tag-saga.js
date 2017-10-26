import { apply, call, fork, put, select, take, takeEvery, takeLatest } from 'redux-saga/effects';
import { actionChannels, enableChannel } from './helpers';
import { selectToken } from '../selectors';
import * as actions from '../actions/tag-actions';
import * as actionActions from '../actions/action-actions';
import * as types from '../constants';
import * as actionStatus from '../../constants/action-status';

const Channel = global.Channel;
const TAG_SEARCH_LIMIT = 10;

function* tagCreate ({ data }) {
    const channel = Channel.server.tags.create;
    const token = yield select(selectToken);
    yield call(enableChannel, channel, Channel.client.tags.manager);
    yield call([channel, channel.send], {
        ...data,
        token,
    });
}

function* tagGetEntriesCount ({ tags }) {
    const channel = Channel.server.entry.getTagEntriesCount;
    yield call(enableChannel, channel, Channel.client.entry.manager);
    yield apply(channel, channel.send, [tags]);
}

function* tagSearch ({ tagName }) {
    const channel = Channel.server.tags.searchTag;
    yield call(enableChannel, channel, Channel.client.tags.manager);
    yield apply(channel, channel.send, [{ tagName, limit: TAG_SEARCH_LIMIT }]);
}

// Channel watchers
function* watchTagCreateChannel () {
    while (true) {
        const response = yield take(actionChannels.tags.create);
        if (response.error) {
            yield put(actions.tagCreateError(response.error));
        } else {
            return yield put(actionActions.actionUpdate({
                id: response.request.actionId,
                status: actionStatus.publishing,
                tx: response.data.tx
            }));
        }
    }
}
function* watchTagGetEntriesCountChannel () {
    while (true) {
        const resp = yield take(actionChannels.entry.getTagEntriesCount);
        if (resp.error) {
            yield put(actions.tagGetEntriesCountError(resp.error));
        } else {
            yield put(actions.tagGetEntriesCountSuccess(resp.data));
        }
    }
}

function* watchTagSearchChannel () {
    while (true) {
        const resp = yield take(actionChannels.tags.searchTag);
        if (resp.error) {
            yield put(actions.tagSearchError(resp.error));
        } else {
            const query = yield select(state => state.tagState.get('searchQuery'));
            if (query === resp.request.tagName) {
                yield put(actions.tagSearchSuccess(resp.data.collection));
                yield put(actions.tagGetEntriesCount(resp.data.collection.map(tagName => ({ tagName }))));
            }
        }
    }
}

export function* registerTagListeners () {
    yield fork(watchTagCreateChannel);
    yield fork(watchTagGetEntriesCountChannel);
    yield fork(watchTagSearchChannel);
}

export function* watchTagActions () {
    yield takeEvery(types.TAG_CREATE, tagCreate);
    yield takeEvery(types.TAG_GET_ENTRIES_COUNT, tagGetEntriesCount);
    yield takeLatest(types.TAG_SEARCH, tagSearch);
}
