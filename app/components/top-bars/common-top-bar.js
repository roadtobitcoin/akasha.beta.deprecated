import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { selectBalance, selectLoggedProfileData } from '../../local-flux/selectors';
import { Navigation, TopBarRightSide } from '../';

const CommonTopBar = props => (
  <div style={{ display: 'flex', height: '32px', fontSize: '16px' }}>
    <div style={{ flex: '1 1 auto', display: 'flex', justifyContent: 'flex-start' }}>
      <Navigation />
    </div>
    <TopBarRightSide balance={props.balance} loggedProfileData={props.loggedProfileData} />
  </div>
);

CommonTopBar.propTypes = {
    balance: PropTypes.string,
    loggedProfileData: PropTypes.shape()
};

function mapStateToProps (state) {
    return {
        balance: selectBalance(state),
        loggedProfileData: selectLoggedProfileData(state)
    };
}

export default connect(mapStateToProps)(CommonTopBar);