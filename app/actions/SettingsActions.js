import * as types from '../constants/SettingsConstants';
import { AppActions } from './AppActions';
import { SettingsService } from '../services';

// save app level settings
class SettingsActions {
    constructor (dispatch) {
        this.settingsService = new SettingsService;
        this.appActions = new AppActions(dispatch);
        this.dispatch = dispatch;
    }
    saveSettings = (table, settings) =>
        this.settingsService.saveSettings(table, settings).then((data) => {
            this.dispatch({ type: types.SAVE_SETTINGS_SUCCESS, settings, table });
        }).catch(reason =>
            this.dispatch({ type: types.SAVE_SETTINGS_ERROR, error: reason, table }));

    getSettings (table) {
        // return (dispatch) => {
        //     return this.settingsService.getSettings(table).then(
        //         data => dispatch({ type: types.GET_SETTINGS_SUCCESS, data, table })
        //         () => dispatch({ type: types.GET_SETTINGS_ERROR, error: 'error?', table })
        //     )
        // }
        return this.settingsService.getSettings(table).then((data) => {
            if (!data) {
                return this.dispatch({ type: types.GET_SETTINGS_ERROR, error: 'error?', table });
            }
            return this.dispatch({ type: types.GET_SETTINGS_SUCCESS, data, table });
        }).catch(reason => this.dispatch({ type: types.GET_SETTINGS_ERROR, error: reason, table }));
    }
    saveUserSettings () {}
    getUserSettings () {}
}
export { SettingsActions };
