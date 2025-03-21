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
 *    Viewport.js
 *
 *    View for viewport
 *
 *    Created by Maxim Kadushkin on 24 March 2014
 *    Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/Viewport.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout'
], function (viewportTemplate, $, _, Backbone) {
    'use strict';

    SSE.Views.Viewport = Backbone.View.extend({
        el: '#viewport',

        // Compile our stats template
        template: _.template(viewportTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        // Set innerHTML and get the references to the DOM elements
        initialize: function() {
            //
        },

        // Render layout
        render: function() {
            var el = $(this.el);
            el.html(this.template({}));

            // Workaround Safari's scrolling problem
            if (Common.Utils.isSafari) {
                $('body').addClass('safari');
                $('body').mousewheel(function(e){
                    e.preventDefault();
                    e.stopPropagation();
                });
            } else if (Common.Utils.isChrome) {
                $('body').addClass('chrome');
            }

            var $container = $('#viewport-vbox-layout', el);
            var items = $container.find(' > .layout-item');
            this.vlayout = new Common.UI.VBoxLayout({
                box: $container,
                items: [{
                    el: $container.find('> .layout-item#app-title').hide(),
                    alias: 'title',
                    height: Common.Utils.InternalSettings.get('document-title-height')
                },{
                    el: items[1],
                    alias: 'toolbar',
                    height: Common.localStorage.getBool('sse-compact-toolbar') ?
                        Common.Utils.InternalSettings.get('toolbar-height-compact') : Common.Utils.InternalSettings.get('toolbar-height-normal')
                }, {
                    el: items[2],
                    stretch: true
                }, {
                    el: items[3],
                    alias: 'statusbar',
                    height: Common.localStorage.getBool('sse-compact-statusbar', true) ? 25 : 50
                }]
            });

            $container = $('#viewport-hbox-layout', el);
            items = $container.find(' > .layout-item');
            this.hlayout = new Common.UI.HBoxLayout({
                box: $container,
                items: [{
                    el: items[0],
                    rely: true,
                    resize: {
                        hidden: true,
                        autohide: false,
                        min: 300,
                        max: 600,
                        offset: 4
                    }
                },
                //  { // history versions
                //     el: items[3],
                //     rely: true,
                //     resize: {
                //         hidden: true,
                //         autohide: false,
                //         min: 300,
                //         max: 600
                //     }
                // },
                 {
                    el: items[1],
                    stretch: true
                }, {
                    el: $(items[2]).hide(),
                    rely: true
                }]
            });

            $container = $container.find('.layout-ct.vbox');
            items = $container.find(' > .layout-item');
            this.celayout = new Common.UI.VBoxLayout({
                box: $container,
                items: [{
                    el: items[0],
                    rely: true,
                    resize: {
                        min: 19,
                        max: -100,
                        multiply: { koeff: 18, offset: 2}
                    }
                }, {
                    el: items[1],
                    stretch: true
                }]
            });

            return this;
        },

        applyEditorMode: function() {
            var me              = this,
                rightMenuView   = SSE.getController('RightMenu').getView('RightMenu');

            me._rightMenu   = rightMenuView.render(this.mode);
        },

        setMode: function(mode, delay) {
            if (mode.isDisconnected) {
                /** coauthoring begin **/
                if (_.isUndefined(this.mode))
                    this.mode = {};

                this.mode.canCoAuthoring = false;
                /** coauthoring end **/
            } else {
                this.mode = mode;
                if (this.vlayout && mode.isDesktopApp && !mode.isEdit)
                    this.vlayout.items[1].el.css('display', 'block');
            }
        }
    });
});