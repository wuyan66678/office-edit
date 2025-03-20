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

var SCALE_MIN = 32;
var MENU_SCALE_PART = 356;

if (Common === undefined)
    var Common = {};

Common.Views = Common.Views || {};
define([
    'text!common/main/lib/template/RightMenu.template',
    'common/main/lib/util/utils',
    'backbone',
    'common/main/lib/component/Button',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout',
		'common/main/lib/component/Jstree',
		'common/main/lib/component/Toastify'
], function (template) {
    'use strict';

    Common.Views.RightMenu = Common.UI.BaseView.extend(_.extend({
       
        el: '#right-menu-com',

        template: _.template(template),
        storeUsers: undefined,
        storeMessages: undefined,
				cooperationData: new Map(),
				_pageSize: 50,
				_pageIndex: 1,
				_filterSelectedUser: [],
				_filterUserTree: null,
				_filterUserLength: 0,
				cooperationDataCache: {},
        // Delegated events for creating new items, and clearing completed ones.
       
        initialize: function (options) {
            _.extend(this, options);
            Common.UI.BaseView.prototype.initialize.call(this, arguments);
            
            return this;
        },
        setApi: function(api) {
            this.api = api;
            this.getPanel();

            // me.api.asc_registerCallback('asc_onDocInfo', _.bind(me.loadDocument, me));
          
            return this;
        },
  
        setMode: function(mode) {
            this.mode = mode;
            return this;
        },
        // 渲染
        render: function (el) {
            el = el || this.el;
            this.$el.css('width', ((open) ? MENU_SCALE_PART : SCALE_MIN) + 'px');
            this.$el.show();
            var $markup = $(this.template({}));
            this.$el.html($markup);
            // this.getPanel();
            return this;
        },
        // 渲染详情、版本、历史面板
        getPanel: function() {
            var _this = this;
           
            this.addBtnEvent();
            this.createDetailPanel();
            this.createVersionPanel();
            this.createLogPanel();

        },
        addBtnEvent: function() {
            var _this = this;

            _this.objPanel = {
                "panelDetail": _this.$el.find("#right-panel-detail"),
                "panelVersion":_this.$el.find("#right-panel-version"),
                "panelLog": _this.$el.find("#right-panel-log"),
								"panelCooperation": _this.$el.find("#right-panel-cooperation")
            }
            _this.btnObj = {
                "btnDetail" : _this.$el.find("#right-btn-detail"),
                "btnVersion" : _this.$el.find("#right-btn-version"),
                "btnLog" : _this.$el.find("#right-btn-log"),
								"btnCooperation": _this.$el.find("#right-btn-cooperation")
            }
            _this.btnObj.btnDetail.on("click",_.bind(_this.panelBtnEvent,_this,'Detail'))
            _this.btnObj.btnVersion.on("click",_.bind(_this.panelBtnEvent,_this,'Version'))
            _this.btnObj.btnLog.on("click",_.bind(_this.panelBtnEvent,_this,'Log'))
						_this.btnObj.btnCooperation.on("click",_.bind(_this.panelBtnEvent,_this,'Cooperation'))
            $("#right-panel-close").on("click",function(){
								$('#right-btn-detail').click();
                $("#right-menu-com").hide()
                // 需要恢复编辑
                _this.fireEvent("history:hide",_this)
                console.log(_this.options.headerCaption);
                // if(_this.options.headerCaption === "Presentation Editor")
                Common.NotificationCenter.trigger('layout:changed');
								if(_this._versionStatus) {
									// 刷新页面，恢复编辑状态
									location.reload();
								}
								_this.cooperationData.clear();
								_this.cooperationDataCache = {};
								_this.$CooperationContent.html('');
								_this._pageIndex = 1;
								_this._filterSelectedUser = []
            })
						_this.$CooperationContent = _this.$el.find("#right-panel-cooperation-content")
						_this.$CooperationMoreBtn = _this.$el.find("#cooperation-more-btn")
						_this.$CooperationBtnWrap = _this.$el.find("#ooperation-btn-wrap")
						_this.$CooperationRefreshBtn = _this.$el.find("#cooperation-refresh-btn");	// 刷新
						_this.$CooperationFilterBtn = _this.$el.find("#cooperation-filter-btn");	// 筛选
						_this.$CooperationExportBtn = _this.$el.find("#cooperation-export-btn");	// 导出
						_this.$CooperationNoData = _this.$el.find("#cooperation-no-data");
						_this.$CooFilterDlg = _this.$el.find("#coo-filter-dlg");
						_this.$CooFilterDlgCloseBtn = _this.$el.find("#coo-filter-dlg-close-btn");
						_this.$CooFilterDlgSaveBtn = _this.$el.find("#coo-filter-dlg-save-btn");
						// 加载更多
						_this.$CooperationMoreBtn.on('click', function () {
							++_this._pageIndex;
							_this.refreshCooperationHistory(true);
						})
						// 刷新
						_this.$CooperationRefreshBtn.on('click', function () {
							_this._pageIndex = 1;
							_this.cooperationData.clear();
							_this.cooperationDataCache = {}
							_this.refreshCooperationHistory();
						})
						// 筛选
						_this.$CooperationFilterBtn.on('click', function () {
							_this.$CooFilterDlg.toggle();
							if (_this.$CooperationFilterBtn.is(':visible')) {
								Common.Gateway.getCooperationUserList().then(res => {
									let userList = [{text: '全选', id: 0, state: {opened: true},children: []}];
									if(res.data.length > 0) {
										_this._filterUserLength = res.data.length
										res.data.forEach(item => {
											item.text = item.realname
											item.id = item.userId
											userList[0].children.push(item)
										})
									} else {
										_this._filterUserLength = 0
									}
									if(!_this._filterUserTree) {
										_this._filterUserTree = $('#coo-user-tree').jstree({
											'core': {
												'data': userList
											},
											'plugins': ['checkbox', 'wholerow', 'types', 'search'],
											'checkbox': {
													'keep_selected_style': false
											},
											'types': {
													'default': {
															'icon': false // 去除节点图标
													}
											}
										})
									} else {
										$('#coo-user-tree').jstree(true).settings.core.data = userList;
										$('#coo-user-tree').jstree(true).refresh();
									}
									setTimeout(function () {
										if(_this._filterSelectedUser.length > 0) {
											_this._filterSelectedUser.forEach(user => {
												$('#coo-user-tree').jstree(true).select_node(user);
											})
										} else {
											$('#coo-user-tree').jstree(true).select_node(0);
										}
									}, 100)
								})
							}
						});
						// 导出
						_this.$CooperationExportBtn.on('click', function () {
							Common.Gateway.exportCooperationHistory()
						});
						_this.$CooFilterDlgCloseBtn.on('click', function () {
							_this.$CooFilterDlg.hide();
						})
						_this.$CooFilterDlgSaveBtn.on('click', function () {
							// 获取选中的值
							var selectedNodes = $('#coo-user-tree').jstree(true).get_selected();
							// 获取选中的叶子节点
							var selectedLeafNodes = selectedNodes.filter(function(nodeId) {
								return $('#coo-user-tree').jstree(true).is_leaf(nodeId);
							});
							if(selectedLeafNodes && selectedLeafNodes.length > 0) {
								if(selectedLeafNodes.length >= _this._filterUserLength) {
									// 全选
									_this._filterSelectedUser = []
								} else {
									_this._filterSelectedUser = selectedLeafNodes;
								}
								_this.$CooFilterDlg.hide();
								_this.cooperationData.clear();
								_this.cooperationDataCache = {};
								_this.$CooperationContent.html('');
								_this._pageIndex = 1;
								_this.refreshCooperationHistory();
								_this.$userListTree = null;
							} else {
								Toastify({
									text: '请选择用户',
									gravity: "top", // 显示位置：top, bottom, center
									position: "center", // 显示位置的偏移：left, center, right
									backgroundColor: "linear-gradient(to right, #ff416c, #ff4b2b)",
									className: "error-toast",
									duration: 3000
								 }).showToast();
							}
						})
        },
        
        panelBtnEvent: function(mode){
            var _this = this;
            var btn = 'btn'+ mode

            if(_this.btnObj[btn].hasClass("active") || (_this.btnObj[btn].attr('disabled') && _this.btnObj[btn].attr('disabled') === 'disabled')){
                return
            }
            let lastActiveBtn = 'btnDetail'
            for(var currBtn in _this.btnObj){
                if(_this.btnObj[currBtn].hasClass("active")) lastActiveBtn = currBtn
                if(currBtn === btn) {
                    _this.btnObj[btn].addClass("active")
                }else{
                    _this.btnObj[currBtn].removeClass("active")
                }
            }
            var panel = 'panel'+ mode
            for(var currPanel in _this.objPanel){
                if(currPanel === panel ) {
                    _this.objPanel[currPanel].show()
                }else{
                    _this.objPanel[currPanel].hide()
                }
            }
            //发现外面板被隐藏
            if(panel === "panelVersion") {
                 _this.api.asc_Save();
                 _this.fireEvent("history:show",_this)
            }else if(lastActiveBtn === 'btnVersion'){
                // _this.panelVersion.hide();
                _this.fireEvent("history:hide",_this)

            }

            if(panel === "panelLog") {
                _this.fireEvent("log:show", _this)
            }

						if(panel === "panelCooperation") {
							_this.cooperationData.clear();
							_this.cooperationDataCache = {};
							_this.$CooperationContent.html('');
							_this._pageIndex = 1;
							_this.refreshCooperationHistory();
							_this.$CooperationBtnWrap.show();
						}

						if(mode === 'Version') {
							_this._versionStatus = true;
						}
        },
				refreshCooperationHistory(checkCache) {
					var _this = this;
					Common.Gateway.getCooperationHistory({
						pageSize: _this._pageSize,
						pageIndex: _this._pageIndex,
						userId: _this._filterSelectedUser
					}).then(res => {
						if(res.code === '200') {
							if(res.pageResult && res.pageResult.total == 0) {
								_this.$CooperationNoData.show();
							} else {
								_this.$CooperationNoData.hide();
							}
							if(res.data && res.data.length > 0) {
								_this.formatCooperationData(res.data, checkCache)
								_this.renderCooperationHistory()
							}
							if(res.pageResult && (_this._pageIndex * _this._pageSize <= res.pageResult.total)) {
								_this.$CooperationMoreBtn.show();
							} else {
								_this.$CooperationMoreBtn.hide();
							}
						}
					})
				},
				formatCooperationData: function(data, checkCache){
					data.forEach(item => {
						if(checkCache && this.cooperationDataCache[item.id]) {
							
						} else {
							const date = new Date(item.createDate);
							item.date = `${date.getFullYear()}-${date.getMonth()>=9?(date.getMonth()+1):('0'+(date.getMonth()+1))}-${date.getDate()>9?date.getDate():('0'+date.getDate())}`;
							item.time = `${date.getHours()>9?date.getHours():('0'+date.getHours())}:${date.getMinutes()>9?date.getMinutes():('0'+date.getMinutes())}`;
							let dateItems;
							if(this.cooperationData.has(item.date)) {
								dateItems = this.cooperationData.get(item.date);
							} else {
								dateItems = [];
							}
							dateItems.push(item)
							this.cooperationData.set(item.date, dateItems)
						}
					})
				},
				renderCooperationHistory(data) {
					let cooperationTemplate = ''
					this.cooperationData.forEach(function(value, key) {
						cooperationTemplate += `
<div class="timeline-item">
	<div class="timeline-title"><span>${key}</span></div>
	<div class="timeline-content">`
						value.forEach(subItem => {
							cooperationTemplate += `
		<div class="cooperation-item">
			<div class="day-group-item">
				<div class="cooperation-time">${subItem.time}</div>
				<div class="cooperation-username">${subItem.realname}</div>
				<div class="cooperation-version">V${subItem.version}</div>
			</div>
			<div class="cooperation-modify">
				<span>${subItem.editContent}</span>
			</div>
		</div>
							`
						})
						cooperationTemplate += `
	</div>
</div>
						`
					})
					this.$CooperationContent.html(cooperationTemplate)
				},
       
        createDetailPanel: function (){
            var templateDetailPanel = 
            '<div id="detail-panel" class="detail-panel">'+
                '<div class="detail-panel-group">'+
                    '<div class="detail-panel-group-name">'+
                        '<span class="detail-panel-group-span"></span>'+
                        '<span id="detail-panel-group-title">' + this.groupTitleInfo + '</span>'+
                    '</div>'+
                    '<div id="detail-ctn" class="detail-panel-group-content">'+

                    '</div>'+
                '</div>'+
                '<div class="detail-panel-group">'+
                    '<div class="detail-panel-group-name">'+
                        '<span class="detail-panel-group-span"></span>'+
                        '<span id="detail-panel-group-title">' + "标签" + '</span>'+
                    '</div>'+
                    '<div id="detail-tag" class="detail-panel-tag-content">'+

                    '</div>'+
                '</div>'+
            '</div>';
            var tepGroupCtn =  '<div class="flex-settings detail-msg-table">'+
            '<table class="main">'+
                '<tr>'+
                    '<td class="left"><label>' + this.txtPlacement + '</label></td>'+
                    '<td class="right"><label id="id-info-placement">-</label></td>'+
                    '<td class="right-ex" id="btn-copy" ><i class="toolbar__icon btn-paste">-</i></td>'+

                '</tr>'+
                '<tr>'+
                    '<td class="left"><label>' + this.txtOwner + '</label></td>'+
                    '<td class="right"><label id="id-info-owner">-</label></td>'+
                '</tr>'+
                '<tr>'+
                    '<td class="left"><label>' + this.txtUploaded + '</label></td>'+
                    '<td class="right"><label id="id-info-uploaded">-</label></td>'+
                '</tr>'+
    
                '<tr>'+
                    '<td class="left"><label>' + this.txtModifyDate + '</label></td>'+
                    '<td class="right"><label id="id-info-modify-date"></label></td>'+
                '</tr>'+
                '</table>'+
            '</div>';
            this.objPanel.panelDetail.append(templateDetailPanel)
            this.objPanel.panelDetail.find("#detail-ctn").append(tepGroupCtn)
            this.$el.find("#btn-copy").on("click",this.copyEvent)
        },
        initHisTemp: function (temp){
            var _this = this;
            _this.panelVersion = temp.render('#right-panel-history');
          
        },
        showHistory: function() {
            var _this = this;
            // this._state.pluginIsRunning = false;
            // this._state.historyIsRunning = true;
            _this.panelVersion.show();
            _this.panelVersion.$el.width((parseInt(Common.localStorage.getItem('de-mainmenu-width')) || MENU_SCALE_PART) - SCALE_MIN);
            Common.NotificationCenter.trigger('layout:changed', 'history');
        },
        createVersionPanel: function (){
            var _this = this;
            if(!_this.panelVersion){
                return 
            }
            var templateVersionPanel = _this.panelVersion.el;
            _this.$el.find("#right-panel-version").html(templateVersionPanel)
            // _this.$el.find("#right-panel-history").show()
           
        },
        createLogPanel: function (){
            var templateLogPanel = '';
       
        },
        // 复制
        copyEvent: function(){
            var element = document.getElementById("id-info-placement");
            var text = element.innerText;
             // 创建临时文本输入框
            var tempInput = document.createElement("textarea");
            tempInput.value = text;
            document.body.appendChild(tempInput);
            // 选择临时文本输入框的内容并执行复制命令
            tempInput.select();
            document.execCommand("copy");
            // 清理临时文本输入框
            document.body.removeChild(tempInput);

        },
        //  监听接口返回、加载文档信息
        loadDocument: function(data) {
            // 接收main.js 传入信息
            this.doc = data;
            this.updateFileInfo()

        },
        // 更新信息
        updateFileInfo: function() {
            if (!this.doc)
                return;
            var lblPlacement = this.$el.find('#id-info-placement');
            // var lblOwner = this.$el.find('#id-info-owner');
            var lblUploaded = this.$el.find('#id-info-uploaded');
            var lblModifyDate = this.$el.find('#id-info-modify-date');
            var btnCopy = this.$el.find("#btn-copy")

            var  doc = this.doc.doc;
            if ( doc.info) {
                if ( doc.info.folder ){
                    lblPlacement.text(  doc.info.folder )
                    btnCopy.show()

                }
                // if ( doc.info.owner){
                //     lblOwner.text( doc.info.owner);
                // }
                if ( doc.info.uploaded){
                    if(this.mode.lang === 'zh'){
                       const str =  this.transDataStr(doc.info.uploaded)
                       lblUploaded.text( str);
                    } else

                        lblUploaded.text( doc.info.uploaded);
                }
            }

            var me = this,
                props = (this.api) ? this.api.asc_getCoreProps() : null,
                value;

            if (props) {
                var visible = false;
                value = props.asc_getModified();
                // if (value)
                //     lblModifyDate.text(value.toLocaleString(this.mode.lang, {year: 'numeric', month: '2-digit', day: '2-digit'}) + ' ' + value.toLocaleString(this.mode.lang, {timeStyle: 'short'}));
                
                if (value) {
                    var lang = (this.mode.lang || 'en').replace('_', '-').toLowerCase();
                    try {
                        lblModifyDate.text(value.toLocaleString(lang, {year: 'numeric', month: '2-digit', day: '2-digit'}) + ' ' + value.toLocaleString(lang, {timeStyle: 'short'}));
                    } catch (e) {
                        lang = 'en';
                        lblModifyDate.text(value.toLocaleString(lang, {year: 'numeric', month: '2-digit', day: '2-digit'}) + ' ' + value.toLocaleString(lang, {timeStyle: 'short'}));
                    }
                }
            }

            // this.updateTag()
            // this.updateLog()
        },
				getUrlParams() {
					var e,
							a = /\+/g,  // Regex for replacing addition symbol with a space
							r = /([^&=]+)=?([^&]*)/g,
							d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
							q = window.location.search.substring(1),
							urlParams = {};

					while (e = r.exec(q))
							urlParams[d(e[1])] = d(e[2]);

					return urlParams;
				},
        //改造--更新标签
        updateTag(info) {
						console.log('info', info)
						console.log('this.mode', this.mode)
            if(!info) return
						// 根据权限判断是否隐藏分享按钮
						var privileges = info.fileManager && (info.fileManager.privileges || info.fileManager.privilegeCode) || []
						if(this.mode && this.mode.isEdit && privileges.length > 0 && privileges.includes('file:share')) {
							$('#document-btn-share').show()
						} else {
							$('#document-btn-share').hide()
						}

						if(this.mode && !this.mode.isEdit && privileges.length > 0) {
							// 星云环境根据file:print判断是否有打印权限
							let printAuth = false;
							if(window['_SDK_ENVIRONMENT'] == 1) {
								if(privileges.includes('file:print')) {
									printAuth = true
								}
							} else {
								// 协作办公环境根据file:download判断是否有打印权限
								if(privileges.includes('file:download')) {
									printAuth = true
								}
							}
							const urlParams = this.getUrlParams();
							if(urlParams.showprint==0 || !printAuth) {
								$('#print-btn').hide()
							} else {
								$('#print-btn').show()
							}
							if(urlParams.doprint == 1) {
								$('#print-btn').click();
							}
						} else {
							$('#print-btn').hide()
						}

            var tags = info.fileManager && info.fileManager.tags || []
            var tagDom = '<div class="detail-tag-div">'
            let tagList = ''
            for(let tag of tags) {
                tagList += (tagDom + tag + '</div>')
            }
            this.$el.find("#detail-tag").append(tagList)


            var filePaths = info.filePath
            var pathStr = ''
            for(let path of filePaths) {
                pathStr += path.fileName + '/'
            }
            var resStr = pathStr.slice(0,pathStr.length-1)
            var lblPath = this.$el.find('#id-info-placement')
            lblPath.text(resStr)

            var lblOwner = this.$el.find('#id-info-owner');
            lblOwner.text(info.fileManager.user.username)

            var lblUploaded = this.$el.find('#id-info-uploaded');
            var uploadTime = new Date(info.fileManager.createDate)
            lblUploaded.text(uploadTime.toLocaleString());
            var lblModifyDate = this.$el.find('#id-info-modify-date');
            var lastTime = new Date(info.fileManager.updateDate) 
            var lang = (this.mode.lang || 'en').replace('_', '-').toLowerCase();
            if(lang === 'zh'){
                lblModifyDate.text(lastTime.toLocaleString())
            } else {
                lblModifyDate.text(lastTime.toString())
            }
        },
        //改造--更新日志
        updateLog(logs) {
            if(!logs || logs.length <= 0) return
            var logList = ''
            for(let log of logs){
                let logDom = '<div class="tag-node">'+
                    '<div class="tag-node-label">' + 
                        '<div class="tag-circle"></div>' + 
                        '<div class="tag-node-info">' +
                            '<div>' + 
                                log.user.realname +
                            '</div>' +
                            '<div>' +
                                this.logTypeMatch(log.logSpeci) +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="tag-node-content">' + 
                        '<div>' +
                            '<div class="tag-node-content-text">' + 
                                '<div>' + 
                                    new Date(log.createDate).toLocaleString() +
                                '</div>' +
                                '<div>' +
                                    '版本 ' + log.version +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'

                logList += logDom
            }
            this.objPanel.panelLog.append(logList)
        }, 
        //改造-日志匹配 
        logTypeMatch(type) {
            var typeStr = ''
            switch(type){
                case "1":
                    typeStr = '下载'
                    break;
                case "2":
                    typeStr = '预览';
                    break;
                case "3":
                    typeStr = '删除';
                    break;
                case "4":
                    typeStr = '分享';
                    break;
                case "5":
                    typeStr = '上传';
                    break;
                case "6":
                    typeStr = '在线编辑';
                    break;
                case "7":
                    typeStr = '被分享';
                    break;
                case "8":
                    typeStr = '重命名';
                    break;
                case "9":
                    typeStr = '新建文件';
                    break;
                case "10":
                    typeStr = '保存';
                    break;
                case "11":
                    typeStr = '使用模板';
                    break;
                default:
                   break;
            }   
            return typeStr
        },
        //上传时间汉化
        transDataStr:function (num) { //Fri Oct 31 18:00:00 UTC+0800 2008
                num = num + "";
                var date = "";
                var month = new Array();
                month["Jan"] = 1; month["Feb"] = 2; month["Mar"] = 3; month["Apr"] = 4; month["May"] = 5; month["Jun"] = 6;
                month["Jul"] = 7; month["Aug"] = 8; month["Sep"] = 9; month["Oct"] = 10; month["Nov"] = 11; month["Dec"] = 12;
                var week = new Array();
                week["Mon"] = "一"; week["Tue"] = "二"; week["Wed"] = "三"; week["Thu"] = "四"; week["Fri"] = "五"; week["Sat"] = "六"; week["Sun"] = "日";
                var str = num.split(" ");
                date = str[3] + "/";
                date = date + month[str[1]] + "/" + str[2] + ` 星期${week[str[0]]}`;
                return date;
    
        },
        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);
            this.updateFileInfo();
        },

        hide: function() {
            Common.UI.BaseView.prototype.hide.call(this,arguments);

        },


        btnDetail: 'Detail',
        btnVersion: 'Version',
        btnLog: 'Log',
        groupTitleInfo:'File Information',
        groupTitleLabel:'Label',
        // txtDirectory:'Directory',
        txtPlacement: 'Location',
        txtOwner: 'Owner',
        txtUploaded: 'Uploaded',
        txtModifyDate: 'Last Modified'

    }, Common.Views.RightMenu || {}));
});