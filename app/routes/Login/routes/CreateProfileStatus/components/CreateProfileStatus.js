import React, { Component, PropTypes } from 'react';
import { MenuAkashaLogo } from 'shared-components/svg';
import * as Colors from 'material-ui/styles/colors';
import { SvgIcon } from 'material-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { PanelContainer } from 'shared-components';

class CreateProfileStatus extends Component {
    componentWillMount () {
        const { profileActions } = this.props;
        profileActions.checkTempProfile().then(() => {
            profileActions.createProfile();
        });
    }
    render () {
        const { style, profileState } = this.props;
        const paraStyle = { marginTop: '20px' };

        return (
          <div style={style} >
              <PanelContainer
                showBorder
                header={
                  <div>
                    <SvgIcon
                      color={Colors.lightBlack}
                      viewBox="0 0 32 32"
                      style={{
                          width: '32px',
                          height: '32px',
                          marginRight: '10px',
                          verticalAlign: 'middle'
                      }}
                    >
                      <MenuAkashaLogo />
                    </SvgIcon>
                    <h1 style={{ fontWeight: '400', display: 'inline', verticalAlign: 'middle' }} >
                      <FormattedMessage
                        id="app.createProfile.registeringIdentity"
                        description="Registering identity status"
                        defaultMessage="Registering identity"
                      /> ...
                    </h1>
                  </div>
                }
              >
                <div className="col-xs" >
                  <p style={paraStyle} >
                    <FormattedMessage
                      id="app.createProfile.yourIdentityIsBroadcasted"
                      description="describing that identity is broadcasted into network"
                      defaultMessage="Your identity is broadcasted into the Ethereum world computer network."
                    />
                  </p>
                  <p style={paraStyle} >
                    <FormattedMessage
                      id="app.createProfile.willTakeFewMinutes"
                      description="action `will take a few moments` to complete"
                      defaultMessage="This will take a few moments"
                    /> ...
                  </p>
                  <span style={{ marginTop: '20px', fontSize: '13px' }} >
                    {/** profileState.getIn(['create', 'steps']).map((step, key) => <p key={key}>{step}</p>)*/}
                  </span>
                  <p style={{ marginTop: '20px', color: Colors.red300 }} >
                      {/** profileState.getIn(['create', 'err']) */}
                  </p>
                </div>
              </PanelContainer>
          </div>
        );
    }
}

CreateProfileStatus.propTypes = {
    profileActions: PropTypes.object.isRequired,
    profileState: PropTypes.object,
    style: PropTypes.object,
    intl: React.PropTypes.object
};

CreateProfileStatus.contextTypes = {
    muiTheme: React.PropTypes.object,
    router: React.PropTypes.object
};

CreateProfileStatus.defaultProps = {
    style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
    }
};

export default injectIntl(CreateProfileStatus);