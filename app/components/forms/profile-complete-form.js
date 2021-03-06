import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { injectIntl } from 'react-intl';
import validation from 'react-validation-mixin';
import strategy from 'joi-validation-strategy';
import { Row, Card, Col, Icon as AntIcon, Input, Button, Form, Switch, Tooltip } from 'antd';
import * as actionTypes from '../../constants/action-types';
import { aboutMeMaxChars } from '../../constants/iterator-limits';
import { AvatarEditor, Icon, ImageUploader } from '../';
import { profileMessages, formMessages,
    generalMessages, validationMessages } from '../../locale-data/messages';
import { getProfileSchema } from '../../utils/validationSchema';
import { uploadImage } from '../../local-flux/services/utils-service';

const FormItem = Form.Item;

class ProfileCompleteForm extends Component {
    constructor (props) {
        super(props);
        this.state = {
            aboutMeCharCount: aboutMeMaxChars,
            akashaIdIsValid: true,
            akashaIdExists: false,
            insufficientEth: false,
            insufficientEthRenderFlag: false
        };
        this.validatorTypes = getProfileSchema(props.intl, { isUpdate: props.isUpdate });
        this.showErrorOnFields = [];
        this.isSubmitting = false;
    }

    getValidatorData = () => this.props.tempProfile.toJS();

    componentWillReceiveProps (nextProps) {
        const { balance, tempProfile, profileExistsData, loggedEthAddress, onProfileUpdate } = nextProps;
        const id = tempProfile.get('akashaId');
        const existsData = profileExistsData.toJS();
        if (loggedEthAddress && !tempProfile.get('ethAddress')) {
            onProfileUpdate(
                tempProfile.set('ethAddress', loggedEthAddress)
            );
        }
        if (tempProfile.get('akashaId')) {
            const trimmed = tempProfile.get('akashaId').trim();
            onProfileUpdate(
                tempProfile.set('akashaId', trimmed)
            );
        }
        if (balance.get('eth') >= 0.1) {
            this.setState({
                insufficientEth: false,
                insufficientEthRenderFlag: false
            });
        }
        if (id && existsData[id]) {
            const { idValid, exists, normalisedId } = existsData[id];
            this.setState({
                akashaIdIsValid: idValid,
                akashaIdExists: exists
            });
            if (id !== normalisedId) {
                this.setState({ akashaIdIsValid: false });
            }
        }
    }

    componentDidUpdate () {
        const { insufficientEth, insufficientEthRenderFlag } = this.state;
        if (insufficientEth && !insufficientEthRenderFlag) {
            this.container.scrollTop = this.container.scrollHeight;
            this.state.insufficientEthRenderFlag = true;
        }
    }

    getContainerRef = (el) => {
        const { getFormContainerRef } = this.props;
        this.container = el;
        if (getFormContainerRef) {
            getFormContainerRef(el);
        }
    };

    _handleAddLink = linkType => () => {
        const { tempProfile } = this.props;
        const links = tempProfile.get(linkType);
        let updatedTempProfile;
        const lastLink = links.last();
        if (lastLink) {
            if (linkType === 'links' &&
                (lastLink.get('url').length === 0)) {
                return null;
            }
        }
        if (linkType === 'links') {
            updatedTempProfile = tempProfile.setIn([linkType],
                links.push(new Map({
                    title: '',
                    url: '',
                    type: '',
                    id: links.size > 0 ? (links.last().get('id') + 1) : 1
                })));
        }
        return this.props.onProfileUpdate(updatedTempProfile);
    };

    _handleLinkChange = (linkType, field, linkId) => {
        const { tempProfile } = this.props;
        const links = tempProfile.get(linkType);
        const index = links.findIndex(link => link.get('id') === linkId);
        return (ev) => {
            const updatedLinks = links.setIn([index, field], ev.target.value);
            const updatedTempProfile = tempProfile.setIn([linkType], updatedLinks);
            this.props.onProfileUpdate(updatedTempProfile);
        };
    }

