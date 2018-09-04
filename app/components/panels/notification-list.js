// @flow
import React, {PureComponent} from 'react';
import classNames from 'classnames';
import { DataLoader, NotificationLog } from '../';
import { profileMessages } from '../../locale-data/messages';
import { Timeline } from 'antd';
import type { List } from 'immutable';

const { Item } = Timeline;

type Props = {
    darkTheme?: boolean,
    intl: Object,
    notifications: List<Object>,
    notificationsLoaded: boolean,
    containerRef: any,
}

class NotificationList extends PureComponent <Props> {
    static defaultProps = {
        darkTheme: false,
        notificationsLoaded: false
    }
    
    getUniqueKey = (notification: Object) => {
        const values = Object.values(notification.payload);
        let key = notification.blockNumber;
        values.forEach((val) => {
            if (typeof val === 'string') {
                key = `${key}-${val.substr(0, 10)}`;
            }
        });
        return key;
    }

    render () {
        const { darkTheme, intl, notifications, notificationsLoaded, containerRef } = this.props;
        const imgClass = classNames('notifications-panel__placeholder', {
            'notifications-panel__placeholder_dark': darkTheme
        });
        if (!notificationsLoaded) {
            return (
              <div className="notifications-panel__timeline-wrapper">
                <DataLoader flag />
              </div>
            );
        }
        return (
          <div className="notifications-panel__timeline-wrapper" ref={containerRef}>
            <Timeline>
              {notifications.map((notif) => {
                  if (!notif.blockNumber) {
                      return null;
                  }
                  return (
                    <Item
                      color="red"
                      key={this.getUniqueKey(notif)}
                    >
                      <NotificationLog
                        containerRef={containerRef}
                        key={notif.blockNumber}
                        notification={notif}
                      />
                    </Item>
                  );
              })}
            </Timeline>
            {!notifications.size &&
              <div className="flex-center notifications-panel__placeholder-wrapper">
                <div className={imgClass} />
                <div className="notifications-panel__placeholder-message">
                  {intl.formatMessage(profileMessages.noNotifications)}
                </div>
              </div>
            }
          </div>
        );
    }
}

export default NotificationList;