import PropTypes from 'prop-types';
import React, { Component } from 'react';
import withRouter from 'react-router/withRouter';
import DraftJS from 'draft-js';
import { Tooltip, Icon } from 'antd';
import { AllRightsReserved, CreativeCommonsBY, CreativeCommonsCC, CreativeCommonsNCEU,
    CreativeCommonsNCJP, CreativeCommonsNC, CreativeCommonsND, CreativeCommonsREMIX,
    CreativeCommonsSHARE, CreativeCommonsZERO, CreativeCommonsPD,
    CreativeCommonsSA } from '../svg';
import { SelectableEditor, TagPopover, WebsiteInfoCard } from '../';
import { entryMessages } from '../../locale-data/messages/entry-messages';

const { EditorState } = DraftJS;

class EntryPageContent extends Component {
    constructor (props) {
        super(props);
        this.editorState = EditorState.createEmpty();
    }

    shouldComponentUpdate (nextProps) {
        if (!nextProps.entry.equals(this.props.entry) ||
            nextProps.commentEditor !== this.props
        ) {
            return true;
        }
        return false;
    }

    getPopupContainer = () => this.props.containerRef || document.body;

    highlightSave = (text) => {
        const { entry, highlightSave, latestVersion } = this.props;
        highlightSave({
            content: text,
            entryId: entry.get('entryId'),
            entryTitle: entry.getIn(['content', 'title']),
            entryVersion: latestVersion,
            publisher: entry.getIn(['author', 'ethAddress'])
        });
    };

    renderLicenseIcons = () => {
        const { entry, licenses } = this.props;
        let licence = licenses.get(entry.content.licence.id);

        if (!licence && entry.content.licence.parent) {
            licence = licenses.get(entry.content.licence.parent);
        }

        const licenseIcons = {
            'copyright-1': AllRightsReserved,
            CCBY: CreativeCommonsBY,
            CCCC: CreativeCommonsCC,
            CCNCEU: CreativeCommonsNCEU,
            CCNCJP: CreativeCommonsNCJP,
            CCNC: CreativeCommonsNC,
            CCND: CreativeCommonsND,
            CCREMIX: CreativeCommonsREMIX,
            CCSHARE: CreativeCommonsSHARE,
            CCZERO: CreativeCommonsZERO,
            CCPD: CreativeCommonsPD,
            CCSA: CreativeCommonsSA
        };

        return (
          <div className="entry-page-content__license-wrapper">
            {licence.description.map((descr) => { // eslint-disable-line consistent-return, array-callback-return, max-len
                if (descr.icon && licenseIcons[descr.icon] !== undefined) {
                    const viewBox = descr.icon === 'CCBY' || descr.icon === 'copyright-1' ?
                        '0 0 20 20' :
                        '0 0 18 18';
                    return (
                      <Tooltip
                        getPopupContainer={this.getPopupContainer}
                        key={descr.icon}
                        title={descr.text}
                      >
                        <svg className="entry-page-content__license-icon" viewBox={viewBox}>
                          {React.createElement(licenseIcons[descr.icon])}
                        </svg>
                      </Tooltip>
                    );
                }
            })}
          </div>
        );
    };
    // when user clicks a link in an entry
    _handleOutsideNavigation = (url) => {
        const { toggleOutsideNavigation } = this.props;
        toggleOutsideNavigation(url);
    }
    render () {
        const { baseUrl, commentEditor, containerRef, entry, licenses, intl, fullSizeImageAdd } = this.props;
        const license = licenses.get(entry.content.licence.id);
        let licenseLabel = intl.formatMessage(entryMessages.cannotRetrieveLicense);
        if (!entry.content.licence.id) {
            licenseLabel = licenses.get(entry.content.licence.parent).label;
        }
        if (license) {
            if (license.parent) {
                licenseLabel = licenses.get(license.parent).label;
            } else {
                licenseLabel = license.label;
            }
        }
        return (
          <div className="entry-page-content">
            <div>
              <h1 className="entry-page-content__title">
                {entry.getIn(['content', 'entryType']) === 0 && entry.getIn(['content', 'title'])}
              </h1>
              {entry.content.entryType === 1 &&
                <WebsiteInfoCard
                  cardInfo={entry.content.cardInfo}
                  baseUrl={baseUrl}
                  hasCard={
                      !!entry.content.cardInfo.title ||
                      !!entry.content.cardInfo.description
                  }
                  isEdit={false}
                  infoExtracted
                  onClick={this._handleOutsideNavigation}
                />
              }
              <div className="entry-page-content__content">
                <SelectableEditor
                  baseUrl={baseUrl}
                  draft={entry.getIn(['content', 'draft'])}
                  highlightSave={this.highlightSave}
                  startComment={commentEditor && commentEditor.insertHighlight}
                  onOutsideNavigation={this._handleOutsideNavigation}
                  fullSizeImageAdd={fullSizeImageAdd}
                />
              </div>
            </div>
            <div className="flex-center-y entry-page-content__info">
              {!entry.content.licence.id && !entry.content.licence.parent &&
                <Icon type="exclamation-circle-o" className="entry-page-content__licence-error-icon" />
              }
              <span style={{ paddingRight: '10px' }}>
                {licenseLabel}
              </span>
              {this.renderLicenseIcons()}
            </div>
            <div className="entry-page-content__info">
              <div>
                {entry.getIn(['content', 'tags']).map(tag => (
                  <TagPopover
                    containerRef={containerRef}
                    key={tag}
                    tag={tag}
                  />
                ))}
              </div>
            </div>
          </div>
        );
    }
}

EntryPageContent.propTypes = {
    baseUrl: PropTypes.string.isRequired,
    commentEditor: PropTypes.shape(),
    containerRef: PropTypes.shape(),
    entry: PropTypes.shape(),
    fullSizeImageAdd: PropTypes.func,
    highlightSave: PropTypes.func.isRequired,
    intl: PropTypes.shape(),
    toggleOutsideNavigation: PropTypes.func,
    latestVersion: PropTypes.number,
    licenses: PropTypes.shape(),
};

export default withRouter(EntryPageContent);
