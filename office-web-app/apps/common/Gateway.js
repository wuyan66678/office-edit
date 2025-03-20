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

if (window.Common === undefined) {
    window.Common = {};
}
var FILECODE;//文件id
var TOKEN;
// var TOKEN = `Bearer
// eyhbGcioilUzUxMi9.eyzdWioi7XCJ1c2VySWRcjo0L FwidxNlcm5hbwvcjpdlnFxXCJ9liwizXhwjoxNz0yMTA2NYzLCJpYX0i0jE3MTA1NZA2NjN9.zrlbi
// YDNGfWJbCOVOONAk-hDtOOEEBxietaTLASRGOYH5hhNf2dkg-C u5/07spph/L O8InN70DthnzlA`;//平台token
var SERVERURL;//服务端id
// 版本号
window.ONLYOFFICE_VERSION = ''

Common.Gateway = new(function() {
		var me = this,
				$me = $(me);
		
		var htmlUnescape = function (html) {
				return html.replace(/&lt;|&gt;|&quot;|&amp;/g, match => {
						switch(match) {
								case '&lt;':
										return '<';
								case '&gt;':
										return '>';
								case '&quot;':
										return '"';
								case '&amp;':
										return '&';
						}
				})
		};
		var removeFileExtension = function (filename) {
			return filename.replace(/\.[^/.]+$/, "");
		};
		var commandMap = {
				'init': function(data) {
						$me.trigger('init', data);
				},

				'openDocument': function(data) {
					console.log('data', data)
						//改造--存储文档自用信息
						if(data.doc) {
								if(data.doc.fileId){
										me.FILECODE = data.doc.fileId
								}
								if(data.doc.token) {
										me.TOKEN = 'Bearer ' + data.doc.token
								}
								if(data.doc.title) {
									data.doc.title = htmlUnescape(data.doc.title)
								}
								if(data.doc.serverUrl) {
										me.SERVERURL = data.doc.serverUrl
								}else{
										me.SERVERURL = window.location.protocol+'//' + window.location.host
								}
								window['_SDK_SERVERURL'] = me.SERVERURL
								window['_SDK_TOKEN'] = me.TOKEN
								window['_SDK_FILEID'] = me.FILECODE
								window['_SDK_FILENAME'] = removeFileExtension(data.doc && data.doc.title || '')
								if(data.doc.environment) {
									me.ENVIRONMENT = data.doc.environment;
									window['_SDK_ENVIRONMENT'] = me.ENVIRONMENT
								}
								window.ONLYOFFICE_VERSION = data.doc.softwareversion;
								window.HIDE_PREVIEW_TOOLBAR = data.doc.hidePreviewToolBar
								window['_SDK_MODE'] = data.editorConfig && data.editorConfig.mode || 'edit'
								window['_FILE_TYPE'] = data.doc.fileType;
						}
						
						$me.trigger('opendocument', data);
				},

				'showMessage': function(data) {
						$me.trigger('showmessage', data);
				},

				'applyEditRights': function(data) {
						$me.trigger('applyeditrights', data);
				},

				'processSaveResult': function(data) {
						$me.trigger('processsaveresult', data);
				},

				'processRightsChange': function(data) {
						$me.trigger('processrightschange', data);
				},

				'refreshHistory': function(data) {

						$me.trigger('refreshhistory', data);
				},

				'setHistoryData': function(data) {
						$me.trigger('sethistorydata', data);
				},

				'setEmailAddresses': function(data) {
						$me.trigger('setemailaddresses', data);
				},

				'setActionLink': function (data) {
						$me.trigger('setactionlink', data.url);
				},

				'processMailMerge': function(data) {
						$me.trigger('processmailmerge', data);
				},

				'downloadAs': function(data) {
						$me.trigger('downloadas', data);
				},

				'processMouse': function(data) {
						$me.trigger('processmouse', data);
				},

				'internalCommand': function(data) {
						$me.trigger('internalcommand', data);
				},

				'resetFocus': function(data) {
						$me.trigger('resetfocus', data);
				},

				'setUsers': function(data) {
						$me.trigger('setusers', data);
				},

				'showSharingSettings': function(data) {
						$me.trigger('showsharingsettings', data);
				},

				'setSharingSettings': function(data) {
						$me.trigger('setsharingsettings', data);
				},

				'insertImage': function(data) {
						$me.trigger('insertimage', data);
				},

				'setMailMergeRecipients': function(data) {
						$me.trigger('setmailmergerecipients', data);
				},

				'setRevisedFile': function(data) {
						$me.trigger('setrevisedfile', data);
				},

				'setFavorite': function(data) {
						$me.trigger('setfavorite', data);
				},

				'requestClose': function(data) {
						$me.trigger('requestclose', data);
				},

				'blurFocus': function(data) {
						$me.trigger('blurfocus', data);
				},

				'grabFocus': function(data) {
						$me.trigger('grabfocus', data);
				}
		};

		var _postMessage = function(msg) {
				// TODO: specify explicit origin
				console.log('postMessage---',window.JSON.stringify(msg));
				if (window.parent && window.JSON) {
						msg.frameEditorId = window.frameEditorId;
						window.parent.postMessage(window.JSON.stringify(msg), "*");
				}
		};

		var _onMessage = function(msg) {
				// TODO: check message origin
				if (msg.origin !== window.parentOrigin && msg.origin !== window.location.origin && !(msg.origin==="null" && (window.parentOrigin==="file://" || window.location.origin==="file://"))) return;

				var data = msg.data;
				if (Object.prototype.toString.apply(data) !== '[object String]' || !window.JSON) {
						return;
				}

				var cmd, handler;

				try {
						cmd = window.JSON.parse(data)
				} catch(e) {
						cmd = '';
				}

				if (cmd) {
						handler = commandMap[cmd.command];
						if (handler) {
								handler.call(this, cmd.data);
						}
				}
		};

		var fn = function(e) { _onMessage(e); };

		if (window.attachEvent) {
				window.attachEvent('onmessage', fn);
		} else {
				window.addEventListener('message', fn, false);
		}

		//#region 改造--请求部分
		// 发送get请求
		var _get = function(url, params) {
			if(params) {
				const urlParams = new URLSearchParams();
				// 将原始 URL 中的查询参数添加到 urlParams 中
				const urlObj = new URL(url);
				urlObj.searchParams.forEach((value, key) => {
					urlParams.append(key, value);
				});
				Object.keys(params).forEach(key => {
					urlParams.append(key, params[key]);
				});
				url =  `${urlObj.origin}${urlObj.pathname}?${urlParams.toString()}`;
			}
			return new Promise((resolve, reject) => {
				var XMLHttp = new XMLHttpRequest()
				XMLHttp.open('GET', url, true)
				XMLHttp.setRequestHeader('content-type', 'application/json')
				XMLHttp.setRequestHeader("Authorization", me.TOKEN)
				XMLHttp.send()
				XMLHttp.onreadystatechange = () => {
						if(XMLHttp.readyState === 4 && XMLHttp.status === 200){
								try {
										resolve(JSON.parse(XMLHttp.responseText))
								} catch (err) {
										reject(err.message)
								}
						} else if(XMLHttp.readyState === 4 && XMLHttp.status !== 200) {
								console.log(XMLHttp.status)
								reject('请求失败')
						}
				}
			})
			};
			var _getSvg = function(url, data) {
				return new Promise((resolve, reject) => {
					var params = '';
					if(data){
						Object.keys(data).forEach(item => {
								params += '&' + data[item]
						})
					}
				
					params = params.replace('&', "?")
					var XMLHttp = new XMLHttpRequest()
					XMLHttp.open('GET', url + params, true)
				//  XMLHttp.setRequestHeader('content-type', 'application/json')
				//  XMLHttp.setRequestHeader("Authorization", me.TOKEN)
					XMLHttp.send()
					XMLHttp.onreadystatechange = () => {
							if(XMLHttp.readyState === 4 && XMLHttp.status === 200){
									try {
											resolve(XMLHttp.responseText)
									} catch (err) {
											reject(err.message)
									}
							} else if(XMLHttp.readyState === 4 && XMLHttp.status !== 200) {
									console.log(XMLHttp.status)
									reject('请求失败')
							}
					}
				})
			};

			var _put = function(url, data) {
				return new Promise((resolve, reject) => {
					var params = '';
					if(data){
						params = JSON.stringify(data)
					}
					var XMLHttp = new XMLHttpRequest()
					XMLHttp.open('PUT', url, true)
					XMLHttp.setRequestHeader('content-type', 'application/json')
					XMLHttp.setRequestHeader("Authorization", me.TOKEN)
					XMLHttp.send(params)
					XMLHttp.onreadystatechange = () => {
							if(XMLHttp.readyState === 4 && XMLHttp.status === 200){
									try {
											resolve(JSON.parse(XMLHttp.responseText))
									} catch (err) {
											reject(err.message)
									}
							} else if(XMLHttp.readyState === 4 && XMLHttp.status !== 200) {
									console.log(XMLHttp.status)
									reject('请求失败')
							}
					}
				})
			};

			var _post = function(url, data, isStream) {
					return new Promise((resolve, reject) => {
							var XMLHttp = new XMLHttpRequest()
							XMLHttp.open('POST', url, true)
							XMLHttp.setRequestHeader('content-type', 'application/json')
							XMLHttp.setRequestHeader("Authorization", me.TOKEN)
							if(isStream) {
								XMLHttp.responseType = 'blob'; 
							}
							XMLHttp.send(JSON.stringify(data))
							XMLHttp.onreadystatechange = () => {
									if(XMLHttp.readyState === 4 && XMLHttp.status === 200) {
											try {
												if(isStream) {
													var blob = XMLHttp.response;
													var url = URL.createObjectURL(blob);
													var a = document.createElement('a');
													a.href = url;
													a.download = `${window['_SDK_FILENAME']?(window['_SDK_FILENAME']+'-'):''}协作记录.xlsx`; // 设置要下载的文件名
													document.body.appendChild(a);
													a.click();
													window.URL.revokeObjectURL(url);
												} else {
													resolve(JSON.parse(XMLHttp.responseText))
												}
											} catch(err) {
													reject(err.message)
											}
									} else if(XMLHttp.readyState === 4 && XMLHttp.status !== 200) {
										try {
											reject(JSON.parse(XMLHttp.responseText))
										} catch(err) {
												reject(err.message)
										}
									}
							}
					})
			};

			//获取文档操作日志
			var _getFileLog = function(data) {
				let url;
				if(me.ENVIRONMENT && me.ENVIRONMENT=='1') {
					// 企业云盘环境
					url = `${me.SERVERURL}/ipfs/api/file/${me.FILECODE}/log?fileId=${me.FILECODE}&pageIndex=1&pageSize=1000&_t=${new Date().getTime()}`
				} else {
					url = `${me.SERVERURL}/ipfs/api/office/files/${me.FILECODE}/log`
				}
				const fileId = me.FILECODE
				return _get(url, data)
			};

			//获取文档详情 tags
			var _getFileInfo = function(data) {
				const fileId = me.FILECODE
				const url = `${me.SERVERURL}/ipfs/api/office/files/${fileId}/history`
					return _get(url, data)
			}

			//文档信息更新
			var _updateFileInfo = function(data) {
				data.fileId = me.FILECODE
				const url = `${me.SERVERURL}/ipfs/api/office/files`
				return _post(url, [data])
			}

			//获取用户名称
			var _getUserName = function(userID) {
				const url = `${me.SERVERURL}/ipfs/api/office/user/${userID}/username`
				return _get(url)
			}

			//获取文档收藏状态
			var _getFileCollectStatus = function() {
				const fileId = me.FILECODE
				const url = `${me.SERVERURL}/ipfs/api/office/files/${fileId}/collect`
				return _get(url)
			}

			//获取用户信息
			var _getUserInfo = function() {
				const url = `${me.SERVERURL}/ipfs/api/office/user/info`
				return _get(url)
			}

			//获取图片地址
			var _getPhotoUrl = function(code) {
				const url = `${me.SERVERURL}/ipfs/${code}`
				return url
			}

			//获取协作用户头像
			var _getUserPhotos = function(code) {
				const url = `${me.SERVERURL}/ipfs/api/office/user/getUserPhotos?${code}`
				return _get(url)
			}

			//获取分享信息
			var _getShareInfo = function(key) {
			let url;
			if(me.ENVIRONMENT && me.ENVIRONMENT=='1') {
				// 企业云盘环境
				url = `${me.SERVERURL}/ipfs/api/file/${me.FILECODE}/share?shareKey=${key}`
			} else {
				url = `${me.SERVERURL}/ipfs/api/office/files/${me.FILECODE}/share?shareKey=${key}`
			}
				return _put(url)
			}

			//获取分享地址
			var _getShareUrl = function(key) {
				if(me.ENVIRONMENT && me.ENVIRONMENT=='1') {
					// 企业云盘环境
					return `${me.SERVERURL}/share.html?shareKey=${key}`
				}
				return `${me.SERVERURL}/sharepage/0?shareKey=${key}`
			}

			//获取svg文档logo
			var _getSvgLogo = function(key) {
				const url = `/web-apps/apps/common/main/resources/img/header/icon-${key}.svg`
				return _getSvg(url)
			}
			// 保存分享配置
			var _saveShareSetting = function (params) {
				const url = `${me.SERVERURL}/ipfs/api/office/files/${me.FILECODE}/share?shareKey=${params.shareKey}`
				return _put(url, params)
			}
			var _shareEncryption = function(params) {
				const url = `${me.SERVERURL}/ipfs/api/file/encryption`
					return _put(url, params)
			}
			var _createFileShareObj = function (params) {
				const url = `${me.SERVERURL}/ipfs/api/file/${me.FILECODE}/createFileShareObj`
				return _post(url, params)
			}
			// 获取分享指定用户列表
			var _getShareOrgList = function() {
			let url;
			if(me.ENVIRONMENT && me.ENVIRONMENT=='1') {
				// 企业云盘环境
				url = `${me.SERVERURL}/ipfs/api/v1/org?orgType=1`
			} else {
				url = `${me.SERVERURL}/ipfs/api/office/org/list`
			}
			return _get(url) 
			}
			// 获取协作记录
			var _getCooperationHistory = function (params) {
			let url;
			if(me.ENVIRONMENT && me.ENVIRONMENT=='1') {
				// 企业云盘环境
				url = `${me.SERVERURL}/ipfs/api/fileEdit/collaborate/${me.FILECODE}`
				return _post(url, params) 
			} else {
				url = `${me.SERVERURL}/ipfs/api/office/fileEdit/collaborate/${me.FILECODE}`
				return _post(url, params) 
			}
			}
			var _postCooperationHistory = function(content) {
			if(content) {
				var _SDK_REALNAME = window['_SDK_REALNAME']
				var _SDK_USERID = window['_SDK_USERID']
				// 新增协作记录
				const params = [{
					editContent: `${content}`,
					fileId: me.FILECODE,
					userId: _SDK_USERID,
					realname: _SDK_REALNAME
				}];
				let url;
				if(me.ENVIRONMENT && me.ENVIRONMENT=='1') {
					// 企业云盘环境
					url = `${me.SERVERURL}/ipfs/api/fileEdit/collaborate`
				} else {
					url = `${me.SERVERURL}/ipfs/api/office/fileEdit/collaborate`
				}
				_post(url, params)
			}
			}
			var _exportCooperationHistory = function() {
				let url 
				if(me.ENVIRONMENT && me.ENVIRONMENT=='1') {
					// 企业云盘环境
					url = `${me.SERVERURL}/ipfs/api/fileEdit/export/${me.FILECODE}`
				} else {
					url = `${me.SERVERURL}/ipfs/api/office/fileEdit/export/${me.FILECODE}`
				}
				return _post(url, null, true)
			}
			var _getCooperationUserList = function () {
				let url;
				if(me.ENVIRONMENT && me.ENVIRONMENT=='1') {
					// 企业云盘环境
					url = `${me.SERVERURL}/ipfs/api/fileEdit/collaborate/${me.FILECODE}/users`
				} else {
					url = `${me.SERVERURL}/ipfs/api/office/fileEdit/collaborate/${me.FILECODE}/users`
				}
				return _get(url)
			}
		//#endregion

		return {
				//#region  改造--请求部分
				//获取文档日志
				getFileLog: _getFileLog,
				//获取文档详情 tags
				getFileInfo:_getFileInfo,
				//更新文档信息
				updateFileInfo:_updateFileInfo,
				//获取用户名称
				getUserName:_getUserName,
				//获取文档收藏状态
				getFileCollectStatus:_getFileCollectStatus,
				//获取用户信息
				getUserInfo:_getUserInfo,
				//获取图片地址
				getPhotoUrl:_getPhotoUrl,
					//获取协作用户头像
				getUserPhotos: _getUserPhotos,
				//获取分享信息
				getShareInfo:_getShareInfo,
				//获取分享地址
				getShareUrl:_getShareUrl,
				//获取svg文档logo
				getSvgLogo: _getSvgLogo,
				//确认分享
				saveShareSetting: _saveShareSetting,
				// 企业网盘环境 确认分享
				shareEncryption: _shareEncryption,
				createFileShareObj: _createFileShareObj,
				// 获取分享对象
				getShareOrgList: _getShareOrgList,
				// 获取协作记录
				getCooperationHistory: _getCooperationHistory,
				// 新增协作记录
				postCooperationHistory: _postCooperationHistory,
				// 导出协作记录
				exportCooperationHistory: _exportCooperationHistory,
				// 获取协作记录筛选用户列表
				getCooperationUserList: _getCooperationUserList,
				//#endregion

				appReady: function() {
						_postMessage({ event: 'onAppReady' });
				},

				requestEditRights: function() {
						_postMessage({ event: 'onRequestEditRights' });
				},

				requestHistory: function() {
						_postMessage({ event: 'onRequestHistory' });
				},

				requestHistoryData: function(revision) {
						_postMessage({
								event: 'onRequestHistoryData',
								data: revision
						});
				},

				requestRestore: function(version, url, fileType) {
						_postMessage({
								event: 'onRequestRestore',
								data: {
										version: version,
										url: url,
										fileType: fileType
								}
						});
				},

				requestEmailAddresses: function() {
						_postMessage({ event: 'onRequestEmailAddresses' });
				},

				requestStartMailMerge: function() {
						_postMessage({event: 'onRequestStartMailMerge'});
				},

				requestHistoryClose: function(revision) {
						_postMessage({event: 'onRequestHistoryClose'});
				},

				reportError: function(code, description) {
						_postMessage({
								event: 'onError',
								data: {
										errorCode: code,
										errorDescription: description
								}
						});
				},

				reportWarning: function(code, description) {
						_postMessage({
								event: 'onWarning',
								data: {
										warningCode: code,
										warningDescription: description
								}
						});
				},

				sendInfo: function(info) {
						_postMessage({
								event: 'onInfo',
								data: info
						});
				},

				setDocumentModified: function(modified) {
						_postMessage({
								event: 'onDocumentStateChange',
								data: modified
						});
				},

				internalMessage: function(type, data) {
						_postMessage({
								event: 'onInternalMessage',
								data: {
										type: type,
										data: data
								}
						});
				},

				updateVersion: function() {
						_postMessage({ event: 'onOutdatedVersion' });
				},

				downloadAs: function(url, fileType) {
						_postMessage({
								event: 'onDownloadAs',
								data: {
										url: url,
										fileType: fileType
								}
						});
				},

				requestSaveAs: function(url, title, fileType) {
						_postMessage({
								event: 'onRequestSaveAs',
								data: {
										url: url,
										title: title,
										fileType: fileType
								}
						});
				},

				collaborativeChanges: function() {
						_postMessage({event: 'onCollaborativeChanges'});
				},

				requestRename: function(title) {
						_postMessage({event: 'onRequestRename', data: title});
				},

				metaChange: function(meta) {
						console.log('metaChange==',meta);
						_postMessage({event: 'onMetaChange', data: meta});
				},

				documentReady: function() {
						_postMessage({ event: 'onDocumentReady' });
				},

				requestClose: function() {
						_postMessage({event: 'onRequestClose'});
				},

				requestMakeActionLink: function (config) {
						_postMessage({event:'onMakeActionLink', data: config});
				},

				requestUsers:  function () {
						_postMessage({event:'onRequestUsers'});
				},

				requestSendNotify:  function (emails) {
						_postMessage({event:'onRequestSendNotify', data: emails});
				},

				requestInsertImage:  function (command) {
						_postMessage({event:'onRequestInsertImage', data: {c: command}});
				},

				requestMailMergeRecipients:  function () {
						_postMessage({event:'onRequestMailMergeRecipients'});
				},

				requestCompareFile:  function () {
						_postMessage({event:'onRequestCompareFile'});
				},

				requestSharingSettings:  function () {
						_postMessage({event:'onRequestSharingSettings'});
				},

				requestCreateNew:  function () {
						_postMessage({event:'onRequestCreateNew'});
				},

				pluginsReady: function() {
						_postMessage({ event: 'onPluginsReady' });
				},

				on: function(event, handler){
						var localHandler = function(event, data){
								handler.call(me, data)
						};

						$me.on(event, localHandler);
				}
		}

})();

