/*
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

"use strict";

(/**
 * @param {Window} window
 * @param {undefined} undefined
 */
	function (window, undefined)
{
// Import
	var AscBrowser = AscCommon.AscBrowser;
	var locktype_None = AscCommon.locktype_None;
	var locktype_Mine = AscCommon.locktype_Mine;
	var locktype_Other = AscCommon.locktype_Other;
	var locktype_Other2 = AscCommon.locktype_Other2;
	var locktype_Other3 = AscCommon.locktype_Other3;
	var contentchanges_Add = AscCommon.contentchanges_Add;
	var CColor = AscCommon.CColor;
	var g_oCellAddressUtils = AscCommon.g_oCellAddressUtils;
	var c_oAscFileType = Asc.c_oAscFileType;
	var languages = window['Asc'].g_oLcidIdToNameMap;
	var availableIdeographLanguages = window['Asc'].availableIdeographLanguages;
	var availableBidiLanguages = window['Asc'].availableBidiLanguages;

	String.prototype.sentenceCase = function ()
	{
		var trimStr = this.trim();
		if (trimStr.length === 0)
		{
			return "";
		} else if (trimStr.length === 1)
		{
			return trimStr[0].toUpperCase();
		}
		return trimStr[0].toUpperCase() + trimStr.slice(1);
	}
	String.prototype['sentenceCase'] = String.prototype.sentenceCase;

	if (typeof String.prototype.startsWith !== 'function')
	{
		String.prototype.startsWith = function (str)
		{
			return this.indexOf(str) === 0;
		};
		String.prototype['startsWith'] = String.prototype.startsWith;
	}
	if (typeof String.prototype.endsWith !== 'function')
	{
		String.prototype.endsWith = function (suffix)
		{
			return this.indexOf(suffix, this.length - suffix.length) !== -1;
		};
		String.prototype['endsWith'] = String.prototype.endsWith;
	}
	if (!String.prototype.trim) {
		(function() {
			// Вырезаем BOM и неразрывный пробел
			String.prototype.trim = function() {
				var reg = new RegExp('^[\\s\uFEFF\xA0]+|[\\s\uFEFF\xA0]+$', 'g');
				return this.replace(reg, '');
			};
		})();
	}
	if (typeof String.prototype.repeat !== 'function')
	{
		String.prototype.repeat = function (count)
		{
			'use strict';
			if (this == null)
			{
				throw new TypeError('can\'t convert ' + this + ' to object');
			}
			var str = '' + this;
			count = +count;
			if (count != count)
			{
				count = 0;
			}
			if (count < 0)
			{
				throw new RangeError('repeat count must be non-negative');
			}
			if (count == Infinity)
			{
				throw new RangeError('repeat count must be less than infinity');
			}
			count = Math.floor(count);
			if (str.length == 0 || count == 0)
			{
				return '';
			}
			// Обеспечение того, что count является 31-битным целым числом, позволяет нам значительно
			// соптимизировать главную часть функции. Впрочем, большинство современных (на август
			// 2014 года) браузеров не обрабатывают строки, длиннее 1 << 28 символов, так что:
			if (str.length * count >= 1 << 28)
			{
				throw new RangeError('repeat count must not overflow maximum string size');
			}
			var rpt = '';
			for (; ;)
			{
				if ((count & 1) == 1)
				{
					rpt += str;
				}
				count >>>= 1;
				if (count == 0)
				{
					break;
				}
				str += str;
			}
			return rpt;
		};
		String.prototype['repeat'] = String.prototype.repeat;
	}
	if (typeof String.prototype.padStart !== 'function') {
		String.prototype.padStart = function padStart(targetLength,padString) {
			targetLength = targetLength>>0; //floor if number or convert non-number to 0;
			padString = String(padString || ' ');
			if (this.length > targetLength) {
				return String(this);
			}
			else {
				targetLength = targetLength-this.length;
				if (targetLength > padString.length) {
					padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
				}
				return padString.slice(0,targetLength) + String(this);
			}
		};
		String.prototype['padStart'] = String.prototype.padStart;
	}
	Number.isInteger = Number.isInteger || function(value) {
		return typeof value === 'number' && Number.isFinite(value) && !(value % 1);
	};
	Number.isFinite = Number.isFinite || function(value) {
		return typeof value === 'number' && isFinite(value);
	};
// Extend javascript String type
	String.prototype.strongMatch = function (regExp)
	{
		if (regExp && regExp instanceof RegExp)
		{
			var arr = this.toString().match(regExp);
			return !!(arr && arr.length > 0 && arr[0].length == this.length);
		}

		return false;
	};

	RegExp.escape = function ( text ) {
		return text.replace( /[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&" );
	};

	Math.sinh = function ( arg ) {
		return (this.pow( this.E, arg ) - this.pow( this.E, -arg )) / 2;
	};

	Math.cosh = function ( arg ) {
		return (this.pow( this.E, arg ) + this.pow( this.E, -arg )) / 2;
	};

	Math.tanh = Math.tanh || function(x) {
			if (x === Infinity) {
				return 1;
			} else if (x === -Infinity) {
				return -1;
			} else {
				var y = Math.exp(2 * x);
				if (y === Infinity) {
					return 1;
				} else if (y === -Infinity) {
					return -1;
				}
				return (y - 1) / (y + 1);
			}
		};

	Math.asinh = function ( arg ) {
		return this.log( arg + this.sqrt( arg * arg + 1 ) );
	};

	Math.acosh = function ( arg ) {
		return this.log( arg + this.sqrt( arg + 1 ) * this.sqrt( arg - 1 ) );
	};

	Math.atanh = function ( arg ) {
		return 0.5 * this.log( (1 + arg) / (1 - arg) );
	};

	Math.fact = function ( n ) {
		var res = 1;
		n = this.floor( n );
		if ( n < 0 ) {
			return NaN;
		} else if (n > 170) {
			return Infinity;
		}
		while ( n !== 0 ) {
			res *= n--;
		}
		return res;
	};

	Math.doubleFact = function ( n ) {
		var res = 1;
		n = this.floor( n );
		if ( n < 0 ) {
			return NaN;
		} else if (n > 170) {
			return Infinity;
		}
//    n = Math.floor((n+1)/2);
		while ( n > 0 ) {
			res *= n;
			n -= 2;
		}
		return res;
	};

	Math.factor = function ( n ) {
		var res = 1;
		n = this.floor( n );
		while ( n !== 0 ) {
			res = res * n--;
		}
		return res;
	};

	Math.ln = Math.log;

	Math.log10 = function ( x ) {
		return this.log( x ) / this.log( 10 );
	};

	Math.log1p = Math.log1p || function(x) {
		return Math.log(1 + x);
	};

	Math.expm1 = Math.expm1 || function(x) {
		return Math.exp(x) - 1;
	};

	Math.binomCoeff = function ( n, k ) {
		return this.fact( n ) / (this.fact( k ) * this.fact( n - k ));
	};

	Math.permut = function ( n, k ) {
		return this.floor( this.fact( n ) / this.fact( n - k ) + 0.5 );
	};

	Math.approxEqual = function ( a, b ) {
		if ( a === b ) {
			return true;
		}
		return this.abs( a - b ) < 1e-15;
	};

	if (typeof Math.sign != 'function') {
		Math['sign'] = Math.sign = function (n) {
			return n == 0 ? 0 : n < 0 ? -1 : 1;
		};
	}

	Math.trunc = Math.trunc || function(v) {
		v = +v;
		return (v - v % 1)   ||   (!isFinite(v) || v === 0 ? v : v < 0 ? -0 : 0);
	};

	if (typeof require === 'function' && !window['XRegExp'])
	{
		window['XRegExp'] = require('xregexp');
	}

	var oZipImages = null;
	var sDownloadServiceLocalUrl = "../../../../downloadas";
	var sUploadServiceLocalUrl = "../../../../upload";
	var sUploadServiceLocalUrlOld = "../../../../uploadold";
	var sSaveFileLocalUrl = "../../../../savefile";
	var sDownloadFileLocalUrl = "../../../../downloadfile";
	var nMaxRequestLength = 5242880;//5mb <requestLimits maxAllowedContentLength="30000000" /> default 30mb

	function decimalNumberConversion(number, base) {
		if (typeof number !== 'number') {
			return;
		}
		var result = [];
		while (number > 0) {
			var remainder = number % base;
			if (remainder === 0) {
				result.unshift(0);

			} else {
				result.unshift(remainder);
				number = number - remainder;
			}
			number /= base;
		}
		return result;
	}

	function getSockJs()
	{
		return window['SockJS'] || require('sockjs');
	}
	function getJSZipUtils()
	{
		return window['JSZipUtils'] || require('jsziputils');
	}
	function getJSZip()
	{
		return window['JSZip'] || require('jszip');
	}

	function JSZipWrapper() {
		this.files = {};
	}

	JSZipWrapper.prototype.loadAsync = function(data, options) {
		var t = this;

		if (window["native"]) {
			return new Promise(function(resolve, reject) {

				var retFiles = null;
				if (options && options["base64"] === true)
					retFiles = window["native"]["ZipOpenBase64"](data);
				else
					retFiles = window["native"]["ZipOpen"](data);

				if (null != retFiles)
				{
					for (var id in retFiles) {
						t.files[id] = new JSZipObjectWrapper(retFiles[id]);
					}

					resolve(t);
				}
				else
				{
					reject(new Error("Failed archive"));
				}

			});
		}

		return AscCommon.getJSZip().loadAsync(data, options).then(function(zip){
			for (var id in zip.files) {
				t.files[id] = new JSZipObjectWrapper(zip.files[id]);
			}
			return t;
		});
	};
	JSZipWrapper.prototype.close = function() {
		if (window["native"])
			window["native"]["ZipClose"]();
	};

	function JSZipObjectWrapper(data) {
		this.data = data;
	}
	JSZipObjectWrapper.prototype.async = function(type) {

		if (window["native"]) {
			var t = this;

			return new Promise(function(resolve, reject) {

				var ret = window["native"]["ZipFileAsString"](t.data);

				if (null != ret)
				{
					resolve(ret);
				}
				else
				{
					reject(new Error("Failed file in archive"));
				}

			});
		}

		return this.data.async(type);
	};

	function getBaseUrl()
	{
		var indexHtml = window["location"]["href"];
		var questInd = indexHtml.indexOf("?");
    		if (questInd > 0)
		{
			indexHtml = indexHtml.substring(0, questInd);
		}
    		return indexHtml.substring(0, indexHtml.lastIndexOf("/") + 1);
	}

	function getEncodingParams()
	{
		var res = [];
		for (var i = 0; i < AscCommon.c_oAscEncodings.length; ++i)
		{
			var encoding = AscCommon.c_oAscEncodings[i];
			var newElem = {'codepage': encoding[0], 'lcid': encoding[1], 'name': encoding[3]};
			res.push(newElem);
		}
		return res;
	}

	function getEncodingByBOM(data) {
		var res = {encoding: AscCommon.c_oAscCodePageNone, size: 0};
		if (data.length >= 2) {
			res.size = 2;
			if (0xFF == data[0] && 0xFE == data[1]) {
				res.encoding = AscCommon.c_oAscCodePageUtf16;
			} else if (0xFE == data[0] && 0xFF == data[1]) {
				res.encoding = AscCommon.c_oAscCodePageUtf16BE;
			} else if (data.length >= 3) {
				res.size = 3;
				if (0xEF == data[0] && 0xBB == data[1] && 0xBF == data[2]) {
					res.encoding = AscCommon.c_oAscCodePageUtf8;
				} else if (data.length >= 4) {
					res.size = 4;
					if (0xFF == data[0] && 0xFE == data[1] && 0x00 == data[2] && 0x00 == data[3]) {
						res.encoding = AscCommon.c_oAscCodePageUtf32;
					} else if (0x00 == data[0] && 0x00 == data[1] && 0xFE == data[2] && 0xFF == data[3]) {
						res.encoding = AscCommon.c_oAscCodePageUtf32BE;
					} else if (0x2B == data[0] && 0x2F == data[1] && 0x76 == data[2] && 0x38 == data[3]) {
						res.encoding = AscCommon.c_oAscCodePageUtf7;
					} else if (0x2B == data[0] && 0x2F == data[1] && 0x76 == data[2] && 0x39 == data[3]) {
						res.encoding = AscCommon.c_oAscCodePageUtf7;
					} else if (0x2B == data[0] && 0x2F == data[1] && 0x76 == data[2] && 0x2B == data[3]) {
						res.encoding = AscCommon.c_oAscCodePageUtf7;
					} else if (0x2B == data[0] && 0x2F == data[1] && 0x76 == data[2] && 0x2F == data[3]) {
						res.encoding = AscCommon.c_oAscCodePageUtf7;
					}
				}
			}
		}
		return res;
	}

	function DocumentUrls()
	{
		this.Clear();
	}

	DocumentUrls.prototype = {
		mediaPrefix:     'media/',
		init:            function (urls)
						 {
							 this.addUrls(urls);
						 },
		Clear:			function ()
						{
							this.urls = {};
							this.urlsReverse = {};
							this.documentUrl = "";
							this.imageCount = 0;
						},
		getUrls:         function ()
						 {
							 return this.urls;
						 },
		addUrls:         function (urls)
						 {
							 for (var i in urls)
							 {
								 var url = urls[i];
								 this.urls[i] = url;
								 this.urlsReverse[url] = i;
								 this.imageCount++;
							 }

							 if (window["IS_NATIVE_EDITOR"])
							 {
								 window["native"]["setUrlsCount"](this.imageCount);
							 }
						 },
		addImageUrl:     function (strPath, url)
						 {
							 var urls = {};
							 urls[this.mediaPrefix + strPath] = url;
							 this.addUrls(urls);
						 },
		getImageUrl:     function (strPath)
						 {
							 return this.getUrl(this.mediaPrefix + strPath);
						 },
		getImageLocal:   function (url)
						 {
							 if(url && 0 === url.indexOf('data:image'))
							 {
								 return null;
							 }
							 var imageLocal = this.getLocal(url);
							 if (imageLocal && this.mediaPrefix == imageLocal.substring(0, this.mediaPrefix.length))
								 imageLocal = imageLocal.substring(this.mediaPrefix.length);
							 return imageLocal;
						 },
		imagePath2Local: function (imageLocal)
						 {
							 if (imageLocal && this.mediaPrefix == imageLocal.substring(0, this.mediaPrefix.length))
								 imageLocal = imageLocal.substring(this.mediaPrefix.length);
							 return imageLocal;
						 },
		getUrl:          function (strPath)
						 {
							 if (this.urls)
							 {
								 return this.urls[strPath];
							 }
							 return null;
						 },
		getLocal:        function (url)
						 {
							 if (this.urlsReverse)
							 {
								 var res = this.urlsReverse[url];
								 if (!res && typeof editor !== 'undefined' && editor.ThemeLoader && 0 == url.indexOf(editor.ThemeLoader.ThemesUrlAbs))
								 {
									 res = url.substring(editor.ThemeLoader.ThemesUrlAbs.length);
								 }
								 return res;
							 }
							 return null;
						 },
		getMaxIndex:     function (url)
						 {
							 return this.imageCount;
						 },
		getImageUrlsWithOtherExtention: function(imageLocal) {
			var res = [];
			var filename = GetFileName(imageLocal);
			for (var i in this.urls) {
				if (0 == i.indexOf(this.mediaPrefix + filename + '.') && this.mediaPrefix + imageLocal !== i) {
					res.push(this.urls[i]);
				}
			}
			return res;
		}
	};
	var g_oDocumentUrls = new DocumentUrls();

	function CHTMLCursor()
	{
		this.map = {};
		this.mapRetina = {};

		this.value = function(param)
		{
			var ret = this.map[param];
			if (AscCommon.AscBrowser.isCustomScalingAbove2() && this.mapRetina[param])
				ret = this.mapRetina[param];
			return ret ? ret : param;
		};

		this.register = function(type, name, target, default_css_value)
		{
			if (AscBrowser.isIE || AscBrowser.isIeEdge)
			{
				this.map[type] = ("url(../../../../sdkjs/common/Images/cursors/" + name + ".cur), " + default_css_value);
				this.mapRetina[type] = ("url(../../../../sdkjs/common/Images/cursors/" + name + "_2x.cur), " + default_css_value);
			}
			else if (window.opera)
			{
				this.map[type] = default_css_value;
			}
			else
			{
				if (!AscCommon.AscBrowser.isChrome && !AscCommon.AscBrowser.isSafari)
				{
					this.map[type] = "url('../../../../sdkjs/common/Images/cursors/" + name + ".svg') " + target +
						", url('../../../../sdkjs/common/Images/cursors/" + name + ".png') " + target + ", " + default_css_value;
				}
				else
				{
					this.map[type] = "-webkit-image-set(url(../../../../sdkjs/common/Images/cursors/" + name + ".png) 1x," +
						" url(../../../../sdkjs/common/Images/cursors/" + name + "_2x.png) 2x) " + target + ", " + default_css_value;
				}
			}
		};
	}

	function OpenFileResult()
	{
		this.bSerFormat = false;
		this.data = null;
		this.url = null;
		this.changes = null;
	}

	function saveWithParts(fSendCommand, fCallback, fCallbackRequest, oAdditionalData, dataContainer)
	{
		var index = dataContainer.index;
		if (null == dataContainer.part && (!dataContainer.data || dataContainer.data.length <= nMaxRequestLength))
		{
			oAdditionalData["savetype"] = AscCommon.c_oAscSaveTypes.CompleteAll;
		}
		else
		{
			if (0 == index)
			{
				oAdditionalData["savetype"] = AscCommon.c_oAscSaveTypes.PartStart;
				dataContainer.count = Math.ceil(dataContainer.data.length / nMaxRequestLength);
			}
			else if (index != dataContainer.count - 1)
			{
				oAdditionalData["savetype"] = AscCommon.c_oAscSaveTypes.Part;
			}
			else
			{
				oAdditionalData["savetype"] = AscCommon.c_oAscSaveTypes.Complete;
			}
			if(typeof dataContainer.data === 'string') {
				dataContainer.part = dataContainer.data.substring(index * nMaxRequestLength, (index + 1) * nMaxRequestLength);
			} else {
				dataContainer.part = dataContainer.data.subarray(index * nMaxRequestLength, (index + 1) * nMaxRequestLength);
			}
		}
		dataContainer.index++;
		oAdditionalData["saveindex"] = dataContainer.index;
		fSendCommand(function (incomeObject, done, status)
		{
			if (null != incomeObject && "ok" == incomeObject["status"])
			{
				if (dataContainer.index < dataContainer.count)
				{
					oAdditionalData["savekey"] = incomeObject["data"];
					saveWithParts(fSendCommand, fCallback, fCallbackRequest, oAdditionalData, dataContainer);
				}
				else if (fCallbackRequest)
				{
					fCallbackRequest(incomeObject, status);
				}
			}
			else
			{
				fCallbackRequest ? fCallbackRequest(incomeObject, status) : fCallback(incomeObject, status);
			}
		}, oAdditionalData, dataContainer);
	}

	function loadFileContent(url, callback, opt_responseType)
	{
		asc_ajax({
			url:      url,
			dataType: "text",
			responseType: opt_responseType,
			success:  callback,
			error:    function ()
					  {
						  callback(null);
					  }
		});
	}

	function getImageFromChanges(name)
	{
		var content;
		var ext = GetFileExtension(name);
		if ("svg" === ext)
			ext += "+xml";
		if (null !== ext && oZipImages && (content = oZipImages[name]))
		{
			return 'data:image/' + ext + ';base64,' + AscCommon.Base64.encode(content);
		}
		return null;
	}

	function initStreamFromResponse(httpRequest) {
		var stream;
		if (typeof ArrayBuffer !== 'undefined') {
			stream = new Uint8Array(httpRequest.response);
		} else if (AscCommon.AscBrowser.isIE) {
			var _response = new VBArray(httpRequest["responseBody"]).toArray();

			var srcLen = _response.length;
			var pointer = g_memory.Alloc(srcLen);
			var tempStream = new AscCommon.FT_Stream2(pointer.data, srcLen);
			tempStream.obj = pointer.obj;

			stream = tempStream.data;
			var index = 0;

			while (index < srcLen)
			{
				stream[index] = _response[index];
				index++;
			}
		}
		return stream;
	}
	function checkStreamSignature(stream, Signature) {
		if (stream.length > Signature.length) {
			for(var i = 0 ; i < Signature.length; ++i){
				if(stream[i] !== Signature.charCodeAt(i)){
					return false;
				}
			}
			return true;
		}
		return false;
	}
	function openFileCommand(docId, binUrl, changesUrl, changesToken, Signature, callback)
	{
		var bError = false, oResult = new OpenFileResult(), bEndLoadFile = false, bEndLoadChanges = false;
		var onEndOpen = function ()
		{
			if (bEndLoadFile && bEndLoadChanges)
			{
				if (callback)
				{
					callback(bError, oResult);
				}
			}
		};
		var sFileUrl = binUrl;
		sFileUrl = sFileUrl.replace(/\\/g, "/");

		if (!window['IS_NATIVE_EDITOR'])
		{
			loadFileContent(sFileUrl, function (httpRequest) {
					//получаем url к папке с файлом
					var url;
					var nIndex = sFileUrl.lastIndexOf("/");
					url = (-1 !== nIndex) ? sFileUrl.substring(0, nIndex + 1) : sFileUrl;
					if (httpRequest)
					{
						var stream = initStreamFromResponse(httpRequest);
						if (stream) {
							oResult.bSerFormat = checkStreamSignature(stream, Signature);
							oResult.data = stream;
						} else {
							bError = true;
						}
					}
					else
					{
						bError = true;
					}
					bEndLoadFile = true;
					onEndOpen();
				}, "arraybuffer");
		}

		if (changesUrl)
		{
			oZipImages = {};
			AscCommon.DownloadOriginalFile(docId, changesUrl, 'changesUrl', changesToken, function () {
				bEndLoadChanges = true;
				bError = true;
				onEndOpen();
			}, function(data) {
				oResult.changes = [];
				getJSZip().loadAsync(data).then(function (zipChanges)
				{
					var relativePaths = [];
					var promises = [];
					zipChanges.forEach(function (relativePath, file)
					{
						relativePaths.push(relativePath);
						promises.push(file.async(relativePath.endsWith('.json') ? 'string' : 'uint8array'));
					});
					Promise.all(promises).then(function (values)
					{
						var relativePath;
						for (var i = 0; i < values.length; ++i)
						{
							if ((relativePath = relativePaths[i]).endsWith('.json'))
							{
								oResult.changes[parseInt(relativePath.slice('changes'.length))] = JSON.parse(values[i]);
							}
							else
							{
								oZipImages[relativePath] = values[i];
							}
						}
						bEndLoadChanges = true;
						onEndOpen();
					});
				});
			});
		}
		else
		{
			oZipImages = null;
			bEndLoadChanges = true;
		}

		if (window['IS_NATIVE_EDITOR'])
		{
			var stream = window["native"]["openFileCommand"](sFileUrl, changesUrl, Signature);
 
            //получаем url к папке с файлом
            var url;
            var nIndex = sFileUrl.lastIndexOf("/");
            url = (-1 !== nIndex) ? sFileUrl.substring(0, nIndex + 1) : sFileUrl;

            if (stream) {
                oResult.bSerFormat = checkStreamSignature(stream, Signature);
				oResult.data = stream;
            } else {
                bError = true;
            }
 
            bEndLoadFile = true;
            onEndOpen();
		}
	}

	function sendCommand(editor, fCallback, rdata, dataContainer)
	{
		//json не должен превышать размера 2097152, иначе при его чтении будет exception
		var docConnectionId = editor.CoAuthoringApi.getDocId();
		if (docConnectionId && docConnectionId !== rdata["id"])
		{
			//на случай если поменялся documentId в Version History
			rdata['docconnectionid'] = docConnectionId;
		}
		if (null == rdata["savetype"])
		{
			editor.CoAuthoringApi.openDocument(rdata);
			return;
		}
		rdata["userconnectionid"] = editor.CoAuthoringApi.getUserConnectionId();
		asc_ajax({
			type:        'POST',
			url:         sDownloadServiceLocalUrl + '/' + rdata["id"] + '?cmd=' + encodeURIComponent(JSON.stringify(rdata)),
			data:        dataContainer.part || dataContainer.data,
			contentType: "application/octet-stream",
			error:       function (httpRequest, statusText, status)
						 {
							 if (fCallback)
							 {
								 fCallback(null, true, status);
							 }
						 },
			success:     function (httpRequest)
						 {
							 if (fCallback)
							 {
								 fCallback(JSON.parse(httpRequest.responseText), true);
							 }
						 }
		});
	}

	function sendSaveFile(docId, userId, title, jwt, data, fError, fsuccess)
	{
		var cmd = {'id': docId, "userid": userId, "tokenSession": jwt, 'outputpath': title};
		asc_ajax({
			type:        'POST',
			url:         sSaveFileLocalUrl + '/' + docId + '?cmd=' + encodeURIComponent(JSON.stringify(cmd)),
			data:        data,
			contentType: "application/octet-stream",
			error:       fError,
			success:     fsuccess
		});
	}

	function mapAscServerErrorToAscError(nServerError, nAction)
	{
		var nRes = Asc.c_oAscError.ID.Unknown;
		switch (nServerError)
		{
			case c_oAscServerError.NoError :
				nRes = Asc.c_oAscError.ID.No;
				break;
			case c_oAscServerError.TaskQueue :
			case c_oAscServerError.TaskResult :
				nRes = Asc.c_oAscError.ID.Database;
				break;
			case c_oAscServerError.ConvertDownload :
				nRes = Asc.c_oAscError.ID.DownloadError;
				break;
			case c_oAscServerError.ConvertTimeout :
			case c_oAscServerError.ConvertDeadLetter :
				nRes = Asc.c_oAscError.ID.ConvertationTimeout;
				break;
			case c_oAscServerError.ConvertDRM :
			case c_oAscServerError.ConvertDRM_UNSUPPORTED :
			case c_oAscServerError.ConvertPASSWORD :
				nRes = Asc.c_oAscError.ID.ConvertationPassword;
				break;
			case c_oAscServerError.ConvertLIMITS :
				nRes = Asc.c_oAscError.ID.ConvertationOpenLimitError;
				break;
			case c_oAscServerError.ConvertCONVERT_CORRUPTED :
			case c_oAscServerError.ConvertLIBREOFFICE :
			case c_oAscServerError.ConvertPARAMS :
			case c_oAscServerError.ConvertNEED_PARAMS :
			case c_oAscServerError.ConvertUnknownFormat :
			case c_oAscServerError.ConvertReadFile :
			case c_oAscServerError.Convert :
				nRes =
					AscCommon.c_oAscAdvancedOptionsAction.Save === nAction ? Asc.c_oAscError.ID.ConvertationSaveError :
						Asc.c_oAscError.ID.ConvertationOpenError;
				break;
			case c_oAscServerError.UploadContentLength :
				nRes = Asc.c_oAscError.ID.UplImageSize;
				break;
			case c_oAscServerError.UploadExtension :
				nRes = Asc.c_oAscError.ID.UplImageExt;
				break;
			case c_oAscServerError.UploadCountFiles :
				nRes = Asc.c_oAscError.ID.UplImageFileCount;
				break;
			case c_oAscServerError.UploadURL :
				nRes = Asc.c_oAscError.ID.UplImageUrl;
				break;
			case c_oAscServerError.UploadDocumentContentLength :
				nRes = Asc.c_oAscError.ID.UplDocumentSize;
				break;
			case c_oAscServerError.UploadDocumentExtension :
				nRes = Asc.c_oAscError.ID.UplDocumentExt;
				break;
			case c_oAscServerError.UploadDocumentCountFiles :
				nRes = Asc.c_oAscError.ID.UplDocumentFileCount;
				break;
			case c_oAscServerError.VKey :
				nRes = Asc.c_oAscError.ID.FileVKey;
				break;
			case c_oAscServerError.VKeyEncrypt :
				nRes = Asc.c_oAscError.ID.VKeyEncrypt;
				break;
			case c_oAscServerError.VKeyKeyExpire :
				nRes = Asc.c_oAscError.ID.KeyExpire;
				break;
			case c_oAscServerError.VKeyUserCountExceed :
				nRes = Asc.c_oAscError.ID.UserCountExceed;
				break;
			case c_oAscServerError.Password :
				nRes = Asc.c_oAscError.ID.Password;
				break;
			case c_oAscServerError.ChangeDocInfo :
				nRes = Asc.c_oAscError.ID.AccessDeny;
				break;
			case c_oAscServerError.Storage :
			case c_oAscServerError.StorageFileNoFound :
			case c_oAscServerError.StorageRead :
			case c_oAscServerError.StorageWrite :
			case c_oAscServerError.StorageRemoveDir :
			case c_oAscServerError.StorageCreateDir :
			case c_oAscServerError.StorageGetInfo :
			case c_oAscServerError.Upload :
			case c_oAscServerError.ReadRequestStream :
			case c_oAscServerError.Unknown :
				nRes = Asc.c_oAscError.ID.Unknown;
				break;
		}
		return nRes;
	}

	function joinUrls(base, relative)
	{
		//http://stackoverflow.com/questions/14780350/convert-relative-path-to-absolute-using-javascript
		var stack = base.split("/"),
			parts = relative.split("/");
		stack.pop(); // remove current file name (or empty string)
					 // (omit if "base" is the current folder without trailing slash)
		for (var i = 0; i < parts.length; i++)
		{
			if (parts[i] == ".")
				continue;
			if (parts[i] == "..")
				stack.pop();
			else
				stack.push(parts[i]);
		}
		return stack.join("/");
	}

	function getFullImageSrc2(src)
	{
		if (window["NATIVE_EDITOR_ENJINE"])
			return src;

		var start = src.slice(0, 6);
		if (0 === start.indexOf('theme') && editor.ThemeLoader)
		{
			return editor.ThemeLoader.ThemesUrlAbs + src;
		}

		if (0 !== start.indexOf('http:') && 0 !== start.indexOf('data:') && 0 !== start.indexOf('https:') &&
			0 !== start.indexOf('file:') && 0 !== start.indexOf('ftp:'))
		{
			var srcFull = g_oDocumentUrls.getImageUrl(src);
			if (srcFull)
			{
				return srcFull;
			}
		}
		return src;
	}

	function fSortAscending(a, b)
	{
		return a - b;
	}

	function fSortDescending(a, b)
	{
		return b - a;
	}

	function isLeadingSurrogateChar(nCharCode)
	{
		return (nCharCode >= 0xD800 && nCharCode <= 0xDFFF);
	}

	function decodeSurrogateChar(nLeadingChar, nTrailingChar)
	{
		if (nLeadingChar < 0xDC00 && nTrailingChar >= 0xDC00 && nTrailingChar <= 0xDFFF)
			return 0x10000 + ((nLeadingChar & 0x3FF) << 10) | (nTrailingChar & 0x3FF);
		else
			return null;
	}

	function encodeSurrogateChar(nUnicode)
	{
		if (nUnicode < 0x10000)
		{
			return String.fromCharCode(nUnicode);
		}
		else
		{
			nUnicode = nUnicode - 0x10000;
			var nLeadingChar = 0xD800 | (nUnicode >> 10);
			var nTrailingChar = 0xDC00 | (nUnicode & 0x3FF);
			return String.fromCharCode(nLeadingChar) + String.fromCharCode(nTrailingChar);
		}
	}

	function convertUnicodeToUTF16(sUnicode)
	{
		var sUTF16 = "";
		var nLength = sUnicode.length;
		for (var nPos = 0; nPos < nLength; nPos++)
		{
			sUTF16 += encodeSurrogateChar(sUnicode[nPos]);
		}

		return sUTF16;
	}

	function convertUTF16toUnicode(sUTF16)
	{
		var sUnicode = [];
		var nLength = sUTF16.length;
		for (var nPos = 0; nPos < nLength; nPos++)
		{
			var nUnicode = null;
			var nCharCode = sUTF16.charCodeAt(nPos);
			if (isLeadingSurrogateChar(nCharCode))
			{
				if (nPos + 1 < nLength)
				{
					nPos++;
					var nTrailingChar = sUTF16.charCodeAt(nPos);
					nUnicode = decodeSurrogateChar(nCharCode, nTrailingChar);
				}
			}
			else
				nUnicode = nCharCode;

			if (null !== nUnicode)
				sUnicode.push(nUnicode);
		}

		return sUnicode;
	}

	function CUnicodeStringEmulator(array)
	{
		this.arr = array;
		this.len = this.arr.length;
		this.pos = 0;
	}

	CUnicodeStringEmulator.prototype.getUnicodeIterator = function()
	{
		return this;
	};
	CUnicodeStringEmulator.prototype.isOutside = function()
	{
		return (this.pos >= this.len);
	};
	CUnicodeStringEmulator.prototype.isInside = function()
	{
		return (this.pos < this.len);
	};
	CUnicodeStringEmulator.prototype.value = function()
	{
		if (this.pos >= this.len)
			return 0;
		return this.arr[this.pos];
	};
	CUnicodeStringEmulator.prototype.next = function()
	{
		this.pos++;
	};
	CUnicodeStringEmulator.prototype.position = function()
	{
		return this.pos;
	};
	CUnicodeStringEmulator.prototype.check = CUnicodeStringEmulator.prototype.isInside;

	function CUnicodeIterator(str)
	{
		this._position = 0;
		this._index = 0;
		this._str = str;
	}

	CUnicodeIterator.prototype.isOutside = function()
	{
		return (this._index >= this._str.length);
	};
	CUnicodeIterator.prototype.isInside = function()
	{
		return (this._index < this._str.length);
	};
	CUnicodeIterator.prototype.value = function()
	{
		if (this._index >= this._str.length)
			return 0;

		var nCharCode = this._str.charCodeAt(this._index);
		if (!AscCommon.isLeadingSurrogateChar(nCharCode))
			return nCharCode;

		if ((this._str.length - 1) === this._index)
			return nCharCode; // error

		var nTrailingChar = this._str.charCodeAt(this._index + 1);
		return AscCommon.decodeSurrogateChar(nCharCode, nTrailingChar);
	};
	CUnicodeIterator.prototype.next = function()
	{
		if (this._index >= this._str.length)
			return;

		this._position++;
		if (!AscCommon.isLeadingSurrogateChar(this._str.charCodeAt(this._index)))
		{
			++this._index;
			return;
		}

		if (this._index === (this._str.length - 1))
		{
			++this._index;
			return;
		}

		this._index += 2;
	};
	CUnicodeIterator.prototype.position = function()
	{
		return this._position;
	};
	CUnicodeIterator.prototype.check = CUnicodeIterator.prototype.isInside;

    /**
	 * @returns {CUnicodeIterator}
     */
    String.prototype.getUnicodeIterator = function()
    {
        return new CUnicodeIterator(this);
    };

	function test_ws_name2()
	{
		var str_namedRanges      = "[A-Z\u005F\u0080-\u0081\u0083\u0085-\u0087\u0089-\u008A\u008C-\u0091\u0093-\u0094\u0096-\u0097\u0099-\u009A\u009C-\u009F\u00A1-\u00A5\u00A7-\u00A8\u00AA\u00AD\u00AF-\u00BA\u00BC-\u02B8\u02BB-\u02C1\u02C7\u02C9-\u02CB\u02CD\u02D0-\u02D1\u02D8-\u02DB\u02DD\u02E0-\u02E4\u02EE\u0370-\u0373\u0376-\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0523\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0621-\u064A\u066E-\u066F\u0671-\u06D3\u06D5\u06E5-\u06E6\u06EE-\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4-\u07F5\u07FA\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0972\u097B-\u097F\u0985-\u098C\u098F-\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC-\u09DD\u09DF-\u09E1\u09F0-\u09F1\u0A05-\u0A0A\u0A0F-\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32-\u0A33\u0A35-\u0A36\u0A38-\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2-\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0-\u0AE1\u0B05-\u0B0C\u0B0F-\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32-\u0B33\u0B35-\u0B39\u0B3D\u0B5C-\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99-\u0B9A\u0B9C\u0B9E-\u0B9F\u0BA3-\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58-\u0C59\u0C60-\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0-\u0CE1\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D28\u0D2A-\u0D39\u0D3D\u0D60-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E3A\u0E40-\u0E4E\u0E81-\u0E82\u0E84\u0E87-\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA-\u0EAB\u0EAD-\u0EB0\u0EB2-\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDD\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8B\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065-\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10D0-\u10FA\u10FC\u1100-\u1159\u115F-\u11A2\u11A8-\u11F9\u1200-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u1676\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19A9\u19C1-\u19C7\u1A00-\u1A16\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE-\u1BAF\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2010\u2013-\u2016\u2018\u201C-\u201D\u2020-\u2021\u2025-\u2027\u2030\u2032-\u2033\u2035\u203B\u2071\u2074\u207F\u2081-\u2084\u2090-\u2094\u2102-\u2103\u2105\u2107\u2109-\u2113\u2115-\u2116\u2119-\u211D\u2121-\u2122\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2153-\u2154\u215B-\u215E\u2160-\u2188\u2190-\u2199\u21D2\u21D4\u2200\u2202-\u2203\u2207-\u2208\u220B\u220F\u2211\u2215\u221A\u221D-\u2220\u2223\u2225\u2227-\u222C\u222E\u2234-\u2237\u223C-\u223D\u2248\u224C\u2252\u2260-\u2261\u2264-\u2267\u226A-\u226B\u226E-\u226F\u2282-\u2283\u2286-\u2287\u2295\u2299\u22A5\u22BF\u2312\u2460-\u24B5\u24D0-\u24E9\u2500-\u254B\u2550-\u2574\u2581-\u258F\u2592-\u2595\u25A0-\u25A1\u25A3-\u25A9\u25B2-\u25B3\u25B6-\u25B7\u25BC-\u25BD\u25C0-\u25C1\u25C6-\u25C8\u25CB\u25CE-\u25D1\u25E2-\u25E5\u25EF\u2605-\u2606\u2609\u260E-\u260F\u261C\u261E\u2640\u2642\u2660-\u2661\u2663-\u2665\u2667-\u266A\u266C-\u266D\u266F\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2C6F\u2C71-\u2C7D\u2C80-\u2CE4\u2D00-\u2D25\u2D30-\u2D65\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3000-\u3003\u3005-\u3017\u301D-\u301F\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31B7\u31F0-\u321C\u3220-\u3229\u3231-\u3232\u3239\u3260-\u327B\u327F\u32A3-\u32A8\u3303\u330D\u3314\u3318\u3322-\u3323\u3326-\u3327\u332B\u3336\u333B\u3349-\u334A\u334D\u3351\u3357\u337B-\u337E\u3380-\u3384\u3388-\u33CA\u33CD-\u33D3\u33D5-\u33D6\u33D8\u33DB-\u33DD\u3400-\u4DB5\u4E00-\u9FC3\uA000-\uA48C\uA500-\uA60C\uA610-\uA61F\uA62A-\uA62B\uA640-\uA65F\uA662-\uA66E\uA680-\uA697\uA722-\uA787\uA78B-\uA78C\uA7FB-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA90A-\uA925\uA930-\uA946\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAC00-\uD7A3\uE000-\uF848\uF900-\uFA2D\uFA30-\uFA6A\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40-\uFB41\uFB43-\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE30-\uFE31\uFE33-\uFE44\uFE49-\uFE52\uFE54-\uFE57\uFE59-\uFE66\uFE68-\uFE6B\uFE70-\uFE74\uFE76-\uFEFC\uFF01-\uFF5E\uFF61-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\uFFE0-\uFFE6]",
			str_namedSheetsRange = "\u0001-\u0026\u0028-\u0029\u002B-\u002D\u003B-\u003E\u0040\u005E\u0060\u007B-\u007F\u0082\u0084\u008B\u0092\u0095\u0098\u009B\u00A0\u00A6\u00A9\u00AB-\u00AC\u00AE\u00BB\u0378-\u0379\u037E-\u0383\u0387\u038B\u038D\u03A2\u0524-\u0530\u0557-\u0558\u055A-\u0560\u0588-\u0590\u05BE\u05C0\u05C3\u05C6\u05C8-\u05CF\u05EB-\u05EF\u05F3-\u05FF\u0604-\u0605\u0609-\u060A\u060C-\u060D\u061B-\u061E\u0620\u065F\u066A-\u066D\u06D4\u0700-\u070E\u074B-\u074C\u07B2-\u07BF\u07F7-\u07F9\u07FB-\u0900\u093A-\u093B\u094E-\u094F\u0955-\u0957\u0964-\u0965\u0970\u0973-\u097A\u0980\u0984\u098D-\u098E\u0991-\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BB\u09C5-\u09C6\u09C9-\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4-\u09E5\u09FB-\u0A00\u0A04\u0A0B-\u0A0E\u0A11-\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A3B\u0A3D\u0A43-\u0A46\u0A49-\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABB\u0AC6\u0ACA\u0ACE-\u0ACF\u0AD1-\u0ADF\u0AE4-\u0AE5\u0AF0\u0AF2-\u0B00\u0B04\u0B0D-\u0B0E\u0B11-\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3B\u0B45-\u0B46\u0B49-\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64-\u0B65\u0B72-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE-\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64-\u0C65\u0C70-\u0C77\u0C80-\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4-\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D29\u0D3A-\u0D3C\u0D45\u0D49\u0D4E-\u0D56\u0D58-\u0D5F\u0D64-\u0D65\u0D76-\u0D78\u0D80-\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE-\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF4-\u0E00\u0E3B-\u0E3E\u0E4F\u0E5A-\u0E80\u0E83\u0E85-\u0E86\u0E89\u0E8B-\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8-\u0EA9\u0EAC\u0EBA\u0EBE-\u0EBF\u0EC5\u0EC7\u0ECE-\u0ECF\u0EDA-\u0EDB\u0EDE-\u0EFF\u0F04-\u0F12\u0F3A-\u0F3D\u0F48\u0F6D-\u0F70\u0F85\u0F8C-\u0F8F\u0F98\u0FBD\u0FCD\u0FD0-\u0FFF\u104A-\u104F\u109A-\u109D\u10C6-\u10CF\u10FB\u10FD-\u10FF\u115A-\u115E\u11A3-\u11A7\u11FA-\u11FF\u1249\u124E-\u124F\u1257\u1259\u125E-\u125F\u1289\u128E-\u128F\u12B1\u12B6-\u12B7\u12BF\u12C1\u12C6-\u12C7\u12D7\u1311\u1316-\u1317\u135B-\u135E\u1361-\u1368\u137D-\u137F\u139A-\u139F\u13F5-\u1400\u166D-\u166E\u1677-\u167F\u169B-\u169F\u16EB-\u16ED\u16F1-\u16FF\u170D\u1715-\u171F\u1735-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17D4-\u17D6\u17D8-\u17DA\u17DE-\u17DF\u17EA-\u17EF\u17FA-\u180A\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1945\u196E-\u196F\u1975-\u197F\u19AA-\u19AF\u19CA-\u19CF\u19DA-\u19DF\u1A1C-\u1AFF\u1B4C-\u1B4F\u1B5A-\u1B60\u1B7D-\u1B7F\u1BAB-\u1BAD\u1BBA-\u1BFF\u1C38-\u1C3F\u1C4A-\u1C4C\u1C7E-\u1CFF\u1DE7-\u1DFD\u1F16-\u1F17\u1F1E-\u1F1F\u1F46-\u1F47\u1F4E-\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E-\u1F7F\u1FB5\u1FC5\u1FD4-\u1FD5\u1FDC\u1FF0-\u1FF1\u1FF5\u1FFF\u2011-\u2012\u2017\u2019-\u201B\u201E-\u201F\u2022-\u2024\u2031\u2034\u2036-\u203A\u203C-\u2043\u2045-\u2051\u2053-\u205E\u2065-\u2069\u2072-\u2073\u207D-\u207E\u208D-\u208F\u2095-\u209F\u20B6-\u20CF\u20F1-\u20FF\u2150-\u2152\u2189-\u218F\u2329-\u232A\u23E8-\u23FF\u2427-\u243F\u244B-\u245F\u269E-\u269F\u26BD-\u26BF\u26C4-\u2700\u2705\u270A-\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u275F-\u2760\u2768-\u2775\u2795-\u2797\u27B0\u27BF\u27C5-\u27C6\u27CB\u27CD-\u27CF\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC-\u29FD\u2B4D-\u2B4F\u2B55-\u2BFF\u2C2F\u2C5F\u2C70\u2C7E-\u2C7F\u2CEB-\u2CFC\u2CFE-\u2CFF\u2D26-\u2D2F\u2D66-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E00-\u2E2E\u2E30-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3018-\u301C\u3030\u303D\u3040\u3097-\u3098\u30A0\u3100-\u3104\u312E-\u3130\u318F\u31B8-\u31BF\u31E4-\u31EF\u321F\u3244-\u324F\u32FF\u4DB6-\u4DBF\u9FC4-\u9FFF\uA48D-\uA48F\uA4C7-\uA4FF\uA60D-\uA60F\uA62C-\uA63F\uA660-\uA661\uA673-\uA67B\uA67E\uA698-\uA6FF\uA78D-\uA7FA\uA82C-\uA83F\uA874-\uA87F\uA8C5-\uA8CF\uA8DA-\uA8FF\uA92F\uA954-\uA9FF\uAA37-\uAA3F\uAA4E-\uAA4F\uAA5A-\uABFF\uD7A4-\uD7FF\uFA2E-\uFA2F\uFA6B-\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90-\uFD91\uFDC8-\uFDEF\uFDFE-\uFDFF\uFE10-\uFE1F\uFE27-\uFE2F\uFE32\uFE45-\uFE48\uFE53\uFE58\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFEFE\uFF00\uFF5F-\uFF60\uFFBF-\uFFC1\uFFC8-\uFFC9\uFFD0-\uFFD1\uFFD8-\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFF8\uFFFE-\uFFFF",
			str_operator         = ",\\s-+/^&%<=>",
			str_excludeCharts    = "'*\\[\\]\\:/?";

		this.regExp_namedRanges = new RegExp(str_namedRanges, "i");
		this.regExp_namedSheetsRange = new RegExp("[" + str_namedSheetsRange + "]", "ig");
//    /[-+*\/^&%<=>:]/,
		this.regExp_strOperator = new RegExp("[" + str_operator + "]", "ig");
		this.regExp_strExcludeCharts = new RegExp("[" + str_excludeCharts + "]", "ig");

		this.test = function (str)
		{
			var ch1 = str.substr(0, 1);

			this.regExp_strExcludeCharts.lastIndex = 0;
			this.regExp_namedRanges.lastIndex = 0;
			this.regExp_namedSheetsRange.lastIndex = 0;
			this.regExp_strOperator.lastIndex = 0;

			var validName = this.isValidName(str);
			if (!validName)
			{
				return validName;
			}

			if (!this.regExp_namedRanges.test(ch1))
			{//если первый символ находится не в str_namedRanges, то однозначно надо экранировать
				return false;
			}
			else
			{
				if (this.regExp_namedSheetsRange.test(str) || this.regExp_strOperator.test(str))
				{//первый символ допустимый. проверяем всю строку на наличие символов, с которыми необходимо экранировать
					return false;
				}
				//проверка на то, что название листа не совпадает с допустимым адресом ячейки, как в A1 так и RC стилях.
				var match = str.match(rx_ref);
				if (match != null)
				{
					var m1 = match[1], m2 = match[2];
					if (match.length >= 3 && g_oCellAddressUtils.colstrToColnum(m1.substr(0, (m1.length - m2.length))) <= AscCommon.gc_nMaxCol && parseInt(m2) <= AscCommon.gc_nMaxRow)
					{
						return false;
					}
				}
				return true;
			}
		};

		this.isValidName = function (str)
		{
			if (str.length >= 32 || str.length === 0) {
				return undefined;
			}
			for (var i = 0; i < str.length; i++) {
				if(str[i] === "\'" && (i === 0 || i === str.length - 1)) {
					return undefined;
				} else if(str[i] === "]" || str[i] === "[" || str[i] === ":" || str[i] === "?" || str[i] === "*" || str[i] === "\\" || str[i] === "/") {
					return undefined;
				}
			}
			return true;
		};

		return this;

	}

	function test_defName()
	{
		var nameRangeRE = new RegExp("(^([" + str_namedRanges + "_])([" + str_namedRanges + "_0-9]*)$)", "i");

		this.test = function (str)
		{
			var match, m1, m2;
			if ((!nameRangeRE.test(str) && "_xlnm.print_area" !== str) || !rx_r1c1DefError.test(str))
			{
				return false;
			}

			match = str.match(rx_ref);
			if (match != null)
			{
				m1 = match[1];
				m2 = match[2];
				if (match.length >= 3 && g_oCellAddressUtils.colstrToColnum(m1.substr(0, (m1.length - m2.length))) <= AscCommon.gc_nMaxCol && parseInt(m2) <= AscCommon.gc_nMaxRow)
				{
					return false;
				}
			}

			return true;
		};

		return this;
	}

	var cStrucTableReservedWords = {
		all: "#All", data: "#Data", headers: "#Headers", totals: "#Totals", thisrow: "#This Row", at: "@"
	};
	var FormulaTablePartInfo = {
		all:     1,
		data:    2,
		headers: 3,
		totals:  4,
		thisRow: 5,
		columns: 6
	};

	var cStrucTableLocalColumns = null;
	var cBoolOrigin = {'t': 'TRUE', 'f': 'FALSE'};
	var cBoolLocal = {};
	var cErrorOrigin = {
		"nil": "#NULL!",
		"div": "#DIV\/0!",
		"value": "#VALUE!",
		"ref": "#REF!",
		"name": "#NAME?",
		"num": "#NUM!",
		"na": "#N\/A",
		"getdata": "#GETTING_DATA",
		"uf": "#UNSUPPORTED_FUNCTION!"
	};
	var cErrorLocal = {};

	function build_local_rx(data)
	{
		rx_table_local = build_rx_table(data ? data["StructureTables"] : null);
		rx_bool_local = build_rx_bool((data && data["CONST_TRUE_FALSE"]) || cBoolOrigin);
		rx_error_local = build_rx_error(data ? data["CONST_ERROR"] : null);
	}

	function build_rx_table(local)
	{
		window["AscCommon"].cStrucTableLocalColumns = cStrucTableLocalColumns = ( local ? local : {
			"h":  "Headers",
			"d":  "Data",
			"a":  "All",
			"tr": "This Row",
			"t":  "Totals"
		} );
		return build_rx_table_cur();
	}

	function build_rx_table_cur()
	{
		var loc_all                          = cStrucTableLocalColumns['a'],
			loc_headers                      = cStrucTableLocalColumns['h'],
			loc_data                         = cStrucTableLocalColumns['d'],
			loc_totals                       = cStrucTableLocalColumns['t'],
			loc_this_row                     = cStrucTableLocalColumns['tr'],
			structured_tables_headata        = new XRegExp('(?:\\[\\#' + loc_headers + '\\]\\' + FormulaSeparators.functionArgumentSeparator + '\\[\\#' + loc_data + '\\])'),
			structured_tables_datals         = new XRegExp('(?:\\[\\#' + loc_data + '\\]\\' + FormulaSeparators.functionArgumentSeparator + '\\[\\#' + loc_totals + '\\])'),
			structured_tables_userColumn     = new XRegExp('(?:\'\\[|\'\\]|[^[\\]])+'),
			structured_tables_reservedColumn = new XRegExp('\\#(?:' + loc_all + '|' + loc_headers + '|' + loc_totals + '|' + loc_data + '|' + loc_this_row + ')|@');

		return XRegExp.build('^(?<tableName>{{tableName}})\\[(?<columnName>{{columnName}})?\\]', {
			"tableName":  new XRegExp("^(:?[" + str_namedRanges + "][" + str_namedRanges + "\\d.]*)"),
			"columnName": XRegExp.build('(?<reservedColumn>{{reservedColumn}})|(?<oneColumn>{{userColumn}})|(?<columnRange>{{userColumnRange}})|(?<hdtcc>{{hdtcc}})', {
				"userColumn":      structured_tables_userColumn,
				"reservedColumn":  structured_tables_reservedColumn,
				"userColumnRange": XRegExp.build('\\[(?<colStart>{{uc}})\\]\\:\\[(?<colEnd>{{uc}})\\]', {
					"uc": structured_tables_userColumn
				}),
				"hdtcc":           XRegExp.build('(?<hdt>\\[{{rc}}\\]|{{hd}}|{{dt}})(?:\\' + FormulaSeparators.functionArgumentSeparator + '(?:\\[(?<hdtcstart>{{uc}})\\])(?:\\:(?:\\[(?<hdtcend>{{uc}})\\]))?)?', {
					"rc": structured_tables_reservedColumn,
					"hd": structured_tables_headata,
					"dt": structured_tables_datals,
					"uc": structured_tables_userColumn
				})
			})
		}, 'i');
	}

	function build_rx_bool(local)
	{
		var t = cBoolLocal.t = local['t'].toUpperCase();
		var f = cBoolLocal.f = local['f'].toUpperCase();

		return new RegExp("^(" + t + "|" + f + ")([-+*\\/^&%<=>: ;),}]|$)", "i");
	}

	function build_rx_error(local)
	{
		// ToDo переделать на более правильную реализацию. Не особо правильное копирование
		local = local ? local : {
			"nil":     "#NULL!",
			"div":     "#DIV\/0!",
			"value":   "#VALUE!",
			"ref":     "#REF!",
			"name":    "#NAME\\?",
			"num":     "#NUM!",
			"na":      "#N\/A",
			"getdata": "#GETTING_DATA",
			"uf":      "#UNSUPPORTED_FUNCTION!"
		};
		cErrorLocal['nil'] = local['nil'];
		cErrorLocal['div'] = local['div'];
		cErrorLocal['value'] = local['value'];
		cErrorLocal['ref'] = local['ref'];
		cErrorLocal['name'] = local['name'];
		cErrorLocal['num'] = local['num'];
		cErrorLocal['na'] = local['na'];
		cErrorLocal['getdata'] = local['getdata'];
		cErrorLocal['uf'] = local['uf'];

		return new RegExp("^(" + cErrorLocal["nil"] + "|" +
			cErrorLocal["div"] + "|" +
			cErrorLocal["value"] + "|" +
			cErrorLocal["ref"] + "|" +
			cErrorLocal["name"] + "|" +
			cErrorLocal["num"] + "|" +
			cErrorLocal["na"] + "|" +
			cErrorLocal["getdata"] + "|" +
			cErrorLocal["uf"] + ")", "i");
	}

	var PostMessageType = {
		UploadImage:    0,
		ExtensionExist: 1
	};

	var c_oAscServerError = {
		NoError:           0,
		Unknown:           -1,
		ReadRequestStream: -3,
		ChangeDocInfo:     -5,

		TaskQueue: -20,

		TaskResult: -40,

		Storage:            -60,
		StorageFileNoFound: -61,
		StorageRead:        -62,
		StorageWrite:       -63,
		StorageRemoveDir:   -64,
		StorageCreateDir:   -65,
		StorageGetInfo:     -66,

		Convert:                  -80,
		ConvertDownload:          -81,
		ConvertUnknownFormat:     -82,
		ConvertTimeout:           -83,
		ConvertReadFile:          -84,
		ConvertDRM_UNSUPPORTED:   -85,
		ConvertCONVERT_CORRUPTED: -86,
		ConvertLIBREOFFICE:       -87,
		ConvertPARAMS:            -88,
		ConvertNEED_PARAMS:       -89,
		ConvertDRM:               -90,
		ConvertPASSWORD:          -91,
		ConvertICU:               -92,
		ConvertLIMITS:            -93,
		ConvertDeadLetter:        -99,

		Upload:              -100,
		UploadContentLength: -101,
		UploadExtension:     -102,
		UploadCountFiles:    -103,
		UploadURL:           -104,
		UploadDocumentContentLength: -105,
		UploadDocumentExtension:     -106,
		UploadDocumentCountFiles:    -107,

		VKey:                -120,
		VKeyEncrypt:         -121,
		VKeyKeyExpire:       -122,
		VKeyUserCountExceed: -123,

		Password: -180
	};

	//todo get from server config
	var c_oAscImageUploadProp = {//Не все браузеры позволяют получить информацию о файле до загрузки(например ie9), меняя параметры здесь надо поменять аналогичные параметры в web.common
		MaxFileSize:      25000000, //25 mb
		SupportedFormats: ["jpg", "jpeg", "jpe", "png", "gif", "bmp"]
	};

	var c_oAscDocumentUploadProp = {
		MaxFileSize:      104857600, //100 mb
		SupportedFormats: ["docx", "doc", "docm", "dot", "dotm", "dotx", "epub", "fodt", "odt", "ott", "rtf", "wps"]
	};

	var c_oAscSpreadsheetUploadProp = {
		MaxFileSize:      104857600, //100 mb
		SupportedFormats: ["xlsx", "xlsm", "xls", "ods", "csv", "xltx", "xltm", "xlt", "fods", "ots"]
	};

	var c_oAscTextUploadProp = {
		MaxFileSize:      25000000, //25 mb
		SupportedFormats: ["txt", "csv"]
	};

	/**
	 *
	 * @param sName
	 * @returns {*}
	 * @constructor
	 */
	function GetFileExtension(sName)
	{
		var nIndex = sName ? sName.lastIndexOf(".") : -1;
		if (-1 != nIndex)
			return sName.substring(nIndex + 1).toLowerCase();
		return null;
	}
	function GetFileName(sName)
	{
		var nIndex = sName ? sName.lastIndexOf(".") : -1;
		if (-1 != nIndex)
			return sName.substring(0, nIndex);
		return null;
	}

	function changeFileExtention(sName, sNewExt, opt_lengthLimit)
	{
		var sOldExt = GetFileExtension(sName);
		var nIndexEnd = sOldExt ? sName.length - sOldExt.length - 1 : sName.length;
		if (opt_lengthLimit && nIndexEnd + sNewExt.length + 1 > opt_lengthLimit)
		{
			nIndexEnd = opt_lengthLimit - sNewExt.length - 1;
		}
		if (nIndexEnd < sName.length)
		{
			return sName.substring(0, nIndexEnd) + '.' + sNewExt;
		}
		else
		{
			return sName + '.' + sNewExt;
		}
	}

	function getExtentionByFormat(format)
	{
		switch (format)
		{
			case c_oAscFileType.PDF:
			case c_oAscFileType.PDFA:
				return 'pdf';
				break;
			case c_oAscFileType.HTML:
			case c_oAscFileType.HTML_TODO:
				return 'html';
				break;
			// Word
			case c_oAscFileType.DOCX:
				return 'docx';
				break;
			case c_oAscFileType.DOC:
				return 'doc';
				break;
			case c_oAscFileType.ODT:
				return 'odt';
				break;
			case c_oAscFileType.RTF:
				return 'rtf';
				break;
			case c_oAscFileType.TXT:
				return 'txt';
				break;
			case c_oAscFileType.MHT:
				return 'mht';
				break;
			case c_oAscFileType.EPUB:
				return 'epub';
				break;
			case c_oAscFileType.FB2:
				return 'fb2';
				break;
			case c_oAscFileType.MOBI:
				return 'mobi';
				break;
			case c_oAscFileType.DOCM:
				return 'docm';
				break;
			case c_oAscFileType.DOTX:
				return 'dotx';
				break;
			case c_oAscFileType.DOTM:
				return 'dotm';
				break;
			case c_oAscFileType.FODT:
				return 'fodt';
				break;
			case c_oAscFileType.OTT:
				return 'ott';
				break;
			case c_oAscFileType.DOC_FLAT:
				return 'doc';
				break;
			case c_oAscFileType.DOCX_FLAT:
				return 'docx';
				break;
			case c_oAscFileType.HTML_IN_CONTAINER:
				return 'zip';
				break;
			case c_oAscFileType.DOCX_PACKAGE:
				return 'xml';
				break;
			case c_oAscFileType.OFORM:
				return 'oform';
				break;
			case c_oAscFileType.DOCXF:
				return 'docxf';
				break;
			case c_oAscFileType.DOCY:
				return 'doct';
				break;
			case c_oAscFileType.CANVAS_WORD:
				return 'bin';
				break;
			case c_oAscFileType.JSON:
				return 'json';
				break;
			// Excel
			case c_oAscFileType.XLSX:
				return 'xlsx';
				break;
			case c_oAscFileType.XLS:
				return 'xls';
				break;
			case c_oAscFileType.ODS:
				return 'ods';
				break;
			case c_oAscFileType.CSV:
				return 'csv';
				break;
			case c_oAscFileType.XLSM:
				return 'xlsm';
				break;
			case c_oAscFileType.XLTX:
				return 'xltx';
				break;
			case c_oAscFileType.XLTM:
				return 'xltm';
				break;
			case c_oAscFileType.FODS:
				return 'fods';
				break;
			case c_oAscFileType.OTS:
				return 'ots';
				break;
			case c_oAscFileType.XLSY:
				return 'xlst';
				break;
			// PowerPoint
			case c_oAscFileType.PPTX:
				return 'pptx';
				break;
			case c_oAscFileType.PPT:
				return 'ppt';
				break;
			case c_oAscFileType.ODP:
				return 'odp';
				break;
			case c_oAscFileType.PPSX:
				return 'ppsx';
				break;
			case c_oAscFileType.PPTM:
				return 'pptm';
				break;
			case c_oAscFileType.PPSM:
				return 'ppsm';
				break;
			case c_oAscFileType.POTX:
				return 'potx';
				break;
			case c_oAscFileType.POTM:
				return 'potm';
				break;
			case c_oAscFileType.FODP:
				return 'fodp';
				break;
			case c_oAscFileType.OTP:
				return 'otp';
				break;

			case c_oAscFileType.IMG:
				return 'zip';
				break;
			case c_oAscFileType.JPG:
				return 'jpg';
				break;
			case c_oAscFileType.TIFF:
				return 'tiff';
				break;
			case c_oAscFileType.TGA:
				return 'tga';
				break;
			case c_oAscFileType.GIF:
				return 'gif';
				break;
			case c_oAscFileType.PNG:
				return 'png';
				break;
			case c_oAscFileType.EMF:
				return 'emf';
				break;
			case c_oAscFileType.WMF:
				return 'wmf';
				break;
			case c_oAscFileType.BMP:
				return 'bmp';
				break;
			case c_oAscFileType.CR2:
				return 'cr2';
				break;
			case c_oAscFileType.PCX:
				return 'pcx';
				break;
			case c_oAscFileType.RAS:
				return 'ras';
				break;
			case c_oAscFileType.PSD:
				return 'psd';
				break;
			case c_oAscFileType.ICO:
				return 'ico';
				break;
		}
		return '';
	}

	function InitOnMessage(callback)
	{
		if (window.addEventListener)
		{
			window.addEventListener("message", function (event)
			{
				if (null != event && null != event.data)
				{
					try
					{
						var data = JSON.parse(event.data);
						if (null != data && null != data["type"] && PostMessageType.UploadImage == data["type"])
						{
							if (c_oAscServerError.NoError == data["error"])
							{
								var urls = data["urls"];
								if (urls)
								{
									g_oDocumentUrls.addUrls(urls);
									var firstUrl;
									for (var i in urls)
									{
										if (urls.hasOwnProperty(i))
										{
											firstUrl = urls[i];
											break;
										}
									}
									callback(Asc.c_oAscError.ID.No, firstUrl);
								}

							}
							else
								callback(mapAscServerErrorToAscError(data["error"]));
						}
						else if (data["type"] === "onExternalPluginMessage")
						{
							if (!window.g_asc_plugins)
								return;

							if (data["subType"] == "internalCommand")
							{
								// такие команды перечисляем здесь и считаем их функционалом
								switch (data.data.type)
								{
									case "onbeforedrop":
									case "ondrop":
									{
										window.g_asc_plugins.api.privateDropEvent(data.data);
										return;
									}
									default:
										break;
								}
							}

							window.g_asc_plugins.sendToAllPlugins(event.data);
						}
						else if (data["type"] === "onExternalPluginMessageCallback")
						{
							if (!window.g_asc_plugins)
								return;

							window.parent && window.parent.postMessage(event.data, "*");
						}
                        else if (data["type"] === "emulateUploadInFrame")
                        {
                            if (window["_private_emulate_upload"])
                            {
                                window["_private_emulate_upload"](data["name"], data["content"]);
                                window["_private_emulate_upload"] = undefined;
                            }
                        }
					} catch (err)
					{
					}
				}
			}, false);
		}
	}

	function getAcceptByArray(arr){
		var res = '.' + arr[0];
		for (var i = 1; i < arr.length; ++i) {
			res += ',.' + arr[i];
		}
		return res;
	}
	function _ShowFileDialog(accept, allowEncryption, allowMultiple, fValidate, callback)
	{
		if (AscCommon.AscBrowser.isNeedEmulateUpload && window["emulateUpload"])
		{
            window["emulateUpload"](function(name, content) {
            	if (content === "") {
					callback(Asc.c_oAscError.ID.Unknown);
					return;
                }

				var stream = AscFonts.CreateFontData2(content);
				var blob = new Blob([stream.data.slice(0, stream.size)]);
				blob.name = name;
				blob.fileName = name;

                var nError = fValidate([blob]);
                callback(mapAscServerErrorToAscError(nError), [blob]);
            }, ":<iframe><image>");
			return;
		}

        if (allowEncryption && AscCommon.EncryptionWorker && AscCommon.EncryptionWorker.isCryptoImages())
		{
			AscCommon.EncryptionWorker.addCryproImagesFromDialog(callback);
			return;
		}

		if ("undefined" != typeof(FileReader))
		{
			var fileName = GetUploadInput(accept, allowMultiple, function (e)
			{
				if (e && e.target && e.target.files)
				{
					var nError = fValidate(e.target.files);
					callback(mapAscServerErrorToAscError(nError), e.target.files);
				}
				else
				{
					callback(Asc.c_oAscError.ID.Unknown);
				}
			});
			fileName.click();
		}
		else
		{
			return false;
		}
	}
	function ShowImageFileDialog(documentId, documentUserId, jwt, callback, callbackOld)
	{
		if (false === _ShowFileDialog("image/*", true, true, ValidateUploadImage, callback)) {
			//todo remove this compatibility
			var frameWindow = GetUploadIFrame();
			var url = sUploadServiceLocalUrlOld + '/' + documentId + '/' + documentUserId + '/' + g_oDocumentUrls.getMaxIndex();
			if (jwt)
			{
				url += '?token=' + encodeURIComponent(jwt);
			}
			var content = '<html><head></head><body><form action="' + url + '" method="POST" enctype="multipart/form-data"><input id="apiiuFile" name="apiiuFile" type="file" accept="image/*" size="1"><input id="apiiuSubmit" name="apiiuSubmit" type="submit" style="display:none;"></form></body></html>';
			frameWindow.document.open();
			frameWindow.document.write(content);
			frameWindow.document.close();

			var fileName = frameWindow.document.getElementById("apiiuFile");
			var fileSubmit = frameWindow.document.getElementById("apiiuSubmit");

			fileName.onchange = function (e)
			{
				if (e && e.target && e.target.files)
				{
					var nError = ValidateUploadImage(e.target.files);
					if (c_oAscServerError.NoError != nError)
					{
						callbackOld(mapAscServerErrorToAscError(nError));
						return;
					}
				}
				callbackOld(Asc.c_oAscError.ID.No);
				fileSubmit.click();
			};
			fileName.click();
		}
	}
	function ShowDocumentFileDialog(callback) {
		if (false === _ShowFileDialog(getAcceptByArray(c_oAscDocumentUploadProp.SupportedFormats), false, false, ValidateUploadDocument, callback)) {
			callback(Asc.c_oAscError.ID.Unknown);
		}
	}
	function ShowSpreadsheetFileDialog(callback) {
		if (false === _ShowFileDialog(getAcceptByArray(c_oAscSpreadsheetUploadProp.SupportedFormats), false, false, ValidateUploadSpreadsheet, callback)) {
			callback(Asc.c_oAscError.ID.Unknown);
		}
	}
	function ShowTextFileDialog(callback) {
		if (false === _ShowFileDialog(getAcceptByArray(c_oAscTextUploadProp.SupportedFormats), false, false, ValidateUploadText, callback)) {
			callback(Asc.c_oAscError.ID.Unknown);
		}
	}

	function InitDragAndDrop(oHtmlElement, callback)
	{
		if ("undefined" != typeof(FileReader) && null != oHtmlElement)
		{
			oHtmlElement["ondragover"] = function (e)
			{
                e.preventDefault();
				e.dataTransfer.dropEffect = CanDropFiles(e) ? 'copy' : 'none';
				if (e.dataTransfer.dropEffect == "copy")
				{
                    var editor = window["Asc"]["editor"] ? window["Asc"]["editor"] : window.editor;
					editor.beginInlineDropTarget(e);
                }
				return false;
			};
			oHtmlElement["ondrop"] = function (e)
			{
				e.preventDefault();
				var files = e.dataTransfer.files;
				var nError = ValidateUploadImage(files);

                var editor = window["Asc"]["editor"] ? window["Asc"]["editor"] : window.editor;
                editor.endInlineDropTarget(e);

				if (nError == c_oAscServerError.UploadCountFiles)
				{
					try
					{
                        // test html
                        var htmlValue = e.dataTransfer.getData("text/html");
                        if (htmlValue && !AscCommon.AscBrowser.isIE)
                        {
                            // text html!
                            var index = htmlValue.indexOf("StartHTML");
                            var indexHtml = htmlValue.indexOf("<html");
                            if (-1 == indexHtml)
                                indexHtml = htmlValue.indexOf("<HTML");
                            if (index > 0 && indexHtml > 0 && index < indexHtml)
                                htmlValue = htmlValue.substr(indexHtml);

                            editor["pluginMethod_PasteHtml"](htmlValue);
                            return;
                        }
                    }
                    catch(err)
					{
					}

					try
					{
                        var textValue = e.dataTransfer.getData("text/plain");
                        if (textValue)
                        {
                            editor["pluginMethod_PasteText"](textValue);
                            return;
                        }
                    }
                    catch(err)
					{
					}

                    try
                    {
                        var textValue = e.dataTransfer.getData("Text");
                        if (textValue)
                        {
                            editor["pluginMethod_PasteText"](textValue);
                            return;
                        }
                    }
                    catch(err)
                    {
                    }
				}

				callback(mapAscServerErrorToAscError(nError), files);
			};
		}
	}

	function DownloadOriginalFile(documentId, url, urlPathInToken, token, fError, fSuccess) {
		asc_ajax({
			url: sDownloadFileLocalUrl + '/' + documentId,
			responseType: "arraybuffer",
			headers: {
				'Authorization': 'Bearer ' + token,
				'x-url': url
			},
			success: function(resp) {
				fSuccess(resp.response);
			},
			error: fError
		});
	}
	function DownloadFileFromBytes(data, filename, mime, opt_bom) {
		//'js-download' https://github.com/kennethjiang/js-file-download
		var blobData = (typeof opt_bom !== 'undefined') ? [opt_bom, data] : [data];
		var blob = new Blob(blobData, {type: mime || 'application/octet-stream'});
		if (typeof window.navigator.msSaveBlob !== 'undefined') {
			// IE workaround for "HTML7007: One or more blob URLs were
			// revoked by closing the blob for which they were created.
			// These URLs will no longer resolve as the data backing
			// the URL has been freed."
			window.navigator.msSaveBlob(blob, filename);
		}
		else {
			var blobURL = (window.URL || window.webkitURL).createObjectURL(blob);
			var tempLink = document.createElement('a');
			tempLink.style.display = 'none';
			tempLink.href = blobURL;
			tempLink.setAttribute('download', filename);
			//to prevent click hook in web-apps/vendor/framework7-react/node_modules/framework7/esm/modules/clicks/clicks.js
			tempLink.classList.add("external");

			// Safari thinks _blank anchor are pop ups. We only want to set _blank
			// target if the browser does not support the HTML5 download attribute.
			// This allows you to download files in desktop safari if pop up blocking
			// is enabled.
			if (typeof tempLink.download === 'undefined') {
				tempLink.setAttribute('target', '_blank');
			}

			document.body.appendChild(tempLink);
			tempLink.click();

			// Fixes "webkit blob resource error 1"
			setTimeout(function() {
				document.body.removeChild(tempLink);
				(window.URL || window.webkitURL).revokeObjectURL(blobURL);
			}, 200)
		}
	}

	function UploadImageFiles(files, documentId, documentUserId, jwt, callback)
	{
		if (files.length > 0)
		{
			var url = sUploadServiceLocalUrl + '/' + documentId + '/' + documentUserId + '/' + g_oDocumentUrls.getMaxIndex();

			var aFiles = [];
			for(var i = files.length - 1;  i > - 1; --i){
                aFiles.push(files[i]);
			}
            var file = aFiles.pop();
            var aResultUrls = [];

            var fOnReadyChnageState = function(){
                if (4 == this.readyState){
                    if ((this.status == 200 || this.status == 1223)){
                        var urls = JSON.parse(this.responseText);
                        g_oDocumentUrls.addUrls(urls);
                        for (var i in urls)
                        {
                            if (urls.hasOwnProperty(i))
                            {
                                aResultUrls.push(urls[i]);
                                break;
                            }
                        }
                        if(aFiles.length === 0){
                            callback(Asc.c_oAscError.ID.No, aResultUrls);
                        }
                        else{
                            file = aFiles.pop();
                            var xhr = new XMLHttpRequest();

                            url = sUploadServiceLocalUrl + '/' + documentId + '/' + documentUserId + '/' + g_oDocumentUrls.getMaxIndex();

                            xhr.open('POST', url, true);
                            xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
                            xhr.setRequestHeader('Authorization', 'Bearer ' + jwt);
                            xhr.onreadystatechange = fOnReadyChnageState;
                            xhr.send(file);
                        }
                    }
                    else if(this.status === 403){
						callback(Asc.c_oAscError.ID.VKeyEncrypt);
					} else {
						callback(Asc.c_oAscError.ID.UplImageUrl);
					}
                }
            };

			var xhr = new XMLHttpRequest();
			xhr.open('POST', url, true);
			xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
			xhr.setRequestHeader('Authorization', 'Bearer ' + jwt);
			xhr.onreadystatechange = fOnReadyChnageState;
			xhr.send(file);
		}
		else
		{
			callback(Asc.c_oAscError.ID.UplImageFileCount);
		}
	}

    function UploadImageUrls(files, documentId, documentUserId, jwt, callback)
    {
        if (files.length > 0)
        {
            var url = sUploadServiceLocalUrl + '/' + documentId + '/' + documentUserId + '/' + g_oDocumentUrls.getMaxIndex();

            var aFiles = [];
            for(var i = files.length - 1;  i > - 1; --i){
                aFiles.push(files[i]);
            }
            var file = aFiles.pop();
            var aResultUrls = [];

            var fOnReadyChnageState = function()
			{
                if (4 == this.readyState)
                {
                    if ((this.status == 200 || this.status == 1223))
                    {
                        var urls = JSON.parse(this.responseText);
                        g_oDocumentUrls.addUrls(urls);
                        for (var i in urls)
                        {
                            if (urls.hasOwnProperty(i))
                            {
                                aResultUrls.push({ path: i, url: urls[i] });
                                break;
                            }
                        }
                        if (aFiles.length === 0)
                        {
                            callback(aResultUrls);
                        }
                        else
						{
                            file = aFiles.pop();
                            var xhr = new XMLHttpRequest();

                            url = sUploadServiceLocalUrl + '/' + documentId + '/' + documentUserId + '/' + g_oDocumentUrls.getMaxIndex();

                            xhr.open('POST', url, true);
                            xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
							xhr.setRequestHeader('Authorization', 'Bearer ' + jwt);
                            xhr.onreadystatechange = fOnReadyChnageState;
                            xhr.send(file);
                        }
                    }
                    else
                        callback([]);
                }
            };

            var xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
			xhr.setRequestHeader('Authorization', 'Bearer ' + jwt);
            xhr.onreadystatechange = fOnReadyChnageState;
            xhr.send(file);
        }
        else
        {
            callback(Asc.c_oAscError.ID.UplImageFileCount);
        }
    }

	function ValidateUpload(files, eUploadExtension, eUploadContentLength, eUploadCountFiles, c_oAscUploadProp)
	{
		var nRes = c_oAscServerError.NoError;
		if (files.length > 0)
		{
			for (var i = 0, length = files.length; i < length; i++)
			{
				var file = files[i];
				//проверяем расширение файла
				var sName = file.name;
				if (sName)
				{
					var bSupported = false;
					var ext = GetFileExtension(sName);
					if (null !== ext)
					{
						for (var j = 0, length2 = c_oAscUploadProp.SupportedFormats.length; j < length2; j++)
						{
							if (c_oAscUploadProp.SupportedFormats[j] == ext)
							{
								bSupported = true;
								break;
							}
						}
					}
					if (false == bSupported)
						nRes = eUploadExtension;
				}
				if (Asc.c_oAscError.ID.No == nRes)
				{
					var nSize = file.size;
					if (nSize && c_oAscUploadProp.MaxFileSize < nSize)
						nRes = eUploadContentLength;
				}
				if (c_oAscServerError.NoError != nRes)
					break;
			}
		}
		else
			nRes = eUploadCountFiles;
		return nRes;
	}
	function ValidateUploadImage(files)
	{
		return ValidateUpload(files, c_oAscServerError.UploadExtension, c_oAscServerError.UploadContentLength, c_oAscServerError.UploadCountFiles, c_oAscImageUploadProp);
	}
	function ValidateUploadDocument(files)
	{
		return ValidateUpload(files, c_oAscServerError.UploadDocumentExtension, c_oAscServerError.UploadDocumentContentLength, c_oAscServerError.UploadDocumentCountFiles, c_oAscDocumentUploadProp);
	}
	function ValidateUploadSpreadsheet(files)
	{
		return ValidateUpload(files, c_oAscServerError.UploadDocumentExtension, c_oAscServerError.UploadDocumentContentLength, c_oAscServerError.UploadDocumentCountFiles, c_oAscSpreadsheetUploadProp);
	}
	function ValidateUploadText(files)
	{
		return ValidateUpload(files, c_oAscServerError.UploadDocumentExtension, c_oAscServerError.UploadDocumentContentLength, c_oAscServerError.UploadDocumentCountFiles, c_oAscTextUploadProp);
	}

	function CanDropFiles(event)
	{
        var editor = window["Asc"]["editor"] ? window["Asc"]["editor"] : window.editor;
        if (!editor.isEnabledDropTarget())
        	return false;

		var bRes = false;
		if (event.dataTransfer.types)
		{
			for (var i = 0, length = event.dataTransfer.types.length; i < length; ++i)
			{
				var type = event.dataTransfer.types[i].toLowerCase();
				if (type == "files")
				{
					// Safari does not support items on dragover event
					if (AscCommon.AscBrowser.isSafari)
						return true;
					
					if (event.dataTransfer.items)
					{
						for (var j = 0, length2 = event.dataTransfer.items.length; j < length2; j++)
						{
							var item = event.dataTransfer.items[j];
							if (item.type && item.kind && "file" == item.kind.toLowerCase())
							{
								bRes = false;
								for (var k = 0,
										 length3 = c_oAscImageUploadProp.SupportedFormats.length; k < length3; k++)
								{
									if (-1 != item.type.indexOf(c_oAscImageUploadProp.SupportedFormats[k]))
									{
										bRes = true;
										break;
									}
								}
								if (false == bRes)
									break;
							}
						}
					}
					else
						bRes = true;
					break;
				}
				else if (type == "text" || type == "text/plain" || type == "text/html")
				{
                    bRes = true;
                    break;
				}
			}
		}
		return bRes;
	}

	function GetUploadIFrame()
	{
		var sIFrameName = "apiImageUpload";
		var oImageUploader = document.getElementById(sIFrameName);
		if (!oImageUploader)
		{
			var frame = document.createElement("iframe");
			frame.name = sIFrameName;
			frame.id = sIFrameName;
			frame.setAttribute("style", "position:absolute;left:-2px;top:-2px;width:1px;height:1px;z-index:-1000;");
			document.body.appendChild(frame);
		}
		return window.frames[sIFrameName];
	}

	function GetUploadInput(accept, allowMultiple, onchange)
	{
		var inputName = 'apiiuFile';
		var input = document.getElementById(inputName);
		//удаляем чтобы очистить input от предыдущего ввода
		if (input)
		{
			document.body.removeChild(input);
		}
		input = document.createElement("input");
		input.setAttribute('id', inputName);
		input.setAttribute('name', inputName);
		input.setAttribute('type', 'file');
		input.setAttribute('accept', accept);
		input.setAttribute('style', 'position:absolute;left:-2px;top:-2px;width:1px;height:1px;z-index:-1000;cursor:pointer;');
		if (allowMultiple) {
			input.setAttribute('multiple', true);
		}
		input.onchange = onchange;
		document.body.appendChild(input);
		return input;
	}

	var FormulaSeparators = {
		arrayRowSeparatorDef:         ';',
		arrayColSeparatorDef:         ',',
		digitSeparatorDef:            '.',
		functionArgumentSeparatorDef: ',',
		arrayRowSeparator:            ';',
		arrayColSeparator:            ',',
		digitSeparator:               '.',
		functionArgumentSeparator:    ','
	};

	var g_oCodeSpace = 32; // Code of space
	var g_oCodeLineFeed = 10; // Code of line feed
	var g_arrCodeOperators = [37, 38, 42, 43, 45, 47, 58, 94]; // Code of operators [%, &, *, +, -, /, :, ^]
	var g_oStartCodeOperatorsCompare = 60; // Start code of operators <=>
	var g_oEndCodeOperatorsCompare = 62; // End code of operators <=>
	var g_oCodeLeftParentheses = 40; // Code of (
	var g_oCodeRightParentheses = 41; // Code of )
	var g_oCodeLeftBrace = 123; // Code of {
	var g_oCodeRightBrace = 125; // Code of }

	/*Functions that checks of an element in formula*/
	var str_namedRanges       = "A-Za-z\u005F\u0080-\u0081\u0083\u0085-\u0087\u0089-\u008A\u008C-\u0091\u0093-\u0094\u0096-\u0097\u0099-\u009A\u009C-\u009F\u00A1-\u00A5\u00A7-\u00A8\u00AA\u00AD\u00AF-\u00BA\u00BC-\u02B8\u02BB-\u02C1\u02C7\u02C9-\u02CB\u02CD\u02D0-\u02D1\u02D8-\u02DB\u02DD\u02E0-\u02E4\u02EE\u0370-\u0373\u0376-\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0523\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0621-\u064A\u066E-\u066F\u0671-\u06D3\u06D5\u06E5-\u06E6\u06EE-\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4-\u07F5\u07FA\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0972\u097B-\u097F\u0985-\u098C\u098F-\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC-\u09DD\u09DF-\u09E1\u09F0-\u09F1\u0A05-\u0A0A\u0A0F-\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32-\u0A33\u0A35-\u0A36\u0A38-\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2-\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0-\u0AE1\u0B05-\u0B0C\u0B0F-\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32-\u0B33\u0B35-\u0B39\u0B3D\u0B5C-\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99-\u0B9A\u0B9C\u0B9E-\u0B9F\u0BA3-\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58-\u0C59\u0C60-\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0-\u0CE1\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D28\u0D2A-\u0D39\u0D3D\u0D60-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E3A\u0E40-\u0E4E\u0E81-\u0E82\u0E84\u0E87-\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA-\u0EAB\u0EAD-\u0EB0\u0EB2-\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDD\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8B\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065-\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10D0-\u10FA\u10FC\u1100-\u1159\u115F-\u11A2\u11A8-\u11F9\u1200-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u1676\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19A9\u19C1-\u19C7\u1A00-\u1A16\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE-\u1BAF\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200e\u2010\u2013-\u2016\u2018\u201C-\u201D\u2020-\u2021\u2025-\u2027\u2030\u2032-\u2033\u2035\u203B\u2071\u2074\u207F\u2081-\u2084\u2090-\u2094\u2102-\u2103\u2105\u2107\u2109-\u2113\u2115-\u2116\u2119-\u211D\u2121-\u2122\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2153-\u2154\u215B-\u215E\u2160-\u2188\u2190-\u2199\u21D2\u21D4\u2200\u2202-\u2203\u2207-\u2208\u220B\u220F\u2211\u2215\u221A\u221D-\u2220\u2223\u2225\u2227-\u222C\u222E\u2234-\u2237\u223C-\u223D\u2248\u224C\u2252\u2260-\u2261\u2264-\u2267\u226A-\u226B\u226E-\u226F\u2282-\u2283\u2286-\u2287\u2295\u2299\u22A5\u22BF\u2312\u2460-\u24B5\u24D0-\u24E9\u2500-\u254B\u2550-\u2574\u2581-\u258F\u2592-\u2595\u25A0-\u25A1\u25A3-\u25A9\u25B2-\u25B3\u25B6-\u25B7\u25BC-\u25BD\u25C0-\u25C1\u25C6-\u25C8\u25CB\u25CE-\u25D1\u25E2-\u25E5\u25EF\u2605-\u2606\u2609\u260E-\u260F\u261C\u261E\u2640\u2642\u2660-\u2661\u2663-\u2665\u2667-\u266A\u266C-\u266D\u266F\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2C6F\u2C71-\u2C7D\u2C80-\u2CE4\u2D00-\u2D25\u2D30-\u2D65\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3000-\u3003\u3005-\u3017\u301D-\u301F\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31B7\u31F0-\u321C\u3220-\u3229\u3231-\u3232\u3239\u3260-\u327B\u327F\u32A3-\u32A8\u3303\u330D\u3314\u3318\u3322-\u3323\u3326-\u3327\u332B\u3336\u333B\u3349-\u334A\u334D\u3351\u3357\u337B-\u337E\u3380-\u3384\u3388-\u33CA\u33CD-\u33D3\u33D5-\u33D6\u33D8\u33DB-\u33DD\u3400-\u4DB5\u4E00-\u9FC3\uA000-\uA48C\uA500-\uA60C\uA610-\uA61F\uA62A-\uA62B\uA640-\uA65F\uA662-\uA66E\uA680-\uA697\uA722-\uA787\uA78B-\uA78C\uA7FB-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA90A-\uA925\uA930-\uA946\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAC00-\uD7A3\uE000-\uF848\uF900-\uFA2D\uFA30-\uFA6A\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40-\uFB41\uFB43-\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE30-\uFE31\uFE33-\uFE44\uFE49-\uFE52\uFE54-\uFE57\uFE59-\uFE66\uFE68-\uFE6B\uFE70-\uFE74\uFE76-\uFEFC\uFF01-\uFF5E\uFF61-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\uFFE0-\uFFE6",
		str_namedSheetsRange  = "\u0001-\u0026\u0028-\u0029\u002B-\u002D\u003B-\u003E\u0040\u005E\u0060\u007B-\u007F\u0082\u0084\u008B\u0092\u0095\u0098\u009B\u00A0\u00A6\u00A9\u00AB-\u00AC\u00AE\u00BB\u0378-\u0379\u037E-\u0383\u0387\u038B\u038D\u03A2\u0524-\u0530\u0557-\u0558\u055A-\u0560\u0588-\u0590\u05BE\u05C0\u05C3\u05C6\u05C8-\u05CF\u05EB-\u05EF\u05F3-\u05FF\u0604-\u0605\u0609-\u060A\u060C-\u060D\u061B-\u061E\u0620\u065F\u066A-\u066D\u06D4\u0700-\u070E\u074B-\u074C\u07B2-\u07BF\u07F7-\u07F9\u07FB-\u0900\u093A-\u093B\u094E-\u094F\u0955-\u0957\u0964-\u0965\u0970\u0973-\u097A\u0980\u0984\u098D-\u098E\u0991-\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BB\u09C5-\u09C6\u09C9-\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4-\u09E5\u09FB-\u0A00\u0A04\u0A0B-\u0A0E\u0A11-\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A3B\u0A3D\u0A43-\u0A46\u0A49-\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABB\u0AC6\u0ACA\u0ACE-\u0ACF\u0AD1-\u0ADF\u0AE4-\u0AE5\u0AF0\u0AF2-\u0B00\u0B04\u0B0D-\u0B0E\u0B11-\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3B\u0B45-\u0B46\u0B49-\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64-\u0B65\u0B72-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE-\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64-\u0C65\u0C70-\u0C77\u0C80-\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4-\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D29\u0D3A-\u0D3C\u0D45\u0D49\u0D4E-\u0D56\u0D58-\u0D5F\u0D64-\u0D65\u0D76-\u0D78\u0D80-\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE-\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF4-\u0E00\u0E3B-\u0E3E\u0E4F\u0E5A-\u0E80\u0E83\u0E85-\u0E86\u0E89\u0E8B-\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8-\u0EA9\u0EAC\u0EBA\u0EBE-\u0EBF\u0EC5\u0EC7\u0ECE-\u0ECF\u0EDA-\u0EDB\u0EDE-\u0EFF\u0F04-\u0F12\u0F3A-\u0F3D\u0F48\u0F6D-\u0F70\u0F85\u0F8C-\u0F8F\u0F98\u0FBD\u0FCD\u0FD0-\u0FFF\u104A-\u104F\u109A-\u109D\u10C6-\u10CF\u10FB\u10FD-\u10FF\u115A-\u115E\u11A3-\u11A7\u11FA-\u11FF\u1249\u124E-\u124F\u1257\u1259\u125E-\u125F\u1289\u128E-\u128F\u12B1\u12B6-\u12B7\u12BF\u12C1\u12C6-\u12C7\u12D7\u1311\u1316-\u1317\u135B-\u135E\u1361-\u1368\u137D-\u137F\u139A-\u139F\u13F5-\u1400\u166D-\u166E\u1677-\u167F\u169B-\u169F\u16EB-\u16ED\u16F1-\u16FF\u170D\u1715-\u171F\u1735-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17D4-\u17D6\u17D8-\u17DA\u17DE-\u17DF\u17EA-\u17EF\u17FA-\u180A\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1945\u196E-\u196F\u1975-\u197F\u19AA-\u19AF\u19CA-\u19CF\u19DA-\u19DF\u1A1C-\u1AFF\u1B4C-\u1B4F\u1B5A-\u1B60\u1B7D-\u1B7F\u1BAB-\u1BAD\u1BBA-\u1BFF\u1C38-\u1C3F\u1C4A-\u1C4C\u1C7E-\u1CFF\u1DE7-\u1DFD\u1F16-\u1F17\u1F1E-\u1F1F\u1F46-\u1F47\u1F4E-\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E-\u1F7F\u1FB5\u1FC5\u1FD4-\u1FD5\u1FDC\u1FF0-\u1FF1\u1FF5\u1FFF\u200e\u2011-\u2012\u2017\u2019-\u201B\u201E-\u201F\u2022-\u2024\u2031\u2034\u2036-\u203A\u203C-\u2043\u2045-\u2051\u2053-\u205E\u2065-\u2069\u2072-\u2073\u207D-\u207E\u208D-\u208F\u2095-\u209F\u20B6-\u20CF\u20F1-\u20FF\u2150-\u2152\u2189-\u218F\u2329-\u232A\u23E8-\u23FF\u2427-\u243F\u244B-\u245F\u269E-\u269F\u26BD-\u26BF\u26C4-\u2700\u2705\u270A-\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u275F-\u2760\u2768-\u2775\u2795-\u2797\u27B0\u27BF\u27C5-\u27C6\u27CB\u27CD-\u27CF\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC-\u29FD\u2B4D-\u2B4F\u2B55-\u2BFF\u2C2F\u2C5F\u2C70\u2C7E-\u2C7F\u2CEB-\u2CFC\u2CFE-\u2CFF\u2D26-\u2D2F\u2D66-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E00-\u2E2E\u2E30-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3018-\u301C\u3030\u303D\u3040\u3097-\u3098\u30A0\u3100-\u3104\u312E-\u3130\u318F\u31B8-\u31BF\u31E4-\u31EF\u321F\u3244-\u324F\u32FF\u4DB6-\u4DBF\u9FC4-\u9FFF\uA48D-\uA48F\uA4C7-\uA4FF\uA60D-\uA60F\uA62C-\uA63F\uA660-\uA661\uA673-\uA67B\uA67E\uA698-\uA6FF\uA78D-\uA7FA\uA82C-\uA83F\uA874-\uA87F\uA8C5-\uA8CF\uA8DA-\uA8FF\uA92F\uA954-\uA9FF\uAA37-\uAA3F\uAA4E-\uAA4F\uAA5A-\uABFF\uD7A4-\uD7FF\uFA2E-\uFA2F\uFA6B-\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90-\uFD91\uFDC8-\uFDEF\uFDFE-\uFDFF\uFE10-\uFE1F\uFE27-\uFE2F\uFE32\uFE45-\uFE48\uFE53\uFE58\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFEFE\uFF00\uFF5F-\uFF60\uFFBF-\uFFC1\uFFC8-\uFFC9\uFFD0-\uFFD1\uFFD8-\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFF8\uFFFE-\uFFFF",
		rx_operators          = /^ *[-+*\/^&%<=>:] */,
		rg                    = new XRegExp("^((?:_xlfn.)?[\\p{L}\\d._]+ *)[-+*/^&%<=>:;\\(\\)]"),
		//TODO для правки ввода формулы SUM(A1:B1.) - меняю rgRange/rgRangeR1C1 ,
		// есть ещё символы, на которые ругается ms подобным образом - ~@#(мы тоже ругаемся, но не выделяем диапазон перед данными символами).
		// для проверки нужно ввести в ячейку SUM(A1:B1@)
		rgRange               = /^(\$?[A-Za-z]+\$?\d+:\$?[A-Za-z]+\$?\d+)(?:[-+*\/^&%<=>: ;),.]|$)/,
		rgRangeR1C1           = /^(([Rr]{1}(\[)?(-?\d*)(\])?)([Cc]{1}(\[)?(-?\d*)(\])?):([Rr]{1}(\[)?(-?\d*)(\])?)([Cc]{1}(\[)?(-?\d*)(\])?))([-+*\/^&%<=>: ;),.]|$)/,
		rgCols                = /^(\$?[A-Za-z]+:\$?[A-Za-z]+)(?:[-+*\/^&%<=>: ;),]|$)/,
		rgColsR1C1            = /^(([Cc]{1}(\[)?(-?\d*)(\])?(:)?)([Cc]?(\[)?(-?\d*)(\])?))([-+*\/^&%<=>: ;),]|$)/,
		rgRows                = /^(\$?\d+:\$?\d+)(?:[-+*\/^&%<=>: ;),]|$)/,
		rgRowsR1C1            = /^(([Rr]{1}(\[)?(-?\d*)(\])?(:)?)([Rr]?(\[)?(-?\d*)(\])?))([-+*\/^&%<=>: ;),]|$)/,
		rx_ref                = /^ *(\$?[A-Za-z]{1,3}\$?(\d{1,7}))([-+*\/^&%<=>: ;),]|$)/,
		rx_refAll             = /^(\$?[A-Za-z]+\$?(\d+))([-+*\/^&%<=>: ;),]|$)/,
		rx_refR1C1            = /^(([Rr]{1}(\[)?(-?\d*)(\])?)([Cc]{1}(\[)?(-?\d*)(\])?))([-+*\/^&%<=>: ;),]|$)/,
		rx_ref3D_non_quoted   = new XRegExp("^(?<name_from>[" + str_namedRanges + "][" + str_namedRanges + "\\d.]*)(:(?<name_to>[" + str_namedRanges + "][" + str_namedRanges + "\\d.]*))?!", "i"),
		rx_ref3D_quoted       = new XRegExp("^'(?<name_from>(?:''|[^\\[\\]'\\/*?:])*)(?::(?<name_to>(?:''|[^\\[\\]'\\/*?:])*))?'!"),
		rx_ref3D_non_quoted_2 = new XRegExp("^(?<name_from>[" + str_namedRanges + "\\d][" + str_namedRanges + "\\d.]*)(:(?<name_to>[" + str_namedRanges + "\\d][" + str_namedRanges + "\\d.]*))?!", "i"),
		rx_ref3D              = new XRegExp("^(?<name_from>[^:]+)(:(?<name_to>[^:]+))?!"),
		rx_number             = /^ *[+-]?\d*(\d|\.)\d*([eE][+-]?\d+)?/,
		rx_RightParentheses   = /^ *\)/,
		rx_Comma              = /^ *[,;] */,
		rx_arraySeparators    = /^ *[,;] */,

		rx_error              = build_rx_error(null),
		rx_error_local        = build_rx_error(null),

		rx_bool               = build_rx_bool(cBoolOrigin),
		rx_bool_local         = rx_bool,
		rx_string             = /^\"((\"\"|[^\"])*)\"/,
		rx_test_ws_name       = new test_ws_name2(),
		rx_space_g            = /\s/g,
		rx_space              = /\s/,
		rx_intersect          = /^ +/,
		rg_str_allLang        = /[A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0345\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05B0-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0657\u0659-\u065F\u066E-\u06D3\u06D5-\u06DC\u06E1-\u06E8\u06ED-\u06EF\u06FA-\u06FC\u06FF\u0710-\u073F\u074D-\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0817\u081A-\u082C\u0840-\u0858\u08A0\u08A2-\u08AC\u08E4-\u08E9\u08F0-\u08FE\u0900-\u093B\u093D-\u094C\u094E-\u0950\u0955-\u0963\u0971-\u0977\u0979-\u097F\u0981-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD-\u09C4\u09C7\u09C8\u09CB\u09CC\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09F0\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3E-\u0A42\u0A47\u0A48\u0A4B\u0A4C\u0A51\u0A59-\u0A5C\u0A5E\u0A70-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD-\u0AC5\u0AC7-\u0AC9\u0ACB\u0ACC\u0AD0\u0AE0-\u0AE3\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D-\u0B44\u0B47\u0B48\u0B4B\u0B4C\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCC\u0BD0\u0BD7\u0C01-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4C\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C82\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCC\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CF1\u0CF2\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4C\u0D4E\u0D57\u0D60-\u0D63\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E46\u0E4D\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0ECD\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F71-\u0F81\u0F88-\u0F97\u0F99-\u0FBC\u1000-\u1036\u1038\u103B-\u103F\u1050-\u1062\u1065-\u1068\u106E-\u1086\u108E\u109C\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1713\u1720-\u1733\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17B3\u17B6-\u17C8\u17D7\u17DC\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191C\u1920-\u192B\u1930-\u1938\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A1B\u1A20-\u1A5E\u1A61-\u1A74\u1AA7\u1B00-\u1B33\u1B35-\u1B43\u1B45-\u1B4B\u1B80-\u1BA9\u1BAC-\u1BAF\u1BBA-\u1BE5\u1BE7-\u1BF1\u1C00-\u1C35\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u24B6-\u24E9\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA674-\uA67B\uA67F-\uA697\uA69F-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA827\uA840-\uA873\uA880-\uA8C3\uA8F2-\uA8F7\uA8FB\uA90A-\uA92A\uA930-\uA952\uA960-\uA97C\uA980-\uA9B2\uA9B4-\uA9BF\uA9CF\uAA00-\uAA36\uAA40-\uAA4D\uAA60-\uAA76\uAA7A\uAA80-\uAABE\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF5\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABEA\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
		rx_name               = new XRegExp("^(?<name>" + "[" + str_namedRanges + "][" + str_namedRanges + "\\d.]*)([-+*\\/^&%<=>: ;/\n/),]|$)"),
		rx_defName            = new test_defName(),
		rx_arraySeparatorsDef = /^ *[,;] */,
		rx_numberDef          = /^ *[+-]?\d*(\d|\.)\d*([eE][+-]?\d+)?/,
		rx_CommaDef           = /^ *[,;] */,
		//пока не объединяю с проверкой именованных диапазонов, подумать на счёт объединения. при объединении в парсере формул проблема - мы не попадаем в isName, а далее заходим в isFunc
		rx_r1c1DefError       = /^(?!(([Rr]|[Cc]|([Rr][Cc]))(\d)))/i,

		rx_ControlSymbols     = /^ *[\u0000-\u001F\u007F-\u009F] */,

		emailRe               = /^(mailto:)?([a-z0-9'\._-]+@[a-z0-9\.-]+\.[a-z0-9]{2,4})([a-яё0-9\._%+-=\? :&]*)/i,
		ipRe                  = /^(((https?)|(ftps?)):\/\/)?([\-\wа-яё]*:?[\-\wа-яё]*@)?(((1[0-9]{2}|2[0-4][0-9]|25[0-5]|[1-9][0-9]|[0-9])\.){3}(1[0-9]{2}|2[0-4][0-9]|25[0-5]|[1-9][0-9]|[0-9]))(:\d+)?(\/[%\-\wа-яё]*(\.[\wа-яё]{2,})?(([\wа-яё\-\.\?\\\/+@&#;:`~=%!,\(\)]*)(\.[\wа-яё]{2,})?)*)*\/?/i,
		hostnameRe            = /^(((https?)|(ftps?)):\/\/)?([\-\wа-яё]*:?[\-\wа-яё]*@)?(([\-\wа-яё]+\.)+[\wа-яё\-]{2,}(:\d+)?(\/[%\-\wа-яё]*(\.[\wа-яё]{2,})?(([\wа-яё\-\.\?\\\/+@&#;:`'~=%!,\(\)]*)(\.[\wа-яё]{2,})?)*)*\/?)/i,
		localRe               = /^(((https?)|(ftps?)):\/\/)([\-\wа-яё]*:?[\-\wа-яё]*@)?(([\-\wа-яё]+)(:\d+)?(\/[%\-\wа-яё]*(\.[\wа-яё]{2,})?(([\wа-яё\-\.\?\\\/+@&#;:`'~=%!,\(\)]*)(\.[\wа-яё]{2,})?)*)*\/?)/i,

		rx_table              = build_rx_table(null),
		rx_table_local        = build_rx_table(null);

	function getUrlType(url)
	{
		var checkvalue = url.replace(new RegExp(' ', 'g'), '%20');
		var isEmail;
		var isvalid = checkvalue.strongMatch(hostnameRe);
		!isvalid && (isvalid = checkvalue.strongMatch(ipRe));
		!isvalid && (isvalid = checkvalue.strongMatch(localRe));
		isEmail = checkvalue.strongMatch(emailRe);
		!isvalid && (isvalid = isEmail);

		return isvalid ? (isEmail ? AscCommon.c_oAscUrlType.Email : AscCommon.c_oAscUrlType.Http) : AscCommon.c_oAscUrlType.Invalid;
	}

	function prepareUrl(url, type)
	{
		if (!/(((^https?)|(^ftp)):\/\/)|(^mailto:)/i.test(url))
		{
			url = ( (AscCommon.c_oAscUrlType.Email == type) ? 'mailto:' : 'http://' ) + url;
		}

		return url.replace(new RegExp("%20", 'g'), " ");
	}

	/**
	 * вспомогательный объект для парсинга формул и проверки строки по регуляркам указанным выше.
	 * @constructor
	 */
	function parserHelper()
	{
		this.operand_str = null;
		this.pCurrPos = null;
	}

	parserHelper.prototype._reset = function ()
	{
		this.operand_str = null;
		this.pCurrPos = null;
	};
	parserHelper.prototype.isControlSymbols = function (formula, start_pos, digitDelim)
	{
		if (this instanceof parserHelper)
		{
			this._reset();
		}

		var match = (formula.substring(start_pos)).match(rx_ControlSymbols);
		if (match != null)
		{
			this.operand_str = match[0];
			this.pCurrPos += match[0].length;
			return true;
		}
		return false;
	};
	parserHelper.prototype.isOperator = function (formula, start_pos)
	{
		// ToDo нужно ли это?
		if (this instanceof parserHelper)
		{
			this._reset();
		}

		var code, find = false, length = formula.length;
		while (start_pos !== length)
		{
			code = formula.charCodeAt(start_pos);
			if (-1 !== g_arrCodeOperators.indexOf(code))
			{
				this.operand_str = formula[start_pos];
				++start_pos;
				find = true;
				break;
			}
			else if (g_oStartCodeOperatorsCompare <= code && code <= g_oEndCodeOperatorsCompare)
			{
				this.operand_str = formula[start_pos];
				++start_pos;
				while (start_pos !== length)
				{
					code = formula.charCodeAt(start_pos);
					if (g_oStartCodeOperatorsCompare > code || code > g_oEndCodeOperatorsCompare)
					{
						break;
					}
					this.operand_str += formula[start_pos];
					++start_pos;
				}
				find = true;
				break;
			}
			else if (code === g_oCodeSpace || code === g_oCodeLineFeed)
			{
				++start_pos;
			}
			else
			{
				break;
			}
		}
		if (find)
		{
			while (start_pos !== length)
			{
				code = formula.charCodeAt(start_pos);
				if (code !== g_oCodeSpace &&  code !== g_oCodeLineFeed)
				{
					break;
				}
				++start_pos;
			}
			this.pCurrPos = start_pos;
			return true;
		}
		return false;
	};
	parserHelper.prototype.isFunc = function (formula, start_pos)
	{
		if (this instanceof parserHelper)
		{
			this._reset();
		}

		var frml = formula.substring(start_pos);
		var match = (frml).match(rg);

		if (match != null)
		{
			if (match.length == 2)
			{
				this.pCurrPos += match[1].length;
				this.operand_str = match[1];
				return true;
			}
		}
		return false;
	};
	parserHelper.prototype.convertFromR1C1 = function (r, c, isAbsRow, isAbsCol)
	{
		var activeCell = AscCommonExcel.g_ActiveCell;
		var colStr, rowStr, res = "";

		var getColStr = function() {
			var col;
			if(c < 0) {
				var tempCol = !isAbsCol && activeCell ? activeCell.c1 + 1 + c : c;
				if(tempCol <= 0) {
					tempCol = AscCommon.gc_nMaxCol + tempCol;
				}
				col = g_oCellAddressUtils.colnumToColstrFromWsView(tempCol);
			} else {
				col = g_oCellAddressUtils.colnumToColstrFromWsView(!isAbsCol && activeCell ? activeCell.c1 + 1 + c : c);
			}
			return col;
		};

		var getRowStr = function() {
			var row;
			if(r < 0) {
				var tempRow = !isAbsRow && activeCell ? activeCell.r1 + 1 + r : r;
				if(tempRow <= 0) {
					tempRow = AscCommon.gc_nMaxRow + tempRow;
				}
				row = tempRow + "";
			} else {
				row = !isAbsRow && activeCell ? activeCell.r1 + 1 + r + "" : r + "";
			}
			return row;
		};

		if(r !== null && c !== null) {
			if(isNaN(r)) {
				r = 0;
				isAbsRow = false;
			}
			if(isNaN(c)) {
				c = 0;
				isAbsCol = false;
			}

			colStr = getColStr();
			rowStr = getRowStr();


			if(isAbsCol) {
				colStr = "$" + colStr;
			}
			if(isAbsRow) {
				rowStr = "$" + rowStr;
			}
			res = colStr + rowStr;
		} else if(c !== null) {
			if(isNaN(c)) {
				c = 0;
				isAbsCol = false;
			}

			//colStr = g_oCellAddressUtils.colnumToColstrFromWsView(!isAbsCol && activeCell ? activeCell.c1 + 1 + c : c);
			colStr = getColStr();

			if(isAbsCol) {
				colStr = "$" + colStr;
			}
			res = colStr;
		} else if(r !== null) {
			if(isNaN(r)) {
				r = 0;
				isAbsRow = false;
			}

			//rowStr = !isAbsRow && activeCell ? activeCell.r1 + 1 + r + "" : r + "";
			rowStr = getRowStr();

			if(isAbsRow) {
				rowStr = "$" + rowStr;
			}
			res = rowStr;
		}
		return res;
	};
	parserHelper.prototype.isArea = function (formula, start_pos)
	{
		if (this instanceof parserHelper)
		{
			this._reset();
		}

		var checkAbs = function(val1, val2) {
			var res = null;
			if(val1 === val2 && val1 === undefined) {
				res = true;
			} else if(val1 === "[" && val2 === "]") {
				res = false;
			}
			return res;
		};

		var checkMatchRowCol = function(tempMatch) {
			var res = true;

			if(tempMatch[9] !== "" && tempMatch[9] !== undefined && !(tempMatch[6] === ":" && tempMatch[7] !== "" && tempMatch[7] !== undefined)) {
				res = false;
			} else if(tempMatch[7] !== "" && tempMatch[7] !== undefined && tempMatch[6] !== ":") {
				res = false;
			} else if((tempMatch[7] === "" || tempMatch[7] === undefined) && tempMatch[6] === ":") {
				res = false;
			}

			return res;
		};

		var R1C1Mode = AscCommonExcel.g_R1C1Mode;
		var subSTR = formula.substring(start_pos);

		var match;
		if(!R1C1Mode) {
			match = subSTR.match(rgRange) || subSTR.match(rgCols) || subSTR.match(rgRows);
			if (match != null)
			{
				var m0 = match[1].split(":");
				if (g_oCellAddressUtils.getCellAddress(m0[0]).isValid() && g_oCellAddressUtils.getCellAddress(m0[1]).isValid())
				{
					this.pCurrPos += match[1].length;
					this.operand_str = match[1];
					return true;
				}
			}
		} else {
			var abs1Val, abs2Val, abs3Val, abs4Val, ref1, ref2;
			if((match = subSTR.match(rgRangeR1C1)) !== null) {
				abs1Val = checkAbs(match[3], match[5]);
				abs2Val = checkAbs(match[7], match[9]);
				abs3Val = checkAbs(match[11], match[13]);
				abs4Val = checkAbs(match[15], match[17]);
				if(abs1Val !== null && abs2Val !== null && abs3Val !== null && abs4Val !== null) {
					ref1 = AscCommon.parserHelp.convertFromR1C1(parseInt(match[4]), parseInt(match[8]), abs1Val, abs2Val);
					ref2 = AscCommon.parserHelp.convertFromR1C1(parseInt(match[12]), parseInt(match[16]), abs3Val, abs4Val);
					if (g_oCellAddressUtils.getCellAddress(ref1).isValid() && g_oCellAddressUtils.getCellAddress(ref2).isValid()) {
						this.pCurrPos += match[1].length;
						this.operand_str = match[1];
						this.real_str = ref1 + ":" + ref2;

						return true;
					}
				}
			} else if(null != (match = subSTR.match(rgColsR1C1))) {
				if(checkMatchRowCol(match)) {
					abs1Val = checkAbs(match[3], match[5]);
					abs2Val = checkAbs(match[8], match[10]);
					if(abs1Val !== null && abs2Val !== null) {

						ref1 = AscCommon.parserHelp.convertFromR1C1(null, parseInt(match[4]), null, abs1Val);
						ref2 = "" !== match[7] ? AscCommon.parserHelp.convertFromR1C1(null, parseInt(match[9]), null, abs2Val) : ref1;
						if (g_oCellAddressUtils.getCellAddress(ref1).isValid() && g_oCellAddressUtils.getCellAddress(ref2).isValid()) {
							this.pCurrPos += match[1].length;
							this.operand_str = match[1];
							this.real_str = ref1 + ":" + ref2;

							return true;
						}
					}
				}
			} else if(null != (match = subSTR.match(rgRowsR1C1))) {
				if(checkMatchRowCol(match)) {
					abs1Val = checkAbs(match[3], match[5]);
					abs2Val = checkAbs(match[8], match[10]);
					if(abs1Val !== null && abs2Val !== null) {

						ref1 = AscCommon.parserHelp.convertFromR1C1(parseInt(match[4]), null, abs1Val);
						ref2 = "" !== match[7] ? AscCommon.parserHelp.convertFromR1C1(parseInt(match[9]), null, abs2Val) : ref1;
						if (g_oCellAddressUtils.getCellAddress(ref1).isValid() && g_oCellAddressUtils.getCellAddress(ref2).isValid()) {
							this.pCurrPos += match[1].length;
							this.operand_str = match[1];
							this.real_str = ref1 + ":" + ref2;

							return true;
						}
					}
				}
			}
		}
		return false;
	};
	parserHelper.prototype.isRef = function (formula, start_pos, allRef)
	{
		if (this instanceof parserHelper)
		{
			this._reset();
		}

		var R1C1Mode = AscCommonExcel.g_R1C1Mode;
		var substr = formula.substring(start_pos), match;
		var m0, m1;
		if(!R1C1Mode) {
			match = substr.match(rx_ref);
			if (match != null)
			{
				m0 = match[0];
				m1 = match[1];
				if (g_oCellAddressUtils.getCellAddress(m1).isValid())
				{
					this.pCurrPos += m0.indexOf(" ") > -1 ? m0.length - 1 : m1.length;
					this.operand_str = m1;
					return true;
				}
				else if (allRef)
				{
					match = substr.match(rx_refAll);
					if ((match != null || match != undefined) && match.length >= 3)
					{
						m1 = match[1];
						this.pCurrPos += m1.length;
						this.operand_str = m1;
						return true;
					}
				}
			}
		} else {
			match = substr.match(rx_refR1C1);

			if (match != null && (match[3] === match[5] || (match[3] === "[" && match[5] === "]")) && (match[7] === match[9] || (match[7] === "[" && match[9] === "]"))) {
				m0 = match[0];
				m1 = match[1];
				var ref = AscCommon.parserHelp.convertFromR1C1(parseInt(match[4]), parseInt(match[8]), !match[3], !match[7]);
				if (g_oCellAddressUtils.getCellAddress(ref).isValid()) {
					this.pCurrPos += m0.indexOf(" ") > -1 ? m0.length - 1 : m1.length;
					this.operand_str = m1;
					this.real_str = ref;

					return true;
				}
			}
		}

		return false;
	};
	parserHelper.prototype.is3DRef = function (formula, start_pos, support_digital_start)
	{
		if (this instanceof parserHelper)
		{
			this._reset();
		}

		var subSTR = formula.substring(start_pos),
			match  = XRegExp.exec(subSTR, rx_ref3D_quoted) || XRegExp.exec(subSTR, rx_ref3D_non_quoted);
		if(!match && support_digital_start) {
			match = XRegExp.exec(subSTR, rx_ref3D_non_quoted_2);
		}

		if (match != null)
		{
			this.pCurrPos += match[0].length;
			this.operand_str = match[1];
			return [true, match["name_from"] ? match["name_from"].replace(/''/g, "'") : null, match["name_to"] ? match["name_to"].replace(/''/g, "'") : null];
		}
		return [false, null, null];
	};
	parserHelper.prototype.isNextPtg = function (formula, start_pos, digitDelim)
	{
		if (this instanceof parserHelper)
		{
			this._reset();
		}

		var subSTR = formula.substring(start_pos), match;
		if (subSTR.match(rx_RightParentheses) == null && subSTR.match(digitDelim ? rx_Comma : rx_CommaDef) == null &&
			subSTR.match(rx_operators) == null && (match = subSTR.match(rx_intersect)) != null)
		{
			this.pCurrPos += match[0].length;
			this.operand_str = match[0][0];
			return true;
		}
		return false;
	};
	parserHelper.prototype.isNumber = function (formula, start_pos, digitDelim)
	{
		if (this instanceof parserHelper)
		{
			this._reset();
		}

		var match = (formula.substring(start_pos)).match(digitDelim ? rx_number : rx_numberDef);
		if (match != null)
		{
			this.operand_str = match[0].replace(FormulaSeparators.digitSeparator, FormulaSeparators.digitSeparatorDef);
			this.pCurrPos += match[0].length;

			return true;
		}
		return false;
	};
	parserHelper.prototype.isLeftParentheses = function (formula, start_pos)
	{
		if (this instanceof parserHelper)
		{
			this._reset();
		}

		var code, find = false, length = formula.length;
		while (start_pos !== length)
		{
			code = formula.charCodeAt(start_pos);
			if (code === g_oCodeLeftParentheses)
			{
				this.operand_str = formula[start_pos];
				++start_pos;
				find = true;
				break;
			}
			else if (code === g_oCodeSpace)
			{
				++start_pos;
			}
			else
			{
				break;
			}
		}

		if (find)
		{
			while (start_pos !== length)
			{
				code = formula.charCodeAt(start_pos);
				if (code !== g_oCodeSpace)
				{
					break;
				}
				++start_pos;
			}
			this.pCurrPos = start_pos;
			return true;
		}
		return false;
	};
	parserHelper.prototype.isRightParentheses = function (formula, start_pos)
	{
		if (this instanceof parserHelper)
		{
			this._reset();
		}

		var code, find = false, length = formula.length;
		while (start_pos !== length)
		{
			code = formula.charCodeAt(start_pos);
			if (code === g_oCodeRightParentheses)
			{
				this.operand_str = formula[start_pos];
				++start_pos;
				find = true;
				break;
			}
			else if (code === g_oCodeSpace)
			{
				++start_pos;
			}
			else
			{
				break;
			}
		}

		if (find)
		{
			while (start_pos !== length)
			{
				code = formula.charCodeAt(start_pos);
				if (code !== g_oCodeSpace)
				{
					break;
				}
				++start_pos;
			}
			this.pCurrPos = start_pos;
			return true;
		}
	};
	parserHelper.prototype.isComma = function (formula, start_pos, digitDelim)
	{
		if (this instanceof parserHelper)
		{
			this._reset();
		}

		var match = (formula.substring(start_pos)).match(digitDelim ? rx_Comma : rx_CommaDef);
		if (match != null)
		{
			this.operand_str = match[0];
			this.pCurrPos += match[0].length;

			return true;
		}
		return false;
	};
	parserHelper.prototype.isArraySeparator = function (formula, start_pos, digitDelim)
	{
		if (this instanceof parserHelper)
		{
			this._reset();
		}

		var match = (formula.substring(start_pos)).match(digitDelim ? rx_arraySeparators : rx_arraySeparatorsDef);
		if (match != null)
		{
			this.operand_str = match[0];
			this.pCurrPos += match[0].length;

			return true;
		}
		return false;
	};
	parserHelper.prototype.isError = function (formula, start_pos, local)
	{
		if (this instanceof parserHelper)
		{
			this._reset();
		}

		var match = (formula.substring(start_pos)).match(local ? rx_error_local : rx_error);
		if (match != null)
		{
			this.operand_str = match[0];
			this.pCurrPos += match[0].length;
			return true;
		}
		return false;
	};
	parserHelper.prototype.isBoolean = function (formula, start_pos, local)
	{
		if (this instanceof parserHelper)
		{
			this._reset();
		}

		var match = (formula.substring(start_pos)).match(local ? rx_bool_local : rx_bool);
		if (match != null)
		{
			this.operand_str = match[1];
			this.pCurrPos += match[1].length;
			return true;
		}
		return false;
	};
	parserHelper.prototype.isString = function (formula, start_pos)
	{
		if (this instanceof parserHelper)
		{
			this._reset();
		}

		var match = (formula.substring(start_pos)).match(rx_string);
		if (match != null)
		{
			this.operand_str = match[1];
			this.pCurrPos += match[0].length;
			return true;
		}
		return false;
	};
	parserHelper.prototype.isName = function (formula, start_pos)
	{
		if (this instanceof parserHelper)
		{
			this._reset();
		}

		var subSTR = formula.substring(start_pos),
			match  = XRegExp.exec(subSTR, rx_name);

		if (match != null)
		{
			var name = match["name"];
			if (name && 0 !== name.length && name.toUpperCase() !== cBoolLocal.t && name.toUpperCase() !== cBoolLocal.f)
			{
				this.pCurrPos += name.length;
				this.operand_str = name;
				return true;
			}
			this.operand_str = name;
		}
		return false;
	};
	parserHelper.prototype.isName3D = function (formula, start_pos)
	{
		if (this instanceof parserHelper)
		{
			this._reset();
		}

		var _is3DRef = this.is3DRef(formula, start_pos);
		if(_is3DRef && _is3DRef[0] && _is3DRef[1] && _is3DRef[1].length)
		{
			var _startPos = this.pCurrPos;
			var _isArea = this.isArea(formula, _startPos);
			var _isRef = !_isArea && this.isRef(formula, _startPos);
			return !_isRef && !_isArea && this.isName(formula, _startPos);
		}

		return false;
	};
	parserHelper.prototype.isLeftBrace = function (formula, start_pos)
	{
		if (this instanceof parserHelper)
		{
			this._reset();
		}

		var code, find = false, length = formula.length;
		while (start_pos !== length)
		{
			code = formula.charCodeAt(start_pos);
			if (code === g_oCodeLeftBrace)
			{
				this.operand_str = formula[start_pos];
				++start_pos;
				find = true;
				break;
			}
			else if (code === g_oCodeSpace)
			{
				++start_pos;
			}
			else
			{
				break;
			}
		}

		if (find)
		{
			while (start_pos !== length)
			{
				code = formula.charCodeAt(start_pos);
				if (code !== g_oCodeSpace)
				{
					break;
				}
				++start_pos;
			}
			this.pCurrPos = start_pos;
			return true;
		}
	};
	parserHelper.prototype.isRightBrace = function (formula, start_pos)
	{
		if (this instanceof parserHelper)
		{
			this._reset();
		}

		var code, find = false, length = formula.length;
		while (start_pos !== length)
		{
			code = formula.charCodeAt(start_pos);
			if (code === g_oCodeRightBrace)
			{
				this.operand_str = formula[start_pos];
				++start_pos;
				find = true;
				break;
			}
			else if (code === g_oCodeSpace)
			{
				++start_pos;
			}
			else
			{
				break;
			}
		}

		if (find)
		{
			while (start_pos !== length)
			{
				code = formula.charCodeAt(start_pos);
				if (code !== g_oCodeSpace)
				{
					break;
				}
				++start_pos;
			}
			this.pCurrPos = start_pos;
			return true;
		}
	};
	parserHelper.prototype.isTable = function (formula, start_pos, local)
	{
		if (this instanceof parserHelper)
		{
			this._reset();
		}

		var subSTR = formula.substring(start_pos),
			match  = XRegExp.exec(subSTR, local ? rx_table_local : rx_table);

		if (match != null && match["tableName"])
		{
			this.operand_str = match[0];
			this.pCurrPos += match[0].length;
			return match;
		}

		return false;
	};
// Парсим ссылку на диапазон в листе
	parserHelper.prototype.parse3DRef = function (formula)
	{
		// Сначала получаем лист
		var is3DRefResult = this.is3DRef(formula, 0);
		if (is3DRefResult && true === is3DRefResult[0])
		{
			// Имя листа в ссылке
			var sheetName = is3DRefResult[1];
			// Ищем начало range
			var indexStartRange = null !== this.pCurrPos ? this.pCurrPos : formula.indexOf("!") + 1;
			if (this.isArea(formula, indexStartRange) || this.isRef(formula, indexStartRange))
			{
				if (this.operand_str.length == formula.substring(indexStartRange).length)
					return {sheet: sheetName, sheet2: is3DRefResult[2], range: this.operand_str};
				else
					return null;
			}
		}
		// Возвращаем ошибку
		return null;
	};
// Возвращает ссылку на диапазон с листом (название листа экранируется)
	parserHelper.prototype.get3DRef = function (sheet, range)
	{
		sheet = sheet.split(":");
		var wsFrom = sheet[0],
			wsTo   = sheet[1] === undefined ? wsFrom : sheet[1];
		if (rx_test_ws_name.test(wsFrom) && rx_test_ws_name.test(wsTo))
		{
			return (wsFrom !== wsTo ? wsFrom + ":" + wsTo : wsFrom) + "!" + range;
		}
		else
		{
			wsFrom = wsFrom.replace(/'/g, "''");
			wsTo = wsTo.replace(/'/g, "''");
			return "'" + (wsFrom !== wsTo ? wsFrom + ":" + wsTo : wsFrom) + "'!" + range;
		}
	};
// Возвращает экранируемое название листа
	parserHelper.prototype.getEscapeSheetName = function (sheet)
	{
		return rx_test_ws_name.test(sheet) ? sheet : "'" + sheet.replace(/'/g, "''") + "'";
	};
	/**
	 * Проверяем ссылку на валидность для диаграммы или автофильтра
	 * @param {AscCommonExcel.Workbook} model
	 * @param {AscCommonExcel.WorkbookView} wb
	 * @param {Asc.c_oAscSelectionDialogType} dialogType
	 * @param {string} dataRange
	 * @param {boolean} fullCheck
	 * @param {boolean} isRows
	 * @param {Asc.c_oAscChartTypeSettings} chartType
	 * @returns {*}
	 */
	parserHelper.prototype.checkDataRange = function (model, wb, dialogType, dataRange, fullCheck, isRows, subType)
	{
		var result, range, sheetModel, checkChangeRange;
		if (Asc.c_oAscSelectionDialogType.Chart === dialogType)
		{
			if(dataRange)
			{
				if(Asc.c_oAscError.ID.No === AscFormat.isValidChartRange(dataRange))
				{
					range = AscFormat.fParseChartFormulaExternal(dataRange);
				}
			}
		}
		else if(Asc.c_oAscSelectionDialogType.PivotTableData === dialogType || Asc.c_oAscSelectionDialogType.PivotTableReport === dialogType)
		{
			result = parserHelp.parse3DRef(dataRange);
			if (result)
			{
				sheetModel = model.getWorksheetByName(result.sheet);
				if (sheetModel)
				{
					range = AscCommonExcel.g_oRangeCache.getAscRange(result.range);
				}
			} else if (Asc.c_oAscSelectionDialogType.PivotTableReport === dialogType) {
				range = AscCommonExcel.g_oRangeCache.getAscRange(dataRange);
			}
			if (!range) {
				range = AscCommon.rx_defName.test(dataRange);
			}
			if (!range) {
				range = parserHelp.isTable(dataRange, 0, true);
			}
		}
		else if(Asc.c_oAscSelectionDialogType.PrintTitles === dialogType)
		{
			if(dataRange === "")
			{
				return Asc.c_oAscError.ID.No;
			}
			else
			{
				range = AscCommonExcel.g_oRangeCache.getAscRange(dataRange);
			}
		}
		else if (Asc.c_oAscSelectionDialogType.DataValidation === dialogType)
		{
			if (dataRange === null || dataRange === "") {
				return Asc.c_oAscError.ID.DataValidateMustEnterValue;
			} else if (typeof dataRange === "string") {
				result = parserHelp.parse3DRef(dataRange);
				if (result)
				{
					sheetModel = model.getWorksheetByName(result.sheet);
					if (sheetModel)
					{
						range = AscCommonExcel.g_oRangeCache.getAscRange(result.range);
					}
				}
			}
		}
		else
		{
			range = AscCommonExcel.g_oRangeCache.getAscRange(dataRange);
		}

		if (!range && Asc.c_oAscSelectionDialogType.DataValidation !== dialogType && Asc.c_oAscSelectionDialogType.ConditionalFormattingRule !== dialogType)
		{
			return Asc.c_oAscError.ID.DataRangeError;
		}

		if (fullCheck)
		{
			if (Asc.c_oAscSelectionDialogType.Chart === dialogType)
			{
				var oDataRefs = new AscFormat.CChartDataRefs(null);
				return oDataRefs.checkDataRange(dataRange, isRows, subType);
			}
			else if (Asc.c_oAscSelectionDialogType.FormatTable === dialogType)
			{
				// ToDo убрать эту проверку, заменить на более грамотную после правки функции _searchFilters
				if (true === wb.getWorksheet().model.autoFilters.isRangeIntersectionTableOrFilter(range)) {
					return Asc.c_oAscError.ID.AutoFilterDataRangeError;
				} else if (wb.getWorksheet().intersectionFormulaArray(range, true, true)) {
					return Asc.c_oAscError.ID.MultiCellsInTablesFormulaArray;
				} else if (range && Asc.c_oAscSelectionType.RangeCells !== range.getType()) {
					return Asc.c_oAscError.ID.LargeRangeWarning;
				}
			}
			else if (Asc.c_oAscSelectionDialogType.FormatTableChangeRange === dialogType)
			{
				// ToDo убрать эту проверку, заменить на более грамотную после правки функции _searchFilters
				checkChangeRange = wb.getWorksheet().af_checkChangeRange(range);
				if (null !== checkChangeRange)
					return checkChangeRange;
			}
			else if(Asc.c_oAscSelectionDialogType.CustomSort === dialogType)
			{
				checkChangeRange = wb.getWorksheet().checkCustomSortRange(range, isRows);
				if (null !== checkChangeRange)
					return checkChangeRange;
			}
			else if (Asc.c_oAscSelectionDialogType.PivotTableData === dialogType)
			{
				if (!Asc.CT_pivotTableDefinition.prototype.isValidDataRef(dataRange)) {
					return c_oAscError.ID.PivotLabledColumns;
				}
			}
			else if (Asc.c_oAscSelectionDialogType.PivotTableReport === dialogType)
			{
				var location = Asc.CT_pivotTableDefinition.prototype.parseDataRef(dataRange);
				if (location) {
					sheetModel = location.ws;
					if (!sheetModel) {
						sheetModel = model.getActiveWs();
					}
					var newRange = new Asc.Range(location.bbox.c1, location.bbox.r1, location.bbox.c1 + AscCommonExcel.NEW_PIVOT_LAST_COL_OFFSET, location.bbox.r1 + AscCommonExcel.NEW_PIVOT_LAST_ROW_OFFSET);
					return sheetModel.checkPivotReportLocationForError([newRange]);
				} else {
					return Asc.c_oAscError.ID.DataRangeError;
				}
			}
			else if (Asc.c_oAscSelectionDialogType.DataValidation === dialogType)
			{
				var dataValidaionTest = AscCommonExcel.CDataValidation.prototype.isValidDataRef(model.getActiveWs(), dataRange, subType);
				if (null !== dataValidaionTest)
				{
					return dataValidaionTest;
				}
			}
			else if (Asc.c_oAscSelectionDialogType.ConditionalFormattingRule === dialogType)
			{
				if (dataRange === null || dataRange === "")
				{
					return Asc.c_oAscError.ID.DataRangeError;
				}
				else
				{
					if (dataRange[0] === "=") {
						dataRange = dataRange.slice(1);
					}
					if (!parserHelp.isArea(dataRange) && !parserHelp.isRef(dataRange) && !parserHelp.isTable(dataRange))
					{
						return Asc.c_oAscError.ID.DataRangeError;
					}
				}
			}
		}
		return Asc.c_oAscError.ID.No;
	};
	parserHelper.prototype.setDigitSeparator = function (sep)
	{
		if (sep != FormulaSeparators.digitSeparatorDef)
		{
			FormulaSeparators.digitSeparator = sep;
			FormulaSeparators.arrayRowSeparator = ";";
			FormulaSeparators.arrayColSeparator = "\\";
			FormulaSeparators.functionArgumentSeparator = ";";
			rx_number = new RegExp("^ *[+-]?\\d*(\\d|\\" + FormulaSeparators.digitSeparator + ")\\d*([eE][+-]?\\d+)?");
			rx_Comma = new RegExp("^ *[" + FormulaSeparators.functionArgumentSeparator + "] *");
			rx_arraySeparators = new RegExp("^ *[" + FormulaSeparators.arrayRowSeparator + "\\" + FormulaSeparators.arrayColSeparator + "] *");
		}
		else
		{
			FormulaSeparators.arrayRowSeparator = FormulaSeparators.arrayRowSeparatorDef;
			FormulaSeparators.arrayColSeparator = FormulaSeparators.arrayColSeparatorDef;
			FormulaSeparators.digitSeparator = FormulaSeparators.digitSeparatorDef;
			FormulaSeparators.functionArgumentSeparator = FormulaSeparators.functionArgumentSeparatorDef;
			rx_number = new RegExp("^ *[+-]?\\d*(\\d|\\" + FormulaSeparators.digitSeparatorDef + ")\\d*([eE][+-]?\\d+)?");
			rx_Comma = new RegExp("^ *[" + FormulaSeparators.functionArgumentSeparatorDef + "] *");
			rx_arraySeparators = new RegExp("^ *[" + FormulaSeparators.arrayRowSeparatorDef + "\\" + FormulaSeparators.arrayColSeparatorDef + "] *");
		}
		rx_table_local = build_rx_table_cur();
	};
	parserHelper.prototype.getColumnTypeByName = function (value)
	{
		var res;
		switch (value.toLowerCase())
		{
			case "#" + cStrucTableLocalColumns['a'].toLocaleLowerCase():
			case cStrucTableReservedWords.all.toLocaleLowerCase():
				res = FormulaTablePartInfo.all;
				break;
			case "#" + cStrucTableLocalColumns['d'].toLocaleLowerCase():
			case cStrucTableReservedWords.data.toLocaleLowerCase():
				res = FormulaTablePartInfo.data;
				break;
			case "#" + cStrucTableLocalColumns['h'].toLocaleLowerCase():
			case cStrucTableReservedWords.headers.toLocaleLowerCase():
				res = FormulaTablePartInfo.headers;
				break;
			case "#" + cStrucTableLocalColumns['t'].toLocaleLowerCase():
			case cStrucTableReservedWords.totals.toLocaleLowerCase():
				res = FormulaTablePartInfo.totals;
				break;
			case "#" + cStrucTableLocalColumns['tr'].toLocaleLowerCase():
			case cStrucTableReservedWords.at.toLocaleLowerCase():
			case cStrucTableReservedWords.thisrow.toLocaleLowerCase():
				res = FormulaTablePartInfo.thisRow;
				break;
			default:
				res = FormulaTablePartInfo.data;
				break;
		}
		return res;
	};
	parserHelper.prototype.getColumnNameByType = function (value, local)
	{
		switch (value)
		{
			case FormulaTablePartInfo.all:
			{
				if (local)
				{
					return "#" + cStrucTableLocalColumns['a'];
				}
				return cStrucTableReservedWords.all;
			}
			case FormulaTablePartInfo.data:
			{
				if (local)
				{
					return "#" + cStrucTableLocalColumns['d'];
				}
				return cStrucTableReservedWords.data;
			}
			case FormulaTablePartInfo.headers:
			{
				if (local)
				{
					return "#" + cStrucTableLocalColumns['h'];
				}
				return cStrucTableReservedWords.headers;
			}
			case FormulaTablePartInfo.totals:
			{
				if (local)
				{
					return "#" + cStrucTableLocalColumns['t'];
				}
				return cStrucTableReservedWords.totals;
			}
			case FormulaTablePartInfo.thisRow:
			{
				if (local)
				{
					return "#" + cStrucTableLocalColumns['tr'];
				}
				return cStrucTableReservedWords.thisrow;
			}
		}
		return null;
	};

	var parserHelp = new parserHelper();

	var g_oHtmlCursor = new CHTMLCursor();
	var kCurFormatPainterWord = 'de-formatpainter';
	g_oHtmlCursor.register(kCurFormatPainterWord, "text_copy", "2 11", "pointer");

	function asc_ajax(obj)
	{
		var url                                       = "", type                            = "GET",
			async                                     = true, data                        = null, dataType,
			error = null, success = null, httpRequest = null,
			contentType                               = "application/x-www-form-urlencoded",
			responseType = '',
			headers = null,

			init                                      = function (obj)
			{
				if (typeof obj.url !== 'undefined')
				{
					url = obj.url;
				}
				if (typeof obj.type !== 'undefined')
				{
					type = obj.type;
				}
				if (typeof obj.async !== 'undefined')
				{
					async = obj.async;
				}
				if (typeof obj.data !== 'undefined')
				{
					data = obj.data;
				}
				if (typeof obj.dataType !== 'undefined')
				{
					dataType = obj.dataType;
				}
				if (typeof obj.error !== 'undefined')
				{
					error = obj.error;
				}
				if (typeof obj.success !== 'undefined')
				{
					success = obj.success;
				}
				if (typeof (obj.contentType) !== 'undefined')
				{
					contentType = obj.contentType;
				}
				if (typeof (obj.responseType) !== 'undefined')
				{
					responseType = obj.responseType;
				}
				if (typeof (obj.headers) !== 'undefined')
				{
					headers = obj.headers;
				}

				if (window.XMLHttpRequest)
				{ // Mozilla, Safari, ...
					httpRequest = new XMLHttpRequest();
					if (httpRequest.overrideMimeType && dataType)
					{
						httpRequest.overrideMimeType(dataType);
					}
				}
				else if (window.ActiveXObject)
				{ // IE
					try
					{
						httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
					}
					catch (e)
					{
						try
						{
							httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
						}
						catch (e)
						{
						}
					}
				}

				httpRequest.onreadystatechange = function ()
				{
					respons(this);
				};
				send();
			},

			send                                      = function ()
			{
				httpRequest.open(type, url, async);
				if (type === "POST")
					httpRequest.setRequestHeader("Content-Type", contentType);
				if (headers) {
					for (var header in headers) {
						if (headers.hasOwnProperty(header)) {
							httpRequest.setRequestHeader(header, headers[header]);
						}
					}
				}
				if (responseType)
					httpRequest.responseType = responseType;
				httpRequest.send(data);
			},

			respons                                   = function (httpRequest)
			{
				switch (httpRequest.readyState)
				{
					case 0:
						// The object has been created, but not initialized (the open method has not been called).
						break;
					case 1:
						// A request has been opened, but the send method has not been called.
						break;
					case 2:
						// The send method has been called. No data is available yet.
						break;
					case 3:
						// Some data has been received; however, neither responseText nor responseBody is available.
						break;
					case 4:
						if (httpRequest.status === 200 || httpRequest.status === 1223)
						{
							if (typeof success === "function")
								success(httpRequest);
						}
						else
						{
							if (typeof error === "function")
								error(httpRequest, httpRequest.statusText, httpRequest.status);
						}
						break;
				}
			};

		init(obj);
	}


	function CIdCounter()
	{
		this.m_sUserId = null;
		this.m_bLoad = true;
		this.m_bRead = false;
		this.m_nIdCounterLoad = 0; // Счетчик Id для загрузки
		this.m_nIdCounterEdit = 0; // Счетчик Id для работы
	}

	CIdCounter.prototype.Get_NewId = function ()
	{
		if (true === this.m_bLoad || null === this.m_sUserId)
		{
			this.m_nIdCounterLoad++;
			return ("" + this.m_nIdCounterLoad);
		}
		else
		{
			this.m_nIdCounterEdit++;
			return ("" + this.m_sUserId + "_" + this.m_nIdCounterEdit);
		}
	};
	CIdCounter.prototype.Set_UserId = function (sUserId)
	{
		this.m_sUserId = sUserId;
	};
	CIdCounter.prototype.Set_Load = function (bValue)
	{
		this.m_bLoad = bValue;
	};
	CIdCounter.prototype.Clear = function ()
	{
		this.m_sUserId = null;
		this.m_bLoad = true;
		this.m_nIdCounterLoad = 0; // Счетчик Id для загрузки
		this.m_nIdCounterEdit = 0; // Счетчик Id для работы
	};

	function CLock()
	{
		this.Type = locktype_None;
		this.UserId = null;
	}

	CLock.prototype.Get_Type = function ()
	{
		return this.Type;
	};
	CLock.prototype.Set_Type = function (NewType, Redraw)
	{
		if (NewType === locktype_None)
			this.UserId = null;

		this.Type = NewType;

		var oApi = editor;
		var oLogicDocument = oApi.WordControl.m_oLogicDocument;
		if (false != Redraw && oLogicDocument)
		{
			// TODO: переделать перерисовку тут
			var oDrawingDocument = oLogicDocument.DrawingDocument;
			oDrawingDocument.ClearCachePages();
			oDrawingDocument.FirePaint();

			if(oApi.editorId === AscCommon.c_oEditorId.Presentation)
			{
				var oCurSlide = oLogicDocument.Slides[oLogicDocument.CurPage];
				if(oCurSlide && oCurSlide.notesShape && oCurSlide.notesShape.Lock === this)
				{
                    oDrawingDocument.Notes_OnRecalculate(oLogicDocument.CurPage, oCurSlide.NotesWidth, oCurSlide.getNotesHeight());
				}
			}
			// TODO: Обновлять интерфейс нужно, потому что мы можем стоять изначально в незалоченном объекте, а тут он
			//       может быть залочен.
			var oRevisionsStack = oApi.asc_GetRevisionsChangesStack();
			var arrParagraphs = [];
			for (var nIndex = 0, nCount = oRevisionsStack.length; nIndex < nCount; ++nIndex)
			{
				arrParagraphs.push(oRevisionsStack[nIndex].get_Paragraph())
			}

			var bNeedUpdate = false;
			for (var nIndex = 0, nCount = arrParagraphs.length; nIndex < nCount; ++nIndex)
			{
				if (arrParagraphs[nIndex].GetLock() === this)
				{
					bNeedUpdate = true;
					break;
				}
			}

			if (bNeedUpdate)
			{
				oLogicDocument.TrackRevisionsManager.ClearSelectedChanges();
				oLogicDocument.Document_UpdateInterfaceState(false);
			}
		}
	};
	CLock.prototype.Check = function (Id)
	{
		if (this.Type === locktype_Mine)
			AscCommon.CollaborativeEditing.Add_CheckLock(false);
		else if (this.Type === locktype_Other || this.Type === locktype_Other2 || this.Type === locktype_Other3)
			AscCommon.CollaborativeEditing.Add_CheckLock(true);
		else
			AscCommon.CollaborativeEditing.Add_CheckLock(Id);
	};
	CLock.prototype.Lock = function (bMine)
	{
		if (locktype_None === this.Type)
		{
			if (true === bMine)
				this.Type = locktype_Mine;
			else
				true.Type = locktype_Other;
		}
	};
	CLock.prototype.Is_Locked = function ()
	{
		if (locktype_None != this.Type && locktype_Mine != this.Type)
			return true;

		return false;
	};
	CLock.prototype.Set_UserId = function (UserId)
	{
		this.UserId = UserId;
	};
	CLock.prototype.Get_UserId = function ()
	{
		return this.UserId;
	};
	CLock.prototype.Have_Changes = function ()
	{
		if (locktype_Other2 === this.Type || locktype_Other3 === this.Type)
			return true;

		return false;
	};


	function CContentChanges()
	{
		this.m_aChanges = [];
	}

	CContentChanges.prototype.Add = function (Changes)
	{
		this.m_aChanges.push(Changes);
	};
	CContentChanges.prototype.RemoveByHistoryItem = function (Item)
	{
		for (var nIndex = 0, nCount = this.m_aChanges.length; nIndex < nCount; ++nIndex)
		{
			if (this.m_aChanges[nIndex].m_pData === Item)
			{
				this.m_aChanges.splice(nIndex, 1);
				return;
			}
		}
	};
	CContentChanges.prototype.Clear = function ()
	{
		this.m_aChanges.length = 0;
	};
	CContentChanges.prototype.Check = function (Type, Pos)
	{
		var CurPos = Pos;
		var Count = this.m_aChanges.length;
		for (var Index = 0; Index < Count; Index++)
		{
			var NewPos = this.m_aChanges[Index].Check_Changes(Type, CurPos);
			if (false === NewPos)
				return false;

			CurPos = NewPos;
		}

		return CurPos;
	};
	CContentChanges.prototype.Refresh = function ()
	{
		var Count = this.m_aChanges.length;
		for (var Index = 0; Index < Count; Index++)
		{
			this.m_aChanges[Index].Refresh_BinaryData();
		}
	};

	function CContentChangesElement(Type, Pos, Count, Data)
	{
		this.m_nType = Type;  // Тип изменений (удаление или добавление)
		this.m_nCount = Count; // Количество добавленных/удаленных элементов
		this.m_pData = Data;  // Связанные с данным изменением данные из истории

		// Разбиваем сложное действие на простейшие
		this.m_aPositions = this.Make_ArrayOfSimpleActions(Type, Pos, Count);
	}

	CContentChangesElement.prototype.Refresh_BinaryData = function ()
	{
		var Binary_Writer = AscCommon.History.BinaryWriter;
		var Binary_Pos = Binary_Writer.GetCurPosition();

		this.m_pData.Data.UseArray = true;
		this.m_pData.Data.PosArray = this.m_aPositions;

		Binary_Writer.WriteString2(this.m_pData.Class.Get_Id());
		Binary_Writer.WriteLong(this.m_pData.Data.Type);
		this.m_pData.Data.WriteToBinary(Binary_Writer);

		var Binary_Len = Binary_Writer.GetCurPosition() - Binary_Pos;

		this.m_pData.Binary.Pos = Binary_Pos;
		this.m_pData.Binary.Len = Binary_Len;
	};
	CContentChangesElement.prototype.Check_Changes = function (Type, Pos)
	{
		var CurPos = Pos;
		if (contentchanges_Add === Type)
		{
			for (var Index = 0; Index < this.m_nCount; Index++)
			{
				if (false !== this.m_aPositions[Index])
				{
					if (CurPos <= this.m_aPositions[Index])
						this.m_aPositions[Index]++;
					else
					{
						if (contentchanges_Add === this.m_nType)
							CurPos++;
						else //if ( contentchanges_Remove === this.m_nType )
							CurPos--;
					}
				}
			}
		}
		else //if ( contentchanges_Remove === Type )
		{
			for (var Index = 0; Index < this.m_nCount; Index++)
			{
				if (false !== this.m_aPositions[Index])
				{
					if (CurPos < this.m_aPositions[Index])
						this.m_aPositions[Index]--;
					else if (CurPos > this.m_aPositions[Index])
					{
						if (contentchanges_Add === this.m_nType)
							CurPos++;
						else //if ( contentchanges_Remove === this.m_nType )
							CurPos--;
					}
					else //if ( CurPos === this.m_aPositions[Index] )
					{
						if (AscCommon.contentchanges_Remove === this.m_nType)
						{
							// Отмечаем, что действия совпали
							this.m_aPositions[Index] = false;
							return false;
						}
						else
						{
							CurPos++;
						}
					}
				}
			}
		}

		return CurPos;
	};
	CContentChangesElement.prototype.Make_ArrayOfSimpleActions = function (Type, Pos, Count)
	{
		// Разбиваем действие на простейшие
		var Positions = [];
		if (contentchanges_Add === Type)
		{
			for (var Index = 0; Index < Count; Index++)
				Positions[Index] = Pos + Index;
		}
		else //if ( contentchanges_Remove === Type )
		{
			for (var Index = 0; Index < Count; Index++)
				Positions[Index] = Pos;
		}

		return Positions;
	};


	/**
	 * Корректируем заданное значение в миллиметрах к ближайшему целому значению в твипсах
	 * @param mm - заданное значение в миллиметрах
	 * @returns {number} - получаем новое значение в миллиметрах, являющееся целым значением в твипсах
	 */
	function CorrectMMToTwips(mm)
	{
		return (((mm * 20 * 72 / 25.4) + 0.5) | 0) * 25.4 / 20 / 72;
	}
	/**
	 * Получаем значение в миллиметрах заданного количества твипсов
	 * @param nTwips[=1] - значение в твипсах
	 * @returns {number}
	 */
	function TwipsToMM(nTwips)
	{
		return (null !== nTwips && undefined !== nTwips ? nTwips : 1) * 25.4 / 20 / 72;
	}

	/**
	 * Конвертируем миллиметры в ближайшее целое значение твипсов
	 * @param mm - значение в миллиметрах
	 * @returns {number}
	 */
	function MMToTwips(mm)
	{
		return (((mm * 20 * 72 / 25.4) + 0.5) | 0);
	}

	/**
	 * Конвертируем число из римской системы исчисления в обычное десятичное число
	 * @param sRoman {string}
	 * @returns {number}
	 */
	function RomanToInt(sRoman)
	{
		sRoman = sRoman.toUpperCase();
		if (sRoman < 1)
		{
			return 0;
		}
		else if (!/^M*(?:D?C{0,3}|C[MD])(?:L?X{0,3}|X[CL])(?:V?I{0,3}|I[XV])$/i.test(sRoman))
		{
			return NaN;
		}

		var chars  = {
			"M"  : 1000,
			"CM" : 900,
			"D"  : 500,
			"CD" : 400,
			"C"  : 100,
			"XC" : 90,
			"L"  : 50,
			"XL" : 40,
			"X"  : 10,
			"IX" : 9,
			"V"  : 5,
			"IV" : 4,
			"I"  : 1
		};
		var arabic = 0;
		sRoman.replace(/[MDLV]|C[MD]?|X[CL]?|I[XV]?/g, function(i)
		{
			arabic += chars[i];
		});

		return arabic;
	}

	/**
	 * Конвертируем нумерацию {a b ... z aa bb ... zz aaa bbb ... zzz ...} в число
	 * @param sLetters
	 */
	function LatinNumberingToInt(sLetters)
	{
		sLetters = sLetters.toUpperCase();

		if (sLetters.length <= 0)
			return NaN;

		var nLen = sLetters.length;

		var nFirstCharCode = sLetters.charCodeAt(0);
		if (65 > nFirstCharCode || nFirstCharCode > 90)
			return NaN;

		for (var nPos = 1; nPos < nLen; ++nPos)
		{
			if (sLetters.charCodeAt(nPos) !== nFirstCharCode)
				return NaN;
		}

		return (nFirstCharCode - 64) + 26 * (nLen - 1);
	}

	function repeatNumberingLvl(num, nLastTrueSymbol)
	{
		return ((num - 1) % nLastTrueSymbol) + 1;
	}

	function getAlphaBetForOrdinalText(language)
	{
		var alphaBet = {};
		switch (language)
		{
			case "bg-BG":
				alphaBet = {
					1:
						{
						'един': 'първият',
						'два': 'вторият',
						'три': 'третият',
						'четири': 'четвъртият',
						'пет': 'петият',
						'шест': 'шестият',
						'седем': 'седмият',
						'осем': 'осмият',
						'хиляди': 'хилядният'
					},
					100:
					{
						'сто': 'стотеният',
						'двеста': 'двестотеният',
						'триста': 'тристотеният',
						'четиристотин': 'четиристотеният',
						'петстотин': 'петстотеният',
						'шестстотин': 'шестстотеният',
						'седемстотин': 'седемстотеният',
						'осемстотин': 'осемстотеният',
						'деветстотин': 'деветстотеният'
					}
				};
				break;
			case "cs-CZ":
				alphaBet = {
					'jedna': 'první',
					'dva': 'druhý',
					'tři': 'třetí',
					'čtyři': 'čtvrtý',
					'pět': 'pátý',
					'šest': 'šestý',
					'sedm': 'sedmý',
					'osm': 'osmý',
					'devět': 'devátý',
					'deset': 'desátý',
					'jedenáct': 'jedenáctý',
					'dvanáct': 'dvanáctý',
					'třináct': 'třináctý',
					'čtrnáct': 'čtrnáctý',
					'patnáct': 'patnáctý',
					'šestnáct': 'šestnáctý',
					'sedmnáct': 'sedmnáctý',
					'osmnáct': 'osmnáctý',
					'devatenáct': 'devatenáctý',
					'dvacet': 'dvacátý',
					'třicet': 'třicátý',
					'čtyřicet': 'čtyřicátý',
					'padesát': 'padesátý',
					'šedesát': 'šedesátý',
					'sedmdesát': 'sedmdesátý',
					'osmdesát': 'osmdesátý',
					'devadesát': 'devadesátý',
					'sto': 'stý',
					'dvě stě': 'dvoustý',
					'tři sta': 'třístý',
					'čtyři sta': 'čtyřstý',
					'pět set': 'pětistý',
					'šest set': 'šestistý',
					'sedm set': 'sedmistý',
					'osm set': 'osmistý',
					'devět set': 'devítistý',
					'tisíc': 'tisící',
					'tisíce': 'tisící'
				};
				break;
			case "de-DE":
				alphaBet = {
					'eins': 'erste',
					'zwei': 'zweite',
					'drei': 'dritte',
					'vier': 'vierte',
					'fünf': 'fünfte',
					'sechs': 'sechste',
					'sieben': 'siebente',
					'acht': 'achte',
					'neun': 'neunte',
					'zehn': 'zehnte',
					'elf': 'elfte',
					'zwölf': 'zwölfte',
					'dreizehn': 'dreizehnte',
					'vierzehn': 'vierzehnte',
					'fünfzehn': 'fünfzehnte',
					'sechzehn': 'sechzehnte',
					'siebzehn': 'siebzehnte',
					'achtzehn': 'achtzehnte',
					'neunzehn': 'neunzehnte'
				};
				break;
			case "el-GR":
				alphaBet = {
					1: [
						'πρώτο',
						'δεύτερο',
						'τρίτο',
						'τετάρτο',
						'πέμπτο',
						'έκτο',
						'έβδομο',
						'όγδοο',
						'ένατο',
						'δέκατο',
						'ενδέκατο',
						'δωδέκατο',
						'δέκατο τρίτο',
						'δέκατο τέταρτο',
						'δέκατο πέμπτο',
						'δέκατο έκτο',
						'δέκατο έβδομο',
						'δέκατο όγδο',
						'δέκατο ένατο'
					],
					10: [
						'εικοστό',
						'τριακοστό',
						'τεσσερακοστό',
						'πεντηκοστό',
						'εξηκοστό',
						'εβδομηκοστό',
						'ογδοηκοστό',
						'ενενηκοστό'
					],
					100: [
						'εκατοστό',
						'διακοσιοστό',
						'τριακοσιοστό',
						'τετρακοσιοστό',
						'πεντακοσιοστό',
						'εξακοσιοστό',
						'επτακοσιοστό',
						'οκτακοσιοστό',
						'εννιακοσιοστό'
					],
					1000: [
						'',
						'δισ',
						'τρισ',
						'τετρακισ',
						'πεντακισ',
						'εξακισ',
						'επτακισ',
						'οκτακισ',
						'εννιακισ',
						'δεκακισ',
						'ενδεκακισ',
						'δωδεκακισ',
						'δεκατριακισ',
						'δεκατετρακισ',
						'δεκαπεντακισ',
						'δεκαεξακισ',
						'δεκαεπτακισ',
						'δεκαοκτακισ',
						'δεκαεννιακισ',
						'εικοσακισ'
					]
				};
				break;
			case "es-ES":
				alphaBet = {
					'uno': 'primero',
					'dos': 'segundo',
					'tres': 'tercero',
					'cuatro': 'cuarto',
					'cinco': 'quinto',
					'seis': 'sexto',
					'siete': 'séptimo',
					'ocho': 'octavo',
					'nueve': 'noveno',
					'diez': 'décimo',
					'once': 'undécimo',
					'doce': 'duodécimo',
					'trece': 'decimotercero',
					'catorce': 'decimocuarto',
					'quince': 'decimoquinto',
					'dieciséis': 'decimosexto',
					'diecisiete': 'decimoséptimo',
					'dieciocho': 'decimoctavo',
					'diecinueve': 'decimonoveno',
					'veint': 'vigésimo',
					'veinte': 'vigésimo',
					'veinti': 'vigésimo',
					'treinta': 'trigésimo',
					'cuarenta': 'cuadragésimo',
					'cincuenta': 'quincuagésimo',
					'sesenta': 'sexagésimo',
					'setenta': 'septuagésimo',
					'ochenta': 'octogésimo',
					'noventa': 'nonagésimo',
					'ciento': 'centésimo',
					'cien': 'cien',
					'doscientos': 'ducentésimo',
					'trescientos': 'tricentésimo',
					'cuatrocientos': 'cuadringentésimo',
					'quinientos': 'quingentésimo',
					'seiscientos': 'sexcentésimo',
					'setecientos': 'septingentésimo',
					'ochocientos': 'octingentésimo',
					'novecientos': 'noningentésimo',
					'mil': 'milésimo',
					'dós': 'segundo',
					'trés': 'tercero',
					'séis': 'sexto'
				};
				break;
			case "it-IT":
				alphaBet = {
					'uno': 'primo',
					'due': 'secondo',
					'tre': 'terzo',
					'quattro': 'quarto',
					'cinque': 'quinto',
					'sei': 'sesto',
					'sette': 'settimo',
					'otto': 'ottavo',
					'nove': 'nono',
					'dieci': 'decimo'
				};
				break;
			case "lv-LV":
				alphaBet = {
					'viens': 'pirmais',
					'divi': 'otrais',
					'trīs': 'trešais',
					'četri': 'ceturtais',
					'pieci': 'piektais',
					'seši': 'sestais',
					'septiņi': 'septītais',
					'astoņi': 'astotais',
					'deviņi': 'devītais'
				};
				break;
			case "nl-NL":
				alphaBet = {
					'één': 'eerste',
					'twee': 'tweede',
					'drie': 'derde',
					'vier': 'vierde',
					'vijf': 'vijfde',
					'zes': 'zesde',
					'zeven': 'zevende',
					'acht': 'achtste',
					'negen': 'negende',
					'tien': 'tiende'
				};
				break;
			case "pl-PL":
				alphaBet = {
					'tens':
					{
						'dwadzieścia': 'dwudziesty',
						'trzydzieści': 'trzydziesty',
						'czterdzieści': 'czterdziesty',
						'pięćdziesiąt': 'pięćdziesiąty',
						'sześćdziesiąt': 'sześćdziesiąty',
						'siedemdziesiąt': 'siedemdziesiąty',
						'osiemdziesiąt': 'osiemdziesiąty',
						'dziewięćdziesiąt': 'dziewięćdziesiąty'
					},
					'numbers':
					{
						'jeden': 'pierwszy',
						'dwa': 'drugi',
						'trzy': 'trzeci',
						'cztery': 'czwarty',
						'pięć': 'piąty',
						'sześć': 'szósty',
						'siedem': 'siódmy',
						'osiem': 'ósmy',
						'dziewięć': 'dziewiąty',
						'dziesięć': 'dziesiąty',
						'jedenaście': 'jedenasty',
						'dwanaście': 'dwunasty',
						'trzynaście': 'trzynasty',
						'czternaście': 'czternasty',
						'piętnaście': 'piętnasty',
						'szesnaście': 'szesnasty',
						'siedemnaście': 'siedemnasty',
						'osiemnaście': 'osiemnasty',
						'dziewiętnaście': 'dziewiętnasty',
						'dwadzieścia': 'dwudziesty',
						'trzydzieści': 'trzydziesty',
						'czterdzieści': 'czterdziesty',
						'pięćdziesiąt': 'pięćdziesiąty',
						'sześćdziesiąt': 'sześćdziesiąty',
						'siedemdziesiąt': 'siedemdziesiąty',
						'osiemdziesiąt': 'osiemdziesiąty',
						'dziewięćdziesiąt': 'dziewięćdziesiąty',
						'sto': 'setny',
						'dwieście': 'dwusetny',
						'trzysta': 'trzysetny',
						'czterysta': 'czterysetny',
						'pięćset': 'pięćsetny',
						'sześćset': 'sześćsetny',
						'siedemset': 'siedemsetny',
						'osiemset': 'osiemsetny',
						'dziewięćset': 'dziewięćsetny'

					},
					'thousand':
					{
						1:
						{
							'jeden': 'jedno',
							'dwa': 'dwu',
							'trzy': 'trzy',
							'cztery': 'cztero',
							'pięć': 'piącio',
							'sześć': 'szeącio',
							'siedem': 'siedmio',
							'osiem': 'óąmio',
							'dziewięć': 'dziewiącio',
							'dziesięć': 'dziesiącio',
							'jedenaście': 'jedenasto',
							'dwanaście': 'dwunasto',
							'trzynaście': 'trzynasto',
							'czternaście': 'czternasto',
							'piętnaście': 'piętnasto',
							'szesnaście': 'szesnasto',
							'siedemnaście': 'siedemnasto',
							'osiemnaście': 'osiemnastotysięczny',
							'dziewiętnaście': 'dziewiętnastotysięczny',
							'dwadzieścia': 'dwudziestotysięczny',
							'trzydzieści': 'trzydziestotysięczny',
							'czterdzieści': 'czterdziesto',
							'pięćdziesiąt': 'pięćdziesiącio',
							'sześćdziesiąt': 'sześćdziesiącio',
							'siedemdziesiąt': 'siedemdziesiącio',
							'osiemdziesiąt': 'osiemdziesiącio',
							'dziewięćdziesiąt': 'dziewięćdziesiącio'
						},
						100:
						{
							'sto': 'stu',
							'dwieście': 'dwustu',
							'trzysta': 'trzystu',
							'czterysta': 'czterystu',
							'pięćset': 'pięćset',
							'sześćset': 'szeuśćset',
							'siedemset': 'siedemset',
							'osiemset': 'osiemset',
							'dziewięćset': 'dziewięćset'
						}
					}
				};
				break;
			case "pt-BR":
			case "pt-PT":
				alphaBet = {
					'um': 'primeiro',
					'dois': 'segundo',
					'três': 'terceiro',
					'quatro': 'quarto',
					'cinco': 'quinto',
					'seis': 'sexto',
					'sete': 'sétimo',
					'oito': 'oitavo',
					'nove': 'nono',
					'dez': 'décimo',
					'onze': 'décimo primeiro',
					'doze': 'décimo segundo',
					'treze': 'décimo terceiro',
					'quartorze': 'décimo quarto',
					'quinze': 'décimo quinto',
					'dezesseis': 'décimo sexto',
					'dezessete': 'décimo sétimo',
					'dezoito': 'décimo oitavo',
					'dezenove': 'décimo nono',
					'vinte': 'vigésimo',
					'trinta': 'trigésimo',
					'quarenta': 'quadragésimo',
					'cinqüenta': 'qüinquagésimo',
					'sessenta': 'sexagésimo',
					'setenta': 'setuagésimo',
					'oitenta': 'octogésimo',
					'noventa': 'nonagésimo',
					'cem': 'centésimo',
					'cento': 'centésimo',
					'duzentos': 'ducentésimo',
					'trezentos': 'trecentésimo',
					'quatrocentos': 'quadringentésimo',
					'quinhentos': 'qüingentésimo',
					'seiscentos': 'seiscentésimo',
					'setecentos': 'setingentésimo',
					'oitocentos': 'octingentésimo',
					'novecentos': 'nongentésimo',
					'mil': 'milésimo'
				};
				break;
			case "ru-RU":
				alphaBet = {
					'numbers':
					{
						'один': 'первый',
						'два': 'второй',
						'три': 'третий',
						'четыре': 'четвертый',
						'пять': 'пятый',
						'шесть': 'шестой',
						'семь': 'седьмой',
						'восемь': 'восьмой',
						'девять': 'девятый',
						'десять': 'десятый',
						'одиннадцать': 'одиннадцатый',
						'двенадцать': 'двенадцатый',
						'тринадцать': 'тринадцатый',
						'четырнадцать': 'четырнадцатый',
						'пятнадцать': 'пятнадцатый',
						'шестнадцать': 'шестнадцатый',
						'семнадцать': 'семнадцатый',
						'восемнадцать': 'восемнадцатый',
						'девятнадцать': 'девятнадцатый',
						'двадцать': 'двадцатый',
						'тридцать': 'тридцатый',
						'сорок': 'сороковой',
						'пятьдесят': 'пятидесятый',
						'шестьдесят': 'шестидесятый',
						'семьдесят': 'семидесятый',
						'восемьдесят': 'восьмидесятый',
						'девяносто': 'девяностый',
						'сто': 'сотый',
						'двести': 'двухсотый',
						'триста': 'трехсотый',
						'четыреста': 'четырехсотый',
						'пятьсот': 'пятисотый',
						'шестьсот': 'шестисотый',
						'семьсот': 'семисотый',
						'восемьсот': 'восьмисотый',
						'девятьсот': 'девятисотый'
					},
					'thousand':
					{
						1:
						{
							'одна': '',
							'две': 'двух',
							'три': 'трех',
							'четыре': 'четырех',
							'пять': 'пяти',
							'шесть': 'шести',
							'семь': 'семи',
							'восемь': 'восьми',
							'девять': 'девяти',
							'десять': 'десяти',
							'одиннадцать': 'одиннадцати',
							'двенадцать': 'двенадцати',
							'тринадцать': 'тринадцати',
							'четырнадцать': 'четырнадцати',
							'пятнадцать': 'пятнадцати',
							'шестнадцать': 'шестнадцати',
							'семнадцать': 'семнадцати',
							'восемнадцать': 'восемнадцати',
							'девятнадцать': 'девятнадцати',
							'двадцать': 'двадцати',
							'тридцать': 'тридцати',
							'сорок': 'сорока',
							'пятьдесят': 'пятидесяти',
							'шестьдесят': 'шестидесяти',
							'семьдесят': 'семидесяти',
							'восемьдесят': 'восьмидесяти',
							'девяносто': 'девяносто'
						},
						100:
						{
							'сто': 'сто',
							'двести': 'двухсот',
							'триста': 'трехсот',
							'четыреста': 'четырехсот',
							'пятьсот': 'пятьсот',
							'шестьсот': 'шестьсот',
							'семьсот': 'семьсот',
							'восемьсот': 'восемьсот',
							'девятьсот': 'девятьсот'
						}
					},
					'thousandEntry': 'тысяч',
					'thousandType': 'тысячный'
				};
				break;
			case "sk-SK":
				alphaBet = {
					'jeden': 'prvý',
					'dva': 'druhý',
					'tri': 'tretí',
					'štyri': 'štvrtý',
					'päť': 'piaty',
					'šesť': 'šiesty',
					'sedem': 'siedmy',
					'osem': 'ôsmy',
					'deväť': 'deviaty',
					'desať': 'desiaty',
					'jedenásť': 'jedenásty',
					'dvanásť': 'dvanásty',
					'trinásť': 'trinásty',
					'štrnásť': 'štrnásty',
					'pätnásť': 'pätnásty',
					'šestnásť': 'šestnásty',
					'sedemnásť': 'sedemnásty',
					'osemnásť': 'osemnásty',
					'devätnásť': 'devätnásty',
					'dvadsať': 'dvadsiaty',
					'tridsať': 'tridsiaty',
					'štyridsať': 'štyridsiaty',
					'päťdesiat': 'päťdesiaty',
					'šesťdesiat': 'šesťdesiaty',
					'sedemdesiat': 'sedemdesiaty',
					'osemdesiat': 'osemdesiaty',
					'deväťdesiat': 'deväťdesiaty',
					'tisíc': 'tisíci',
					'sto': 'stý',
					100:
					{
						'dve': 'dvoj',
						'dva': 'dvoj',
						'tri': 'troj'
					},
					'other':
					{
						'dve': 'dvoj',
						'dva': 'dvoj',
						'tri': 'tretí',
						'štyri': 'štvrtý',
						'päť': 'piaty',
						'osem': 'ôsmy',
						'deväť': 'deviaty',
						'jedenásť': 'jedenásty',
						'dvanásť': 'dvanásty',
						'trinásť': 'trinásty',
						'štrnásť': 'štrnásty',
						'pätnásť': 'pätnásty',
						'šestnásť': 'šestnásty',
						'sedemnásť': 'sedemnásty',
						'osemnásť': 'osemnásty',
						'devätnásť': 'devätnásty',
						'tridsať': 'třicátý',
						'štyridsať': 'čtyřicátý',
						'šesťdesiat': 'šedesátý',
						'sedemdesiat': 'sedmdesátý',
						'osemdesiat': 'osmdesátý',
						'deväťdesiat': 'devadesátý'
					}
				};
				break;
			case "sv-SE":
				alphaBet = {
					'ett': 'första',
					'två': 'andra',
					'tre': 'tredje',
					'fyra': 'fjärde',
					'fem': 'femte',
					'sex': 'sjätte',
					'sju': 'sjunde',
					'åtta': 'åttonde',
					'nio': 'nionde',
					'tio': 'tionde',
					'elva': 'elfte',
					'tolv': 'tolfte'
				};
				break;
			case "uk-UA":
				alphaBet = {
					'numbers':
					{
						"один": "перший",
						"два": "другий",
						"три": "третій",
						"чотири": "четвертий",
						"п'ять": "п'ятий",
						"шість": "шостий",
						"сім": "сьомий",
						"вісім": "восьмий",
						"дев'ять": "дев'ятий",
						"десять": "десятий",
						"одинадцять": "одинадцятий",
						"дванадцять": "дванадцятий",
						"тринадцять": "тринадцятий",
						"чотирнадцять": "чотирнадцятий",
						"п'ятнадцять": "п'ятнадцятий",
						"шістнадцять": "шістнадцятий",
						"сімнадцять": "сімнадцятий",
						"вісімнадцять": "вісімнадцятий",
						"дев'ятнадцять": "дев'ятнадцятий",
						"двадцять": "двадцятий",
						"тридцять": "тридцятий",
						"сорок": "сороковий",
						"п'ятдесят": "п'ятдесятий",
						"шiстдесят": "шiстдесятий",
						"сімдесят": "сімдесятий",
						"вісімдесят": "вісімдесятий",
						"дев'яносто": "дев'яностий",
						"сто": "сотий",
						"двісті": "двохсотий",
						"триста": "трьохсотий",
						"чотириста": "чотирьохсотий",
						"п'ятсот": "п'ятисотий",
						"шістсот": "шестисотий",
						"сімсот": "семисотий",
						"вісімсот": "восьмисотий",
						"дев'ятсот": "дев'ятисотий"
					},
					'thousand':
					{
						1:
						{
							"одна": "одно",
							"дві": "двох",
							"три": "трьох",
							"чотири": "чотирьох",
							"п'ять": "п'яти",
							"шість": "шести",
							"сім": "семи",
							"вісім": "восьми",
							"дев'ять": "дев'яти",
							"десять": "десяти",
							"одинадцять": "одинадцяти",
							"дванадцять": "дванадцяти",
							"тринадцять": "тринадцяти",
							"чотирнадцять": "чотирнадцяти",
							"п'ятнадцять": "п'ятнадцяти",
							"шістнадцять": "шістнадцяти",
							"сімнадцять": "сімнадцяти",
							"вісімнадцять": "вісімнадцяти",
							"дев'ятнадцять": "дев'ятнадцяти",
							"двадцять": "двадцяти",
							"тридцять": "тридцяти",
							"сорок": "сорока",
							"п'ятдесят": "п'ятдесяти",
							"шiстдесят": "шiстдесяти",
							"сімдесят": "сімдесяти",
							"вісімдесят": "вісімдесяти",
							"дев'яносто": "дев'яносто"
						},
						100:
						{
							"сто": "сто",
							"двісті": "двохсот",
							"триста": "трьохсот",
							"чотириста": "чотирьохсот",
							"п'ятсот": "п'ятисот",
							"шістсот": "шестисот",
							"сімсот": "семисот",
							"вісімсот": "восьмисот",
							"дев'ятьсот": "дев'ятисот"
						}
					},
					'thousandEntry': 'тисяч',
					'thousandType': 'тисячний'
				};
				break;
			case 'zh-CN':
			case 'ja-JP':
			case 'ko-KR':
			case 'az-Latn-AZ':
			case 'en-US':
			case 'vi-VN':
			case 'en-GB':
			default:
				alphaBet = {
					'one': 'first',
					'two': 'second',
					'three': 'third',
					'four': 'fourth',
					'five': 'fifth',
					'six': 'sixth',
					'seven': 'seventh',
					'eight': 'eighth',
					'nine': 'ninth',
					'ten': 'tenth',
					'eleven': 'eleventh',
					'twelve': 'twelfth'
				};
				break;
		}
		return alphaBet;
	}

	function getAlphaBetForCardinalText(language)
	{
		var alphaBet = {};
		switch (language)
		{
			case"bg-BG":
				alphaBet = {
					1: [
						'един',
						'два',
						'три',
						'четири',
						'пет',
						'шест',
						'седем',
						'осем',
						'девет',
						'десет',
						'единадесет',
						'дванадесет',
						'тринадесет',
						'четиринадесет',
						'петнадесет',
						'шестнадесет',
						'седемнадесет',
						'осемнадесет',
						'деветнадесет'
					],
					10: [
						'двадесет',
						'тридесет',
						'четиридесет',
						'петдесет',
						'шестдесет',
						'седемдесет',
						'осемдесет',
						'деветдесет'
					],
					100: [
						'сто',
						'двеста',
						'триста',
						'четиристотин',
						'петстотин',
						'шестстотин',
						'седемстотин',
						'осемстотин',
						'деветстотин'
					],
					'thousand': [
						'хиляда',
						'хиляди',
						'хиляди'
					],
					'thousandType': [
						'една',
						'две'
					]
				};
				break;
			case"cs-CZ":
				alphaBet = {
					1: [
						'jedna',
						'dva',
						'tři',
						'čtyři',
						'pět',
						'šest',
						'sedm',
						'osm',
						'devět',
						'deset',
						'jedenáct',
						'dvanáct',
						'třináct',
						'čtrnáct',
						'patnáct',
						'šestnáct',
						'sedmnáct',
						'osmnáct',
						'devatenáct'
					],
					10: [
						'dvacet',
						'třicet',
						'čtyřicet',
						'padesát',
						'šedesát',
						'sedmdesát',
						'osmdesát',
						'devadesát'
					],
					100: [
						'sto',
						'dvě stě',
						'tři sta',
						'čtyři sta',
						'pět set',
						'šest set',
						'sedm set',
						'osm set',
						'devět set'
					],
					'thousand': [
						'tisíc',
						'tisíce',
						'tisíc'
					],
					'thousandType': [
						'jedna',
						'dva'
					]
				};
				break;
			case"de-DE":
				alphaBet = {
					1: [
						'eins',
						'zwei',
						'drei',
						'vier',
						'fünf',
						'sechs',
						'sieben',
						'acht',
						'neun',
						'zehn',
						'elf',
						'zwölf',
						'dreizehn',
						'vierzehn',
						'fünfzehn',
						'sechzehn',
						'siebzehn',
						'achtzehn',
						'neunzehn'
					],
					10: [
						'zwanzig',
						'dreißig',
						'vierzig',
						'fünfzig',
						'sechzig',
						'siebzig',
						'achtzig',
						'neunzig'
					]
				};
				break;
			case"el-GR":
				alphaBet = {
					1: [
						'ένα',
						'δύο',
						'τρία',
						'τέσσερα',
						'πέντε',
						'έξι',
						'επτά',
						'οκτώ',
						'εννέά',
						'δέκα',
						'ένδεκα',
						'δώδεκα',
						'δεκατρία',
						'δεκατέσσερα',
						'δεκαπέντε',
						'δεκαέξι',
						'δεκαεπτά',
						'δεκαοκτώ',
						'δεκαεννέά'
					],
					10: [
						'είκοσι',
						'τριάντα',
						'σαράντα',
						'πενήντα',
						'εξήντα',
						'εβδομήντα',
						'ογδόντα',
						'ενενήντα'
					],
					100: [
						'εκατό',
						'διακόσια',
						'τριακόσια',
						'τετρακόσια',
						'πεντακόσια',
						'εξακόσια',
						'επτακόσια',
						'οκτακόσια',
						'εννιακόσια'
					],
					'thousand': [
						'χίλια',
						'χιλιάδες',
						'χιλιάδες'
					],
					'thousandType': [
						'ένα',
						'δύο'
					]
				};
				break;
			case"es-ES":
				alphaBet = {
					1: [
						'uno',
						'dos',
						'tres',
						'cuatro',
						'cinco',
						'seis',
						'siete',
						'ocho',
						'nueve',
						'diez',
						'once',
						'doce',
						'trece',
						'catorce',
						'quince',
						'dieciséis',
						'diecisiete',
						'dieciocho',
						'diecinueve'
					],
					10: [
						'veint',
						'treinta',
						'cuarenta',
						'cincuenta',
						'sesenta',
						'setenta',
						'ochenta',
						'noventa'
					],
					100: [
						'ciento',
						'doscientos',
						'trescientos',
						'cuatrocientos',
						'quinientos',
						'seiscientos',
						'setecientos',
						'ochocientos',
						'novecientos'
					],
					20:
					{
						2: 'dós',
						3: 'trés',
						6: 'séis'
					}
				};
				break;
			case"fr-FR":
				alphaBet = {
					1: [
						'un',
						'deux',
						'trois',
						'quatre',
						'cinq',
						'six',
						'sept',
						'huit',
						'neuf',
						'dix',
						'onze',
						'douze',
						'treize',
						'quatorze',
						'quinze',
						'seize',
						'dix-sept',
						'dix-huit',
						'dix-neuf'
					],
					10: [
						'vingt',
						'trente',
						'quarante',
						'cinquante',
						'soixante',
						'soixante-dix',
						'quatre-vingt',
						'quatre-vingt'
					]
				};
				break;
			case"it-IT":
				alphaBet = {
					1: [
						'uno',
						'due',
						'tre',
						'quattro',
						'cinque',
						'sei',
						'sette',
						'otto',
						'nove',
						'dieci',
						'undici',
						'dodici',
						'tredici',
						'quattordici',
						'quindici',
						'sedici',
						'diciassette',
						'diciotto',
						'diciannove'
					],
					10: [
						'venti',
						'trenta',
						'quaranta',
						'cinquanta',
						'sessanta',
						'settanta',
						'ottanta',
						'novanta'
					]
				};
				break;
			case"lv-LV":
				alphaBet = {
					1: [
						'viens',
						'divi',
						'trīs',
						'četri',
						'pieci',
						'seši',
						'septiņi',
						'astoņi',
						'deviņi',
						'desmit',
						'vienpadsmit',
						'divpadsmit',
						'trīspadsmit',
						'četrpadsmit',
						'piecpadsmit',
						'sešpadsmit',
						'septiņpadsmit',
						'astoņpadsmit',
						'deviņpadsmit'
					],
					10: [
						'divdesmit',
						'trīsdesmit',
						'četrdesmit',
						'piecdesmit',
						'sešdesmit',
						'septiņdesmit',
						'astoņdesmit',
						'deviņdesmit'
					],
					100: [
						'simti',
						'divi simti',
						'trīs simti',
						'četri simti',
						'pieci simti',
						'seši simti',
						'septiņi simti',
						'astoņi simti',
						'deviņi simti'
					],
					'thousand': [
						'tūkstotis',
						'tūkstoši',
						'tūkstoši'
					],
					'thousandType': [
						'viens',
						'divi'
					]
				};
				break;
			case"nl-NL":
				alphaBet = {
					1: [
						'één',
						'twee',
						'drie',
						'vier',
						'vijf',
						'zes',
						'zeven',
						'acht',
						'negen',
						'tien',
						'elf',
						'twaalf',
						'dertien',
						'veertien',
						'vijftien',
						'zestien',
						'zeventien',
						'achttien',
						'negentien'
					],
					10: [
						'twintig',
						'dertig',
						'veertig',
						'vijftig',
						'zestig',
						'zeventig',
						'tachtig',
						'negentig'
					]
				};
				break;
			case"pl-PL":
				alphaBet = {
					1: [
						'jeden',
						'dwa',
						'trzy',
						'cztery',
						'pięć',
						'sześć',
						'siedem',
						'osiem',
						'dziewięć',
						'dziesięć',
						'jedenaście',
						'dwanaście',
						'trzynaście',
						'czternaście',
						'piętnaście',
						'szesnaście',
						'siedemnaście',
						'osiemnaście',
						'dziewiętnaście'
					],
					10: [
						'dwadzieścia',
						'trzydzieści',
						'czterdzieści',
						'pięćdziesiąt',
						'sześćdziesiąt',
						'siedemdziesiąt',
						'osiemdziesiąt',
						'dziewięćdziesiąt'
					],
					100: [
						'sto',
						'dwieście',
						'trzysta',
						'czterysta',
						'pięćset',
						'sześćset',
						'siedemset',
						'osiemset',
						'dziewięćset'
					],
					'thousand': [
						'tysiąc',
						'tysiące',
						'tysięcy'
					],
					'thousandType': [
						'jeden',
						'dwa'
					]
				};
				break;
			case"pt-BR":
			case"pt-PT":
				alphaBet = {
					1: [
						'um',
						'dois',
						'três',
						'quatro',
						'cinco',
						'seis',
						'sete',
						'oito',
						'nove',
						'dez',
						'onze',
						'doze',
						'treze',
						'quartorze',
						'quinze',
						'dezesseis',
						'dezessete',
						'dezoito',
						'dezenove'
					],
					10: [
						'vinte',
						'trinta',
						'quarenta',
						'cinqüenta',
						'sessenta',
						'setenta',
						'oitenta',
						'noventa'
					],
					100: [
						'cem',
						'duzentos',
						'trezentos',
						'quatrocentos',
						'quinhentos',
						'seiscentos',
						'setecentos',
						'oitocentos',
						'novecentos'
					]
				};
				break;
			case"ru-RU":
				alphaBet = {
					1: [
						'один',
						'два',
						'три',
						'четыре',
						'пять',
						'шесть',
						'семь',
						'восемь',
						'девять',
						'десять',
						'одиннадцать',
						'двенадцать',
						'тринадцать',
						'четырнадцать',
						'пятнадцать',
						'шестнадцать',
						'семнадцать',
						'восемнадцать',
						'девятнадцать'
					],
					10: [
						'двадцать',
						'тридцать',
						'сорок',
						'пятьдесят',
						'шестьдесят',
						'семьдесят',
						'восемьдесят',
						'девяносто'
					],
					100: [
						'сто',
						'двести',
						'триста',
						'четыреста',
						'пятьсот',
						'шестьсот',
						'семьсот',
						'восемьсот',
						'девятьсот'
					],
					'thousand': [
						'тысяча',
						'тысячи',
						'тысяч'
					],
					'thousandType': [
						'одна',
						'две'
					]
				};
				break;
			case"sk-SK":
				alphaBet = {
					1: [
						'jeden',
						'dva',
						'tri',
						'štyri',
						'päť',
						'šesť',
						'sedem',
						'osem',
						'deväť',
						'desať',
						'jedenásť',
						'dvanásť',
						'trinásť',
						'štrnásť',
						'pätnásť',
						'šestnásť',
						'sedemnásť',
						'osemnásť',
						'devätnásť'
					],
					10: [
						'dvadsať',
						'tridsať',
						'štyridsať',
						'päťdesiat',
						'šesťdesiat',
						'sedemdesiat',
						'osemdesiat',
						'deväťdesiat'
					]
				};
				break;
			case"sv-SE":
				alphaBet = {
					1: [
						'ett',
						'två',
						'tre',
						'fyra',
						'fem',
						'sex',
						'sju',
						'åtta',
						'nio',
						'tio',
						'elva',
						'tolv',
						'tretton',
						'fjorton',
						'femton',
						'sexton',
						'sjutton',
						'arton',
						'nitton'
					],
					10: [
						'tjugo',
						'trettio',
						'fyrtio',
						'femtio',
						'sextio',
						'sjuttio',
						'åttio',
						'nittio'
					]
				};
				break;
			case"uk-UA":
				alphaBet = {
					1: [
						"один",
						"два",
						"три",
						"чотири",
						"п'ять",
						"шість",
						"сім",
						"вісім",
						"дев'ять",
						"десять",
						"одинадцять",
						"дванадцять",
						"тринадцять",
						"чотирнадцять",
						"п'ятнадцять",
						"шістнадцять",
						"сімнадцять",
						"вісімнадцять",
						"дев'ятнадцять"
					],
					10: [
						"двадцять",
						"тридцять",
						"сорок",
						"п'ятдесят",
						"шiстдесят",
						"сімдесят",
						"вісімдесят",
						"дев'яносто"
					],
					100: [
						"сто",
						"двісті",
						"триста",
						"чотириста",
						"п'ятсот",
						"шістсот",
						"сімсот",
						"вісімсот",
						"дев'ятсот"
					],
					'thousand': [
						'тисяча',
						'тисячі',
						'тисяч'
					],
					'thousandType': [
						'одна',
						'дві'
					]
				};
				break;
			case 'en-US':
			case 'az-Latn-AZ':
			case 'en-GB':
			case 'ja-JP':
			case 'zh-CN':
			case 'vi-VN':
			case 'ko-KR':
			default:
				alphaBet = {
					1: [
						'one',
						'two',
						'three',
						'four',
						'five',
						'six',
						'seven',
						'eight',
						'nine',
						'ten',
						'eleven',
						'twelve',
						'thirteen',
						'fourteen',
						'fifteen',
						'sixteen',
						'seventeen',
						'eighteen',
						'nineteen'
					],
					10: [
						'twenty',
						'thirty',
						'forty',
						'fifty',
						'sixty',
						'seventy',
						'eighty',
						'ninety'
					]
				};
				break;
		}
		return alphaBet;
	}

	function getCardinalTextFromValue(lang, nValue)
	{
		var alphaBet = getAlphaBetForCardinalText(lang);
		var arrAnswer = [];
		var getConcatStringByRule = function (array)
		{
			return array.join(' ');
		}

		switch (lang)
		{
			case 'ru-RU':
			case 'uk-UA':
			case 'cs-CZ':
			case 'pl-PL':
			case 'el-GR':
			case 'lv-LV':
			{
				var letterNumberLessThen100CyrillicMim = function(num)
				{
					var resArr = [];
					var reminder = num % 10;
					var degree10 = Math.floor(num / 10);
					if (num < 100 && num > 0)
					{
						if (num < 20)
						{
							resArr.push(alphaBet[1][num - 1]);
						} else {
							if (reminder === 0)
							{
								resArr.push(alphaBet[10][degree10 - 2]);
							} else {
								resArr.push(alphaBet[10][degree10 - 2], alphaBet[1][reminder - 1]);
							}
						}
					}
					return resArr;
				};

				var cardinalSplittingCyrillicMim = function(num, skipThousand)
				{
					var resArr = [];
					var groups = {};
					if (num < 1000000 && num > 0)
					{
						groups[1000] = Math.floor(num / 1000);
						num %= 1000;
						groups[100] = Math.floor(num / 100);
						num %= 100;
						groups[1] = num;

						if (groups[1000])
						{
							var thousandType = groups[1000] % 10;
							var groupArr = [];
							if (groups[1000] >= 100)
							{
								groupArr = groupArr.concat(cardinalSplittingCyrillicMim(groups[1000]));
							} else {
								if (groups[1000] === 4 && lang === 'el-GR')
								{
									groupArr = groupArr.concat(['τέσσερις']);
								} else {
									groupArr = groupArr.concat(letterNumberLessThen100CyrillicMim(groups[1000]));
								}
							}
							var thousand;
							switch (thousandType)
							{
								case 1:
									thousand = alphaBet['thousand'][0];
									if (skipThousand && groups[1000] === 1)
									{
										groupArr.pop();
									} else {
										groupArr[groupArr.length - 1] = alphaBet['thousandType'][0];
									}
									break;
								case 2:
								case 3:
								case 4:
									thousand = alphaBet['thousand'][1];
									if (thousandType === 2)
									{
										groupArr[groupArr.length - 1] = alphaBet['thousandType'][1];
									}
									break;
								case 5:
								case 6:
								case 7:
								case 8:
								case 9:
								case 0:
									thousand = alphaBet['thousand'][2];
									break;
								default:
									break;
							}
							groupArr.push(thousand);
							resArr = resArr.concat(groupArr);
						}
						if (groups[100])
						{
							resArr.push(alphaBet[100][groups[100] - 1]);

							if (groups[100] === 1 && groups[1])
							{

								if (lang === 'el-GR')
								{
									resArr[resArr.length - 1] = resArr[resArr.length - 1] + 'v';
								}
								if (lang === 'lv-LV')
								{
									resArr[resArr.length - 1] = resArr[resArr.length - 1].slice(0, resArr[resArr.length - 1].length - 1) + 's';
								}
							}
						}

						if (groups[1])
						{
							var letterArr = letterNumberLessThen100CyrillicMim(groups[1]);
							resArr = resArr.concat(letterArr);
						}
					}
					return resArr;
				};

				if (lang === 'uk-UA' || lang === 'cs-CZ' || lang === 'pl-PL' || lang === 'el-GR' || lang === 'lv-LV')
				{
					arrAnswer = cardinalSplittingCyrillicMim(nValue, true);
				} else if (lang === 'ru-RU')
				{
					arrAnswer = cardinalSplittingCyrillicMim(nValue);
				}
				break;
			}
			case 'pt-PT':
			case 'pt-BR':
			{
				var letterNumberLessThen100PT = function(num)
				{
					var resArr = [];
					if (num > 0 && num < 100)
					{
						var degree10 = Math.floor(num / 10);
						var reminder = num % 10;
						if (num < 20)
						{
							resArr.push(alphaBet[1][num - 1]);
						} else {
							resArr.push(alphaBet[10][degree10 - 2]);
							if (reminder)
							{
								resArr.push('e', alphaBet[1][reminder - 1]);
							}
						}
					}
					return resArr;
				};

				var cardinalSplittingPT = function(num)
				{
					var resArr = [];
					var groups = {};
					if (num > 0 && num < 1000000)
					{
						groups[1000] = Math.floor(num / 1000);
						num %= 1000;
						groups[100] = Math.floor(num / 100);
						num %= 100;
						groups[1] = num;

						if (groups[1000])
						{
							if (groups[1000] >= 100)
							{
								resArr = resArr.concat(cardinalSplittingPT(groups[1000]));
							} else {
								if (groups[1000] !== 1)
								{
									resArr = resArr.concat(letterNumberLessThen100PT(groups[1000]));
								}
							}
							resArr.push('mil');
							if ((groups[100] && !groups[1]) || (groups[1] && !groups[100]))
							{
								resArr.push('e');
							}
						}
						if (groups[100])
						{
							if (groups[100] === 1 && (groups[1] || groups[1000]))
							{
								resArr.push('cento');
							} else {
								resArr.push(alphaBet[100][groups[100] - 1]);
							}
							if (groups[1])
							{
								resArr.push('e');
							}
						}
						if (groups[1])
						{
							resArr = resArr.concat(letterNumberLessThen100PT(num));
						}
					}
					return resArr;
				};

				arrAnswer = cardinalSplittingPT(nValue);
				break;
			}
			case 'sk-SK':
			{
				var letterNumberLessThen100SK = function(num, options)
				{
					var resArr = [];
					if (num < 100 && num > 0)
					{
						var degree10 = Math.floor(num / 10);
						var reminder = num % 10;
						if (num < 20)
						{
							if (num === 2 && options && options.isHundred)
							{
								resArr.push('dve');
							} else {
								resArr.push(alphaBet[1][num - 1]);
							}
						} else {
							resArr.push(alphaBet[10][degree10 - 2]);
							if (reminder)
							{
								resArr.push(alphaBet[1][reminder - 1]);
							}
						}
					}
					return resArr;
				};

				var cardinalSplittingSK = function(num)
				{
					var resArr = [];
					var groups = {};
					if (num > 0 && num < 1000000)
					{
						groups[1000] = Math.floor(num / 1000);
						num %= 1000;
						groups[100] = Math.floor(num / 100);
						num %= 100;
						groups[1] = num;

						if (groups[1000])
						{
							if (groups[1000] >= 100)
							{
								resArr = resArr.concat(cardinalSplittingSK(groups[1000]));
							} else {
								resArr = resArr.concat(letterNumberLessThen100SK(groups[1000]));
							}
							resArr.push('tisíc');
						}
						if (groups[100])
						{
							if (groups[100] !== 1)
							{
								resArr = resArr.concat(letterNumberLessThen100SK(groups[100], {isHundred: true}));
							}
							resArr.push('sto');
						}
						if (groups[1])
						{
							resArr = resArr.concat(letterNumberLessThen100SK(groups[1]));
						}
					}

					return resArr;
				};

				arrAnswer = cardinalSplittingSK(nValue);
				getConcatStringByRule = function (array)
				{
					return array.join('');
				};
				break;
			}
			case 'bg-BG':
			{
				var letterNumberLessThen100BG = function(num)
				{
					var resArr = [];

					if (num > 0 && num < 100)
					{
						if (num < 20)
						{
							resArr.push(alphaBet[1][num - 1]);
						} else {
							var reminder = num % 10;
							var degree10 = Math.floor(num / 10);

							resArr.push(alphaBet[10][degree10 - 2]);
							if (reminder)
							{
								resArr.push('и', alphaBet[1][reminder - 1]);
							}
						}
					}

					return resArr;
				};

				var cardinalSplittingBG = function(num)
				{
					var resArr = [];
					var groups = {};

					if (num > 0 && num < 1000000)
					{
						groups[1000] = Math.floor(num / 1000);
						num %= 1000;
						groups[100] = Math.floor(num / 100);
						num %= 100;
						groups[1] = num;
						if (groups[1000])
						{
							var thousandType = groups[1000] % 10;
							var groupArr = [];
							if (groups[1000] >= 100)
							{
								groupArr = groupArr.concat(cardinalSplittingBG(groups[1000]));
							} else if (groups[1000] !== 1)
							{
								groupArr = groupArr.concat(letterNumberLessThen100BG(groups[1000]));
							}
							var thousand;
							switch (thousandType)
							{
								case 1:
									thousand = alphaBet['thousand'][0];
									break;
								case 2:
								case 3:
								case 4:
									thousand = alphaBet['thousand'][1];
									if (thousandType === 2)
									{
										groupArr[groupArr.length - 1] = alphaBet['thousandType'][1];
									}
									break;
								case 5:
								case 6:
								case 7:
								case 8:
								case 9:
								case 0:
									thousand = alphaBet['thousand'][2];
									break;
								default:
									break;
							}
							groupArr.push(thousand);
							resArr = resArr.concat(groupArr);
						}

						if (groups[100])
						{
							resArr = resArr.concat(alphaBet[100][groups[100] - 1]);
						}

						if (groups[1])
						{
							if ((groups[1] < 11 || groups[1] % 10 === 0) && (groups[100] || groups[1000]))
							{
								resArr.push('и');
							}
							resArr = resArr.concat(letterNumberLessThen100BG(groups[1]));
						}
					}
					return resArr;
				};

				arrAnswer = cardinalSplittingBG(nValue);
				break;
			}
			case 'sv-SE':
			{
				var letterNumberLessThen100SV = function(num)
				{
					var resArr = [];
					if (num > 0 && num < 100)
					{
						if (num < 20)
						{
							resArr.push(alphaBet[1][num - 1]);
						} else {
							var degree10 = Math.floor(num / 10);
							var reminder = num % 10;

							resArr.push(alphaBet[10][degree10 - 2]);
							if (reminder)
							{
								resArr.push(alphaBet[1][reminder - 1]);
							}
						}
					}
					return resArr;
				};

				var cardinalSplittingSV = function(num)
				{
					var resArr = [];
					var groups = {};
					if (num < 1000000 && num > 0)
					{
						groups[1000] = Math.floor(num / 1000);
						num %= 1000;
						groups[100] = Math.floor(num / 100);
						num %= 100;
						groups[1] = num;

						if (groups[1000])
						{
							if (groups[1000] >= 100)
							{
								resArr = resArr.concat(cardinalSplittingSV(groups[1000]));
							} else {
								resArr = resArr.concat(letterNumberLessThen100SV(groups[1000]));
							}
							if (groups[1000] === 1)
							{
								resArr.push('usen');
							} else {
								resArr.push('tusen');
							}
						}

						if (groups[100])
						{
							resArr = resArr.concat(letterNumberLessThen100SV(groups[100]));
							resArr.push('hundra');
						}

						if (groups[1])
						{
							resArr = resArr.concat(letterNumberLessThen100SV(groups[1]));
						}
					}

					return resArr;
				};

				arrAnswer = cardinalSplittingSV(nValue);
				getConcatStringByRule = function (array)
				{
					return array.join('');
				};

				break;
			}
			case 'nl-NL':
			{

				var letterNumberLessThen100NL = function(num)
				{
					var resArr = [];
					if (num > 0 && num < 100)
					{
						if (num < 20)
						{
							resArr.push(alphaBet[1][num - 1]);
						} else {
							var degree10 = Math.floor(num / 10);
							var reminder = num % 10;

							if (reminder)
							{
								var letterReminder = alphaBet[1][reminder - 1];
								resArr.push(letterReminder);
								if (letterReminder[letterReminder.length - 1] === 'e')
								{
									resArr.push('ën');
								} else {
									resArr.push('en');
								}
							}
							resArr.push(alphaBet[10][degree10 - 2]);
						}
					}
					return resArr;
				};

				var cardinalSplittingNL = function(num)
				{
					var resArr = [];
					var groups = {};
					if (num < 1000000 && num > 0)
					{
						groups[1000] = Math.floor(num / 1000);
						num %= 1000;
						groups[100] = Math.floor(num / 100);
						num %= 100;
						groups[1] = num;

						if (groups[1000])
						{
							if (groups[1000] >= 100)
							{
								resArr = resArr.concat(cardinalSplittingNL(groups[1000]));
							} else if(groups[1000] !== 1 || groups[1] !== 0 || groups[100] !== 0)
							{
								resArr = resArr.concat(letterNumberLessThen100NL(groups[1000]));
							}
							resArr.push('duizend');
						}

						if (groups[100])
						{
							resArr = resArr.concat(letterNumberLessThen100NL(groups[100]));
							resArr.push('honderd');
						}

						if (groups[1])
						{
							resArr = resArr.concat(letterNumberLessThen100NL(groups[1]));
						}
					}

					return resArr;
				};

				arrAnswer = cardinalSplittingNL(nValue);
				getConcatStringByRule = function (array)
				{
					return array.join('');
				};

				break;
			}
			case 'es-ES':
			{
				var letterNumberLessThen100ES = function(num)
				{
					var resArr = [];
					if (num < 100 && num > 0)
					{
						var degree10 = Math.floor(num / 10);
						var reminder = num % 10;
						if (num < 20)
						{
							resArr.push(alphaBet[1][num - 1]);
						} else if (degree10 === 2)
						{
							if (reminder === 0)
							{
								resArr.push(alphaBet[10][degree10 - 2] + 'e');
							} else {
								if (reminder === 2 || reminder === 3 || reminder === 6)
								{
									resArr.push(alphaBet[10][degree10 - 2] + 'i', alphaBet[20][reminder]);
								} else {
									resArr.push(alphaBet[10][degree10 - 2] + 'i', alphaBet[1][reminder - 1]);
								}
							}
						} else {
							resArr.push(alphaBet[10][degree10 - 2]);
							if (reminder !== 0)
							{
								resArr.push(' y ', alphaBet[1][reminder - 1]);
							}
						}
					}
					return resArr;
				};

				var cardinalSplittingES = function(num, isRecursive)
				{
					var resArr = [];
					var groups = {};
					if (num > 0 && num < 1000000)
					{
						groups[1000] = Math.floor(num / 1000);
						num %= 1000;
						groups[100] = Math.floor(num / 100);
						num %= 100;
						groups[1] = num;

						if (groups[1000])
						{
							if (groups[1000] >= 100)
							{
								resArr = resArr.concat(cardinalSplittingES(groups[1000], true));
							} else {
								if (groups[1000] !== 1)
								{
									resArr.push(letterNumberLessThen100ES(groups[1000]));
								}
							}
							resArr.push('mil');
						}

						if (groups[100])
						{
							if (isRecursive && groups[100] === 1)
							{
								resArr.push('cien');
							} else {
								resArr.push(alphaBet[100][groups[100] - 1]);
							}
						}
						if (groups[1])
						{
							resArr.push(letterNumberLessThen100ES(groups[1]));
						}
					}
					return resArr;
				};
				arrAnswer = cardinalSplittingES(nValue);
				getConcatStringByRule = function (array)
				{
					return array.map(function (element)
					{
						if (Array.isArray(element))
						{
							return element.join('');
						}
						return element;
					}).join(' ');
				};
				break;
			}
			case 'it-IT':
			{
				var letterNumberLessThen100IT = function(num)
				{
					var resArr = [];
					if (num < 100 && num > 0)
					{
						var degree10 = Math.floor(num / 10);
						var reminder = num % 10;
						if (num < 20)
						{
							resArr.push(alphaBet[1][num - 1]);
						} else {
							var deg = alphaBet[10][degree10 - 2];
							if (reminder === 1 || reminder === 8)
							{
								resArr.push(deg.slice(0, deg.length - 1));
							} else {
								resArr.push(deg);
							}
							if (reminder)
							{
								resArr.push(alphaBet[1][reminder - 1]);
							}
						}
					}
					return resArr;
				};

				var cardinalSplittingIT = function(num)
				{
					var resArr = [];
					var groups = {};
					if (num > 0 && num < 1000000)
					{
						groups[1000] = Math.floor(num / 1000);
						num %= 1000;
						groups[100] = Math.floor(num / 100);
						num %= 100;
						groups[1] = num;
						if (groups[1000])
						{
							if (groups[1000] >= 100)
							{
								resArr = resArr.concat(cardinalSplittingIT(groups[1000]));
							} else {
								if (groups[1000] !== 1)
								{
									resArr = resArr.concat(letterNumberLessThen100IT(groups[1000]));
								}
							}
							if (groups[1000] === 1)
							{
								resArr.push('mille');
							} else {
								resArr.push('mila');
							}
						}
						if (groups[100])
						{
							if (groups[100] !== 1)
							{
								resArr = resArr.concat(letterNumberLessThen100IT(groups[100]));
							}
							resArr.push('cento');
						}
						if (groups[1])
						{
							resArr = resArr.concat(letterNumberLessThen100IT(groups[1]));
							if (groups[1] > 20 && groups[1] % 10 === 3)
							{
								resArr[resArr.length - 1] = 'tré';
							}
						}
					}

					return resArr;
				};
				arrAnswer = cardinalSplittingIT(nValue);
				getConcatStringByRule = function (array)
				{
					return array.join('');
				};
				break;
			}
			case 'de-DE':
			{
				var letterNumberLessThen100DE = function(num)
				{
					var resArr = [];

					if (num < 100 && num > 0)
					{
						var reminder = num % 10;
						var degree10 = Math.floor(num / 10);
						if (num < 20)
						{
							resArr.push(alphaBet[1][num - 1]);
						} else {
							if (reminder !== 0)
							{
								if (reminder === 1)
								{
									resArr.push(alphaBet[1][reminder - 1].slice(0, alphaBet[1][reminder - 1].length - 1), 'und');
								} else {
									resArr.push(alphaBet[1][reminder - 1], 'und');
								}
							}
							resArr.push(alphaBet[10][degree10 - 2]);
						}
					}
					return resArr;
				};

				var cardinalSplittingDE = function(num)
				{
					var resArr = [];
					var groups = {};
					if (num > 0 && num < 1000000)
					{
						groups[1000] = Math.floor(num / 1000);
						num %= 1000;
						groups[100] = Math.floor(num / 100);
						num %= 100;
						groups[1] = num;
						if (groups[1000])
						{
							if (groups[1000] >= 100)
							{
								resArr = resArr.concat(cardinalSplittingDE(groups[1000]));
							} else if (groups[1000] === 1)
							{
								resArr.push('ein');
							}	else {
								resArr = resArr.concat(letterNumberLessThen100DE(groups[1000]));
							}
							resArr.push('tausend');
						}
						if (groups[100])
						{
							if (groups[100] !== 1)
							{
								resArr = resArr.concat(letterNumberLessThen100DE(groups[100]));
							}
							resArr.push('hundert');
						}
						if (groups[1])
						{
							resArr = resArr.concat(letterNumberLessThen100DE(groups[1]));
						}
					}

					return resArr;
				};
				arrAnswer = cardinalSplittingDE(nValue);
				getConcatStringByRule = function (array)
				{
					return array.join('');
				};
				break;
			}
			case 'fr-FR':
			{

				var letterNumberLessThen100FR = function(num)
				{
					var resArr = [];
					if (num > 0 && num < 100)
					{
						if (num < 20)
						{
							resArr.push(alphaBet[1][num - 1]);
						} else {
							var degree10 = Math.floor(num / 10);
							var reminder = num % 10;
							switch (degree10)
							{
								case 7:
									if (reminder === 0)
									{
										return alphaBet[10][degree10 - 2];
									} else if (reminder === 1)
									{
										resArr.push(alphaBet[10][(degree10 - 1) - 2], ' et ', alphaBet[1][9 + reminder]);
									} else {
										resArr.push(alphaBet[10][(degree10 - 1) - 2], '-', alphaBet[1][9 + reminder]);
									}
									break;

								case 8:
									if (reminder === 0)
									{
										resArr.push(alphaBet[10][degree10 - 2], 's');
									} else {
										resArr.push(alphaBet[10][degree10 - 2], '-', alphaBet[1][reminder - 1]);
									}
									break;

								case 9:
									if (reminder === 0)
									{
										resArr.push(alphaBet[10][degree10 - 2], '-dix');
									} else {
										resArr.push(alphaBet[10][degree10 - 2], '-', alphaBet[1][9 + reminder]);
									}
									break;

								default:
									if (reminder === 0)
									{
										resArr.push(alphaBet[10][degree10 - 2]);
									} else if (reminder === 1)
									{
										resArr.push(alphaBet[10][degree10 - 2], ' et ', alphaBet[1][reminder - 1]);
									} else {
										resArr.push(alphaBet[10][degree10 - 2], '-', alphaBet[1][reminder - 1]);
									}
							}
						}
					}
					return resArr;
				};

				var cardinalSplittingFR = function(num)
				{
					var groups = {};
					var resArr = [];
					if (num < 1000000 && num > 0)
					{
						groups[1000] = Math.floor(num / 1000);
						num %= 1000;
						groups[100] = Math.floor(num / 100);
						num %= 100;
						groups[1] = num;
						if (groups[1000])
						{
							if (groups[1000] >= 100)
							{
								resArr = resArr.concat(cardinalSplittingFR(groups[1000]));
							} else if (groups[1000] !== 1)
							{
								resArr.push(letterNumberLessThen100FR(groups[1000]));
							}
							resArr.push('mille');
						}
						if (groups[100])
						{
							var hundred = 'cents';
							if (groups[1] || groups[100] === 1)
							{
								hundred = 'cent';
							}
							if (groups[100] === 1)
							{
								resArr.push(hundred);
							} else {
								resArr.push(letterNumberLessThen100FR(groups[100]), hundred);
							}
						}
						if (groups[1])
						{
							resArr.push(letterNumberLessThen100FR(groups[1]));
						}
					}
					return resArr;
				};
				arrAnswer = cardinalSplittingFR(nValue);
				getConcatStringByRule = function (array)
				{
					return array.map(function (element)
					{
						if (Array.isArray(element))
						{
							return element.join('');
						}
						return element;
					}).join(' ');
				};

				break;
			}
			case 'en-US':
			case 'az-Latn-AZ':
			case 'en-GB':
			case 'ja-JP':
			case 'zh-CN':
			case 'vi-VN':
			case 'ko-KR':
			default:
			{
				var letterNumberLessThen100EN = function(num)
				{
					var resArr = [];
					if (num > 0 && num < 100)
					{
						if (num < 20)
						{
							resArr.push(alphaBet[1][num - 1]);
						} else {
							var degree10 = Math.floor(num / 10);
							var reminder = num % 10;
							resArr.push(alphaBet[10][degree10 - 2]);
							if (reminder)
							{
								resArr.push(alphaBet[1][reminder - 1]);
							}
						}
					}
					return resArr;
				};

				var cardinalSplittingEN = function(num)
				{
					var resArr = [];
					var groups = {};

					if (num < 1000000 && num > 0)
					{
						groups[1000] = Math.floor(num / 1000);
						num %= 1000;
						groups[100] = Math.floor(num / 100);
						num %= 100;
						groups[1] = num;

						if (groups[1000])
						{
							if (groups[1000] >= 100)
							{
								resArr = resArr.concat(cardinalSplittingEN(groups[1000]));
							} else {
								resArr.push(letterNumberLessThen100EN(groups[1000]));
							}
							resArr.push('thousand');
						}

						if (groups[100])
						{
							resArr.push(letterNumberLessThen100EN(groups[100]), 'hundred');
						}

						if (groups[1])
						{
							resArr.push(letterNumberLessThen100EN(groups[1]));
						}
					}

					return resArr;
				};

				getConcatStringByRule = function (array)
				{
					return array.map(function (element)
					{
						if (Array.isArray(element))
						{
							return element.join('-');
						}
						return element;
					}).join(' ');
				};
				arrAnswer = cardinalSplittingEN(nValue);

				break;
			}
		}
		return {arrAnswer: arrAnswer, getConcatStringByRule: getConcatStringByRule};
	}

	function IntToAsiaCounting(nValue, nFormat, differentFormat)
	{
		var sResult = '';
		if (differentFormat)
		{
			nFormat = differentFormat;
		}
		var addFirstDegreeSymbol = true;
		if (nFormat === Asc.c_oAscNumberingFormat.KoreanCounting)
		{
			addFirstDegreeSymbol = false;
			var digits = [
				String.fromCharCode(0xC77C),
				String.fromCharCode(0xC774),
				String.fromCharCode(0xC0BC),
				String.fromCharCode(0xC0AC),
				String.fromCharCode(0xC624),
				String.fromCharCode(0xC721),
				String.fromCharCode(0xCE60),
				String.fromCharCode(0xD314),
				String.fromCharCode(0xAD6C)
			];
			var degrees = [
				'만',
				'천',
				'백',
				'십'
			];
		} else if (nFormat === Asc.c_oAscNumberingFormat.JapaneseLegal)
		{
			digits = [
				String.fromCharCode(0x58F1),
				String.fromCharCode(0x5F10),
				String.fromCharCode(0x53C2),
				String.fromCharCode(0x56DB),
				String.fromCharCode(0x4F0D),
				String.fromCharCode(0x516D),
				String.fromCharCode(0x4E03),
				String.fromCharCode(0x516B),
				String.fromCharCode(0x4E5D)
			];
			degrees = [
				'萬',
				'阡',
				'百',
				'拾'
			];
		} else if (nFormat === Asc.c_oAscNumberingFormat.JapaneseCounting)
		{
			addFirstDegreeSymbol = false;
			digits = [
				String.fromCharCode(0x4E00),
				String.fromCharCode(0x4E8C),
				String.fromCharCode(0x4E09),
				String.fromCharCode(0x56DB),
				String.fromCharCode(0x4E94),
				String.fromCharCode(0x516D),
				String.fromCharCode(0x4E03),
				String.fromCharCode(0x516B),
				String.fromCharCode(0x4E5D)
			];
			degrees = [
				'万',
				'千',
				'百',
				'十'
			];
		}

		var degreeCount = Math.pow(10, degrees.length);
		var koreanLegalSplitting = function (numberLessThanX)
		{
			var answer = [];
			var count;
			var degreeCountCopy = degreeCount;
			for (var i = 0; i < degrees.length; i += 1)
			{
				if (numberLessThanX / degreeCountCopy >= 1)
				{
					count = Math.floor(numberLessThanX / degreeCountCopy);
					if (count !== 1 || addFirstDegreeSymbol)
					{
						answer.push(digits[count - 1]);
					}
					answer.push(degrees[i]);
					numberLessThanX = numberLessThanX % degreeCountCopy;
				}
				degreeCountCopy /= 10;
			}
			if (numberLessThanX > 0)
			{
				answer.push(digits[numberLessThanX - 1]);
			}
			return answer;
		}
		if (nValue < degreeCount || (!addFirstDegreeSymbol && nValue < degreeCount * 2
			&& nFormat !== Asc.c_oAscNumberingFormat.JapaneseCounting))
		{
			sResult = koreanLegalSplitting(nValue).join('');
		} else {
			if (
				nValue < 1000000
				|| differentFormat
				|| nFormat === Asc.c_oAscNumberingFormat.JapaneseLegal)
			{
				var resultWith10000Reminder = ([degrees[0]]).concat(koreanLegalSplitting(nValue % degreeCount));
				sResult = koreanLegalSplitting(Math.floor(nValue / degreeCount)).concat(resultWith10000Reminder).join('');
			}
		}
		return sResult;
	}

	function IntToLetter(nValue, nFormat)
	{
		var sResult = '';
		// Формат: a,..,z,aa,..,zz,aaa,...,zzz,...
		nValue = repeatNumberingLvl(nValue, 780);
		var Num = nValue - 1;

		var Count = (Num - Num % 26) / 26;
		var Ost   = Num % 26;

		var Letter;
		if (Asc.c_oAscNumberingFormat.LowerLetter === nFormat)
			Letter = String.fromCharCode(Ost + 97);
		else
			Letter = String.fromCharCode(Ost + 65);

		for (var nIndex = 0; nIndex < Count + 1; ++nIndex)
			sResult += Letter;

		return sResult;
	}

	function IntToRussian(nValue, nFormat)
	{
		var sResult = '';
		// Формат: а,..,я,аа,..,яя,ааа,...,яяя,...
		nValue = repeatNumberingLvl(nValue, 870);
		var Num = nValue - 1;

		var Count = (Num - Num % 29) / 29;
		var Ost   = Num % 29;

		// Буквы й, ъ, ь - не участвуют
		if (Ost > 25)
			Ost += 3;
		else if (Ost > 24)
			Ost += 2;
		else if (Ost > 8)
			Ost++;

		var Letter;
		if (Asc.c_oAscNumberingFormat.RussianLower === nFormat)
			Letter = String.fromCharCode(Ost + 0x0430);
		else
			Letter = String.fromCharCode(Ost + 0x0410);

		for (var nIndex = 0; nIndex < Count + 1; ++nIndex)
			sResult += Letter;

		return sResult;
	}

	function IntToRoman(nValue, nFormat)
	{
		var sResult = '';
		nValue = repeatNumberingLvl(nValue, 32767);
		var Num = nValue;

		// Переводим число Num в римскую систему исчисления
		var Rims;

		if (Asc.c_oAscNumberingFormat.LowerRoman === nFormat)
			Rims = ['m', 'cm', 'd', 'cd', 'c', 'xc', 'l', 'xl', 'x', 'ix', 'v', 'iv', 'i', ' '];
		else
			Rims = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I', ' '];

		var Vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1, 0];

		var nIndex = 0;
		while (Num > 0)
		{
			while (Vals[nIndex] <= Num)
			{
				sResult += Rims[nIndex];
				Num -= Vals[nIndex];
			}

			nIndex++;

			if (nIndex >= Rims.length)
				break;
		}

		return sResult;
	}

	function IntToAiueo(nValue)
	{
		var sResult = '';
		var count = 1, numberOfLetters = 46;
		nValue = repeatNumberingLvl(nValue, 46);
		while (nValue > numberOfLetters)
		{
			++count;
			nValue -= numberOfLetters;
		}
		var letter = nValue % 45 === 0 ? 0xFF66 : (nValue % 46 === 0 ? 0xFF9D : 0xFF71 + nValue - 1);

		for (var i = 0; i < count; i++)
			sResult += String.fromCharCode(letter);

		return sResult;
	}

	function IntToAiueoFullWidth(nValue)
	{
		var sResult = '';

		var count = 1, numberOfLetters = 46, letter;
		nValue = repeatNumberingLvl(nValue, 46);
		while (nValue > numberOfLetters)
		{
			++count;
			nValue -= numberOfLetters;
		}
		if (nValue >= 1 && nValue <= 5)
		{
			letter = 0x30A2 + (nValue - 1) * 2;
		} else if (nValue >= 6 && nValue <= 17)
		{
			letter = 0x30AB + (nValue - 6) * 2;
		} else if (nValue >= 18 && nValue <= 21)
		{
			letter = 0x30C4 + (nValue - 18) * 2;
		} else if (nValue >= 22 && nValue <= 26)
		{
			letter = 0x30CB + nValue - 22;
		} else if (nValue >= 27 && nValue <= 31)
		{
			letter = 0x30D2 + (nValue - 27) * 3;
		} else if (nValue >= 32 && nValue <= 35)
		{
			letter = 0x30DF + nValue - 32;
		} else if (nValue >= 36 && nValue <= 38)
		{
			letter = 0x30E4 + nValue - 36;
		} else if (nValue >= 39 && nValue <= 43)
		{
			letter = 0x30E9 + nValue - 39;
		} else if (nValue === 44)
		{
			letter = 0x30EF + nValue - 44;
		} else if (nValue >= 45 && nValue <= 46)
		{
			letter = 0x30F2 + nValue - 45;
		}

		for (var i = 0; i < count; i++)
			sResult += String.fromCharCode(letter);

		return sResult;
	}

	function IntToLigature(nValue, nFormat)
	{
		var sResult = '';
		var count = 1, charArr;

		if (nFormat === Asc.c_oAscNumberingFormat.ArabicAbjad)
		{
			nValue = repeatNumberingLvl(nValue, 392);
			charArr = [
				0x0623, 0x0628, 0x062C, 0x062F,
				0x0647, 0x0648, 0x0632, 0x062D,
				0x0637, 0x064A, 0x0643, 0x0644,
				0x0645, 0x0646, 0x0633, 0x0639,
				0x0641, 0x0635, 0x0642, 0x0631,
				0x0634, 0x062A, 0x062B, 0x062E,
				0x0630, 0x0636, 0x0638, 0x063A
			];
		} else if (nFormat === Asc.c_oAscNumberingFormat.ArabicAlpha)
		{
			nValue = repeatNumberingLvl(nValue, 392);
			charArr = [
				0x0623, 0x0628, 0x062A, 0x062B,
				0x062C, 0x062D, 0x062E, 0x062F,
				0x0630, 0x0631, 0x0632, 0x0633,
				0x0634, 0x0635, 0x0636, 0x0637,
				0x0638, 0x0639, 0x063A, 0x0641,
				0x0642, 0x0643, 0x0644, 0x0645,
				0x0646, 0x0647, 0x0648, 0x064A
			];
		} else if (nFormat === Asc.c_oAscNumberingFormat.Chicago)
		{
			nValue = repeatNumberingLvl(nValue, 120);
			charArr = [0x002A, 0x2020, 0x2021, 0x00A7]
		} else if(nFormat === Asc.c_oAscNumberingFormat.Chosung)
		{
			nValue = repeatNumberingLvl(nValue, 14);
			charArr = [
				0x3131, 0x3134, 0x3137, 0x3139,
				0x3141, 0x3142, 0x3145, 0x3147,
				0x3148, 0x314A, 0x314B, 0x314C,
				0x314D, 0x314E
			]
		} else if (nFormat === Asc.c_oAscNumberingFormat.Ganada)
		{
			nValue = repeatNumberingLvl(nValue, 14);
			charArr = [
				0xAC00, 0xB098, 0xB2E4, 0xB77C,
				0xB9C8, 0xBC14, 0xC0AC, 0xC544,
				0xC790, 0xCC28, 0xCE74, 0xD0C0,
				0xD30C, 0xD558
			]
		}

		while (nValue > charArr.length)
		{
			++count;
			nValue -= charArr.length;
		}

		for (var i = 0; i < count; i++)
			sResult += String.fromCharCode(charArr[nValue - 1]);

		return sResult;
	}

	function IntToHebrew2(nValue)
	{
		var sResult = '';
		nValue = repeatNumberingLvl(nValue, 392);
		var numberOfLetters = 22, count = 0,
			charArr = [
				0x05D0, 0x05D1, 0x05D2, 0x05D3,
				0x05D4, 0x05D5, 0x05D6, 0x05D7,
				0x05D8, 0x05D9, 0x05DB, 0x05DC,
				0x05DE, 0x05E0, 0x05E1, 0x05E2,
				0x05E4, 0x05E6, 0x05E7, 0x05E8,
				0x05E9, 0x05EA
			];

		while (nValue > numberOfLetters)
		{
			++count;
			nValue -= numberOfLetters;
		}

		sResult = String.fromCharCode(charArr[nValue - 1]);

		while(count !== 0)
		{
			sResult += String.fromCharCode(charArr[21]);
			--count;
		}
		return sResult;
	}

	function IntToHindiConsonants(nValue)
	{
		var sResult = '';
		nValue = repeatNumberingLvl(nValue, 304);
		var count = 1, numberOfLetters = 18;

		var charArr = [
			0x0905, 0x0906, 0x0907, 0x0908,
			0x0909, 0x090A, 0x090B, 0x090C,
			0x090D, 0x090E, 0x090F, 0x0910,
			0x0911, 0x0912, 0x0913, 0x0914,
			0x0905, 0x0905
		];

		while (nValue > numberOfLetters)
		{
			++count;
			nValue -= numberOfLetters;
		}
		for (var i = 0; i < count; i++)
		{
			sResult += String.fromCharCode(charArr[nValue - 1]);

			if(nValue === 17)
			{
				sResult += String.fromCharCode(0x0902)
			} else if(nValue === 18)
			{
				sResult += String.fromCharCode(0x0903)
			}
		}
		return sResult;
	}

	function IntToIdeographDigital(nValue, nFormat)
	{
		var sResult = '';
		var digits;
		if (nFormat === Asc.c_oAscNumberingFormat.HindiNumbers)
		{
			nValue = repeatNumberingLvl(nValue, 32767);
			digits = [
				0x0966, 0x0967, 0x0968, 0x0969, 0x096A,
				0x096B, 0x096C, 0x096D, 0x096E, 0x096F
			];
		} else if (nFormat === Asc.c_oAscNumberingFormat.IdeographDigital)
		{
			digits = [
				0x3007, 0x4E00, 0x4E8C, 0x4E09,
				0x56DB, 0x4E94, 0x516D, 0x4E03,
				0x516B, 0x4E5D
			];
		} else if (nFormat === Asc.c_oAscNumberingFormat.JapaneseDigitalTenThousand)
		{
			digits = [
				0x3007, 0x4E00, 0x4E8C, 0x4E09,
				0x56DB, 0x4E94, 0x516D, 0x4E03,
				0x516B, 0x4E5D
			];
		}
		if (nFormat !== Asc.c_oAscNumberingFormat.JapaneseDigitalTenThousand || nValue < 10000)
		{
			var strValue = nValue.toString();
			for(var i = 0; i < strValue.length; i++)
			{
				sResult += String.fromCharCode(digits[strValue[i]]);
			}
		}
		return sResult;
	}

	function IntToHindiVowels(nValue)
	{
		var sResult = '';
		nValue = repeatNumberingLvl(nValue, 304);
		var count = 1, numberOfLetters = 37;

		while (nValue > numberOfLetters)
		{
			++count;
			nValue -= numberOfLetters;
		}

		for (var i = 0; i < count; i++)
		{
			sResult += String.fromCharCode(0x0915 + nValue - 1);
		}
		return sResult;
	}

	function IntToIdeographZodiac(nValue, nFormat)
	{
		var sResult = '';
		var digits = [];

		if (nFormat === Asc.c_oAscNumberingFormat.IdeographTraditional)
			digits = [
				0x7532, 0x4E59, 0x4E19, 0x4E01,
				0x620A, 0x5DF1, 0x5E9A, 0x8F9B,
				0x58EC, 0x7678
			];
		else if (nFormat === Asc.c_oAscNumberingFormat.IdeographZodiac)
			digits = [
				0x5B50, 0x4E11, 0x5BC5, 0x536F,
				0x8FB0, 0x5DF3, 0x5348, 0x672A,
				0x7533, 0x9149, 0x620C, 0x4EA5
			];

		sResult += nValue <= digits.length ? String.fromCharCode(digits[nValue - 1]) : nValue;
		return sResult;
	}

	function IntToIdeographZodiacTraditional(nValue)
	{
		var sResult = '';
		var digits = [
			0x7532, 0x5B50, 0x4E59, 0x4E11, 0x4E19, 0x5BC5,
			0x4E01, 0x536F, 0x620A, 0x8FB0, 0x5DF1, 0x5DF3,
			0x5E9A, 0x5348, 0x8F9B, 0x672A, 0x58EC, 0x7533,
			0x7678, 0x9149, 0x7532, 0x620D, 0x4E59, 0x4EA5,
			0x4E19, 0x5B50, 0x4E01, 0x4E11, 0x620A, 0x5BC5,
			0x5DF1, 0x536F, 0x5E9A, 0x8FB0, 0x8F9B, 0x5DF3,
			0x58EC, 0x5348, 0x7678, 0x672A, 0x7532, 0x7533,
			0x4E59, 0x9149, 0x4E19, 0x620D, 0x4E01, 0x4EA5,
			0x620A, 0x5B50, 0x5DF1, 0x4E11, 0x5E9A, 0x5BC5,
			0x8F9B, 0x536F, 0x58EC, 0x8FB0, 0x7678, 0x5DF3,
			0x7532, 0x5348, 0x4E59, 0x672A, 0x4E19, 0x7533,
			0x4E01, 0x9149, 0x620A, 0x620D, 0x5DF1, 0x4EA5,
			0x5E9A, 0x5B50, 0x8F9B, 0x4E11, 0x58EC, 0x5BC5,
			0x7678, 0x536F, 0x7532, 0x8FB0, 0x4E59, 0x5DF3,
			0x4E19, 0x5348, 0x4E01, 0x672A, 0x620A, 0x7533,
			0x5DF1, 0x9149, 0x5E9A, 0x620D, 0x8F9B, 0x4EA5,
			0x58EC, 0x5B50, 0x7678, 0x4E11, 0x7532, 0x5BC5,
			0x4E59, 0x536F, 0x4E19, 0x8FB0, 0x4E01, 0x5DF3,
			0x620A, 0x5348, 0x5DF1, 0x672A, 0x5E9A, 0x7533,
			0x8F9B, 0x9149, 0x58EC, 0x620D, 0x7678, 0x4EA5
		];

		while (nValue > digits.length / 2)
		{
			nValue -= digits.length / 2;
		}

		sResult += String.fromCharCode(digits[nValue * 2 - 2]) + String.fromCharCode(digits[nValue * 2 - 1]);
		return sResult;
	}

	function IntToIroha(nValue, nFormat)
	{
		var sResult = '';
		var digits = [];
		if (nFormat === Asc.c_oAscNumberingFormat.Iroha)
			digits = [
				0xFF72, 0xFF9B, 0xFF8A, 0xFF86,
				0xFF8E, 0xFF8D, 0xFF84, 0xFF81,
				0xFF98, 0xFF87, 0xFF99, 0xFF66,
				0xFF9C, 0xFF76, 0xFF96, 0xFF80,
				0xFF9A, 0xFF7F, 0xFF82, 0xFF88,
				0xFF85, 0xFF97, 0xFF91, 0xFF73,
				0x30F0, 0xFF89, 0xFF75, 0xFF78,
				0xFF94, 0xFF8F, 0xFF79, 0xFF8C,
				0xFF7A, 0xFF74, 0xFF83, 0xFF71,
				0xFF7B, 0xFF77, 0xFF95, 0xFF92,
				0xFF90, 0xFF7C, 0x30F1, 0xFF8B,
				0xFF93, 0xFF7E, 0xFF7D, 0xFF9D
			];
		else
		if (nFormat === Asc.c_oAscNumberingFormat.IrohaFullWidth)
			digits = [
				0x30A4, 0x30ED, 0x30CF, 0x30CB,
				0x30DB, 0x30D8, 0x30C8, 0x30C1,
				0x30EA, 0x30CC, 0x30EB, 0x30F2,
				0x30EF, 0x30AB, 0x30E8, 0x30BF,
				0x30EC, 0x30BD, 0x30C4, 0x30CD,
				0x30CA, 0x30E9, 0x30E0, 0x30A6,
				0x30F0, 0x30CE, 0x30AA, 0x30AF,
				0x30E4, 0x30DE, 0x30B1, 0x30D5,
				0x30B3, 0x30A8, 0x30C6, 0x30A2,
				0x30B5, 0x30AD, 0x30E6, 0x30E1,
				0x30DF, 0x30B7, 0x30F1, 0x30D2,
				0x30E2, 0x30BB, 0x30B9, 0x30F3
			]

		while (nValue > digits.length)
		{
			nValue -= digits.length;
		}

		sResult += String.fromCharCode(digits[nValue - 1]);
		return sResult;
	}

	function IntToChineseCounting(nValue)
	{
		var sResult = '';
		var arrChinese = [
			String.fromCharCode(0x25CB),
			String.fromCharCode(0x4E00),
			String.fromCharCode(0x4E8C),
			String.fromCharCode(0x4E09),
			String.fromCharCode(0x56DB),
			String.fromCharCode(0x4E94),
			String.fromCharCode(0x516D),
			String.fromCharCode(0x4E03),
			String.fromCharCode(0x516B),
			String.fromCharCode(0x4E5D),
			String.fromCharCode(0x5341)
		];

		var nQuotient  = (nValue / 10) | 0;
		var nRemainder = nValue - nQuotient * 10;

		if (nQuotient < 10 && nQuotient > 0)
		{
			if (0 !== nRemainder)
				sResult = arrChinese[nRemainder] + sResult;

			sResult = arrChinese[10] + sResult;

			if (1 === nQuotient)
				nQuotient = 0;
		}
		else
		{
			sResult = arrChinese[nRemainder] + sResult;
		}


		var nRemValue = nQuotient;
		while (nQuotient > 0)
		{
			nQuotient  = (nRemValue / 10) | 0;
			nRemainder = nRemValue - nQuotient * 10;

			sResult = arrChinese[nRemainder] + sResult;

			nRemValue = nQuotient;
		}
		return sResult;
	}

	function IntToChineseCountingThousand(nValue)
	{
		var sResult = '';
		var arrChinese = {
			0     : String.fromCharCode(0x25CB),
			1     : String.fromCharCode(0x4E00),
			2     : String.fromCharCode(0x4E8C),
			3     : String.fromCharCode(0x4E09),
			4     : String.fromCharCode(0x56DB),
			5     : String.fromCharCode(0x4E94),
			6     : String.fromCharCode(0x516D),
			7     : String.fromCharCode(0x4E03),
			8     : String.fromCharCode(0x516B),
			9     : String.fromCharCode(0x4E5D),
			10    : String.fromCharCode(0x5341),
			100   : String.fromCharCode(0x767E),
			1000  : String.fromCharCode(0x5343),
			10000 : String.fromCharCode(0x4E07)
		};
		if (nValue < 1000000)
		{
			var nRemValue = nValue;

			while (true)
			{
				var nTTQuotient  = (nRemValue / 10000) | 0;
				var nTTRemainder = nRemValue - nTTQuotient * 10000;

				nRemValue = nTTQuotient;

				var sGroup = "", isPrevZero = false;

				if (nTTQuotient > 0)
					sGroup += arrChinese[10000];
				else
					isPrevZero = true;

				if (nTTRemainder <= 0)
				{
					sResult = sGroup + sResult;

					if (nRemValue <= 0)
						break;

					continue;
				}

				var nQuotient  = (nTTRemainder / 1000) | 0;
				var nRemainder = nTTRemainder - nQuotient * 1000;

				if (0 !== nQuotient)
				{
					sGroup += arrChinese[nQuotient] + arrChinese[1000];
					isPrevZero = false;
				}
				else if (nTTQuotient > 0)
				{
					sGroup += arrChinese[0];
					isPrevZero = true;
				}

				if (nRemainder <= 0)
				{
					sResult = sGroup + sResult;

					if (nRemValue <= 0)
						break;

					continue;
				}

				nQuotient  = (nRemainder / 100) | 0;
				nRemainder = nRemainder - nQuotient * 100;

				if (0 !== nQuotient)
				{
					sGroup += arrChinese[nQuotient] + arrChinese[100];
					isPrevZero = false;
				}
				else if (!isPrevZero)
				{
					sGroup += arrChinese[0];
					isPrevZero = true;
				}

				if (nRemainder <= 0)
				{
					sResult = sGroup + sResult;

					if (nRemValue <= 0)
						break;

					continue;
				}

				nQuotient  = (nRemainder / 10) | 0;
				nRemainder = nRemainder - nQuotient * 10;

				if (0 !== nQuotient)
				{
					if (nValue < 20)
						sGroup += arrChinese[10];
					else
						sGroup += arrChinese[nQuotient] + arrChinese[10];

					isPrevZero = false;
				}
				else if (!isPrevZero)
				{
					sGroup += arrChinese[0];
					isPrevZero = true;
				}

				if (0 !== nRemainder)
					sGroup += arrChinese[nRemainder];

				sResult = sGroup + sResult;

				if (nRemValue <= 0)
					break;
			}
		}
		return sResult;
	}

	function IntToChineseLegalSimplified(nValue)
	{
		var sResult = '';
		var arrChinese = {
			0     : String.fromCharCode(0x96F6),
			1     : String.fromCharCode(0x58F9),
			2     : String.fromCharCode(0x8D30),
			3     : String.fromCharCode(0x53C1),
			4     : String.fromCharCode(0x8086),
			5     : String.fromCharCode(0x4F0D),
			6     : String.fromCharCode(0x9646),
			7     : String.fromCharCode(0x67D2),
			8     : String.fromCharCode(0x634C),
			9     : String.fromCharCode(0x7396),
			10    : String.fromCharCode(0x62FE),
			100   : String.fromCharCode(0x4F70),
			1000  : String.fromCharCode(0x4EDF),
			10000 : String.fromCharCode(0x842C)
		};
		if (nValue < 1000000)
		{
			var nRemValue = nValue;

			while (true)
			{
				var nTTQuotient  = (nRemValue / 10000) | 0;
				var nTTRemainder = nRemValue - nTTQuotient * 10000;

				nRemValue = nTTQuotient;

				var sGroup = "", isPrevZero = false;

				if (nTTQuotient > 0)
					sGroup += arrChinese[10000];
				else
					isPrevZero = true;

				if (nTTRemainder <= 0)
				{
					sResult = sGroup + sResult;

					if (nRemValue <= 0)
						break;

					continue;
				}

				var nQuotient  = (nTTRemainder / 1000) | 0;
				var nRemainder = nTTRemainder - nQuotient * 1000;

				if (0 !== nQuotient)
				{
					sGroup += arrChinese[nQuotient] + arrChinese[1000];
					isPrevZero = false;
				}
				else if (nTTQuotient > 0)
				{
					sGroup += arrChinese[0];
					isPrevZero = true;
				}

				if (nRemainder <= 0)
				{
					sResult = sGroup + sResult;

					if (nRemValue <= 0)
						break;

					continue;
				}

				nQuotient  = (nRemainder / 100) | 0;
				nRemainder = nRemainder - nQuotient * 100;

				if (0 !== nQuotient)
				{
					sGroup += arrChinese[nQuotient] + arrChinese[100];
					isPrevZero = false;
				}
				else if (!isPrevZero)
				{
					sGroup += arrChinese[0];
					isPrevZero = true;
				}

				if (nRemainder <= 0)
				{
					sResult = sGroup + sResult;

					if (nRemValue <= 0)
						break;

					continue;
				}

				nQuotient  = (nRemainder / 10) | 0;
				nRemainder = nRemainder - nQuotient * 10;

				if (0 !== nQuotient)
				{
					sGroup += arrChinese[nQuotient] + arrChinese[10];
					isPrevZero = false;
				}
				else if (!isPrevZero)
				{
					sGroup += arrChinese[0];
					isPrevZero = true;
				}

				if (0 !== nRemainder)
					sGroup += arrChinese[nRemainder];

				sResult = sGroup + sResult;

				if (nRemValue <= 0)
					break;
			}
		}
		return sResult;
	}

	function IdeographLegalTraditionalSplitting(digits, degrees, numberLessThen10000, isOver10000)
	{
		var resArr = [];
		var groups = {};

		groups[1000] = Math.floor(numberLessThen10000 / 1000);
		numberLessThen10000 %= 1000;

		groups[100] = Math.floor(numberLessThen10000 / 100);
		numberLessThen10000 %= 100;

		groups[10] = Math.floor(numberLessThen10000 / 10);
		numberLessThen10000 %= 10;

		groups[1] = numberLessThen10000;

		if (groups[1000])
		{
			resArr.push(digits[groups[1000] - 1], degrees[1]);

			if (!groups[100] && (groups[1] || groups[10]))
			{
				resArr.push('零');
			}
		}

		if (groups[100])
		{
			resArr.push(digits[groups[100] - 1], degrees[2]);

			if (!groups[10] && groups[1])
			{
				resArr.push('零');
			}
		}

		if (groups[10])
		{
			if (isOver10000 && !groups[1000] && !groups[100] && !groups[1])
			{
				resArr.push('零');
			}
			resArr.push(digits[groups[10] - 1], degrees[3]);
		}

		if (groups[1])
		{
			if (isOver10000 && !groups[1000] && !groups[100] && !groups[10])
			{
				resArr.push('零');
			}
			resArr.push(digits[numberLessThen10000 - 1]);
		}

		return resArr;
	}

	function IntToIdeographLegalTraditional(nValue)
	{
		var sResult = '';
		var digits = [
			String.fromCharCode(0x58F9),
			String.fromCharCode(0x8CB3),
			String.fromCharCode(0x53C3),
			String.fromCharCode(0x8086),
			String.fromCharCode(0x4F0D),
			String.fromCharCode(0x9678),
			String.fromCharCode(0x67D2),
			String.fromCharCode(0x634C),
			String.fromCharCode(0x7396)
		];
		var degrees = [
			'萬',
			'仟',
			'佰',
			'拾'
		];

		if (nValue < 10000)
		{
			sResult = IdeographLegalTraditionalSplitting(digits, degrees, nValue).join('');
		} else {
			if (nValue < 1000000)
			{
				var resultWith10000Reminder = ([degrees[0]]).concat(IdeographLegalTraditionalSplitting(digits, degrees, nValue % 10000, true));
				sResult = IdeographLegalTraditionalSplitting(digits, degrees, Math.floor(nValue / 10000)).concat(resultWith10000Reminder).join('');
			}
		}
		return sResult;
	}

	function IntToKorean(nValue, nFormat)
	{
		var sResult = '';
		if (nFormat === Asc.c_oAscNumberingFormat.KoreanDigital)
		{
			var digits = [
				String.fromCharCode(0xC601),
				String.fromCharCode(0xC77C),
				String.fromCharCode(0xC774),
				String.fromCharCode(0xC0BC),
				String.fromCharCode(0xC0AC),
				String.fromCharCode(0xC624),
				String.fromCharCode(0xC721),
				String.fromCharCode(0xCE60),
				String.fromCharCode(0xD314),
				String.fromCharCode(0xAD6C)
			];
		} else if (nFormat === Asc.c_oAscNumberingFormat.KoreanDigital2 || nFormat === Asc.c_oAscNumberingFormat.TaiwaneseDigital)
		{
			var digits = [
				String.fromCharCode(0x96F6),
				String.fromCharCode(0x4E00),
				String.fromCharCode(0x4E8C),
				String.fromCharCode(0x4E09),
				String.fromCharCode(0x56DB),
				String.fromCharCode(0x4E94),
				String.fromCharCode(0x516D),
				String.fromCharCode(0x4E03),
				String.fromCharCode(0x516B),
				String.fromCharCode(0x4E5D)
			];
			if (nFormat === Asc.c_oAscNumberingFormat.TaiwaneseDigital) digits[0] = String.fromCharCode(0x25CB);

		} else if (nFormat === Asc.c_oAscNumberingFormat.ThaiNumbers)
		{
			nValue = repeatNumberingLvl(nValue, 32767);
			var digits = [
				String.fromCharCode(0x0E50),
				String.fromCharCode(0x0E51),
				String.fromCharCode(0x0E52),
				String.fromCharCode(0x0E53),
				String.fromCharCode(0x0E54),
				String.fromCharCode(0x0E55),
				String.fromCharCode(0x0E56),
				String.fromCharCode(0x0E57),
				String.fromCharCode(0x0E58),
				String.fromCharCode(0x0E59)
			];
		}
		if (nFormat !== Asc.c_oAscNumberingFormat.KoreanDigital2 || nValue < 1000000)
		{
			var conv = decimalNumberConversion(nValue, digits.length);
			sResult = conv.map(function (num)
			{
				return digits[num];
			}).join('');
		}
		return sResult;
	}

	function IntToTaiwaneseCounting(nValue)
	{
		var sResult = '';
		var digits = [
			String.fromCharCode(0x5341),
			String.fromCharCode(0x4E00),
			String.fromCharCode(0x4E8C),
			String.fromCharCode(0x4E09),
			String.fromCharCode(0x56DB),
			String.fromCharCode(0x4E94),
			String.fromCharCode(0x516D),
			String.fromCharCode(0x4E03),
			String.fromCharCode(0x516B),
			String.fromCharCode(0x4E5D)
		];
		var conv = decimalNumberConversion(nValue, digits.length);
		if(nValue >= digits.length * 10)
		{
			digits[0] = String.fromCharCode(0x25CB);
			sResult = conv.map(function (num)
			{
				return digits[num];
			}).join('');
		} else {
			var previousIsPlus = false;
			sResult = conv.map(function (num, idx)
			{
				if (conv.length === 2)
				{
					if (idx === 0)
					{
						if (num === 1)
						{
							previousIsPlus = true;
							return digits[0];
						} else {
							previousIsPlus = true;
							return digits[num] + digits[0];
						}
					} else if (previousIsPlus && num === 0)
					{
						return '';
					}
				}
				return digits[num];
			}).join('');
		}
		return sResult;
	}

	function IntToThaiLetters(nValue)
	{
		nValue = repeatNumberingLvl(nValue, 1230);
		var spaces = [1, 3, 4, 5];
		var repeatAmount = Math.floor((nValue - 1) / 41) + 1;
		var repeatIndex = (nValue - 1) % 41;
		var currentSpace;
		if (repeatIndex <= 1) currentSpace = 0;
		else if (repeatIndex <= 2) currentSpace = spaces[0];
		else if (repeatIndex <= 31) currentSpace = spaces[1];
		else if (repeatIndex <= 32) currentSpace = spaces[2];
		else if (repeatIndex <= 40) currentSpace = spaces[3];
		return String.fromCharCode(0x0E01 + repeatIndex + currentSpace).repeat(repeatAmount);
	}

	function IntToHebrew1(nValue)
	{
		var resArr = [];
		var digits = {
			1000: [
				String.fromCharCode(0x05D0),
				String.fromCharCode(0x05D1),
				String.fromCharCode(0x05D2),
				String.fromCharCode(0x05D3),
				String.fromCharCode(0x05D4),
				String.fromCharCode(0x05D5),
				String.fromCharCode(0x05D6),
				String.fromCharCode(0x05D7),
				String.fromCharCode(0x05D8)

			],
			100: [
				String.fromCharCode(0x05E7),
				String.fromCharCode(0x05E8),
				String.fromCharCode(0x05E9),
				String.fromCharCode(0x05EA),
				String.fromCharCode(0x05DA),
				String.fromCharCode(0x05DD),
				String.fromCharCode(0x05DF),
				String.fromCharCode(0x05E3),
				String.fromCharCode(0x05E5)

			],
			10: [
				String.fromCharCode(0x05d9),
				String.fromCharCode(0x05DB),
				String.fromCharCode(0x05DC),
				String.fromCharCode(0x05DE),
				String.fromCharCode(0x05E0),
				String.fromCharCode(0x05E1),
				String.fromCharCode(0x05E2),
				String.fromCharCode(0x05E4),
				String.fromCharCode(0x05E6)

			],
			1: [
				String.fromCharCode(0x05d0),
				String.fromCharCode(0x05d1),
				String.fromCharCode(0x05d2),
				String.fromCharCode(0x05d3),
				String.fromCharCode(0x05d4),
				String.fromCharCode(0x05D5),
				String.fromCharCode(0x05D6),
				String.fromCharCode(0x05d7),
				String.fromCharCode(0x05D8)
			]
		}
		nValue = ((nValue - 1) % 392) + 1;

		if (nValue % 100 === 15)
		{
			nValue -= 15;
			resArr.push('וט');
		} else if (nValue % 100 === 16)
		{
			nValue -= 16;
			resArr.push('זט');
		}
		var nValueString = '' + nValue;

		for (var i = nValueString.length - 1; i >= 0; i -= 1)
		{
			var degree = Math.pow(10, nValueString.length - i - 1);
			if (nValueString[i] !== '0')
			{
				resArr.push(digits[degree][+nValueString[i] - 1]);
			}
		}

		return resArr.join('');

	}

	function IntToOrdinal(nValue, nLang)
	{
		var sResult = '';
		var textLang = languages[nLang];
		sResult	+= nValue;
		switch (textLang)
		{
			case 'de-DE':
			case 'pl-PL':
			case 'cs-CZ':
			{
				sResult += '.';
				break;
			}
			case 'el-GR':
			{
				sResult += 'ο';
				break;
			}
			case 'fr-FR':
			{
				if (nValue === 1)
				{
					sResult += 'er';
				} else {
					sResult += 'e';
				}
				break;
			}
			case 'it-IT':
			{
				sResult += '°';
				break;
			}
			case 'nl-NL':
			{
				sResult += 'e';
				break;
			}
			case 'pt-PT':
			case 'es-ES':
			case 'pt-BR':
			{
				sResult += 'º';
				break;
			}
			case 'ru-RU':
			{
				sResult += '-й';
				break;
			}
			case 'sv-SE':
			{
				if (nValue !== 11 && nValue !== 12)
				{
					if (nValue % 10 === 1)
					{
						sResult += ':a';
					} else if (nValue % 10 === 2)
					{
						sResult += ':a';
					} else {
						sResult += ':e';
					}
				} else {
					sResult += ':e';
				}
				break;
			}
			case 'bg-BG':
			case 'en-GB':
			case 'en-US':
			case 'zh-CN':
			case 'uk-UA':
			case 'ja-JP':
			case 'vi-VN':
			case 'lv-LV':
			case 'ko-KR':
			case 'sk-SK':
			case 'az-Latn-AZ':
			default:
			{
				if (nValue !== 11 && nValue !== 12 && nValue !== 13)
				{
					if (nValue % 10 === 1)
					{
						sResult += 'st';
					} else if (nValue % 10 === 2)
					{
						sResult += 'nd';
					} else if (nValue % 10 === 3)
					{
						sResult += 'rd';
					} else {
						sResult += 'th';
					}
				} else {
					sResult += 'th';
				}
				break;
			}
		}
		return sResult;
	}

	function taiwaneseCountingSplitting(digits, degrees, initialNumber, isBigNumber, isSplit)
	{
		var resArr = [];
		var copyNumber = initialNumber;
		var isGroup = {};
		var maxDegree = Math.pow(10, degrees.length);

		for (var i = 0; i < degrees.length + 1; i += 1)
		{
			if (copyNumber / maxDegree >= 1)
			{
				isGroup[maxDegree] = Math.floor(copyNumber / maxDegree);
			}
			copyNumber %= maxDegree;
			maxDegree /= 10;
		}

		if (isGroup[10000])
		{
			if (isGroup[10000] > 9)
			{
				resArr.push(taiwaneseCountingSplitting(digits, degrees, isGroup[10000], undefined, true).join(''));
			} else {
				resArr.push(digits[isGroup[10000] - 1]);
			}
			resArr.push(degrees[0]);
		} else if (initialNumber > 100000 && initialNumber % 10000 !== 0 && isGroup[1000])
		{
			resArr.push('零');
		}

		if (isGroup[1000])
		{
			resArr.push(digits[isGroup[1000] - 1]);
			resArr.push('千');
		} else if (initialNumber > 10000 && initialNumber % 1000 !== 0 && isGroup[100])
		{
			resArr.push('零');
		}

		if (isGroup[100])
		{
			resArr.push(digits[isGroup[100] - 1]);
			resArr.push('百');
		} else if (initialNumber > 1000 && initialNumber % 100 !== 0 && isGroup[10])
		{
			resArr.push('零');
		}

		if (isGroup[10])
		{
			if (isGroup[10] !== 1 || initialNumber > 100 || isSplit)
			{
				resArr.push(digits[isGroup[10] - 1]);
			}
			resArr.push('十');
		} else {
			if (initialNumber > 100 && initialNumber % 10 !== 0)
			{
				resArr.push('零');
			}
		}

		if (isGroup[1])
		{
			resArr.push(digits[isGroup[1] - 1]);
		}

		return resArr;
	};

	function IntToTaiwaneseCountingThousand(nValue)
	{
		var sResult = '';
		var digits = [
			String.fromCharCode(0x4E00),
			String.fromCharCode(0x4E8C),
			String.fromCharCode(0x4E09),
			String.fromCharCode(0x56DB),
			String.fromCharCode(0x4E94),
			String.fromCharCode(0x516D),
			String.fromCharCode(0x4E03),
			String.fromCharCode(0x516B),
			String.fromCharCode(0x4E5D)
		];
		var degrees = [
			'萬',
			'千',
			'百',
			'十'
		];

		if (nValue < 100000)
		{
			sResult = taiwaneseCountingSplitting(digits, degrees, nValue).join('');
		} else if (nValue >= 100000 && nValue < 1000000)
		{
			sResult = taiwaneseCountingSplitting(digits, degrees, nValue, true).join('');
		}
		return sResult;
	}

	function IntToKoreanLegal(nValue, nFormat)
	{
		var sResult = '';
		if (nValue < 100)
		{
			var answer = [];
			var digits = {
				1: [
					String.fromCharCode(0xD558, 0xB098),
					String.fromCharCode(0xB458),
					String.fromCharCode(0xC14B),
					String.fromCharCode(0xB137),
					String.fromCharCode(0xB2E4, 0xC12F),
					String.fromCharCode(0xC5EC, 0xC12F),
					String.fromCharCode(0xC77C, 0xACF1),
					String.fromCharCode(0xC5EC, 0xB35F),
					String.fromCharCode(0xC544 , 0xD649)
				],
				10: [
					String.fromCharCode(0xC5F4),
					String.fromCharCode(0xC2A4, 0xBB3C),
					String.fromCharCode(0xC11C, 0xB978),
					String.fromCharCode(0xB9C8, 0xD754),
					String.fromCharCode(0xC270),
					String.fromCharCode(0xC608, 0xC21C),
					String.fromCharCode(0xC77C, 0xD754),
					String.fromCharCode(0xC5EC, 0xB4E0),
					String.fromCharCode(0xC544, 0xD754)
				]
			};
			if (nValue / 10 >= 1)
			{
				answer.push(digits[10][Math.floor(nValue / 10) - 1]);
			}
			if (nValue % 10 >= 1)
			{
				answer.push(digits[1][(nValue % 10) - 1]);
			}
			sResult = answer.join('');
		} else {
			sResult = IntToAsiaCounting(nValue, nFormat, Asc.c_oAscNumberingFormat.KoreanCounting);
		}
		return sResult;
	}

	function IntToOrdinalText(nValue, nLang)
	{
		var textLang = languages[nLang];
		var ordinalText = getCardinalTextFromValue(textLang, nValue);
		var alphaBet = getAlphaBetForOrdinalText(textLang);
		switch (textLang)
		{
			case 'de-DE':
			{
				var arrOfDigits = ordinalText.arrAnswer;
				if (alphaBet[arrOfDigits[arrOfDigits.length - 1]])
				{
					arrOfDigits[arrOfDigits.length - 1] = alphaBet[arrOfDigits[arrOfDigits.length - 1]];
				} else {
					arrOfDigits[arrOfDigits.length - 1] += 'ste';
				}
				break;
			}
			case 'el-GR':
			{
				var arrOfDigits = ordinalText.arrAnswer;

				var letterOrdinalNumberLessThen100GR = function(num)
				{
					var resArr = [];
					if (num < 100 && num > 0)
					{
						if (num < 20)
						{
							resArr.push(alphaBet[1][num - 1]);
						}else {
							var reminder = num % 10;
							var degree10 = Math.floor(num / 10);
							resArr.push(alphaBet[10][degree10 - 2]);
							if (reminder)
							{
								resArr.push(alphaBet[1][reminder - 1]);
							}
						}
					}
					return resArr;
				};

				var cardinalTextGR = function(num)
				{
					var groups = {};
					var resArr = [];
					if (num < 1000000)
					{
						groups[1000] = Math.floor(num / 1000);
						num %= 1000;
						groups[100] = Math.floor(num / 100);
						num %= 100;
						groups[1] = num;
						if (groups[1000])
						{
							if (groups[1000] > 20)
							{
								var reminder;
								if (groups[1000] < 100)
								{
									reminder = letterOrdinalNumberLessThen100GR(groups[1000]);
								} else {
									reminder = [];
									if (arrOfDigits[0] === 'εκατό')
									{
										reminder.push('ένα');
									}
									for (var i = 0; arrOfDigits[i] !== 'χίλια' && arrOfDigits[i] !== 'χιλιάδες'; i += 1)
									{
										reminder.push(arrOfDigits[i]);
									}
								}
								reminder.push('χιλιοστό');
								if (groups[1000] % 100 === 0)
								{
									reminder = reminder.join('');
								}
								resArr.push(reminder);
							} else {
								resArr.push(alphaBet[1000][groups[1000] - 1] + 'χιλιοστό');
							}
						}

						if (groups[100])
						{
							resArr.push(alphaBet[100][groups[100] - 1]);
						}

						if (groups[1])
						{
							resArr.push(letterOrdinalNumberLessThen100GR(groups[1]));
						}
					}
					return resArr;
				};
				ordinalText.arrAnswer = cardinalTextGR(nValue);
				ordinalText.getConcatStringByRule = function (arr)
				{
					return arr.reduce(function (acc, b)
					{
						if (Array.isArray(b))
						{
							acc.push(b.join(' '));
						} else {
							acc.push(b);
						}
						return acc;
					}, []).join(' ');
				};
				break;
			}
			case 'fr-FR':
			{
				var arrOfDigits = ordinalText.arrAnswer;
				var switchingValue = arrOfDigits;
				if (Array.isArray(arrOfDigits[arrOfDigits.length - 1]))
				{
					var arr = arrOfDigits[arrOfDigits.length - 1];
					switchingValue = arr;
				}
				switch (switchingValue[switchingValue.length - 1])
				{
					case 'neuf':
						switchingValue[switchingValue.length - 1] = 'neuv';
						break;
					case 'cinq':
						switchingValue[switchingValue.length - 1] = 'cinqu';
						break;
					case 'un':
						if(switchingValue.length === 1 && arrOfDigits.length === 1)
						{
							switchingValue[switchingValue.length - 1] = 'premier';
						}
						break;
					case 'cents':
						switchingValue[switchingValue.length - 1] = 'cent';
						break;
					default:
						break;
				}
				if (nValue < 1000000)
				{
					var lastWord = switchingValue[switchingValue.length - 1];
					if (lastWord[lastWord.length - 1] === 'e' || lastWord[lastWord.length - 1] === 'e')
					{
						switchingValue[switchingValue.length - 1] = lastWord.slice(0, lastWord.length - 1);
					}
					if (switchingValue[switchingValue.length - 1] !== 'premier')
					{
						switchingValue[switchingValue.length - 1] += 'ième';
					}
				}
				break;
			}
			case 'it-IT':
			{
				var arrOfDigits = ordinalText.arrAnswer;
				var lastWord = arrOfDigits[arrOfDigits.length - 1];
				if (lastWord)
				{
					if (alphaBet[lastWord] && arrOfDigits.length === 1)
					{
						arrOfDigits[arrOfDigits.length - 1] = alphaBet[lastWord];
					} else if (lastWord === 'tré')
					{
						arrOfDigits[arrOfDigits.length - 1] = 'treesimo';
					} else {
						if (lastWord !== 'sei')
						{
							arrOfDigits[arrOfDigits.length - 1] = lastWord.substring(0, lastWord.length - 1);
						}
						if (lastWord === 'mila')
						{
							arrOfDigits.push('l');
						}
						arrOfDigits.push('esimo');
					}
				}
				break;
			}
			case 'nl-NL':
			{
				var arrOfDigits = ordinalText.arrAnswer;
				var lastWord = arrOfDigits[arrOfDigits.length - 1];
				if (alphaBet[lastWord])
				{
					arrOfDigits[arrOfDigits.length - 1] = alphaBet[lastWord];
				} else if (nValue < 20)
				{
					arrOfDigits[arrOfDigits.length - 1] += 'de';
				} else if (nValue < 1000000)
				{
					arrOfDigits[arrOfDigits.length - 1] += 'ste';
				}
				break;
			}
			case 'pt-BR':
			case 'es-ES':
			case 'cs-CZ':
			case 'pt-PT':
			{
				var arrOfDigits = ordinalText.arrAnswer;
				var newAnswerArr = [];
				var isSkip = false;
				for (var i = arrOfDigits.length - 1; i >= 0; i -= 1)
				{
					if (Array.isArray(arrOfDigits[i]))
					{
						var iterArr = arrOfDigits[i];
						for (var j = 0; j < iterArr.length; j += 1)
						{
							if (alphaBet[iterArr[j]])
							{
								newAnswerArr.push(alphaBet[iterArr[j]]);
							}
						}

					} else {
						if (isSkip)
						{
							newAnswerArr.push(arrOfDigits[i]);
						} else if (alphaBet[arrOfDigits[i]])
						{
							newAnswerArr.push(alphaBet[arrOfDigits[i]]);
							if (arrOfDigits[i] === 'mil' && nValue >= 2000)
							{
								newAnswerArr[newAnswerArr.length - 1] += 's';
							}
						}
						if (!isSkip && arrOfDigits[i] === 'mil')
						{
							isSkip = true;
						}
					}
				}

				ordinalText.arrAnswer = newAnswerArr.reverse();
				break;
			}
			case 'lv-LV':
			{
				var arrOfDigits = ordinalText.arrAnswer;
				var lastWord = arrOfDigits[arrOfDigits.length - 1];
				if (nValue >= 1000)
				{
					for (var i = 0; i < arrOfDigits.length; i += 1)
					{
						if (arrOfDigits[i] === 'tūkstotis' || arrOfDigits[i] === 'tūkstoši')
						{
							arrOfDigits[i] = 'tūkstoš';
						}
					}
				}
				if (alphaBet[lastWord])
				{
					arrOfDigits[arrOfDigits.length - 1] = alphaBet[lastWord];
				} else {
					if (nValue % 100 === 0 && nValue % 1000 !== 0)
					{
						arrOfDigits[arrOfDigits.length - 1] = lastWord.slice(0, lastWord.length - 1);
					}
					arrOfDigits[arrOfDigits.length - 1] += 'ais';
				}
				break;
			}
			case 'uk-UA':
			case 'pl-PL':
			case 'ru-RU':
			{
				var arrOfDigits = ordinalText.arrAnswer;
				var lastWord = arrOfDigits[arrOfDigits.length - 1];
				if (lastWord)
				{
					var thousandType;
					if (textLang === 'pl-PL')
					{
						switch (lastWord)
						{
							case 'tysiąc':
								thousandType = 'tysiączny';
								break;
							case 'tysiące':
							case 'tysięcy':
								thousandType = 'tysięczny';
								break;
							default:
								break;
						}
					} else if (lastWord.indexOf(alphaBet['thousandEntry']) !== -1)
					{
						thousandType = alphaBet['thousandType'];
					}
					if (thousandType)
					{
						var answer = [];
						answer.unshift(thousandType);
						arrOfDigits.pop();
						var lastWord = arrOfDigits[arrOfDigits.length - 1];
						if (typeof alphaBet['thousand'][1][lastWord] === 'string')
						{
							answer.unshift(alphaBet['thousand'][1][lastWord]);
							arrOfDigits.pop();
							lastWord = arrOfDigits[arrOfDigits.length - 1];
							if (alphaBet['thousand'][1][lastWord])
							{
								answer.unshift(alphaBet['thousand'][1][lastWord]);
								arrOfDigits.pop();
							}
						}
						lastWord = arrOfDigits[arrOfDigits.length - 1];
						if (alphaBet['thousand'][100][lastWord])
						{
							arrOfDigits.pop();
							answer.unshift(alphaBet['thousand'][100][lastWord]);
						}
						arrOfDigits.push(answer.join(''));
					} else {
						arrOfDigits[arrOfDigits.length - 1] = alphaBet['numbers'][arrOfDigits[arrOfDigits.length - 1]];
					}
					if (textLang === 'pl-PL')
					{
						for (var i = 0; i < arrOfDigits.length; i += 1)
						{
							if (arrOfDigits[i] === 'tysiączny')
							{
								break;
							}
							if (alphaBet['tens'][arrOfDigits[i]])
							{
								arrOfDigits[i] = alphaBet['tens'][arrOfDigits[i]];
							}
						}
					}
				}
				ordinalText.getConcatStringByRule = function (arr)
				{
					return arr.join(' ');
				};
				break;
			}
			case 'bg-BG':
			{
				var arrOfDigits = ordinalText.arrAnswer;
				for (var i = 0; i < arrOfDigits.length; i += 1)
				{
					if (arrOfDigits[i] === 'хиляда')
					{
						arrOfDigits[i] = 'хиляди';
					}
				}

				var lastWord = arrOfDigits[arrOfDigits.length - 1];
				if (alphaBet[1][lastWord] || alphaBet[100][lastWord])
				{
					arrOfDigits[arrOfDigits.length - 1] = alphaBet[1][lastWord] || alphaBet[100][lastWord];
				} else if (nValue % 100 !== 0)
				{
					arrOfDigits[arrOfDigits.length - 1] += 'ият';
				}

				if (Math.floor(nValue / 1000) === 1)
				{
					arrOfDigits.unshift('една');
				}
				for (var i = 0; i < arrOfDigits.length - 1; i += 1)
				{
					if (alphaBet[100][arrOfDigits[i]]
						&& arrOfDigits[i + 1]
						&& arrOfDigits[i + 1] !== 'хилядният'
						&& arrOfDigits[i + 1] !== 'и')
					{
						arrOfDigits[i] += ' и';
					}
				}
				break;
			}
			case 'sv-SE':
			{
				var arrOfDigits = ordinalText.arrAnswer;
				if (alphaBet[arrOfDigits[arrOfDigits.length - 1]])
				{
					arrOfDigits[arrOfDigits.length - 1] = alphaBet[arrOfDigits[arrOfDigits.length - 1]];
				} else if (nValue % 100 < 20)
				{
					arrOfDigits[arrOfDigits.length - 1] += 'de';
				} else if (nValue < 1000000)
				{
					arrOfDigits[arrOfDigits.length - 1] += 'nde';
				}
				break;
			}
			case 'sk-SK':
			{
				var arrOfDigits = ordinalText.arrAnswer;
				if (nValue % 10 !== 0 && nValue % 100 > 10)
				{
					if (alphaBet[arrOfDigits[arrOfDigits.length - 2]])
					{
						arrOfDigits[arrOfDigits.length - 2] = alphaBet[arrOfDigits[arrOfDigits.length - 2]];
					}
				}
				if (Math.floor(nValue / 1000) === 1)
				{
					arrOfDigits.shift();
				}
				if (alphaBet[arrOfDigits[arrOfDigits.length - 1]])
				{
					arrOfDigits[arrOfDigits.length - 1] = alphaBet[arrOfDigits[arrOfDigits.length - 1]];
				}
				for (var i = 1; i < arrOfDigits.length; i += 1)
				{
					if (arrOfDigits[i] === 'sto' || arrOfDigits[i] === 'stý')
					{
						if (alphaBet[100][arrOfDigits[i - 1]])
						{
							arrOfDigits[i - 1] = alphaBet[100][arrOfDigits[i - 1]];
						}
					} else if (alphaBet['other'][arrOfDigits[i - 1]])
					{
						arrOfDigits[i - 1] = alphaBet['other'][arrOfDigits[i - 1]];
					}
				}
				break;
			}

			case 'zh-CN':
			case 'ja-JP':
			case 'ko-KR':
			case 'az-Latn-AZ':
			case 'en-US':
			case 'vi-VN':
			case 'en-GB':
			default:
			{
				var arrOfDigits = ordinalText.arrAnswer;
				var changeArray = arrOfDigits;
				if (Array.isArray(changeArray[changeArray.length - 1]))
				{
					arrOfDigits = changeArray[changeArray.length - 1];
				}
				if (alphaBet[arrOfDigits[arrOfDigits.length - 1]])
				{
					arrOfDigits[arrOfDigits.length - 1] = alphaBet[arrOfDigits[arrOfDigits.length - 1]];
				} else {
					if (nValue % 10 === 0 && nValue % 100 !== 0)
					{
						arrOfDigits[arrOfDigits.length - 1] = arrOfDigits[arrOfDigits.length - 1].slice(0, arrOfDigits[arrOfDigits.length - 1].length - 1) + 'ie';
					}
					arrOfDigits[arrOfDigits.length - 1] += 'th';

				}
				break;
			}
		}
		return ordinalText.getConcatStringByRule(ordinalText.arrAnswer).sentenceCase();
	}

	var splitHindiCounting = function(alphaBet, degrees, num)
	{
		var resArr = [];
		var groups = {};
		groups[1000] = Math.floor(num / 1000);
		num %= 1000;
		groups[100] = Math.floor(num / 100);
		num %= 100;
		groups[1] = num;
		if (groups[1000])
		{
			resArr.push(alphaBet[(groups[1000] - 1) % 99], degrees[1000]);
		}
		if (groups[100])
		{
			resArr.push(alphaBet[(groups[100] - 1) % 99], degrees[100]);
		}
		if (groups[1])
		{
			resArr.push(alphaBet[(groups[1] - 1) % 99]);
		}
		return resArr;
	};

	function IntToHindiCounting(nValue)
	{
		var alphaBet = [
			"एक","दो","तीन","चार","पांच","छह","सात","आठ","नौ","दस","ग्यारह",
			"बारह","तेरह","चौदह","पंद्रह","सोलह","सत्रह","अठारह","उन्नीस","बीस",
			"इकीस","बाईस","तेइस","चौबीस","पच्चीस","छब्बीस","सताइस","अट्ठाइस",
			"उनतीस","तीस","इकतीस","बतीस","तैंतीस","चौंतीस","पैंतीस","छतीस",
			"सैंतीस","अड़तीस","उनतालीस","चालीस","इकतालीस","बयालीस","तैतालीस",
			"चवालीस","पैंतालीस","छयालिस","सैंतालीस","अड़तालीस","उनचास",
			"पचास","इक्यावन","बावन","तिरपन","चौवन","पचपन","छप्पन","सतावन",
			"अठावन","उनसठ","साठ","इकसठ","बासठ","तिरसठ","चौंसठ","पैंसठ",
			"छियासठ","सड़सठ","अड़सठ","उनहतर","सत्तर","इकहतर","बहतर",
			"तिहतर","चौहतर","पचहतर","छिहतर","सतहतर","अठहतर","उन्नासी","अस्सी",
			"इक्यासी","बयासी","तिरासी","चौरासी","पचासी","छियासी","सतासी",
			"अट्ठासी","नवासी","नब्बे","इक्यानवे","बानवे","तिरानवे","चौरानवे",
			"पचानवे","छियानवे","सतानवे","अट्ठानवे","निन्यानवे"
		];
		var degrees = {
			100: "सौ",
			1000: "हज़ार"
		}
		var adaptVal = ((nValue - 1) % 9999) + 1;

		return splitHindiCounting(alphaBet, degrees, adaptVal).join(' ');
	}

	function thaiCountingLess100(num, digits, isInitialValueGreat100)
	{
		var resArr = [];
		if (num > 0 && num < 100)
		{
			if (num <= 10)
			{
				if (isInitialValueGreat100)
				{
					if (num !== 1)
					{
						resArr.push(digits[num - 1]);
					} else {
						resArr.push('เอ็ด');
					}
				} else {
					resArr.push(digits[num - 1]);
				}
			} else {
				var degree10 = Math.floor(num / 10);
				var reminder10 = num % 10;

				if (degree10 !== 1)
				{
					if (degree10 === 2)
					{
						resArr.push('ยี่');
					} else {
						resArr.push(digits[degree10 - 1]);
					}
				}
				resArr.push(digits[9]);

				if (reminder10)
				{
					if (reminder10 !== 1)
					{
						resArr.push(digits[reminder10 - 1]);
					} else {
						resArr.push('เอ็ด');
					}
				}
			}
		}
		return resArr;
	}

	function splitThaiCounting(num, digits)
	{
		if (num >= 1000000000)
		{
			return ['ศูนย์'];
		}
		var resArr = [];
		var groups = {};
		groups[1000000] = Math.floor(num / 1000000);
		num %= 1000000;
		groups[100000] = Math.floor(num / 100000);
		num %= 100000;
		groups[10000] = Math.floor(num / 10000);
		num %= 10000;
		groups[1000] = Math.floor(num / 1000);
		num %= 1000;
		groups[100] = Math.floor(num / 100);
		num %= 100;
		groups[1] = num;

		if (groups[1000000])
		{
			if (groups[1000000] >= 100)
			{
				resArr = resArr.concat(splitThaiCounting(groups[1000000]));
			} else {
				resArr = resArr.concat(thaiCountingLess100(groups[1000000], digits));
			}
			resArr.push('ล้าน');
		}
		if (groups[100000])
		{
			resArr = resArr.concat(thaiCountingLess100(groups[100000], digits));
			resArr.push('แสน');
		}
		if (groups[10000])
		{
			resArr = resArr.concat(thaiCountingLess100(groups[10000], digits));
			resArr.push('หมื่น');
		}
		if (groups[1000])
		{
			resArr = resArr.concat(thaiCountingLess100(groups[1000], digits));
			resArr.push('พัน');
		}
		if (groups[100])
		{
			resArr = resArr.concat(thaiCountingLess100(groups[100], digits));
			resArr.push('ร้อย');
		}
		if (groups[1])
		{
			resArr = resArr.concat(thaiCountingLess100(groups[1], digits, groups[100] || groups[1000] || groups[10000] || groups[100000] || groups[1000000]));
		}
		return resArr;
	}

	function IntToThaiCounting(nValue)
	{
		var digits = [
			'หนึ่ง',
			'สอง',
			'สาม',
			'สี่',
			'ห้า',
			'หก',
			'เจ็ด',
			'แปด',
			'เก้า',
			'สิบ'
		];

		return splitThaiCounting(nValue, digits).join('');
	}

	function letterNumberLessThen100VI(num, digits)
	{
		var resArr = [];
		if (num > 0 && num < 100)
		{
			if (num <= 10)
			{
				resArr.push(digits[num - 1]);
			} else {
				var degree10 = Math.floor(num / 10);
				var reminder = num % 10;
				if (degree10 !== 1)
				{
					resArr.push(digits[degree10 - 1]);
				}
				resArr.push('mười');
				if (reminder)
				{
					resArr.push(digits[reminder - 1]);
				}
			}
		}
		return resArr;
	}

	function vietnameseCounting(num, digits)
	{
		var adaptVal = (num - 1) % 1000 + 1;
		var resArr = [];
		var groups = {};
		groups[1000] = Math.floor(adaptVal / 1000);
		adaptVal %= 1000;
		groups[100] = Math.floor(adaptVal / 100);
		adaptVal %= 100;
		groups[1] = adaptVal;

		if (groups[1000])
		{
			resArr.push(digits[groups[1000] - 1], 'ngàn');
		}
		if (groups[100])
		{
			resArr.push(digits[groups[100] - 1], 'trăm');
			if (groups[1] / 10 < 1 && groups[1] !== 0)
			{
				resArr.push('lẻ');
			}
		}
		if (groups[1])
		{
			resArr = resArr.concat(letterNumberLessThen100VI(groups[1], digits));
		}
		return resArr;
	}

	function IntToVietnameseCounting(nValue)
	{
		var digits = ['một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười'];

		return vietnameseCounting(nValue, digits).join(' ');
	}

	/**
	 * Переводим числовое значение в строку с заданным форматом нумерации
	 * @param nValue {number}
	 * @param nFormat {Asc.c_oAscNumberingFormat}
	 * @returns {string}
	 */
	function IntToNumberFormat(nValue, nFormat, oLang)
	{
		var nLang;
		if (oLang)
		{
			nLang = oLang.Val;
			if (availableIdeographLanguages.indexOf(languages[nLang]) !== -1)
			{
				nLang = oLang.EastAsia;
			} else if (availableBidiLanguages.indexOf(languages[nLang]) !== -1)
			{
				nLang = oLang.Bidi;
			}
		}
		var sResult = "";

		switch (nFormat)
		{
			case Asc.c_oAscNumberingFormat.Bullet:
			{
				break;
			}

			case Asc.c_oAscNumberingFormat.Decimal:
			{
				sResult = "" + nValue;
				break;
			}

			case Asc.c_oAscNumberingFormat.DecimalZero:
			{
				sResult = "" + nValue;

				if (1 === sResult.length)
					sResult = "0" + sResult;
				break;
			}

			case Asc.c_oAscNumberingFormat.DecimalEnclosedCircleChinese:
			{
				if (nValue <= 10)
				{
					sResult = String.fromCharCode(0x2460 + nValue - 1);
				}
				else
				{
					sResult = "" + nValue;
				}
				break;
			}

			case Asc.c_oAscNumberingFormat.DecimalEnclosedCircle:
			{
				if (nValue <= 20)
				{
					sResult = String.fromCharCode(0x2460 + nValue - 1);
				}
				else
				{
					sResult = "" + nValue;
				}

				break;
			}

			case Asc.c_oAscNumberingFormat.LowerLetter:
			case Asc.c_oAscNumberingFormat.UpperLetter:
			{

				sResult = IntToLetter(nValue, nFormat);
				break;
			}

			case Asc.c_oAscNumberingFormat.RussianLower:
			case Asc.c_oAscNumberingFormat.RussianUpper:
			{


				sResult = IntToRussian(nValue, nFormat);
				break;
			}

			case Asc.c_oAscNumberingFormat.LowerRoman:
			case Asc.c_oAscNumberingFormat.UpperRoman:
			{
				sResult = IntToRoman(nValue, nFormat);
				break;
			}

			case Asc.c_oAscNumberingFormat.Aiueo:
			{
				sResult = IntToAiueo(nValue);
				break;
			}

			case Asc.c_oAscNumberingFormat.AiueoFullWidth:
			{
				sResult = IntToAiueoFullWidth(nValue);
				break;
			}

			case Asc.c_oAscNumberingFormat.ArabicAbjad:
			case Asc.c_oAscNumberingFormat.ArabicAlpha:
			case Asc.c_oAscNumberingFormat.Chicago:
			case Asc.c_oAscNumberingFormat.Chosung:
			case Asc.c_oAscNumberingFormat.Ganada:
			{
				sResult = IntToLigature(nValue, nFormat);
				break;
			}

			case Asc.c_oAscNumberingFormat.DecimalEnclosedFullstop:
			case Asc.c_oAscNumberingFormat.DecimalEnclosedParen:
			{
				var startNumber = nFormat === Asc.c_oAscNumberingFormat.DecimalEnclosedFullstop ? 0x2488 : 0x2474;
				sResult = (nValue >= 1 && nValue <= 20) ? String.fromCharCode(startNumber + nValue - 1) : "" + nValue;

				break;
			}

			case Asc.c_oAscNumberingFormat.DecimalFullWidth:
			case Asc.c_oAscNumberingFormat.DecimalHalfWidth:
			{
				var zeroInHex = nFormat === Asc.c_oAscNumberingFormat.DecimalFullWidth ? 0xFF10 : 0x0030;
				var strValue = String(nValue);
				for(var i = 0; i < strValue.length; i++)
				{
					sResult += String.fromCharCode(zeroInHex + parseInt(strValue[i]));
				}
				break;
			}

			case Asc.c_oAscNumberingFormat.Hebrew2:
			{
				sResult = IntToHebrew2(nValue);
			break;
			}

			case Asc.c_oAscNumberingFormat.Hex:
			{
				if (nValue <= 0xFFFF)
				{
					sResult = (nValue+0x10000).toString(16).substr(-4).toUpperCase();
					sResult = sResult.replace(/^0+/, '');
				}
				break;
			}

			case Asc.c_oAscNumberingFormat.HindiConsonants:
			{
				sResult = IntToHindiConsonants(nValue);
				break;
			}

			case Asc.c_oAscNumberingFormat.HindiNumbers:
			case Asc.c_oAscNumberingFormat.IdeographDigital:
			case Asc.c_oAscNumberingFormat.JapaneseDigitalTenThousand:
			{
				sResult = IntToIdeographDigital(nValue, nFormat);
				break;
			}

			case Asc.c_oAscNumberingFormat.HindiVowels:
			{
				sResult = IntToHindiVowels(nValue);
				break;
			}

			case Asc.c_oAscNumberingFormat.IdeographEnclosedCircle:
			{
				sResult += nValue <= 10 ? String.fromCharCode(0x3220 + nValue - 1) : nValue;
				break;
			}

			case Asc.c_oAscNumberingFormat.IdeographTraditional:
			case Asc.c_oAscNumberingFormat.IdeographZodiac:
			{
				sResult = IntToIdeographZodiac(nValue, nFormat);

				break;
			}

			case Asc.c_oAscNumberingFormat.IdeographZodiacTraditional:
			{
				sResult = IntToIdeographZodiacTraditional(nValue);
				break;
			}


			case Asc.c_oAscNumberingFormat.Iroha:
			case Asc.c_oAscNumberingFormat.IrohaFullWidth:
			{
				sResult = IntToIroha(nValue, nFormat);
				break;
			}

			case Asc.c_oAscNumberingFormat.ChineseCounting:
			{
				sResult = IntToChineseCounting(nValue);

				break;
			}
			case Asc.c_oAscNumberingFormat.ChineseCountingThousand:
			{
				sResult = IntToChineseCountingThousand(nValue);
				break;
			}
			case Asc.c_oAscNumberingFormat.ChineseLegalSimplified:
			{
				sResult = IntToChineseLegalSimplified(nValue);
				break;
			}
			case Asc.c_oAscNumberingFormat.IdeographLegalTraditional:
			{
				sResult = IntToIdeographLegalTraditional(nValue);
				break;
			}
			case Asc.c_oAscNumberingFormat.JapaneseLegal:
			case Asc.c_oAscNumberingFormat.KoreanCounting:
			case Asc.c_oAscNumberingFormat.JapaneseCounting:
				sResult = IntToAsiaCounting(nValue, nFormat);
				break;
			case Asc.c_oAscNumberingFormat.KoreanDigital:
			case Asc.c_oAscNumberingFormat.ThaiNumbers:
			case Asc.c_oAscNumberingFormat.KoreanDigital2:
			case Asc.c_oAscNumberingFormat.TaiwaneseDigital:
				sResult = IntToKorean(nValue, nFormat);
				break;
			case Asc.c_oAscNumberingFormat.None:
				sResult = '';
				break;
			case Asc.c_oAscNumberingFormat.NumberInDash:
				var dash = String.fromCharCode(0x002D);
				sResult = dash + ' ' + nValue + ' ' + dash;
				break;
			case Asc.c_oAscNumberingFormat.TaiwaneseCounting:
				sResult = IntToTaiwaneseCounting(nValue);
				break;
			case Asc.c_oAscNumberingFormat.ThaiLetters:
				sResult = IntToThaiLetters(nValue);
				break;
			case Asc.c_oAscNumberingFormat.CardinalText:
				var cardinalText = getCardinalTextFromValue(languages[nLang], nValue);
				sResult = cardinalText.getConcatStringByRule(cardinalText.arrAnswer).sentenceCase();
				break;

			case Asc.c_oAscNumberingFormat.Custom:
				sResult = '' + nValue;
				break;
			case Asc.c_oAscNumberingFormat.Hebrew1:
				sResult = IntToHebrew1(nValue);
				break;
			case Asc.c_oAscNumberingFormat.Ordinal:
				sResult = IntToOrdinal(nValue, nLang);
				break;
			case Asc.c_oAscNumberingFormat.TaiwaneseCountingThousand:
				sResult = IntToTaiwaneseCountingThousand(nValue);
				break;
			case Asc.c_oAscNumberingFormat.KoreanLegal:

				sResult = IntToKoreanLegal(nValue, nFormat);
				break;
			case Asc.c_oAscNumberingFormat.OrdinalText:
					sResult = IntToOrdinalText(nValue, nLang);
				break;
			case Asc.c_oAscNumberingFormat.HindiCounting:
				sResult = IntToHindiCounting(nValue);
				break;
			case Asc.c_oAscNumberingFormat.ThaiCounting:
				sResult = IntToThaiCounting(nValue, nFormat);
				break;
			case Asc.c_oAscNumberingFormat.DollarText:
				sResult += nValue;
				break;
			case Asc.c_oAscNumberingFormat.BahtText:
				sResult += nValue;
				break;
			case Asc.c_oAscNumberingFormat.VietnameseCounting:
				sResult = IntToVietnameseCounting(nValue);
				break;
		}

		return sResult;
	}

	/**
	 * Корректируем значение размера шрифта к допустимому
	 * @param {number} nFontSize
	 * @param {boolean} isCeil
	 */
	function CorrectFontSize(nFontSize, isCeil)
	{
		return isCeil ? Math.ceil(nFontSize * 2) / 2 : Math.floor(nFontSize * 2) / 2;
	}

	// Non-breaking-space сюда не добавлять!
	var c_oAscSpaces = [];
	c_oAscSpaces[0x000A] = 1;
	c_oAscSpaces[0x0020] = 1;
	c_oAscSpaces[0x2002] = 1;
	c_oAscSpaces[0x2003] = 1;
	c_oAscSpaces[0x2005] = 1;
	c_oAscSpaces[0x3000] = 1;
	c_oAscSpaces[0xFEFF] = 1;

	/**
	 * Проверяем является ли заданный юникод пробелом
	 * @param nUnicode {number}
	 * @returns {boolean}
	 */
	function IsSpace(nUnicode)
	{
		return !!(c_oAscSpaces[nUnicode]);
	}

	/**
	 * Переводим числовое значение в Hex строку
	 * @param nValue
	 * @returns {string}
	 */
	function IntToHex(nValue)
	{
		var sRes = nValue.toString(16);
		if (sRes.length === 2)
			sRes = "00" + sRes;
		else if (sRes.length === 3)
			sRes = "0" + sRes;
		return sRes;
	}

	/**
	 * Проверяем является ли заданный юникод цифрой
	 * @param nUnicode {number}
	 * @returns {boolean}
	 */
	function IsDigit(nUnicode)
	{
		return (nUnicode >= 48 && nUnicode <= 57);
	}

	/**
	 * Проверяем является ли заданный юникод цифрой
	 * @param nUnicode {number}
	 * @returns {boolean}
	 */
	function IsLetter(nUnicode)
	{
		return (String.fromCodePoint(nUnicode).search(new RegExp("^\\p{L}", 'u')) !== -1);
	}

	/**
	 * Присутствует ли символ заданного шрифта в шрифте ASCW3
	 * @param sFontFamily
	 * @param nUnicode
	 * @returns {boolean}
	 */
	function IsAscFontSupport(sFontFamily, nUnicode)
	{
		return ("Segoe UI Symbol" === sFontFamily
			&& (0x25C9 === nUnicode
				|| 0x25CB === nUnicode
				|| 0x2611 === nUnicode
				|| 0x2610 === nUnicode));
	}

	function ExecuteNoHistory(f, oLogicDocument, oThis, args)
	{
		// TODO: Надо перевести все редакторы на StartNoHistoryMode/EndNoHistoryMode

		let oState = null, isTableId = false;
		if (oLogicDocument && oLogicDocument.IsDocumentEditor && oLogicDocument.IsDocumentEditor())
		{
			oState = oLogicDocument.StartNoHistoryMode();
		}
		else
		{
			AscCommon.History.TurnOff && AscCommon.History.TurnOff();

			if (AscCommon.g_oTableId && !AscCommon.g_oTableId.IsOn())
			{
				AscCommon.g_oTableId.TurnOff();
				isTableId = true;
			}
		}

		let result = f.apply(oThis, args);

		if (oLogicDocument && oLogicDocument.IsDocumentEditor && oLogicDocument.IsDocumentEditor())
		{
			oLogicDocument.EndNoHistoryMode(oState);
		}
		else
		{
			AscCommon.History.TurnOn && AscCommon.History.TurnOn();
			if (isTableId)
				AscCommon.g_oTableId.TurnOn();
		}

		return result;
	}

	function IsAbbreviation(sWord)
	{
		for (var oIterator = sWord.getUnicodeIterator(); oIterator.check(); oIterator.next())
		{
			var nCharCode = oIterator.value();
			if (IsHangul(nCharCode) || IsCJKIdeographs(nCharCode))
				return false;

			if (0x73 === nCharCode)
			{
				oIterator.next();
				if (oIterator.check())
					return false;

				break;
			}

			let sChar = String.fromCodePoint(nCharCode);
			if (sChar.toUpperCase() !== sChar)
				return false;
		}

		return true;
	}

	var g_oUserColorById = {}, g_oUserNextColorIndex = 0;

	function getUserColorById(userId, userName, isDark, isNumericValue)
	{
		if ((!userId || "" === userId) && (!userName || "" === userName))
			return new CColor(0, 0, 0, 255);

		var res;
		if (g_oUserColorById.hasOwnProperty(userId))
		{
			res = g_oUserColorById[userId];
		}
		else if (g_oUserColorById.hasOwnProperty(userName))
		{
			res = g_oUserColorById[userName];
		}
		else
		{
			var nColor = Asc.c_oAscArrUserColors[g_oUserNextColorIndex % Asc.c_oAscArrUserColors.length];
			++g_oUserNextColorIndex;

			res = g_oUserColorById[userId || userName] = new CUserCacheColor(nColor);
		}

		if (!res)
			return new CColor(0, 0, 0, 255);

		var oColor = true === isDark ? res.Dark : res.Light;
		return true === isNumericValue ? ((oColor.r << 16) & 0xFF0000) | ((oColor.g << 8) & 0xFF00) | (oColor.b & 0xFF) : oColor;
	}

	function isNullOrEmptyString(str)
	{
		return (str == undefined) || (str == null) || (str == "");
	}

	function unleakString(s) {
		//todo remove in the future
		//https://bugs.chromium.org/p/v8/issues/detail?id=2869
		return (' ' + s).substr(1);
	}
	function readValAttr(attr){
		if(attr()){
			var val = attr()["val"];
			return val ? val : null;
		}
		return null;
	}
	function getNumFromXml(val) {
		return val ? val - 0 : null;
	}
	function getColorFromXml(attr) {
		if(attr()){
			var vals = attr();
			if(null != vals["theme"]) {
				return AscCommonExcel.g_oColorManager.getThemeColor(getNumFromXml(vals["theme"]), getNumFromXml(vals["tint"]));
			} else if(null != vals["rgb"]){
				return new AscCommonExcel.RgbColor(0x00ffffff & getNumFromXml(vals["rgb"]));
			}
		}
		return null;
	}
	function getBoolFromXml(val) {
		return "0" !== val && "false" !== val && "off" !== val;
	}

	function CUserCacheColor(nColor)
	{
		this.Light = null;
		this.Dark = null;
		this.init(nColor);
	}

	CUserCacheColor.prototype.init = function (nColor)
	{
		var r = (nColor >> 16) & 0xFF;
		var g = (nColor >> 8) & 0xFF;
		var b = nColor & 0xFF;

		var Y = Math.max(0, Math.min(255, 0.299 * r + 0.587 * g + 0.114 * b));
		var Cb = Math.max(0, Math.min(255, 128 - 0.168736 * r - 0.331264 * g + 0.5 * b));
		var Cr = Math.max(0, Math.min(255, 128 + 0.5 * r - 0.418688 * g - 0.081312 * b));

		if (Y > 63)
			Y = 63;

		var R = Math.max(0, Math.min(255, Y + 1.402 * (Cr - 128))) | 0;
		var G = Math.max(0, Math.min(255, Y - 0.34414 * (Cb - 128) - 0.71414 * (Cr - 128))) | 0;
		var B = Math.max(0, Math.min(255, Y + 1.772 * (Cb - 128))) | 0;

		this.Light = new CColor(r, g, b, 255);
		this.Dark = new CColor(R, G, B, 255);
	};

	function loadScript(url, onSuccess, onError)
	{
		if (window["NATIVE_EDITOR_ENJINE"] === true || window["Native"] !== undefined)
		{
			onSuccess();
			return;
		}

		if (window["AscDesktopEditor"] && window["local_load_add"])
		{
			var _context = {
				"completeLoad": function ()
								{
									return onSuccess();
								}
			};
			window["local_load_add"](_context, "sdk-all-from-min", url);
			var _ret_param = window["AscDesktopEditor"]["LoadJS"](url);
			if (2 != _ret_param)
				window["local_load_remove"](url);
			if (_ret_param == 1)
			{
				setTimeout(onSuccess, 1);
				return;
			}
			else if (_ret_param == 2)
				return;
		}

		var backoff = new AscCommon.Backoff(AscCommon.g_oBackoffDefaults);
		loadScriptWithBackoff(backoff, url, onSuccess, onError);
	}

	function loadScriptWithBackoff(backoff, url, onSuccess, onError){
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;
		script.onload = onSuccess;
		script.onerror = function() {
			backoff.attempt(onError, function() {
				loadScriptWithBackoff(backoff, url, onSuccess, onError);
			});
		};

		// Fire the loading
		document.head.appendChild(script);
	}

	function loadSdk(sdkName, onSuccess, onError)
	{
		if (window['AscNotLoadAllScript'])
		{
			onSuccess();
		}
		else
		{
			loadScript('./../../../../sdkjs/' + sdkName + `/sdk-all.js?t=${new Date().getTime()}`, onSuccess, onError);
		}
	}

	function loadChartStyles(onSuccess, onError) {
		loadScript('../../../../sdkjs/common/Charts/ChartStyles.js', onSuccess, onError);
	}

	function getAltGr(e)
	{
		var ctrlKey = e.metaKey || e.ctrlKey;
		var altKey = e.altKey;
		return (altKey && (AscBrowser.isMacOs ? !ctrlKey : ctrlKey));
	}

	function getColorSchemeByName(sName)
	{
		for(var i = 0; i <  AscCommon.g_oUserColorScheme.length; ++i)
		{
			var tmp = AscCommon.g_oUserColorScheme[i];
			if(tmp && tmp.name === sName)
			{
				return getColorSchemeByIdx(i);
			}
		}
		return null;
	}


	function getColorSchemeByIdx(idx) {
		var tmp = AscCommon.g_oUserColorScheme[idx];
		if(tmp)
		{
			var scheme = new AscFormat.ClrScheme(), _c;
			scheme.name = tmp.name;

			_c = tmp.get_dk1();
			scheme.colors[8] = AscFormat.CreateUniColorRGB(_c.r, _c.g, _c.b);
			_c = tmp.get_lt1();
			scheme.colors[12] = AscFormat.CreateUniColorRGB(_c.r, _c.g, _c.b);
			_c = tmp.get_dk2();
			scheme.colors[9] = AscFormat.CreateUniColorRGB(_c.r, _c.g, _c.b);
			_c = tmp.get_lt2();
			scheme.colors[13] = AscFormat.CreateUniColorRGB(_c.r, _c.g, _c.b);
			_c = tmp.get_accent1();
			scheme.colors[0] = AscFormat.CreateUniColorRGB(_c.r, _c.g, _c.b);
			_c = tmp.get_accent2();
			scheme.colors[1] = AscFormat.CreateUniColorRGB(_c.r, _c.g, _c.b);
			_c = tmp.get_accent3();
			scheme.colors[2] = AscFormat.CreateUniColorRGB(_c.r, _c.g, _c.b);
			_c = tmp.get_accent4();
			scheme.colors[3] = AscFormat.CreateUniColorRGB(_c.r, _c.g, _c.b);
			_c = tmp.get_accent5();
			scheme.colors[4] = AscFormat.CreateUniColorRGB(_c.r, _c.g, _c.b);
			_c = tmp.get_accent6();
			scheme.colors[5] = AscFormat.CreateUniColorRGB(_c.r, _c.g, _c.b);
			_c = tmp.get_hlink();
			scheme.colors[11] = AscFormat.CreateUniColorRGB(_c.r, _c.g, _c.b);
			_c = tmp.get_folHlink();
			scheme.colors[10] = AscFormat.CreateUniColorRGB(_c.r, _c.g, _c.b);
			return scheme;
		}
		return null;
	}

	function getAscColorScheme(_scheme, theme)
	{

		// theme colors
		var elem, _c;
		var _rgba = {R: 0, G: 0, B: 0, A: 255};
		elem = new AscCommon.CAscColorScheme();
		elem.scheme = _scheme;
		elem.name = _scheme.name;

		_scheme.colors[8].Calculate(theme, null, null, null, _rgba);
		_c = _scheme.colors[8].RGBA;
		elem.putColor(new AscCommon.CColor(_c.R, _c.G, _c.B));

		_scheme.colors[12].Calculate(theme, null, null, null, _rgba);
		_c = _scheme.colors[12].RGBA;
		elem.putColor(new AscCommon.CColor(_c.R, _c.G, _c.B));

		_scheme.colors[9].Calculate(theme, null, null, null, _rgba);
		_c = _scheme.colors[9].RGBA;
		elem.putColor(new AscCommon.CColor(_c.R, _c.G, _c.B));

		_scheme.colors[13].Calculate(theme, null, null, null, _rgba);
		_c = _scheme.colors[13].RGBA;
		elem.putColor(new AscCommon.CColor(_c.R, _c.G, _c.B));

		_scheme.colors[0].Calculate(theme, null, null, null, _rgba);
		_c = _scheme.colors[0].RGBA;
		elem.putColor(new AscCommon.CColor(_c.R, _c.G, _c.B));

		_scheme.colors[1].Calculate(theme, null, null, null, _rgba);
		_c = _scheme.colors[1].RGBA;
		elem.putColor(new AscCommon.CColor(_c.R, _c.G, _c.B));

		_scheme.colors[2].Calculate(theme, null, null, null, _rgba);
		_c = _scheme.colors[2].RGBA;
		elem.putColor(new AscCommon.CColor(_c.R, _c.G, _c.B));

		_scheme.colors[3].Calculate(theme, null, null, null, _rgba);
		_c = _scheme.colors[3].RGBA;
		elem.putColor(new AscCommon.CColor(_c.R, _c.G, _c.B));

		_scheme.colors[4].Calculate(theme, null, null, null, _rgba);
		_c = _scheme.colors[4].RGBA;
		elem.putColor(new AscCommon.CColor(_c.R, _c.G, _c.B));

		_scheme.colors[5].Calculate(theme, null, null, null, _rgba);
		_c = _scheme.colors[5].RGBA;
		elem.putColor(new AscCommon.CColor(_c.R, _c.G, _c.B));

		_scheme.colors[11].Calculate(theme, null, null, null, _rgba);
		_c = _scheme.colors[11].RGBA;
		elem.putColor(new AscCommon.CColor(_c.R, _c.G, _c.B));

		_scheme.colors[10].Calculate(theme, null, null, null, _rgba);
		_c = _scheme.colors[10].RGBA;
		elem.putColor(new AscCommon.CColor(_c.R, _c.G, _c.B));
		return elem;
	}

	function getIndexColorSchemeInArray(result, asc_color_scheme) {
		for(var j = 0; j < result.length; ++j) {
			if(result[j].isEqual(asc_color_scheme)) {
				return j;
			}
		}
		return -1;
	}

	function checkAddColorScheme(result, asc_color_scheme, nStartIndex) {
		var nIndex =  getIndexColorSchemeInArray(result, asc_color_scheme);
		if(nIndex > -1){
			return nIndex;
		}
		var nStartIndex_ = nStartIndex;
		if(nStartIndex === null) {
			nStartIndex_ = result.length;
		}
		result.splice(nStartIndex_, 0, asc_color_scheme);
		return nStartIndex_;
	}

	// Данный список шрифтов используется совместно с настройкой BalanceSingleByteDoubleByteWidth
	// если список будет изменяться, то проверить работу этой настройки с новыми шрифтами, если работать не будет, тогда
	// надо будет иметь два разных списка
	const EAST_ASIA_FONTS = [
		"MingLiU", "PMingLiU", "MingLiU_HKSCS-ExtB", "MingLiU-ExtB",
		"SimSun", "NSimSun", "SimSun-ExtA", "SimSun-ExtB",
		"MS Mincho",
		"Batang",
		"Arial Unicode MS",
		"Microsoft JhengHei", "Microsoft YaHei", "SimHei", "DengXian",
		"Meiryo", "MS Gothic", "MS PGothic", "MS UI Gothic", "Yu Gothic",
		"Dotum", "Gulim", "Malgun Gothic"
	];

	function IsEastAsianFont(sName)
	{
		for (let oIterator = sName.getUnicodeIterator(); oIterator.check(); oIterator.next())
		{
			let	nUnicode = oIterator.value();
			if (isEastAsianScript(nUnicode))
				return true;
		}

		for (let nIndex = 0, nCount = EAST_ASIA_FONTS.length; nIndex < nCount; ++nIndex)
		{
			if (sName === EAST_ASIA_FONTS[nIndex])
				return true;
		}

		return false;
	}

	function isEastAsianScript(value)
	{
		// Bopomofo (3100–312F)
		// Bopomofo Extended (31A0–31BF)
		// CJK Unified Ideographs (4E00–9FEA)
		// CJK Unified Ideographs Extension A (3400–4DB5)
		// CJK Unified Ideographs Extension B (20000–2A6D6)
		// CJK Unified Ideographs Extension C (2A700–2B734)
		// CJK Unified Ideographs Extension D (2B740–2B81D)
		// CJK Unified Ideographs Extension E (2B820–2CEA1)
		// CJK Unified Ideographs Extension F (2CEB0–2EBE0)
		// CJK Compatibility Ideographs (F900–FAFF)
		// CJK Compatibility Ideographs Supplement (2F800–2FA1F)
		// Kangxi Radicals (2F00–2FDF)
		// CJK Radicals Supplement (2E80–2EFF)
		// CJK Strokes (31C0–31EF)
		// Ideographic Description Characters (2FF0–2FFF)
		// Hangul Jamo (1100–11FF)
		// Hangul Jamo Extended-A (A960–A97F)
		// Hangul Jamo Extended-B (D7B0–D7FF)
		// Hangul Compatibility Jamo (3130–318F)
		// Halfwidth and Fullwidth Forms (FF00–FFEF)
		// Hangul Syllables (AC00–D7AF)
		// Hiragana (3040–309F)
		// Kana Extended-A (1B100–1B12F)
		// Kana Supplement (1B000–1B0FF)
		// Kanbun (3190–319F)
		// Katakana (30A0–30FF)
		// Katakana Phonetic Extensions (31F0–31FF)
		// Lisu (A4D0–A4FF)
		// Miao (16F00–16F9F)
		// Nushu (1B170–1B2FF)
		// Tangut (17000–187EC)
		// Tangut Components (18800–18AFF)
		// Yi Syllables (A000–A48F)
		// Yi Radicals (A490–A4CF)

		return ((0x3100 <= value && value <= 0x312F)
			|| (0x31A0 <= value && value <= 0x31BF)
			|| (0x4E00 <= value && value <= 0x9FEA)
			|| (0x3400 <= value && value <= 0x4DB5)
			|| (0x20000 <= value && value <= 0x2A6D6)
			|| (0x2A700 <= value && value <= 0x2B734)
			|| (0x2B740 <= value && value <= 0x2B81D)
			|| (0x2B820 <= value && value <= 0x2CEA1)
			|| (0x2CEB0 <= value && value <= 0x2EBE0)
			|| (0xF900 <= value && value <= 0xFAFF)
			|| (0x2F800 <= value && value <= 0x2FA1F)
			|| (0x2F00 <= value && value <= 0x2FDF)
			|| (0x2E80 <= value && value <= 0x2EFF)
			|| (0x31C0 <= value && value <= 0x31EF)
			|| (0x2FF0 <= value && value <= 0x2FFF)
			|| (0x1100 <= value && value <= 0x11FF)
			|| (0xA960 <= value && value <= 0xA97F)
			|| (0xD7B0 <= value && value <= 0xD7FF)
			|| (0x3130 <= value && value <= 0x318F)
			|| (0xFF00 <= value && value <= 0xFFEF)
			|| (0xAC00 <= value && value <= 0xD7AF)
			|| (0x3040 <= value && value <= 0x309F)
			|| (0x1B100 <= value && value <= 0x1B12F)
			|| (0x1B000 <= value && value <= 0x1B0FF)
			|| (0x3190 <= value && value <= 0x319F)
			|| (0x30A0 <= value && value <= 0x30FF)
			|| (0x31F0 <= value && value <= 0x31FF)
			|| (0xA4D0 <= value && value <= 0xA4FF)
			|| (0x16F00 <= value && value <= 0x16F9F)
			|| (0x1B170 <= value && value <= 0x1B2FF)
			|| (0x17000 <= value && value <= 0x187EC)
			|| (0x18800 <= value && value <= 0x18AFF)
			|| (0xA000 <= value && value <= 0xA48F)
			|| (0xA490 <= value && value <= 0xA4CF));
	}

	function IsHangul(nCharCode)
	{
		if (nCharCode < 0x1100)
			return false;

		return (IsHangulSyllables(nCharCode)
			|| IsHangulCompatibilityJamo(nCharCode)
			|| IsHangulJamo(nCharCode)
			|| IsHangulJamoExtendedA(nCharCode)
			|| IsHangulJamoExtendedB(nCharCode));
	}
	function IsCJKIdeographs(nCharCode)
	{
		if (nCharCode < 0x3400)
			return false;

		return (IsCJKUnifiedIdeographs(nCharCode)
			|| IsCJKUnifiedIdeographsExtensionA(nCharCode)
			|| IsCJKUnifiedIdeographsExtensionB(nCharCode)
			|| IsCJKUnifiedIdeographsExtensionC(nCharCode)
			|| IsCJKUnifiedIdeographsExtensionD(nCharCode)
			|| IsCJKUnifiedIdeographsExtensionE(nCharCode)
			|| IsCJKUnifiedIdeographsExtensionF(nCharCode)
			|| IsCJKUnifiedIdeographsExtensionG(nCharCode)
			|| IsCJKCompatibilityIdeographs(nCharCode)
			|| IsCJKCompatibilityIdeographsSupplement(nCharCode));
	}

	function IsHangulSyllables(nCharCode)
	{
		return (0xAC00 <= nCharCode && nCharCode <= 0xD7AF);
	}
	function IsHangulJamo(nCharCode)
	{
		return (0x1100 <= nCharCode && nCharCode <= 0x11FF);
	}
	function IsHangulJamoExtendedA(nCharCode)
	{
		return (0xA960 <= nCharCode && nCharCode <= 0xA97F);
	}
	function IsHangulJamoExtendedB(nCharCode)
	{
		return (0xD7B0 <= nCharCode && nCharCode <= 0xD7FF);
	}
	function IsHangulCompatibilityJamo(nCharCode)
	{
		return (0x3130 <= nCharCode && nCharCode <= 0x318F);
	}
	function IsCJKUnifiedIdeographs(nCharCode)
	{
		return (0x4E00 <= nCharCode && nCharCode <= 0x9FFF);
	}
	function IsCJKUnifiedIdeographsExtensionA(nCharCode)
	{
		return (0x3400 <= nCharCode && nCharCode <= 0x4DBF);
	}
	function IsCJKUnifiedIdeographsExtensionB(nCharCode)
	{
		return (0x20000 <= nCharCode && nCharCode <= 0x2A6DF);
	}
	function IsCJKUnifiedIdeographsExtensionC(nCharCode)
	{
		return (0x2A700 <= nCharCode && nCharCode <= 0x2B73F);
	}
	function IsCJKUnifiedIdeographsExtensionD(nCharCode)
	{
		return (0x2B740 <= nCharCode && nCharCode <= 0x2B81F);
	}
	function IsCJKUnifiedIdeographsExtensionE(nCharCode)
	{
		return (0x2B820 <= nCharCode && nCharCode <= 0x2CEAF);
	}
	function IsCJKUnifiedIdeographsExtensionF(nCharCode)
	{
		return (0x2CEB0 <= nCharCode && nCharCode <= 0x2EBEF);
	}
	function IsCJKUnifiedIdeographsExtensionG(nCharCode)
	{
		return (0x30000 <= nCharCode && nCharCode <= 0x3134F);
	}
	function IsCJKCompatibilityIdeographs(nCharCode)
	{
		return (0xF900 <= nCharCode && nCharCode <= 0xFAFF);
	}
	function IsCJKCompatibilityIdeographsSupplement(nCharCode)
	{
		return (0x2F800 <= nCharCode && nCharCode <= 0x2FA1F);
	}

	var g_oIdCounter = new CIdCounter();

	window.Asc.g_signature_drawer = null;
	function CSignatureDrawer(id, api, w, h)
	{
		window.Asc.g_signature_drawer = this;

		this.Api = api;
		this.CanvasParent = document.getElementById(id);

		this.Canvas = document.createElement('canvas');
		this.Canvas.style.position = "absolute";
		this.Canvas.style.left = "0px";
		this.Canvas.style.top = "0px";

		var _width = parseInt(this.CanvasParent.offsetWidth);
		var _height = parseInt(this.CanvasParent.offsetHeight);
		if (0 == _width)
			_width = 300;
		if (0 == _height)
			_height = 80;

		this.Canvas.width = _width;
		this.Canvas.height = _height;

		this.CanvasParent.appendChild(this.Canvas);

		this.Image = "";
		this.ImageHtml = null;

		this.Text = "";
		this.Font = "Arial";
		this.Size = 10;
		this.Italic = true;
		this.Bold = false;

		this.Width = w;
		this.Height = h;

		this.CanvasReturn = null;

		this.IsAsync = false;
	}

	CSignatureDrawer.prototype.getCanvas = function()
	{
		return (this.CanvasReturn == null) ? this.Canvas : this.CanvasReturn;
	};

	CSignatureDrawer.prototype.getImages = function()
	{
		if (!this.isValid())
			return ["", ""];

		this.CanvasReturn = document.createElement("canvas");
		this.CanvasReturn.width = (this.Width * AscCommon.g_dKoef_mm_to_pix);
		this.CanvasReturn.height = (this.Height * AscCommon.g_dKoef_mm_to_pix);

		if (this.Text != "")
			this.drawText();
		else
			this.drawImage();

		var _ret = [];
		_ret.push(this.CanvasReturn.toDataURL("image/png"));

		var _ctx = this.CanvasReturn.getContext("2d");
		_ctx.strokeStyle = "#FF0000";
		_ctx.lineWidth = 2;

		_ctx.moveTo(0, 0);
		_ctx.lineTo(this.CanvasReturn.width, this.CanvasReturn.height);
		_ctx.moveTo(0, this.CanvasReturn.height);
		_ctx.lineTo(this.CanvasReturn.width, 0);

		_ctx.stroke();

		_ret.push(this.CanvasReturn.toDataURL("image/png"));

		this.CanvasReturn = null;
		return _ret;
	};

	CSignatureDrawer.prototype.setText = function(text, font, size, isItalic, isBold)
	{
		if (this.IsAsync)
		{
			this.Text = text;
			return;
		}

		this.Image = "";
		this.ImageHtml = null;

		this.Text = text;
		this.Font = font;
		this.Size = size;
		this.Italic = isItalic;
		this.Bold = isBold;

		this.IsAsync = true;
        AscFonts.FontPickerByCharacter.checkText(this.Text, this, function() {

        	this.IsAsync = false;

            var loader     = AscCommon.g_font_loader;
            var fontinfo   = AscFonts.g_fontApplication.GetFontInfo(font);
            var isasync    = loader.LoadFont(fontinfo, function() {
                window.Asc.g_signature_drawer.Api.sync_EndAction(Asc.c_oAscAsyncActionType.Information, Asc.c_oAscAsyncAction.LoadFont);
                window.Asc.g_signature_drawer.drawText();
            });

            if (false === isasync)
            {
                this.drawText();
            }

        });
	};

	CSignatureDrawer.prototype.drawText = function()
	{
        var _oldTurn = this.Api.isViewMode;
        var _oldMarks = this.Api.ShowParaMarks;
        this.Api.isViewMode = true;
        this.Api.ShowParaMarks = false;
		AscFormat.ExecuteNoHistory(AscCommon.DrawTextByCenter, this, []);
        this.Api.isViewMode = _oldTurn;
        this.Api.ShowParaMarks = _oldMarks;
	};

	CSignatureDrawer.prototype.drawImage = function()
	{
		var _canvas = this.getCanvas();
		var w = _canvas.width;
		var h = _canvas.height;
		var _ctx = _canvas.getContext("2d");
		_ctx.clearRect(0, 0, w, h);

		var im_w = this.ImageHtml.width;
		var im_h = this.ImageHtml.height;

		var _x = 0;
		var _y = 0;
		var _w = 0;
		var _h = 0;

		var koef1 = w / h;
		var koef2 = im_w / im_h;

		if (koef1 > koef2)
		{
			_h = h;
			_w = (koef2 * _h) >> 0;
			_y = 0;
			_x = (w - _w) >> 1;
		}
		else
		{
			_w = w;
			_h = (_w / koef2) >> 0;
			_x = 0;
			_y = (h - _h) >> 1;
		}

		_ctx.drawImage(this.ImageHtml, _x, _y, _w, _h);
	};

	CSignatureDrawer.prototype.selectImage = CSignatureDrawer.prototype["selectImage"] = function()
	{
		this.Text = "";
		window["AscDesktopEditor"]["OpenFilenameDialog"]("images", false, function(_file) {
			var file = _file;
			if (Array.isArray(file))
				file = file[0];
			if (!file)
				return;

            var _drawer = window.Asc.g_signature_drawer;
            _drawer.Image = window["AscDesktopEditor"]["GetImageBase64"](file);

            _drawer.ImageHtml = new Image();
            _drawer.ImageHtml.onload = function()
            {
                window.Asc.g_signature_drawer.drawImage();
            };
            _drawer.ImageHtml.src = _drawer.Image;
            _drawer = null;
		});
	};

	CSignatureDrawer.prototype.isValid = function()
	{
		return (this.Image != "" || this.Text != "");
	};

	CSignatureDrawer.prototype.destroy = function()
	{
		window.Asc.g_signature_drawer.CanvasParent.removeChild(this.Canvas);
		delete window.Asc.g_signature_drawer;
	};

	function CSignatureImage()
	{
		this.ImageValidBase64 = "";
		this.ImageInvalidBase64 = "";

		this.ImageValid = null;
		this.ImageInvalid = null;

		this.Valid = false;
		this.Loading = 0;

		this.Remove = function()
		{
			this.ImageValidBase64 = "";
			this.ImageInvalidBase64 = "";

			this.ImageValid = null;
			this.ImageInvalid = null;

			this.Valid = false;
			this.Loading = 0;
		};

		this.Register = function(_api, _guid)
		{
			if (_api.ImageLoader.map_image_index[_guid])
				return;
			var _obj = { Image : (this.Valid ? this.ImageValid : this.ImageInvalid), Status : AscFonts.ImageLoadStatus.Complete, src : _guid };
			_api.ImageLoader.map_image_index[_guid] = _obj;
		};

		this.Unregister = function(_api, _guid)
		{
			if (_api.ImageLoader.map_image_index[_guid])
				delete _api.ImageLoader.map_image_index[_guid];
		};
	}

	function CShortcuts()
	{
		this.List = {};

		this.CustomCounter = 0;
		this.CustomActions = {};
	}
	CShortcuts.prototype.Add = function(nType, nCode, isCtrl, isShift, isAlt)
	{
		this.List[this.private_GetIndex(nCode, isCtrl, isShift, isAlt)] = nType;
	};
	CShortcuts.prototype.Get = function(nCode, isCtrl, isShift, isAlt)
	{
		var nType = this.List[this.private_GetIndex(nCode, isCtrl, isShift, isAlt)];
		return (undefined !== nType ? nType : 0);
	};
	CShortcuts.prototype.private_GetIndex = function(nCode, isCtrl, isShift, isAlt)
	{
		return ((nCode << 8) | (isCtrl ? 4 : 0) | (isShift ? 2 : 0) | (isAlt ? 1 : 0));
	}
	CShortcuts.prototype.CheckType = function(nType)
	{
		for (var nIndex in this.List)
		{
			if (this.List[nIndex] === nType)
				return {KeyCode : nIndex >>> 8, CtrlKey : !!(nIndex & 4), ShiftKey : !!(nIndex & 2), AltKey : !!(nIndex & 1)};
		}

		return null;
	};
	CShortcuts.prototype.Remove = function(nCode, isCtrl, isShift, isAlt)
	{
		delete this.List[this.private_GetIndex(nCode, isCtrl, isShift, isAlt)];
	};
	CShortcuts.prototype.RemoveByType = function(nType)
	{
		for (var nIndex in this.List)
		{
			if (this.List[nIndex] === nType)
				delete this.List[nIndex];
		}
	};
	CShortcuts.prototype.GetNewCustomType = function()
	{
		return (0x00FF0000 | (this.CustomCounter++));
	};
	CShortcuts.prototype.IsCustomType = function(nType)
	{
		return (nType >= 0x00FF0000);
	};
	CShortcuts.prototype.GetCustomAction = function(nType)
	{
		return this.CustomActions[nType];
	};
	CShortcuts.prototype.AddCustomActionSymbol = function(nCharCode, sFont)
	{
		var nType = this.GetNewCustomType();
		this.CustomActions[nType] = new CCustomShortcutActionSymbol(nCharCode, sFont);
		return nType;
	};

	function CCustomShortcutActionSymbol(nCharCode, sFont)
	{
		this.CharCode = nCharCode;
		this.Font     = sFont;
	}
	CCustomShortcutActionSymbol.prototype.Type = AscCommon.c_oAscCustomShortcutType.Symbol;

    /////////////////////////////////////////////////////////
	///////////////       CRYPT      ////////////////////////
	/////////////////////////////////////////////////////////
    AscCommon.EncryptionMessageType = {
        Encrypt : 0,
        Decrypt : 1
    };
    function CEncryptionData()
    {
    	this._init = false;

        this.arrData = [];
        this.arrImages = [];

        this.handleChangesCallback = null;
        this.isChangesHandled = false;

        this.cryptoMode = 0; // start crypto mode
		this.isChartEditor = false;

        this.isExistDecryptedChanges = false; // был ли хоть один запрос на расшифровку данных (были ли чужие изменения)

        this.cryptoPrefix = (window["AscDesktopEditor"] && window["AscDesktopEditor"]["GetEncryptedHeader"]) ? window["AscDesktopEditor"]["GetEncryptedHeader"]() : "ENCRYPTED;";
        this.cryptoPrefixLen = this.cryptoPrefix.length;

        this.editorId = null;

        this.nextChangesTimeoutId = -1;

        this.isPasswordCryptoPresent = false;

        this.init = function()
		{
			this._init = true;
		};

        this.isInit = function()
        {
			return this._init;
        };

        this.isNeedCrypt = function()
		{
			if (window.g_asc_plugins)
			{
                if (!window.g_asc_plugins.isRunnedEncryption())
                    return false;
            }

            if (!window["AscDesktopEditor"])
                return false;

            if (this.isChartEditor)
            	return false;

            if (2 == this.cryptoMode)
            	return true;

            if (0 === window["AscDesktopEditor"]["CryptoMode"])
            	return false;

            return true;
		};

		this.isCryptoImages = function()
		{
            return (this.isNeedCrypt() && this.isPasswordCryptoPresent);
		};

        this.addCryproImagesFromDialog = function(callback)
		{
			var _this = this;
            window["AscDesktopEditor"]["OpenFilenameDialog"]("images", true, function(files) {
				if (!files)
					return;
                if (!Array.isArray(files)) // string detect
                    files = [files];
                if (0 === files.length)
                	return;

				var _files = [];

				var _options = { isImageCrypt: true, callback: callback, ext : [] };

				for (var i = 0; i < files.length; i++)
				{
                    _files.push(window["AscDesktopEditor"]["GetImageBase64"](files[i], true));
                    _options.ext.push(AscCommon.GetFileExtension(files[i]));
				}

				_this.sendChanges(this, _files, AscCommon.EncryptionMessageType.Encrypt, _options);
            });
		};

        this.addCryproImagesFromUrls = function(urls, callback)
        {
            var _editor = window["Asc"]["editor"] ? window["Asc"]["editor"] : window.editor;
            _editor.sync_StartAction(Asc.c_oAscAsyncActionType.BlockInteraction, Asc.c_oAscAsyncAction.LoadImage);

            var _this = this;
            window["AscDesktopEditor"]["DownloadFiles"](urls, [], function(files) {

            	_editor.sync_EndAction(Asc.c_oAscAsyncActionType.BlockInteraction, Asc.c_oAscAsyncAction.LoadImage);

                _editor.sync_StartAction(Asc.c_oAscAsyncActionType.BlockInteraction, Asc.c_oAscAsyncAction.UploadImage);

            	var _files = [];

                var _options = { isImageCrypt: true, isUrls: true, callback: callback, ext : [], api: _editor };

                for (var elem in files)
                {
                    _files.push(window["AscDesktopEditor"]["GetImageBase64"](files[elem], true));
                    _options.ext.push(window["AscDesktopEditor"]["GetImageFormat"](files[elem]));
                    window["AscDesktopEditor"]["RemoveFile"](files[elem]);
                }

                _this.sendChanges(this, _files, AscCommon.EncryptionMessageType.Encrypt, _options);
            });
        };

        this.onDecodeError = function()
		{
            var _editor = window["Asc"]["editor"] ? window["Asc"]["editor"] : window.editor;
			_editor.sendEvent("asc_onError", Asc.c_oAscError.ID.DataEncrypted, Asc.c_oAscError.Level.Critical);
		};

        this.checkEditorId = function()
		{
            if (null == this.editorId)
            {
                var _editor = window["Asc"]["editor"] ? window["Asc"]["editor"] : window.editor;
                this.editorId = _editor.editorId;
            }
		};

        this.decryptImage = function(src, img, data)
        {
            this.sendChanges(this, [data], AscCommon.EncryptionMessageType.Decrypt, { isImageDecrypt: true, src: src, img : img });
        };

        this.nextChanges = function()
		{
            this.nextChangesTimeoutId = setTimeout(function() {
				AscCommon.EncryptionWorker.sendChanges(undefined, undefined);
                this.nextChangesTimeoutId = -1;
			}, 10);
		};

        this.sendChanges = function(sender, data, type, options)
        {
            if (!this.isNeedCrypt())
            {
                if (AscCommon.EncryptionMessageType.Encrypt == type)
                {
                    sender._send(data, true);
                }
                else if (AscCommon.EncryptionMessageType.Decrypt == type)
                {
                    if (this.isExistEncryptedChanges(data["changes"]))
                    {
                        this.onDecodeError();
                        return;
                    }
                    sender._onSaveChanges(data, true);
                }
                return;
            }

            if (undefined !== type)
                this.arrData.push({ sender: sender, type: type, data: data, options: options });

            if (this.arrData.length == 0)
                return;

            if (undefined !== type && ((1 != this.arrData.length) || !this.isChangesHandled))
            	return; // вызовется на коллбэке

			if (undefined !== type && -1 != this.nextChangesTimeoutId)
			{
				// вызвали send, когда данные на receiveChanges были удалены - и запустился nextChanges
				// но так как он сделан на таймере - то просто он не успел отработать.
				// тут запускаем единственное изменение - это и есть как бы next.
				// убиваем таймер

				clearTimeout(this.nextChangesTimeoutId);
				this.nextChangesTimeoutId = -1;
			}

            if (AscCommon.EncryptionMessageType.Encrypt == this.arrData[0].type)
            {
            	//console.log("encrypt: " + data["changes"]);
				if (this.arrData[0].options && this.arrData[0].options.isImageCrypt)
                    window.g_asc_plugins.sendToEncryption({ "type" : "encryptData", "data" : this.arrData[0].data });
				else
                    window.g_asc_plugins.sendToEncryption({ "type" : "encryptData", "data" : JSON.parse(this.arrData[0].data["changes"]) });
            }
            else if (AscCommon.EncryptionMessageType.Decrypt == this.arrData[0].type)
            {
                //console.log("decrypt: " + data["changes"]);
                if (this.arrData[0].options && this.arrData[0].options.isImageDecrypt)
                    window.g_asc_plugins.sendToEncryption({ "type" : "decryptData", "data" : this.arrData[0].data });
                else
                    window.g_asc_plugins.sendToEncryption({ "type" : "decryptData", "data" : this.arrData[0].data["changes"] });
            }
        };

        this.receiveChanges = function(obj)
        {
        	var data = obj["data"];
        	var check = obj["check"];
        	if (!check)
			{
				this.onDecodeError();
				return;
			}

        	if (this.handleChangesCallback)
			{
                this.isExistDecryptedChanges = true;
                this.checkEditorId();

				if (this.editorId == AscCommon.c_oEditorId.Spreadsheet)
				{
                    for (var i = data.length - 1; i >= 0; i--)
                    {
                        this.handleChangesCallback.changesBase[i] = data[i];
                    }
                }
                else
				{
                    for (var i = data.length - 1; i >= 0; i--)
                    {
                        this.handleChangesCallback.changesBase[i].m_pData = data[i];
                    }
				}
                this.isChangesHandled = true;
				this.handleChangesCallback.callback.call(this.handleChangesCallback.sender);
				this.handleChangesCallback = null;

                this.nextChanges();
				return;
			}

        	var obj = this.arrData[0];
        	this.arrData.splice(0, 1);

            if (AscCommon.EncryptionMessageType.Encrypt == obj.type)
            {
            	if (obj.options && obj.options.isImageCrypt)
				{
                    for (var i = 0; i < data.length; i++)
					{
						if (this.cryptoPrefix == data[i].substr(0, this.cryptoPrefixLen))
						{
							// дописываем extension
                            data[i] = this.cryptoPrefix + obj.options.ext[i] + ";" + data[i].substr(this.cryptoPrefixLen);
						}
					}

					if (!obj.options.isUrls)
						obj.options.callback(Asc.c_oAscError.ID.No, data);
					else
					{
						AscCommon.UploadImageUrls(data, obj.options.api.documentId, obj.options.api.documentUserId, obj.options.api.CoAuthoringApi.get_jwt(), function(urls)
                        {
                            obj.options.api.sync_EndAction(Asc.c_oAscAsyncActionType.BlockInteraction, Asc.c_oAscAsyncAction.UploadImage);

                            obj.options.callback(urls);
                        });
					}
				}
				else
				{
                    obj.data["changes"] = JSON.stringify(data);
                    obj.sender._send(obj.data, true);
                }
            }
            else if (AscCommon.EncryptionMessageType.Decrypt == obj.type)
            {
                if (obj.options && obj.options.isImageDecrypt)
                {
                	window["AscDesktopEditor"]["ResaveFile"](obj.options.src, data[0]);
                    obj.options.img["onload_crypto"](obj.options.src);
                }
                else
				{
                    this.isExistDecryptedChanges = true;
                    obj.data["changes"] = data;
                    obj.sender._onSaveChanges(obj.data, true);
                }
            }

            this.nextChanges();
        };

        this.isExistEncryptedChanges = function(_array)
		{
			if (0 == _array.length)
				return false;

			this.checkEditorId();

			var isChangesMode = (_array[0]["change"]) ? true : false;
			var _prefix = "";
			var _checkPrefixLen = this.cryptoPrefixLen + 1; // "ENCRYPTED; && ""ENCRYPTED;

			if (isChangesMode)
			{
                for (var i = _array.length - 1; i >= 0; i--)
                {
                    if (_array[i]["change"].length > _checkPrefixLen)
                    {
                    	_prefix = _array[i]["change"].substr(0, _checkPrefixLen);
                        if (-1 != _prefix.indexOf(this.cryptoPrefix))
                        {
                            isCrypted = true;
                            break;
                        }
                    }
                }

                return isCrypted;
			}

            var isCrypted = false;
            if (this.editorId == AscCommon.c_oEditorId.Spreadsheet)
            {
                for (var i = _array.length - 1; i >= 0; i--)
                {
                    if (_array[i].length > _checkPrefixLen)
                    {
                        _prefix = _array[i].substr(0, _checkPrefixLen);
                        if (-1 != _prefix.indexOf(this.cryptoPrefix))
                        {
                            isCrypted = true;
                            break;
                        }
                    }
                }
            }
            else
            {
                for (var i = _array.length - 1; i >= 0; i--)
                {
                    if (_array[i].m_pData.length > _checkPrefixLen)
                    {
                        _prefix = _array[i].m_pData.substr(0, _checkPrefixLen);
                        if (-1 != _prefix.indexOf(this.cryptoPrefix))
                        {
                            isCrypted = true;
                            break;
                        }
                    }
                }
            }
            return isCrypted;
		};

        this.handleChanges = function(_array, _sender, _callback)
		{
            if (0 == _array.length || !this.isNeedCrypt())
			{
				if (this.isExistEncryptedChanges(_array))
				{
					this.onDecodeError();
					return;
				}

				this.isChangesHandled = true;
				_callback.call(_sender);
                return;
			}

			this.handleChangesCallback = { changesBase : _array, changes : [], sender : _sender, callback : _callback };

			this.checkEditorId();

            if (this.editorId == AscCommon.c_oEditorId.Spreadsheet)
            {
                for (var i = _array.length - 1; i >= 0; i--)
                {
                    this.handleChangesCallback.changes[i] = _array[i];
                }
            }
            else
			{
                for (var i = _array.length - 1; i >= 0; i--)
                {
                    this.handleChangesCallback.changes[i] = _array[i].m_pData;
                }
			}

            window.g_asc_plugins.sendToEncryption({ "type" : "decryptData", "data" : this.handleChangesCallback.changes });
		};

        this.asc_setAdvancedOptions = function(api, idOption, option)
		{
            if (window.isNativeOpenPassword)
            {
                window["AscDesktopEditor"]["NativeViewerOpen"](option.asc_getPassword());
                return;
            }
            if (window.isCloudCryptoDownloadAs)
            	return false;

			if (!this.isNeedCrypt())
				return false;

            window.checkPasswordFromPlugin = true;
            if (window["Asc"].c_oAscAdvancedOptionsID.TXT === idOption)
            {
                var _param = ("<m_nCsvTxtEncoding>" + option.asc_getCodePage() + "</m_nCsvTxtEncoding>");
                window["AscDesktopEditor"]["SetAdvancedOptions"](_param);
            }
            else if (window["Asc"].c_oAscAdvancedOptionsID.CSV === idOption)
            {
                var delimiter = option.asc_getDelimiter();
                var delimiterChar = option.asc_getDelimiterChar();
                var _param = "";
                _param += ("<m_nCsvTxtEncoding>" + option.asc_getCodePage() + "</m_nCsvTxtEncoding>");
                if (null != delimiter) {
                    _param += ("<m_nCsvDelimiter>" + delimiter + "</m_nCsvDelimiter>");
                }
                if (null != delimiterChar) {
                    _param += ("<m_nCsvDelimiterChar>" + delimiterChar + "</m_nCsvDelimiterChar>");
                }

                window["AscDesktopEditor"]["SetAdvancedOptions"](_param);
            }
            else if (window["Asc"].c_oAscAdvancedOptionsID.DRM === idOption)
            {
                var _param = ("<m_sPassword>" + AscCommon.CopyPasteCorrectString(option.asc_getPassword()) + "</m_sPassword>");
                api.currentPassword = option.asc_getPassword();
                window["AscDesktopEditor"]["SetAdvancedOptions"](_param);
            }
            return true;
		};
    }

    AscCommon.EncryptionWorker = new CEncryptionData();

    function CMouseSmoothWheelCorrector(t, scrollFunction)
	{
		this._deltaX = 0;
		this._deltaY = 0;

		this._isBreakX = false;
        this._isBreakY = false;

        this._timeoutCorrector = -1;
        this._api = t;
        this._scrollFunction = scrollFunction;

        this._normalDelta = 120;
        this._isNormalDeltaActive = false;

        this.setNormalDeltaActive = function(value)
		{
            this._isNormalDeltaActive = true;
            this._normalDelta = value;
		};

		this.isBreakX = function()
		{
			return this._isBreakX;
		};
        this.isBreakY = function()
        {
            return this._isBreakY;
        };
        this.get_DeltaX = function(wheelDeltaX)
        {
            this._isBreakX = false;

            if (!AscCommon.AscBrowser.isMacOs)
                return wheelDeltaX;

            this._deltaX += wheelDeltaX;
            if (Math.abs(this._deltaX) >= this._normalDelta)
				return this._isNormalDeltaActive ? ((this._deltaX > 0) ? this._normalDelta : -this._normalDelta) : this._deltaX;

            this._isBreakX = true;
            return 0;
        };
        this.get_DeltaY = function(wheelDeltaY)
        {
            this._isBreakY = false;

            if (!AscCommon.AscBrowser.isMacOs)
                return wheelDeltaY;

            this._deltaY += wheelDeltaY;
            if (Math.abs(this._deltaY) >= this._normalDelta)
            	return this._isNormalDeltaActive ? ((this._deltaY > 0) ? this._normalDelta : -this._normalDelta) : this._deltaY;

            this._isBreakY = true;
            return 0;
        };

        this.checkBreak = function()
		{
			if (-1 != this._timeoutCorrector)
			{
				clearTimeout(this._timeoutCorrector);
				this._timeoutCorrector = -1;
			}

			if ((this._isBreakX || this._isBreakY) && this._scrollFunction)
			{
				var obj = { t : this, x : (this._isBreakX ? this._deltaX : 0), y : (this._isBreakY ? this._deltaY : 0) };
				this._timeoutCorrector = setTimeout(function(){
                    var t = obj.t;
					t._scrollFunction.call(t._api, obj.x, obj.y);
					t._timeoutCorrector = -1;
					t._deltaX = 0;
					t._deltaY = 0;
				}, 100);
			}

			if (!this._isBreakX)
				this._deltaX = 0;
            if (!this._isBreakY)
                this._deltaY = 0;

			this._isBreakX = false;
            this._isBreakY = false;
		};
	}

	AscCommon.CMouseSmoothWheelCorrector = CMouseSmoothWheelCorrector;

	/** @constructor */
	function CTranslateManager()
	{
		this.mapTranslate = {};
	}

	CTranslateManager.prototype.init = function(map)
	{
		this.mapTranslate = map || {};
	};
	CTranslateManager.prototype.getValue = function(key)
	{
		return this.mapTranslate.hasOwnProperty(key) ? this.mapTranslate[key] : key;
	};


	function CPolygonPoint2(X, Y)
	{
		this.X = X;
		this.Y = Y;
	}
	function CPolygonVectors()
	{
		this.Page = -1;
		this.VX = [];
		this.VY = [];
	}
	function CPolygonPath(precision)
	{
		this.Page = -1;
		this.Direction = 1;
		this.precision = precision;
		this.Points = [];
	}
	CPolygonPath.prototype.PushPoint = function (x, y)
	{
		this.Points.push(new CPolygonPoint2(x / this.precision, y / this.precision));
	};
	CPolygonPath.prototype.CorrectExtremePoints = function ()
	{
		var Lng = this.Points.length;

		this.Points[0].X = this.Points[Lng - 1].X;
		this.Points[Lng - 1].Y = this.Points[0].Y;
	};

	function CPolygon()
	{
		this.Vectors = [];
		this.precision = 1000;
	}
	CPolygon.prototype.fill = function (arrBounds)
	{
		this.Vectors.length = 0;

		if (arrBounds.length <= 0)
			return;

		var nStartLineIndex = 0, nStartIndex = 0,
			CountLines = arrBounds.length,
			CountBounds;

		while (nStartLineIndex < arrBounds.length)
		{
			CountBounds = arrBounds[nStartLineIndex].length;

			while (nStartIndex < CountBounds)
			{
				if (arrBounds[nStartLineIndex][nStartIndex].W < 0.001)
					nStartIndex++;
				else
					break;
			}

			if (nStartIndex < CountBounds)
				break;

			nStartLineIndex++;
			nStartIndex = 0;
		}

		if (nStartLineIndex >= arrBounds.length)
			return;

		var CurrentPage = arrBounds[nStartLineIndex][nStartIndex].Page,
			CurrentVectors = new CPolygonVectors(),
			VectorsX = CurrentVectors.VX,
			VectorsY = CurrentVectors.VY;

		CurrentVectors.Page = CurrentPage;
		this.Vectors.push(CurrentVectors);

		for (var LineIndex = nStartLineIndex; LineIndex < CountLines; nStartIndex = 0, LineIndex++)
		{
			if (arrBounds[LineIndex][nStartIndex].Page !== CurrentPage)
			{
				CurrentPage = arrBounds[LineIndex][nStartIndex].Page;

				CurrentVectors = new CPolygonVectors();
				VectorsX = CurrentVectors.VX;
				VectorsY = CurrentVectors.VY;
				CurrentVectors.Page = CurrentPage;
				this.Vectors.push(CurrentVectors);

			}

			for (var Index = nStartIndex; Index < arrBounds[LineIndex].length; Index++)
			{
				var oBound = arrBounds[LineIndex][Index];

				if (oBound.W < 0.001)
					continue;

				var x1 = Math.round(oBound.X * this.precision), x2 = Math.round((oBound.X + oBound.W) * this.precision),
					y1 = Math.round(oBound.Y * this.precision), y2 = Math.round((oBound.Y + oBound.H) * this.precision);

				if (VectorsX[y1] == undefined)
				{
					VectorsX[y1] = {};
				}

				this.IntersectionX(VectorsX, x2, x1, y1);

				if (VectorsY[x1] == undefined)
				{
					VectorsY[x1] = {};
				}

				this.IntersectionY(VectorsY, y1, y2, x1);

				if (VectorsX[y2] == undefined)
				{
					VectorsX[y2] = {};
				}

				this.IntersectionX(VectorsX, x1, x2, y2);

				if (VectorsY[x2] == undefined)
				{
					VectorsY[x2] = {};
				}

				this.IntersectionY(VectorsY, y2, y1, x2);
			}
		}
	};
	CPolygon.prototype.IntersectionX = function (VectorsX, BeginX, EndX, Y)
	{
		var CurrentVector = {};
		CurrentVector[BeginX] = EndX;
		var VX = VectorsX[Y];

		if (BeginX > EndX)
		{
			while (true == this.IntersectVectorX(CurrentVector, VX))
			{
			}
		}
		else
		{
			while (true == this.IntersectVectorX(VX, CurrentVector))
			{
			}
		}

		for (var X in CurrentVector)
		{
			var VBeginX = parseInt(X);
			var VEndX = CurrentVector[VBeginX];

			if (VBeginX !== VEndX || VX[VBeginX] === undefined) // добавляем точку, только если она не существует, а ненулевой вектор всегда
			{
				VX[VBeginX] = VEndX;
			}
		}
	};
	CPolygon.prototype.IntersectVectorX = function (VectorOpp, VectorClW) // vector opposite, vector clockwise
	{
		for (var X in VectorOpp)
		{
			var VBeginX = parseInt(X);
			var VEndX = VectorOpp[VBeginX];

			if (VEndX == VBeginX)
				continue;

			for (var ClwX in VectorClW)
			{
				var ClwBeginX = parseInt(ClwX);
				var ClwEndX = VectorClW[ClwBeginX];
				var bIntersection = false;

				if (ClwBeginX == ClwEndX)
					continue;

				if (ClwBeginX <= VEndX && VBeginX <= ClwEndX) // inside vector ClW
				{
					VectorOpp[VBeginX] = VBeginX;

					VectorClW[ClwBeginX] = VEndX;
					VectorClW[VBeginX] = ClwEndX;

					bIntersection = true;
				}
				else if (VEndX <= ClwBeginX && ClwEndX <= VBeginX) // inside vector Opposite clockwise
				{
					VectorClW[ClwBeginX] = ClwBeginX;

					VectorOpp[VBeginX] = ClwEndX;
					VectorOpp[ClwBeginX] = VEndX;

					bIntersection = true;

				}
				else if (ClwBeginX < VEndX && VEndX < ClwEndX) // intersect vector ClW
				{
					VectorClW[ClwBeginX] = VEndX;
					VectorOpp[VBeginX] = ClwEndX;

					bIntersection = true;
				}
				else if (ClwBeginX < VBeginX && VBeginX < ClwEndX) // intersect vector ClW
				{
					VectorOpp[ClwBeginX] = VEndX;
					VectorClW[VBeginX] = ClwEndX;

					delete VectorOpp[VBeginX];
					delete VectorClW[ClwBeginX];

					bIntersection = true;
				}

				if (bIntersection == true)
					return true;
			}
		}

		return false;
	};
	CPolygon.prototype.IntersectionY = function (VectorsY, BeginY, EndY, X)
	{
		var bIntersect = false;

		for (var y in VectorsY[X])
		{
			var CurBeginY = parseInt(y);
			var CurEndY = VectorsY[X][CurBeginY];

			var minY, maxY;

			if (CurBeginY < CurEndY)
			{
				minY = CurBeginY;
				maxY = CurEndY;
			}
			else
			{
				minY = CurEndY;
				maxY = CurBeginY;
			}

			var bInterSection = !((maxY <= BeginY && maxY <= EndY) || (minY >= BeginY && minY >= EndY )), // нач или конечная точка нах-ся внутри данного отрезка
				bDirection = (CurBeginY - CurEndY) * (BeginY - EndY) < 0; // векторы противоположно направленны

			if (bInterSection && bDirection) // если направления векторов совпало, значит один Bounds нах-ся в другом, ничего не делаем, такого быть не должно
			{

				VectorsY[X][CurBeginY] = EndY;
				VectorsY[X][BeginY] = CurEndY;
				bIntersect = true;
			}
		}

		if (bIntersect == false)
		{
			VectorsY[X][BeginY] = EndY;
		}
	};
	CPolygon.prototype.GetPaths = function (shift)
	{
		var Paths = [];

		shift *= this.precision;

		for (var PageIndex = 0; PageIndex < this.Vectors.length; PageIndex++)
		{
			var y, x1, x2,
				x, y1, y2;

			var VectorsX = this.Vectors[PageIndex].VX,
				VectorsY = this.Vectors[PageIndex].VY,
				Page = this.Vectors[PageIndex].Page;


			for (var LineIndex in VectorsX)
			{
				for (var Index in VectorsX[LineIndex])
				{
					var Polygon = new CPolygonPath(this.precision);
					Polygon.Page = Page;

					y = parseInt(LineIndex);
					x1 = parseInt(Index);
					x2 = VectorsX[y][x1];

					VectorsX[y][x1] = -1;

					var Direction = x1 > x2 ? 1 : -1;
					var minY = y;
					var SignRightLeft, SignDownUp;
					var X, Y;

					if (x2 !== -1)
					{
						SignRightLeft = x1 > x2 ? 1 : -1;
						Y = y - SignRightLeft * shift;

						Polygon.PushPoint(x1, Y);

						while (true)
						{
							x = x2;
							y1 = y;
							y2 = VectorsY[x][y1];

							if (y2 == -1)
							{
								break;
							}
							else if (y2 == undefined) // такой ситуации не должно произойти, если произошла, значит есть ошибка в алгоритме => не отрисовываем путь
							{
								return [];
							}

							VectorsY[x][y1] = -1;  // выставляем -1 => чтобы не добавить повторно путь с данными точками + проверка на возвращение в стартовую точку

							SignDownUp = y1 > y2 ? 1 : -1;
							X = x + SignDownUp * shift;

							Polygon.PushPoint(X, Y);

							y = y2;
							x1 = x;
							x2 = VectorsX[y][x1];

							if (x2 == -1)
							{
								break;
							}
							else if (x2 == undefined) // такой ситуации не должно произойти, если произошла, значит есть ошибка в алгоритме => не отрисовываем путь
							{
								return [];
							}

							VectorsX[y][x1] = -1; // выставляем -1 => чтобы не добавить повторно путь с данными точками + проверка на возвращение в стартовую точку

							SignRightLeft = x1 > x2 ? 1 : -1;
							Y = y - SignRightLeft * shift;

							Polygon.PushPoint(X, Y);

							if (y < minY) // направление обхода
							{
								minY = y;
								Direction = x1 > x2 ? 1 : -1;
							}

						}
						Polygon.PushPoint(X, Y);
						Polygon.CorrectExtremePoints();


						Polygon.Direction = Direction;
						Paths.push(Polygon);

					}
				}
			}
		}

		return Paths;
	};

	function CMathTrack()
	{
		this.MathRect = {IsActive: false, Bounds: [], ContentSelection: null};
		this.MathPolygons = [];
		this.MathSelectPolygons = [];
	}
	CMathTrack.prototype.Update = function (IsActive, IsContentActive, oMath, PixelError)
	{
		this.MathRect.IsActive = IsActive;
		if (true === IsActive && null !== oMath)
		{
			var selectBounds = true === IsContentActive ? oMath.Get_ContentSelection() : null;
			if (selectBounds != null)
			{
				var SelectPolygon = new CPolygon();
				SelectPolygon.fill(selectBounds);
				this.MathSelectPolygons = SelectPolygon.GetPaths(0);
			}
			else
			{
				this.MathSelectPolygons.length = 0;
			}
			var arrBounds = oMath.Get_Bounds();
			if (arrBounds.length <= 0)
				return;
			var MPolygon = new CPolygon();
			MPolygon.fill(arrBounds);
			this.MathPolygons = MPolygon.GetPaths(PixelError);
		}
	};
	CMathTrack.prototype.Draw = function (overlay, oPath, shiftX, shiftY, color, dKoefX, dKoefY, left, top, transform)
	{
		var ctx = overlay.m_oContext;
		var rPR = AscCommon.AscBrowser.retinaPixelRatio;
		ctx.strokeStyle = color;
		var lineW = Math.round(rPR);
		ctx.lineWidth = lineW;
		ctx.beginPath();

		if (shiftX > 0.1 || shiftY > 0.1)
		{
			shiftX = Math.round(shiftX * rPR);
			shiftY = Math.round(shiftY * rPR);
		}

		var isRoundDraw = (transform && !AscCommon.global_MatrixTransformer.IsIdentity2(transform)) ? false : true;

		var Points = oPath.Points;
		var nCount = Points.length;

		// берем предпоследнюю точку, т.к. последняя совпадает с первой
		var PrevX = Points[nCount - 2].X, PrevY = Points[nCount - 2].Y;
		var x, y;
		var eps = 0.0001;

		// 0 left, 1 down, 2 right, 3 up
		var directions = [];
		var isUseShift = (shiftX > 0.1 || shiftY > 0.1) ? true : false;

		if (isUseShift)
		{
			for (var nIndex = 0; nIndex < nCount; nIndex++)
			{
				if (Math.abs(PrevX - Points[nIndex].X) < eps && Math.abs(PrevY - Points[nIndex].Y) < eps)
					continue;

				if (PrevX > (Points[nIndex].X + eps))
				{
					directions.push(0)
				}
				else if (PrevX < (Points[nIndex].X - eps))
				{
					directions.push(2);
				}

				if (PrevY > (Points[nIndex].Y + eps))
				{
					directions.push(3);
				}
				else if (PrevY < (Points[nIndex].Y - eps))
				{
					directions.push(1);
				}
				PrevX = Points[nIndex].X;
				PrevY = Points[nIndex].Y;
			}
		}

		PrevX = Points[nCount - 2].X;
		PrevY = Points[nCount - 2].Y;
		var directionIndex = 0;
		for (var nIndex = 0; nIndex < nCount; nIndex++)
		{
			if (Math.abs(PrevX - Points[nIndex].X) < eps && Math.abs(PrevY - Points[nIndex].Y) < eps)
				continue;

			x = transform ? transform.TransformPointX(Points[nIndex].X, Points[nIndex].Y) : Points[nIndex].X;
			y = transform ? transform.TransformPointY(Points[nIndex].X, Points[nIndex].Y) : Points[nIndex].Y;

			x = (left + dKoefX * x) * rPR;
			y = (top + dKoefY * y) * rPR;

			if (isUseShift)
			{
				var nextDirection = (directionIndex === (directions.length - 1)) ? directions[0] : directions[directionIndex + 1];
				switch (directions[directionIndex])
				{
					case 0:
					{
						switch (nextDirection)
						{
							case 0:
							{
								y -= shiftY;
								break
							}
							case 1:
							{
								x -= shiftX;
								y -= shiftY;
								break;
							}
							case 2:
							{
								break;
							}
							case 3:
							{
								x += shiftX;
								y -= shiftY;
								break;
							}
							default:
								break;
						}
						break;
					}
					case 1:
					{
						switch (nextDirection)
						{
							case 0:
							{
								x -= shiftX;
								y -= shiftY;
								break;
							}
							case 1:
							{
								x -= shiftX;
								break;
							}
							case 2:
							{
								x -= shiftX;
								y += shiftY;
								break
							}
							case 3:
							default:
								break;
						}
						break;
					}
					case 2:
					{
						switch (nextDirection)
						{
							case 0:
							{
								break;
							}
							case 1:
							{
								x -= shiftX;
								y += shiftY;
								break;
							}
							case 2:
							{
								y += shiftY;
								break;
							}
							case 3:
							{
								x += shiftX;
								y += shiftY;
								break;
							}
							default:
								break;
						}
						break;
					}
					case 3:
					{
						switch (nextDirection)
						{
							case 0:
							{
								x += shiftX;
								y -= shiftY;
								break;
							}
							case 1:
							{
								break;
							}
							case 2:
							{
								x += shiftX;
								y += shiftY;
								break;
							}
							case 3:
							{
								x += shiftX;
							}
							default:
								break;
						}
						break;
					}
					default:
						break;
				}
			}

			directionIndex++;
			PrevX = Points[nIndex].X;
			PrevY = Points[nIndex].Y;

			if (isRoundDraw)
			{
				x = (x >> 0) + lineW / 2;
				y = (y >> 0) + lineW / 2;
			}

			overlay.CheckPoint(x, y);

			if (0 == nIndex)
				overlay.m_oContext.moveTo(x, y);
			else
				overlay.m_oContext.lineTo(x, y);
		}

		overlay.m_oContext.closePath();

		ctx.closePath();
		ctx.stroke();
		ctx.beginPath();
	};

	CMathTrack.prototype.DrawSelectPolygon = function(overlay, oPath, dKoefX, dKoefY, left, top, m)
	{
		var ctx = overlay.m_oContext;
		ctx.fillStyle = "#375082";
		ctx.beginPath();
		var Points = oPath.Points;
		var nPointIndex;
		var _x, _y, x, y, p;
		var rPR = AscCommon.AscBrowser.retinaPixelRatio;
		for (nPointIndex = 0; nPointIndex < Points.length - 1; nPointIndex++)
		{
			p = Points[nPointIndex];
			if(!m)
			{
				_x = (left + dKoefX * p.X) * rPR;
				_y = (top + dKoefY * p.Y) * rPR;
			}
			else
			{
				x = p.X;
				y = p.Y;
				_x = (left + dKoefX * m.TransformPointX(x, y)) * rPR;
				_y = (top + dKoefY * m.TransformPointY(x, y)) * rPR;
			}
			overlay.CheckPoint(_x, _y);
			if (0 == nPointIndex)
				ctx.moveTo((_x >> 0) + 0.5 * Math.round(rPR), (_y >> 0) + 0.5 * Math.round(rPR));
			else
				ctx.lineTo((_x >> 0) + 0.5 * Math.round(rPR), (_y >> 0) + 0.5 * Math.round(rPR));
		}
		ctx.globalAlpha = 0.2;
		ctx.fill();
		ctx.globalAlpha = 1;
	};

	CMathTrack.prototype.IsActive = function()
	{
		return this.MathRect.IsActive;
	};
	CMathTrack.prototype.GetPolygonsCount = function()
	{
		return this.MathPolygons.length;
	};
	CMathTrack.prototype.GetPolygon = function(nIndex)
	{
		return this.MathPolygons[nIndex];
	};
	CMathTrack.prototype.GetSelectPathsCount = function()
	{
		return this.MathSelectPolygons.length;
	};
	CMathTrack.prototype.GetSelectPath = function(nIndex)
	{
		return this.MathSelectPolygons[nIndex];
	};

	function CDrawingCollaborativeTargetBase()
	{
		this.Id      = "";
		this.ShortId = "";

		this.X    = 0;
		this.Y    = 0;
		this.Size = 0;

		this.Color     = null;
		this.Transform = null;

		this.HtmlElement  = null;
		this.HtmlElementX = 0;
		this.HtmlElementY = 0;

		this.Style = "";
		this.HtmlParent = null;
	}
	CDrawingCollaborativeTargetBase.prototype.CreateElement = function()
	{
		this.HtmlElement = document.createElement('canvas');
		this.HtmlElement.style.cssText = "pointer-events: none;position:absolute;padding:0;margin:0;-webkit-user-select:none;width:1px;height:1px;display:block;z-index:3;";
		this.HtmlElement.width = 1;
		this.HtmlElement.height = 1;

		this.Color = AscCommon.getUserColorById(this.ShortId, null, true);
		this.Style = "rgb(" + this.Color.r + "," + this.Color.g + "," + this.Color.b + ")";
	};
	CDrawingCollaborativeTargetBase.prototype.GetZoom = function()
	{
		return 1.0;
	};
	CDrawingCollaborativeTargetBase.prototype.CheckStyleDisplay = function()
	{
	};
	CDrawingCollaborativeTargetBase.prototype.ConvertCoords = function(x, y)
	{
		return {
			X: (x * this.GetZoom() * AscCommon.g_dKoef_mm_to_pix ) >> 0,
			Y: (y * this.GetZoom() * AscCommon.g_dKoef_mm_to_pix ) >> 0
		};
	};
	CDrawingCollaborativeTargetBase.prototype.GetMobileTouchManager = function()
	{
		return null;
	};
	CDrawingCollaborativeTargetBase.prototype.UseStylePosition = function()
	{
		return (!this.GetMobileTouchManager() && !AscCommon.AscBrowser.isSafariMacOs) || !AscCommon.AscBrowser.isWebkit;
	};
	CDrawingCollaborativeTargetBase.prototype.GetParentElement = function()
	{
		return null;
	};
	CDrawingCollaborativeTargetBase.prototype.CalculateSizeAndPos = function()
	{
		var _newW = 2;
		var _newH = (this.Size * this.GetZoom() * AscCommon.g_dKoef_mm_to_pix) >> 0;

		var _oldW = this.HtmlElement.width;
		var _oldH = this.HtmlElement.height;

		if (null != this.Transform && !AscCommon.global_MatrixTransformer.IsIdentity2(this.Transform))
		{
			var _x1 = this.Transform.TransformPointX(this.X, this.Y);
			var _y1 = this.Transform.TransformPointY(this.X, this.Y);

			var _x2 = this.Transform.TransformPointX(this.X, this.Y + this.Size);
			var _y2 = this.Transform.TransformPointY(this.X, this.Y + this.Size);

			var pos1 = this.ConvertCoords(_x1, _y1);
			var pos2 = this.ConvertCoords(_x2, _y2);

			_newW = (Math.abs(pos1.X - pos2.X) >> 0) + 1;
			_newH = (Math.abs(pos1.Y - pos2.Y) >> 0) + 1;

			if (2 > _newW)
				_newW = 2;
			if (2 > _newH)
				_newH = 2;

			if (_oldW == _newW && _oldH == _newH)
			{
				if (_newW != 2 && _newH != 2)
				{
					// просто очищаем
					this.HtmlElement.width = _newW;
				}
			}
			else
			{
				this.HtmlElement.style.width = _newW + "px";
				this.HtmlElement.style.height = _newH + "px";

				this.HtmlElement.width = _newW;
				this.HtmlElement.height = _newH;
			}
			var ctx = this.HtmlElement.getContext('2d');

			if (_newW == 2 || _newH == 2)
			{
				ctx.fillStyle = this.Style;
				ctx.fillRect(0, 0, _newW, _newH);
			}
			else
			{
				ctx.beginPath();
				ctx.strokeStyle = this.Style;
				ctx.lineWidth = 2;

				if (((pos1.X - pos2.X) * (pos1.Y - pos2.Y)) >= 0)
				{
					ctx.moveTo(0, 0);
					ctx.lineTo(_newW, _newH);
				}
				else
				{
					ctx.moveTo(0, _newH);
					ctx.lineTo(_newW, 0);
				}

				ctx.stroke();
			}

			this.HtmlElementX = Math.min(pos1.X, pos2.X) >> 0;
			this.HtmlElementY = Math.min(pos1.Y, pos2.Y) >> 0;
			if (this.UseStylePosition())
			{
				this.HtmlElement.style.left = this.HtmlElementX + "px";
				this.HtmlElement.style.top = this.HtmlElementY + "px";
			}
			else
			{
				this.HtmlElement.style.left = "0px";
				this.HtmlElement.style.top = "0px";
				this.HtmlElement.style["webkitTransform"] = "matrix(1, 0, 0, 1, " + this.HtmlElementX + "," + this.HtmlElementY + ")";
			}
		}
		else
		{
			if (_oldW == _newW && _oldH == _newH)
			{
				// просто очищаем
				this.HtmlElement.width = _newW;
			}
			else
			{
				this.HtmlElement.style.width = _newW + "px";
				this.HtmlElement.style.height = _newH + "px";

				this.HtmlElement.width = _newW;
				this.HtmlElement.height = _newH;
			}

			var ctx = this.HtmlElement.getContext('2d');

			ctx.fillStyle = this.Style;
			ctx.fillRect(0, 0, _newW, _newH);

			var pos;
			if (null != this.Transform)
			{
				pos = this.ConvertCoords(this.Transform.tx + this.X, this.Transform.ty + this.Y);
			}
			else
			{
				pos = this.ConvertCoords(this.X, this.Y);
			}

			this.HtmlElementX = pos.X >> 0;
			this.HtmlElementY = pos.Y >> 0;

			if (this.UseStylePosition())
			{
				this.HtmlElement.style.left = this.HtmlElementX + "px";
				this.HtmlElement.style.top = this.HtmlElementY + "px";
			}
			else
			{
				this.HtmlElement.style.left = "0px";
				this.HtmlElement.style.top = "0px";
				this.HtmlElement.style["webkitTransform"] = "matrix(1, 0, 0, 1, " + this.HtmlElementX + "," + this.HtmlElementY + ")";
			}
		}
	};
	CDrawingCollaborativeTargetBase.prototype.CheckPosition = function()
	{
	};
	CDrawingCollaborativeTargetBase.prototype.CheckNeedDraw = function()
	{
		return true;
	};
	CDrawingCollaborativeTargetBase.prototype.Remove = function()
	{
		if(this.HtmlParent)
		{
			this.HtmlParent.removeChild(this.HtmlElement);
			this.HtmlParent = null;
		}
	};
	CDrawingCollaborativeTargetBase.prototype.Update = function()
	{
		// 1) создаем новый элемент, если еще его не было
		if (this.HtmlElement == null)
		{
			this.CreateElement();
		}

		if(!this.CheckNeedDraw())
		{
			return;
		}
		// 2) определяем размер
		this.CalculateSizeAndPos();

		if (AscCommon.CollaborativeEditing)
			AscCommon.CollaborativeEditing.Update_ForeignCursorLabelPosition(this.Id, this.HtmlElementX, this.HtmlElementY, this.Color);

		// 3) добавить, если нужно
		var oParentElement = this.GetParentElement();
		if(oParentElement && oParentElement !== this.HtmlParent)
		{
			oParentElement.appendChild(this.HtmlElement);
			this.HtmlParent = oParentElement;
		}
		this.CheckStyleDisplay();
	};


	//------------------------------------------------------------fill polyfill--------------------------------------------
	if (!Array.prototype.findIndex) {
		Object.defineProperty(Array.prototype, 'findIndex', {
			value: function(predicate) {
				if (this == null) {
					throw new TypeError('Array.prototype.findIndex called on null or undefined');
				}
				if (typeof predicate !== 'function') {
					throw new TypeError('predicate must be a function');
				}
				var list = Object(this);
				var length = list.length >>> 0;
				var thisArg = arguments[1];
				var value;

				for (var i = 0; i < length; i++) {
					value = list[i];
					if (predicate.call(thisArg, value, i, list)) {
						return i;
					}
				}
				return -1;
			}
		});
	}
	if (!Array.prototype.fill) {
		Object.defineProperty(Array.prototype, 'fill', {
			value: function(value) {

				// Steps 1-2.
				if (this == null) {
					throw new TypeError('this is null or not defined');
				}

				var O = Object(this);

				// Steps 3-5.
				var len = O.length >>> 0;

				// Steps 6-7.
				var start = arguments[1];
				var relativeStart = start >> 0;

				// Step 8.
				var k = relativeStart < 0 ?
					Math.max(len + relativeStart, 0) :
					Math.min(relativeStart, len);

				// Steps 9-10.
				var end = arguments[2];
				var relativeEnd = end === undefined ?
					len : end >> 0;

				// Step 11.
				var final = relativeEnd < 0 ?
					Math.max(len + relativeEnd, 0) :
					Math.min(relativeEnd, len);

				// Step 12.
				while (k < final) {
					O[k] = value;
					k++;
				}

				// Step 13.
				return O;
			}
		});
	}

	if (!Object.values) {
		Object.values = function (obj) {
			return Object.keys(obj).map(function (e) {
				return obj[e];
			});
		}
	}
	if (typeof Int8Array !== 'undefined' && !Int8Array.prototype.fill) {
		Int8Array.prototype.fill = Array.prototype.fill;
	}
	if (typeof Uint8Array !== 'undefined' && !Uint8Array.prototype.fill) {
		Uint8Array.prototype.fill = Array.prototype.fill;
	}
	if (typeof Uint8ClampedArray !== 'undefined' && !Uint8ClampedArray.prototype.fill) {
		Uint8ClampedArray.prototype.fill = Array.prototype.fill;
	}
	if (typeof Int16Array !== 'undefined' && !Int16Array.prototype.fill) {
		Int16Array.prototype.fill = Array.prototype.fill;
	}
	if (typeof Uint16Array !== 'undefined' && !Uint16Array.prototype.fill) {
		Uint16Array.prototype.fill = Array.prototype.fill;
	}
	if (typeof Int32Array !== 'undefined' && !Int32Array.prototype.fill) {
		Int32Array.prototype.fill = Array.prototype.fill;
	}
	if (typeof Uint32Array !== 'undefined' && !Uint32Array.prototype.fill) {
		Uint32Array.prototype.fill = Array.prototype.fill;
	}
	if (typeof Float32Array !== 'undefined' && !Float32Array.prototype.fill) {
		Float32Array.prototype.fill = Array.prototype.fill;
	}
	if (typeof Float64Array !== 'undefined' && !Float64Array.prototype.fill) {
		Float64Array.prototype.fill = Array.prototype.fill;
	}
	if (typeof Uint8Array !== 'undefined' && !Uint8Array.prototype.slice) {
		Uint8Array.prototype.slice = Array.prototype.slice;
	}

	function parseText(text, options, bTrimSpaces) {
		var delimiterChar;
		if (options.asc_getDelimiterChar()) {
			delimiterChar = options.asc_getDelimiterChar();
		} else {
			switch (options.asc_getDelimiter()) {
				case AscCommon.c_oAscCsvDelimiter.None:
					delimiterChar = undefined;
					break;
				case AscCommon.c_oAscCsvDelimiter.Tab:
					delimiterChar = "\t";
					break;
				case AscCommon.c_oAscCsvDelimiter.Semicolon:
					delimiterChar = ";";
					break;
				case AscCommon.c_oAscCsvDelimiter.Colon:
					delimiterChar = ":";
					break;
				case AscCommon.c_oAscCsvDelimiter.Comma:
					delimiterChar = ",";
					break;
				case AscCommon.c_oAscCsvDelimiter.Space:
					delimiterChar = " ";
					break;
			}
		}

		var textQualifier = options.asc_getTextQualifier();
		var matrix = [];
		//var rows = text.match(/[^\r\n]+/g);
		var rows = text.split(/\r?\n/);
		for (var i = 0; i < rows.length; ++i) {
			var row = rows[i];
			if(" " === delimiterChar && bTrimSpaces) {
				var addSpace = false;
				if(row[0] === delimiterChar) {
					addSpace = true;
				}
				row = addSpace ? delimiterChar + row.trim() : row.trim();
			}
			//todo quotes
			if (textQualifier) {
				if (!row.length) {
					matrix.push(row.split(delimiterChar));
					continue;
				}

				var _text = "";
				var startQualifier = false;
				for (var j = 0; j < row.length; j++) {
					if (!startQualifier && row[j] === textQualifier && (!row[j - 1] || (row[j - 1] && row[j - 1] === delimiterChar))) {
						startQualifier = !startQualifier;
						continue;
					} else if (startQualifier && row[j] === textQualifier) {
						startQualifier = !startQualifier;

						if (j === row.length - 1) {
							if (!matrix[i]) {
								matrix[i] = [];
							}
							matrix[i].push(_text);
						}

						continue;
					}
					
					if (!startQualifier && row[j] === delimiterChar) {
						if (!matrix[i]) {
							matrix[i] = [];
						}
						matrix[i].push(_text);
						_text = "";
					} else {
						_text += row[j];
						if (j === row.length - 1) {
							if (!matrix[i]) {
								matrix[i] = [];
							}
							matrix[i].push(_text);
						}
					}
				}
			} else {
				matrix.push(row.split(delimiterChar));	
			}
		}
		return matrix;
	}

	function getTimeISO8601(dateStr) {
		if (dateStr) {
			if (dateStr.endsWith("Z")) {
				return Date.parse(dateStr);
			} else {
				return Date.parse(dateStr + "Z");
			}
		}
		return NaN;
	}

	function valueToMmType(value) {
		var oVal = parseFloat(value);
		var oType;
		if (!isNaN(oVal)) {
			if (-1 !== value.indexOf("%")) {
				oType = "%";
				oVal /= 100;
			} else if (-1 !== value.indexOf("px")) {
				oType = "px";
				oVal *= AscCommon.g_dKoef_pix_to_mm;
			} else if (-1 !== value.indexOf("in")) {
				oType = "in";
				oVal *= AscCommonWord.g_dKoef_in_to_mm;
			} else if (-1 !== value.indexOf("cm")) {
				oType = "cm";
				oVal *= 10;
			} else if (-1 !== value.indexOf("mm")) {
				oType = "mm";
			} else if (-1 !== value.indexOf("pt")) {
				oType = "pt";
				oVal *= AscCommonWord.g_dKoef_pt_to_mm;
			} else if (-1 !== value.indexOf("pc")) {
				oType = "pc";
				oVal *= AscCommonWord.g_dKoef_pc_to_mm;
			} else {
				oType = "none";
			}
			return {val: oVal, type: oType};
		}
		return null;
	}

	function valueToMm(value) {
		var obj = valueToMmType(value);
		if (obj && "%" !== obj.type && "none" !== obj.type) {
			return obj.val;
		}
		return null;
	}

	function arrayMove(array, from, to) {
		array.splice(to, 0, array.splice(from, 1)[0]);
	}
	function getRangeArray(start, stop) {
		var res = new Array(stop - start);
		for (var i = start; i < stop; ++i) {
			res[i - start] = i;
		}
		return res;
	}
	function isEqualSortedArrays(array1, array2) {
		return array1.length === array2.length && array1.every(function(value, index) { return value === array2[index]});
	}

	var g_oBackoffDefaults = {
		retries: 2,
		factor: 2,
		minTimeout: 100,
		maxTimeout: 2000,
		randomize: true
	};

	function Backoff(opts) {
		this.attempts = 0;
		this.opts = opts;
	}

	Backoff.prototype.attempt = function(fError, fRetry) {
		var timeout = this.nextTimeout();
		if (timeout > 0) {
			setTimeout(function() {
				fRetry();
			}, timeout);
		} else {
			fError();
		}
	};
	Backoff.prototype.nextTimeout = function() {
		var timeout = -1;
		if (this.attempts < this.opts.retries) {
			timeout = this.createTimeout(this.attempts, this.opts);
			this.attempts++;
		}
		return timeout;
	};
	Backoff.prototype.createTimeout = function(attempt, opts) {
		//like npm retry
		var random = (opts.randomize)
			? (Math.random() + 1)
			: 1;

		var timeout = Math.round(random * opts.minTimeout * Math.pow(opts.factor, attempt));
		timeout = Math.min(timeout, opts.maxTimeout);

		return timeout;
	};
	function backoffOnError(obj, onError, onRetry) {
		if (!onRetry) {
			return onError;
		}
		var backoff = new Backoff(g_oBackoffDefaults);
		return function() {
			var timeout = backoff.nextTimeout();
			if (timeout > 0) {
				setTimeout(function() {
					onRetry.call(obj, obj);
				}, timeout);
			} else if (onError) {
				onError.apply(obj, arguments);
			}
		};
	}
	function backoffOnErrorImg(img, onRetry) {
		//$self.attr("src", $self.attr("src"));
		//https://github.com/doomhz/jQuery-Image-Reloader/blob/dd1f626b25628ede498ae2489a0c2963f1c3cf61/jquery.imageReloader.js#L56
		if (!onRetry) {
			onRetry = function(img) {
				img.setAttribute('src', img.getAttribute('src'));
			};
		}
		img.onerror = backoffOnError(img, img.onerror, onRetry);
	}
	function isEmptyObject(obj) {
		for ( var name in obj ) {
			return false;
		}
		return true;
	}

	function CStringNode(element, par) {
		this.element = element;
		this.partner = null;
		this.par = par;
		if(typeof element === "string") {
			this.children = [];
			for (var oIterator = element.getUnicodeIterator(); oIterator.check(); oIterator.next()) {
				var nCharCode = oIterator.value();
				this.children.push(new CStringNode(nCharCode, this));
			}
		}
	}
	CStringNode.prototype.children = [];
	CStringNode.prototype.equals = function(oNode) {
		return this.element === oNode.element;
	};
	CStringNode.prototype.forEachDescendant = function(callback, T) {
		this.children.forEach(function(node) {
			node.forEach(callback, T);
		});
	};
	CStringNode.prototype.forEach = function(callback, T) {
		callback.call(T, this);
		this.children.forEach(function(node) {
			node.forEach(callback, T);
		});
	};

	function CDiffMatching() {
	}
	CDiffMatching.prototype.get = function(oNode) {
		return oNode.partner;
	};
	CDiffMatching.prototype.put = function(oNode1, oNode2) {
		oNode1.partner = oNode2;
		oNode2.partner = oNode1;
	};
	function CStringChange(oOperation) {
		this.pos = -1;
		this.deleteCount = 0;
		this.insert = [];

		var oAnchor = oOperation.anchor;
		this.pos = oAnchor.index;
		if(Array.isArray(oOperation.remove)) {
			this.deleteCount = oOperation.remove.length;
		}
		var nIndex, oNode;
		if(Array.isArray(oOperation.insert)) {
			for(nIndex = 0; nIndex < oOperation.insert.length; ++nIndex) {
				oNode = oOperation.insert[nIndex];
				this.insert.push(oNode.element);
			}
		}
	}
	CStringChange.prototype.getPos = function() {
		return this.pos;
	};
	CStringChange.prototype.getDeleteCount = function() {
		return this.deleteCount;
	};
	CStringChange.prototype.getInsertSymbols = function() {
		return this.insert;
	};
	function getTextDelta(sBase, sReplace) {
		var aDelta = [];
		var oBaseNode = new CStringNode(sBase, null);
		var oReplaceNode = new CStringNode(sReplace, null);
		var oMatching = new CDiffMatching();
		oMatching.put(oBaseNode, oReplaceNode);
		var oDiff  = new AscCommon.Diff(oBaseNode, oReplaceNode);
		oDiff.equals = function(a, b)
		{
			return a.equals(b);
		};
		oDiff.matchTrees(oMatching);
		var oDeltaCollector = new AscCommon.DeltaCollector(oMatching, oBaseNode, oReplaceNode);
		oDeltaCollector.forEachChange(function(oOperation){
			aDelta.push(new CStringChange(oOperation));
		});
		return aDelta;
	}

	function _getIntegerByDivide(val)
	{
		// поддерживаем scale, который
		// 1) рациональное число
		// 2) знаменатель несократимой дроби <= 10 (поддерживаем проценты кратные 1/10, 1/9, ... 1/2)
		var test = val;
		for (var i = 0; i < 10; i++)
		{
			test = (val - i) * AscCommon.AscBrowser.retinaPixelRatio;
			if (test > 0 && Math.abs(test - (test >> 0)) < 0.001)
				return { start: (val - i), end : (test >> 0) };
		}
		return { start : val, end: AscCommon.AscBrowser.convertToRetinaValue(val, true) };
	};

	function setCanvasSize(element, width, height, is_correction)
	{
		if (element.width === width && element.height === height)
			return;

		if (true !== is_correction)
		{
			element.width = width;
			element.height = height;
			return;
		}

		var data = null;
		if(element.width > 0 && element.height > 0)
		{
			data = element.getContext("2d").getImageData(0, 0, element.width, element.height);
		}
		element.width = width;
		element.height = height;
		if(data)
		{
			element.getContext("2d").putImageData(data, 0, 0);
		}
	};

	function calculateCanvasSize(element, is_correction, is_wait_correction)
	{
		if (true !== is_correction && undefined !== element.correctionTimeout)
		{
			clearTimeout(element.correctionTimeout);
			element.correctionTimeout = undefined;
		}

		var scale = AscCommon.AscBrowser.retinaPixelRatio;
		if (Math.abs(scale - (scale >> 0)) < 0.001)
		{
			setCanvasSize(element,
				scale * parseInt(element.style.width),
				scale * parseInt(element.style.height),
				is_correction);
			return;
		}

		var rect = element.getBoundingClientRect();
		var isCorrectRect = (rect.width === 0 && rect.height === 0) ? false : true;
		if (is_wait_correction || !isCorrectRect)
		{
			var isNoVisibleElement = false;
			if (element.style.display === "none")
				isNoVisibleElement = true;
			else if (element.parentNode && element.parentNode.style.display === "none")
				isNoVisibleElement = true;

			if (!isNoVisibleElement)
			{
				element.correctionTimeout = setTimeout(function (){
					calculateCanvasSize(element, true);
				}, 100);
			}

			if (!isCorrectRect)
			{
				var style_width = parseInt(element.style.width);
				var style_height = parseInt(element.style.height);

				rect = {
					x: 0, left: 0,
					y: 0, top: 0,
					width: style_width, right: style_width,
					height: style_height, bottom: style_height
				};
			}
		}

		var new_width = 0;
		var new_height = 0;

		// в мозилле баг. включаем особую ветку
		if (!AscCommon.AscBrowser.isMozilla)
		{
			new_width = Math.round(scale * rect.right) - Math.round(scale * rect.left);
			new_height = Math.round(scale * rect.bottom) - Math.round(scale * rect.top);
		}
		else
		{
			if (true)
			{
				new_width = Math.round(scale * rect.right) - Math.round(scale * rect.left);
				new_height = Math.round(scale * rect.bottom) - Math.round(scale * rect.top);

				element.style["imageRendering"] = "pixelated";
			}
			else
			{
				var sizeW = _getIntegerByDivide(rect.width);
				var sizeH = _getIntegerByDivide(rect.height);
				if (sizeW.start !== rect.width) element.style.width = sizeW.start + "px";
				if (sizeH.start !== rect.height) element.style.height = sizeH.start + "px";

				new_width = sizeW.end;
				new_height = sizeH.end;
			}
		}

		setCanvasSize(element,
			new_width,
			new_height,
			is_correction);
	};


	function CRC32()
	{
		this.m_aTable = [];
		this.private_InitTable();
	}
	CRC32.prototype.private_InitTable = function()
	{
		var CRC_POLY = 0xEDB88320;
		var nChar;
		for (var nIndex = 0; nIndex < 256; nIndex++)
		{
			nChar = nIndex;
			for (var nCounter = 0; nCounter < 8; nCounter++)
			{
				nChar = ((nChar & 1) ? ((nChar >>> 1) ^ CRC_POLY) : (nChar >>> 1));
			}
			this.m_aTable[nIndex] = nChar;
		}
	};
	CRC32.prototype.Calculate_ByString = function(sStr, nSize)
	{
		var CRC_MASK = 0xD202EF8D;
		var nCRC     = 0 ^ (-1);

		for (var nIndex = 0; nIndex < nSize; nIndex++)
		{
			nCRC = this.m_aTable[(nCRC ^ sStr.charCodeAt(nIndex)) & 0xFF] ^ (nCRC >>> 8);
			nCRC ^= CRC_MASK;
		}

		return (nCRC ^ (-1)) >>> 0;
	};
	CRC32.prototype.Calculate_ByByteArray = function(aArray, nSize)
	{
		var CRC_MASK = 0xD202EF8D;
		var nCRC     = 0 ^ (-1);

		for (var nIndex = 0; nIndex < nSize; nIndex++)
		{
			nCRC = (nCRC >>> 8) ^ this.m_aTable[(nCRC ^ aArray[nIndex]) & 0xFF];
			nCRC ^= CRC_MASK;
		}

		return (nCRC ^ (-1)) >>> 0;
	};

	var g_oCRC32 = new CRC32();

	function RangeTopBottomIterator() {
		this.size = 0;
		this.rangesTop = null;
		this.indexTop = 0;
		this.rangesBottom = null;
		this.indexBottom = 0;
		this.lastRow = -1;
		this.mmap = null;
		this.mmapCache = null;
	}
	RangeTopBottomIterator.prototype.init = function (arr, fGetRanges) {
		var rangesTop = this.rangesTop = [];
		var rangesBottom = this.rangesBottom = [];
		var nextId = 0;
		this.size = arr.length;
		arr.forEach(function (elem) {
			var ranges = fGetRanges(elem);
			for (var i = 0; i < ranges.length; i++) {
				var rangeElem = {id: nextId++, bbox: ranges[i], data: elem, isInsert: false};
				rangesTop.push(rangeElem);
				rangesBottom.push(rangeElem);
			}
		});
		//Array.sort is stable in all browsers
		//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#browser_compatibility
		this.rangesTop.sort(RangeTopBottomIterator.prototype.compareByLeftTop);
		this.rangesBottom.sort(RangeTopBottomIterator.prototype.compareByRightBottom);
		this.reset();
	};
	RangeTopBottomIterator.prototype.compareByLeftTop = function (a, b) {
		return Asc.Range.prototype.compareByLeftTop(a.bbox, b.bbox);
	};
	RangeTopBottomIterator.prototype.compareByRightBottom = function (a, b) {
		return Asc.Range.prototype.compareByRightBottom(a.bbox, b.bbox);
	};
	RangeTopBottomIterator.prototype.getSize = function () {
		return this.size;
	};
	RangeTopBottomIterator.prototype.reset = function () {
		this.indexTop = 0;
		this.indexBottom = 0;
		this.lastRow = -1;
		if (this.mmap) {
			this.mmap.forEach(function (rangeElem) {
				rangeElem.isInsert = false;
			});
		}
		this.mmap = new Map();
		this.mmapCache = null;
	};
	RangeTopBottomIterator.prototype.get = function (row, col) {
		//todo binary search
		//todo dynamic column range or preassigned column range
		if (this.lastRow > row) {
			this.reset();
		}
		var rangeElem;
		while (this.indexTop < this.rangesTop.length && row >= this.rangesTop[this.indexTop].bbox.r1) {
			rangeElem = this.rangesTop[this.indexTop++];
			if (row <= rangeElem.bbox.r2) {
				rangeElem.isInsert = true;
				this.mmap.set(rangeElem.id, rangeElem);
				this.mmapCache = null;
			}
		}
		while (this.indexBottom < this.rangesBottom.length && row > this.rangesBottom[this.indexBottom].bbox.r2) {
			rangeElem = this.rangesBottom[this.indexBottom++];
			if (rangeElem.isInsert) {
				rangeElem.isInsert = false;
				this.mmap.delete(rangeElem.id);
				this.mmapCache = null;
			}
		}
		var t = this;
		if (!this.mmapCache) {
			this.mmapCache = [];
			this.mmap.forEach(function (rangeElem) {
				for (var i = rangeElem.bbox.c1; i <= rangeElem.bbox.c2; ++i) {
					if (!t.mmapCache[i]) {
						t.mmapCache[i] = [];
					}
					t.mmapCache[i].push(rangeElem.data);
				}
			});
		}
		this.lastRow = row;
		return t.mmapCache[col] || [];
	};

	function IsLinkPPAction(sAction) {
		if(!(typeof sAction === "string")) {
			return false;
		}
		return sAction.indexOf("ppaction://hlink") === 0;
	}

	//------------------------------------------------------------export---------------------------------------------------
	window['AscCommon'] = window['AscCommon'] || {};
	window["AscCommon"].getSockJs = getSockJs;
	window["AscCommon"].getJSZipUtils = getJSZipUtils;
	window["AscCommon"].getJSZip = getJSZip;
	window["AscCommon"].getBaseUrl = getBaseUrl;
	window["AscCommon"].getEncodingParams = getEncodingParams;
	window["AscCommon"].getEncodingByBOM = getEncodingByBOM;
	window["AscCommon"].saveWithParts = saveWithParts;
	window["AscCommon"].loadFileContent = loadFileContent;
	window["AscCommon"].getImageFromChanges = getImageFromChanges;
	window["AscCommon"].openFileCommand = openFileCommand;
	window["AscCommon"].sendCommand = sendCommand;
	window["AscCommon"].sendSaveFile = sendSaveFile;
	window["AscCommon"].mapAscServerErrorToAscError = mapAscServerErrorToAscError;
	window["AscCommon"].joinUrls = joinUrls;
	window["AscCommon"].getFullImageSrc2 = getFullImageSrc2;
	window["AscCommon"].fSortAscending = fSortAscending;
	window["AscCommon"].fSortDescending = fSortDescending;
	window["AscCommon"].isLeadingSurrogateChar = isLeadingSurrogateChar;
	window["AscCommon"].decodeSurrogateChar = decodeSurrogateChar;
	window["AscCommon"].encodeSurrogateChar = encodeSurrogateChar;
	window["AscCommon"].convertUnicodeToUTF16 = convertUnicodeToUTF16;
	window["AscCommon"].convertUTF16toUnicode = convertUTF16toUnicode;
	window["AscCommon"].build_local_rx = build_local_rx;
	window["AscCommon"].GetFileName = GetFileName;
	window["AscCommon"].GetFileExtension = GetFileExtension;
	window["AscCommon"].changeFileExtention = changeFileExtention;
	window["AscCommon"].getExtentionByFormat = getExtentionByFormat;
	window["AscCommon"].InitOnMessage = InitOnMessage;
	window["AscCommon"].ShowImageFileDialog = ShowImageFileDialog;
	window["AscCommon"].ShowDocumentFileDialog = ShowDocumentFileDialog;
	window["AscCommon"].ShowSpreadsheetFileDialog = ShowSpreadsheetFileDialog;
	window["AscCommon"].ShowTextFileDialog = ShowTextFileDialog;
	window["AscCommon"].InitDragAndDrop = InitDragAndDrop;
	window["AscCommon"].UploadImageFiles = UploadImageFiles;
    window["AscCommon"].UploadImageUrls = UploadImageUrls;
	window["AscCommon"].DownloadOriginalFile = DownloadOriginalFile;
	window["AscCommon"].DownloadFileFromBytes = DownloadFileFromBytes;
	window["AscCommon"].CanDropFiles = CanDropFiles;
	window["AscCommon"].getUrlType = getUrlType;
	window["AscCommon"].prepareUrl = prepareUrl;
	window["AscCommon"].getUserColorById = getUserColorById;
	window["AscCommon"].isNullOrEmptyString = isNullOrEmptyString;
	window["AscCommon"].unleakString = unleakString;
	window["AscCommon"].readValAttr = readValAttr;
	window["AscCommon"].getNumFromXml = getNumFromXml;
	window["AscCommon"].getColorFromXml = getColorFromXml;
	window["AscCommon"].getBoolFromXml = getBoolFromXml;
	window["AscCommon"].initStreamFromResponse = initStreamFromResponse;
	window["AscCommon"].checkStreamSignature = checkStreamSignature;

	window["AscCommon"].DocumentUrls = DocumentUrls;
	window["AscCommon"].OpenFileResult = OpenFileResult;
	window["AscCommon"].CLock = CLock;
	window["AscCommon"].CContentChanges = CContentChanges;
	window["AscCommon"].CContentChangesElement = CContentChangesElement;

	window["AscCommon"].CorrectMMToTwips = CorrectMMToTwips;
	window["AscCommon"].TwipsToMM = TwipsToMM;
	window["AscCommon"].MMToTwips = MMToTwips;
	window["AscCommon"].RomanToInt = RomanToInt;
	window["AscCommon"].LatinNumberingToInt = LatinNumberingToInt;
	window["AscCommon"].IntToNumberFormat = IntToNumberFormat;
	window["AscCommon"].IsSpace = IsSpace;
	window["AscCommon"].IntToHex = IntToHex;
	window["AscCommon"].IsDigit = IsDigit;
	window["AscCommon"].IsLetter = IsLetter;
	window["AscCommon"].CorrectFontSize = CorrectFontSize;
	window["AscCommon"].IsAscFontSupport = IsAscFontSupport;
	window["AscCommon"].ExecuteNoHistory = ExecuteNoHistory;

	window["AscCommon"].loadSdk = loadSdk;
    window["AscCommon"].loadScript = loadScript;
    window["AscCommon"].loadChartStyles = loadChartStyles;
	window["AscCommon"].getAltGr = getAltGr;
	window["AscCommon"].getColorSchemeByName = getColorSchemeByName;
	window["AscCommon"].getColorSchemeByIdx = getColorSchemeByIdx;
	window["AscCommon"].getAscColorScheme = getAscColorScheme;
	window["AscCommon"].checkAddColorScheme = checkAddColorScheme;
	window["AscCommon"].getIndexColorSchemeInArray = getIndexColorSchemeInArray;
	window["AscCommon"].isEastAsianScript = isEastAsianScript;
	window["AscCommon"].IsEastAsianFont = IsEastAsianFont;
	window["AscCommon"].CMathTrack = CMathTrack;
	window["AscCommon"].CPolygon = CPolygon;
	window['AscCommon'].CDrawingCollaborativeTargetBase = CDrawingCollaborativeTargetBase;

	window["AscCommon"].JSZipWrapper = JSZipWrapper;
	window["AscCommon"].g_oDocumentUrls = g_oDocumentUrls;
	window["AscCommon"].FormulaTablePartInfo = FormulaTablePartInfo;
	window["AscCommon"].cBoolLocal = cBoolLocal;
	window["AscCommon"].cErrorOrigin = cErrorOrigin;
	window["AscCommon"].cErrorLocal = cErrorLocal;
	window["AscCommon"].FormulaSeparators = FormulaSeparators;
	window["AscCommon"].rx_space_g = rx_space_g;
	window["AscCommon"].rx_space = rx_space;
	window["AscCommon"].rx_defName = rx_defName;
	window["AscCommon"].rx_r1c1DefError = rx_r1c1DefError;

	window["AscCommon"].kCurFormatPainterWord = kCurFormatPainterWord;
	window["AscCommon"].parserHelp = parserHelp;
	window["AscCommon"].g_oIdCounter = g_oIdCounter;

	window["AscCommon"].g_oHtmlCursor = g_oHtmlCursor;

	window["AscCommon"].g_oBackoffDefaults = g_oBackoffDefaults;
	window["AscCommon"].Backoff = Backoff;
	window["AscCommon"].backoffOnErrorImg = backoffOnErrorImg;
	window["AscCommon"].isEmptyObject = isEmptyObject;

	window["AscCommon"].CSignatureDrawer = window["AscCommon"]["CSignatureDrawer"] = CSignatureDrawer;
	var prot = CSignatureDrawer.prototype;
	prot["getImages"] 	= prot.getImages;
	prot["setText"] 	= prot.setText;
	prot["selectImage"] = prot.selectImage;
	prot["isValid"] 	= prot.isValid;
	prot["destroy"] 	= prot.destroy;

	window["AscCommon"].translateManager = new CTranslateManager();

	window["AscCommon"].parseText = parseText;
	window["AscCommon"].getTimeISO8601 = getTimeISO8601;

	window["AscCommon"].valueToMm = valueToMm;
	window["AscCommon"].valueToMmType = valueToMmType;
	window["AscCommon"].arrayMove = arrayMove;
	window["AscCommon"].getRangeArray = getRangeArray;
	window["AscCommon"].isEqualSortedArrays = isEqualSortedArrays;

	window["AscCommon"].CUnicodeStringEmulator = CUnicodeStringEmulator;

	window["AscCommon"].calculateCanvasSize = calculateCanvasSize;

	window["AscCommon"].IsAbbreviation = IsAbbreviation;

	window["AscCommon"].getTextDelta = getTextDelta;

	window["AscCommon"].rx_test_ws_name = rx_test_ws_name;

	window["AscCommon"].CShortcuts = window["AscCommon"]["CShortcuts"] = CShortcuts;
	prot = CShortcuts.prototype;
	prot["Add"]                   = prot.Add;
	prot["Get"]                   = prot.Get;
	prot["CheckType"]             = prot.CheckType;
	prot["Remove"]                = prot.Remove;
	prot["RemoveByType"]          = prot.RemoveByType;
	prot["GetNewCustomType"]      = prot.GetNewCustomType;
	prot["IsCustomType"]          = prot.IsCustomType;
	prot["GetCustomAction"]       = prot.GetCustomAction;
	prot["AddCustomActionSymbol"] = prot.AddCustomActionSymbol;

	window["AscCommon"].CCustomShortcutActionSymbol = window["AscCommon"]["CCustomShortcutActionSymbol"] = CCustomShortcutActionSymbol;
	window['AscCommon'].g_oCRC32  = g_oCRC32;
	window["AscCommon"].RangeTopBottomIterator = RangeTopBottomIterator;
	window["AscCommon"].IsLinkPPAction = IsLinkPPAction;
})(window);

window["asc_initAdvancedOptions"] = function(_code, _file_hash, _docInfo)
{
    if (window.isNativeOpenPassword)
	{
		return window["NativeFileOpen_error"](window.isNativeOpenPassword, _file_hash, _docInfo);
	}

    var _editor = window["Asc"]["editor"] ? window["Asc"]["editor"] : window.editor;

    if (_code == 90 || _code == 91)
    {
    	if (window["AscDesktopEditor"] && (0 !== window["AscDesktopEditor"]["CryptoMode"]) && !_editor.isLoadFullApi)
		{
            // ждем инициализации
            _editor.asc_initAdvancedOptions_params = [];
            _editor.asc_initAdvancedOptions_params.push(_code);
            _editor.asc_initAdvancedOptions_params.push(_file_hash);
            _editor.asc_initAdvancedOptions_params.push(_docInfo);
            return;
        }

    	if (AscCommon.EncryptionWorker.isNeedCrypt() && !window.checkPasswordFromPlugin)
    	{
            window.checkPasswordFromPlugin = true;
            window.g_asc_plugins.sendToEncryption({ "type": "getPasswordByFile", "hash": _file_hash, "docinfo": _docInfo });
            return;
        }
    }

    window.checkPasswordFromPlugin = false;
    _editor._onNeedParams(undefined, (_code == 90 || _code == 91) ? true : undefined);
};

window["asc_IsNeedBuildCryptedFile"] = function()
{
    if (!window["AscDesktopEditor"] || !window["AscDesktopEditor"]["CryptoMode"])
        return false;

    var _api = window["Asc"]["editor"] ? window["Asc"]["editor"] : window.editor;
    var _returnValue = false;

    var _users = null;
    if (_api.CoAuthoringApi && _api.CoAuthoringApi._CoAuthoringApi && _api.CoAuthoringApi._CoAuthoringApi._participants)
        _users = _api.CoAuthoringApi._CoAuthoringApi._participants;

    var _usersCount = 0;
    for (var _user in _users)
    	_usersCount++;

    var isOne = (1 >= _usersCount) ? true : false;

    if (!isOne)
    {
    	//console.log("asc_IsNeedBuildCryptedFile: no one");
    	_returnValue = false;
    }
    else if (null != AscCommon.History.SavedIndex && -1 != AscCommon.History.SavedIndex)
    {
        //console.log("asc_IsNeedBuildCryptedFile: one1");
        _returnValue = true;
    }
    else
    {
        //console.log("asc_IsNeedBuildCryptedFile: one2");
        if (_api.editorId == AscCommon.c_oEditorId.Spreadsheet)
        {
            if (AscCommon.EncryptionWorker.isExistDecryptedChanges)
                _returnValue = true;
        }
        else
        {
            if (0 != AscCommon.CollaborativeEditing.m_aAllChanges.length)
                _returnValue = true;
        }
    }

    window["AscDesktopEditor"]["execCommand"]("encrypt:isneedbuild", "" + _returnValue);
    return _returnValue;
};

window["UpdateSystemPlugins"] = function()
{
    var _plugins = JSON.parse(window["AscDesktopEditor"]["GetInstallPlugins"]());
    _plugins[0]["url"] = _plugins[0]["url"].replace(" ", "%20");
    _plugins[1]["url"] = _plugins[1]["url"].replace(" ", "%20");

    for (var k = 0; k < 2; k++)
    {
        var _pluginsCur = _plugins[k];

        var _len = _pluginsCur["pluginsData"].length;
        for (var i = 0; i < _len; i++)
		{
			_pluginsCur["pluginsData"][i]["baseUrl"] = _pluginsCur["url"] + _pluginsCur["pluginsData"][i]["guid"].substring(4) + "/";

			if (!window["AscDesktopEditor"]["IsLocalFile"]())
			{
                _pluginsCur["pluginsData"][i]["baseUrl"] = "ascdesktop://plugin_content/" + _pluginsCur["pluginsData"][i]["baseUrl"];
            }
        }
    }

    var _array = [];

    for (var k = 0; k < 2; k++)
    {
        var _pluginsCur = _plugins[k];
        var _len = _pluginsCur["pluginsData"].length;

        for (var i = 0; i < _len; i++)
        {
            var _plugin = _pluginsCur["pluginsData"][i];
            for (var j = 0; j < _plugin["variations"].length; j++)
            {
                var _variation = _plugin["variations"][j];
                if (_variation["initDataType"] == "desktop")
                {
                    if (_variation["initData"] == "encryption")
                    {
                    	var _mode = _variation["cryptoMode"];
                    	if (!_mode)
                    		_mode = "1";
                    	AscCommon.EncryptionWorker.cryptoMode = parseInt(_mode);

                        _array.push(_plugin);
                        break;
                    }

                    _array.push(_plugin);
                    break;
                }
            }
        }
    }

    var _arraySystem = [];
    for (var i = 0; i < _array.length; i++)
    {
        var plugin = new Asc.CPlugin();
        plugin["deserialize"](_array[i]);

        _arraySystem.push(plugin);
    }

    window.g_asc_plugins.registerSystem("", _arraySystem);
    window.g_asc_plugins.runAllSystem();
};

window["buildCryptoFile_Start"] = function()
{
    var _editor = window.Asc.editor ? window.Asc.editor : window.editor;
    _editor.sync_StartAction(Asc.c_oAscAsyncActionType.BlockInteraction, Asc.c_oAscAsyncAction.Save);

    window.g_asc_plugins.sendToEncryption({ "type" : "generatePassword" });
};

window["buildCryptoFile_End"] = function(url, error, hash, password)
{
    var _editor = window.Asc.editor ? window.Asc.editor : window.editor;
    _editor.sync_EndAction(Asc.c_oAscAsyncActionType.BlockInteraction, Asc.c_oAscAsyncAction.Save);

    if (0 != error)
	{
		_editor.sendEvent("asc_onError", Asc.c_oAscError.ID.ConvertationSaveError, Asc.c_oAscError.Level.NoCritical);
		return;
    }

    // send password
    _editor._callbackPluginEndAction = function()
	{
		this._callbackPluginEndAction = null;

        _editor.sync_StartAction(Asc.c_oAscAsyncActionType.BlockInteraction, Asc.c_oAscAsyncAction.Save);

		// file upload
		var xhr = new XMLHttpRequest();
		xhr.open('GET', "ascdesktop://fonts/" + url, true);
		xhr.responseType = 'arraybuffer';

		if (xhr.overrideMimeType)
			xhr.overrideMimeType('text/plain; charset=x-user-defined');
		else
			xhr.setRequestHeader('Accept-Charset', 'x-user-defined');

		xhr.onload = function()
		{
			if (this.status != 200)
			{
				// error
				return;
			}

			var fileData = new Uint8Array(this.response);

			var ext = ".docx";
			switch (_editor.editorId)
			{
				case AscCommon.c_oEditorId.Presentation:
					ext = ".pptx";
					break;
				case AscCommon.c_oEditorId.Spreadsheet:
					ext = ".xlsx";
					break;
				default:
					break;
			}

			if (ext === ".docx")
			{
				if (_editor.DocInfo.Format === "oform")
					ext = ".oform";
				else if (_editor.DocInfo.Format === "docxf")
					ext = ".docxf";
			}

			AscCommon.sendSaveFile(_editor.documentId, _editor.documentUserId, "output" + ext, _editor.asc_getSessionToken(), fileData, function(err) {

                _editor.sync_EndAction(Asc.c_oAscAsyncActionType.BlockInteraction, Asc.c_oAscAsyncAction.Save);
                _editor.sendEvent("asc_onError", Asc.c_oAscError.ID.ConvertationSaveError, Asc.c_oAscError.Level.Critical);

                window["AscDesktopEditor"]["buildCryptedEnd"](false);

			}, function(httpRequest) {
				//console.log(httpRequest.responseText);
				try
				{
					var data = {
						"accounts": httpRequest.responseText ? JSON.parse(httpRequest.responseText) : undefined,
						"hash": hash,
						"password" : password,
						"type": "share",
						"docinfo" : _editor.currentDocumentInfoNext
					};
					_editor.currentDocumentInfoNext = undefined;

					window["AscDesktopEditor"]["sendSystemMessage"](data);
					window["AscDesktopEditor"]["CallInAllWindows"]("function(){ if (window.DesktopUpdateFile) { window.DesktopUpdateFile(undefined); } }");

                    _editor.sync_EndAction(Asc.c_oAscAsyncActionType.BlockInteraction, Asc.c_oAscAsyncAction.Save);

					setTimeout(function() {

                        window["AscDesktopEditor"]["buildCryptedEnd"](true);

					}, 1000);
				}
				catch (err)
				{
				}
			});
		};

		xhr.send(null);
	};
    window.g_asc_plugins.sendToEncryption({"type": "setPasswordByFile", "hash": hash, "password": password});
};

window["NativeFileOpen_error"] = function(error, _file_hash, _docInfo)
{
    var _api = window["Asc"]["editor"] ? window["Asc"]["editor"] : window.editor;

    if ("password" == error)
    {
        window.isNativeOpenPassword = error;

        if (window["AscDesktopEditor"] && (0 !== window["AscDesktopEditor"]["CryptoMode"]) && !_api.isLoadFullApi)
        {
            // ждем инициализации
            _api.asc_initAdvancedOptions_params = [];
            _api.asc_initAdvancedOptions_params.push(90);
            _api.asc_initAdvancedOptions_params.push(_file_hash);
            _api.asc_initAdvancedOptions_params.push(_docInfo);
            return;
        }

        if (AscCommon.EncryptionWorker.isNeedCrypt() && !window.checkPasswordFromPlugin)
        {
            window.checkPasswordFromPlugin = true;
            window.g_asc_plugins.sendToEncryption({ "type": "getPasswordByFile", "hash": _file_hash, "docinfo": _docInfo });
            return;
        }

        window.checkPasswordFromPlugin = false;
        _api._onNeedParams(undefined, true);
    }
    else if ("error" == error)
    {
        _api.sendEvent("asc_onError", c_oAscError.ID.ConvertationOpenError, c_oAscError.Level.Critical);
        return;
    }
};

window["CryptoDownloadAsEnd"] = function()
{
    var _editor = window.Asc.editor ? window.Asc.editor : window.editor;
    _editor.sync_EndAction(Asc.c_oAscAsyncActionType.BlockInteraction, Asc.c_oAscAsyncAction.DownloadAs);

    window.isCloudCryptoDownloadAs = undefined;
};

window["AscDesktopEditor_Save"] = function()
{
    var _editor = window.Asc.editor ? window.Asc.editor : window.editor;
    if (!_editor.asc_Save(false))
    {
    	// сейва не будет. сами посылаем callback
        window["AscDesktopEditor"]["OnSave"]();
    }
};
