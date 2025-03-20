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
 * User: Julia.Radzhabova
 * Date: 14.12.17
 */

define([
  'core',
  'documenteditor/main/app/collection/SearchPanel',
  'documenteditor/main/app/view/SearchPanel'
], function () {
  'use strict';

  DE.Controllers.SearchPanel = Backbone.Controller.extend(_.extend({
      models: [],
      collections: [
          'SearchPanel'
      ],
      views: [
          'SearchPanel'
      ],

      initialize: function() {
          var me = this;
          this.addListeners({
            'SearchPanel': {
              'replace':_.bind(this.onQueryReplace, this),
              'replaceAll': _.bind(this.onQueryReplaceAll, this),
              'back':_.bind(this.onQuerySearch, this, 'back'),
              'next':_.bind(this.onQuerySearch, this, 'next'),
              show:function (){
                // console.log('show');
        
                $("#left-panel-Search").show()
                // $("#left-btn-search").attr("active",true)
                $("#left-btn-search").addClass("active")
              },
              hide:function() {
                // Common.UI.BaseView.prototype.hide.call(this,arguments);
        
                $("#left-panel-Search").hide()
                $("#left-btn-search").removeClass("active")
        
                
              }
           
            }
        });
      },
     
      onQuerySearch: function(d, w, opts) {
        console.log(d, w, opts,this.api);
        if (opts.textsearch && opts.textsearch.length) {
          var me = this;
          this.api.asc_findText(opts.textsearch, d != 'back', opts.matchcase, function(resultCount) {
                $("#search-result").css('display','block')
               $("#result-count").text(resultCount)

             if(resultCount && resultCount > 0){
                $("#search-result-btn").css('display','block')
             }
          });
        }
      },
      onQueryReplace: function(w, opts) {
        if (!_.isEmpty(opts.textsearch)) {
          var me = this;
          var str = this.api.asc_GetErrorForReplaceString(opts.textreplace);
          if (str) {
              Common.UI.warning({
                  title: this.notcriticalErrorTitle,
                  msg: Common.Utils.String.format(this.warnReplaceString, str)
              });
              return;
          }
          if (!this.api.asc_replaceText(opts.textsearch, opts.textreplace, false, opts.matchcase, false)) {
            Common.UI.info({
                  msg: this.textNoTextFound
              });
          }
        }
      },
      onQueryReplaceAll : function(w, opts) {
        if (!_.isEmpty(opts.textsearch)) {
          var me = this;
          var str = this.api.asc_GetErrorForReplaceString(opts.textreplace);
          if (str) {
              Common.UI.warning({
                  title: this.notcriticalErrorTitle,
                  msg: Common.Utils.String.format(this.warnReplaceString, str),
                 
              });
              return;
          }
          this.api.asc_replaceText(opts.textsearch, opts.textreplace, true, opts.matchcase, false);
        }
      },

      onLaunch: function() {
          this.panelSearch= this.createView('SearchPanel', {
              storeSearch: this.getApplication().getCollection('SearchPanel')
          });
          this.panelSearch.on('render:after', _.bind(this.onAfterRender, this));

      },
      onAfterRender: function() {
       
    },
      setApi: function(api) {
        this.api = api;
        return this;
       
      },

      setMode: function(mode) {
        this.mode = mode;
        return this;
        
      },
      notcriticalErrorTitle: 'Warning',
      warnReplaceString: '{0} is not a valid special character for the Replace With box.',
      textNoTextFound:'There is currently no replacement available'
      // txtBeginning: 'Beginning of document',
      // txtGotoBeginning: 'Go to the beginning of the document'

  }, DE.Controllers.SearchPanel || {}));
});
