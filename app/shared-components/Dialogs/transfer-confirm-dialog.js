import React, { Component, PropTypes } from 'react';
import ReactTooltip from 'react-tooltip';
import { injectIntl } from 'react-intl';
import { Dialog, FlatButton, RaisedButton } from 'material-ui';
import { confirmMessages, generalMessages } from 'locale-data/messages'; // eslint-disable-line import/no-unresolved, import/extensions
import { SendTipForm } from 'shared-components';

class TransferConfirmDialog extends Component {
    constructor (props) {
        super(props);
        this.state = {
            ethAmount: '0.0001',
            ethAmountError: null,
            gasAmount: null,
            gasAmountError: null
        };
    }

    componentWillReceiveProps (nextProps) {
        const { getProfileBalance, isOpen, resource } = nextProps;
        if (isOpen && !this.props.isOpen) {
            getProfileBalance();
            this.setState({
                ethAmount: '0.0001',
                gasAmount: resource.get('gas')
            });
        }
        if (!isOpen && this.props.isOpen) {
            this.setState({
                ethAmountError: null,
                gasAmountError: null
            });
        }
    }
    componentDidUpdate () {
        ReactTooltip.rebuild();
    }
    onSubmit = (ev) => {
        ev.preventDefault();
        this.handleConfirm();
    };
    handleGasChange = (ev) => {
        const gasAmount = ev.target.value;
        if (gasAmount < 2000000 || gasAmount > 4700000) {
            this.setState({
                gasAmountError: true,
                gasAmount
            });
        } else {
            this.setState({
                gasAmountError: false,
                gasAmount
            });
        }
    };
    handleEthChange = (ev) => {
        const { balance } = this.props;
        const ethAmount = ev.target.value;
        if (!Number(ethAmount) || !Number(balance) ||
                (Number(ethAmount) > Number(balance) - 0.1)) {
            this.setState({
                ethAmountError: true,
                ethAmount
            });
        } else {
            this.setState({
                ethAmountError: false,
                ethAmount
            });
        }
    };
    handleConfirm = () => {
        const { resource, appActions } = this.props;
        const updatedResource = resource.toJS();
        updatedResource.gas = this.state.gasAmount || resource.get('gas');
        updatedResource.payload.eth = this.state.ethAmount;
        updatedResource.status = 'checkAuth';
        appActions.hideTransferConfirmDialog();
        appActions.updatePendingAction(updatedResource);
    };
    handleAbort = () => {
        const { resource, appActions } = this.props;
        appActions.deletePendingAction(resource.get('id'));
        appActions.hideTransferConfirmDialog();
    };
    render () {
        const { balance, resource, intl, isOpen } = this.props;
        const { ethAmount, ethAmountError, gasAmount, gasAmountError } = this.state;
        if (!resource) {
            return null;
        }
        const dialogActions = [
          <FlatButton // eslint-disable-line indent
            label={intl.formatMessage(generalMessages.abort)}
            style={{ marginRight: 8 }}
            onClick={this.handleAbort}
          />,
          <RaisedButton // eslint-disable-line indent
            label={intl.formatMessage(generalMessages.confirm)}
            primary
            onClick={this.handleConfirm}
            disabled={gasAmountError || ethAmountError}
          />
        ];
        return (
          <Dialog
            contentStyle={{ width: 420, maxWidth: 'none' }}
            modal
            title={
              <div style={{ fontSize: 24 }}>
                {intl.formatMessage(confirmMessages[resource.get('titleId')])}
              </div>
            }
            open={isOpen}
            actions={dialogActions}
          >
            <SendTipForm
              balance={balance}
              disableReceiverField
              ethAmount={ethAmount}
              ethAmountError={ethAmountError}
              gasAmount={gasAmount}
              gasAmountError={gasAmountError}
              handleEthChange={this.handleEthChange}
              handleGasChange={this.handleGasChange}
              onSubmit={this.onSubmit}
              profileData={resource.payload}
            />
          </Dialog>
        );
    }
}

TransferConfirmDialog.propTypes = {
    appActions: PropTypes.shape(),
    balance: PropTypes.string,
    getProfileBalance: PropTypes.func,
    intl: PropTypes.shape(),
    isOpen: PropTypes.bool,
    resource: PropTypes.shape(),
};

export default injectIntl(TransferConfirmDialog);