window['_POST'] = function (url, data, token) {
	return new Promise((resolve, reject) => {
		var XMLHttp = new XMLHttpRequest()
		XMLHttp.open('POST', url, true)
		XMLHttp.setRequestHeader('content-type', 'application/json')
		XMLHttp.setRequestHeader("Authorization", token)
		XMLHttp.send(JSON.stringify(data))
		XMLHttp.onreadystatechange = () => {
				if(XMLHttp.readyState === 4 && XMLHttp.status === 200) {
						try {
								resolve(JSON.parse(XMLHttp.responseText))
						} catch(err) {
								reject(err.message)
						}
				}else if(XMLHttp.readyState === 4 && XMLHttp.status !== 200) {
						reject('请求失败')
				}
		}
	})
}

window['_GetPostActionUrl'] = function () {
	var _SDK_ENVIRONMENT = window['_SDK_ENVIRONMENT']
	var _SDK_SERVERURL = window['_SDK_SERVERURL']
	let url;
	if(_SDK_ENVIRONMENT && _SDK_ENVIRONMENT=='1') {
		// 企业云盘环境
		url = `${_SDK_SERVERURL}/ipfs/api/fileEdit/collaborate`
	} else {
		url = `${_SDK_SERVERURL}/ipfs/api/office/fileEdit/collaborate`
	}
	return url;
};

window['_PostActionContent'] = function (content) {
	try {
		if(content) {
			var _SDK_TOKEN = window['_SDK_TOKEN']
			var _SDK_FILEID = window['_SDK_FILEID']
			var _SDK_REALNAME = window['_SDK_REALNAME']
			var _SDK_USERID = window['_SDK_USERID']
			var paramItem = {}
			paramItem['editContent'] = content;
			paramItem['userId'] = _SDK_USERID;
			paramItem['fileId'] = _SDK_FILEID;
			paramItem['realname'] = _SDK_REALNAME;
			let url = window['_GetPostActionUrl']();
			window['_POST'](url, [paramItem], _SDK_TOKEN)
		}
	} catch(e) {
		return false;
	}
}
