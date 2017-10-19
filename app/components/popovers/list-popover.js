import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { List } from 'immutable';
import { Checkbox, Icon, Input, Popover } from 'antd';
import { NewListForm, PanelLink } from '../';
import { EntryBookmarkOff } from '../svg';
import { listMessages } from '../../locale-data/messages';

class ListPopover extends Component {
    state = {
        addNewList: false,
        popoverVisible: false,
    };

    shouldComponentUpdate = (nextProps, nextState) => {
        const { lists, search } = nextProps;
        const { addNewList, popoverVisible } = nextState;
        if (!lists.equals(this.props.lists) ||
            search !== this.props.search ||
            popoverVisible !== this.state.popoverVisible ||
            addNewList !== this.state.addNewList
        ) {
            return true;
        }
        return false;
    }

    componentWillUnmount () {
        if (this.focusTimeout) {
            clearInterval(this.focusTimeout);
        }
        if (this.resetTimeout) {
            clearInterval(this.resetTimeout);
        }
    }

    isSaved = (list) => {
        const { entryId } = this.props;
        return list.get('entryIds').includes(entryId);
    };

    groupByState = (lists) => {
        let saved = new List();
        let unsaved = new List();
        lists.forEach((list) => {
            if (this.isSaved(list)) {
                saved = saved.push(list);
            } else {
                unsaved = unsaved.push(list);
            }
        });
        return saved.concat(unsaved);
    };

    onKeyDown = (ev) => {
        if (ev.key === 'Escape') {
            this.props.listSearch('');
        }
    };

    onSearchChange = (ev) => {
        this.props.listSearch(ev.target.value);
    };

    onVisibleChange = (popoverVisible) => {
        if (popoverVisible) {
            this.setInputFocusAsync();
        }
        this.setState({
            popoverVisible
        });
        if (!popoverVisible) {
            // Delay state reset until popover animation is finished
            this.resetTimeout = setTimeout(() => {
                this.resetTimeout = null;
                this.props.listSearch('');
                this.setState({
                    addNewList: false,
                    entryLists: this.initialEntryLists
                });
            }, 100);
        }
    };

    setInputFocusAsync = () => {
        this.focusTimeout = setTimeout(() => {
            this.focusTimeout = null;
            const input = document.getElementById('list-popover-search');
            if (input) {
                input.focus();
            }
        }, 100);
    };

    toggleNewList = () => {
        if (this.state.addNewList) {
            this.setInputFocusAsync();
        }
        this.setState({
            addNewList: !this.state.addNewList
        });
    };

    renderContent = () => {
        const { entryId, intl, listAdd, listDelete, lists, listToggleEntry, search } = this.props;

        if (this.state.addNewList) {
            return (
              <NewListForm
                entryId={entryId}
                lists={lists}
                onSave={listAdd}
                onCancel={this.toggleNewList}
              />
            );
        }

        return (
          <div>
            <div>
              <Input
                className="list-popover__search"
                id="list-popover-search"
                onChange={this.onSearchChange}
                onKeyDown={this.onKeyDown}
                placeholder={intl.formatMessage(listMessages.searchForList)}
                prefix={<Icon className="list-popover__search-icon" type="search" />}
                size="large"
                value={search}
              />
            </div>
            <div className="list-popover__list-wrapper">
              {this.groupByState(lists).map((list) => {
                  const toggleList = () => listToggleEntry(list.get('name'), entryId);
                  const isSaved = this.isSaved(list);
                  const root = 'list-popover__left-item list-popover__row-icon';
                  const modifier = 'list-popover__row-icon_saved';
                  const className = `${root} ${isSaved && modifier}`;
                  return (
                    <div
                      className="has-hidden-action content-link list-popover__row"
                      key={list.get('id')}
                      onClick={toggleList}
                    >
                      <div className={`hidden-action-reverse ${className}`}>
                        {list.get('entryIds').size}
                      </div>
                      <div className="hidden-action list-popover__left-item">
                        <Checkbox checked={isSaved} />
                      </div>
                      <div className="overflow-ellipsis list-popover__name">
                        {list.get('name')}
                      </div>
                      <div className="hidden-action" onClick={ev => ev.stopPropagation()}>
                        <PanelLink
                          className="flex-center list-popover__icon"
                          to={`lists/${list.get('name')}`}
                        >
                          <Icon type="edit" />
                        </PanelLink>
                      </div>
                      <div className="hidden-action flex-center list-popover__icon">
                        <Icon
                          type="delete"
                          onClick={(ev) => {
                              ev.preventDefault();
                              ev.stopPropagation();
                              listDelete(list.get('id'), list.get('name'));
                          }}
                        />
                      </div>
                    </div>
                  );
              })}
            </div>
            <div className="content-link list-popover__button" onClick={this.toggleNewList}>
              <Icon
                className="list-popover__left-item"
                type="plus"
              />
              <div style={{ flex: '1 1 auto' }}>
                {intl.formatMessage(listMessages.createNew)}
              </div>
            </div>
          </div>
        );
    };

    render () {
        const { containerRef } = this.props;

        return (
          <Popover
            content={this.renderContent()}
            getPopupContainer={() => containerRef || document.body}
            onVisibleChange={this.onVisibleChange}
            overlayClassName="popover-menu list-popover"
            placement="bottomRight"
            trigger="click"
            visible={this.state.popoverVisible}
          >
            <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 20 20">
              <EntryBookmarkOff />
            </svg>
          </Popover>
        );
    }
}

ListPopover.propTypes = {
    containerRef: PropTypes.shape(),
    entryId: PropTypes.string.isRequired,
    intl: PropTypes.shape().isRequired,
    listAdd: PropTypes.func.isRequired,
    listDelete: PropTypes.func.isRequired,
    lists: PropTypes.shape().isRequired,
    listSearch: PropTypes.func.isRequired,
    listToggleEntry: PropTypes.func.isRequired,
    search: PropTypes.string,
};

export default injectIntl(ListPopover);