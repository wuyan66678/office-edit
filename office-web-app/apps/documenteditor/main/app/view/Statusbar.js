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
 *  StatusBar View
 *
 *  Created by Maxim Kadushkin
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!documenteditor/main/app/template/StatusBar.template',
    'jquery',
    'underscore',
    'backbone',
    'tip',
    'common/main/lib/component/Menu',
    'common/main/lib/component/Window',
    'documenteditor/main/app/model/Pages'
 ],
    function(template, $, _, Backbone){
        'use strict';

        function _onCountPages(count){
            this.pages.set('count', count);
        }

        function _onCurrentPage(number){
            this.pages.set('current', number+1);
        }

        var _tplPages = _.template('Page <%= current %> of <%= count %>');

        function _updatePagesCaption(model,value,opts) {
            $('.statusbar #label-pages',this.$el).text(
                Common.Utils.String.format(this.pageIndexText, model.get('current'), model.get('count')) );
        }

        function _clickLanguage(menu, item) {
            this.langMenu.prevTip = item.value.value;
            this.btnLanguage.setCaption(item.caption);
            this.fireEvent('langchanged', [this, item.value.code, item.caption]);
        }

        function _onAppReady(config) {
            var me = this;
            me.btnZoomToPage.updateHint(me.tipFitPage);
            me.btnZoomToWidth.updateHint(me.tipFitWidth);
            me.btnZoomDown.updateHint(me.tipZoomOut + Common.Utils.String.platformKey('Ctrl+-'));
            me.btnZoomUp.updateHint(me.tipZoomIn + Common.Utils.String.platformKey('Ctrl++'));

            if (config.canUseSelectHandTools) {
                me.btnSelectTool.updateHint(me.tipSelectTool);
                me.btnHandTool.updateHint(me.tipHandTool);
            }

            if (me.btnLanguage && me.btnLanguage.cmpEl) {
                me.btnLanguage.updateHint(me.tipSetLang);
                me.langMenu.on('item:click', _.bind(_clickLanguage, this));
            }

            me.cntZoom.updateHint(me.tipZoomFactor);
            me.cntZoom.cmpEl.on({
                'show.bs.dropdown': function () {
                    _.defer(function(){
                        me.cntZoom.cmpEl.find('ul').focus();
                    }, 100);
                },
                'hide.bs.dropdown': function () {
                    _.defer(function(){
                        me.api.asc_enableKeyEvents(true);
                    }, 100);
                }
            });

            me.txtGoToPage.on({
                    'keypress:after': function (input, e) {
                        if (e.keyCode === Common.UI.Keys.RETURN) {
                            var box = me.$el.find('#status-goto-box'),
                                edit = box.find('input[type=text]'), page = parseInt(edit.val());
                            if (!page || page-- > me.pages.get('count') || page < 0) {
                                edit.select();
                                return false;
                            }

                            box.focus();                        // for IE
                            box.parent().removeClass('open');

                            me.api.goToPage(page);
                            me.api.asc_enableKeyEvents(true);

                            return false;
                        }
                    },
                    'keyup:after': function (input, e) {
                        if (e.keyCode === Common.UI.Keys.ESC) {
                            var box = me.$el.find('#status-goto-box');
                            box.focus();                        // for IE
                            box.parent().removeClass('open');
                            me.api.asc_enableKeyEvents(true);
                            return false;
                        }
                    }
            });

            var goto = me.$el.find('#status-goto-box');
            goto.on('click', function() {
                return false;
            });
            goto.parent().on({
                'show.bs.dropdown': function () {
                    me.txtGoToPage.setValue(me.api.getCurrentPage() + 1);
                    me.txtGoToPage.checkValidate();
                    var edit = me.txtGoToPage.$el.find('input');
                    _.defer(function(){
                        edit.focus().select();
                    }, 100);
                },
                'hide.bs.dropdown': function () {
                    var box = me.$el.find('#status-goto-box');
                    if (me.api && box) {
                        box.focus();                        // for IE
                        box.parent().removeClass('open');

                        me.api.asc_enableKeyEvents(true);
                    }
                }
            });

            me.zoomMenu.on('item:click', function(menu, item) {
                me.fireEvent('zoom:value', [item.value]);
            });
        }

        DE.Views.Statusbar = Backbone.View.extend(_.extend({
            el: '#statusbar',
            template: _.template(template),

            events: {
            },

            api: undefined,
            pages: undefined,

            initialize: function (options) {
                _.extend(this, options);
                this.pages = new DE.Models.Pages({current:1, count:1});
                this.pages.on('change', _.bind(_updatePagesCaption,this));
                this.state = {};

                var me = this;
                this.$layout = $(this.template({
                    textGotoPage: this.goToPageText,
                    textPageNumber: Common.Utils.String.format(this.pageIndexText, 1, 1)
                }));

                this.btnSelectTool = new Common.UI.Button({
                    hintAnchor: 'top',
                    toggleGroup: 'select-tools',
                    enableToggle: true,
                    allowDepress: false
                });

                this.btnHandTool = new Common.UI.Button({
                    hintAnchor: 'top',
                    toggleGroup: 'select-tools',
                    enableToggle: true,
                    allowDepress: false
                });

                this.btnZoomToPage = new Common.UI.Button({
                    hintAnchor: 'top',
                    toggleGroup: 'status-zoom',
                    enableToggle: true
                });

                this.btnZoomToWidth = new Common.UI.Button({
                    hintAnchor: 'top',
                    toggleGroup: 'status-zoom',
                    enableToggle: true
                });

                this.cntZoom = new Common.UI.Button({
                    hintAnchor: 'top'
                });

                this.btnZoomDown = new Common.UI.Button({
                    hintAnchor: 'top'
                });

                this.btnZoomUp = new Common.UI.Button({
                    hintAnchor: 'top-right'
                });

                this.btnLanguage = new Common.UI.Button({
                    cls         : 'btn-toolbar',
                    caption     : 'English (United States)',
                    hintAnchor  : 'top-left',
                    disabled: true,
                    dataHint    : '0',
                    dataHintDirection: 'top',
                    menu: true
                });

                this.langMenu = new Common.UI.MenuSimple({
                    cls: 'lang-menu',
                    style: 'margin-top:-5px;',
                    restoreHeight: 285,
                    itemTemplate: _.template([
                        '<a id="<%= id %>" tabindex="-1" type="menuitem" style="padding-left: 28px !important;" langval="<%= value.value %>" class="<% if (checked) { %> checked <% } %>">',
                            '<i class="icon <% if (spellcheck) { %> toolbar__icon btn-ic-docspell spellcheck-lang <% } %>"></i>',
                            '<%= caption %>',
                        '</a>'
                    ].join('')),
                    menuAlign: 'bl-tl',
                    search: true
                });

                this.zoomMenu = new Common.UI.Menu({
                    style: 'margin-top:-5px;',
                    menuAlign: 'bl-tl',
                    items: [
                        { caption: "50%", value: 50 },
                        { caption: "75%", value: 75 },
                        { caption: "100%", value: 100 },
                        { caption: "125%", value: 125 },
                        { caption: "150%", value: 150 },
                        { caption: "175%", value: 175 },
                        { caption: "200%", value: 200 },
                        { caption: "300%", value: 300 },
                        { caption: "400%", value: 400 },
                        { caption: "500%", value: 500 }
                    ]
                });

                this.txtGoToPage = new Common.UI.InputField({
                    allowBlank  : true,
                    validateOnChange: true,
                    style       : 'width: 60px;',
                    maskExp: /[0-9]/,
                    validation  : function(value) {
                        if (/(^[0-9]+$)/.test(value)) {
                            value = parseInt(value);
                            if (undefined !== value && value > 0 && value <= me.pages.get('count'))
                                return true;
                        }

                        return me.txtPageNumInvalid;
                    }
                });

                var promise = new Promise(function (accept, reject) {
                    accept();
                });

                Common.NotificationCenter.on('app:ready', function(mode) {
                    promise.then( _onAppReady.bind(this, mode) );
                }.bind(this));
            },

            render: function(config) {
                var me = this;

                function _btn_render(button, slot) {
                    button.setElement(slot, false);
                    button.render();
                }

                this.fireEvent('render:before', [this.$layout]);

                _btn_render(me.btnZoomToPage, $('#btn-zoom-topage', me.$layout));
                _btn_render(me.btnZoomToWidth, $('#btn-zoom-towidth', me.$layout));
                _btn_render(me.cntZoom, $('.cnt-zoom',me.$layout));
                _btn_render(me.btnZoomDown, $('#btn-zoom-down', me.$layout));
                _btn_render(me.btnZoomUp, $('#btn-zoom-up', me.$layout));
                _btn_render(me.txtGoToPage, $('#status-goto-page', me.$layout));

                if ( !config || config.isEdit ) {
                    me.btnLanguage.render($('#btn-cnt-lang', me.$layout));
                    me.btnLanguage.setMenu(me.langMenu);
                    me.langMenu.prevTip = 'en';
                }

                if (config.canUseSelectHandTools) {
                    _btn_render(me.btnSelectTool, $('#btn-select-tool', me.$layout));
                    _btn_render(me.btnHandTool, $('#btn-hand-tool', me.$layout));
                }

                me.zoomMenu.render($('.cnt-zoom',me.$layout));
                me.zoomMenu.cmpEl.attr({tabindex: -1});

                this.$el.html(me.$layout);
                this.fireEvent('render:after', [this]);

                return this;
            },

            setApi: function(api) {
                this.api = api;

                if (this.api) {
                    this.api.asc_registerCallback('asc_onCountPages',   _.bind(_onCountPages, this));
                    this.api.asc_registerCallback('asc_onCurrentPage',  _.bind(_onCurrentPage, this));
                    this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onApiCoAuthoringDisconnect, this));
                    Common.NotificationCenter.on('api:disconnect',      _.bind(this.onApiCoAuthoringDisconnect, this));
                }

                return this;

            },

            setMode: function(mode) {
                this.mode = mode;
            },

            setVisible: function(visible) {
                visible
                    ? this.show()
                    : this.hide();
            },

            isVisible: function() {
                return this.$el && this.$el.is(':visible');
            },

            reloadLanguages: function(array) {
                var arr = [],
                    saved = this.langMenu.saved;
                _.each(array, function(item) {
                    arr.push({
                        caption     : item['displayValue'],
                        value       : {value: item['value'], code: item['code']},
                        checkable   : true,
                        checked     : saved == item['displayValue'],
                        spellcheck  : item['spellcheck']
                    });
                });
                this.langMenu.resetItems(arr);
                if (this.langMenu.items.length>0) {
                    this.btnLanguage.setDisabled(!!this.mode.isDisconnected);
                }
            },

            setLanguage: function(info) {
                if (this.langMenu.prevTip != info.value && info.code !== undefined) {
                    this.btnLanguage.setCaption(info.displayValue);
                    this.langMenu.prevTip = info.value;

                    var lang = _.find(this.langMenu.items, function(item) { return item.caption == info.displayValue; });
                    if (lang) {
                        this.langMenu.setChecked(this.langMenu.items.indexOf(lang), true);
                    } else {
                        this.langMenu.saved = info.displayValue;
                        this.langMenu.clearAll();
                    }
                }
            },

            getStatusLabel: function() {
                return $('.statusbar #label-action');
            },
						setVersion: function () {
							$('.statusbar #onlyoffice-version').text(window.ONLYOFFICE_VERSION);
						},
            showStatusMessage: function(message) {
                this.getStatusLabel().text(message);
            },

            clearStatusMessage: function() {
                this.getStatusLabel().text('');
            },

            SetDisabled: function(disable) {
                this.btnLanguage.setDisabled(disable || this.langMenu.items.length<1);
                this.btnTurnReview && this.btnTurnReview.setDisabled(disable);
            },

            onApiCoAuthoringDisconnect: function() {
                this.setMode({isDisconnected:true});
                this.SetDisabled(true);
            },

            pageIndexText       : 'Page {0} of {1}',
            goToPageText        : 'Go to Page',
            tipFitPage          : 'Fit to Page',
            tipFitWidth         : 'Fit to Width',
            tipZoomIn           : 'Zoom In',
            tipZoomOut          : 'Zoom Out',
            tipZoomFactor       : 'Magnification',
            tipSetLang          : 'Set Text Language',
            txtPageNumInvalid   : 'Page number invalid',
            textTrackChanges    : 'Track Changes',
            textChangesPanel    : 'Changes panel',
            tipSelectTool       : 'Select tool',
            tipHandTool         : 'Hand tool'
        }, DE.Views.Statusbar || {}));
    }
);