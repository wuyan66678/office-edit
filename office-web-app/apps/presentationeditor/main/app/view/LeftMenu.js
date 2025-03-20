/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
*/
/**
 *    LeftMenu.js
 *
 *    Created by Maxim Kadushkin on 10 April 2014
 *    Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!presentationeditor/main/app/template/LeftMenu.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Button',
    'common/main/lib/view/About',
    /** coauthoring begin **/
    'common/main/lib/view/Comments',
    'common/main/lib/view/Chat',
    /** coauthoring end **/
    'common/main/lib/view/History',
    'common/main/lib/view/Plugins',
    'common/main/lib/view/SearchDialog',
    'presentationeditor/main/app/view/FileMenu',
    'presentationeditor/main/app/view/SearchPanel'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    var SCALE_MIN = 44;
    var MENU_SCALE_PART = 300;

    PE.Views.LeftMenu = Backbone.View.extend(_.extend({
        el: '#left-menu',

        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: function() {
            return {
                /** coauthoring begin **/
                'click #left-btn-comments': _.bind(this.onCoauthOptions, this),
                'click #left-btn-chat': _.bind(this.onCoauthOptions, this),
                'click #left-btn-search': _.bind(this.onCoauthOptions, this),
                'click #left-btn-plugins': _.bind(this.onCoauthOptions, this),
                /** coauthoring end **/
                'click #left-btn-thumbs': _.bind(this.onCoauthOptions, this),
                'click #left-btn-support': function() {
                    var config = this.mode.customization;
                    config && !!config.feedback && !!config.feedback.url ?
                        window.open(config.feedback.url) :
                        window.open('{{SUPPORT_URL}}');
                }
            }
        },

        initialize: function () {
            this.minimizedMode = true;
            this._state = {disabled: false};
        },

        render: function () {
            var $markup = $(this.template({}));

            this.btnSearch = new Common.UI.Button({
                action: 'search',
                el: $markup.elementById('#left-btn-search'),
                hint: this.tipSearch,
                disabled: true,
                enableToggle: true
            });

           
            this.btnAbout = new Common.UI.Button({
                action: 'about',
                el: $markup.elementById('#left-btn-about'),
                hint: this.tipAbout,
                enableToggle: true,
                disabled: true,
                toggleGroup: 'leftMenuGroup'
            });

            this.btnSupport = new Common.UI.Button({
                action: 'support',
                el: $markup.elementById('#left-btn-support'),
                hint: this.tipSupport,
                disabled: true
            });

            /** coauthoring begin **/
            this.btnThumbs = new Common.UI.Button({
                action: 'thumbnails',
                el: $markup.elementById('#left-btn-thumbs'),
                hint: this.tipSlides,
                enableToggle: true,
                disabled: true,
                toggleGroup: 'leftMenuGroup'
            });

            this.btnComments = new Common.UI.Button({
                action: 'comments',
                el: $markup.elementById('#left-btn-comments'),
                hint: this.tipComments + Common.Utils.String.platformKey('Ctrl+Shift+H'),
                enableToggle: true,
                disabled: true,
                toggleGroup: 'leftMenuGroup'
            });

            this.btnChat = new Common.UI.Button({
                action: 'chat',
                el: $markup.elementById('#left-btn-chat'),
                hint: this.tipChat + Common.Utils.String.platformKey('Alt+Q'),
                enableToggle: true,
                disabled: true,
                toggleGroup: 'leftMenuGroup'
            });


            this.btnComments.hide();
            this.btnChat.hide();

            // this.btnComments.on('click',        this.onBtnMenuClick.bind(this));
            // this.btnChat.on('click',            this.onBtnMenuClick.bind(this));
            /** coauthoring end **/
            this.btnComments.on('toggle',       this.onBtnCommentsToggle.bind(this));
            this.btnComments.on('click',     _.bind(this.onBtnMenuClick, this, 'tab'));
            this.btnChat.on('click',         _.bind(this.onBtnMenuClick, this, 'tab'));
            this.btnSearch.on('click',       _.bind(this.onBtnMenuClick, this, 'tab'));
            this.btnThumbs.on('click',          _.bind(this.onBtnMenuClick, this, 'tab'));

            this.btnPlugins = new Common.UI.Button({
                action: 'plugins',
                el: $markup.elementById('#left-btn-plugins'),
                hint: this.tipPlugins,
                enableToggle: true,
                disabled: true,
                toggleGroup: 'leftMenuGroup'
            });
            this.btnPlugins.hide();
            this.btnPlugins.on('click',         _.bind(this.onBtnMenuClick, this, 'tab'));
            
            // this.btnSearch.on('click',          _.bind(this.onBtnMenuClick, this));
            
            this.btnAbout.on('toggle',          _.bind(this.onBtnMenuToggle, this));
            this.btnAbout.on('click',           _.bind(this.onFullMenuClick, this));

            this.menuFile = new PE.Views.FileMenu({});
            this.btnAbout.panel = (new Common.Views.About({el: '#about-menu-panel', appName: 'Presentation Editor'}));
             
            this.leftMenuClose =new Common.UI.Button({
                el: $markup.elementById('#left-btn-close')
            });

            this.leftMenuClose.on('click', _.bind(this.leftMenuState, this,'close'))            

            // 图标按钮
            this.btnSearchIcon = new Common.UI.Button({
                el: $markup.elementById('#left-btn-search-icon'),
                action: 'search',
                hint: this.tipSearch,

            });
            this.btnThumbsIcon = new Common.UI.Button({
                el: $markup.elementById('#left-btn-thumbs-icon'),
                action: 'thumbnails',
                hint: this.tipSlides,
            });
            this.btnCommentsIcon  = new Common.UI.Button({
                el: $markup.elementById('#left-btn-comments-icon'),
                action: 'comments',
                hint: this.tipComments + Common.Utils.String.platformKey('Ctrl+Shift+H')

            });
            this.btnChatIcon  = new Common.UI.Button({
                el: $markup.elementById('#left-btn-chat-icon'),
                action: 'chat',
                hint: this.tipChat + Common.Utils.String.platformKey('Alt+Q')

            });
            this.btnSearchIcon.on('click', _.bind(this.onBtnMenuClick, this, 'icon'));
            this.btnCommentsIcon.on('click', _.bind(this.onBtnMenuClick, this, 'icon'));
            this.btnChatIcon.on('click', _.bind(this.onBtnMenuClick, this, 'icon'));
            this.btnThumbsIcon.on('click',  _.bind(this.onBtnMenuClick, this, 'icon'));
           
            this.addMenuLabel()
           
            this.$el.html($markup);
            this.$el.width(44);
            return this;
        },
        // 添加按钮文字
        addMenuLabel: function (){
            var _this  = this;
            _this.btnSearch.$el.text(_this.tipSearch)
            _this.btnComments.$el.text(_this.tipComments)
            _this.btnChat.$el.text(_this.tipChat)
            _this.btnThumbs.$el.text(_this.tipSlides)

        },
        onBtnCommentsToggle: function(btn, state) {
            if (!state)
                this.fireEvent('comments:hide', this);
        },

        onBtnMenuToggle: function(btn, state) {
            if (state) {
                btn.panel['show']();
                if (!this._state.pluginIsRunning)
                    this.$el.width(SCALE_MIN);

                if (this.btnSearch.isActive())
                    this.btnSearch.toggle(false);
            } else {
                btn.panel['hide']();
            }
            PE.getController('Toolbar').DisableToolbar(state==true);
            Common.NotificationCenter.trigger('layout:changed', 'leftmenu');
        },
        leftMenuState: function(state){
            var _this = this;
            var leftWidth = 44;
            if( $("#left-menu-expand").is(":visible")){
                $("#left-menu-expand").hide()
                this.$el.width(leftWidth)
            }else{
                leftWidth = 375
                $("#left-menu-expand").show()
                this.$el.width(leftWidth)
            }
            $('#editor-container').css('left', leftWidth + 'px');

            if(state === 'close'){
                this.btnAction = '';
            }
            Common.NotificationCenter.trigger('layout:changed');

        },
        initShowThumbnail(){
            this.btnAction = 'thumbnails';
            this.leftMenuState()
            this.showHidePanel('thumbnails')
            this.btnThumbs.toggle(true)
        },
        onBtnMenuClick: function(type='', btn, e) {

            if(this.btnAction && btn.options.action === this.btnAction){
                if(type === 'icon'){
                    this.leftMenuState('close')
                }
                return
            }else if(!this.btnAction || this.btnAction === ''){
                if(type === 'icon'){
                    this.leftMenuState()
                }
            }
            this.btnAction = btn.options.action;
            this.showHidePanel(this.btnAction)

            // var full_menu_pressed = this.btnAbout.pressed;
            // if (this.btnAbout.pressed) this.btnAbout.toggle(false);

            if (btn.options.action == 'search') {
                this.btnChat.pressed = false;
                this.btnComments.pressed = false;
                this.btnThumbs.pressed = false;
                $("#left-btn-comments").removeClass("active")
                $("#left-btn-chat").removeClass("active")
                $("#left-btn-thumbs").removeClass("active")
                btn.pressed = true
                // Common.NotificationCenter.trigger('layout:changed', 'leftmenu');
                // return
                // full_menu_pressed && this.fireEvent('panel:show', [this.btnAbout, 'files', false]);
                // return;
            } else {
                this.btnSearch.pressed = false
            }
            
            this.btnThumbs.toggle(btn.options.action == 'thumbnails')
            
            // if (btn.options.action == 'thumbnails') {
            //     if (!btn.pressed && this._state.pluginIsRunning) {
            //         this.$el.width(Common.localStorage.getItem('pe-mainmenu-width') || MENU_SCALE_PART);
            //     } else {
            //         if (this.$el.width() > SCALE_MIN) {
            //             Common.localStorage.setItem('pe-mainmenu-width',this.$el.width());
            //             this.$el.width(SCALE_MIN);
            //         }
            //         if (this._state.pluginIsRunning) // hide comments or chat panel when plugin is running
            //             this.onCoauthOptions();
            //     }
            // } else {
            //     if (btn.pressed) {
            //         if (!(this.$el.width() > SCALE_MIN)) {
            //             this.$el.width(Common.localStorage.getItem('pe-mainmenu-width') || MENU_SCALE_PART);
            //         }
            //     } else if (!this._state.pluginIsRunning){
            //         Common.localStorage.setItem('pe-mainmenu-width',this.$el.width());
            //         this.$el.width(SCALE_MIN);
            //     }
            // }
            

            // this.fireEvent('panel:show', [this, btn.options.action, btn.pressed]);
            Common.NotificationCenter.trigger('layout:changed', 'leftmenu');
        },
        showHidePanel: function (action) {
            var currAction = action;
            var leftMenuBtn = {
                'chat': this.btnChat,
                'comments': this.btnComments,
                'search': this.btnSearch,
                'thumbnails': this.btnThumbs
            }
            for(var tempAction in leftMenuBtn) {
                if(tempAction === currAction){
                    leftMenuBtn[currAction].pressed = true;
                    leftMenuBtn[currAction].$el.addClass('active');
                }else{
                    leftMenuBtn[tempAction].pressed = false
                    leftMenuBtn[tempAction].$el.removeClass('active');
                }
                this.onCoauthOptions(leftMenuBtn[tempAction]);

            }

        },
        onFullMenuClick: function(btn, e) {
            (!btn.pressed) && this.fireEvent('panel:show', [this, btn.options.action, btn.pressed]);
        },

        onCoauthOptions: function(e) {
            /** coauthoring begin **/
            if (this.mode.canCoAuthoring) {
                if (this.mode.canViewComments) {
                    if (this.btnComments.pressed && this.btnComments.$el.hasClass('notify'))
                        this.btnComments.$el.removeClass('notify');
                    this.panelComments[this.btnComments.pressed?'show':'hide']();
                    this.fireEvent((this.btnComments.pressed) ? 'comments:show' : 'comments:hide', this);
                }
                if (this.mode.canChat) {
                    if (this.btnChat.pressed) {
                        if (this.btnChat.$el.hasClass('notify'))
                            this.btnChat.$el.removeClass('notify');
                        this.panelChat.show();
                        this.panelChat.focus();
                    } else
                        this.panelChat['hide']();
                }
            }
            // 搜索面板
            if (this.panelSearch) {
                if (this.btnSearch.pressed) {
                    this.fireEvent('searchPanel:show' , this);

                } else {
                    this.fireEvent('searchPanel:hide' , this);

                }
            }
            if (this.panelThumbnails) {
                
                if (this.btnThumbs.pressed) {
                    // this.btnThumbs.toggle(true)
                    this.panelThumbnails.style.display='block';
                } else {
                    // this.btnThumbs.toggle(false)
                    this.panelThumbnails.style.display='none';
                }
            }
            /** coauthoring end **/
            // if (this.mode.canPlugins && this.panelPlugins) {
            //     if (this.btnPlugins.pressed) {
            //         this.panelPlugins.show();
            //     } else
            //         this.panelPlugins['hide']();
            // }
        },

        setOptionsPanel: function(name, panel) {
            /** coauthoring begin **/
            if (name == 'chat') {
                this.panelChat = panel.render('#left-panel-chat');
            } else if (name == 'comment') {
                this.panelComments = panel;
            } else /** coauthoring end **/
            if (name == 'plugins' && !this.panelPlugins) {
                this.panelPlugins = panel.render('#left-panel-plugins');
            } else
            if (name == 'thumbnails'  && !this.panelThumbnails) {
                // this.panelThumbnails = panel.render('#left-panel-thumbnails');
                this.panelThumbnails = document.getElementById('left-panel-thumbnails');

            }
            if (name == 'search' && !this.panelSearch) {
                this.panelSearch = panel.render('#left-panel-Search');
            }
            // else if (name == 'history') {
            //     this.panelHistory = panel.render('#left-panel-history');
            // }
        },

        /** coauthoring begin **/
        markCoauthOptions: function(opt, ignoreDisabled) {
            if (opt=='chat' && this.btnChat.isVisible() &&
                    !this.btnChat.isDisabled() && !this.btnChat.pressed) {
                this.btnChat.$el.addClass('notify');
            }
            if (opt=='comments' && this.btnComments.isVisible() && !this.btnComments.pressed &&
                                (!this.btnComments.isDisabled() || ignoreDisabled) ) {
                this.btnComments.$el.addClass('notify');
            }
        },
        /** coauthoring end **/

        close: function(menu) {
            this.btnAbout.toggle(false);
            this.btnThumbs.toggle(false);
            if (!this._state.pluginIsRunning)
                this.$el.width(SCALE_MIN);
            /** coauthoring begin **/
            if (this.mode.canCoAuthoring) {
                if (this.mode.canViewComments) {
                    this.panelComments['hide']();
                    if (this.btnComments.pressed)
                        this.fireEvent('comments:hide', this);
                    this.btnComments.toggle(false, true);
                }
                if (this.mode.canChat) {
                    this.panelChat['hide']();
                    this.btnChat.toggle(false);
                }
            }
            /** coauthoring end **/
            if (this.mode.canPlugins && this.panelPlugins && !this._state.pluginIsRunning) {
                this.panelPlugins['hide']();
                this.btnPlugins.toggle(false, true);
            }
            if(this.panelSearch){
                this.panelSearch['hide']();
                this.btnSearch.toggle(false, true)
            }
            if (this.panelThumbnails) {
                // this.panelThumbnails['hide']();
                this.panelThumbnails.style.display='none';
                this.btnThumbs.toggle(false, true);
            }
            this.fireEvent('panel:show', [this, '', false]);
        },

        isOpened: function() {
            var isopened = this.btnSearch.pressed;
            /** coauthoring begin **/
            !isopened && (isopened = this.btnComments.pressed || this.btnChat.pressed);
            /** coauthoring end **/
            return isopened;
        },

        disableMenu: function(menu, disable) {
            this.btnThumbs.setDisabled(disable);
            this.btnAbout.setDisabled(disable);
            this.btnSupport.setDisabled(disable);
            /** coauthoring begin **/
            this.btnChat.setDisabled(disable);
            /** coauthoring end **/
            this.btnPlugins.setDisabled(disable);
        },

        showMenu: function(menu, opts) {
            var re = /^(\w+):?(\w*)$/.exec(menu);
            if ( re[1] == 'file' ) {
                this.menuFile.show(re[2].length ? re[2] : undefined, opts);
            } else {
                /** coauthoring begin **/
                if (menu == 'chat') {
                    if (this.btnChat.isVisible() &&
                            !this.btnChat.isDisabled() && !this.btnChat.pressed) {
                        this.btnChat.toggle(true);
                        this.onBtnMenuClick(this.btnChat);
                        this.onCoauthOptions();
                        this.panelChat.focus();
                    }
                } else
                if (menu == 'comments') {
                    if (this.btnComments.isVisible() &&
                            !this.btnComments.isDisabled() && !this.btnComments.pressed) {
                        this.btnComments.toggle(true);
                        this.onBtnMenuClick(this.btnComments);
                        this.onCoauthOptions();
                    }
                }else if (menu == 'thumbnails') {
                    if (this.btnThumbs.isVisible() &&
                        !this.btnThumbs.isDisabled() && !this.btnThumbs.pressed) {
                        this.btnThumbs.toggle(true);
                        this.onBtnMenuClick(this.btnThumbs);
                        this.onCoauthOptions();
                    }
                }
                else if (menu == 'search') {
                    if (this.btnSearch.isVisible() &&
                        !this.btnSearch.isDisabled() && !this.btnSearch.pressed) {
                        this.btnSearch.toggle(true);
                        this.onBtnMenuClick(this.btnSearch);
                        this.onCoauthOptions();
                    }
                }
                /** coauthoring end **/
            }
        },

        getMenu: function(type) {
            switch (type) {
            default: return null;
            case 'file': return this.menuFile;
            case 'about': return this.btnAbout.panel;
            }
        },

        setMode: function(mode) {
            this.mode = mode;
            this.btnAbout.panel.setMode(mode);
            return this;
        },

        setDeveloperMode: function(mode, beta, version) {
            if ( !this.$el.is(':visible') ) return;

            if ((mode & Asc.c_oLicenseMode.Trial) || (mode & Asc.c_oLicenseMode.Developer)) {
                if (!this.developerHint) {
                    var str = '';
                    if ((mode & Asc.c_oLicenseMode.Trial) && (mode & Asc.c_oLicenseMode.Developer))
                        str = this.txtTrialDev;
                    else if ((mode & Asc.c_oLicenseMode.Trial)!==0)
                        str = this.txtTrial;
                    else if ((mode & Asc.c_oLicenseMode.Developer)!==0)
                        str = this.txtDeveloper;
                    str = str.toUpperCase();
                    this.developerHint = $('<div id="developer-hint">' + str + '</div>').appendTo(this.$el);
                    this.devHeight = this.developerHint.outerHeight();
                    !this.devHintInited && $(window).on('resize', _.bind(this.onWindowResize, this));
                    this.devHintInited = true;
                }
            }
            this.developerHint && this.developerHint.toggleClass('hidden', !((mode & Asc.c_oLicenseMode.Trial) || (mode & Asc.c_oLicenseMode.Developer)));

            if (beta) {
                if (!this.betaHint) {
                    var style = (mode) ? 'style="margin-top: 4px;"' : '',
                        arr = (version || '').split('.'),
                        ver = '';
                    (arr.length>0) && (ver += ('v. ' + arr[0]));
                    (arr.length>1) && (ver += ('.' + arr[1]));
                    this.betaHint = $('<div id="beta-hint"' + style + '>' + (ver + ' (beta)' ) + '</div>').appendTo(this.$el);
                    this.betaHeight = this.betaHint.outerHeight();
                    !this.devHintInited && $(window).on('resize', _.bind(this.onWindowResize, this));
                    this.devHintInited = true;
                }
            }
            this.betaHint && this.betaHint.toggleClass('hidden', !beta);

            var btns = this.$el.find('button.btn-category:visible'),
                lastbtn = (btns.length>0) ? $(btns[btns.length-1]) : null;
            this.minDevPosition = (lastbtn) ? (lastbtn.offset().top - lastbtn.offsetParent().offset().top + lastbtn.height() + 20) : 20;
            this.onWindowResize();
        },

        setLimitMode: function() {
            if ( !this.$el.is(':visible') ) return;

            if (!this.limitHint) {
                var str = this.txtLimit.toUpperCase();
                this.limitHint = $('<div id="limit-hint" style="margin-top: 4px;">' + str + '</div>').appendTo(this.$el);
                this.limitHeight = this.limitHint.outerHeight();
                !this.devHintInited && $(window).on('resize', _.bind(this.onWindowResize, this));
                this.devHintInited = true;
            }
            this.limitHint && this.limitHint.toggleClass('hidden', false);

            var btns = this.$el.find('button.btn-category:visible'),
                lastbtn = (btns.length>0) ? $(btns[btns.length-1]) : null;
            this.minDevPosition = (lastbtn) ? (lastbtn.offset().top - lastbtn.offsetParent().offset().top + lastbtn.height() + 20) : 20;
            this.onWindowResize();
        },

        onWindowResize: function() {
            var height = (this.devHeight || 0) + (this.betaHeight || 0) + (this.limitHeight || 0);
            var top = Math.max((this.$el.height()-height)/2, this.minDevPosition);
            if (this.developerHint) {
                this.developerHint.css('top', top);
                top += this.devHeight;
            }
            if (this.betaHint) {
                this.betaHint.css('top', top);
                top += (this.betaHeight + 4);
            }
            this.limitHint && this.limitHint.css('top', top);
        },

        // showHistory: function() {
        //     this._state.pluginIsRunning = false;
        //     this._state.historyIsRunning = true;
        //     this.panelHistory.show();
        //     this.panelHistory.$el.width((parseInt(Common.localStorage.getItem('pe-mainmenu-width')) || MENU_SCALE_PART) - SCALE_MIN);
        //     Common.NotificationCenter.trigger('layout:changed', 'history');
        // },

        /** coauthoring begin **/
        tipComments : 'Comments',
        tipChat     : 'Chat',
        /** coauthoring end **/
        tipAbout    : 'About',
        tipSupport  : 'Feedback & Support',
        tipSearch   : 'Search & Replace',
        tipSlides: 'Slides',
        tipPlugins  : 'Plugins',
        txtDeveloper: 'DEVELOPER MODE',
        txtTrial: 'TRIAL MODE',
        txtTrialDev: 'Trial Developer Mode',
        txtLimit: 'Limit Access'
    }, PE.Views.LeftMenu || {}));
});
