import React, { Component, Fragment } from 'react';
import { Page, View, Navbar, Subnavbar, Icon } from 'framework7-react';
import { observer, inject } from "mobx-react";
import { Device } from '../../../../common/mobile/utils/device';

import Settings from '../view/settings/Settings';
import CollaborationView from '../../../../common/mobile/lib/view/collaboration/Collaboration.jsx'
import CellEditor from '../controller/CellEditor';
import { Statusbar } from '../controller/Statusbar';
import FilterOptionsController from '../controller/FilterOptions.jsx'
import AddOptions from "../view/add/Add";
import EditOptions from "../view/edit/Edit";
import { Search, SearchSettings } from '../controller/Search';
import { f7, Link } from 'framework7-react';

import {FunctionGroups} from "../controller/add/AddFunction";
import ContextMenu from '../controller/ContextMenu';
import { Toolbar } from "../controller/Toolbar";

class MainPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editOptionsVisible: false,
            addOptionsVisible: false,
            addShowOptions: null,
            settingsVisible: false,
            collaborationVisible: false
        };
    }

    handleClickToOpenOptions = (opts, showOpts) => {
        f7.popover.close('.document-menu.modal-in', false);

        setTimeout(() => {
            let opened = false;
            const newState = {};
            if ( opts === 'edit' ) {
                this.state.editOptionsVisible && (opened = true);
                newState.editOptionsVisible = true;
            } else if ( opts === 'add' ) {
                this.state.addOptionsVisible && (opened = true);
                newState.addOptionsVisible = true;
                newState.addShowOptions = showOpts;
            } else if ( opts === 'settings' ) {
                this.state.settingsVisible && (opened = true);
                newState.settingsVisible = true;
            } else if ( opts === 'coauth' ) {
                this.state.collaborationVisible && (opened = true);
                newState.collaborationVisible = true;
            }

            for (let key in this.state) {
                if (this.state[key] && !opened) {
                    setTimeout(() => {
                        this.handleClickToOpenOptions(opts, showOpts);
                    }, 10);
                    return;
                }
            }

            if (!opened) {
                this.setState(newState);
                if ((opts === 'edit' || opts === 'coauth') && Device.phone) {
                    f7.navbar.hide('.main-navbar');
                }
            }
        }, 10);
    };

    handleOptionsViewClosed = opts => {
        setTimeout(() => {
            this.setState(state => {
                if ( opts == 'edit' )
                    return {editOptionsVisible: false};
                else if ( opts == 'add' )
                    return {addOptionsVisible: false, addShowOptions: null};
                else if ( opts == 'settings' )
                    return {settingsVisible: false};
                else if ( opts == 'coauth' )
                    return {collaborationVisible: false};
            });
            if ((opts === 'edit' || opts === 'coauth') && Device.phone) {
                f7.navbar.show('.main-navbar');
            }
        }, 1);
    };

  render() {
      const appOptions = this.props.storeAppOptions;
      const storeWorksheets = this.props.storeWorksheets;
      const wsProps = storeWorksheets.wsProps;
      const wsLock = storeWorksheets.wsLock;
      const config = appOptions.config;

      let showLogo = !(appOptions.canBrandingExt && (config.customization && (config.customization.loaderName || config.customization.loaderLogo)));
      if ( !Object.keys(config).length ) {
          showLogo = !/&(?:logo)=/.test(window.location.search);
      }

      const showPlaceholder = !appOptions.isDocReady && (!config.customization || !(config.customization.loaderName || config.customization.loaderLogo));
      if ( $$('.skl-container').length ) {
          $$('.skl-container').remove();
      }

      return (
            <Page name="home" className={`editor${ showLogo ? ' page-with-logo' : ''}`}>
              {/* Top Navbar */}
                <Navbar id='editor-navbar' className={`main-navbar`}>
                    <Subnavbar>
                        <Toolbar openOptions={this.handleClickToOpenOptions} closeOptions={this.handleOptionsViewClosed}/>
                        <Search useSuspense={false}/>
                    </Subnavbar>
                </Navbar>
                <CellEditor onClickToOpenAddOptions={(panels, button) => this.handleClickToOpenOptions('add', {panels: panels, button: button})}/>
                {/* Page content */}
                <View id="editor_sdk" />
                {showPlaceholder ?
                    <div className="doc-placeholder">
                        <div className="columns"></div>
                        <div className="columns"></div>
                    </div> :
                    null
                }
                <SearchSettings useSuspense={false} />
                {
                    !this.state.editOptionsVisible ? null :
                        <EditOptions onclosed={this.handleOptionsViewClosed.bind(this, 'edit')} wsLock={wsLock} wsProps={wsProps} />
                }
                {
                    !this.state.addOptionsVisible ? null :
                        <AddOptions onclosed={this.handleOptionsViewClosed.bind(this, 'add')} wsLock={wsLock} wsProps={wsProps} showOptions={this.state.addShowOptions} />
                }
                {
                    !this.state.settingsVisible ? null :
                        <Settings openOptions={this.handleClickToOpenOptions} onclosed={this.handleOptionsViewClosed.bind(this, 'settings')} />
                }
                {
                    !this.state.collaborationVisible ? null :
                        <CollaborationView onclosed={this.handleOptionsViewClosed.bind(this, 'coauth')} />
                }

                {appOptions.isDocReady &&
                    <Fragment key='filter-context'>
                        <FilterOptionsController wsProps={wsProps} />
                        <ContextMenu openOptions={this.handleClickToOpenOptions.bind(this)} />
                    </Fragment>
                }
                
                <Statusbar key='statusbar'/>

                <FunctionGroups /> {/* hidden component*/}
            </Page>
      )
  }
}

export default inject("storeAppOptions", "storeWorksheets")(observer(MainPage));