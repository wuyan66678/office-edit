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
 *  AdvancedSettingsWindow.js
 *
 *  Created by Julia Radzhabova on 2/21/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
	'common/main/lib/component/Window',
	'common/main/lib/component/Jstree',
	'common/main/lib/component/Toastify',
	'common/main/lib/component/cryptojs/aes',
	'common/main/lib/component/cryptojs/core',
	'common/main/lib/component/cryptojs/enc-utf8',
	'common/main/lib/component/cryptojs/mode-ecb',
	'common/main/lib/component/cryptojs/pad-pkcs7',
	'common/main/lib/component/Jedate',
], function () { 'use strict';

	Common.Views.ShareSetting = Common.UI.Window.extend(_.extend({
			el: '#share-setting-form',
			initialize : function(options) {
				var data = options.data
				this.selectedUser = []	// 选中的用户
				this.userListMap = {} // 用户列表Map
				this.model = new Common.Models.ShareSetting()
				this.$userListTree = null
				let shareObjs = null;
				let selectUserType = data.selectUserType || '3';
				if(window['_SDK_ENVIRONMENT'] == 1) {
					shareObjs = data.shareObjs && data.shareObjs.userList;
					if(shareObjs && shareObjs.length > 0) {
						selectUserType = '2'
					}
					if(data.password) {
						data.password = this.decryptAES(data.password)
					}
					$('#cancel-share-btn').hide();
				} else {
					shareObjs = data.shareObjs
				}
				// 给模型赋值
				this.model.set({
					shareKey: data.shareKey,
					password: data.password,
					canEncry: data.canEncry,
					isSetDeadline: data.isSetDeadline,
					expiredDate: data.expiredDate,
					selectUserType: selectUserType,
					shareObjs: shareObjs,
					isFeedback: data.isFeedback,
					canDownload: data.canDownload,
					canEdit: data.canEdit,
					fileId: data.fileId,
					privilegeCode: data.privilegeCode,
					token: data.token
				})
				if(shareObjs && shareObjs.length > 0) {
					shareObjs.forEach(item => {
						if(window['_SDK_ENVIRONMENT'] == 1) {
							this.selectedUser.push(item.realname)
							this.userListMap[item.realname] = item
						} else {
							this.selectedUser.push(item.entity.realname)
							this.userListMap[item.entity.realname] = item.entity
						}
					})
				}
				this.options = options.options
					var _options = {};
					this.template = '<div class="share-dialog">' +
											'<div class="share-dialog-header">' +
													'<span>分享配置</span>' +
													'<button class="share-close-btn" id="closeShareDlg"> x </button>' +
											'</div>' +
											'<div class="share-dialog-content">' +
													'<div class="share-copy-content">' +
															'<div class="share-icon">' + 
															'</div>' +
															'<div class="share-body">' +
																	'<div class="share-title">' +
																	'</div>' +
																	'<div class="share-subTitle">' + 
																	'</div>' +
															'</div>' +
															'<div class="share-action" id="copy-btn">复制</div>' +
															
													'</div>' +
													'<div class="share-setting-content">' +
															'<div class="share-setting-label"><span>访问设置</span></div>' +
															'<div class="access-setting">' + 
																	'<div class="share-setting-item">' +
																			'<div id="checkbox-set-password"></div>' +
																			'<input type="text" class="input-share-password" placeholder="请输入访问密码" autocomplete="off"></input>' +
																	'</div>' +
																	'<div class="share-setting-item">' +
																			'<div id="checkbox-set-date"></div>' +
																			'<input type="text" readonly placeholder="请选择到期时间" class="share-date-label" autocomplete="off" id="share-calendar"></input>' +
																	'</div>' +
															'</div>' +
													'</div>' +
													'<div class="share-setting-content">' +
														'<div class="share-setting-label"><span>谁可以访问</span></div>' +
														'<div class="">' +
															'<div class="share-setting-item">' +
																'<div id="register-user" class="list"></div>' +
																'<div id="specify-user" class="list"></div>' +
																'<div id="all-user" class="list"></div>' +
															'</div>' +
															'<div id="specify-user-content" class="specify-user-content">'+
																'<div class="user-list-wrap">' +
																	'<div id="selected-user-list" class="selected-user-list">' +
																		//'<span class="user-tag-wrap">体验账号<i class="delete-icon">×</i></span>'+
																	'</div>' +
																	'<div id="add-user-btn" class="add-user-btn">+添加</div>'+
																'</div>' +
																'<div id="checkbox-send-mail" class="send-mail-wrap"></div>' +
															'</div>' +
														'</div>' +
													'</div>' +
													'<div class="share-setting-content">' +
															'<div class="share-setting-label"><span>操作权限</span></div>' +
															'<div class="share-setting-item">' +
																'<div id="can-download" class="can-download"></div>' +
																'<div id="can-edit"></div>' +
															'</div>' +
														'</div>' +
													'</div>' +
													'<div class="share-footer">' +
														'<div id="cancel-share-btn" class="cancel-share-btn">取消分享</div>' +
														'<div class="dlg-btn-wrap">'+
															'<button class="cancel" id="cancel-btn">取消</button>' +
															'<button class="sure" id="save-btn">确定</button>' +
														'</div>'+
													'</div>' +
											'</div>' +
											'<div id="specify-user-dlg" class="specify-user-dlg">'+
												'<div class="mask"></div>'+
												'<div class="specify-user-dlg-content">'+
													'<div class="specify-dlg-header">' +
															'<span>选择分享对象</span>' +
															'<button class="share-close-btn" id="closeUserDlg"> x </button>' +
													'</div>' +
													'<div class="user-cont-wrap">'+
														'<div class="search-wrap"><input type="text" class="user-search-ipt" id="user-search-ipt"><span class="search-icon"></span></div>' +
														'<div id="user-tree" class="user-tree"></div>'+
													'</div>'+
													'<div class="specify-dlg-footer">'+
														'<div>已选<span id="selectedUserCount">0</span></div>'+
														'<div class="user-dlg-btn">'+
															'<button class="cancel" id="cancelUserSelect">取消</button>' +
															'<button class="sure" id="saveUserSelect">确定</button>' +
														'</div>'+
													'</div>'+
												'</div>'+
											'</div>'+
									'</div>';

					Common.UI.Window.prototype.initialize.call(this, _options);
			},
			render: function() {
				var me = this;
				Common.UI.Window.prototype.render.call(this);
				var $shareDia = $('#share-content')
				var template = _.template(this.template)
				this.$el.html(template(this.model.toJSON()));
				var logo = 'word'
				if(this.options.headerCaption === 'Spreadsheet Editor'){
						logo = 'excel' 
				}else if(this.options.headerCaption ==='Presentation Editor'){
						logo = 'ppt'
				}
				var $shareIcon = document.body.querySelector('.share-icon')
				$shareIcon.innerHTML = `<span class="logo-${logo}"></span>`
				document.body.querySelector('.share-title').innerText = this.options.documentCaption
        document.body.querySelector('.share-subTitle').innerText = Common.Gateway.getShareUrl(this.model.get('shareKey'))
				$('#copy-btn').on('click', function() {
					me.copyToClipboard(Common.Gateway.getShareUrl(me.model.get('shareKey')))
					Toastify({
						text: "已复制分享链接",
						gravity: "top", // 显示位置：top, bottom, center
    				position: "center", // 显示位置的偏移：left, center, right
						backgroundColor: '#F0F9EB',
						className: 'toasity-text',
						duration: 3000
					 }).showToast();
				})
				this.chSetPwd = new Common.UI.CheckBox({
					el: $('#checkbox-set-password'),
					labelText: '设置访问密码',
					disabled: false,
					dataHint: '1',
					dataHintDirection: 'left',
					dataHintOffset: 'small'
				})
				this.chSetPwd.on('change', this.chSetPwdChange.bind(this));
				this.chSetDate = new Common.UI.CheckBox({
					el: $('#checkbox-set-date'),
					labelText: '设置链接有效期',
					disabled: false,
					dataHint: '1',
					dataHintDirection: 'left',
					dataHintOffset: 'small'
				})
				this.chSetDate.on('change', this.chSetDateChange.bind(this));
				this.sharePwdInput = $shareDia.find('.input-share-password')
				this.sharePwdInput.on('keyup', function() {
					var val = $(this).val();
					me.model.set({
						password: val
					})
				})
				this.shareDateInput = $shareDia.find('.share-date-label')
				// 链接有效期
				this.shareCalender = $("#share-calendar").jeDate({
					skinCell: 'jedateblue',
					minDate: $.nowDate(0),
					format: "YYYY-MM-DD hh:mm:ss",
					okfun: function(elem) {
            // 当选择日期时触发，可以在这里执行相关操作
						me.model.set({
							expiredDate: elem.val
						})
        	}
				});
				if(window['_SDK_ENVIRONMENT'] != 1) {
					this.registerUser = new Common.UI.RadioBox({
						el: $('#register-user'),
						labelText: '注册用户',
						name: 'select-user-type',
						value: 1,
						checked: true
					}).on('change', _.bind(this.onRadioSelectUserTypeChange, this));
				}
				this.specifyUser = new Common.UI.RadioBox({
					el: $('#specify-user'),
					labelText: '指定用户',
					name: 'select-user-type',
					value: 2,
					checked: false
				}).on('change', _.bind(this.onRadioSelectUserTypeChange, this));
				this.allUser = new Common.UI.RadioBox({
					el: $('#all-user'),
					labelText: '所有用户',
					name: 'select-user-type',
					value: 3,
					checked: false
				}).on('change', _.bind(this.onRadioSelectUserTypeChange, this));

				this.chSendEmail = new Common.UI.CheckBox({
					el: $('#checkbox-send-mail'),
					labelText: '发送邮件通知',
					disabled: false,
					dataHint: '1',
					dataHintDirection: 'left',
					dataHintOffset: 'small'
				})
				this.chSendEmail.on('change', function(field, newValue) {
					if(newValue === 'checked') {
						me.model.set({
							isFeedback: 1
						})
					} else {
						me.model.set({
							isFeedback: 0
						})
					}
				});
				this.chCanDownload = new Common.UI.CheckBox({
					el: $('#can-download'),
					labelText: '允许下载',
					disabled: false,
					dataHint: '1',
					dataHintDirection: 'left',
					dataHintOffset: 'small'
				})
				this.chCanDownload.on('change', function(field, newValue) {
					if(newValue === 'checked') {
						me.model.set({
							canDownload: 1
						})
					} else {
						me.model.set({
							canDownload: 0
						})
					}
				});
				this.chCanEdit = new Common.UI.CheckBox({
					el: $('#can-edit'),
					labelText: '允许编辑',
					disabled: false,
					dataHint: '1',
					dataHintDirection: 'left',
					dataHintOffset: 'small'
				})
				this.chCanEdit.on('change', function(field, newValue) {
					if(newValue === 'checked') {
						me.model.set({
							canEdit: 1
						})
					} else {
						me.model.set({
							canEdit: 0
						})
					}
				});
				// 打开选择分享对象弹窗
				$('#add-user-btn').on('click', function() {
					$('#specify-user-dlg').show();
					if(!me.$userListTree) {
						// 获取用户列表
						Common.Gateway.getShareOrgList().then(res => {
							if(res.code === '200'){
								me.initJsTree(res.data)
							}else {
									console.log('获取用户列表失败')
							}
						})
					}
				})
				$('#closeUserDlg, #cancelUserSelect').on('click', function() {
					me.closeUserDlg()
				})
				// 确定
				$('#saveUserSelect').click(function() {
					var selectedNodes = $('#user-tree').jstree(true).get_selected(true);
					const selectedNames = []; // 用于存储选中节点的 name 属性值数组
					selectedNodes.forEach(node => {
						if (node.children.length === 0) { // 如果是叶子节点
							selectedNames.push(node.text); // 提取 name 属性值
						}
					});
					me.selectedUser = selectedNames;
					me.renderSelectedUser();
					if(selectedNames.length > 0) {
						$('#save-btn').prop('disabled', false);
					} else {
						$('#save-btn').prop('disabled', true);
					}
					$('#specify-user-dlg').hide();
				})
				if(window['_SDK_ENVIRONMENT'] == 1) {
					$('#cancel-share-btn').html('');
				} else {
					// 取消分享
					$('#cancel-share-btn').on('click', function() {
						var params = me.model.toJSON();
						params.deleteShare = 1;
						Common.Gateway.saveShareSetting(params).then(res => {
							if(res.code === '200'){
								$('#share-content').hide()
								Toastify({
									text: "已取消分享",
									gravity: "top", // 显示位置：top, bottom, center
									position: "center", // 显示位置的偏移：left, center, right
									backgroundColor: '#F0F9EB',
									className: 'toasity-text',
									duration: 3000
								}).showToast();
							} else {
								console.log('取消分享失败')
							}
						})
					})
				}
				// 取消
				$('#cancel-btn, #closeShareDlg').on('click', function() {
					$('#share-content').hide()
				})
				// 确定
				$('#save-btn').on('click', function() {
					const params = me.model.toJSON()
					if(params.expiredDate) {
						params.expiredDate = new Date(params.expiredDate).getTime()
					}
					if(params.canEncry && params.canEncry !='0') {
						params.password = me.encryptAES(params.password)
					}
					params.shareObjs = []
					if(params.selectUserType == 2) {
						if(me.selectedUser && me.selectedUser.length > 0) {
							me.selectedUser.forEach(item => {
								const userInfo = me.userListMap[item]
								const temp = {
									"type": "user",
									"id": userInfo.userId,//用户ID
									"privileges": null,//留空就好
									"entity": userInfo
								}
								params.shareObjs.push(temp)
							})
						}
					}
					function saveShareCallback (res) {
						if (res.code === '200'){
							$('#share-content').hide()
							me.copyToClipboard(Common.Gateway.getShareUrl(me.model.get('shareKey')))
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
						} else {
							console.log('保存失败')
						}
					}
					if(window['_SDK_ENVIRONMENT'] == 1) {
						// 企业云盘环境
						Common.Gateway.shareEncryption(params).then(res => {
							saveShareCallback(res)
						})
						var userList = [];
						params.shareObjs.forEach(item => {
							userList.push({
								id: item.id
							})
						})
						Common.Gateway.createFileShareObj({
							shareKey: params.shareKey,
							orgList: [],
							workGroupList: [],
							userList: userList
						}).then(res1 => {
						})
					} else {
						Common.Gateway.saveShareSetting(params).then(res => {
							saveShareCallback(res)
						})
					}
				})
				this.initData(this.model.toJSON())
			},
			initData (data) {
				var me = this;
				if(data.password) {
					this.chSetPwd.setValue('checked');
					this.sharePwdInput.val(data.password);
				}
				if(data.expiredDate) {
					this.chSetDate.setValue('checked');
					this.shareCalender.setValue(this.formatDate(data.expiredDate))
				}
				if(data.selectUserType) {
					switch(data.selectUserType) {
						case '1':
							this.registerUser.setValue(true);
							break;
						case '2':
							this.specifyUser.setValue(true);
							this.renderSelectedUser()
							break;
						case '3':
							this.allUser.setValue(true);
							break;
						default:
							this.registerUser.setValue(true);
					}
				}
				if(data.isFeedback && data.isFeedback != '0') {
					this.chSendEmail.setValue('checked')
				}
				if(data.canDownload && data.canDownload != '0') {
					this.chCanDownload.setValue('checked')
				}
				if(data.canEdit && data.canEdit != '0') {
					this.chCanEdit.setValue('checked')
				}
			},
			initJsTree (data) {
				var me = this;
				let treeData = me.formatTreeData(data)
				// 初始化用户树
				me.$userListTree = $('#user-tree').jstree({
					'core': {
						'data': treeData
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
				}).on('changed.jstree', function (e, data) {
					const selectedNodes = data.selected; // 获取选中的节点数组
					const selectedNames = []; // 用于存储选中节点的 name 属性值数组
					selectedNodes.forEach(nodeId => {
						const node = $('#user-tree').jstree(true).get_node(nodeId); // 获取节点数据
						if (node.children.length === 0) { // 如果是叶子节点
							selectedNames.push(node.text); // 提取 name 属性值
						}
					});
					// 输出选中叶子节点的 name 数组
					$('#selectedUserCount').html(selectedNames.length)
				})
				setTimeout(function () {
					var allTreeData = $('#user-tree').jstree(true).get_json(null, { flat: true });
					allTreeData.forEach(function(node) {
						if (me.selectedUser.includes(node.text)) {
							$('#user-tree').jstree(true).select_node(node);
						}
					});
				}, 100)
				// 搜索用户
				$('#user-search-ipt').unbind().on('keyup', function() {
					var searchString = $(this).val()
					$('#user-tree').jstree(true).search(searchString);
				})
			},
			renderSelectedUser() {
				var me = this;
				let tempHtml = ''
				if(me.selectedUser && me.selectedUser.length > 0) {
					me.selectedUser.forEach((item, index) => {
						tempHtml += `<span class="user-tag-wrap">${item}<i class="delete-icon" data-index="${index}">×</i></span>`
					})
				}
				$('#selected-user-list').html(tempHtml)
				$('#selected-user-list .delete-icon').unbind().bind('click', function() {
					const idx = $(this).data('index')
					me.selectedUser.splice(idx, 1)
					me.renderSelectedUser()
					if(me.selectedUser.length == 0) {
						$('#save-btn').prop('disabled', true);
					}
				})
			},
			formatTreeData (data) {
				var me = this;
				return data.map(item => {
					const node = { text: item.realname || item.name}
					if(item.userList) {
						node.children = item.userList.map(user => {
							me.userListMap[user.realname] = user;
							return {text: user.realname || user.name}
						})
					}
					if (item.childrenNode) {
						node.children = node.children || []
						node.children.push(...me.formatTreeData(item.childrenNode))
					}
					return node;
				});
			},
			// 获取选中的用户
			getSelectedUser: function() {
				// 获取选中的节点
				var selectedNodes = $('#user-tree').jstree(true).get_selected();
				// 获取选中的叶子节点
				var selectedLeafNodes = selectedNodes.filter(function(nodeId) {
					return $('#user-tree').jstree(true).is_leaf(nodeId);
				});
				return selectedLeafNodes;
			},
			// 转换日期格式
			formatDate: function(date) {
				date = new Date(date)
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hours = date.getHours();
				const minutes = date.getMinutes();
				const seconds = date.getSeconds();
				return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
			}, 
			closeUserDlg: function () {
				$('#specify-user-dlg').hide();
			},
			//设置密码checkbox
			chSetPwdChange:function(field, newValue) {
				if(newValue === 'checked'){
					this.model.set({
						canEncry: 1
					})
					this.sharePwdInput.show()
				}else {
					this.model.set({
						canEncry: 0,
						password: ''
					})
					this.sharePwdInput.hide()
				}
			},
			encryptAES(text) {
				const key = 'cBssbZKSAA==IPFS'
				var iv = CryptoJS.lib.WordArray.random(16);
				var ciphertext = CryptoJS.AES.encrypt(
					CryptoJS.enc.Utf8.parse(text),
					CryptoJS.enc.Utf8.parse(key), // 将密钥转换为 WordArray
					{
						mode: CryptoJS.mode.ECB, // 选择 EBC 模式作为示例
						padding: CryptoJS.pad.Pkcs7 // 使用 Pkcs7 填充方式
					}
				);
				return ciphertext.toString();
			},
			decryptAES(encryptedText) {
				const key = 'cBssbZKSAA==IPFS';
				var decrypted = CryptoJS.AES.decrypt(
						encryptedText,
						CryptoJS.enc.Utf8.parse(key),
						{
								mode: CryptoJS.mode.ECB,
								padding: CryptoJS.pad.Pkcs7
						}
				);
				return decrypted.toString(CryptoJS.enc.Utf8);
			},
		 	copyToClipboard(text) {
				var textarea = document.createElement("textarea");
				textarea.value = text;
				document.body.appendChild(textarea);
				textarea.select();
				document.execCommand("copy");
				document.body.removeChild(textarea);
			},
			//设置有效期checkbox
			chSetDateChange:function(field, newValue) {
				if(newValue === 'checked'){
					this.model.set({
						isSetDeadline: 1
					})
					this.shareDateInput.show()
				}else {
					this.model.set({
						isSetDeadline: 0,
						expiredDate: null
					})
					this.shareDateInput.hide()
				}
			},
			onRadioSelectUserTypeChange (field, newValue) {
				var value = field.options.value
				this.model.set({
					selectUserType: value
				})
				if(value==2) {
					// 指定用户
					$('#specify-user-content').show()
					if(this.selectedUser.length == 0) {
						$('#save-btn').prop('disabled', true);
					} else {
						$('#save-btn').prop('disabled', false);
					}
				} else {
					$('#specify-user-content').hide();
					$('#save-btn').prop('disabled', false);
				}
			},
			close: function(suppressevent) {
					if (this.storageName)
							Common.localStorage.setItem(this.storageName, this.getActiveCategory());
					Common.UI.Window.prototype.close.call(this, suppressevent);
			},
			registerUserLabel: '注册用户',
			specifyUserLabel: '指定用户'
	}, Common.Views.ShareSetting || {}));
});