import { call, fork, put, select, takeEvery } from 'redux-saga/effects';
import * as actionActions from '../actions/action-actions';
import * as appActions from '../actions/app-actions';
import * as claimableActions from '../actions/claimable-actions';
import * as eProcActions from '../actions/external-process-actions';
import * as notificationsActions from '../actions/notifications-actions';
import * as profileActions from '../actions/profile-actions';
import { selectLoggedEthAddress } from '../selectors';
import { createActionChannels } from './helpers';
import * as actionSaga from './action-saga';
import * as appSaga from './app-saga';
import * as claimableSaga from './claimable-saga';
import * as commentsSaga from './comments-saga';
import * as draftSaga from './draft-saga';
import * as dashboardSaga from './dashboard-saga';
import * as entrySaga from './entry-saga';
import * as externalProcSaga from './external-process-saga';
import * as highlightSaga from './highlight-saga';
import * as licenseSaga from './license-saga';
import * as listSaga from './list-saga';
import * as notificationsSaga from './notifications-saga';
import * as profileSaga from './profile-saga';
import * as searchSaga from './search-saga';
import * as settingsSaga from './settings-saga';
import * as tagSaga from './tag-saga';
import * as tempProfileSaga from './temp-profile-saga';
import * as transactionSaga from './transaction-saga';
import * as utilsSaga from './utils-saga';
import * as types from '../constants';
import { loadAkashaDB } from '../services/db/dbs';

function* registerListeners () {
    yield fork(claimableSaga.registerClaimableListeners);    
    yield fork(commentsSaga.registerCommentsListeners);
    yield fork(licenseSaga.registerLicenseListeners);
    yield fork(entrySaga.registerEntryListeners);
    yield fork(externalProcSaga.registerEProcListeners);
    yield fork(notificationsSaga.registerNotificationsListeners);
    yield fork(profileSaga.registerProfileListeners);
    yield fork(searchSaga.registerSearchListeners);
    yield fork(tagSaga.registerTagListeners);
    yield fork(transactionSaga.registerTransactionListeners);
    yield fork(utilsSaga.registerUtilsListeners);
}

function* launchActions () {
    const timestamp = new Date().getTime();
    yield put(eProcActions.servicesSetTimestamp(timestamp));
    // from local db
    yield fork(settingsSaga.getSettings);

    // from geth.options channel
    yield fork(externalProcSaga.gethGetOptions);
    // from ipfs.getConfig channel
    yield fork(externalProcSaga.ipfsGetConfig);

    yield fork(externalProcSaga.gethGetStatus);
    yield fork(externalProcSaga.ipfsGetStatus);
}

function* getUserSettings () {
    yield call(settingsSaga.userSettingsRequest);
    yield put(notificationsActions.notificationsSubscribe());
}

function* launchHomeActions () {
    yield call(profileSaga.profileGetLogged);
    yield fork(dashboardSaga.dashboardGetActive);
    yield fork(dashboardSaga.dashboardGetAll);
    yield fork(highlightSaga.highlightGetAll);
    yield fork(listSaga.listGetAll);
    yield fork(getUserSettings);
    const loggedEthAddress = yield select(selectLoggedEthAddress);
    if (loggedEthAddress) {
        yield put(actionActions.actionGetPending());
        yield put(claimableActions.claimableIterator());
        yield put(profileActions.profileFollowingsIterator({
            column: { value: loggedEthAddress }, 
            allFollowings: true,
            limit: 1000
        }));
        yield put(profileActions.profileCyclingStates());
    }
    yield put(profileActions.profileManaBurned());
}

function* bootstrapApp () {
    // the appReady action will be dispatched after these actions will be called
    yield call(launchActions);
    yield put(appActions.appReady());
}

function* bootstrapHome () {
    // launch the necessary actions for the home/dashboard component
    yield call(launchHomeActions);
    yield put(appActions.bootstrapHomeSuccess());
}

function* watchBootstrapHome () {
    yield takeEvery(types.BOOTSTRAP_HOME, bootstrapHome);
}

export default function* rootSaga () { // eslint-disable-line max-statements
    createActionChannels();
    yield call(loadAkashaDB);
    yield fork(registerListeners);
    yield fork(actionSaga.watchActionActions);
    yield fork(appSaga.watchAppActions);
    yield fork(claimableSaga.watchClaimableActions);    
    yield fork(commentsSaga.watchCommentsActions);
    yield fork(dashboardSaga.watchDashboardActions);
    yield fork(draftSaga.watchDraftActions);
    yield fork(entrySaga.watchEntryActions);
    yield fork(externalProcSaga.watchEProcActions);
    yield fork(highlightSaga.watchHighlightActions);
    yield fork(licenseSaga.watchLicenseActions);
    yield fork(listSaga.watchListActions);
    yield fork(notificationsSaga.watchNotificationsActions);
    yield fork(profileSaga.watchProfileActions);
    yield fork(searchSaga.watchSearchActions);
    yield fork(settingsSaga.watchSettingsActions);
    yield fork(tagSaga.watchTagActions);
    yield fork(tempProfileSaga.watchTempProfileActions);
    yield fork(transactionSaga.watchTransactionActions);
    yield fork(utilsSaga.watchUtilsActions);
    yield fork(bootstrapApp);
    yield fork(watchBootstrapHome);
}
