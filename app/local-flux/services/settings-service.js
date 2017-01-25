import settingsDB from './db/settings';
import BaseService from './base-service';

class SettingsService extends BaseService {
    saveSettings = ({
        options,
        onError = () => {
        },
        onSuccess
    }) => {
        const settings = options.settings;
        return settingsDB[options.table].put({ name: options.table, ...settings })
            .then(() => {
                onSuccess(options.settings, options.table);
            }).catch((reason) => {
                onError(reason, options.table);
            });
    };
    getSettings = ({
        options = { table: '', query: {} },
        onError = () => {
        },
        onSuccess
    }) => {
        settingsDB[options.table].where('name').equals(options.table).toArray()
            .then((data) => {
                onSuccess(data[0] || {}, options.table);
            }).catch((reason) => {
                onError(reason, options.table);
            });
    }

    saveLastBlockNr = ({ akashaId, blockNr }) => {
        settingsDB.user.where('akashaId').equals(akashaId).toArray()
            .then((data) => {
                const result = data[0] || {};
                result.lastBlockNr = blockNr;
                settingsDB.user.put({ akashaId, ...result });
            })
            .catch(reason => null);
    };
    saveDefaultLicence = ({ akashaId, licenceObj }) => {
        settingsDB.user.where('akashaId').equals(akashaId).toArray()
            .then((data) => {
                const result = data[0] || {};
                result.defaultLicence = licenceObj;
                settingsDB.user.put({ akashaId, ...result });
            });
    }
    getUserSettings = ({ akashaId, onSuccess, onError }) => {
        settingsDB.user.where('akashaId').equals(akashaId).toArray()
            .then((data) => {
                onSuccess(data[0]);
            })
            .catch(reason => onError(reason));
    };

    disableNotifFrom = ({ loggedAkashaId, akashaId, profileAddress, onError, onSuccess }) => {
        settingsDB.user
            .where('akashaId')
            .equals(loggedAkashaId)
            .toArray()
            .then((data) => {
                if (!data[0]) {
                    settingsDB.user
                        .put({ akashaId: loggedAkashaId, notifications: { muted: [profileAddress] } })
                        .then(updated => updated ? onSuccess(profileAddress) : onError())
                        .catch(reason => onError(reason, akashaId));
                    return;
                }
                const mutedList = (data[0].notifications && data[0].notifications.muted) || [];
                if (mutedList.findIndex(muted => muted === profileAddress) !== -1) {
                    onError({}, akashaId);
                } else {
                    const newMutedList = [...mutedList, profileAddress];
                    settingsDB.user
                        .update(loggedAkashaId, { notifications: { muted: newMutedList } })
                        .then(updated => updated ? onSuccess(akashaId) : onError())
                        .catch(reason => onError(reason, akashaId));
                }
            })
            .catch(reason => onError(reason, akashaId));
    };

    enableNotifFrom = ({ loggedAkashaId, akashaId, profileAddress, onError, onSuccess }) => {
        settingsDB.user
            .where('akashaId')
            .equals(loggedAkashaId)
            .toArray()
            .then((data) => {
                if (!data[0] || !data[0].notifications || !data[0].notifications.muted) {
                    onError({}, akashaId);
                    return;
                }
                const mutedList = data[0].notifications.muted || [];
                const index = mutedList.findIndex(muted => muted === profileAddress);
                if (index === -1) {
                    onError({}, akashaId);
                } else {
                    mutedList.splice(index, 1);
                    settingsDB.user
                        .update(loggedAkashaId, { notifications: { muted: mutedList } })
                        .then(updated => updated ? onSuccess(akashaId) : onError())
                        .catch(reason => onError(reason, akashaId));
                }
            })
            .catch(reason => onError(reason, akashaId));
    };
}

export { SettingsService };
