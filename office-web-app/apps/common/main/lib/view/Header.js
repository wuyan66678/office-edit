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
 *  Header.js
 *
 *  Created by Alexander Yuzhin on 2/14/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

Common.Views = Common.Views || {};

define([
    'backbone',
    'text!common/main/lib/template/Header.template',
    'common/main/lib/view/RenameDialog',
    'common/main/lib/component/Calendar',
		'common/main/lib/view/ShareSetting',
		'common/main/lib/model/ShareSetting',
    'core',
		'common/main/lib/component/Toastify'
], function (Backbone, headerTemplate) { 
    'use strict';
    Common.Views.Header =  Backbone.View.extend(_.extend(function(){
        var storeUsers, appConfig;
        var $userList, $panelUsers, $btnUsers;
        var $otherUsers, $panelOtherUsers, $moreUser, $tipsContent, $otherUsersDetail, $otherUsersCount, $otherUsersList;//协同用户列表
        var $shareDia, $shareIframeWrap;//分享弹窗
        var _readonlyRights = false;

        var templateUserItem =
                '<li id="<%= user.get("iid") %>" class="<% if (!user.get("online")) { %> offline <% } if (user.get("view")) {%> viewmode <% } %>">' +
                    '<div class="user-name">' +
                        '<div class="color" style="background-color: <%= user.get("color") %>;"></div>'+
                        '<label><%= fnEncode(user.get("username")) %></label>' +
                        '<% if (len>1) { %><label style="margin-left:3px;">(<%=len%>)</label><% } %>' +
                    '</div>'+
                '</li>';

        var templateUserList = _.template(
                '<ul>' +
                    '<% for (originalId in users) { %>' +
                        '<%= usertpl({user: users[originalId][0], fnEncode: fnEncode, len: users[originalId].length}) %>' +
                    '<% } %>' +
                '</ul>');
        
        //分享弹窗
        var shareDialog = '<div id="share-content" class="share-setting-dlg">' +
								'<div id="share-setting-form"></div>' +
               '</div>';

        // 右侧分享和用户头像
        var templateRightBox ='<section id="box-document-right">'+
                                // '<div class="document-cooperate-with">'+
                                //     '<div class="cooperate-personnel">协同者头像</div>' +
                                //     '<button class="document-right-btn-share" id="document-btn-share">分享</button>' +
                                // '</div>'+
                                // '<span class="document-right-divider"></span>'+
                                // '<div>用户头像</div>'+
                                '<div id="tlb-box-users" class="box-cousers dropdown"">' +
                                    // '<div class="btn-users dropdown-toggle" data-toggle="dropdown" data-hint="0" data-hint-direction="bottom" data-hint-offset="big">' +
                                    //     '<i class="icon toolbar__icon icon--inverse btn-users"></i>' +
                                    //     '<label class="caption">&plus;</label>' +
                                    // '</div>' +
                                    // '<div class="cousers-menu dropdown-menu">' +
                                    //     '<label id="tlb-users-menu-descr"><%= tipUsers %></label>' +
                                    //     '<div class="cousers-list"></div>' +
                                    //     '<label id="tlb-change-rights" class="link"><%= txtAccessRights %></label>' +
                                    // '</div>' +
                                '</div>'+
                                '<div class="document-cooperate-with">'+
                                    '<div id="other-users" class="cooperate-personnel">' +
                                    '</div>' +
                                    '<div id="more-user" class="more-user-mask">+13</div>' +
                                    '<div id="tips-content" class="tips-content">正在编辑的人</div>' +
																		'<div id="other-users-detail" class="other-users-detail">'+
																			'<div class="hd"><span id="other-users-count"></span>人正在编辑</div>' +
																			'<div id="other-user-list" class="other-user-list">'+
																			'</div>'+
																		'</div>' +
                                '</div>'+
                                '<button class="document-right-btn-share" id="document-btn-share">分享</button>' +
                                '<span class="document-right-divider"></span>'+
                                '<div id="user-header" class="user-header"><img src="" /></div>'+
                                '<label id="title-user-name"></label>' +
                                //改造-- 工具栏设置隐藏
                                // '<div class="btn-slot" id="slot-btn-options"></div>' +
                            '</section>';

                    
                    //  '<section>' +
                    //         '<section id="box-doc-name">' +
                    //             // '<input type="text" id="rib-doc-name" spellcheck="false" data-can-copy="false" style="pointer-events: none;" disabled="disabled">' +
                    //             '<label id="rib-doc-name" />' +
                    //         '</section>' +
                    //         '<section style="display: inherit;">' +
                    //             '<div class="hedset">' +
                    //                 '<div class="btn-slot" id="slot-hbtn-edit"></div>' +
                    //                 '<div class="btn-slot" id="slot-hbtn-print"></div>' +
                    //                 '<div class="btn-slot" id="slot-hbtn-download"></div>' +
                    //             '</div>' +
                    //             '<div class="hedset" data-layout-name="header-users">' +
                    //                 // '<span class="btn-slot text" id="slot-btn-users"></span>' +
                    //                 '<section id="tlb-box-users" class="box-cousers dropdown"">' +
                    //                     '<div class="btn-users" data-hint="0" data-hint-direction="bottom" data-hint-offset="big">' +
                    //                         '<i class="icon toolbar__icon icon--inverse btn-users"></i>' +
                    //                         '<label class="caption">&plus;</label>' +
                    //                     '</div>' +
                    //                     '<div class="cousers-menu dropdown-menu">' +
                    //                         '<label id="tlb-users-menu-descr"><%= tipUsers %></label>' +
                    //                         '<div class="cousers-list"></div>' +
                    //                         '<label id="tlb-change-rights" class="link"><%= txtAccessRights %></label>' +
                    //                     '</div>' +
                    //                 '</section>'+
                    //             '</div>' +
                    //             '<div class="hedset">' +
                    //                 '<div class="btn-slot" id="slot-btn-mode"></div>' +
                    //                 '<div class="btn-slot" id="slot-btn-back"></div>' +
                    //                 '<div class="btn-slot" id="slot-btn-favorite"></div>' +
                    //                 '<div class="btn-slot" id="slot-btn-options"></div>' +
                    //             '</div>' +
                    //             '<div class="hedset">' +
                    //                 '<div class="btn-slot" id="slot-btn-user-name"></div>' +
                    //                 '<div class="btn-slot">' +
                    //                     '<div class="btn-current-user btn-header hidden">' +
                    //                         '<i class="icon toolbar__icon icon--inverse btn-user"></i>' +
                    //                     '</div>' +
                    //                 '</div>'
                    //             '</div>' +
                    //         '</section>' +
                    //     '</section>';

        var templateLeftBox = '<section class="logo">' +
                                '<div id="header-logo"></div>' +
                            '</section>';
        var templateTitleOption = '<div class="file-options" id="file-options">'+
                                    // 文件名、目录
                                    // '<p class="dropdown-menu-label" id="file-name-label">文件名</p>'+ // 名称需要国际化
                                    // '<input type="text" id="title-doc-name" class="dropdown-menu-input title-doc-name-input" autocomplete="off">'+
                                    // '<p class="dropdown-menu-label" id="file-directory-label">目录</p>'+
                                    // '<input class="dropdown-menu-input" type="text" id="input-directory" disabled="true" autocomplete="off">'+
                                    // '<span  class="dropdown-menu-divider"></span>'+
                                
                                    '<div class="dropdown-menu-container">' +
                                        '<div class="btn-slot" id="slot-btn-dt-save" data-layout-name="header-save"></div>' +
                                        // 新增日志、导出为图片、导出为pdf按钮
                                        // '<div class="btn-slot" id="slot-btn-dt-log"></div>' +
                                        // '<div class="btn-slot" id="slot-btn-dt-export-img"></div>' +
                                        '<div class="btn-slot" id="slot-btn-dt-export-pdf"></div>' +
                                        '<div class="btn-slot" id="slot-btn-dt-print"></div>' +
                                        // 另存为模板
                                        // '<div class="btn-slot" id="slot-btn-dt-save-as-template"></div>' +
                                    '</div>' +
                                '</div>';
        var templateTitleBox = '<section id="box-document-title">' +
                                '<div class="extra"></div>' +
                                '<div class="header-title-user">'+
                                    '<div class="title-btn-dropdown-toggle" >' +
                                        '<input type="text" id="title-doc-name-readonly" class="title-doc-name-input dropdown-menu-input" autocomplete="off">'+
                                        // '<div id="slot-btn-title-options"></div>'+
                                        '<div class="btn-slot" id="slot-btn-collect"></div>' +
                                        '<i class="caret icon" id="title-btn-dropdown-toggle"></i>'+
                                    '</div>' +
                                    '<div class="last-save-container" id="open-right">'+
                                        '<span id="last-save-label"></span></span>'+
                                        '<span id="last-save-time"></span></span>'+
                                    '</div>'+
                                    '<div id="slot-btn-title-options">'+
                                        templateTitleOption
                                    '</div>'+
                                    // '<div class="lr-separator" id="id-box-doc-name">' +
                                    //     '<label id="title-doc-name" />' +
                                    //     '<input type="text" id="title-doc-name" autocomplete="off">'+
                                    // '</div>' +
                                    // '<label id="title-user-name"></label>' +
                                '</div>'+
                                // '<div class="hedset">' +
                                //     '<div class="btn-slot" id="slot-btn-dt-save" data-layout-name="header-save"></div>' +
                                //     '<div class="btn-slot" id="slot-btn-dt-print"></div>' +
                                //     '<div class="btn-slot" id="slot-btn-dt-undo"></div>' +
                                //     '<div class="btn-slot" id="slot-btn-dt-redo"></div>' +
                                // '</div>' +

                            '</section>';

        var templateViewTitleBox = '<section>' +
                            '<div class="extra"></div>' +
                            '<div class="header-title-view">'+
                                '<div class="title-btn-dropdown-toggle" >' +
                                    '<input type="text" id="title-doc-name-readonly" readonly class="title-doc-name-input dropdown-menu-input" autocomplete="off">'+
                                    // '<div id="slot-btn-title-options"></div>'+
                                '</div>' +
                            '</div>'+

                        '</section>';

            
        
        function onResetUsersBacks(collection, opts) {
            var usercount = collection.getVisibleEditingCount();
            if ( $userList ) {
                if ( usercount > 1 || usercount > 0 && appConfig && !appConfig.isEdit && !appConfig.isRestrictedEdit) {
                    var user = collection.chain().filter(function(item){return item.get('online') && !item.get('view') && !item.get('hidden')}).groupBy(function(item) {return item.get('idOriginal');}).value();
            console.log('🚀 ~ onResetUsers ~ user:', user)
                    $userList.html(templateUserList({
                        users: collection.chain().filter(function(item){return item.get('online') && !item.get('view') && !item.get('hidden')}).groupBy(function(item) {return item.get('idOriginal');}).value(),
                        usertpl: _.template(templateUserItem),
                        fnEncode: function(username) {
                            return Common.Utils.String.htmlEncode(AscCommon.UserInfoParser.getParsedName(username));
                        }
                    }));

                    $userList.scroller = new Common.UI.Scroller({
                        el: $userList.find('ul'),
                        useKeyboard: true,
                        minScrollbarLength: 40,
                        alwaysVisibleY: true
                    });
                    $userList.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true});
                } else {
                    $userList.empty();
                }
            }

            applyUsers( usercount, collection.getVisibleEditingOriginalCount() );
        };
        //改造-- 协同用户显示
        function onResetUsers(collection, opts) {
            var usercount = collection.getVisibleEditingCount();
            if ( $panelOtherUsers) {
                if ( usercount > 1 || usercount > 0 && appConfig && !appConfig.isEdit && !appConfig.isRestrictedEdit) {
                    var user = collection.chain().filter(function(item){return item.get('online') && !item.get('view') && !item.get('hidden')}).groupBy(function(item) {return item.get('idOriginal');}).value();
                    $panelOtherUsers['show']()
										$panelOtherUsers.hover(function() {
												$tipsContent.show()
											}, function() {
												$tipsContent.hide()
											}
										)
										$panelOtherUsers.unbind('click').on('click', function () {
											$otherUsersDetail.toggle()
										})

                    var params = ''
                    for(let temp in user){
                        params += ('userIds='+temp + '&')
                    }
                    params = params.slice(0, params.length-1)
                    // params = 'userIds=1&userIds=2&userIds=4&userIds=3&userIds=5&userIds=6&userIds=7'
                    Common.Gateway.getUserPhotos(params).then(res => {
                        if(res.code === '200'){
                            $otherUsers.empty();
                            resetUsersHeader(res.data)

                        }else {
                            console.log("获取协作用户头像失败")
                        }
                    })
                } else {
                    $otherUsers.empty();
                    $moreUser.hide();
                    $panelOtherUsers.hide();
                }
            }

            applyUsers( usercount, collection.getVisibleEditingOriginalCount() );
        };
        function resetUsersHeader(data) {
            var tempEle = ''
            var tempData = data
						var userListTemp = '';
            if(data.length > 5){
                var tempData = data.slice(0, 5)
                $moreUser.text(`+${data.length-5}`)
                $moreUser['show']()
            }else {
                $moreUser.hide()
            }
           for(var temp of tempData){
            tempEle += `<img src="${Common.Gateway.getPhotoUrl(temp.photo)}" />`
           }
					 for(var temp of data) {
						userListTemp += `<div class="item"><img src="${Common.Gateway.getPhotoUrl(temp.photo)}" />${temp.realname || temp.username}</div>`
					 }
           $otherUsers.html(tempEle)
					 $otherUsersList.html(userListTemp)
					 $otherUsersCount.html(data.length)
           $panelOtherUsers['show']()
        };
        function onUsersChanged(model) {
            onResetUsers(model.collection);
        };

        function applyUsers(count, originalCount) {
            if (!$btnUsers) return;
            var has_edit_users = count > 1 || count > 0 && appConfig && !appConfig.isEdit && !appConfig.isRestrictedEdit; // has other user(s) who edit document
            if ( has_edit_users ) {
                $btnUsers
                    .attr('data-toggle', 'dropdown')
                    .addClass('dropdown-toggle')
                    .menu = true;

                $panelUsers['show']();
            } else {
                $btnUsers
                    .removeAttr('data-toggle')
                    .removeClass('dropdown-toggle')
                    .menu = false;

                $panelUsers[(!_readonlyRights && appConfig && (appConfig.sharingSettingsUrl && appConfig.sharingSettingsUrl.length || appConfig.canRequestSharingSettings)) ? 'show' : 'hide']();
            }

            $btnUsers.find('.caption')
                .css({'font-size': ((has_edit_users) ? '12px' : '14px'),
                    'margin-top': ((has_edit_users) ? '0' : '-1px')})
                .html((has_edit_users) ? originalCount : '&plus;');

            var usertip = $btnUsers.data('bs.tooltip');
            if ( usertip ) {
                usertip.options.title = (has_edit_users) ? usertip.options.titleExt : usertip.options.titleNorm;
                usertip.setContent();
            }
        }

        function onLostEditRights() {
            _readonlyRights = true;
            $panelUsers && $panelUsers.find('#tlb-change-rights').hide();
            $btnUsers && !$btnUsers.menu && $panelUsers.hide();
        }

        function onUsersClick(e) {
            if ( !$btnUsers.menu ) {
                $panelUsers.removeClass('open');
                Common.NotificationCenter.trigger('collaboration:sharing');
            } else {
                var usertip = $btnUsers.data('bs.tooltip');
                if ( usertip ) {
                    if ( usertip.dontShow===undefined)
                        usertip.dontShow = true;

                    usertip.hide();
                }
            }
        }

        function onAppShowed(config) {
            if ( this.labelDocName ) {
                if ( config.isCrypted ) {
                    this.labelDocName.before(
                        '<div class="inner-box-icon crypted">' +
                            '<svg class="icon"><use xlink:href="#svg-icon-crypted"></use></svg>' +
                        '</div>');
                }

                if (!config.isEdit || !config.customization || !config.customization.compactHeader) {
                    var $parent = this.labelDocName.parent();
                    var _left_width = $parent.position().left,
                        _right_width = $parent.next().outerWidth();

                    if ( _left_width < _right_width )
                        this.labelDocName.parent().css('padding-left', _right_width - _left_width);
                    else this.labelDocName.parent().css('padding-right', _left_width - _right_width);
                }
            }
        }

        function onAppReady(mode) {
            appConfig = mode;
						// 预览模式隐藏分享按钮、协同用户
						if(!appConfig.isEdit) {
							this.btnShare.hide()
							$otherUsers.hide()
						}
            var me = this;
            me.btnGoBack.on('click', function (e) {
                Common.NotificationCenter.trigger('goback');
            });

            // me.btnFavorite.on('click', function (e) {
            //     // wait for setFavorite method
            //     // me.options.favorite = !me.options.favorite;
            //     // me.btnFavorite.changeIcon(me.options.favorite ? {next: 'btn-in-favorite'} : {curr: 'btn-in-favorite'});
            //     // me.btnFavorite.updateHint(!me.options.favorite ? me.textAddFavorite : me.textRemoveFavorite);
            //     Common.NotificationCenter.trigger('markfavorite', !me.options.favorite);
            // });

            //改造--收藏按钮点击响应
            me.btnCollect.on('click', function (e) {
                me.setCollectStatus(!me.options.favorite)
            });

            if ( me.logo )
                me.logo.children(0).on('click', function (e) {
                    var _url = !!me.branding && !!me.branding.logo && (me.branding.logo.url!==undefined) ?
                        me.branding.logo.url : '{{PUBLISHER_URL}}';
                    if (_url) {
                        var newDocumentPage = window.open(_url);
                        newDocumentPage && newDocumentPage.focus();
                    }
                });

            if ( $panelUsers ) {
                onResetUsers(storeUsers);

                $panelUsers.on('shown.bs.dropdown', function () {
                    $userList.scroller && $userList.scroller.update({minScrollbarLength: 40, alwaysVisibleY: true});
                });

                $panelUsers.find('.cousers-menu')
                    .on('click', function(e) { return false; });

                var editingUsers = storeUsers.getVisibleEditingCount();
                $btnUsers.tooltip({
                    title: (editingUsers > 1 || editingUsers>0 && !appConfig.isEdit && !appConfig.isRestrictedEdit) ? me.tipViewUsers : me.tipAccessRights,
                    titleNorm: me.tipAccessRights,
                    titleExt: me.tipViewUsers,
                    placement: 'bottom',
                    html: true
                });

                $btnUsers.on('click', onUsersClick.bind(me));

                var $labelChangeRights = $panelUsers.find('#tlb-change-rights');
                $labelChangeRights.on('click', function(e) {
                    $panelUsers.removeClass('open');
                    Common.NotificationCenter.trigger('collaboration:sharing');
                });

                $labelChangeRights[(!mode.isOffline && (mode.sharingSettingsUrl && mode.sharingSettingsUrl.length || mode.canRequestSharingSettings))?'show':'hide']();
                $panelUsers[(editingUsers > 1  || editingUsers > 0 && !appConfig.isEdit && !appConfig.isRestrictedEdit || !mode.isOffline && (mode.sharingSettingsUrl && mode.sharingSettingsUrl.length || mode.canRequestSharingSettings)) ? 'show' : 'hide']();
            }


            if (appConfig.user.guest && appConfig.canRenameAnonymous) {
                if (me.labelUserName) {
                    me.labelUserName.addClass('clickable');
                    me.labelUserName.on('click', function (e) {
                        Common.NotificationCenter.trigger('user:rename');
                    });
                } else if (me.btnUserName) {
                    me.btnUserName.on('click', function (e) {
                        Common.NotificationCenter.trigger('user:rename');
                    });
                }
            }

            if ( me.btnPrint ) {
                me.btnPrint.updateHint(me.tipPrint + Common.Utils.String.platformKey('Ctrl+P'));
                me.btnPrint.on('click', function (e) {
                    me.fireEvent('print', me);
                });
            }

            if ( me.btnSave ) {
                me.btnSave.updateHint(me.tipSave + Common.Utils.String.platformKey('Ctrl+S'));
                me.btnSave.on('click', function (e) {
                    console.log('点击触发保存');
                    me.fireEvent('save', me);
                });
            }

            // if ( me.btnUndo ) {
            //     me.btnUndo.updateHint(me.tipUndo + Common.Utils.String.platformKey('Ctrl+Z'));
            //     me.btnUndo.on('click', function (e) {
            //         me.fireEvent('undo', me);
            //     });
            // }

            // if ( me.btnRedo ) {
            //     me.btnRedo.updateHint(me.tipRedo + Common.Utils.String.platformKey('Ctrl+Y'));
            //     me.btnRedo.on('click', function (e) {
            //         me.fireEvent('redo', me);
            //     });
            // }

            if ( !mode.isEdit ) {
                if ( me.btnDownload ) {
                    me.btnDownload.updateHint(me.tipDownload);
                    me.btnDownload.on('click', function (e) {
                        me.fireEvent('downloadas', ['original']);
                    });
                }

                if ( me.btnEdit ) {
                    me.btnEdit.updateHint(me.tipGoEdit);
                    me.btnEdit.on('click', function (e) {
                        me.fireEvent('go:editor', me);
                    });
                }
            }
            // 版本和日志
            if( me.btnLog ){
                me.btnLog.updateHint(me.txtHistory);
            }
            // 导出为图片
            if( me.btnExportImg ){
                me.btnExportImg.updateHint(me.txtExportImg);

            }
            // 导出为pdf
            if( me.btnExportPdf ){
                me.btnExportPdf.updateHint(me.txtExportPdf);

            }
            if(me.btnSaveAsTemplate){
                me.btnSaveAsTemplate.updateHint(me.txtSaveAsTemplate);

            }

            if ( me.btnOptions )
                me.btnOptions.updateHint(me.tipViewSettings);
        }

        // // 监听文档名输入值，enter时保存，esc时取消，并限制名称长度为10
        // function onDocNameKeyDown(e) {
        //     var me = this;
        //     var name = me.labelDocName.val();
        //     console.log(e.keyCode,isHandlingKeydown);
        //     if ( e.keyCode == Common.UI.Keys.RETURN) {
        //         name = name.trim();
        //         console.log(!_.isEmpty(name) && me.documentCaption !== name );
        //         if ( !_.isEmpty(name) && me.documentCaption !== name ) {
        //             if ( /[\t*\+:\"<>?|\\\\/]/gim.test(name) ) {
        //                 _.defer(function() {
        //                     Common.UI.error({
        //                         msg: (new Common.Views.RenameDialog).txtInvalidName + "*+:\"<>?|\/"
        //                         , callback: function() {
        //                             _.delay(function() {
        //                                 me.labelDocName.focus();
        //                             }, 50);
        //                         }
        //                     });

        //                     me.labelDocName.blur();
        //                 })
        //             } else {
        //                 Common.Gateway.requestRename(name);
        //                 Common.NotificationCenter.trigger('edit:complete', me);
        //             }
        //         }
        //     } else
        //     if ( e.keyCode == Common.UI.Keys.ESC ) {
        //         // me.labelDocName.val(me.documentCaption);
        //         me.labelDocName.val(me.filterTitle(me.documentCaption));
        //         Common.NotificationCenter.trigger('edit:complete', this);
        //     } else {
        //         me.labelDocName.attr('size', name.length > 10 ? name.length : 10);
        //     }
        // }

        function onContentThemeChangedToDark(isdark) {
        }
        // 是否处理失焦事件
        var isHandleBlur = true
        return {
            options: {
                branding: {},
                documentCaption: '',
                canBack: false
            },

            el: '#header',

            // Compile our stats template
            template: _.template(headerTemplate),

            // Delegated events for creating new items, and clearing completed ones.
            events: {
                // 'click #header-logo': function (e) {}
            },

            initialize: function (options) {
                var me = this;
                this.options = this.options ? _.extend(this.options, options) : options;
                this.documentCaption = this.options.documentCaption;
                this.branding = this.options.customization;
                this.isModified = false;

                me.btnGoBack = new Common.UI.Button({
                    id: 'btn-goback',
                    cls: 'btn-header',
                    iconCls: 'toolbar__icon icon--inverse btn-goback',
                    split: true,
                    dataHint: '0',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big'
                });

                storeUsers = this.options.storeUsers;
                storeUsers.bind({
                    add     : onUsersChanged,
                    change  : onUsersChanged,
                    reset   : onResetUsers
                });

                // storeUsers.bind({
                //     add     : me.onUsersChangedLfixed,
                //     change  : me.onUsersChangedLfixed,
                //     reset   : me.onResetUsersLfixed
                // });

                me.btnOptions = new Common.UI.Button({
                    cls: 'btn-header no-caret',
                    iconCls: 'toolbar__icon icon--inverse btn-ic-options',
                    menu: true,
                    dataHint: '0',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big'
                });

                me.mnuZoom = {options: {value: 100}};

                // me.btnFavorite = new Common.UI.Button({
                //     id: 'btn-favorite',
                //     cls: 'btn-header',
                //     iconCls: 'toolbar__icon icon--inverse btn-favorite',
                //     dataHint: '0',
                //     dataHintDirection: 'bottom',
                //     dataHintOffset: 'big'
                // });

                //改造--收藏按钮
                me.btnCollect = new Common.UI.Button({
                    id: 'btn-favorite',
                    cls: 'btn-header',
                    iconCls: 'toolbar__icon icon--inverse btn-favorite',
                    dataHint: '0',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big'
                });

                Common.NotificationCenter.on({
                    'app:ready': function(mode) {Common.Utils.asyncCall(onAppReady, me, mode);},
                    'app:face': function(mode) {Common.Utils.asyncCall(onAppShowed, me, mode);}
                });
                Common.NotificationCenter.on('collaboration:sharingdeny', onLostEditRights);
                Common.NotificationCenter.on('contenttheme:dark', onContentThemeChangedToDark.bind(this));
                Common.NotificationCenter.on('uitheme:changed', this.changeLogo.bind(this));

            },

            render: function (el, role) {
                $(el).html(this.getPanel(role));

                return this;
            },
            //  监听接口返回、加载文档信息
            loadDocument: function(data) {
                var _this = this;
                _this.doc = data;
                var doc = data.doc;
                // 是否隐藏目录
                var lblPlacementLabel =  $('#file-directory-label');
                var lblPlacement = $('#input-directory');
                if ( doc.info.folder ){
                    lblPlacement.val(  doc.info.folder )

                }else{
                    // lblPlacementLabel.hide()
                    // lblPlacement.hide()
                }

                _this.initCollectStatus()

            },
            //改造-- 协同者改变
            onUsersChangedLfixed:function(model) {
                console.log('协同者改变：' ,model )
            },
            //改造-- 协同者改变
            onResetUsersLfixed:function (collection, opts){
                console.log('协同者改变：' ,collection )
            },
            //#region 改造-- 文档收藏
            initCollectStatus:  function() {
                var me = this
                Common.Gateway.getFileCollectStatus().then(res => {
                    if(res.code === '200') {
                        me.options.favorite = res.data; //利用原来的favorite来存储当下文档收藏状态
                        me.btnCollect.changeIcon(!!res.data ? {next: 'btn-in-favorite'} : {curr: 'btn-in-favorite'});
                        me.btnCollect.updateHint(!res.data ? me.textAddFavorite : me.textRemoveFavorite);
                    }else {
                        console.log('获取文件收藏状态失败')
                    }
                }).catch(err => {

                })
            },
            setCollectStatus: function(value){
                var me = this
               
                Common.Gateway.updateFileInfo({type:'update',value:{isCollected:value}}).then(res => {
                    if(res.code === '200'){
                        me.options.favorite = value;
                        me.btnCollect[value!==undefined && value!==null ? 'show' : 'hide']();
                        me.btnCollect.changeIcon(!!value ? {next: 'btn-in-favorite'} : {curr: 'btn-in-favorite'});
                        me.btnCollect.updateHint(!value ? me.textAddFavorite : me.textRemoveFavorite);
                    }else {
                        console.log('修改收藏状态失败')
                    }
                })
            },
            //#endregion
            getPanel: function (role, config) {
                var me = this;
                function createTitleButton(iconid, slot, disabled, hintDirection, hintOffset, hintTitle) {
                    return (new Common.UI.Button({
                        cls: 'btn-header',
                        iconCls: iconid,
                        disabled: disabled === true,
                        dataHint:'0',
                        dataHintDirection: hintDirection ? hintDirection : (config.isDesktopApp ? 'right' : 'left'),
                        dataHintOffset: hintOffset ? hintOffset : (config.isDesktopApp ? '10, -10' : '10, 10'),
                        dataHintTitle: hintTitle
                    })).render(slot);
                }

                if ( role == 'left' && (!config || !config.isDesktopApp)) {
                    $html = $(templateLeftBox);
                    this.logo = $html.find('#header-logo');
										// 改造 左侧logo根据文件类型显示对应图标
										var logo = 'word'
										if(this.options.headerCaption === 'Spreadsheet Editor'){
											logo = 'excel' 
										}else if(this.options.headerCaption ==='Presentation Editor'){
											logo = 'ppt'
										}
										me.logo.html(`<span class="header-left-logo logo-${logo}"></span>`)
                    if (this.branding && this.branding.logo && (this.branding.logo.image || this.branding.logo.imageDark) && this.logo) {
                        var image = Common.UI.Themes.isDarkTheme() ? (this.branding.logo.imageDark || this.branding.logo.image) : (this.branding.logo.image || this.branding.logo.imageDark);
                        this.logo.html('<img src="' + image + '" style="max-width:100px; max-height:20px; margin: 0;"/>');
                        this.logo.css({'background-image': 'none', width: 'auto'});
                        (this.branding.logo.url || this.branding.logo.url===undefined) && this.logo.addClass('link');
                    }

                    return $html;
                } else
                  // 右侧盒子
                	if ( role == 'right' ) {
                    // var $html = $(_.template(templateRightBox)());
                     var $html = $(_.template(templateRightBox)({
                        tipUsers: this.labelCoUsersDescr,
                        txtAccessRights: this.txtAccessRights
                    }));
                    // me.labelUserName = $('> #title-user-name', $html);
                    // me.setUserName(me.options.userName);
                    me.setUserHeader($html)
                    // if ( !me.labelDocName ) {
                    //     me.labelDocName = $html.find('#rib-doc-name');
                    //     if ( me.documentCaption ) {
                    //         me.labelDocName.text(me.documentCaption);
                    //     }
                    // } else {
                    //     $html.find('#rib-doc-name').hide();
                    // }

                    // if ( !_.isUndefined(this.options.canRename) ) {
                    //     this.setCanRename(this.options.canRename);
                    // }

                    // if ( this.options.canBack === true ) {
                    //     me.btnGoBack.render($html.find('#slot-btn-back'));
                    // } else {
                    //     $html.find('#slot-btn-back').hide();
                    // }

                    // // if ( this.options.favorite !== undefined && this.options.favorite!==null) {
                    // me.btnFavorite.render($html.find('#slot-btn-favorite'));
                    // me.btnFavorite.changeIcon(!!me.options.favorite ? {next: 'btn-in-favorite'} : {curr: 'btn-in-favorite'});
                    // me.btnFavorite.updateHint(!me.options.favorite ? me.textAddFavorite : me.textRemoveFavorite);
                    // } else {
                    //     $html.find('#slot-btn-favorite').hide();
                    // }

                    if ( !config.isEdit ) {
                        if ( (config.canDownload || config.canDownloadOrigin) && !config.isOffline  )
                            this.btnDownload = createTitleButton('toolbar__icon icon--inverse btn-download', $html.findById('#slot-hbtn-download'), undefined, 'bottom', 'big');

                        if ( config.canPrint )
                            this.btnPrint = createTitleButton('toolbar__icon icon--inverse btn-print', $html.findById('#slot-hbtn-print'), undefined, 'bottom', 'big', 'P');

                        if ( config.canEdit && config.canRequestEditRights )
                            this.btnEdit = createTitleButton('toolbar__icon icon--inverse btn-edit', $html.findById('#slot-hbtn-edit'), undefined, 'bottom', 'big');
                    }
                    //改造-- 工具栏设置隐藏
                    // me.btnOptions.render($html.find('#slot-btn-options'));

                    if (!config.isEdit || config.customization && !!config.customization.compactHeader) {
                        if (config.user.guest && config.canRenameAnonymous)
                            me.btnUserName = createTitleButton('toolbar__icon icon--inverse btn-user', $html.findById('#slot-btn-user-name'), undefined, 'bottom', 'big' );
                        else {
                            me.elUserName = $html.find('.btn-current-user');
                            me.elUserName.removeClass('hidden');
                        }
                        me.setUserName(me.options.userName);
                    }

                    $userList = $html.find('.cousers-list');
                    $panelUsers = $html.find('.box-cousers');
                    $btnUsers = $html.find('.btn-users');
                    $panelUsers.hide();

                    //改造-- 协同用户显示
                    $otherUsers = $html.find('.cooperate-personnel')
                    $panelOtherUsers = $html.find('.document-cooperate-with')
                    $moreUser = $html.find('.more-user-mask')
										$tipsContent = $html.find('#tips-content')
										$otherUsersDetail = $html.find('#other-users-detail')
										$otherUsersList = $html.find('#other-user-list')
										$otherUsersCount = $html.find('#other-users-count')
                    $moreUser.hide()
                    $panelOtherUsers.hide()

                    //改造-- 分享
                    me.btnShare = $html.find('.document-right-btn-share').on('click', _.bind(me.onShareBtnClick, me));
                    // me.btnShare.hide()
                    
                    document.getElementById('viewport-vbox-layout').insertAdjacentHTML("beforeend", shareDialog)
                    $shareDia = $('#share-content')
                    me.btnShareClose = $shareDia.find('.share-close-btn')
                    return $html;
                    
                } else
                	if ( role == 'title' ) {
                    var $html = $(_.template(templateTitleBox)());
                    !!me.labelDocName && me.labelDocName.hide().off();                  // hide document title if it was created in right box
                    // me.labelDocName = $html.find('#title-doc-name');
                    // me.labelDocName.text( me.documentCaption );
                    me.labelDocName = $html.find('.title-doc-name-input');

                    me.setInputWidth($html)   // 动态设置input 宽度
                    me.setDocName(me.documentCaption)
                    me.setTitleBLurEvent($html)
                    me.setTitleKeyDown()
                    
                    me.btnCollect.render($html.find('#slot-btn-collect'));

                
                    if ( config.isEdit ) {
                        me.btnPrint = createTitleButton('toolbar__icon_small  btn-header-print', $html.findById('#slot-btn-dt-print'), false, undefined, undefined, 'P');
                    }

                    me.btnSave = createTitleButton('toolbar__icon_small btn-header-save', $html.findById('#slot-btn-dt-save'), false, undefined, undefined, 'S');
                // //    前进后退
                //     me.btnUndo = createTitleButton('toolbar__icon icon--inverse btn-undo', $html.findById('#slot-btn-dt-undo'), true, undefined, undefined, 'Z');
                //     me.btnRedo = createTitleButton('toolbar__icon icon--inverse btn-redo', $html.findById('#slot-btn-dt-redo'), true, undefined, undefined, 'Y');
                   // ___
                    me.btnLog = createTitleButton('toolbar__icon_small  btn-header-log', $html.findById('#slot-btn-dt-log'), false, undefined, undefined, 'Y');
                    me.btnExportImg = createTitleButton('toolbar__icon_small btn-export-img', $html.findById('#slot-btn-dt-export-img'), false, undefined, undefined, 'Y');
                    me.btnExportPdf = createTitleButton('toolbar__icon_small  btn-export-pdf', $html.findById('#slot-btn-dt-export-pdf'), false, undefined, undefined, 'Y');
                    me.btnSaveAsTemplate = createTitleButton('toolbar__icon_small  btn-export-temp', $html.findById('#slot-btn-dt-save-as-template'), false, undefined, undefined, 'Y');

                    if ( me.btnSave.$icon.is('svg') ) {
                        me.btnSave.$icon.addClass('icon-save btn-save');
                        var _create_use = function (extid, intid) {
                            var _use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
                            _use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', extid);
                            _use.setAttribute('id', intid);

                            return $(_use);
                        };

                        _create_use('#svg-btn-save-coauth', 'coauth').appendTo(me.btnSave.$icon);
                        _create_use('#svg-btn-save-sync', 'sync').appendTo(me.btnSave.$icon);
                    }
                    // 新增，标题下拉菜单
                    me.createFilesOptionsTemplate($html)
                    return $html;
                }else
                if ( role == 'viewtitle' ) {
                    var $html = $(_.template(templateViewTitleBox)());
                    !!me.labelDocName && me.labelDocName.hide().off();                  // hide document title if it was created in right box
                    // me.labelDocName = $html.find('#title-doc-name');
                    // me.labelDocName.text( me.documentCaption );
                    me.labelDocName = $html.find('.title-doc-name-input');

                    me.setInputWidth($html)   // 动态设置input 宽度
                    me.setDocName(me.documentCaption)
                    
                    return $html;
                }
            },
            //设置用户头像
            setUserHeader:function(html) {
                const _userHeader = html.find('#user-header img')
                Common.Gateway.getUserInfo().then(res => {
                    if(res.code === '200') {
											var photo = res.data.photo
											if(photo){
													var photoStr = Common.Gateway.getPhotoUrl(photo)
													console.log('🚀 ~ Common.Gateway.getUserInfo ~ photoStr:', photoStr)
													_userHeader.attr('src', photoStr)
											}
											window['_SDK_USERID'] = res.data && res.data.userId;
											window['_SDK_REALNAME'] = res.data && res.data.realname
											// 新增协作记录
											if(window['_SDK_MODE'] == 'edit') {
												Common.Gateway.postCooperationHistory(`${window['_SDK_REALNAME']}加入协作`)
											}
                    }else{
                        console.log('获取用户头像失败')
                    }
                })

            },
            //点击分享按钮
            onShareBtnClick:function() {
                var me = this
								
                Common.Gateway.getShareInfo("").then(res => {
                    if(res.code === '200' || res.data){
											//me.showShareDialog(res.data)
											if(!me.$shareIframeWrap) {
												me.$shareIframeWrap = document.createElement('div')
												me.$loading = document.createElement('div');
												me.$loading.className = 'asc-loadmask-body'
												var loadingIcon = document.createElement('i')
												loadingIcon.className = 'asc-loadmask-image loading-icon'
												var loadingText = document.createElement('div');
												loadingText.className = 'asc-loadmask-title'
												loadingText.innerHTML = "加载中...";
												me.$loading.appendChild(loadingIcon);
												me.$loading.appendChild(loadingText);
												me.$shareIframeWrap.appendChild(me.$loading);
												me.$shareIframeWrap.className = 'share-iframe-wrap';
												me.$shareIframe	=document.createElement('iframe');
												let iframeSrc = '';
												if(window['_SDK_ENVIRONMENT'] == 1) {
													iframeSrc = `${window['_SDK_SERVERURL']}/file-share.html?fileId=${window['_SDK_FILEID']}`;
												} else {
													iframeSrc = `${window['_SDK_SERVERURL']}/sharedialog?fileid=${window['_SDK_FILEID']}`;
												}
												me.$shareIframe.src = iframeSrc;
												me.$shareIframe.className = 'share-iframe'
												me.$shareIframeWrap.appendChild(me.$shareIframe)
												document.body.appendChild(me.$shareIframeWrap)
											} else {
												me.$shareIframeWrap.style.display = 'block'
												me.$shareIframe.contentWindow.location.reload()
											}
                    }else {
                        console.log('获取文档分享信息失败')
                    }
                })
								if(!window['submitShareSuccess']) {
									window['submitShareSuccess'] = function () {
										console.log('success')
										Toastify({
											text: "已修改分享配置",
											gravity: "top", // 显示位置：top, bottom, center
											position: "center", // 显示位置的偏移：left, center, right
											backgroundColor: '#F0F9EB',
											className: 'toasity-text',
											duration: 3000
										 }).showToast();
										Toastify({
											text: "已复制分享链接",
											gravity: "top", // 显示位置：top, bottom, center
											position: "center", // 显示位置的偏移：left, center, right
											backgroundColor: '#F0F9EB',
											className: 'toasity-text',
											duration: 3000
										 }).showToast();
										 me.$shareIframeWrap.style.display='none'
									}
								}
								if(!window['closeShareDialog']) {
									window['closeShareDialog'] = function(msg) {
										me.$shareIframeWrap.style.display='none'
										if(msg) {
											Toastify({
												text: msg,
												gravity: "top", // 显示位置：top, bottom, center
												position: "center", // 显示位置的偏移：left, center, right
												backgroundColor: '#F0F9EB',
												className: 'toasity-text',
												duration: 3000
											 }).showToast();
										}
									}
								}
            },
            //显示分享弹窗
            showShareDialog(info) {
							var me = this;
							var options = me.options
							options.documentCaption = this.documentCaption
							var shareSettingView = new Common.Views.ShareSetting({ data: info,  options: options});
							shareSettingView.render();
              $shareDia.show()
            },
            //关闭分享弹窗
            onShareClose:function() {
                $shareDia.hide()
            },
            //#region  //分享弹窗操作
            shareCalenderChange:function(cmp, date){
                this.calendarContainer.hide()
                this.shareDateInput.value = date.toLocaleString().split(' ')[0] + ' 00:00:00'
            },
            onShareDateLabelClick:function() {
                this.calendarContainer.show()
            },
            //#endregion
            // 动态设置名称宽度
            setInputWidth: function(html) {
                const _titleInput = html.find('#title-doc-name-readonly')
                // 监听input内容变化事件
                _titleInput.on('input', function() {
                    var contentLength = $(this).val().length;
                    // 设置input宽度
                    $(this).css('width', contentLength * 16 + 4 + 'px');
                });
            },
            // 创建左侧下拉菜单按钮
            createFilesOptionsTemplate:function (html){
                var _this  = this;
                _this.addBtnEvent(html)
                _this.addMenuInputEvent(html)
                _this.addMenuLabel(html)
            },
            // 添加按钮事件
            addBtnEvent: function (html) {
                var _this  = this;
                _this.btnLog && _this.btnLog.on('click', function (btn, e) {
                    // console.log('点击历史',Common.NotificationCenter);
                    // Common.NotificationCenter.trigger('collaboration:history');
                    // $("#slot-btn-title-options").toggle();
                    $("#right-menu-com").toggle()
                    $("#slot-btn-title-options").hide()
                    Common.NotificationCenter.trigger('layout:changed');
                    
                });

                _this.btnExportImg && _this.btnExportImg.on('click', function (btn, e) {
                    console.log('点击导出为图片');
                    $("#slot-btn-title-options").toggle();
                    _this.saveAsFormat(undefined, 'Img' , true);
                   
                });

                _this.btnExportPdf && _this.btnExportPdf.on('click', function (btn, e) {
                    console.log('点击导出为Pdf');
                    $("#slot-btn-title-options").toggle();
                    _this.saveAsFormat(undefined, 'PDF', true);

           
                });
            },
            // 下载未图片或pdf
            saveAsFormat: function(menu, format, ext,textParams){
                var _this = this;
                console.log(menu, format, ext,textParams);
                this.fireEvent('downDoc', [menu, format, ext,textParams]);
            },
            // 添加下拉菜单的label
            addMenuLabel: function (html){
                var _this  = this;

                var nameLabel  = html.find('#file-name-label')
                nameLabel.text(_this.textName)

                var directoryLabel  = html.find('#file-directory-label')
                directoryLabel.text(_this.textDirectory)

                var btnSave = html.find('#slot-btn-dt-save')
                btnSave.find('.btn-header').append('<span class="slot-btn-label">'+ _this.tipSave +'</span>');
  
                var btnPrint = html.find('#slot-btn-dt-print')
                btnPrint.find('.btn-header').append('<span class="slot-btn-label">'+ _this.tipPrint +'</span>');

                var btnLog = html.find('#slot-btn-dt-log')
                btnLog.find('.btn-header').append('<span class="slot-btn-label">'+ _this.txtHistory +'</span>');
                
                var btnExportImg = html.find('#slot-btn-dt-export-img')
                btnExportImg.find('.btn-header').append('<span class="slot-btn-label">'+ _this.txtExportImg +'</span>');
               
                var btnExportPdf = html.find('#slot-btn-dt-export-pdf')
                btnExportPdf.find('.btn-header').append('<span class="slot-btn-label">'+ _this.txtExportPdf +'</span>');
            
                var btnSaveTemp = html.find('#slot-btn-dt-save-as-template')
                btnSaveTemp.find('.btn-header').append('<span class="slot-btn-label">'+ _this.txtSaveAsTemplate +'</span>');
            
                var lastSaveLabel = html.find('#last-save-label')
                lastSaveLabel.text(this.lastSaveLabel)

                
        
            },
            getLastTime: function(value){
                return $('#last-save-time')
                    lastSaveTime.text(value.toLocaleString(this.mode.lang, {year: 'numeric', month: '2-digit', day: '2-digit'}) + ' ' + value.toLocaleString(this.mode.lang, {timeStyle: 'short'}));
              
            },
              // 添加点击事件
            addMenuInputEvent: function(html){
                var _this  = this;
                $("body").on("click", _.bind(_this.bodyMaskClick, _this, html));

                 // 显示或隐藏下拉菜单
                _this.titleOptionBtn = html.find('#title-btn-dropdown-toggle')
                _this.titleOptionBtn.on('click', function(){   
                    // 防止标题输入框第一次点击无法输入
                    // if(html.find('#title-doc-name').focus()){
                    //     html.find('#title-doc-name').blur()
                    // }         
                    $("#slot-btn-title-options").toggle()
                });

                // 显示右侧详情菜单
                _this.rightBtn = html.find('#open-right');
                _this.rightBtn.on('click', function(){
									if ($('#right-menu-com').is(':visible')) {
										$('#right-btn-detail').click();
									}
									$("#right-menu-com").toggle()
									Common.NotificationCenter.trigger('layout:changed');
									// 如果是excel，显示协同记录 隐藏word、ppt协作记录
									/* if(_this.options.headerCaption === 'Spreadsheet Editor') {
										$('#right-btn-cooperation').show();
									} */
									$('#right-btn-cooperation').show();
                });

            },
            // 点击下拉菜单时关闭事件
            bodyMaskClick:function(html) {
                var target = $(event.target);
                var element = $("#slot-btn-title-options");
                if (!target.is("#slot-btn-title-options") && !target.closest("#slot-btn-title-options").length
                &&!target.is("#title-btn-dropdown-toggle") && !target.closest("#title-btn-dropdown-toggle").length
                ) {
                  if (element.is(":visible")) {
                    if(html.find('#title-doc-name').focus()){
                        html.find('#title-doc-name').blur()
                    }
                    element.hide()
                  } 
                }
            },

            // 过滤标题类型
            filterTitle:function (value){
                var RegExp = /(\.doc|\.docx|\.pptx|\.ppt|\.xlsx|\.xls|\.csv|\.txt|\.docxf)$/
                if(RegExp.test(value)){
                    // 过滤
                    return value.replace(RegExp,'')
                }
                return value
                // return RegExp.test(value)
            },
            // 设置标题键盘事件
            setTitleKeyDown : function() {
                var _this = this
                _this.labelDocName.keydown(function(e) {
                    // console.log('键盘按下',e);
                    _this.onDocNameKeyDown(e)
                  });
            },
         
            // 设置标题失焦事件
            setTitleBLurEvent : function(html){
                var _this = this
                // var _input = _this.labelDocName
                // var _input = html.find('#title-doc-name')
                var _input = html.find('#title-doc-name-readonly')
                

                _input.blur(function(e) {
                    if (isHandleBlur === false){
                        isHandleBlur = true
                        return
                    }
                    console.log('输入框失焦事件触发'); 
                    var currentName = _this.labelDocName.val()
                    if( !!currentName ){
                        _this.onDocNameKeyDown('ok')
                       
                    }else{
                        _this.setDocName(_this.documentCaption)

                        // _this.labelDocName.val(_this.filterTitle(_this.documentCaption));
                    }
                });
            },

            // 监听文档名输入值，失焦/enter时保存，esc时取消，并限制名称长度为10
            onDocNameKeyDown:function (e) {
                var me = this;
                // var name = $("#title-doc-name").val();
                var name = $("#title-doc-name-readonly").val();
                if ( e.keyCode == Common.UI.Keys.RETURN || e === 'ok') {
                    name = name.trim();
                    if ( !_.isEmpty(name) && me.filterTitle(me.documentCaption) !== name ) {
                        isHandleBlur = false
                        if ( /[\t*\+:\"<>?|\\\\/]/gim.test(name) ) {
                            _.defer(function() {
                                Common.UI.error({
                                    msg: (new Common.Views.RenameDialog).txtInvalidName + "*+:\"<>?|\/"
                                    , callback: function() {
                                        _.delay(function() {
                                            me.labelDocName.focus();
                                        }, 50);
                                    }
                                });
                                me.labelDocName.blur();
                            })
                        } else {
                            //改造--更换修改名称接口
                            // Common.Gateway.requestRename(name);
                            this.updateFileName(name)
                            Common.NotificationCenter.trigger('edit:complete', me);
                            
                        }
                        
                    }

                } else
                if ( e.keyCode == Common.UI.Keys.ESC ) {
                    // me.labelDocName.val(me.documentCaption);
                    // me.labelDocName.val(me.filterTitle(me.documentCaption));
                    this.setDocName(me.documentCaption)
                    Common.NotificationCenter.trigger('edit:complete', this);
                } else {
                    // 会报错，暂时屏蔽
                    // me.labelDocName.attr('size', name.length > 10 ? name.length : 10);
                }
            },
            updateFileName: async function(name){
                let fullName = name
                const nameStrs = this.documentCaption.split('.')
                if(nameStrs.length > 1){
                    fullName = fullName + '.' + nameStrs[nameStrs.length-1]
                }
                const postParams = {
                    type:'update',
                    value:{
                        fileName:fullName
                    }
                }
                try {
									const res = await Common.Gateway.updateFileInfo(postParams);
									if(res.code === '200') {
											this.setDocName(fullName);
											this.documentCaption = fullName;
											Common.NotificationCenter.trigger('file:rename', fullName);
									} else {
										this.setDocName(this.documentCaption);
											console.log('🚀 ~ clickLog:function ~ logs:', logs)
									}
								} catch(err) {
									this.setDocName(this.documentCaption);
									if(err.errorMessage) {
										Toastify({
											text: err.errorMessage,
											gravity: "top", // 显示位置：top, bottom, center
											position: "center", // 显示位置的偏移：left, center, right
											backgroundColor: "linear-gradient(to right, #ff416c, #ff4b2b)",
        							className: "error-toast",
											duration: 3000
										 }).showToast();
									}
								}
            },
            setVisible: function (visible) {
                // visible
                //     ? this.show()
                //     : this.hide();
            },

            setBranding: function (value) {
                var element;

                this.branding = value;

                if ( value ) {
                    if ( value.logo &&(value.logo.image || value.logo.imageDark)) {
                        var image = Common.UI.Themes.isDarkTheme() ? (value.logo.imageDark || value.logo.image) : (value.logo.image || value.logo.imageDark);
                        element = $('#header-logo');
                        if (element) {
                            element.html('<img src="' + image + '" style="max-width:100px; max-height:20px; margin: 0;"/>');
                            element.css({'background-image': 'none', width: 'auto'});
                            (value.logo.url || value.logo.url===undefined) && element.addClass('link');
                        }
                    }
                }
            },

            changeLogo: function () {
                var value = this.branding;
                if ( value && value.logo && value.logo.image && value.logo.imageDark && (value.logo.image !== value.logo.imageDark)) { // change logo when image and imageDark are different
                    var image = Common.UI.Themes.isDarkTheme() ? (value.logo.imageDark || value.logo.image) : (value.logo.image || value.logo.imageDark);
                    $('#header-logo img').attr('src', image);
                }
            },

            setDocumentCaption: function(value) {
                !value && (value = '');
                this.documentCaption = value;
                this.isModified && (value += '*');
                if ( this.labelDocName ) {
                    // this.labelDocName.text( value );
                    // this.labelDocName.attr('size', value.length);
                    this.setDocName(value)
                    this.setCanRename(true);
                }

                return value;
            },

            getDocumentCaption: function () {
                return this.documentCaption;
            },
            setDocName : function (value) {
                const title = this.filterTitle(value)
                this.labelDocName.val(title);
                this.labelDocName.attr("title",title);
                $('#title-doc-name-readonly').trigger('input')

            },
            setDocumentChanged: function (changed) {
                this.isModified = changed;
                var _name = this.documentCaption;
                changed && (_name += '*');
                console.log('setDocumentChanged=',_name);
                this.setDocName(_name)
                // this.labelDocName.text(_name);
            },

            setCanBack: function (value, text) {
                this.options.canBack = value;
                this.btnGoBack[value ? 'show' : 'hide']();
                if (value)
                    this.btnGoBack.updateHint((text && typeof text == 'string') ? text : this.textBack);

                return this;
            },

            getCanBack: function () {
                return this.options.canBack;
            },

            // setFavorite: function (value) {
            //     this.options.favorite = value;
            //     this.btnFavorite[value!==undefined && value!==null ? 'show' : 'hide']();
            //     this.btnFavorite.changeIcon(!!value ? {next: 'btn-in-favorite'} : {curr: 'btn-in-favorite'});
            //     this.btnFavorite.updateHint(!value ? this.textAddFavorite : this.textRemoveFavorite);

            //     return this;
            // },

            getFavorite: function () {
                return this.options.favorite;
            },

            setCanRename: function (rename) {
                // rename = false;
                rename  = true

                var me = this;
                me.options.canRename = rename;
                if ( me.labelDocName ) {
                    var label = me.labelDocName;
                    if ( rename ) {
                        // label.removeAttr('disabled').tooltip({
                        //     title: me.txtRename,
                        //     placement: 'cursor'}
                        // );

                        // label.on({
                        //     'keydown': onDocNameKeyDown.bind(this),
                        //     // 'blur': function (e) {
                        //     //     console.log('失焦111');
                        //     // }
                        // });

                    } else {
                        // label.off();
                        // label.attr('disabled', true);
                        // var tip = label.data('bs.tooltip');
                        // if ( tip ) {
                        //     tip.options.title = '';
                        //     tip.setContent();
                        // }
                    }
                    label.attr('data-can-copy', rename);
                }
            },

            setUserName: function(name) {
                if ( !!this.labelUserName ) {
                    if ( !!name ) {
                        this.labelUserName.text(name).show();
                    } else this.labelUserName.hide();
                } else {
                    this.options.userName = name;
                    if ( this.btnUserName ) {
                        this.btnUserName.updateHint(name);
                    } else if (this.elUserName) {
                        this.elUserName.tooltip({
                            title: Common.Utils.String.htmlEncode(name),
                            placement: 'cursor',
                            html: true
                        });
                    }
                }

                return this;
            },

            getButton: function(type) {
                if (type == 'save')
                    return this.btnSave;
                else if (type == 'users')
                    return $panelUsers;
            },

            lockHeaderBtns: function (alias, lock) {
                var me = this;
                if ( alias == 'users' ) {
                    if ( lock )
                        $btnUsers.addClass('disabled').attr('disabled', 'disabled'); else
                        $btnUsers.removeClass('disabled').removeAttr('disabled');
                } else if ( alias == 'rename-user' ) {
                    if (me.labelUserName) {
                        if ( lock ) {
                            me.labelUserName.removeClass('clickable');
                            me.labelUserName.addClass('disabled');
                        } else {
                            me.labelUserName.addClass('clickable');
                            me.labelUserName.removeClass('disabled');
                        }
                    } else if (me.btnUserName) {
                        me.btnUserName.setDisabled(lock);
                    }
                } else {
                    var _lockButton = function (btn) {
                        if ( btn ) {
                            if ( lock ) {
                                btn.keepState = {
                                    disabled: btn.isDisabled()
                                };
                                btn.setDisabled( true );
                            } else {
                                btn.setDisabled( btn.keepState && btn.keepState.disabled || lock);
                                delete btn.keepState;
                            }
                        }
                    };

                    switch ( alias ) {
                    case 'undo': _lockButton(me.btnUndo); break;
                    case 'redo': _lockButton(me.btnRedo); break;
                    case 'opts': _lockButton(me.btnOptions); break;
                    default: break;
                    }
                }
            },

            fakeMenuItem: function() {
                return {
                    conf: {checked: false, disabled: false},
                    setChecked: function (val) { this.conf.checked = val; },
                    isChecked: function () { return this.conf.checked; },
                    setDisabled: function (val) { this.conf.disabled = val; },
                    isDisabled: function () { return this.conf.disabled; }
                };
            },

            textBack: 'Go to Documents',
            txtRename: 'Rename',
            txtAccessRights: 'Change access rights',
            tipAccessRights: 'Manage document access rights',
            labelCoUsersDescr: 'Document is currently being edited by several users.',
            tipViewUsers: 'View users and manage document access rights',
            tipDownload: 'Download file',
            tipPrint: 'Print file',
            tipGoEdit: 'Edit current file',
            tipSave: 'Save',
            tipUndo: 'Undo',
            tipRedo: 'Redo',
            textCompactView: 'Hide Toolbar',
            textHideStatusBar: 'Combine sheet and status bars',
            textHideLines: 'Hide Rulers',
            textZoom: 'Zoom',
            textAdvSettings: 'Advanced Settings',
            tipViewSettings: 'View Settings',
            textRemoveFavorite: 'Remove from Favorites',
            textAddFavorite: 'Mark as favorite',
            textHideNotes: 'Hide Notes',
            textName: 'File name',
            textDirectory: 'File directory',
            txtHistory: 'Version History',
            txtExportImg: 'Export as Image',
            txtExportPdf: 'Export as PDF',
            txtSaveAsTemplate: 'Save as My Template',
            textShare: 'Share',
            lastSaveLabel: 'Last Save'
        }
    }(), Common.Views.Header || {}))
});
