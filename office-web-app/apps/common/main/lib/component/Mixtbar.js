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
 *  Mixtbar.js
 *
 *  Combined component for toolbar's and header's elements
 *
 *
 *  Created by Maxim.Kadushkin on 4/11/2017.
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'backbone',
    'common/main/lib/component/BaseView'
], function (Backbone) {
    'use strict';

    Common.UI.Mixtbar = Common.UI.BaseView.extend((function () {
        var $boxTabs;
        var $scrollL;
        var optsFold = {timeout: 2000};
        var config = {};

        var onScrollTabs = function(opts, e) {
            var sv = $boxTabs.scrollLeft();
            if ( sv || opts == 'right' ) {
                $boxTabs.animate({scrollLeft: opts == 'left' ? sv - 100 : sv + 100}, 200);
            }
        };

        function onTabDblclick(e) {
            var tab = $(e.currentTarget).find('> a[data-tab]').data('tab');
            if ( this.dblclick_el == tab ) {
                this.fireEvent('change:compact', [tab]);
                this.dblclick_el = undefined;
            }
        }

        function onShowFullviewPanel(state) {
            if ( state )
                optsFold.$bar.addClass('cover'); else
                optsFold.$bar.removeClass('cover');
        }

        function onClickDocument(e) {
            if ( this.isFolded ) {
                if ( $(e.target).parents('.toolbar, #file-menu-panel').length ){
                } else {
                    optsFold.$bar && optsFold.$bar.hasClass('expanded') && this.collapse();
                }
            }
        }

        return {
            $tabs: undefined,
            $panels: undefined,
            isFolded: false,

            initialize : function(options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                var _template_tabs =
                    '<section class="tabs tabs-center">' +
                        '<a class="scroll left" data-hint="0" data-hint-direction="bottom" data-hint-offset="-7, 0" data-hint-title="V"></a>' +
                        '<ul>' +
                            '<% for(var i in items) { %>' +
                                '<% if (typeof items[i] == "object") { %>' +
                                '<li class="ribtab' +
                                        '<% if (items[i].haspanel===false) print(" x-lone") %>' +
                                        '<% if (items[i].extcls) print(\' \' + items[i].extcls) %>"' +
                                        '<% if (typeof items[i].layoutname == "string") print(" data-layout-name=" + \' \' +  items[i].layoutname) + \' \' %>>' +
                                    '<a data-tab="<%= items[i].action %>" data-title="<%= items[i].caption %>" data-hint="0" data-hint-direction="bottom" data-hint-offset="small" <% if (typeof items[i].dataHintTitle !== "undefined") { %> data-hint-title="<%= items[i].dataHintTitle %>" <% } %>><%= items[i].caption %></a>' +
                                '</li>' +
                                '<% } %>' +
                            '<% } %>' +
                        '</ul>' +
                        '<a class="scroll right" data-hint="0" data-hint-direction="bottom" data-hint-offset="-7, 0" data-hint-title="R"></a>' +
                    '</section>';
                this.$layout = $(options.template({
                    tabsmarkup: _.template(_template_tabs)({items: options.tabs})
                }));

                config.tabs = options.tabs;
                $(document.body).on('click', onClickDocument.bind(this));

                Common.NotificationCenter.on('tab:visible', _.bind(function(action, visible){
                    this.setVisible(action, visible);
                }, this));
            },

            afterRender: function() {
                var me = this;

                $boxTabs = me.$('.tabs > ul');
                me.$tabs = $boxTabs.find('> li');
                me.$panels = me.$('.box-panels > .panel');
                optsFold.$bar = me.$('.toolbar');
                var $scrollR = me.$('.tabs .scroll.right');
                $scrollL = me.$('.tabs .scroll.left');

                $scrollL.on('click', onScrollTabs.bind(this, 'left'));
                $scrollR.on('click', onScrollTabs.bind(this, 'right'));

                $boxTabs.on('dblclick', '> .ribtab', onTabDblclick.bind(this));
                $boxTabs.on('click', '> .ribtab', me.onTabClick.bind(this));

								// 打印
								$('#print-btn').on('click', function() {
									me.fireEvent('print', me)
								})
            },

            isTabActive: function(tag) {
                var t = this.$tabs.filter('.active').find('> a');
                return t.length && t.data('tab') == tag;
            },

            setFolded: function(value) {
                this.isFolded = value;

                var me = this;
                if ( this.isFolded ) {
                    if (!optsFold.$box) optsFold.$box = me.$el.find('.box-controls');

                    optsFold.$bar.addClass('folded z-clear').toggleClass('expanded', false);
                    optsFold.$bar.find('.tabs .ribtab').removeClass('active');
                    optsFold.$bar.on($.support.transition.end, function (e) {
                        if ( optsFold.$bar.hasClass('folded') && !optsFold.$bar.hasClass('expanded') )
                            optsFold.$bar.toggleClass('z-clear', true);
                    });
                    optsFold.$box.on({
                        mouseleave: function (e) {
                            // optsFold.timer = setTimeout( function(e) {
                            //     clearTimeout(optsFold.timer);
                            //     me.collapse();
                            // }, optsFold.timeout);
                        },
                        mouseenter: function (e) {
                            // clearTimeout(optsFold.timer);
                        }
                    });

                    // $(document.body).on('focus', 'input, textarea', function(e) {
                    // });
                    //
                    // $(document.body).on('blur', 'input, textarea', function(e) {
                    // });
                    //
                    // Common.NotificationCenter.on({
                    //     'modal:show': function(){
                    //     },
                    //     'modal:close': function(dlg) {
                    //     },
                    //     'modal:hide': function(dlg) {
                    //     },
                    //     'dataview:focus': function(e){
                    //     },
                    //     'dataview:blur': function(e){
                    //     },
                    //     'menu:show': function(e){
                    //     },
                    //     'menu:hide': function(e){
                    //     },
                    //     'edit:complete': _.bind(me.onEditComplete, me)
                    // });

                } else {
                    // clearTimeout(optsFold.timer);
                    optsFold.$bar.removeClass('folded z-clear');
                    optsFold.$box.off();

                    var active_panel = optsFold.$box.find('.panel.active');
                    if ( active_panel.length ) {
                        var tab = active_panel.data('tab');
                        me.$tabs.find('> a[data-tab=' + tab + ']').parent().toggleClass('active', true);
                    } else {
                        tab = me.$tabs.siblings(':not(.x-lone):visible').first().find('> a[data-tab]').data('tab');
                        me.setTab(tab);
                    }
                }
            },

            collapse: function() {
                Common.UI.Menu.Manager.hideAll();
                // clearTimeout(optsFold.timer);

                if ( this.isFolded && optsFold.$bar ) {
                    optsFold.$bar.removeClass('expanded');
                    optsFold.$bar.find('.tabs .ribtab').removeClass('active');
                }
            },

            expand: function() {
                // clearTimeout(optsFold.timer);

                optsFold.$bar.removeClass('z-clear');
                optsFold.$bar.addClass('expanded');
                // optsFold.timer = setTimeout(this.collapse, optsFold.timeout);
            },

            onResize: function(e) {
                if ( this.hasTabInvisible() ) {
                    if ( !$boxTabs.parent().hasClass('short') )
                        $boxTabs.parent().addClass('short');
                } else
                if ( $boxTabs.parent().hasClass('short') ) {
                    $boxTabs.parent().removeClass('short');
                }

                this.processPanelVisible();
            },

            onTabClick: function (e) {
                var me = this;
                var $target = $(e.currentTarget);
                var tab = $target.find('> a[data-tab]').data('tab');
                if ($target.hasClass('x-lone')) {
                    me.isFolded && me.collapse();
                } else {
                    if ( $target.hasClass('active') ) {
                        if (!me._timerSetTab) {
                            me.dblclick_el = tab;
                            if ( me.isFolded ) {
                                me.collapse();
                                setTimeout(function(){
                                    me.dblclick_el = undefined;
                                }, 500);
                            }
                        }
                    } else {
                        me._timerSetTab = true;
                        setTimeout(function(){
                            me._timerSetTab = false;
                        }, 500);
                        me.setTab(tab);
                        me.processPanelVisible(null, true);
                        if ( !me.isFolded ) {
                            if ( me.dblclick_timer ) clearTimeout(me.dblclick_timer);
                            me.dblclick_timer = setTimeout(function () {
                                me.dblclick_el = tab;
                                delete me.dblclick_timer;
                            },500);
                        } else
                            me.dblclick_el = tab;
                    }
                }
            },

            setTab: function (tab) {
                var me = this;
                if ( !tab ) {
                    // onShowFullviewPanel.call(this, false);

                    if ( this.isFolded ) { this.collapse(); }
                    else tab = this.lastPanel;
                }

                if ( tab ) {
                    me.$tabs.removeClass('active');
                    me.$panels.removeClass('active');

                    var panel = this.$panels.filter('[data-tab=' + tab + ']');
                    if ( panel.length ) {
                        this.lastPanel = tab;
                        panel.addClass('active');
                    }

                    if ( panel.length ) {
                        if ( me.isFolded ) me.expand();
                    } else {
                        // onShowFullviewPanel.call(this, true);
                        if ( me.isFolded ) me.collapse();
                    }

                    var $tp = this.$tabs.find('> a[data-tab=' + tab + ']').parent();
                    if ( $tp.length ) {
                        $tp.addClass('active');
                    }

                    this.fireEvent('tab:active', [tab]);
                }
            },

            addTab: function (tab, panel, after) {
                function _get_tab_action(index) {
                    if (index >= 0 && !config.tabs[index])
                        return _get_tab_action(--index);

                    return config.tabs[index] && config.tabs[index].action;
                }

                var _tabTemplate = _.template('<li class="ribtab" style="display: none;" <% if (typeof layoutname == "string") print(" data-layout-name=" + \' \' +  layoutname) + \' \' %>><a data-tab="<%= action %>" data-title="<%= caption %>" data-hint="0" data-hint-direction="bottom" data-hint-offset="small" <% if (typeof dataHintTitle !== "undefined") { %> data-hint-title="<%= dataHintTitle %>" <% } %> ><%= caption %></a></li>');

                config.tabs[after + 1] = tab;
                var _after_action = _get_tab_action(after);

                var _elements = this.$tabs || this.$layout.find('.tabs');
                var $target = _elements.find('a[data-tab=' + _after_action + ']');
                if ( $target.length ) {
                    $target.parent().after( _tabTemplate(tab) );

                    if (panel) {
                        _elements = this.$panels || this.$layout.find('.box-panels > .panel');
                        $target = _elements.filter('[data-tab=' + _after_action + ']');

                        if ($target.length) {
                            $target.after(panel);
                        } else {
                            panel.appendTo(this.$layout.find('.box-panels'));
                        }
                    }

                    // synchronize matched elements
                    this.$tabs && (this.$tabs = $boxTabs.find('> li'));
                    this.$panels && (this.$panels = this.$el.find('.box-panels > .panel'));
                }
            },

            isCompact: function () {
                return this.isFolded;
            },

            hasTabInvisible: function() {
                if ($boxTabs.length<1) return false;

                var _left_bound_ = Math.round($boxTabs.offset().left),
                    _right_bound_ = Math.round(_left_bound_ + $boxTabs.width());

                var tab = this.$tabs.filter(':visible:first').get(0);
                if ( !tab ) return false;

                var rect = tab.getBoundingClientRect();

                if ( !(Math.round(rect.left) < _left_bound_) ) {
                    tab = this.$tabs.filter(':visible:last').get(0);
                    rect = tab.getBoundingClientRect();

                    if (!(Math.round(rect.right) > _right_bound_))
                        return false;
                }

                return true;
            },

            /**
             * in case panel partly visible.
             * hide button's caption to decrease panel width
             * ##adopt-panel-width
            **/
            processPanelVisible: function(panel, now) {
                var me = this;
                if ( me._timer_id ) clearTimeout(me._timer_id);

                function _fc() {
                    var $active = panel || me.$panels.filter('.active');
                    if ( $active && $active.length ) {
                        var _maxright = $active.parents('.box-controls').width();
                        var data = $active.data(),
                            _rightedge = data.rightedge,
                            _btns = data.buttons,
                            _flex = data.flex;

                        if ( !_rightedge ) {
                            _rightedge = $active.get(0).getBoundingClientRect().right;
                        }
                        if ( !_btns ) {
                            _btns = [];
                            _.each($active.find('.btn-slot .x-huge'), function(item) {
                                _btns.push($(item).closest('.btn-slot'));
                            });
                            data.buttons = _btns;
                        }
                        if (!_flex) {
                            _flex = [];
                            _.each($active.find('.group.flex'), function(item) {
                                var el = $(item);
                                _flex.push({el: el, width: el.attr('data-group-width') || el.attr('max-width')}); //save flex element and it's initial width
                            });
                            data.flex = _flex;
                        }

                        if ( _rightedge > _maxright) {
                            if (_flex.length>0) {
                                for (var i=0; i<_flex.length; i++) {
                                    var item = _flex[i].el;
                                    if (item.outerWidth() > parseInt(item.css('min-width')))
                                        return;
                                    else
                                        item.css('width', item.css('min-width'));
                                }
                            }
                            for (var i=_btns.length-1; i>=0; i--) {
                                var btn = _btns[i];
                                if ( !btn.hasClass('compactwidth') ) {
                                    btn.addClass('compactwidth');
                                    _rightedge = $active.get(0).getBoundingClientRect().right;
                                    if (_rightedge <= _maxright)
                                        break;
                                }
                            }
                            data.rightedge = _rightedge;
                        } else {
                            for (var i=0; i<_btns.length; i++) {
                                var btn = _btns[i];
                                if ( btn.hasClass('compactwidth') ) {
                                    btn.removeClass('compactwidth');
                                    _rightedge = $active.get(0).getBoundingClientRect().right;
                                    if ( _rightedge > _maxright) {
                                        btn.addClass('compactwidth');
                                        _rightedge = $active.get(0).getBoundingClientRect().right;
                                        break;
                                    }
                                }
                            }
                            data.rightedge = _rightedge;
                            if (_flex.length>0 && $active.find('.btn-slot.compactwidth').length<1) {
                                for (var i=0; i<_flex.length; i++) {
                                    var item = _flex[i];
                                    item.el.css('width', item.width);
                                }
                            }
                        }
                    }
                };

                if ( now === true ) _fc(); else
                me._timer_id =  setTimeout(function() {
                    delete me._timer_id;
                    _fc();
                }, 100);
            },
            /**/

            setExtra: function (place, el) {
                if ( !!el ) {
                    if (this.$tabs) {
                    } else {
                        if (place == 'right') {
                            this.$layout.find('.extra.right').html(el);
                        } else if (place == 'left') {
                            this.$layout.find('.extra.left').html(el);
                        }
                    }
                }
            },

            setVisible: function (tab, visible) {
                if ( tab && this.$tabs ) {
                    this.$tabs.find('> a[data-tab=' + tab + ']').parent().css('display', visible ? '' : 'none');
                    this.onResize();
                }
            }
        };
    }()));
});
