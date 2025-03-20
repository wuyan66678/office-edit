/**
 * 搜索和替换面板
 */

define([
  'common/main/lib/util/utils',
  'common/main/lib/component/BaseView',
  'common/main/lib/component/Layout',
  'common/main/lib/component/TreeView'

], function (template) {
  'use strict';

  SSE.Views.SearchPanel = Common.UI.BaseView.extend(_.extend({
      el: '#left-panel-Search',
      template: _.template([
        '<div class="search-panel-container">',
          '<input type="text" id="text-search-input" name="search" autocomplete="off" maxlength="255"></input>',
          '<div class="check-label-btn">',
            '<div class="check-label">',
              '<input id="case-sensitive-checkbox" type="checkbox" name="case-sensitive"  value="1" class="case-sensitive-check">',
              '<span class="case-sensitive-span"></span>',
            '</div>',
            '<button class="check-btn" id="check-btn"></button>',
          '</div>',
					'<div id="replace-wrap">',
						'<p class="replace-label"></p>',
						'<input type="text"  id="text-replace-input"  name="search" autocomplete="off" maxlength="255"></input>',
						'<div class="replace-btn">',
							'<button class="replace-btn" id="replace-all-btn"></button>',
							'<button class="replace-btn" id="replace-btn"></button>',
						'</div>',
					'</div>',
          '<div class="search-result" id="search-result">',
            '<div class="search-result-top">',
              '<p class="search-result-label">共<span id="result-count"></span>个结果</p>',
              '<div class="result-btn" id="search-result-btn">',
                '<button class="search-btn-back" id="search-btn-back"><span></span></button>',
                '<button class="search-btn-next" id="search-btn-next"><span></span></button>',
              '</div>',
            '</div>',   
          '</div>',
        '</div>'
        
      ].join('')),

      initialize: function(options) {
          _.extend(this, options);
          Common.UI.BaseView.prototype.initialize.call(this, arguments);
      
      
        },

      render: function(el) {
          el = el || this.el;
          $(el).html(this.template({scope: this}));
          this.$el = $(el);
          // 查找框
          this.searchInput = $('#text-search-input')
          this.searchInput.attr('placeholder', this.textSearchStart) 

          // 查找按钮
          this.searchBtn = $("#check-btn")
          this.searchBtn.text(this.textSearchBtn)
          this.searchBtn.on('click', _.bind(this.onBtnClick,this,'back'))

          // 替换框
          this.replaceInput = $('#text-replace-input')
          this.replaceInput.attr('placeholder', this.textReplaceStart) 
          
          // 全部替换按钮
          this.replaceAllBtn = $("#replace-all-btn")
          this.replaceAllBtn.text(this.textReplaceAll)
          this.replaceAllBtn.on('click', _.bind(this.onBtnClick,this, 'replaceAll'))
          
          // 替换按钮
          this.replaceBtn = $("#replace-btn")
          this.replaceBtn.text(this.textReplaceBtn)
          this.replaceBtn.on('click', _.bind(this.onBtnClick,this, 'replace'))

          // 查找上下按钮
          $("#search-btn-back").on('click', _.bind(this.onBtnClick,this, 'back'))
          $("#search-btn-next").on('click', _.bind(this.onBtnClick,this, 'next'))

          
          $(".case-sensitive-span").text(this.textCaseSensitive)
          $(".replace-label").text(this.textReplaceLabel)

          this.trigger('render:after', this);
          return this;
      },
      onBtnClick : function(action){
        var opts = {
            textsearch  : this.searchInput.val(),
            textreplace : this.replaceInput.val(),
            matchcase   : $("#case-sensitive-checkbox").prop('checked')
        };
        this.fireEvent( action, [this, opts] );
      },
      
      show: function () {
        Common.UI.BaseView.prototype.show.call(this,arguments);
        this.fireEvent('show', this );
      },

      hide: function () {
          Common.UI.BaseView.prototype.hide.call(this,arguments);
          this.fireEvent('hide', this );
      },
      
      // 中英文名
      textSearchStart:"Please enter search content",
      textSearchBtn: "Search",
      textReplaceLabel: "Replace with",
      textReplaceStart:"Please enter replacement content",
      textReplaceAll: "Replace all",
      textReplaceBtn: "Replace",
      textCaseSensitive:"Case Sensitive"
  }, SSE.Views.SearchPanel || {}));
});
