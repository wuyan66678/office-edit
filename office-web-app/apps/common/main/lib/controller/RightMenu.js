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
 *  RightMenu.js
 *
 *  Created by Julia Radzhabova on 1/17/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'common/main/lib/view/RightMenu'
], function () {
    'use strict';

    Common.Controllers.RightMenu = Backbone.Controller.extend(_.extend({
        models: [],
        collections: [],
        views: [
            'Common.Views.RightMenu'
        ],

        initialize: function() {
            this.addListeners({
                'Common.Views.RightMenu': {
                    'rightmenuclick': this.onRightMenuClick,
                    'history:show': _.bind(this.clickVersion,this,'show'),
                    'history:hide': _.bind(this.clickVersion,this, 'hide'),
                    'log:show': _.bind(this.clickLog,this)
                },
            });
            var me = this;
            // Common.Utils.InternalSettings.set("de-rightpanel-active-form", 1);
        },

        onLaunch: function() {
            this.rightMenu = this.createView('Common.Views.RightMenu');
            
        },

        setApi: function(api) {
            this.api = api;
            this.setDocName()

            var hisTemp = this.getApplication().getController('Common.Controllers.History').getView('Common.Views.History');
            this.getApplication().getController('Common.Controllers.History').setApi(this.api);

            this.rightMenu.initHisTemp(hisTemp)
            this.getFilesInfo()
            return this;

            // api回调
            // this.api.asc_registerCallback('asc_onUpdateSignatures', _.bind(this.onApiUpdateSignatures, this));
            // this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onCoAuthoringDisconnect, this));
            // Common.NotificationCenter.on('api:disconnect',              _.bind(this.onCoAuthoringDisconnect, this));
        },
        clickVersion: function(state){
            var _this = this
            console.log('_this.panelVersionTemp=',_this.rightMenu.panelVersion);
            if(state === 'show'){
                if (!_this.rightMenu.panelVersion.isVisible()) {
                    if ((this.api.isDocumentModified && this.api.isDocumentModified()) || (this.api.asc_isDocumentModified && this.api.asc_isDocumentModified())) {
                        this.api.asc_stopSaving();  
    
                        // 离开当前页提示，非必须
                        // Common.UI.warning({
                        //     closable: false,
                        //     width: 500,
                        //     title: this.notcriticalErrorTitle,
                        //     msg: this.leavePageText,
                        //     buttons: ['ok', 'cancel'],
                        //     primary: 'ok',
                        //     callback: function(btn) {
                        //         if (btn == 'ok') {
                        //             _this.api.asc_undoAllChanges();
                        //             _this.api.asc_continueSaving();
                        //             _this.showHistory();
                        //         } else{
                        //             _this.api.asc_continueSaving();
                        //         }   
                        //     }
                        // });
                    }else{
                        this.showHistory();
    
                    }
                    _this.rightMenu.panelVersion.setVisible(true)
                }
            }else{
                this.hideHistory();

            }
  
        },
        hideHistory:function (){
            console.log('隐藏版本，恢复页面可编辑');
            // Common.Gateway.requestHistoryClose();
            // 取消禁止编辑
            Common.NotificationCenter.trigger('api:editConnect',true);

        },
      
        showHistory: function() {
            console.log('this.mode.wopi',this.mode.wopi);
            if (!this.mode.wopi) {
                // var maincontroller = DE.getController('Main');
                var maincontroller = this.getApplication().getController('Main')
                if (!maincontroller.loadMask)
                    maincontroller.loadMask = new Common.UI.LoadMask({owner: $('#viewport')});
                // maincontroller.loadMask.setTitle(this.textLoadHistory);
                maincontroller.loadMask.show();
            }
            Common.Gateway.requestHistory();
        },
        setMode: function(mode) {
            this.mode = mode;

        },
        setDocName : function () {
            var _this = this
            _this.documentCaption = _this.api.asc_getDocumentName();
            const title = this.filterTitle(_this.documentCaption);
            _this.labelDocName = $('#right-doc-name');
            _this.labelDocName.text(title).attr("title",title);
           
        },
        // 过滤标题类型
        filterTitle:function (value){
            var RegExp = /(\.doc|\.docx|\.pptx|\.xlsx|\.csv|\.txt|\.docxf)$/
            if(RegExp.test(value)){
                // 过滤
                return value.replace(RegExp,'')
            }
            return value
            // return RegExp.test(value)
        },
        onRightMenuAfterRender: function(rightMenu) {
            console.log('rightMenu onRightMenuAfterRender=',rightMenu);
           
        },


        onRightMenuClick: function(menu, type, minimized, event) {
            console.log('右侧按钮点击');
        
        },

        // notcriticalErrorTitle: 'Warning',
        // leavePageText: 'All unsaved changes in this document will be lost.<br> Click \'Cancel\' then \'Save\' to save them. Click \'OK\' to discard all the unsaved changes.',

        //#region 改造--
        //log获取
        clickLog:async function() {
            var logs = await Common.Gateway.getFileLog()
            if(logs.code === '200') {
                this.rightMenu.updateLog(logs.data)
            } else {
                console.log('🚀 ~ clickLog:function ~ logs:', logs)
            }
            
        },
        getFilesInfo:async function() {
            var me = this
            Common.Gateway.getFileInfo().then(res => {
                if(res.code === '200') {
                    me.rightMenu.updateTag(res.data)
                } else {
                    console.log('🚀 ~ clickLog:function ~ logs:', res)
                }
            })
        },

        //#endregion
      
    }, Common.Controllers.RightMenu || {}));
});