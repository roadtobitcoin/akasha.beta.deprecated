import { SettingsActions, EProcActions } from '../';

let externalProcessBundleActions = null;

class ExternalProcessBundleActions {
    constructor (dispatch) {
        if (!externalProcessBundleActions) {
            externalProcessBundleActions = this;
        }
        this.dispatch = dispatch;
        this.settingsActions = new SettingsActions(this.dispatch);
        this.eProcActions = new EProcActions(dispatch);
        return externalProcessBundleActions;
    }
    startGeth = () =>
        this.settingsActions.getSettings('geth').then(gethSettings =>
            this.eProcActions.startGeth(gethSettings)
        );
    startIPFS = () =>
        this.settingsActions.getSettings('ipfs').then(() => {
            this.dispatch((dispatch, getState) => {
                const ipfsSettings = getState().settingsState.get('ipfs');
                if (ipfsSettings.size > 0) {
                    return ipfsSettings.toJS();
                }
                return {};
            });
        }).then(ipfsSettings => this.eProcActions.startIPFS(ipfsSettings));

    startSync = () =>
        this.dispatch(() =>
            this.startGeth()
        ).then(() =>
            this.eProcActions.startSync()
        );
    requestCancelSync = () =>
        this.dispatch(() =>
            this.settingsActions.saveSettings('flags', { requestStartupChange: true })
        ).then(() => {
            this.eProcActions.stopGeth();
        });
}

export { ExternalProcessBundleActions };