    _handleRemoveLink = (linkId, linkType) => {
        const { tempProfile, onProfileUpdate } = this.props;
        const links = tempProfile.get(linkType);
        return () => {
            onProfileUpdate(
                tempProfile.setIn([linkType],
                    links.filter(link => link.get('id') !== linkId)
                )
            );
        };
    }

    _handleFieldChange = (field) => {
        const { tempProfile, onProfileUpdate } = this.props;
        return (ev) => {
            if (field === 'about') {
                this.setState({ aboutMeCharCount: aboutMeMaxChars - ev.target.value.length });
            }
            onProfileUpdate(tempProfile.setIn([field], ev.target.value));
        };
    }

    _onValidate = field => (err) => {
        if (err) {
            this.setState({
                formHasErrors: true
            });
        } else {
            this.setState({
                formHasErrors: false
            });
        }
        // validation passed
        if (field === 'akashaId') {
            this.props.profileExists(this.props.tempProfile.get('akashaId'));
            this.setState({
                akashaIdIsValid: true,
                akashaIdExists: false
            });
        }

        if (field === 'links') {
            this.props.tempProfile.get('links').forEach((link) => {
                if (!link.get('url')) {
                    this._handleRemoveLink(link.get('id'), 'links')();
                }
            });
        }
    }

    _validateField = field =>
        () => {
            if (!this.showErrorOnFields.includes(field)) {
                this.showErrorOnFields.push(field);
            }
            return this.props.validate(this._onValidate(field));
        };

    _getErrorMessages = (field, index, sub) => {
        const { getValidationMessages } = this.props;
        if (this.showErrorOnFields.includes(field) && !this.isSubmitting) {
            if (field === 'links') {
                const joiPath = `${field},${index},${sub}`;
                const errors = getValidationMessages(joiPath);
                if (errors) {
                    return errors[0];
                }
                return null;
            }
            return getValidationMessages(field)[0];
        }
        return null;
    }
    // server validated akashaId errors must have higher priority
    _getAkashaIdErrors = () => {
        const { intl, tempProfile, profileExistsData } = this.props;
        const { akashaIdIsValid, akashaIdExists } = this.state;
        const id = tempProfile.get('akashaId');
        if (profileExistsData.has(id)) {
            if (!akashaIdIsValid && id.length > 1) {
                return intl.formatMessage(validationMessages.akashaIdNotValid);
            }
            if (akashaIdExists) {
                return intl.formatMessage(validationMessages.akashaIdExists);
            }
            if (this._getErrorMessages('akashaId')) {
                return this._getErrorMessages('akashaId');
            }
        }
        return null;
    }


    _handleAvatarClear = () => {
        const { tempProfile, onProfileUpdate } = this.props;
        onProfileUpdate(
            tempProfile.set('avatar', '')
        );
    }

    _handleAvatarAdd = () => {
        const { tempProfile, onProfileUpdate } = this.props;
        this.avatar.wrappedInstance.refs.wrappedInstance.getImage().then((avatar) => {
            if (!avatar) {
                return null;
            }
            if (typeof avatar === 'string') {
                return onProfileUpdate(
                    tempProfile.set('avatar', avatar)
                );
            }
            return uploadImage(avatar).then(avatarIpfs =>
                onProfileUpdate(
                    tempProfile.set('avatar', avatarIpfs)
                )
            );
        });
    }

    _handleBackgroundClear = () => {
        const { tempProfile, onProfileUpdate } = this.props;
        onProfileUpdate(
            tempProfile.set('backgroundImage', new Map())
        );
    }

    _handleBackgroundChange = (bgImageObj) => {
        const { tempProfile, onProfileUpdate } = this.props;
        uploadImage(bgImageObj).then((bgImageObjIpfs) => {
            onProfileUpdate(
                tempProfile.set('backgroundImage', bgImageObjIpfs));
        });
    }

