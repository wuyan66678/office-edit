define([
	'backbone'
], function(Backbone){
	'use strict';

	Common.Models = Common.Models || {};

	Common.Models.ShareSetting = Backbone.Model.extend({
			defaults: {
					shareKey: '',	
					canEncry: 0,	// 是否设置密码
					password: '',
					isSetDeadline: 0,	//是否设置过期时间，0 不设置；1 设置
					expiredDate: '',	// 过期时间
					selectUserType: '1',   // 谁可以访问，1为注册用户、2为指定用户、3为所有人
					shareObjs: [], 	// 指定用户
					isFeedback: '0', //是否邮件通知  为"1"通知
					canEdit: 0, //允许编辑
					canDownload: 0, // 允许下载
					fileId: '',
					privilegeCode: '',
					token: ''
			}
	});
});
