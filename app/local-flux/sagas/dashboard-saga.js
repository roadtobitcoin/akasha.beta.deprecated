import { apply, call, fork, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import * as actions from '../actions/dashboard-actions';
import * as dashboardService from '../services/dashboard-service';
import * as profileService from '../services/profile-service';
import * as types from '../constants';
import * as columnTypes from '../../constants/columns';
import { selectActiveDashboardId, selectDashboards,
    selectLoggedEthAddress } from '../selectors';

function* dashboardAdd ({ name, columns = [] }) {
    try {
        const ethAddress = yield select(selectLoggedEthAddress);
        const dashboard = yield apply(
            dashboardService,
            dashboardService.addDashboard,
            [{ ethAddress, columns, name }]
        );
        yield put(actions.dashboardAddSuccess(dashboard));
    } catch (error) {
        yield put(actions.dashboardAddError(error));
    }
}

function* dashboardAddColumn ({ columnType, value }) {
    try {
        const dashboardId = yield select(selectActiveDashboardId);
        const data = yield apply(
            dashboardService,
            dashboardService.addColumn,
            [{ dashboardId, type: columnType, value }]
        );
        yield put(actions.dashboardAddColumnSuccess(data));
    } catch (error) {
        yield put(actions.dashboardAddColumnError(error));
    }
}

function* dashboardAddFirst ({ interests }) {
    const columns = interests ?
        interests.tag.map(tag => ({ type: columnTypes.tag, value: tag })) :
        [];
    yield call(dashboardAdd, { name: 'General', columns });
    yield put(actions.dashboardAddFirstSuccess());
}

function* dashboardDelete ({ id }) {
    try {
        yield apply(dashboardService, dashboardService.deleteDashboard, [id]);
        yield fork(dashboardSetNextActive, id); // eslint-disable-line
        yield put(actions.dashboardDeleteSuccess({ id }));
    } catch (error) {
        yield put(actions.dashboardDeleteError(error));
    }
}

function* dashboardDeleteColumn ({ columnId }) {
    try {
        const dashboardId = yield select(selectActiveDashboardId);
        const dashboard = yield apply(
            dashboardService,
            dashboardService.deleteColumn,
            [{ dashboardId, columnId }]
        );
        yield put(actions.dashboardDeleteColumnSuccess({ columnId, dashboard }));
    } catch (error) {
        yield put(actions.dashboardDeleteColumnError(error));
    }
}

export function* dashboardGetActive () {
    try {
        const ethAddress = yield select(selectLoggedEthAddress);
        const data = yield apply(dashboardService, dashboardService.getActive, [ethAddress]);
        yield put(actions.dashboardGetActiveSuccess(data && data.id));
    } catch (error) {
        yield put(actions.dashboardGetActiveError(error));
    }
}

export function* dashboardGetAll () {
    try {
        const ethAddress = yield select(selectLoggedEthAddress);
        const data = yield apply(dashboardService, dashboardService.getAll, [ethAddress]);
        yield put(actions.dashboardGetAllSuccess(data));
    } catch (error) {
        yield put(actions.dashboardGetAllError(error));
    }
}

export function* dashboardGetProfileSuggestions (request) {
    try {
        const { akashaId } = request;
        const suggestions = yield apply(profileService, profileService.profileGetSuggestions, [akashaId]);
        yield put(actions.dashboardGetProfileSuggestionsSuccess(suggestions, request));
        return { suggestions };
    } catch (error) {
        yield put(actions.dashboardGetProfileSuggestionsError(error, request));
        return { error };
    }
}

function* dashboardRename ({ dashboardId, newName }) {
    try {
        const ethAddress = yield select(selectLoggedEthAddress);
        const data = yield apply(
            dashboardService,
            dashboardService.renameDashboard,
            [{ dashboardId, ethAddress, newName }]
        );
        yield put(actions.dashboardRenameSuccess(data));
    } catch (error) {
        yield put(actions.dashboardRenameError(error));
    }
}

function* dashboardSetActive ({ id }) {
    try {
        const ethAddress = yield select(selectLoggedEthAddress);
        yield apply(dashboardService, dashboardService.setActive, [{ ethAddress, id }]);
        yield put(actions.dashboardSetActiveSuccess(id));
    } catch (error) {
        yield put(actions.dashboardSetActiveError(error));
    }
}

function* dashboardSetNextActive (id) {
    const activeDashboard = yield select(state => state.dashboardState.get('activeDashboard'));
    if (activeDashboard === id) {
        const dashboards = (yield select(selectDashboards)).toList();
        const index = dashboards.findIndex(dashboard => dashboard.get('id') === id);
        let newActiveDashboard;
        if (index === dashboards.size - 1) {
            newActiveDashboard = dashboards.getIn([index - 1, 'id']);
        } else {
            newActiveDashboard = dashboards.getIn([index + 1, 'id']);
        }
        yield put(actions.dashboardSetActive(newActiveDashboard));
    }
}

function* dashboardToggleTagColumn ({ dashboardId, tag }) {
    try {
        const dashboard = yield apply(
            dashboardService,
            dashboardService.toggleTagColumn,
            [{ dashboardId, tag }]
        );
        yield put(actions.dashboardToggleTagColumnSuccess(dashboard));
    } catch (error) {
        yield put(actions.dashboardToggleTagColumnError(error));
    }
}

function* dashboardUpdateColumn ({ id, changes }) {
    try {
        const dashboardId = yield select(selectActiveDashboardId);
        yield apply(
            dashboardService,
            dashboardService.updateColumn,
            [{ dashboardId, id, changes }]
        );
        const data = { id, changes };
        yield put(actions.dashboardUpdateColumnSuccess(data));
    } catch (error) {
        yield put(actions.dashboardUpdateColumnError(error));
    }
}

export function* watchDashboardActions () {
    yield takeEvery(types.DASHBOARD_ADD, dashboardAdd);
    yield takeEvery(types.DASHBOARD_ADD_COLUMN, dashboardAddColumn);
    yield takeEvery(types.DASHBOARD_ADD_FIRST, dashboardAddFirst);
    yield takeEvery(types.DASHBOARD_DELETE, dashboardDelete);
    yield takeEvery(types.DASHBOARD_DELETE_COLUMN, dashboardDeleteColumn);
    yield takeLatest(types.DASHBOARD_GET_PROFILE_SUGGESTIONS, dashboardGetProfileSuggestions);
    yield takeEvery(types.DASHBOARD_RENAME, dashboardRename);
    yield takeEvery(types.DASHBOARD_SET_ACTIVE, dashboardSetActive);
    yield takeEvery(types.DASHBOARD_TOGGLE_TAG_COLUMN, dashboardToggleTagColumn);
    yield takeEvery(types.DASHBOARD_UPDATE_COLUMN, dashboardUpdateColumn);
}