    _handleSwitchChange = (checked) => {
        const { tempProfile, onProfileUpdate } = this.props;
        onProfileUpdate(tempProfile.set('donationsEnabled', checked));
    }

    _handleSkipStep = () => {
        const { history } = this.props;
        history.push('/setup/new-identity-interests');
    };

    _handleSubmit = (ev) => {
        ev.preventDefault();
        const { actionAdd, history, isUpdate, balance, tempProfile } = this.props;

        this.props.validate((err) => {
            if (err) {
                this.showErrorOnFields = this.showErrorOnFields.concat(Object.keys(err));
                this.forceUpdate();
                console.error(err);
                return;
            }
            if (balance.get('eth') < 0.1) {
                this.setState({ insufficientEth: true });
                return;
            }
            this.isSubmitting = true;
            if (this.state.akashaIdIsValid && !this.state.akashaIdExists) {
                const actionType = isUpdate ?
                    actionTypes.profileUpdate :
                    actionTypes.profileRegister;
                const ethAddress = tempProfile.get('ethAddress');
                const data = tempProfile ? tempProfile.toJS() : null;
                history.push('/setup/new-identity-interests');
                actionAdd(ethAddress, actionType, data);
            }
            this.props.tempProfileCreate(tempProfile);
        });
    }

    _handleSave = () => {
        const { history, tempProfile } = this.props;
        this.props.tempProfileCreate(tempProfile);
        history.push('/setup/new-identity-interests');
    }

    onCopy = () => {
        const { loggedEthAddress } = this.props;
        const textArea = document.createElement('textarea');
        textArea.value = loggedEthAddress;
        textArea.style.position = 'fixed';
        textArea.style.top = -99999;
        textArea.style.left = -99999;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    };

    _handleLinkKeyDown = (ev) => {
        if (ev.key === 'Enter') {
            this._validateField('links');
            document.activeElement.blur();
        }
    }


