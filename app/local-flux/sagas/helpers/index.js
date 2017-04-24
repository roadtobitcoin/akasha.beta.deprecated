import { eventChannel } from 'redux-saga';
import { put, take } from 'redux-saga/effects';

const Channel = global.Channel;
export const actionChannels = {};
export const enabledChannels = [];

// this function creates an event channel from a given ipc client channel
export function createActionChannel (channel) {
    return eventChannel((emit) => {
        const handler = (ev, resp) => {
            emit(resp);
        };
        channel.on(handler);

        const unsubscribe = () => {
            channel.removeListener(handler);
        };

        return unsubscribe;
    });
}

export function createActionChannels () {
    const modules = Object.keys(Channel.client);
    modules.forEach((module) => {
        const channels = Object.keys(Channel.client[module]);
        actionChannels[module] = {};
        channels.forEach((channel) => {
            const actionChannel = createActionChannel(Channel.client[module][channel]);
            actionChannels[module][channel] = actionChannel;
        });
    });
}

export function enableChannel (channel, mananger) {
    const promise = new Promise((resolve, reject) => {
        if (enabledChannels.indexOf(channel.channel) !== -1) {
            resolve();
            return;
        }
        mananger.once((ev, resp) => {
            enabledChannels.push(channel.channel);
            resolve();
        });
        channel.enable();
    });
    return promise;
}

export function* registerListener ({ channel, successAction, errorAction }) {
    while (true) {
        const resp = take(channel);
        if (resp.error && errorAction) {
            yield put(errorAction());
        } else if (successAction) {
            yield put(successAction());
        }
    }
}