    render () {
        const { baseUrl, intl, isUpdate, tempProfile, loggedEthAddress } = this.props;
        const { akashaId, firstName, lastName, about, links, avatar, backgroundImage } = tempProfile;
        const { formatMessage } = intl;

        return (
          <div className="profile-complete-form__wrap">
            <div className="profile-complete-form__form-wrapper" ref={this.getContainerRef}>
              <Row type="flex" className="">
                <Form onSubmit={this._handleSubmit}>
                  <Col type="flex" md={24} className="profile-complete-form__image-wrap">
                    <Col md={8}>
                      <div className="row">
                        <div className="profile-complete-form__avatar-title">
                          {intl.formatMessage(profileMessages.avatarTitle)}
                        </div>
                        <div className="col-xs-12 center-xs">
                          <AvatarEditor
                            size={124}
                            editable
                            ref={(avtr) => { this.avatar = avtr; }}
                            image={avatar}
                            onImageAdd={this._handleAvatarAdd}
                            onImageClear={this._handleAvatarClear}
                          />
                        </div>
                      </div>
                    </Col>
                    <Col md={16}>
                      <div className="profile-complete-form__bg-image-float">
                        <div className="profile-complete-form__bg-image-title" >
                          {intl.formatMessage(profileMessages.backgroundImageTitle)}
                          <Tooltip
                            title={intl.formatMessage(profileMessages.backgroundImageTooltip)}
                            placement="topLeft"
                            arrowPointAtCenter
                          >
                            <Icon
                              type="questionCircle"
                              className="question-circle-icon profile-settings__info-icon"
                            />
                          </Tooltip>
                        </div>
                        <div className="col-xs-12 profile-complete-form__bg-image-wrap">
                          <ImageUploader
                            ref={(imageUploader) => { this.imageUploader = imageUploader; }}
                            minWidth={320}
                            intl={intl}
                            initialImage={backgroundImage}
                            baseUrl={baseUrl}
                            onImageClear={this._handleBackgroundClear}
                            onChange={this._handleBackgroundChange}
                          />
                        </div>
                      </div>
                    </Col>
                  </Col>
                  <Col md={12}>
                    <FormItem
                      label={formatMessage(formMessages.akashaId)}
                      colon={false}
                      validateStatus={this._getAkashaIdErrors('akashaId') ? 'error' : 'success'}
                      help={this._getAkashaIdErrors('akashaId')}
                      style={{ marginRight: 8 }}
                      required
                    >
                      <Input
                        disabled={isUpdate}
                        onChange={this._handleFieldChange('akashaId')}
                        onBlur={this._validateField('akashaId')}
                        placeholder={intl.formatMessage(formMessages.akashaIdPlaceholder)}
                        value={akashaId}
                      />
                    </FormItem>
                  </Col>
                  <Col md={12}>
                    <div className="profile-complete-form__tips-switch">
                      <FormItem
                        label={formatMessage(formMessages.tips)}
                        colon={false}
                        style={{ marginRight: 8, marginLeft: 8 }}
                      >
                        <Switch
                          checked={tempProfile.get('donationsEnabled')}
                          onChange={this._handleSwitchChange}
                          size="large"
                          disabled={!akashaId}
                        />
                      </FormItem>
                    </div>
                    <div className="profile-complete-form__tips-description">
                      {formatMessage(formMessages.acceptTips)}
                    </div>
                  </Col>
                  <Col md={24}>
                    <Col md={12}>
                      <FormItem
                        label={formatMessage(formMessages.firstName)}
                        colon={false}
                        validateStatus={this._getErrorMessages('firstName') ? 'error' : 'success'}
                        help={this._getErrorMessages('firstName')}
                        style={{ marginRight: 8 }}
                      >
                        <Input
                          onChange={this._handleFieldChange('firstName')}
                          onBlur={this._validateField('firstName')}
                          placeholder={intl.formatMessage(formMessages.firstNamePlaceholder)}
                          value={firstName}
                        />
                      </FormItem>
                    </Col>
                    <Col md={12}>
                      <FormItem
                        label={formatMessage(formMessages.lastName)}
                        colon={false}
                        validateStatus={this._getErrorMessages('lastName') ? 'error' : 'success'}
                        help={this._getErrorMessages('lastName')}
                        style={{ marginLeft: 8 }}
                      >
                        <Input
                          onChange={this._handleFieldChange('lastName')}
                          onBlur={this._validateField('lastName')}
                          placeholder={intl.formatMessage(formMessages.lastNamePlaceholder)}
                          value={lastName}
                        />
                      </FormItem>
                    </Col>
                  </Col>
                  <Col md={24}>
                    <FormItem
                      label={formatMessage(profileMessages.aboutMeTitle)}
                      colon={false}
                      validateStatus={this._getErrorMessages('about') ? 'error' : 'success'}
                      help={this._getErrorMessages('about')}
                    >
                      <Input.TextArea
                        className="profile-complete-form__textarea"
                        rows={3}
                        placeholder={formatMessage(profileMessages.shortDescriptionLabel)}
                        value={about}
                        onChange={this._handleFieldChange('about')}
                        onBlur={this._validateField('about')}
                      />
                    </FormItem>
                    <div className="profile-complete-form__char-count-wrap">
                      {intl.formatMessage(profileMessages.aboutMeCharCount)}
                      <div className="profile-complete-form__char-count">
                        {this.state.aboutMeCharCount}
                      </div>
                    </div>
                  </Col>
                  <Col md={24}>
                    <div className="profile-complete-form__link">
                      {intl.formatMessage(profileMessages.linksTitle)}
                    </div>
                    {links.map((link, index) => (
                      <div key={`${index + 1}`} className="profile-complete-form__link">
                        <FormItem
                          validateStatus={this._getErrorMessages('links', index, 'url') ? 'error' : 'success'}
                          help={this._getErrorMessages('links', index, 'url')}
                        >
                          <Input
                            suffix={<AntIcon
                              className="content-link"
                              type="close-circle"
                              onClick={this._handleRemoveLink(link.get('id'), 'links')}
                            />}
                            value={link.get('url')}
                            style={{ width: '100%' }}
                            onChange={this._handleLinkChange('links', 'url', link.get('id'))}
                            onBlur={this._validateField('links')}
                            onKeyDown={this._handleLinkKeyDown}
                            autoFocus
                          />
                        </FormItem>
                      </div>
                        ))}
                    <div className="profile-complete-form__add-links-btn">
                      <Button
                        icon="plus-circle"
                        type="primary borderless"
                        onClick={this._handleAddLink('links')}
                        ghost
                        style={{ border: 'none' }}
                      >{intl.formatMessage(profileMessages.addLinkButtonTitle)}</Button>
                    </div>
                  </Col>
                  {this.state.insufficientEth &&
                    <Col md={24}>
                      <div
                        className="profile-complete-form__insufficient-funds"
                      >
                        <Card
                          bordered={false}
                        >
                          <h3>{formatMessage(formMessages.insufficientEth)}</h3>
                          <p>{formatMessage(formMessages.depositEth)}</p>
                          <div className="profile-complete-form__address-info">
                            <div>
                              <FormItem
                                className="profile-complete-form__form-item"
                                colon={false}
                                label={intl.formatMessage(profileMessages.yourEthAddress)}
                              >
                                <Input
                                  className="profile-complete-form__input profile-complete-form__my-address"
                                  readOnly
                                  value={loggedEthAddress}
                                />
                                <div
                                  className="content-link profile-complete-form__copy-button"
                                  onClick={this.onCopy}
                                >
                                  {intl.formatMessage(generalMessages.copy)}
                                </div>
                              </FormItem>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </Col>
                }
                  <Col md={24} className="profile-complete-form__filler" />
                </Form>
              </Row>
            </div>
            <div className="setup-content__column-footer profile-complete-form__footer">
              <div className="content-link flex-center-y" onClick={this._handleSkipStep}>
                {intl.formatMessage(generalMessages.skipStep)}
                <Icon className="profile-complete-form__skip-icon" type="arrowRight" />
              </div>
              <div className="profile-complete-form__buttons-wrapper">
                <div className="profile-complete-form__save-btn">
                  <Button onClick={this._handleSave}>
                    {intl.formatMessage(profileMessages.saveForLater)}
                  </Button>
                </div>
                {!akashaId ?
                  <Tooltip
                    placement="topRight"
                    title={intl.formatMessage(generalMessages.usernameFirst)}
                  >
                    <Button
                      htmlType="submit"
                      className="new-identity__button"
                      disabled={!akashaId}
                      onClick={this._handleSubmit}
                      type="primary"
                    >
                      {intl.formatMessage(generalMessages.next)}
                    </Button>
                  </Tooltip> :
                  <Button
                    htmlType="submit"
                    className="new-identity__button"
                    disabled={!akashaId}
                    onClick={this._handleSubmit}
                    type="primary"
                  >
                    {intl.formatMessage(generalMessages.next)}
                  </Button>
                }
              </div>
            </div>
          </div>
        );
    }
}

ProfileCompleteForm.propTypes = {
    actionAdd: PropTypes.func,
    balance: PropTypes.shape(),
    baseUrl: PropTypes.string.isRequired,
    getValidationMessages: PropTypes.func,
    history: PropTypes.shape(),
    intl: PropTypes.shape(),
    isUpdate: PropTypes.bool,
    getFormContainerRef: PropTypes.func,
    loggedEthAddress: PropTypes.string,
    onProfileUpdate: PropTypes.func.isRequired,
    profileExists: PropTypes.func,
    profileExistsData: PropTypes.shape(),
    tempProfile: PropTypes.shape(),
    tempProfileCreate: PropTypes.func,
    validate: PropTypes.func,
};

const validationHOC = validation(strategy());

export default injectIntl(
    Form.create()(validationHOC(ProfileCompleteForm))
);
