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

// Import
var FontStyle = AscFonts.FontStyle;
var g_fontApplication = AscFonts.g_fontApplication;

var CColor = AscCommon.CColor;
var CAscMathCategory = AscCommon.CAscMathCategory;
var g_oTableId = AscCommon.g_oTableId;
var g_oTextMeasurer = AscCommon.g_oTextMeasurer;
var global_mouseEvent = AscCommon.global_mouseEvent;
var History = AscCommon.History;
var global_MatrixTransformer = AscCommon.global_MatrixTransformer;
var g_dKoef_pix_to_mm = AscCommon.g_dKoef_pix_to_mm;
var g_dKoef_mm_to_pix = AscCommon.g_dKoef_mm_to_pix;

function CColumnsMarkupColumn()
{
	this.W = 0;
	this.Space = 0;
}

function CColumnsMarkup()
{
	this.CurCol = 0;
	this.X = 0; // левое поле
	this.R = 0; // правое поле

	this.EqualWidth = true;
	this.Num = 1;
	this.Space = 30;
	this.Cols = [];

	this.SectPr    = null;
	this.PageIndex = 0;
}
CColumnsMarkup.prototype.UpdateFromSectPr = function(oSectPr, nPageIndex)
{
	if (!oSectPr)
		return;

	this.SectPr    = oSectPr;
	this.PageIndex = nPageIndex;

	var Columns = oSectPr.Columns;

	var oFrame = oSectPr.GetContentFrame(nPageIndex);
	this.X     = oFrame.Left;
	this.R     = oFrame.Right;

	this.EqualWidth = Columns.EqualWidth;
	this.Num        = Columns.Num;
	this.Space      = Columns.Space;

	this.Cols = [];
	for (var Index = 0, Count = Columns.Cols.length; Index < Count; ++Index)
	{
		this.Cols[Index]       = new CColumnsMarkupColumn();
		this.Cols[Index].W     = Columns.Cols[Index].W;
		this.Cols[Index].Space = Columns.Cols[Index].Space;
	}
};
CColumnsMarkup.prototype.SetCurCol = function(nCurCol)
{
	this.CurCol = nCurCol;
};
CColumnsMarkup.prototype.CreateDuplicate = function ()
{
	var _ret = new CColumnsMarkup();

	_ret.PageIndex = this.PageIndex;

	_ret.SectPr = this.SectPr;
	_ret.CurCol = this.CurCol;
	_ret.X = this.X;
	_ret.R = this.R;

	_ret.EqualWidth = this.EqualWidth;
	_ret.Num = this.Num;
	_ret.Space = this.Space;

	_ret.Cols = [];

	for (var i = 0; i < this.Cols.length; i++)
	{
		var _col = new CColumnsMarkupColumn();
		_col.W = this.Cols[i].W;
		_col.Space = this.Cols[i].Space;
		_ret.Cols.push(_col);
	}
	return _ret;
};

function CTableOutlineDr()
{
	this.mover = null;
	this.mover_size = 13;

	this.TableOutline = null;
	this.Counter = 0;
	this.bIsNoTable = true;
	this.bIsTracked = false;

	this.CurPos = null;
	this.TrackTablePos = 0; // 0 - left_top, 1 - right_top, 2 - right_bottom, 3 - left_bottom
	this.TrackOffsetX = 0;
	this.TrackOffsetY = 0;

	this.InlinePos = null;

	this.IsChangeSmall = true;
	this.ChangeSmallPoint = null;

	this.TableMatrix = null;
	this.CurrentPageIndex = null;

	this.IsResizeTableTrack = false;
	this.AddResizeCurrentW = 0;
	this.AddResizeCurrentH = 0;
	this.AddResizeMinW     = 0;
	this.AddResizeMinH     = 0;

	this.getLastPageBounds = function()
	{
		var _bounds = { Page: 0, X : 0, Y : 0, W : 0, H : 0 };
		if (!this.TableOutline || !this.TableOutline.Table)
			return _bounds;

		var _pagesCount = this.TableOutline.Table.GetPagesCount();
		if (0 >= _pagesCount)
			return _bounds;

		var _boundsTmp = this.TableOutline.Table.Get_PageBounds(_pagesCount - 1);
		_bounds.Page = this.TableOutline.Table.Get_AbsolutePage(_pagesCount - 1);
		_bounds.X = _boundsTmp.Left;
		_bounds.Y = _boundsTmp.Top;
		_bounds.W = (_boundsTmp.Right - _boundsTmp.Left);
		_bounds.H = (_boundsTmp.Bottom - _boundsTmp.Top);
		
		return _bounds;
	}

	this.getFullHeight = function()
	{
		var _height = 0;
		if (!this.TableOutline || !this.TableOutline.Table)
			return _height;

		var _pagesCount = this.TableOutline.Table.GetPagesCount();
		var _boundsTmp;
		for (var i = 0; i < _pagesCount; i++)
		{
			_boundsTmp = this.TableOutline.Table.Get_PageBounds(i);
			_height += (_boundsTmp.Bottom - _boundsTmp.Top);
		}

		return _height;
	}

	this.getFullTopPosition = function(_lastBounds)
	{
		if (_lastBounds.Page == this.TableOutline.PageNum)
		{
			return this.TableOutline.Y;	
		}

		var _height = this.getFullHeight();
		var _top = _lastBounds.Y + _lastBounds.H - _height;
		if (_top < 0)
			_top = 0;

		return _top;
	}

	this.checkMouseDown = function (pos, word_control)
	{
		if (null == this.TableOutline)
			return false;

		var _table_track = this.TableOutline;
		var _d = 13 * g_dKoef_pix_to_mm * 100 / word_control.m_nZoomValue;

		this.IsChangeSmall = true;
		this.ChangeSmallPoint = pos;

		this.CurPos = {X: this.ChangeSmallPoint.X, Y: this.ChangeSmallPoint.Y, Page: this.ChangeSmallPoint.Page};
		this.TrackOffsetX = 0;
		this.TrackOffsetY = 0;

		if (!this.TableMatrix || global_MatrixTransformer.IsIdentity(this.TableMatrix))
		{
			if (word_control.MobileTouchManager)
			{
				var _move_point = word_control.MobileTouchManager.TableMovePoint;

				if (_move_point == null || pos.Page != _table_track.PageNum)
					return false;

				var _pos1 = word_control.m_oDrawingDocument.ConvertCoordsToCursorWR(pos.X, pos.Y, pos.Page);
				var _pos2 = word_control.m_oDrawingDocument.ConvertCoordsToCursorWR(_move_point.X, _move_point.Y, pos.Page);

				var _eps = word_control.MobileTouchManager.TrackTargetEps;

				var _offset1 = word_control.MobileTouchManager.TableRulersRectOffset;
				var _offset2 = _offset1 + word_control.MobileTouchManager.TableRulersRectSize;
				if ((_pos1.X >= (_pos2.X - _offset2 - _eps)) && (_pos1.X <= (_pos2.X - _offset1 + _eps)) &&
					(_pos1.Y >= (_pos2.Y - _offset2 - _eps)) && (_pos1.Y <= (_pos2.Y - _offset1 + _eps)))
				{
					this.TrackTablePos = 0;
					return true;
				}

				return false;
			}

			switch (this.TrackTablePos)
			{
				case 1:
				{
					var _x = _table_track.X + _table_track.W;
					var _b = _table_track.Y;
					var _y = _b - _d;
					var _r = _x + _d;

					if ((pos.X > _x) && (pos.X < _r) && (pos.Y > _y) && (pos.Y < _b))
					{
						this.TrackOffsetX = pos.X - _x;
						this.TrackOffsetY = pos.Y - _b;

						this.CurPos.X -= this.TrackOffsetX;
						this.CurPos.Y -= this.TrackOffsetY;
						return true;
					}
					break;
				}
				case 2:
				{
					var _x = _table_track.X + _table_track.W;
					var _y = _table_track.Y + _table_track.H;
					var _r = _x + _d;
					var _b = _y + _d;

					if ((pos.X > _x) && (pos.X < _r) && (pos.Y > _y) && (pos.Y < _b))
					{
						this.TrackOffsetX = pos.X - _x;
						this.TrackOffsetY = pos.Y - _y;
						return true;
					}
					break;
				}
				case 3:
				{
					var _r = _table_track.X;
					var _x = _r - _d;
					var _y = _table_track.Y + _table_track.H;
					var _b = _y + _d;

					if ((pos.X > _x) && (pos.X < _r) && (pos.Y > _y) && (pos.Y < _b))
					{
						this.TrackOffsetX = pos.X - _r;
						this.TrackOffsetY = pos.Y - _y;

						this.CurPos.X -= this.TrackOffsetX;
						this.CurPos.Y -= this.TrackOffsetY;
						return true;
					}
					break;
				}
				case 0:
				default:
				{
					var _r = _table_track.X;
					var _b = _table_track.Y;
					var _x = _r - _d;
					var _y = _b - _d;

					if ((pos.X > _x) && (pos.X < _r) && (pos.Y > _y) && (pos.Y < _b))
					{
						this.TrackOffsetX = pos.X - _r;
						this.TrackOffsetY = pos.Y - _b;

						this.CurPos.X -= this.TrackOffsetX;
						this.CurPos.Y -= this.TrackOffsetY;
						return true;
					}
					break;
				}
			}

			if (true)
			{
				var _lastBounds = this.getLastPageBounds();
				var _x = _lastBounds.X + _lastBounds.W;
				var _y = _lastBounds.Y + _lastBounds.H;
				_d = 6 * g_dKoef_pix_to_mm * 100 / word_control.m_nZoomValue;

				var _r = _x + _d;
				var _b = _y + _d;

				if ((_lastBounds.Page == pos.Page) && (pos.X > _x) && (pos.X < _r) && (pos.Y > _y) && (pos.Y < _b))
				{
					this.TrackOffsetX = pos.X - _x;
					this.TrackOffsetY = pos.Y - _y;

					this.CurPos.X = global_mouseEvent.X;
					this.CurPos.Y = global_mouseEvent.Y;

					this.AddResizeCurrentW = 0;
					this.AddResizeCurrentH = 0;
					this.IsResizeTableTrack = true;

					var _table = this.TableOutline.Table;

					if (_lastBounds.Page == this.PageNum)
					{
						this.AddResizeMinH = _table.GetMinHeight() - this.TableOutline.H;
						this.AddResizeMinW = _table.GetMinWidth() - this.TableOutline.W;
					}
					else
					{
						var _fullTop = this.getFullTopPosition(_lastBounds);
						if (0 == _fullTop)
							this.AddResizeMinH = _fullTop - (_lastBounds.Y + _lastBounds.H);
						else
							this.AddResizeMinH = _fullTop + _table.GetMinHeight() - (_lastBounds.Y + _lastBounds.H);
						this.AddResizeMinW = _table.GetMinWidth() - _lastBounds.W;
					}

					word_control.m_oDrawingDocument.LockCursorType("se-resize");
					return true;
				}
			}

			return false;
		}
		else
		{
			if (word_control.MobileTouchManager)
			{
				var _invert = global_MatrixTransformer.Invert(this.TableMatrix);
				var _posx = _invert.TransformPointX(pos.X, pos.Y);
				var _posy = _invert.TransformPointY(pos.X, pos.Y);

				var _move_point = word_control.MobileTouchManager.TableMovePoint;

				if (_move_point == null || pos.Page != _table_track.PageNum)
					return false;

				var _koef = g_dKoef_pix_to_mm * 100 / word_control.m_nZoomValue;
				var _eps = word_control.MobileTouchManager.TrackTargetEps * _koef;

				var _offset1 = word_control.MobileTouchManager.TableRulersRectOffset * _koef;
				var _offset2 = _offset1 + word_control.MobileTouchManager.TableRulersRectSize * _koef;
				if ((_posx >= (_move_point.X - _offset2 - _eps)) && (_posx <= (_move_point.X - _offset1 + _eps)) &&
					(_posy >= (_move_point.Y - _offset2 - _eps)) && (_posy <= (_move_point.Y - _offset1 + _eps)))
				{
					this.TrackTablePos = 0;
					return true;
				}

				return false;
			}

			var _invert = global_MatrixTransformer.Invert(this.TableMatrix);
			var _posx = _invert.TransformPointX(pos.X, pos.Y);
			var _posy = _invert.TransformPointY(pos.X, pos.Y);
			switch (this.TrackTablePos)
			{
				case 1:
				{
					var _x = _table_track.X + _table_track.W;
					var _b = _table_track.Y;
					var _y = _b - _d;
					var _r = _x + _d;

					if ((_posx > _x) && (_posx < _r) && (_posy > _y) && (_posy < _b))
					{
						this.TrackOffsetX = _posx - _x;
						this.TrackOffsetY = _posy - _b;

						this.CurPos.X -= this.TrackOffsetX;
						this.CurPos.Y -= this.TrackOffsetY;
						return true;
					}
					break;
				}
				case 2:
				{
					var _x = _table_track.X + _table_track.W;
					var _y = _table_track.Y + _table_track.H;
					var _r = _x + _d;
					var _b = _y + _d;

					if ((_posx > _x) && (_posx < _r) && (_posy > _y) && (_posy < _b))
					{
						this.TrackOffsetX = _posx - _x;
						this.TrackOffsetY = _posy - _y;

						this.CurPos.X -= this.TrackOffsetX;
						this.CurPos.Y -= this.TrackOffsetY;
						return true;
					}
					break;
				}
				case 3:
				{
					var _r = _table_track.X;
					var _x = _r - _d;
					var _y = _table_track.Y + _table_track.H;
					var _b = _y + _d;

					if ((_posx > _x) && (_posx < _r) && (_posy > _y) && (_posy < _b))
					{
						this.TrackOffsetX = _posx - _r;
						this.TrackOffsetY = _posy - _y;

						this.CurPos.X -= this.TrackOffsetX;
						this.CurPos.Y -= this.TrackOffsetY;
						return true;
					}
					break;
				}
				case 0:
				default:
				{
					var _r = _table_track.X;
					var _b = _table_track.Y;
					var _x = _r - _d;
					var _y = _b - _d;

					if ((_posx > _x) && (_posx < _r) && (_posy > _y) && (_posy < _b))
					{
						this.TrackOffsetX = _posx - _r;
						this.TrackOffsetY = _posy - _b;

						this.CurPos.X -= this.TrackOffsetX;
						this.CurPos.Y -= this.TrackOffsetY;
						return true;
					}
					break;
				}
			}

			if (true)
			{
				var _lastBounds = this.getLastPageBounds();
				var _x = _lastBounds.X + _lastBounds.W;
				var _y = _lastBounds.Y + _lastBounds.H;
				_d = 6 * g_dKoef_pix_to_mm * 100 / word_control.m_nZoomValue;

				var _r = _x + _d;
				var _b = _y + _d;

				if ((_posx > _x) && (_posx < _r) && (_posy > _y) && (_posy < _b))
				{
					this.TrackOffsetX = _posx - _x;
					this.TrackOffsetY = _posy - _b;

					this.CurPos.X = global_mouseEvent.X;
					this.CurPos.Y = global_mouseEvent.Y;

					this.AddResizeCurrentW = 0;
					this.AddResizeCurrentH = 0;
					this.IsResizeTableTrack = true;

					word_control.m_oDrawingDocument.LockCursorType("se-resize");
					return true;
				}
			}

			return false;
		}

		return false;
	}

	this.checkMouseMoveTrack = function (pos, word_control)
	{
		if (null == this.TableOutline)
			return false;

		var _table_track = this.TableOutline;
		var _d = 13 * g_dKoef_pix_to_mm * 100 / word_control.m_nZoomValue;

		var _x, _y, _r, _b;
		if (!this.TableMatrix || global_MatrixTransformer.IsIdentity(this.TableMatrix))
		{
			switch (this.TrackTablePos)
			{
				case 1:
				{
					_x = _table_track.X + _table_track.W;
					_b = _table_track.Y;
					_y = _b - _d;
					_r = _x + _d;

					if ((pos.X > _x) && (pos.X < _r) && (pos.Y > _y) && (pos.Y < _b))
						return true;
					break;
				}
				case 2:
				{
					_x = _table_track.X + _table_track.W;
					_y = _table_track.Y + _table_track.H;
					_r = _x + _d;
					_b = _y + _d;

					if ((pos.X > _x) && (pos.X < _r) && (pos.Y > _y) && (pos.Y < _b))
						return true;
					break;
				}
				case 3:
				{
					_r = _table_track.X;
					_x = _r - _d;
					_y = _table_track.Y + _table_track.H;
					_b = _y + _d;

					if ((pos.X > _x) && (pos.X < _r) && (pos.Y > _y) && (pos.Y < _b))
						return true;
					break;
				}
				case 0:
				default:
				{
					_r = _table_track.X;
					_b = _table_track.Y;
					_x = _r - _d;
					_y = _b - _d;

					if ((pos.X > _x) && (pos.X < _r) && (pos.Y > _y) && (pos.Y < _b))
						return true;
					break;
				}
			}
		}
		else
		{
			var _invert = global_MatrixTransformer.Invert(this.TableMatrix);
			var _posx = _invert.TransformPointX(pos.X, pos.Y);
			var _posy = _invert.TransformPointY(pos.X, pos.Y);
			switch (this.TrackTablePos)
			{
				case 1:
				{
					_x = _table_track.X + _table_track.W;
					_b = _table_track.Y;
					_y = _b - _d;
					_r = _x + _d;

					if ((_posx > _x) && (_posx < _r) && (_posy > _y) && (_posy < _b))
						return true;
					break;
				}
				case 2:
				{
					_x = _table_track.X + _table_track.W;
					_y = _table_track.Y + _table_track.H;
					_r = _x + _d;
					_b = _y + _d;

					if ((_posx > _x) && (_posx < _r) && (_posy > _y) && (_posy < _b))
						return true;
					break;
				}
				case 3:
				{
					_r = _table_track.X;
					_x = _r - _d;
					_y = _table_track.Y + _table_track.H;
					_b = _y + _d;

					if ((_posx > _x) && (_posx < _r) && (_posy > _y) && (_posy < _b))
						return true;
					break;
				}
				case 0:
				default:
				{
					_r = _table_track.X;
					_b = _table_track.Y;
					_x = _r - _d;
					_y = _b - _d;

					if ((_posx > _x) && (_posx < _r) && (_posy > _y) && (_posy < _b))
						return true;
					break;
				}
			}
		}

		return false;
	}

	this.checkMouseUp = function (X, Y, word_control)
	{
		this.bIsTracked = false;

		if (null == this.TableOutline || (true === this.IsChangeSmall) || word_control.m_oApi.isViewMode)
			return false;

		var _koef = g_dKoef_pix_to_mm * 100 / word_control.m_nZoomValue;
		var _d = 13 * _koef;

		var _outline = this.TableOutline;
		var _table = _outline.Table;

		_table.MoveCursorToStartPos();
		_table.Document_SetThisElementCurrent(true);

		if (this.IsResizeTableTrack)
		{
			var _addW = (X - this.CurPos.X) * _koef - this.TrackOffsetX;
			var _addH = (Y - this.CurPos.Y) * _koef - this.TrackOffsetY;

			_table.ResizeTableInDocument(this.TableOutline.W + _addW, this.TableOutline.H + _addH);

			this.AddResizeCurrentW = 0;
			this.AddResizeCurrentH = 0;
			this.IsResizeTableTrack = false;
			word_control.m_oDrawingDocument.UnlockCursorType();
			word_control.m_oDrawingDocument.SetCursorType("default");
			var api = word_control.m_oApi;
			api && api._doRecordCollaboration && api._doRecordCollaboration('修改了表格的大小')
			return;
		}

		if (!_table.Is_Inline())
		{
			var pos;
			switch (this.TrackTablePos)
			{
				case 1:
				{
					var _w_pix = this.TableOutline.W * g_dKoef_mm_to_pix * word_control.m_nZoomValue / 100;
					pos = word_control.m_oDrawingDocument.ConvertCoordsFromCursor2(X - _w_pix, Y);
					break;
				}
				case 2:
				{
					var _w_pix = this.TableOutline.W * g_dKoef_mm_to_pix * word_control.m_nZoomValue / 100;
					var _h_pix = this.TableOutline.H * g_dKoef_mm_to_pix * word_control.m_nZoomValue / 100;
					pos = word_control.m_oDrawingDocument.ConvertCoordsFromCursor2(X - _w_pix, Y - _h_pix);
					break;
				}
				case 3:
				{
					var _h_pix = this.TableOutline.H * g_dKoef_mm_to_pix * word_control.m_nZoomValue / 100;
					pos = word_control.m_oDrawingDocument.ConvertCoordsFromCursor2(X, Y - _h_pix);
					break;
				}
				case 0:
				default:
				{
					pos = word_control.m_oDrawingDocument.ConvertCoordsFromCursor2(X, Y);
					break;
				}
			}

			var NearestPos = word_control.m_oLogicDocument.Get_NearestPos(pos.Page, pos.X - this.TrackOffsetX, pos.Y - this.TrackOffsetY);
			_table.Move(pos.X - this.TrackOffsetX, pos.Y - this.TrackOffsetY, pos.Page, NearestPos);
			_outline.X = pos.X - this.TrackOffsetX;
			_outline.Y = pos.Y - this.TrackOffsetY;
			_outline.PageNum = pos.Page;
		}
		else
		{
			if (null != this.InlinePos)
			{
				// inline move
				_table.Move(this.InlinePos.X, this.InlinePos.Y, this.InlinePos.Page, this.InlinePos);
				var api = word_control.m_oApi;
				api && api._doRecordCollaboration && api._doRecordCollaboration('移动了表格的位置')
			}
		}
	}

	this.checkMouseMove = function (X, Y, word_control)
	{
		if (null == this.TableOutline)
			return false;

		if (true === this.IsChangeSmall)
		{
			var _pos = word_control.m_oDrawingDocument.ConvertCoordsFromCursor2(X, Y);
			var _dist = 15 * g_dKoef_pix_to_mm * 100 / word_control.m_nZoomValue;
			if ((Math.abs(_pos.X - this.ChangeSmallPoint.X) < _dist) && (Math.abs(_pos.Y - this.ChangeSmallPoint.Y) < _dist) && (_pos.Page == this.ChangeSmallPoint.Page))
			{
				if (this.IsResizeTableTrack)
					return;

				this.CurPos = {
					X: this.ChangeSmallPoint.X,
					Y: this.ChangeSmallPoint.Y,
					Page: this.ChangeSmallPoint.Page
				};

				switch (this.TrackTablePos)
				{
					case 1:
					{
						this.CurPos.X -= this.TableOutline.W;
						break;
					}
					case 2:
					{
						this.CurPos.X -= this.TableOutline.W;
						this.CurPos.Y -= this.TableOutline.H;
						break;
					}
					case 3:
					{
						this.CurPos.Y -= this.TableOutline.H;
						break;
					}
					case 0:
					default:
					{
						break;
					}
				}

				this.CurPos.X -= this.TrackOffsetX;
				this.CurPos.Y -= this.TrackOffsetY;
				return;
			}
			this.IsChangeSmall = false;

			this.TableOutline.Table.RemoveSelection();
			this.TableOutline.Table.MoveCursorToStartPos();
			word_control.m_oLogicDocument.Document_UpdateSelectionState();
		}

		if (this.IsResizeTableTrack)
		{
			var _koef = g_dKoef_pix_to_mm * 100 / word_control.m_nZoomValue;
			this.AddResizeCurrentW = Math.max(this.AddResizeMinW, (X - this.CurPos.X) * _koef - this.TrackOffsetX);
			this.AddResizeCurrentH = Math.max(this.AddResizeMinH, (Y - this.CurPos.Y) * _koef - this.TrackOffsetY);

			return true;
		}

		var _d = 13 * g_dKoef_pix_to_mm * 100 / word_control.m_nZoomValue;
		switch (this.TrackTablePos)
		{
			case 1:
			{
				var _w_pix = this.TableOutline.W * g_dKoef_mm_to_pix * word_control.m_nZoomValue / 100;
				this.CurPos = word_control.m_oDrawingDocument.ConvertCoordsFromCursor2(X - _w_pix, Y);
				break;
			}
			case 2:
			{
				var _w_pix = this.TableOutline.W * g_dKoef_mm_to_pix * word_control.m_nZoomValue / 100;
				var _h_pix = this.TableOutline.H * g_dKoef_mm_to_pix * word_control.m_nZoomValue / 100;
				this.CurPos = word_control.m_oDrawingDocument.ConvertCoordsFromCursor2(X - _w_pix, Y - _h_pix);
				break;
			}
			case 3:
			{
				var _h_pix = this.TableOutline.H * g_dKoef_mm_to_pix * word_control.m_nZoomValue / 100;
				this.CurPos = word_control.m_oDrawingDocument.ConvertCoordsFromCursor2(X, Y - _h_pix);
				break;
			}
			case 0:
			default:
			{
				this.CurPos = word_control.m_oDrawingDocument.ConvertCoordsFromCursor2(X, Y);
				break;
			}
		}

		this.CurPos.X -= this.TrackOffsetX;
		this.CurPos.Y -= this.TrackOffsetY;
	}

	this.checkMouseMove2 = function (X, Y, word_control)
	{
		if (null == this.TableOutline)
			return;

		if (word_control.MobileTouchManager)
			return;

		var _table_track = this.TableOutline;

		var pos = null;
		if (word_control.m_oDrawingDocument.AutoShapesTrackLockPageNum == -1)
			pos = word_control.m_oDrawingDocument.ConvertCoordsFromCursor2(global_mouseEvent.X, global_mouseEvent.Y);
		else
			pos = word_control.m_oDrawingDocument.ConvetToPageCoords(global_mouseEvent.X, global_mouseEvent.Y, word_control.m_oDrawingDocument.AutoShapesTrackLockPageNum);

		var _lastBounds = word_control.m_oDrawingDocument.TableOutlineDr.getLastPageBounds();
		if (_lastBounds.Page != pos.Page)
			return false;

		if (!this.TableMatrix || global_MatrixTransformer.IsIdentity(this.TableMatrix))
		{
			var _x = _lastBounds.X + _lastBounds.W;
			var _y = _lastBounds.Y + _lastBounds.H;
			var _d = 6 * g_dKoef_pix_to_mm * 100 / word_control.m_nZoomValue;

			var _r = _x + _d;
			var _b = _y + _d;

			if ((pos.X > _x) && (pos.X < _r) && (pos.Y > _y) && (pos.Y < _b))
			{
				word_control.m_oDrawingDocument.SetCursorType("se-resize");
				return true;
			}
		}
		else
		{
			var _invert = global_MatrixTransformer.Invert(this.TableMatrix);
			var _posx = _invert.TransformPointX(pos.X, pos.Y);
			var _posy = _invert.TransformPointY(pos.X, pos.Y);

			var _x = _lastBounds.X + _lastBounds.W;
			var _y = _lastBounds.Y + _lastBounds.H;
			_d = 6 * g_dKoef_pix_to_mm * 100 / word_control.m_nZoomValue;

			var _r = _x + _d;
			var _b = _y + _d;

			if ((_posx > _x) && (_posx < _r) && (_posy > _y) && (_posy < _b))
			{
				word_control.m_oDrawingDocument.SetCursorType("se-resize");
				return true;
			}
		}
		return false;
	}

	this.CheckStartTrack = function (word_control, transform)
	{
		this.TableMatrix = null;
		if (transform)
			this.TableMatrix = transform.CreateDublicate();

		if (!this.TableMatrix || global_MatrixTransformer.IsIdentity(this.TableMatrix))
		{
			var pos = word_control.m_oDrawingDocument.ConvertCoordsToCursor(this.TableOutline.X, this.TableOutline.Y, this.TableOutline.PageNum, true);

			var _x0 = word_control.m_oEditor.AbsolutePosition.L;
			var _y0 = word_control.m_oEditor.AbsolutePosition.T;

			if (pos.X < _x0 && pos.Y < _y0)
			{
				this.TrackTablePos = 2;
			}
			else if (pos.X < _x0)
			{
				this.TrackTablePos = 1;
			}
			else if (pos.Y < _y0)
			{
				this.TrackTablePos = 3;
			}
			else
			{
				this.TrackTablePos = 0;
			}
		}
		else
		{
			var _x = this.TableOutline.X;
			var _y = this.TableOutline.Y;
			var _r = _x + this.TableOutline.W;
			var _b = _y + this.TableOutline.H;

			var x0 = transform.TransformPointX(_x, _y);
			var y0 = transform.TransformPointY(_x, _y);

			var x1 = transform.TransformPointX(_r, _y);
			var y1 = transform.TransformPointY(_r, _y);

			var x2 = transform.TransformPointX(_r, _b);
			var y2 = transform.TransformPointY(_r, _b);

			var x3 = transform.TransformPointX(_x, _b);
			var y3 = transform.TransformPointY(_x, _b);

			var _x0 = word_control.m_oEditor.AbsolutePosition.L * g_dKoef_mm_to_pix;
			var _y0 = word_control.m_oEditor.AbsolutePosition.T * g_dKoef_mm_to_pix;
			var _x1 = word_control.m_oEditor.AbsolutePosition.R * g_dKoef_mm_to_pix;
			var _y1 = word_control.m_oEditor.AbsolutePosition.B * g_dKoef_mm_to_pix;

			var pos0 = word_control.m_oDrawingDocument.ConvertCoordsToCursor(x0, y0, this.TableOutline.PageNum, true);
			if (pos0.X > _x0 && pos0.X < _x1 && pos0.Y > _y0 && pos0.Y < _y1)
			{
				this.TrackTablePos = 0;
				return;
			}

			pos0 = word_control.m_oDrawingDocument.ConvertCoordsToCursor(x1, y1, this.TableOutline.PageNum, true);
			if (pos0.X > _x0 && pos0.X < _x1 && pos0.Y > _y0 && pos0.Y < _y1)
			{
				this.TrackTablePos = 1;
				return;
			}

			pos0 = word_control.m_oDrawingDocument.ConvertCoordsToCursor(x3, y3, this.TableOutline.PageNum, true);
			if (pos0.X > _x0 && pos0.X < _x1 && pos0.Y > _y0 && pos0.Y < _y1)
			{
				this.TrackTablePos = 3;
				return;
			}

			pos0 = word_control.m_oDrawingDocument.ConvertCoordsToCursor(x2, y2, this.TableOutline.PageNum, true);
			if (pos0.X > _x0 && pos0.X < _x1 && pos0.Y > _y0 && pos0.Y < _y1)
			{
				this.TrackTablePos = 2;
				return;
			}

			this.TrackTablePos = 0;
		}
	}

	this.checkMover = function()
	{
		if (this.mover && Math.abs(this.mover.scale - AscCommon.AscBrowser.retinaPixelRatio) < 0.001)
			return;

		var rPR = AscCommon.AscBrowser.retinaPixelRatio;
		var rectSize = Math.round(12 * rPR);
		var halfRSize = Math.round(rectSize / 2);
		var indent = 0.5 * Math.round(rPR);

		var lineW = Math.round(rPR);
		var size = rectSize + lineW;
		if(0 !== (rectSize & 1))
			size += 1;

		this.mover = document.createElement("canvas");
		this.mover.scale = AscCommon.AscBrowser.retinaPixelRatio;
		this.mover.width = size;
		this.mover.height = size;
		var ctx = this.mover.getContext("2d");
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(0, 0, size, size);

		var tmpImage = document.createElement("canvas");
		// размеры - в drawArrow
		tmpImage.width = Math.round(13 * rPR);
		tmpImage.height = Math.round(13 * rPR);
		var tmpContext = tmpImage.getContext("2d");

		AscCommon.COverlay.prototype.drawArrow(tmpContext, 0,  -Math.round(3 * rPR), 3 * Math.round( rPR), {r: 68, g: 68, b: 68});
		// top
		ctx.drawImage(tmpImage, 0, 0);
		//bottom
		tmpContext.translate(Math.round(rectSize / 2), Math.round(rectSize / 2));
		tmpContext.rotate(Math.PI);
		tmpContext.translate(-Math.round(rectSize / 2), -Math.round(rectSize / 2));
		tmpContext.drawImage(tmpImage, -Math.round(rPR), -Math.round(rPR));
		ctx.drawImage(tmpImage, 0, 0);
		tmpContext.setTransform(1,0,0,1,0,0);
		//draw left and right arrow
		tmpContext.translate(Math.round(rectSize / 2), Math.round(rectSize / 2));
		tmpContext.rotate(Math.PI / 2);
		tmpContext.translate(-Math.round(rectSize / 2), -Math.round(rectSize / 2));
		tmpContext.drawImage(tmpImage, 0, -Math.round(rPR));
		ctx.drawImage(tmpImage, 0, 0);

		ctx.lineWidth = lineW;
		ctx.strokeStyle = "rgb(140, 140, 140)";

		if (0 !== (rectSize & 1)) {
			rectSize += 1;
		}
		ctx.strokeRect(0.5 * lineW, 0.5 * lineW, rectSize, rectSize);

		ctx.strokeStyle = "rgb(68, 68, 68)";
		ctx.moveTo(halfRSize - Math.round(Math.round(6 * rPR) / 2) + indent, halfRSize + indent);
		ctx.lineTo(halfRSize + Math.round(Math.round(6 * rPR) / 2) + indent, halfRSize + 0.5 * Math.round(rPR));
		ctx.moveTo(halfRSize + indent, halfRSize - Math.round(Math.round(6 * rPR) / 2) + indent);
		ctx.lineTo(halfRSize + indent, halfRSize + Math.round(Math.round(6 * rPR) / 2) + indent);
		ctx.stroke();
	};
}

function CCacheImage()
{
	this.image = null;
	this.image_locked = 0;
	this.image_unusedCount = 0;
}

function CCacheManager()
{
	this.arrayImages = [];
	this.arrayCount = 0;
	this.countValidImage = 1;

	this.CheckImagesForNeed = function ()
	{
		for (var i = 0; i < this.arrayCount; ++i)
		{
			if ((this.arrayImages[i].image_locked == 0) && (this.arrayImages[i].image_unusedCount >= this.countValidImage))
			{
				delete this.arrayImages[i].image;
				this.arrayImages.splice(i, 1);
				--i;
				--this.arrayCount;
			}
		}
	}

	this.UnLock = function (_cache_image)
	{
		if (null == _cache_image)
			return;

		_cache_image.image_locked = 0;
		_cache_image.image_unusedCount = 0;
		// затем нужно сбросить ссылку в ноль (_cache_image = null) <- это обязательно !!!!!!!
	}

	this.Lock = function (_w, _h, _drDocument)
	{
		var backgroundColor = "#FFFFFF";
		if (_drDocument)
		{
			var backColor = _drDocument.m_oWordControl.m_oApi.getPageBackgroundColor();
            backgroundColor = "#" + backColor[0].toString(16) + backColor[1].toString(16) + backColor[2].toString(16);
        }

		for (var i = 0; i < this.arrayCount; ++i)
		{
			if (this.arrayImages[i].image_locked)
				continue;
			var _wI = this.arrayImages[i].image.width;
			var _hI = this.arrayImages[i].image.height;
			if ((_wI == _w) && (_hI == _h))
			{
				this.arrayImages[i].image_locked = 1;
				this.arrayImages[i].image_unusedCount = 0;
				this.arrayImages[i].image.ctx.globalAlpha = 1.0;
				this.arrayImages[i].image.ctx.setTransform(1, 0, 0, 1, 0, 0);
				this.arrayImages[i].image.ctx.fillStyle = backgroundColor;
				this.arrayImages[i].image.ctx.fillRect(0, 0, _w, _h);
				return this.arrayImages[i];
			}
			this.arrayImages[i].image_unusedCount++;
		}
		this.CheckImagesForNeed();
		var index = this.arrayCount;
		this.arrayCount++;

		this.arrayImages[index] = new CCacheImage();
		this.arrayImages[index].image = document.createElement('canvas');
		this.arrayImages[index].image.width = _w;
		this.arrayImages[index].image.height = _h;
		this.arrayImages[index].image.ctx = this.arrayImages[index].image.getContext('2d');
		this.arrayImages[index].image.ctx.globalAlpha = 1.0;
		this.arrayImages[index].image.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.arrayImages[index].image.ctx.fillStyle = backgroundColor;
		this.arrayImages[index].image.ctx.fillRect(0, 0, _w, _h);
		this.arrayImages[index].image_locked = 1;
		this.arrayImages[index].image_unusedCount = 0;
		return this.arrayImages[index];
	}
}

function CDrawingPage()
{
	this.left = 0;
	this.top = 0;
	this.right = 0;
	this.bottom = 0;

	this.cachedImage = null;

	this.IsRecalculate = false;
	this.RecalculateTime = -1;
}
CDrawingPage.prototype =
{
	SetRepaint: function (cache_manager)
	{
		if (this.cachedImage != null && this.cachedImage.image != null)
		{
			this.IsRecalculate = true;
			if (-1 == this.RecalculateTime)
				this.RecalculateTime = new Date().getTime();
			return;
		}
		this.UnLock(cache_manager);
	},

	UnLock: function (cache_manager)
	{
		cache_manager.UnLock(this.cachedImage);
		this.cachedImage = null;
		this.IsRecalculate = false;
		this.RecalculateTime = -1;
	}
};

var g_page_outline_inner = false;//AscCommon.AscBrowser.isChrome;
function CPage()
{
	this.width_mm = 210;
	this.height_mm = 297;

	this.margin_left = 0;
	this.margin_top = 0;
	this.margin_right = 0;
	this.margin_bottom = 0;

	this.pageIndex = -1;

	this.searchingArray = [];
	this.selectionArray = [];
	this.drawingPage = new CDrawingPage();

	this.Draw = function (context, xDst, yDst, wDst, hDst, api)
	{
		var strokeColor = undefined;
        if (!g_page_outline_inner)
            strokeColor = GlobalSkin.PageOutline;

		if (null != this.drawingPage.cachedImage)
		{
			// потом посмотреть на кусочную отрисовку
			context.drawImage(this.drawingPage.cachedImage.image, xDst, yDst, wDst, hDst);
		}
		else
		{
			if (!api.isDarkMode)
				context.fillStyle = "#FFFFFF";
			else
			{
                var backColor = api.getPageBackgroundColor();
                context.fillStyle = "#" + backColor[0].toString(16) + backColor[1].toString(16) + backColor[2].toString(16);
			}

			strokeColor = GlobalSkin.PageOutline;
			context.fillRect(xDst, yDst, wDst, hDst);
		}

		if (api && api.isDarkMode)
		{
			strokeColor = api.getPageStrokeColor();
		}

        if (strokeColor)
        {
            var rPR = AscCommon.AscBrowser.retinaPixelRatio;
            context.lineWidth = Math.round(rPR);
            context.strokeStyle = strokeColor;
            context.beginPath();
            context.strokeRect(xDst - 0.5 * rPR, yDst - 0.5 * rPR, wDst + rPR, hDst + rPR);
            context.beginPath();
        }
	};

	this.DrawSelection = function (overlay, xDst, yDst, wDst, hDst, TextMatrix)
	{
		var dKoefX = wDst / this.width_mm;
		var dKoefY = hDst / this.height_mm;

		var selectionArray = this.selectionArray;

		if (null == TextMatrix || global_MatrixTransformer.IsIdentity(TextMatrix))
		{
			for (var i = 0; i < selectionArray.length; i++)
			{
				var r = selectionArray[i];

				var _x = ((xDst + dKoefX * r.x) >> 0) - 0.5;
				var _y = ((yDst + dKoefY * r.y) >> 0) - 0.5;

				var _w = (dKoefX * r.w + 1) >> 0;
				var _h = (dKoefY * r.h + 1) >> 0;

				if (_x < overlay.min_x)
					overlay.min_x = _x;
				if ((_x + _w) > overlay.max_x)
					overlay.max_x = _x + _w;

				if (_y < overlay.min_y)
					overlay.min_y = _y;
				if ((_y + _h) > overlay.max_y)
					overlay.max_y = _y + _h;

				overlay.m_oContext.rect(_x, _y, _w, _h);
			}
		}
		else
		{
			for (var i = 0; i < selectionArray.length; i++)
			{
				var r = selectionArray[i];

				var _x1 = TextMatrix.TransformPointX(r.x, r.y);
				var _y1 = TextMatrix.TransformPointY(r.x, r.y);

				var _x2 = TextMatrix.TransformPointX(r.x + r.w, r.y);
				var _y2 = TextMatrix.TransformPointY(r.x + r.w, r.y);

				var _x3 = TextMatrix.TransformPointX(r.x + r.w, r.y + r.h);
				var _y3 = TextMatrix.TransformPointY(r.x + r.w, r.y + r.h);

				var _x4 = TextMatrix.TransformPointX(r.x, r.y + r.h);
				var _y4 = TextMatrix.TransformPointY(r.x, r.y + r.h);

				var x1 = xDst + dKoefX * _x1;
				var y1 = yDst + dKoefY * _y1;

				var x2 = xDst + dKoefX * _x2;
				var y2 = yDst + dKoefY * _y2;

				var x3 = xDst + dKoefX * _x3;
				var y3 = yDst + dKoefY * _y3;

				var x4 = xDst + dKoefX * _x4;
				var y4 = yDst + dKoefY * _y4;

				overlay.CheckPoint(x1, y1);
				overlay.CheckPoint(x2, y2);
				overlay.CheckPoint(x3, y3);
				overlay.CheckPoint(x4, y4);

				var ctx = overlay.m_oContext;
				ctx.moveTo(x1, y1);
				ctx.lineTo(x2, y2);
				ctx.lineTo(x3, y3);
				ctx.lineTo(x4, y4);
				ctx.closePath();
			}
		}
	}
	this.DrawSearch = function (overlay, xDst, yDst, wDst, hDst, drDoc)
	{
		var dKoefX = wDst / this.width_mm;
		var dKoefY = hDst / this.height_mm;

		// проверяем колонтитулы ------------
		var ret = this.drawInHdrFtr(overlay, xDst, yDst, wDst, hDst, dKoefX, dKoefY, drDoc._search_HdrFtr_All);
		if (!ret && this.pageIndex != 0)
			ret = this.drawInHdrFtr(overlay, xDst, yDst, wDst, hDst, dKoefX, dKoefY, drDoc._search_HdrFtr_All_no_First);
		if (!ret && this.pageIndex == 0)
			ret = this.drawInHdrFtr(overlay, xDst, yDst, wDst, hDst, dKoefX, dKoefY, drDoc._search_HdrFtr_First);
		if (!ret && (this.pageIndex & 1) == 1)
			ret = this.drawInHdrFtr(overlay, xDst, yDst, wDst, hDst, dKoefX, dKoefY, drDoc._search_HdrFtr_Even);
		if (!ret && (this.pageIndex & 1) == 0)
			ret = this.drawInHdrFtr(overlay, xDst, yDst, wDst, hDst, dKoefX, dKoefY, drDoc._search_HdrFtr_Odd);
		if (!ret && (this.pageIndex != 0))
			ret = this.drawInHdrFtr(overlay, xDst, yDst, wDst, hDst, dKoefX, dKoefY, drDoc._search_HdrFtr_Odd_no_First);
		// ----------------------------------

		var ctx = overlay.m_oContext;
		for (var i = 0; i < this.searchingArray.length; i++)
		{
			var place = this.searchingArray[i];

			if (!place.Transform)
			{
				if (undefined === place.Ex)
				{
					var _x = ((xDst + dKoefX * place.X) >> 0) - 0.5;
					var _y = ((yDst + dKoefY * place.Y) >> 0) - 0.5;

					var _w = ((dKoefX * place.W) >> 0) + 1;
					var _h = ((dKoefY * place.H) >> 0) + 1;

					if (_x < overlay.min_x)
						overlay.min_x = _x;
					if ((_x + _w) > overlay.max_x)
						overlay.max_x = _x + _w;

					if (_y < overlay.min_y)
						overlay.min_y = _y;
					if ((_y + _h) > overlay.max_y)
						overlay.max_y = _y + _h;

					ctx.rect(_x, _y, _w, _h);
				}
				else
				{
					var _x1 = (xDst + dKoefX * place.X) >> 0;
					var _y1 = (yDst + dKoefY * place.Y) >> 0;

					var x2 = place.X + place.W * place.Ex;
					var y2 = place.Y + place.W * place.Ey;
					var _x2 = (xDst + dKoefX * x2) >> 0;
					var _y2 = (yDst + dKoefY * y2) >> 0;

					var x3 = x2 - place.H * place.Ey;
					var y3 = y2 + place.H * place.Ex;
					var _x3 = (xDst + dKoefX * x3) >> 0;
					var _y3 = (yDst + dKoefY * y3) >> 0;

					var x4 = place.X - place.H * place.Ey;
					var y4 = place.Y + place.H * place.Ex;
					var _x4 = (xDst + dKoefX * x4) >> 0;
					var _y4 = (yDst + dKoefY * y4) >> 0;

					overlay.CheckPoint(_x1, _y1);
					overlay.CheckPoint(_x2, _y2);
					overlay.CheckPoint(_x3, _y3);
					overlay.CheckPoint(_x4, _y4);

					ctx.moveTo(_x1, _y1);
					ctx.lineTo(_x2, _y2);
					ctx.lineTo(_x3, _y3);
					ctx.lineTo(_x4, _y4);
					ctx.lineTo(_x1, _y1);
				}
			}
			else
			{
				var _tr = place.Transform;
				if (undefined === place.Ex)
				{
					var _x1 = xDst + dKoefX * _tr.TransformPointX(place.X, place.Y);
					var _y1 = yDst + dKoefY * _tr.TransformPointY(place.X, place.Y);

					var _x2 = xDst + dKoefX * _tr.TransformPointX(place.X + place.W, place.Y);
					var _y2 = yDst + dKoefY * _tr.TransformPointY(place.X + place.W, place.Y);

					var _x3 = xDst + dKoefX * _tr.TransformPointX(place.X + place.W, place.Y + place.H);
					var _y3 = yDst + dKoefY * _tr.TransformPointY(place.X + place.W, place.Y + place.H);

					var _x4 = xDst + dKoefX * _tr.TransformPointX(place.X, place.Y + place.H);
					var _y4 = yDst + dKoefY * _tr.TransformPointY(place.X, place.Y + place.H);

					overlay.CheckPoint(_x1, _y1);
					overlay.CheckPoint(_x2, _y2);
					overlay.CheckPoint(_x3, _y3);
					overlay.CheckPoint(_x4, _y4);

					ctx.moveTo(_x1, _y1);
					ctx.lineTo(_x2, _y2);
					ctx.lineTo(_x3, _y3);
					ctx.lineTo(_x4, _y4);
					ctx.lineTo(_x1, _y1);
				}
				else
				{
					var x2 = place.X + place.W * place.Ex;
					var y2 = place.Y + place.W * place.Ey;

					var x3 = x2 - place.H * place.Ey;
					var y3 = y2 + place.H * place.Ex;

					var x4 = place.X - place.H * place.Ey;
					var y4 = place.Y + place.H * place.Ex;

					var _x1 = xDst + dKoefX * _tr.TransformPointX(place.X, place.Y);
					var _y1 = yDst + dKoefY * _tr.TransformPointY(place.X, place.Y);

					var _x2 = xDst + dKoefX * _tr.TransformPointX(x2, y2);
					var _y2 = yDst + dKoefY * _tr.TransformPointY(x2, y2);

					var _x3 = xDst + dKoefX * _tr.TransformPointX(x3, y3);
					var _y3 = yDst + dKoefY * _tr.TransformPointY(x3, y3);

					var _x4 = xDst + dKoefX * _tr.TransformPointX(x4, y4);
					var _y4 = yDst + dKoefY * _tr.TransformPointY(x4, y4);

					overlay.CheckPoint(_x1, _y1);
					overlay.CheckPoint(_x2, _y2);
					overlay.CheckPoint(_x3, _y3);
					overlay.CheckPoint(_x4, _y4);

					ctx.moveTo(_x1, _y1);
					ctx.lineTo(_x2, _y2);
					ctx.lineTo(_x3, _y3);
					ctx.lineTo(_x4, _y4);
					ctx.lineTo(_x1, _y1);
				}
			}
		}
	}

	this.DrawSearch2 = function (overlay, xDst, yDst, wDst, hDst, _searching)
	{
		var dKoefX = wDst / this.width_mm;
		var dKoefY = hDst / this.height_mm;
		var rPR = AscCommon.AscBrowser.retinaPixelRatio;

		var ctx = overlay.m_oContext;
		for (var i = 0; i < _searching.length; i++)
		{
			var _find_count = _searching[i].length;

			for (var j = 0; j < _find_count; j++)
			{
				var place = _searching[i][j];

				if (!place.Transform)
				{
					if (undefined === place.Ex)
					{
						var _x = (rPR * (xDst + dKoefX * place.X)) >> 0;
						var _y = (rPR * (yDst + dKoefY * place.Y)) >> 0;

						var _w = (rPR * (dKoefX * place.W)) >> 0;
						var _h = (rPR * (dKoefY * place.H)) >> 0;

						if (_x < overlay.min_x)
							overlay.min_x = _x;
						if ((_x + _w) > overlay.max_x)
							overlay.max_x = _x + _w;

						if (_y < overlay.min_y)
							overlay.min_y = _y;
						if ((_y + _h) > overlay.max_y)
							overlay.max_y = _y + _h;

						ctx.rect(_x, _y, _w, _h);
					}
					else
					{
						var _x1 = (rPR * (xDst + dKoefX * place.X)) >> 0;
						var _y1 = (rPR * (yDst + dKoefY * place.Y)) >> 0;

						var x2 = place.X + place.W * place.Ex;
						var y2 = place.Y + place.W * place.Ey;
						var _x2 = (rPR * (xDst + dKoefX * x2)) >> 0;
						var _y2 = (rPR * (yDst + dKoefY * y2)) >> 0;

						var x3 = x2 - place.H * place.Ey;
						var y3 = y2 + place.H * place.Ex;
						var _x3 = (rPR * (xDst + dKoefX * x3)) >> 0;
						var _y3 = (rPR * (yDst + dKoefY * y3)) >> 0;

						var x4 = place.X - place.H * place.Ey;
						var y4 = place.Y + place.H * place.Ex;
						var _x4 = (rPR * (xDst + dKoefX * x4)) >> 0;
						var _y4 = (rPR * (yDst + dKoefY * y4)) >> 0;

						overlay.CheckPoint(_x1, _y1);
						overlay.CheckPoint(_x2, _y2);
						overlay.CheckPoint(_x3, _y3);
						overlay.CheckPoint(_x4, _y4);

						ctx.moveTo(_x1, _y1);
						ctx.lineTo(_x2, _y2);
						ctx.lineTo(_x3, _y3);
						ctx.lineTo(_x4, _y4);
						ctx.lineTo(_x1, _y1);
					}
				}
			}
		}
	}

	this.drawInHdrFtr = function (overlay, xDst, yDst, wDst, hDst, dKoefX, dKoefY, arr)
	{
		var _c = arr.length;
		if (0 == _c)
			return false;

		var ctx = overlay.m_oContext;
		for (var i = 0; i < _c; i++)
		{
			var place = arr[i];

			if (!place.Transform)
			{
				if (undefined === place.Ex)
				{
					var _x = ((xDst + dKoefX * place.X) >> 0) - 0.5;
					var _y = ((yDst + dKoefY * place.Y) >> 0) - 0.5;

					var _w = ((dKoefX * place.W) >> 0) + 1;
					var _h = ((dKoefY * place.H) >> 0) + 1;

					if (_x < overlay.min_x)
						overlay.min_x = _x;
					if ((_x + _w) > overlay.max_x)
						overlay.max_x = _x + _w;

					if (_y < overlay.min_y)
						overlay.min_y = _y;
					if ((_y + _h) > overlay.max_y)
						overlay.max_y = _y + _h;

					ctx.rect(_x, _y, _w, _h);
				}
				else
				{
					var _x1 = (xDst + dKoefX * place.X) >> 0;
					var _y1 = (yDst + dKoefY * place.Y) >> 0;

					var x2 = place.X + place.W * place.Ex;
					var y2 = place.Y + place.W * place.Ey;
					var _x2 = (xDst + dKoefX * x2) >> 0;
					var _y2 = (yDst + dKoefY * y2) >> 0;

					var x3 = x2 - place.H * place.Ey;
					var y3 = y2 + place.H * place.Ex;
					var _x3 = (xDst + dKoefX * x3) >> 0;
					var _y3 = (yDst + dKoefY * y3) >> 0;

					var x4 = place.X - place.H * place.Ey;
					var y4 = place.Y + place.H * place.Ex;
					var _x4 = (xDst + dKoefX * x4) >> 0;
					var _y4 = (yDst + dKoefY * y4) >> 0;

					overlay.CheckPoint(_x1, _y1);
					overlay.CheckPoint(_x2, _y2);
					overlay.CheckPoint(_x3, _y3);
					overlay.CheckPoint(_x4, _y4);

					ctx.moveTo(_x1, _y1);
					ctx.lineTo(_x2, _y2);
					ctx.lineTo(_x3, _y3);
					ctx.lineTo(_x4, _y4);
					ctx.lineTo(_x1, _y1);
				}
			}
			else
			{
				var _tr = place.Transform;
				if (undefined === place.Ex)
				{
					var _x1 = xDst + dKoefX * _tr.TransformPointX(place.X, place.Y);
					var _y1 = yDst + dKoefY * _tr.TransformPointY(place.X, place.Y);

					var _x2 = xDst + dKoefX * _tr.TransformPointX(place.X + place.W, place.Y);
					var _y2 = yDst + dKoefY * _tr.TransformPointY(place.X + place.W, place.Y);

					var _x3 = xDst + dKoefX * _tr.TransformPointX(place.X + place.W, place.Y + place.H);
					var _y3 = yDst + dKoefY * _tr.TransformPointY(place.X + place.W, place.Y + place.H);

					var _x4 = xDst + dKoefX * _tr.TransformPointX(place.X, place.Y + place.H);
					var _y4 = yDst + dKoefY * _tr.TransformPointY(place.X, place.Y + place.H);

					overlay.CheckPoint(_x1, _y1);
					overlay.CheckPoint(_x2, _y2);
					overlay.CheckPoint(_x3, _y3);
					overlay.CheckPoint(_x4, _y4);

					ctx.moveTo(_x1, _y1);
					ctx.lineTo(_x2, _y2);
					ctx.lineTo(_x3, _y3);
					ctx.lineTo(_x4, _y4);
					ctx.lineTo(_x1, _y1);
				}
				else
				{
					var x2 = place.X + place.W * place.Ex;
					var y2 = place.Y + place.W * place.Ey;

					var x3 = x2 - place.H * place.Ey;
					var y3 = y2 + place.H * place.Ex;

					var x4 = place.X - place.H * place.Ey;
					var y4 = place.Y + place.H * place.Ex;

					var _x1 = xDst + dKoefX * _tr.TransformPointX(place.X, place.Y);
					var _y1 = yDst + dKoefY * _tr.TransformPointY(place.X, place.Y);

					var _x2 = xDst + dKoefX * _tr.TransformPointX(x2, y2);
					var _y2 = yDst + dKoefY * _tr.TransformPointY(x2, y2);

					var _x3 = xDst + dKoefX * _tr.TransformPointX(x3, y3);
					var _y3 = yDst + dKoefY * _tr.TransformPointY(x3, y3);

					var _x4 = xDst + dKoefX * _tr.TransformPointX(x4, y4);
					var _y4 = yDst + dKoefY * _tr.TransformPointY(x4, y4);

					overlay.CheckPoint(_x1, _y1);
					overlay.CheckPoint(_x2, _y2);
					overlay.CheckPoint(_x3, _y3);
					overlay.CheckPoint(_x4, _y4);

					ctx.moveTo(_x1, _y1);
					ctx.lineTo(_x2, _y2);
					ctx.lineTo(_x3, _y3);
					ctx.lineTo(_x4, _y4);
					ctx.lineTo(_x1, _y1);
				}
			}
		}
		return true;
	}

	this.DrawSearchCur = function (overlay, xDst, yDst, wDst, hDst, places)
	{
		var dKoefX = wDst / this.width_mm;
		var dKoefY = hDst / this.height_mm;
		var rPR = AscCommon.AscBrowser.retinaPixelRatio;

		var len = places.length;

		var ctx = overlay.m_oContext;

		ctx.fillStyle = "rgba(51,102,204,255)";

		for (var i = 0; i < len; i++)
		{
			var place = places[i];
			if (undefined === place.Ex)
			{
				var _x = (rPR * (xDst + dKoefX * place.X)) >> 0;
				var _y = (rPR * (yDst + dKoefY * place.Y)) >> 0;

				var _w = (rPR * (dKoefX * place.W)) >> 0;
				var _h = (rPR * (dKoefY * place.H)) >> 0;

				if (_x < overlay.min_x)
					overlay.min_x = _x;
				if ((_x + _w) > overlay.max_x)
					overlay.max_x = _x + _w;

				if (_y < overlay.min_y)
					overlay.min_y = _y;
				if ((_y + _h) > overlay.max_y)
					overlay.max_y = _y + _h;

				ctx.rect(_x, _y, _w, _h);
			}
			else
			{
				var _x1 = (rPR * (xDst + dKoefX * place.X)) >> 0;
				var _y1 = (rPR * (yDst + dKoefY * place.Y)) >> 0;

				var x2 = place.X + place.W * place.Ex;
				var y2 = place.Y + place.W * place.Ey;
				var _x2 = (rPR * (xDst + dKoefX * x2)) >> 0;
				var _y2 = (rPR * (yDst + dKoefY * y2)) >> 0;

				var x3 = x2 - place.H * place.Ey;
				var y3 = y2 + place.H * place.Ex;
				var _x3 = (rPR * (xDst + dKoefX * x3)) >> 0;
				var _y3 = (rPR * (yDst + dKoefY * y3)) >> 0;

				var x4 = place.X - place.H * place.Ey;
				var y4 = place.Y + place.H * place.Ex;
				var _x4 = (rPR * (xDst + dKoefX * x4)) >> 0;
				var _y4 = (rPR * (yDst + dKoefY * y4)) >> 0;

				overlay.CheckPoint(_x1, _y1);
				overlay.CheckPoint(_x2, _y2);
				overlay.CheckPoint(_x3, _y3);
				overlay.CheckPoint(_x4, _y4);

				ctx.moveTo(_x1, _y1);
				ctx.lineTo(_x2, _y2);
				ctx.lineTo(_x3, _y3);
				ctx.lineTo(_x4, _y4);
				ctx.lineTo(_x1, _y1);
			}
		}

		ctx.fill();
		ctx.beginPath();
	}

	this.DrawTableOutline = function (overlay, xDst, yDst, wDst, hDst, table_outline_dr, lastBounds)
	{
		var transform = table_outline_dr.TableMatrix;
		var rPR = AscCommon.AscBrowser.retinaPixelRatio;
		xDst *= rPR;
		yDst *= rPR;
		wDst *= rPR;
		hDst *= rPR;
		if (null == transform || transform.IsIdentity2())
		{
			var dKoefX = wDst / this.width_mm;
			var dKoefY = hDst / this.height_mm;

			var _offX = (null == transform) ? 0 : transform.tx;
			var _offY = (null == transform) ? 0 : transform.ty;

			if (!lastBounds)
			{
				var _x = 0;
				var _y = 0;
				switch (table_outline_dr.TrackTablePos)
				{
					case 1:
					{
						_x = (xDst + dKoefX * (table_outline_dr.TableOutline.X + table_outline_dr.TableOutline.W + _offX)) >> 0;
						_y = ((yDst + dKoefY * (table_outline_dr.TableOutline.Y + _offY)) >> 0) - Math.round(13 * rPR);
						break;
					}
					case 2:
					{
						_x = (xDst + dKoefX * (table_outline_dr.TableOutline.X + table_outline_dr.TableOutline.W + _offX)) >> 0;
						_y = (yDst + dKoefY * (table_outline_dr.TableOutline.Y + table_outline_dr.TableOutline.H + _offY)) >> 0;
						break;
					}
					case 3:
					{
						_x = ((xDst + dKoefX * (table_outline_dr.TableOutline.X + _offX)) >> 0) - Math.round(13 * rPR);
						_y = (yDst + dKoefY * (table_outline_dr.TableOutline.Y + table_outline_dr.TableOutline.H + _offY)) >> 0;
						break;
					}
					case 0:
					default:
					{
						_x = ((xDst + dKoefX * (table_outline_dr.TableOutline.X + _offX)) >> 0) - Math.round(13 * rPR);
						_y = ((yDst + dKoefY * (table_outline_dr.TableOutline.Y + _offY)) >> 0) - Math.round(13 * rPR);
						break;
					}
				}

				var _w = Math.round(13 * rPR);
				var _h = Math.round(13 * rPR);

				if (_x < overlay.min_x)
					overlay.min_x = _x;
				if ((_x + _w) > overlay.max_x)
					overlay.max_x = _x + _w;

				if (_y < overlay.min_y)
					overlay.min_y = _y;
				if ((_y + _h) > overlay.max_y)
					overlay.max_y = _y + _h;

				table_outline_dr.checkMover();
				overlay.m_oContext.drawImage(table_outline_dr.mover, _x, _y);
			}
			else
			{
				var _xLast = (xDst + dKoefX * (lastBounds.X + lastBounds.W + _offX) + 0.5 * Math.round(rPR)) >> 0;
				var _yLast = (yDst + dKoefY * (lastBounds.Y + lastBounds.H + _offY) + 0.5 * Math.round(rPR)) >> 0;

				var ctx = overlay.m_oContext;
				ctx.strokeStyle = "rgb(140, 140, 140)";
				ctx.lineWidth = Math.round(rPR);
				ctx.beginPath();

				overlay.AddRect(_xLast - 0.5 * Math.round(rPR), _yLast - 0.5 * Math.round(rPR), Math.round(6 * rPR), Math.round(6 * rPR));

				ctx.stroke();
				ctx.beginPath();
			}
		}
		else
		{
			var ctx = overlay.m_oContext;

			var _ft = new AscCommon.CMatrix();
			_ft.sx = transform.sx;
			_ft.shx = transform.shx;
			_ft.shy = transform.shy;
			_ft.sy = transform.sy;
			_ft.tx = transform.tx;
			_ft.ty = transform.ty;

			var coords = new AscCommon.CMatrix();
			coords.sx = wDst / this.width_mm;
			coords.sy = hDst / this.height_mm;
			coords.tx = xDst;
			coords.ty = yDst;

			global_MatrixTransformer.MultiplyAppend(_ft, coords);

			if (!lastBounds)
			{
				ctx.transform(_ft.sx, _ft.shy, _ft.shx, _ft.sy, _ft.tx, _ft.ty);

				var _x = 0;
				var _y = 0;
				var _w = 13 / coords.sx;
				var _h = 13 / coords.sy;
				switch (table_outline_dr.TrackTablePos)
				{
					case 1:
					{
						_x = (table_outline_dr.TableOutline.X + table_outline_dr.TableOutline.W);
						_y = (table_outline_dr.TableOutline.Y - _h);
						break;
					}
					case 2:
					{
						_x = (table_outline_dr.TableOutline.X + table_outline_dr.TableOutline.W);
						_y = (table_outline_dr.TableOutline.Y + table_outline_dr.TableOutline.H);
						break;
					}
					case 3:
					{
						_x = (table_outline_dr.TableOutline.X - _w);
						_y = (table_outline_dr.TableOutline.Y + table_outline_dr.TableOutline.H);
						break;
					}
					case 0:
					default:
					{
						_x = (table_outline_dr.TableOutline.X - _w);
						_y = (table_outline_dr.TableOutline.Y - _h);
						break;
					}
				}

				overlay.CheckPoint(_ft.TransformPointX(_x, _y), _ft.TransformPointY(_x, _y));
				overlay.CheckPoint(_ft.TransformPointX(_x + _w, _y), _ft.TransformPointY(_x + _w, _y));
				overlay.CheckPoint(_ft.TransformPointX(_x + _w, _y + _h), _ft.TransformPointY(_x + _w, _y + _h));
				overlay.CheckPoint(_ft.TransformPointX(_x, _y + _h), _ft.TransformPointY(_x, _y + _h));

				table_outline_dr.checkMover();
				overlay.m_oContext.drawImage(table_outline_dr.mover, _x, _y, _w, _h);

				overlay.SetBaseTransform();
			}
			else
			{
				var _xLast = (lastBounds.X + lastBounds.W);
				var _yLast = (lastBounds.Y + lastBounds.H);

				var ctx = overlay.m_oContext;
				ctx.strokeStyle = "rgb(140, 140, 140)";
				ctx.fillStyle = "#FFFFFF";
				ctx.lineWidth = 1;
				ctx.beginPath();

				var _dist = 6 / _ft.GetScaleValue();

				var _arr = [
					_ft.TransformPointX(_xLast, _yLast),
					_ft.TransformPointY(_xLast, _yLast),
					_ft.TransformPointX(_xLast + _dist, _yLast),
					_ft.TransformPointY(_xLast + _dist, _yLast),
					_ft.TransformPointX(_xLast + _dist, _yLast + _dist),
					_ft.TransformPointY(_xLast + _dist, _yLast + _dist),
					_ft.TransformPointX(_xLast, _yLast + _dist),
					_ft.TransformPointY(_xLast, _yLast + _dist)
				];

				overlay.CheckPoint(_arr[0], _arr[1]);
				overlay.CheckPoint(_arr[2], _arr[3]);
				overlay.CheckPoint(_arr[4], _arr[5]);
				overlay.CheckPoint(_arr[6], _arr[7]);

				ctx.moveTo(_arr[0], _arr[1]);
				ctx.lineTo(_arr[2], _arr[3]);
				ctx.lineTo(_arr[4], _arr[5]);
				ctx.lineTo(_arr[6], _arr[7]);
				ctx.closePath();

				ctx.fill();
				ctx.stroke();
				ctx.beginPath();
			}
		}
	}
}

function CDrawingCollaborativeTarget(DrawingDocument)
{
	AscCommon.CDrawingCollaborativeTargetBase.call(this);
	this.DrawingDocument = DrawingDocument;
	this.Page = -1;
}
CDrawingCollaborativeTarget.prototype = Object.create(AscCommon.CDrawingCollaborativeTargetBase.prototype);
CDrawingCollaborativeTarget.prototype.GetZoom = function()
{
	return this.DrawingDocument.m_oWordControl.m_nZoomValue / 100;
};
CDrawingCollaborativeTarget.prototype.ConvertCoords = function(x, y)
{
	return this.DrawingDocument.ConvertCoordsToCursor2(x, y, this.Page);
};
CDrawingCollaborativeTarget.prototype.GetMobileTouchManager = function()
{
	return this.DrawingDocument.m_oWordControl.MobileTouchManager;
};
CDrawingCollaborativeTarget.prototype.GetParentElement = function()
{
	return this.DrawingDocument.m_oWordControl.m_oMainView.HtmlElement;
};
CDrawingCollaborativeTarget.prototype.CheckPosition = function(_x, _y, _size, _page, _transform)
{
	this.Transform = _transform;
	this.Size = _size;
	this.X = _x;
	this.Y = _y;
	this.Page = _page;
	this.Update();
};

function CDrawingDocument()
{
	this.IsLockObjectsEnable = false;

	AscCommon.g_oHtmlCursor.register("de-markerformat", "marker_format", "14 8", "pointer");
	AscCommon.g_oHtmlCursor.register("select-table-row", "select_row", "10 5", "default");
	AscCommon.g_oHtmlCursor.register("select-table-column", "select_column", "5 10", "default");
	AscCommon.g_oHtmlCursor.register("select-table-cell", "select_cell", "9 0", "default");
    AscCommon.g_oHtmlCursor.register("de-tablepen", "pen", "1 16", "pointer");
    AscCommon.g_oHtmlCursor.register("de-tableeraser", "eraser", "8 19", "pointer");

	this.m_oWordControl = null;
	this.m_oLogicDocument = null;
	this.m_oDocumentRenderer = null;

	this.m_arrPages = [];
	this.m_lPagesCount = 0;

	this.m_lDrawingFirst = -1;
	this.m_lDrawingEnd = -1;
	this.m_lCurrentPage = -1;

	this.FrameRect = {
		IsActive: false, Rect: {X: 0, Y: 0, R: 0, B: 0}, Frame: null,
		Track: {X: 0, Y: 0, L: 0, T: 0, R: 0, B: 0, PageIndex: 0, Type: -1}, IsTracked: false, PageIndex: 0
	};

	this.MathTrack = new AscCommon.CMathTrack();

	this.FieldTrack = {IsActive: false, Rects: []};

	this.m_oCacheManager = new CCacheManager();

	this.m_lCountCalculatePages = 0;

	this.m_bIsDocumentCalculating = true;
	this.m_arPrintingWaitEndRecalculate = null;

	this.m_lTimerTargetId = -1;
	this.m_dTargetX = -1;
	this.m_dTargetY = -1;
	this.m_lTargetPage = -1;
	this.m_dTargetSize = 1;

	this.NeedScrollToTargetFlag = false;

	this.TargetHtmlElement = null;
	this.TargetHtmlElementBlock = false; // true - block, false - visibility
	this.TargetHtmlElementLeft = 0;
	this.TargetHtmlElementTop = 0;

	this.CollaborativeTargets = [];
	this.CollaborativeTargetsUpdateTasks = [];

	this.m_bIsBreakRecalculate = false;

	this.m_bIsSelection = false;
	this.m_bIsSearching = false;
	this.m_lCountRect = 0;

	this.CurrentSearchNavi = null;
	this.SearchTransform = null;

	this.m_lTimerUpdateTargetID = -1;
	this.m_tempX = 0;
	this.m_tempY = 0;
	this.m_tempPageIndex = 0;

	var oThis = this;
	this.m_sLockedCursorType = "";
	this.TableOutlineDr = new CTableOutlineDr();

	this.m_lCurrentRendererPage = -1;
	this.m_oDocRenderer = null;
	this.m_bOldShowMarks = false;

	this.UpdateTargetFromPaint = false;
	this.UpdateTargetCheck = false;
	this.NeedTarget = true;
	this.TextMatrix = null;
	this.TargetShowFlag = false;
	this.TargetShowNeedFlag = false;

	this.SelectionMatrix = null;

	this.CanvasHit = document.createElement('canvas');
	this.CanvasHit.width = 10;
	this.CanvasHit.height = 10;
	this.CanvasHitContext = this.CanvasHit.getContext('2d');

	this.TargetCursorColor = {R: 0, G: 0, B: 0};

	this.GuiControlColorsMap = null;
	this.IsSendStandartColors = false;

	this.GuiCanvasFillTextureParentId = "";
	this.GuiCanvasFillTexture = null;
	this.GuiCanvasFillTextureCtx = null;
	this.LastDrawingUrl = "";

	this.GuiCanvasTextProps = null;
	this.GuiLastTextProps = null;

	this.GuiCanvasFillTOCParentId = "";
	this.GuiCanvasFillTOC = null;

	this.GuiCanvasFillTOFParentId = "";
	this.GuiCanvasFillTOF = null;

	this.TableStylesLastLook = null;
	this.TableStylesLastClrScheme = null;
	this.LastParagraphMargins = null;

	this.TableStylesCheckLook = null;
	this.TableStylesCheckLookFlag = false;

	this.InlineTextTrackEnabled = false;
	this.InlineTextTrack = null;
	this.InlineTextTrackPage = -1;

	this.AutoShapesTrack = null;
	this.AutoShapesTrackLockPageNum = -1;

	this.Overlay = null;
	this.IsTextMatrixUse = false;
	this.IsTextSelectionOutline = false;

	this.OverlaySelection2 = {};

	this.HorVerAnchors = [];

	this.MathMenuLoad = false;

	this.UpdateRulerStateFlag = false;
	this.UpdateRulerStateParams = [];

	// массивы ректов для поиска
	this._search_HdrFtr_All = []; // Поиск в колонтитуле, который находится на всех страницах
	this._search_HdrFtr_All_no_First = []; // Поиск в колонтитуле, который находится на всех страницах, кроме первой
	this._search_HdrFtr_First = []; // Поиск в колонтитуле, который находится только на первой странице
	this._search_HdrFtr_Even = []; // Поиск в колонтитуле, который находится только на нечетных страницах
	this._search_HdrFtr_Odd = []; // Поиск в колонтитуле, который находится только на четных страницах, включая первую
	this._search_HdrFtr_Odd_no_First = []; // Поиск в колонтитуле, который находится только на нечетных страницах, кроме первой

	this.isFirstStartRecalculate = false; // был ли хоть раз вызван OnStartRecalculate
	this.isDisableEditBeforeCalculateLA = false; // залочили все, пока не досчитаем до конца
	this.isFirstRecalculate = false; // был ли хоть раз вызван OnEndRecalculate
	this.isFirstFullRecalculate = false; // был ли хоть раз вызван OnEndRecalculate c параметром isFull == true
    this.isScrollToTargetAttack = false;

    this.printedDocument = null; // selection print

	// content_controls
	this.contentControls = new AscCommon.DrawingContentControls(this);

	// placeholders
	this.placeholders = new AscCommon.DrawingPlaceholders(this);

	this.showTarget = function (isShow)
	{
		if (this.TargetHtmlElementBlock)
			this.TargetHtmlElement.style.display = isShow ? "display" : "none";
		else
			this.TargetHtmlElement.style.visibility = isShow ? "visible" : "hidden";
	};
	this.isShowTarget = function ()
	{
		if (this.TargetHtmlElementBlock)
			return (this.TargetHtmlElement.style.display == "display") ? true : false;
		else
			return (this.TargetHtmlElement.style.visibility == "visible") ? true : false;
	};

	this.Start_CollaborationEditing = function ()
	{
		this.IsLockObjectsEnable = true;
		this.m_oWordControl.OnRePaintAttack();
	};
	this.SetCursorType = function (sType, Data)
	{
		if ("" == this.m_sLockedCursorType)
		{
            if ("text" == sType)
            {
                if (AscCommon.c_oAscFormatPainterState.kOff !== this.m_oWordControl.m_oApi.isPaintFormat)
                    this.m_oWordControl.m_oMainContent.HtmlElement.style.cursor = AscCommon.g_oHtmlCursor.value(AscCommon.kCurFormatPainterWord);
                else if (this.m_oWordControl.m_oApi.isMarkerFormat)
                    this.m_oWordControl.m_oMainContent.HtmlElement.style.cursor = AscCommon.g_oHtmlCursor.value("de-markerformat");
                else if (this.m_oWordControl.m_oApi.isDrawTablePen)
                    this.m_oWordControl.m_oMainContent.HtmlElement.style.cursor = AscCommon.g_oHtmlCursor.value("de-tablepen");
                else if (this.m_oWordControl.m_oApi.isDrawTableErase)
                    this.m_oWordControl.m_oMainContent.HtmlElement.style.cursor = AscCommon.g_oHtmlCursor.value("de-tableeraser");
                else
                    this.m_oWordControl.m_oMainContent.HtmlElement.style.cursor = AscCommon.g_oHtmlCursor.value(sType);
            }
            else
                this.m_oWordControl.m_oMainContent.HtmlElement.style.cursor = AscCommon.g_oHtmlCursor.value(sType);
		}
		else
			this.m_oWordControl.m_oMainContent.HtmlElement.style.cursor = AscCommon.g_oHtmlCursor.value(this.m_sLockedCursorType);

		if ("undefined" === typeof(Data) || null === Data)
			Data = new AscCommon.CMouseMoveData();

		editor.sync_MouseMoveCallback(Data);
	};
	this.LockCursorType = function (sType)
	{
		this.m_sLockedCursorType = sType;
		this.m_oWordControl.m_oMainContent.HtmlElement.style.cursor = AscCommon.g_oHtmlCursor.value(this.m_sLockedCursorType);
	};
	this.LockCursorTypeCur = function ()
	{
		this.m_sLockedCursorType = this.m_oWordControl.m_oMainContent.HtmlElement.style.cursor;
	};
	this.UnlockCursorType = function ()
	{
		this.m_sLockedCursorType = "";
	};

	this.scrollToTargetOnRecalculate = function(pageCountOld, pageCountNew)
    {
        if (this.m_lTargetPage > pageCountOld && this.m_lTargetPage < pageCountNew)
        {
            this.isScrollToTargetAttack = true;
            this.UpdateTarget(this.m_dTargetX, this.m_dTargetY, this.m_lTargetPage);
        }
    };

	this.OnStartRecalculate = function (pageCount)
	{
		if (!this.m_oWordControl.MobileTouchManager)
			this.TableOutlineDr.TableOutline = null;

		if (this.m_oWordControl)
			this.m_oWordControl.m_oApi.checkLastWork();

		this.m_lCountCalculatePages = pageCount;
		//console.log("start " + this.m_lCountCalculatePages);

		if (this.m_oWordControl && this.m_oWordControl.MobileTouchManager)
			this.m_oWordControl.MobileTouchManager.ClearContextMenu();

		this.m_bIsDocumentCalculating = true;

		if (!this.isFirstStartRecalculate)
		{
            var api = this.m_oWordControl.m_oApi;
            var options = api.DocInfo ? api.DocInfo.asc_getOptions() : null;

            if (options && options["disableEditBeforeCalculate"])
            {
            	this.isDisableEditBeforeCalculateLA = true;
                api.sync_StartAction(Asc.c_oAscAsyncActionType.BlockInteraction, Asc.c_oAscAsyncAction.Waiting);
            }

            this.isFirstStartRecalculate = true;
		}
	};

	this.OnRepaintPage = function (index)
	{
		if (this.m_oWordControl)
			this.m_oWordControl.m_oApi.checkLastWork();

		var page = this.m_arrPages[index];
		if (!page)
			return;

		page.drawingPage.SetRepaint(this.m_oCacheManager);

		// перерисовать, если только страница видна на экране
		if (index >= this.m_lDrawingFirst && index <= this.m_lDrawingEnd)
		{
			this.m_oWordControl.OnScroll();
		}
	};

	this.OnRecalculatePage = function (index, pageObject)
	{
		this.m_bIsDocumentCalculating = true;

		editor.sendEvent("asc_onDocumentChanged");
		if (true === this.m_bIsSearching)
		{
			this.SearchClear();
			this.m_oWordControl.OnUpdateOverlay();
		}

		if (this.m_bIsBreakRecalculate)
		{
			this.m_bIsBreakRecalculate = false;
			this.m_lCountCalculatePages = index;
		}

		this.m_lCountCalculatePages = index + 1;
		//console.log("calc " + this.m_lCountCalculatePages);

		/*
		 if (index >= this.m_lPagesCount)
		 {
		 this.m_arrPages[index] = new CPage();
		 }
		 */
		if (undefined === this.m_arrPages[index])
			this.m_arrPages[index] = new CPage();

		var page = this.m_arrPages[index];

		page.width_mm = pageObject.Width;
		page.height_mm = pageObject.Height;

		page.margin_left = pageObject.Margins.Left;
		page.margin_top = pageObject.Margins.Top;
		page.margin_right = pageObject.Margins.Right;
		page.margin_bottom = pageObject.Margins.Bottom;

		page.index = index;

		page.drawingPage.SetRepaint(this.m_oCacheManager);

		// теперь если эта страница на экране - то нужно вызвать отрисовку
		if (index >= this.m_lDrawingFirst && index <= this.m_lDrawingEnd)
		{
			this.m_oWordControl.OnScroll();
		}

		if (this.m_lCountCalculatePages > (this.m_lPagesCount + 50) || (0 == this.m_lPagesCount && 0 != this.m_lCountCalculatePages))
		{
			this.OnEndRecalculate(false);
		}
	};

	this.OnEndRecalculate = function (isFull, isBreak)
	{
		if (this.m_oWordControl)
			this.m_oWordControl.m_oApi.checkLastWork();

		if (undefined != isBreak)
		{
			this.m_lCountCalculatePages = this.m_lPagesCount;
		}

		for (var index = this.m_lCountCalculatePages; index < this.m_lPagesCount; index++)
		{
			var page = this.m_arrPages[index];
			page.drawingPage.SetRepaint(this.m_oCacheManager);
		}

		this.m_bIsBreakRecalculate = (isFull === true) ? false : true;
		var oldPagesCount = this.m_lPagesCount;
		if (isFull)
		{
			if (this.m_lPagesCount > this.m_lCountCalculatePages)
			{
				this.m_arrPages.splice(this.m_lCountCalculatePages, this.m_lPagesCount - this.m_lCountCalculatePages);
			}

			this.m_lPagesCount = this.m_lCountCalculatePages;
			this.m_oWordControl.CalculateDocumentSize();
			/*
			 if (true === this.m_bIsUpdateDocSize)
			 {
			 this.m_oWordControl.OnScroll();
			 this.m_oWordControl.OnUpdateSelection();
			 }
			 */
		}
		else if ((this.m_lPagesCount + 50) < this.m_lCountCalculatePages)
		{
			this.m_lPagesCount = this.m_lCountCalculatePages;
			this.m_oWordControl.CalculateDocumentSize();
		}
		else if (0 == this.m_lPagesCount && 0 != this.m_lCountCalculatePages)
		{
			this.m_lPagesCount = this.m_lCountCalculatePages;
			this.m_oWordControl.CalculateDocumentSize();
		}

		//if (this.m_lCurrentPage >= this.m_lPagesCount)
		//    this.m_lCurrentPage = this.m_lPagesCount - 1;
		if (true === isBreak || isFull)
		{
			//this.m_oWordControl.m_oLogicDocument.RecalculateCurPos();
			this.m_lCurrentPage = this.m_oWordControl.m_oLogicDocument.Get_CurPage();
			this.m_oWordControl.m_oApi.sendEvent("asc_onEndCalculate");
			this.m_bIsDocumentCalculating = false;

			window.setTimeout(function() {
                editor.WordControl.onMouseMove(undefined, undefined);
            }, 1);
		}

		if (-1 != this.m_lCurrentPage)
		{
			this.m_oWordControl.m_oApi.sync_currentPageCallback(this.m_lCurrentPage);
			this.m_oWordControl.m_oApi.sync_countPagesCallback(this.m_lPagesCount);

			var bIsSendCurPage = true;
			if (this.m_oWordControl.m_oLogicDocument && this.m_oWordControl.m_oLogicDocument.DrawingObjects)
			{
				var param = this.m_oWordControl.m_oLogicDocument.DrawingObjects.isNeedUpdateRulers();
				if (true === param)
				{
					bIsSendCurPage = false;
					this.m_oWordControl.SetCurrentPage(false);
				}
			}

			if (bIsSendCurPage && this.FrameRect.IsActive)
			{
				bIsSendCurPage = false;
				this.m_oWordControl.SetCurrentPage(false);
			}

			if (bIsSendCurPage)
			{
				this.m_oWordControl.SetCurrentPage(false);
			}
		}

		if (!this.isFirstRecalculate)
        {
            this.scrollToTargetOnRecalculate(oldPagesCount, this.m_lPagesCount);
        }

		if (isFull)
		{
			this.m_oWordControl.OnScroll();

			if (this.m_arPrintingWaitEndRecalculate)
				this.m_oWordControl.m_oApi.downloadAs.apply(this.m_oWordControl.m_oApi, this.m_arPrintingWaitEndRecalculate);
		}

        if (isFull || isBreak)
        {
        	if (isFull)
			{
				if (!this.isFirstFullRecalculate)
				{
                    var api = this.m_oWordControl.m_oApi;
                    var options = api.DocInfo && api.DocInfo.asc_getOptions();

					if (!this.isFirstRecalculate)
					{
						// полный пересчет закончился, и не был пересчет документа.
						api.goTo();
					}

					if (options && options["disableEditBeforeCalculate"])
					{
                        api.sync_EndAction(Asc.c_oAscAsyncActionType.BlockInteraction, Asc.c_oAscAsyncAction.Waiting);
                        this.isDisableEditBeforeCalculateLA = false;
                    }
				}

				this.isFirstFullRecalculate = true;
			}
			else if (isBreak)
			{
                this.isFirstRecalculate = true;
			}
        }

		//console.log("end " + this.m_lCountCalculatePages + "," + isFull + "," + isBreak);
	};

	this.ChangePageAttack = function (pageIndex)
	{
		if (pageIndex < this.m_lDrawingFirst || pageIndex > this.m_lDrawingEnd)
			return;

		this.StopRenderingPage(pageIndex);
		this.m_oWordControl.OnScroll();
	};

	this.CheckPagesSizeMaximum = function(_w, _h)
	{
		var w = _w;
		var h = _h;

		// заглушка под мобильную версию (iPad не рисует большие картинки (наверное страховка по памяти))
		if (g_bIsMobile)
		{
			var _mobile_max = 2500;
			if (w > _mobile_max || h > _mobile_max)
			{
				if (w > h)
				{
					h = (h * _mobile_max / w) >> 0;
					w = _mobile_max;
				}
				else
				{
					w = (w * _mobile_max / h) >> 0;
					h = _mobile_max;
				}
			}
		}

		return [w, h];
	};

	this.CheckRecalculatePage = function (width, height, pageIndex)
	{
		var _drawingPage = this.m_arrPages[pageIndex].drawingPage;
		var isUnlock = false;

		if (_drawingPage.cachedImage != null && _drawingPage.cachedImage.image != null)
		{
			var _check = this.CheckPagesSizeMaximum(width, height);
			if (_check[0] != _drawingPage.cachedImage.image.width || _check[1] != _drawingPage.cachedImage.image.height)
				isUnlock = true;
		}

		if (_drawingPage.IsRecalculate)
		{
			if (this.IsFreezePage(pageIndex))
			{
				// убрал выкидывание страницы. лишнее это. пусть всегда рисуется старая, пока не перерисуем
				//if ((Math.abs(_drawingPage.RecalculateTime - (new Date().getTime())) > 500 /*0.5 sec*/))
				//	isUnlock = true;
			}
			else
			{
				isUnlock = true;
			}
		}

		if (isUnlock)
			_drawingPage.UnLock(this.m_oCacheManager);
	};

	this.StartRenderingPage = function (pageIndex)
	{
		if (true === this.IsFreezePage(pageIndex))
		{
			return;
		}

		var page = this.m_arrPages[pageIndex];

		var dKoef = (this.m_oWordControl.m_nZoomValue * g_dKoef_mm_to_pix / 100);

		var w = (page.width_mm * dKoef + 0.5) >> 0;
		var h = (page.height_mm * dKoef + 0.5) >> 0;

		w = AscCommon.AscBrowser.convertToRetinaValue(w, true);
		h = AscCommon.AscBrowser.convertToRetinaValue(h, true);

		var _check = this.CheckPagesSizeMaximum(w, h);
		w = _check[0];
		h = _check[1];

		page.drawingPage.UnLock(this.m_oCacheManager);
		page.drawingPage.cachedImage = this.m_oCacheManager.Lock(w, h, this);

		//var StartTime = new Date().getTime();

		// теперь берем графикс
		var g = new AscCommon.CGraphics();
		g.init(page.drawingPage.cachedImage.image.ctx, w, h, page.width_mm, page.height_mm);
		g.m_oFontManager = AscCommon.g_fontManager;
		g.endGlobalAlphaColor = this.m_oWordControl.m_oApi.getPageBackgroundColor();

		g.transform(1, 0, 0, 1, 0, 0);

		if (this.m_oWordControl.m_oApi.isDarkMode)
            g.darkModeOverride3();

		if (null == this.m_oDocumentRenderer)
			this.m_oLogicDocument.DrawPage(pageIndex, g);
		else
			this.m_oDocumentRenderer.drawPage(pageIndex, g);

		if (g_page_outline_inner)
		{
			var context = page.drawingPage.cachedImage.image.ctx;

			context.strokeStyle = GlobalSkin.PageOutline;
			context.lineWidth = 1;

			context.beginPath();
			context.moveTo(0.5, 0.5);
			context.lineTo(w - 0.5, 0.5);
			context.lineTo(w - 0.5, h - 0.5);
			context.lineTo(0.5, h - 0.5);
			context.closePath();
			context.stroke();
			context.beginPath();
		}

		if (this.m_oWordControl.m_oApi.watermarkDraw && this.m_oWordControl.m_oLogicDocument)
			this.m_oWordControl.m_oApi.watermarkDraw.Draw(page.drawingPage.cachedImage.image.ctx, w, h);

		//var EndTime = new Date().getTime();

		//alert("" + ((EndTime - StartTime) / 1000));
	};

	this.IsFreezePage = function (pageIndex)
	{
		if (pageIndex >= 0 && (pageIndex < Math.min(this.m_lCountCalculatePages, this.m_lPagesCount)))
		{
			if (this.m_oLogicDocument)
			{
				if (pageIndex >= this.m_oLogicDocument.Pages.length)
					return true;
				else if (!this.m_oLogicDocument.CanDrawPage(pageIndex))
					return true;
			}
			return false;
		}
		return true;
	};

	this.RenderDocument = function (Renderer)
	{
	    var _this = this.printedDocument ? this.printedDocument.DrawingDocument : this;
	    for (var i = 0; i < _this.m_lPagesCount; i++)
		{
			var page = _this.m_arrPages[i];
			Renderer.BeginPage(page.width_mm, page.height_mm);
            _this.m_oLogicDocument.DrawPage(i, Renderer);
			Renderer.EndPage();
		}
	};

	this.ToRenderer = function (isPrint)
	{
		var Renderer = new AscCommon.CDocumentRenderer();
		Renderer.isPrintMode = isPrint ? true : false;
		Renderer.InitPicker(AscCommon.g_oTextMeasurer.m_oManager);
		Renderer.VectorMemoryForPrint = new AscCommon.CMemory();
		var old_marks = this.m_oWordControl.m_oApi.ShowParaMarks;
		this.m_oWordControl.m_oApi.ShowParaMarks = false;
		this.RenderDocument(Renderer);
		this.m_oWordControl.m_oApi.ShowParaMarks = old_marks;
		this.printedDocument = null;
		var ret = Renderer.Memory.GetBase64Memory();
		//console.log(ret);
		return ret;
	};

	this.CheckPrint = function(params)
	{
		if (!this.m_oWordControl.m_oLogicDocument)
			return false;

		if (this.m_arPrintingWaitEndRecalculate)
		{
			this.m_oWordControl.m_oApi.sync_EndAction(Asc.c_oAscAsyncActionType.BlockInteraction, params[0]);
			this.m_arPrintingWaitEndRecalculate = null;
			return false;
		}

		if (!this.m_bIsDocumentCalculating)
			return false;

		this.m_arPrintingWaitEndRecalculate = params;
		this.m_oWordControl.m_oApi.sync_StartAction(Asc.c_oAscAsyncActionType.BlockInteraction, params[0]);
		return true;
	};

	this.ToRenderer2 = function (document)
	{
        var _this = this.printedDocument ? this.printedDocument.DrawingDocument : this;
		var Renderer = new AscCommon.CDocumentRenderer();
        Renderer.InitPicker(AscCommon.g_oTextMeasurer.m_oManager);

		var old_marks = this.m_oWordControl.m_oApi.ShowParaMarks;
		this.m_oWordControl.m_oApi.ShowParaMarks = false;

		var ret = "";
		for (var i = 0; i < _this.m_lPagesCount; i++)
		{
			var page = _this.m_arrPages[i];
			Renderer.BeginPage(page.width_mm, page.height_mm);
            _this.m_oLogicDocument.DrawPage(i, Renderer);
			Renderer.EndPage();

			ret += Renderer.Memory.GetBase64Memory();
			Renderer.Memory.Seek(0);
		}

		this.m_oWordControl.m_oApi.ShowParaMarks = old_marks;
        this.printedDocument = null;
		//console.log(ret);
		return ret;
	};
	this.ToRendererPart = function (noBase64, isPrint)
	{
        var _this = this.printedDocument ? this.printedDocument.DrawingDocument : this;

		var watermark = this.m_oWordControl.m_oApi.watermarkDraw;

		var pagescount = Math.min(_this.m_lPagesCount, _this.m_lCountCalculatePages);

		if (-1 == this.m_lCurrentRendererPage)
		{
			if (watermark)
				watermark.StartRenderer();

			this.m_oDocRenderer = new AscCommon.CDocumentRenderer();
            this.m_oDocRenderer.InitPicker(AscCommon.g_oTextMeasurer.m_oManager);
			this.m_oDocRenderer.VectorMemoryForPrint = new AscCommon.CMemory();
			this.m_oDocRenderer.isPrintMode = isPrint ? true : false;
			this.m_lCurrentRendererPage = 0;
			this.m_bOldShowMarks = this.m_oWordControl.m_oApi.ShowParaMarks;
			this.m_oWordControl.m_oApi.ShowParaMarks = false;
		}

		var start = this.m_lCurrentRendererPage;
		var end = pagescount - 1;

		var renderer = this.m_oDocRenderer;
		renderer.Memory.Seek(0);
		renderer.VectorMemoryForPrint.ClearNoAttack();

		for (var i = start; i <= end; i++)
		{
			var page = _this.m_arrPages[i];
			renderer.BeginPage(page.width_mm, page.height_mm);
            _this.m_oLogicDocument.DrawPage(i, renderer);

			if (watermark)
				watermark.DrawOnRenderer(renderer, page.width_mm, page.height_mm);

			renderer.EndPage();
		}

		this.m_lCurrentRendererPage = end + 1;

		if (this.m_lCurrentRendererPage >= pagescount)
		{
			if (watermark)
				watermark.EndRenderer();

			this.m_lCurrentRendererPage = -1;
			this.m_oDocRenderer = null;
			this.m_oWordControl.m_oApi.ShowParaMarks = this.m_bOldShowMarks;
            this.printedDocument = null;
		}

		if (noBase64) {
			return renderer.Memory.GetData();
		} else {
			return renderer.Memory.GetBase64Memory();
		}
	};

	this.StopRenderingPage = function (pageIndex)
	{
		if (null != this.m_oDocumentRenderer)
			this.m_oDocumentRenderer.stopRenderingPage(pageIndex);

		this.m_arrPages[pageIndex].drawingPage.UnLock(this.m_oCacheManager);
	};

	this.ClearCachePages = function ()
	{
		for (var i = 0; i < this.m_lPagesCount; i++)
		{
			var page = this.m_arrPages[i];
			if (page)
				page.drawingPage.SetRepaint(this.m_oCacheManager);
		}
	};

	this.CloseFile = function ()
	{
		this.ClearCachePages();
		this.m_arrPages.splice(0, this.m_arrPages.length);
		this.m_lPagesCount = 0;

		this.m_lDrawingFirst = -1;
		this.m_lDrawingEnd = -1;
		this.m_lCurrentPage = -1;
	};

	this.CheckRasterImageOnScreen = function (src)
	{
		if (null == this.m_oWordControl.m_oLogicDocument)
			return;

		if (this.m_lDrawingFirst == -1 || this.m_lDrawingEnd == -1)
			return;

		var bIsRaster = false;
		var _checker = this.m_oWordControl.m_oLogicDocument.DrawingObjects;
		for (var i = this.m_lDrawingFirst; i <= this.m_lDrawingEnd; i++)
		{
			var _imgs = _checker.getAllRasterImagesOnPage(i);

			var _len = _imgs.length;
			for (var j = 0; j < _len; j++)
			{
				if (AscCommon.getFullImageSrc2(_imgs[j]) == src)
				{
					this.StopRenderingPage(i);
					bIsRaster = true;
					break;
				}
			}
		}

		if (bIsRaster)
			this.m_oWordControl.OnScroll();
	};

	this.FirePaint = function ()
	{
		this.m_oWordControl.OnScroll();
	};

	this.ConvertCoordsFromCursor = function (x, y, bIsRul)
	{
		var _x = x;
		var _y = y;

		var dKoef = (100 * g_dKoef_pix_to_mm / this.m_oWordControl.m_nZoomValue);

		if (undefined == bIsRul)
		{
			var _xOffset = this.m_oWordControl.X;
			var _yOffset = this.m_oWordControl.Y;

			/*
			 if (true == this.m_oWordControl.m_bIsRuler)
			 {
			 _xOffset += (5 * g_dKoef_mm_to_pix);
			 _yOffset += (7 * g_dKoef_mm_to_pix);
			 }
			 */

			_x = x - _xOffset;
			_y = y - _yOffset;
		}

		for (var i = this.m_lDrawingFirst; i <= this.m_lDrawingEnd; i++)
		{
			var rect = this.m_arrPages[i].drawingPage;

			if ((rect.left <= _x) && (_x <= rect.right) && (rect.top <= _y) && (_y <= rect.bottom))
			{
				var x_mm = (_x - rect.left) * dKoef;
				var y_mm = (_y - rect.top) * dKoef;

				return {X: x_mm, Y: y_mm, Page: rect.pageIndex, DrawPage: i};
			}
		}

		return {X: 0, Y: 0, Page: -1, DrawPage: -1};
	};

	this.ConvertCoordsFromCursorPage = function (x, y, page, bIsRul)
	{
		var _x = x;
		var _y = y;

		var dKoef = (100 * g_dKoef_pix_to_mm / this.m_oWordControl.m_nZoomValue);

		if (undefined == bIsRul)
		{
			var _xOffset = this.m_oWordControl.X;
			var _yOffset = this.m_oWordControl.Y;

			/*
			 if (true == this.m_oWordControl.m_bIsRuler)
			 {
			 _xOffset += (5 * g_dKoef_mm_to_pix);
			 _yOffset += (7 * g_dKoef_mm_to_pix);
			 }
			 */

			_x = x - _xOffset;
			_y = y - _yOffset;
		}

		if (page < 0 || page >= this.m_lPagesCount)
			return {X: 0, Y: 0, Page: -1, DrawPage: -1};

		var rect = this.m_arrPages[page].drawingPage;
		var x_mm = (_x - rect.left) * dKoef;
		var y_mm = (_y - rect.top) * dKoef;

		return {X: x_mm, Y: y_mm, Page: rect.pageIndex, DrawPage: page};
	};

	this.ConvertCoordsToAnotherPage = function (x, y, pageCoord, pageNeed)
	{
		if (pageCoord < 0 || pageCoord >= this.m_lPagesCount || pageNeed < 0 || pageNeed >= this.m_lPagesCount)
			return {X: 0, Y: 0, Error: true};

		var dKoef1 = this.m_oWordControl.m_nZoomValue * g_dKoef_mm_to_pix / 100;
		var dKoef2 = 100 * g_dKoef_pix_to_mm / this.m_oWordControl.m_nZoomValue;

		var page1 = this.m_arrPages[pageCoord].drawingPage;
		var page2 = this.m_arrPages[pageNeed].drawingPage;

		var xCursor = page1.left + x * dKoef1;
		var yCursor = page1.top + y * dKoef1;

		var _x = (xCursor - page2.left) * dKoef2;
		var _y = (yCursor - page2.top) * dKoef2;

		return {X: _x, Y: _y, Error: false};
	};

	this.ConvertCoordsFromCursor2 = function (x, y, bIsRul, bIsNoNormalize, _zoomVal)
	{
		var _x = x;
		var _y = y;

		var dKoef = (100 * g_dKoef_pix_to_mm / this.m_oWordControl.m_nZoomValue);
		if (undefined !== _zoomVal)
			dKoef = (100 * g_dKoef_pix_to_mm / _zoomVal);

		if (undefined == bIsRul)
		{
			var _xOffset = this.m_oWordControl.X;
			var _yOffset = this.m_oWordControl.Y;

			if (true == this.m_oWordControl.m_bIsRuler)
			{
				_xOffset += (5 * g_dKoef_mm_to_pix);
				_yOffset += (7 * g_dKoef_mm_to_pix);
			}

			_x = x - _xOffset;
			_y = y - _yOffset;
		}

		if (-1 == this.m_lDrawingFirst || -1 == this.m_lDrawingEnd)
			return {X: 0, Y: 0, Page: -1, DrawPage: -1};

		for (var i = this.m_lDrawingFirst; i <= this.m_lDrawingEnd; i++)
		{
			var rect = this.m_arrPages[i].drawingPage;

			if ((rect.left <= _x) && (_x <= rect.right) && (rect.top <= _y) && (_y <= rect.bottom))
			{
				var x_mm = (_x - rect.left) * dKoef;
				var y_mm = (_y - rect.top) * dKoef;

				if (x_mm > (this.m_arrPages[i].width_mm + 10))
					x_mm = this.m_arrPages[i].width_mm + 10;
				if (x_mm < -10)
					x_mm = -10;

				return {X: x_mm, Y: y_mm, Page: rect.pageIndex, DrawPage: i};
			}
		}

		// в страницу не попали. вторая попытка - это попробовать найти страницу по вертикали
		var _start = Math.max(this.m_lDrawingFirst - 1, 0);
		var _end = Math.min(this.m_lDrawingEnd + 1, this.m_lPagesCount - 1);
		for (var i = _start; i <= _end; i++)
		{
			var rect = this.m_arrPages[i].drawingPage;

			var bIsCurrent = false;
			if (i == this.m_lDrawingFirst && rect.top > _y)
			{
				bIsCurrent = true;
			}
			else if ((rect.top <= _y) && (_y <= rect.bottom))
			{
				bIsCurrent = true;
			}
			else if (i != this.m_lPagesCount - 1)
			{
				if (_y > rect.bottom && _y < this.m_arrPages[i + 1].drawingPage.top)
					bIsCurrent = true;
			}
			else if (_y < rect.top)
			{
				// либо вышли раньше, либо это самая первая видимая страница
				bIsCurrent = true;
			}
			else if (i == this.m_lDrawingEnd)
			{
				if (_y > rect.bottom)
					bIsCurrent = true;
			}

			if (bIsCurrent)
			{
				var x_mm = (_x - rect.left) * dKoef;
				var y_mm = (_y - rect.top) * dKoef;

				if (true === bIsNoNormalize)
				{
					if (x_mm > (this.m_arrPages[i].width_mm + 10))
						x_mm = this.m_arrPages[i].width_mm + 10;
					if (x_mm < -10)
						x_mm = -10;
				}

				return {X: x_mm, Y: y_mm, Page: rect.pageIndex, DrawPage: i};
			}
		}

		return {X: 0, Y: 0, Page: -1, DrawPage: -1};
	};

	this.ConvetToPageCoords = function (x, y, pageIndex)
	{
		if (pageIndex < 0 || pageIndex >= this.m_lPagesCount)
		{
			return {X: 0, Y: 0, Page: pageIndex, Error: true};
		}
		var dKoef = (100 * g_dKoef_pix_to_mm / this.m_oWordControl.m_nZoomValue);
		var rect = this.m_arrPages[pageIndex].drawingPage;

		var _x = (x - rect.left) * dKoef;
		var _y = (y - rect.top) * dKoef;

		return {X: _x, Y: _y, Page: pageIndex, Error: false};
	};

	this.IsCursorInTableCur = function (x, y, page)
	{
		var _table = this.TableOutlineDr.TableOutline;
		if (_table == null)
			return false;

		if (page != _table.PageNum)
			return false;

		var _dist = this.TableOutlineDr.mover_size * g_dKoef_pix_to_mm;
		_dist *= (100 / this.m_oWordControl.m_nZoomValue);

		var _x = _table.X;
		var _y = _table.Y;
		var _r = _x + _table.W;
		var _b = _y + _table.H;

		if ((x > (_x - _dist)) && (x < _r) && (y > (_y - _dist)) && (y < _b))
		{
			if ((x < _x) || (y < _y))
			{
				this.TableOutlineDr.Counter = 0;
				this.TableOutlineDr.bIsNoTable = false;
				return true;
			}
		}
		return false;
	};

	this.ConvertCoordsToCursorWR = function (x, y, pageIndex, transform, id_ruler_no_use)
	{
		var dKoef = (this.m_oWordControl.m_nZoomValue * g_dKoef_mm_to_pix / 100);

		var _x = 0;
		var _y = 0;
		if (true == this.m_oWordControl.m_bIsRuler && (id_ruler_no_use !== false))
		{
			_x = 5 * g_dKoef_mm_to_pix;
			_y = 7 * g_dKoef_mm_to_pix;
		}

		// теперь крутить всякие циклы нет смысла
		if (pageIndex < 0 || pageIndex >= this.m_lPagesCount)
		{
			return {X: 0, Y: 0, Error: true};
		}

		var __x = x;
		var __y = y;
		if (transform)
		{
			__x = transform.TransformPointX(x, y);
			__y = transform.TransformPointY(x, y);
		}

		var x_pix = (this.m_arrPages[pageIndex].drawingPage.left + __x * dKoef + _x) >> 0;
		var y_pix = (this.m_arrPages[pageIndex].drawingPage.top + __y * dKoef + _y) >> 0;

		return {X: x_pix, Y: y_pix, Error: false};
	};

	this.ConvertCoordsToCursor = function (x, y, pageIndex, bIsRul)
	{
		var dKoef = (this.m_oWordControl.m_nZoomValue * g_dKoef_mm_to_pix / 100);

		var _x = 0;
		var _y = 0;
		if (true == this.m_oWordControl.m_bIsRuler)
		{
			if (undefined == bIsRul)
			{
				//_x = 5 * g_dKoef_mm_to_pix;
				//_y = 7 * g_dKoef_mm_to_pix;
			}
		}

		// теперь крутить всякие циклы нет смысла
		if (pageIndex < 0 || pageIndex >= this.m_lPagesCount)
		{
			return {X: 0, Y: 0, Error: true};
		}

		var x_pix = (this.m_arrPages[pageIndex].drawingPage.left + x * dKoef + _x) >> 0;
		var y_pix = (this.m_arrPages[pageIndex].drawingPage.top + y * dKoef + _y) >> 0;

		return {X: x_pix, Y: y_pix, Error: false};

		// old version
		for (var i = this.m_lDrawingFirst; i <= this.m_lDrawingEnd; i++)
		{
			var rect = this.m_arrPages[i].drawingPage;

			if (this.m_arrPages[i].pageIndex == pageIndex)
			{
				var x_pix = (rect.left + x * dKoef + _x) >> 0;
				var y_pix = (rect.top + y * dKoef + _y) >> 0;

				return {X: x_pix, Y: y_pix, Error: false};
			}
		}

		return {X: 0, Y: 0, Error: true};
	};
	this.ConvertCoordsToCursor2 = function (x, y, pageIndex, bIsRul)
	{
		var dKoef = (this.m_oWordControl.m_nZoomValue * g_dKoef_mm_to_pix / 100);

		var _x = 0;
		var _y = 0;
		if (true == this.m_oWordControl.m_bIsRuler)
		{
			if (undefined == bIsRul)
			{
				//_x = 5 * g_dKoef_mm_to_pix;
				//_y = 7 * g_dKoef_mm_to_pix;
			}
		}

		// теперь крутить всякие циклы нет смысла
		if (pageIndex < 0 || pageIndex >= this.m_lPagesCount)
		{
			return {X: 0, Y: 0, Error: true};
		}

		var x_pix = (this.m_arrPages[pageIndex].drawingPage.left + x * dKoef + _x - 0.5) >> 0;
		var y_pix = (this.m_arrPages[pageIndex].drawingPage.top + y * dKoef + _y - 0.5) >> 0;

		return {X: x_pix, Y: y_pix, Error: false};
	};
	this.ConvertCoordsToCursor3 = function (x, y, pageIndex, isGlobal)
	{
		// теперь крутить всякие циклы нет смысла
		if (pageIndex < 0 || pageIndex >= this.m_lPagesCount)
		{
			return {X: 0, Y: 0, Error: true};
		}

		var dKoef = (this.m_oWordControl.m_nZoomValue * g_dKoef_mm_to_pix / 100);

		var _x = 0;
		var _y = 0;
		if (isGlobal)
		{
			_x = this.m_oWordControl.X;
			_y = this.m_oWordControl.Y;

			if (true == this.m_oWordControl.m_bIsRuler)
			{
				_x += 5 * g_dKoef_mm_to_pix;
				_y += 7 * g_dKoef_mm_to_pix;
			}
		}

		var x_pix = (this.m_arrPages[pageIndex].drawingPage.left + x * dKoef + _x + 0.5) >> 0;
		var y_pix = (this.m_arrPages[pageIndex].drawingPage.top + y * dKoef + _y + 0.5) >> 0;

		return {X: x_pix, Y: y_pix, Error: false};
	};

	this.ConvertCoordsToCursor4 = function (x, y, pageIndex, isNoRound)
	{
		// теперь крутить всякие циклы нет смысла
		if (pageIndex < 0 || pageIndex >= this.m_lPagesCount)
		{
			return {X: 0, Y: 0, Error: true};
		}

		var dKoef = (this.m_oWordControl.m_nZoomValue * g_dKoef_mm_to_pix / 100);

		var x_pix = (this.m_arrPages[pageIndex].drawingPage.left + x * dKoef);
		var y_pix = (this.m_arrPages[pageIndex].drawingPage.top + y * dKoef);

		if (true !== isNoRound)
		{
			x_pix = (x_pix + 0.5) >> 0;
			y_pix = (y_pix + 0.5) >> 0;
		}

		return {X: x_pix, Y: y_pix, Error: false};
	};

	this.InitViewer = function ()
	{
	};

	this.TargetStart = function ()
	{
		if (this.m_lTimerTargetId != -1)
			clearInterval(this.m_lTimerTargetId);
		var api = this.m_oWordControl.m_oApi;
		
		if(api.DocInfo.Mode !== 'view') {
			this.m_lTimerTargetId = setInterval(oThis.DrawTarget, 500);
		} else {
			// 预览模式隐藏光标
			this.TargetHtmlElement.style.display = 'none'
		}
	};
	this.TargetEnd = function ()
	{
		//if (!this.TargetShowFlag)
		//    return;

		this.TargetShowFlag = false;
		this.TargetShowNeedFlag = false;

		if (this.m_lTimerTargetId != -1)
		{
			clearInterval(this.m_lTimerTargetId);
			this.m_lTimerTargetId = -1;
		}

		this.showTarget(false);
	};
	this.UpdateTargetNoAttack = function ()
	{
		if (null == this.m_oWordControl)
			return;

		this.CheckTargetDraw(this.m_dTargetX, this.m_dTargetY);
	};

	this.GetTargetColor = function ()
	{
		if (!this.m_oWordControl.m_oApi.isDarkMode)
			return this.TargetCursorColor;
		return AscCommon.darkModeCorrectColor(this.TargetCursorColor.R, this.TargetCursorColor.G, this.TargetCursorColor.B);
	};
	this.GetTargetStyle = function ()
	{
		var color = this.GetTargetColor();
		return "rgb(" + color.R + "," + color.G + "," + color.B + ")";
	};

	this.SetTargetColor = function (r, g, b)
	{
		this.TargetCursorColor.R = r;
		this.TargetCursorColor.G = g;
		this.TargetCursorColor.B = b;
	};

	this.CheckTargetDraw = function (x, y)
	{
		var oldW = this.TargetHtmlElement.width_old;
		var oldH = this.TargetHtmlElement.height_old;

		var newW = 2;
		var newH = (this.m_dTargetSize * this.m_oWordControl.m_nZoomValue * g_dKoef_mm_to_pix / 100) >> 0;

		this.TargetHtmlElement.style.transformOrigin = "top left";

		if (oldW !== newW || oldH !== newH)
		{
			var pixNewW = ((newW * AscCommon.AscBrowser.retinaPixelRatio) >> 0) / AscCommon.AscBrowser.retinaPixelRatio;

			this.TargetHtmlElement.style.width = pixNewW + "px";
			this.TargetHtmlElement.style.height = newH + "px";
			this.TargetHtmlElement.width_old = newW;
			this.TargetHtmlElement.height_old = newH;
			this.TargetHtmlElement.oldColor = null;
		}

		var oldColor = this.TargetHtmlElement.oldColor;
		var newColor = this.GetTargetColor();
		if (!oldColor || oldColor.R !== newColor.R || oldColor.G !== newColor.G || oldColor.B !== newColor.B)
		{
			this.TargetHtmlElement.style.backgroundColor = "rgb(" + newColor.R + "," + newColor.G + "," + newColor.B + ")";
			this.TargetHtmlElement.oldColor = { R : newColor.R, G : newColor.G, B : newColor.B };
		}

		if (null == this.TextMatrix || global_MatrixTransformer.IsIdentity2(this.TextMatrix))
		{
			if (null != this.TextMatrix)
			{
				x += this.TextMatrix.tx;
				y += this.TextMatrix.ty;
			}

			var pos = this.ConvertCoordsToCursor4(x, y, this.m_lCurrentPage, true);
			this.TargetHtmlElementLeft = pos.X >> 0;
			this.TargetHtmlElementTop = (pos.Y + 0.5) >> 0;

			this.TargetHtmlElement.style["transform"] = "";
			this.TargetHtmlElement.style["msTransform"] = "";
			this.TargetHtmlElement.style["mozTransform"] = "";
			this.TargetHtmlElement.style["webkitTransform"] = "";

			if ((!this.m_oWordControl.MobileTouchManager && !AscCommon.AscBrowser.isSafariMacOs) || !AscCommon.AscBrowser.isWebkit)
			{
				this.TargetHtmlElement.style.left = this.TargetHtmlElementLeft + "px";
				this.TargetHtmlElement.style.top = this.TargetHtmlElementTop + "px";
			}
			else
			{
				this.TargetHtmlElement.style.left = "0px";
				this.TargetHtmlElement.style.top = "0px";
				this.TargetHtmlElement.style["webkitTransform"] = "matrix(1, 0, 0, 1, " + oThis.TargetHtmlElementLeft + "," + oThis.TargetHtmlElementTop + ")";
			}
		}
		else
		{
			var x1 = this.TextMatrix.TransformPointX(x, y);
			var y1 = this.TextMatrix.TransformPointY(x, y);

			var pos1 = this.ConvertCoordsToCursor4(x1, y1, this.m_lCurrentPage, true);
			pos1.X -= (newW / 2);

			this.TargetHtmlElementLeft = pos1.X >> 0;
			this.TargetHtmlElementTop = pos1.Y >> 0;

			var transform = "matrix(" + this.TextMatrix.sx + ", " + this.TextMatrix.shy + ", " + this.TextMatrix.shx + ", " +
				this.TextMatrix.sy + ", " + pos1.X + ", " + pos1.Y + ")";

			this.TargetHtmlElement.style.left = "0px";
			this.TargetHtmlElement.style.top = "0px";

			this.TargetHtmlElement.style["transform"] = transform;
			this.TargetHtmlElement.style["msTransform"] = transform;
			this.TargetHtmlElement.style["mozTransform"] = transform;
			this.TargetHtmlElement.style["webkitTransform"] = transform;
		}

		this.MoveTargetInInputContext();
	};

	this.MoveTargetInInputContext = function ()
	{
		if (AscCommon.g_inputContext)
			AscCommon.g_inputContext.move(this.TargetHtmlElementLeft, this.TargetHtmlElementTop);
	};

	this.UpdateTargetTransform = function (matrix)
	{
		this.TextMatrix = matrix;
	};

	this.MultiplyTargetTransform = function (matrix)
	{
		if (!this.TextMatrix)
			this.TextMatrix = matrix;
		else if (matrix)
		{
			this.TextMatrix.Multiply(matrix, AscCommon.MATRIX_ORDER_PREPEND);
		}
	};

	this.UpdateTarget = function (x, y, pageIndex)
	{
		if (this.m_oWordControl)
			this.m_oWordControl.m_oApi.checkLastWork();

		this.m_oWordControl.m_oLogicDocument.Set_TargetPos(x, y, pageIndex);

        if(window["NATIVE_EDITOR_ENJINE"])
        	return;

		if (this.UpdateTargetFromPaint === false && this.m_lCurrentPage != -1)
		{
			this.UpdateTargetCheck = true;
			return;
		}

		var bNeedScrollToTarget = true;
		if (!this.isScrollToTargetAttack && this.m_dTargetX == x && this.m_dTargetY == y && this.m_lTargetPage == pageIndex)
			bNeedScrollToTarget = false;

		this.isScrollToTargetAttack = false;

		if (-1 != this.m_lTimerUpdateTargetID)
		{
			clearTimeout(this.m_lTimerUpdateTargetID);
			this.m_lTimerUpdateTargetID = -1;
		}

		if (pageIndex >= this.m_arrPages.length)
			return;

		var bIsPageChanged = false;
		if (this.m_lCurrentPage != pageIndex)
		{
			this.m_lCurrentPage = pageIndex;
			this.m_oWordControl.SetCurrentPage2();
			this.m_oWordControl.OnScroll();
			bIsPageChanged = true;
		}

		var targetSizePx = (this.m_dTargetSize * this.m_oWordControl.m_nZoomValue * g_dKoef_mm_to_pix / 100) >> 0;

		var pos = null;
		if (!this.TextMatrix)
		{
			pos = this.ConvertCoordsToCursor2(x, y, this.m_lCurrentPage);
		}
		else
		{
			pos = this.ConvertCoordsToCursor2(this.TextMatrix.TransformPointX(x, y),
				this.TextMatrix.TransformPointY(x, y), this.m_lCurrentPage);
		}

		if (true == pos.Error && (false == bIsPageChanged))
			return;

		// смотрим, виден ли курсор на экране
		var wScreen = AscCommon.AscBrowser.convertToRetinaValue(this.m_oWordControl.m_oEditor.HtmlElement.width, false);
		var hScreen = AscCommon.AscBrowser.convertToRetinaValue(this.m_oWordControl.m_oEditor.HtmlElement.height, false);

		var boxX = 0;
		var boxY = 0;
		var boxR = wScreen - 2;
		var boxB = hScreen;

		var nValueScrollHor = 0;
		if (pos.X < boxX)
		{
			nValueScrollHor = (pos.X - 5) - boxX;
		}
		if (pos.X > boxR)
		{
			nValueScrollHor = (pos.X + 5) - boxR;
		}

		var nValueScrollVer = 0;
		if (pos.Y < boxY)
		{
			nValueScrollVer = (pos.Y - 5) - boxY;
		}
		if ((pos.Y + targetSizePx) > boxB)
		{
			nValueScrollVer = (pos.Y + targetSizePx + 5) - boxB;
		}

		if (!bNeedScrollToTarget)
		{
			nValueScrollHor = 0;
			nValueScrollVer = 0;
		}

		if (0 != nValueScrollHor || 0 != nValueScrollVer)
		{
			if (this.m_oWordControl.m_bIsMouseUpSend === true && AscCommon.global_keyboardEvent.ClickCount != 1)
			{
				this.m_tempX = x;
				this.m_tempY = y;
				this.m_tempPageIndex = pageIndex;
				var oThis = this;
				this.m_lTimerUpdateTargetID = setTimeout(this.UpdateTargetTimer, 100);
				return;
			}
		}

		this.m_dTargetX = x;
		this.m_dTargetY = y;
		this.m_lTargetPage = pageIndex;
		var isNeedScroll = false;
		if (0 !== nValueScrollHor)
		{
			isNeedScroll = true;
			this.m_oWordControl.m_bIsUpdateTargetNoAttack = true;
			this.m_oWordControl.m_oScrollHorApi.scrollByX(nValueScrollHor);
		}
		if (0 !== nValueScrollVer)
		{
			isNeedScroll = true;
			this.m_oWordControl.m_bIsUpdateTargetNoAttack = true;
			this.m_oWordControl.m_oScrollVerApi.scrollByY(nValueScrollVer);
		}

		if (true == isNeedScroll)
		{
			this.m_oWordControl.m_bIsUpdateTargetNoAttack = true;
			this.m_oWordControl.OnScroll();
			return;
		}

		this.CheckTargetDraw(x, y);
	};

	this.UpdateTargetTimer = function ()
	{
		var x = oThis.m_tempX;
		var y = oThis.m_tempY;
		var pageIndex = oThis.m_tempPageIndex;

		oThis.m_lTimerUpdateTargetID = -1;
		if (pageIndex >= oThis.m_arrPages.length)
			return;

		var oWordControl = oThis.m_oWordControl;

		var bIsPageChanged = false;
		if (oThis.m_lCurrentPage != pageIndex)
		{
			oThis.m_lCurrentPage = pageIndex;
			oWordControl.SetCurrentPage2();
			oWordControl.OnScroll();
			bIsPageChanged = true;
		}

		oThis.m_dTargetX = x;
		oThis.m_dTargetY = y;
		oThis.m_lTargetPage = pageIndex;

		var targetSizePx = (oThis.m_dTargetSize * oWordControl.m_nZoomValue * g_dKoef_mm_to_pix / 100) >> 0;
		var pos = oThis.ConvertCoordsToCursor2(x, y, oThis.m_lCurrentPage);

		if (true === pos.Error && (false === bIsPageChanged))
			return;

		// смотрим, виден ли курсор на экране
		var wScreen = AscCommon.AscBrowser.convertToRetinaValue(oWordControl.m_oEditor.HtmlElement.width, false);
		var hScreen = AscCommon.AscBrowser.convertToRetinaValue(oWordControl.m_oEditor.HtmlElement.height, false);

		var boxX = 0;
		var boxY = 0;
		var boxR = wScreen - 2;
		var boxB = hScreen;

		var nValueScrollHor = 0;
		if (pos.X < boxX)
		{
			nValueScrollHor = (pos.X - 5) - boxX;
		}
		if (pos.X > boxR)
		{
			nValueScrollHor = (pos.X + 5) - boxR;
		}

		var nValueScrollVer = 0;
		if (pos.Y < boxY)
		{
			nValueScrollVer = (pos.Y - 5) - boxY;
		}
		if ((pos.Y + targetSizePx) > boxB)
		{
			nValueScrollVer = (pos.Y + targetSizePx + 5) - boxB;
		}

		var isNeedScroll = false;
		if (0 !== nValueScrollHor)
		{
			isNeedScroll = true;
			oWordControl.m_bIsUpdateTargetNoAttack = true;
			oWordControl.m_oScrollHorApi.scrollByX(nValueScrollHor);
		}
		if (0 !== nValueScrollVer)
		{
			isNeedScroll = true;
			oWordControl.m_bIsUpdateTargetNoAttack = true;
			oWordControl.m_oScrollVerApi.scrollByY(nValueScrollVer);
		}

		if (true === isNeedScroll)
		{
			oWordControl.m_bIsUpdateTargetNoAttack = true;
			oWordControl.OnScroll();
			return;
		}

		oThis.TargetHtmlElementLeft = pos.X >> 0;
		oThis.TargetHtmlElementTop = pos.Y >> 0;
		oThis.TargetHtmlElement.style.left = oThis.TargetHtmlElementLeft + "px";
		oThis.TargetHtmlElement.style.top = oThis.TargetHtmlElementTop + "px";
	};

	this.SetTargetSize = function (size)
	{
		this.m_dTargetSize = size;
		//this.TargetHtmlElement.style.height = Number(this.m_dTargetSize * this.m_oWordControl.m_nZoomValue * g_dKoef_mm_to_pix / 100) + "px";
		//this.TargetHtmlElement.style.width = "2px";
	};
	this.DrawTarget = function ()
	{
		if (oThis.NeedTarget && oThis.m_oWordControl.IsFocus)
		{
			oThis.showTarget(!oThis.isShowTarget());
		}
	};

	this.TargetShow = function ()
	{
		this.TargetShowNeedFlag = true;
	};
	this.CheckTargetShow = function ()
	{
		if (this.TargetShowFlag && this.TargetShowNeedFlag)
		{
			this.showTarget(true);
			this.TargetShowNeedFlag = false;
			return;
		}

		if (!this.TargetShowNeedFlag)
			return;

		this.TargetShowNeedFlag = false;

		if (-1 == this.m_lTimerTargetId)
			this.TargetStart();

		if (oThis.NeedTarget)
			this.showTarget(true);

		this.TargetShowFlag = true;
	};
	this.StartTrackImage = function (obj, x, y, w, h, type, pagenum)
	{
	};
	this.StartTrackTable = function (obj, transform)
	{
		if (this.m_oWordControl.MobileTouchManager)
		{
			if (!this.m_oWordControl.MobileTouchManager.TableStartTrack_Check)
				return;
		}

		this.TableOutlineDr.TableOutline = obj;
		this.TableOutlineDr.Counter = 0;
		this.TableOutlineDr.bIsNoTable = false;
		this.TableOutlineDr.CheckStartTrack(this.m_oWordControl, transform);

		if (this.m_oWordControl.MobileTouchManager)
			this.m_oWordControl.OnUpdateOverlay();
	};
	this.EndTrackTable = function (pointer, bIsAttack)
	{
		if (this.TableOutlineDr.TableOutline != null)
		{
			if (pointer == this.TableOutlineDr.TableOutline.Table || bIsAttack)
			{
				this.TableOutlineDr.TableOutline = null;
				this.TableOutlineDr.Counter = 0;
			}
		}
	};
	this.CheckTrackTable = function ()
	{
		if (null == this.TableOutlineDr.TableOutline)
			return;

		if (this.TableOutlineDr.bIsNoTable && this.TableOutlineDr.bIsTracked === false)
		{
			this.TableOutlineDr.Counter++;
			if (this.TableOutlineDr.Counter > 100)
			{
				this.TableOutlineDr.TableOutline = null;
				this.m_oWordControl.OnUpdateOverlay();
			}
		}
	};

	this.DrawFrameTrack = function (overlay)
	{
		if (!this.FrameRect.IsActive)
			return;

		var _page = this.m_arrPages[this.FrameRect.PageIndex];
		var drPage = _page.drawingPage;

		var dKoefX = (drPage.right - drPage.left) / _page.width_mm;
		var dKoefY = (drPage.bottom - drPage.top) / _page.height_mm;

		var rPR = AscCommon.AscBrowser.retinaPixelRatio;
		var _x = (drPage.left + dKoefX * this.FrameRect.Rect.X) * rPR;
		var _y = (drPage.top + dKoefY * this.FrameRect.Rect.Y) * rPR;
		var _r = (drPage.left + dKoefX * this.FrameRect.Rect.R) * rPR;
		var _b = (drPage.top + dKoefY * this.FrameRect.Rect.B) * rPR;

		var ctx = overlay.m_oContext;
		ctx.strokeStyle = "#939393";
		ctx.lineWidth = Math.round(rPR);

		ctx.beginPath();
		this.AutoShapesTrack.AddRectDashClever(ctx, _x >> 0, _y >> 0, _r >> 0, _b >> 0, 2, 2, true);
		ctx.beginPath();

		var _w = Math.round(4 * rPR);
		var _wc = Math.round(5 * rPR);

		var _x1 = (_x >> 0) + Math.round(rPR);
		var _y1 = (_y >> 0) + Math.round(rPR);

		var _x2 = (_r >> 0) - _w;
		var _y2 = (_b >> 0) - _w;

		var _xc = ((_x + _r - _wc) / 2) >> 0;
		var _yc = ((_y + _b - _wc) / 2) >> 0;

		ctx.rect(_x1, _y1, _w, _w);
		ctx.rect(_xc, _y1, _wc, _w);
		ctx.rect(_x2, _y1, _w, _w);
		ctx.rect(_x1, _yc, _w, _wc);
		ctx.rect(_x2, _yc, _w, _wc);
		ctx.rect(_x1, _y2, _w, _w);
		ctx.rect(_xc, _y2, _wc, _w);
		ctx.rect(_x2, _y2, _w, _w);

		ctx.fillStyle = "#777777";
		ctx.fill();
		ctx.beginPath();

		overlay.CheckPoint(_x - _wc, _y - _wc);
		overlay.CheckPoint(_r + _wc, _b + _wc);

		// move
		if (this.FrameRect.IsTracked)
		{
			_page = this.m_arrPages[this.FrameRect.Track.PageIndex];
			drPage = _page.drawingPage;

			dKoefX = (drPage.right - drPage.left) / _page.width_mm;
			dKoefY = (drPage.bottom - drPage.top) / _page.height_mm;

			var __x = (drPage.left + dKoefX * this.FrameRect.Track.L) * rPR >> 0;
			var __y = (drPage.top + dKoefY * this.FrameRect.Track.T) * rPR >> 0;
			var __r = (drPage.left + dKoefX * this.FrameRect.Track.R) * rPR >> 0;
			var __b = (drPage.top + dKoefY * this.FrameRect.Track.B) * rPR >> 0;

			if (__x < overlay.min_x)
				overlay.min_x = __x;
			if (__r > overlay.max_x)
				overlay.max_x = __r;

			if (__y < overlay.min_y)
				overlay.min_y = __y;
			if (__b > overlay.max_y)
				overlay.max_y = __b;

			ctx.strokeStyle = "#FFFFFF";

			ctx.beginPath();
			ctx.rect(__x + 0.5 * Math.round(rPR), __y + 0.5 * Math.round(rPR), __r - __x, __b - __y);
			ctx.stroke();

			ctx.strokeStyle = "#000000";
			ctx.beginPath();
			this.AutoShapesTrack.AddRectDashClever(ctx, __x, __y, __r, __b, 3, 3, true);
			ctx.beginPath();
		}
	};

	this.OnDrawContentControl = function(obj, state, geom)
	{
		return this.contentControls.OnDrawContentControl(obj, state, geom);
	};

	this.DrawMathTrack = function (overlay)
	{
		if (!this.MathTrack.IsActive())
			return;

		overlay.Show();
		var nIndex, nCount;
		var oPath;
		var _page, drPage, dKoefX, dKoefY;
		var PathLng = this.MathTrack.GetPolygonsCount();
		var textMatrix = (null == this.TextMatrix || global_MatrixTransformer.IsIdentity(this.TextMatrix)) ? null : this.TextMatrix;

		for (nIndex = 0; nIndex < PathLng; nIndex++)
		{
			oPath = this.MathTrack.GetPolygon(nIndex);
			_page = this.m_arrPages[oPath.Page];
			drPage = _page.drawingPage;

			dKoefX = (drPage.right - drPage.left) / _page.width_mm;
			dKoefY = (drPage.bottom - drPage.top) / _page.height_mm;
			this.MathTrack.Draw(overlay, oPath, 0, 0, "#939393", dKoefX, dKoefY, drPage.left, drPage.top, textMatrix);
			this.MathTrack.Draw(overlay, oPath, 1, 1, "#FFFFFF", dKoefX, dKoefY, drPage.left, drPage.top, textMatrix);
		}
		for (nIndex = 0, nCount = this.MathTrack.GetSelectPathsCount(); nIndex < nCount; nIndex++)
		{
			oPath = this.MathTrack.GetSelectPath(nIndex);
			_page = this.m_arrPages[oPath.Page];
			drPage = _page.drawingPage;
			dKoefX = (drPage.right - drPage.left) / _page.width_mm;
			dKoefY = (drPage.bottom - drPage.top) / _page.height_mm;
			this.MathTrack.DrawSelectPolygon(overlay, oPath, dKoefX, dKoefY, drPage.left, drPage.top, textMatrix);
		}
	};

	this.DrawFieldTrack = function (overlay)
	{
		if (!this.FieldTrack.IsActive)
			return;

		overlay.Show();

		var rPR = AscCommon.AscBrowser.retinaPixelRatio;

		for (var nIndex = 0, nCount = this.FieldTrack.Rects.length; nIndex < nCount; nIndex++)
		{
			var FieldRect = this.FieldTrack.Rects[nIndex];

			var _page = this.m_arrPages[FieldRect.PageIndex];
			var drPage = _page.drawingPage;

			var dKoefX = (drPage.right - drPage.left) / _page.width_mm;
			var dKoefY = (drPage.bottom - drPage.top) / _page.height_mm;

			if (null == this.TextMatrix || global_MatrixTransformer.IsIdentity(this.TextMatrix))
			{
				var _x = (drPage.left + dKoefX * FieldRect.X0) * rPR;
				var _y = (drPage.top + dKoefY * FieldRect.Y0) * rPR;
				var _r = (drPage.left + dKoefX * FieldRect.X1) * rPR;
				var _b = (drPage.top + dKoefY * FieldRect.Y1) * rPR;

				if (_x < overlay.min_x)
					overlay.min_x = _x;
				if (_r > overlay.max_x)
					overlay.max_x = _r;

				if (_y < overlay.min_y)
					overlay.min_y = _y;
				if (_b > overlay.max_y)
					overlay.max_y = _b;

				var ctx = overlay.m_oContext;
				ctx.fillStyle = "#375082";

				ctx.beginPath();
				this.AutoShapesTrack.AddRect(ctx, _x >> 0, _y >> 0, _r >> 0, _b >> 0);

				ctx.globalAlpha = 0.2;
				ctx.fill();
				ctx.globalAlpha = 1;
				ctx.beginPath();
			}
			else
			{
				var _arrSelect = TransformRectByMatrix(this.TextMatrix, [FieldRect.X0, FieldRect.Y0, FieldRect.X1, FieldRect.Y1], drPage.left, drPage.top, dKoefX, dKoefY);

				for (var i = 0; i < 8; i++)
					_arrSelect[i] *= rPR;

				overlay.CheckPoint(_arrSelect[0], _arrSelect[1]);
				overlay.CheckPoint(_arrSelect[2], _arrSelect[3]);
				overlay.CheckPoint(_arrSelect[4], _arrSelect[5]);
				overlay.CheckPoint(_arrSelect[6], _arrSelect[7]);

				var ctx = overlay.m_oContext;
				ctx.fillStyle = "#375082";

				ctx.beginPath();

				ctx.moveTo(_arrSelect[0], _arrSelect[1]);
				ctx.lineTo(_arrSelect[2], _arrSelect[3]);
				ctx.lineTo(_arrSelect[4], _arrSelect[5]);
				ctx.lineTo(_arrSelect[6], _arrSelect[7]);
				ctx.closePath();

				ctx.globalAlpha = 0.2;
				ctx.fill();
				ctx.globalAlpha = 1;
				ctx.beginPath();
			}
		}
	};

	this.DrawTableTrack = function (overlay)
	{
		if (null == this.TableOutlineDr.TableOutline)
			return;

		var _table = this.TableOutlineDr.TableOutline.Table;

		if (!_table.Is_Inline() || this.TableOutlineDr.IsResizeTableTrack)
		{
			if (null == this.TableOutlineDr.CurPos)
				return;

			var _page = this.m_arrPages[this.TableOutlineDr.CurPos.Page];
			var drPage = _page.drawingPage;

			var rPR = AscCommon.AscBrowser.retinaPixelRatio;
			var dKoefX = (drPage.right - drPage.left) / _page.width_mm;
			var dKoefY = (drPage.bottom - drPage.top) / _page.height_mm;
			var indent = 0.5 * Math.round(rPR);

			if (!this.TableOutlineDr.TableMatrix || global_MatrixTransformer.IsIdentity(this.TableOutlineDr.TableMatrix))
			{
				var _x = ((drPage.left + dKoefX * this.TableOutlineDr.CurPos.X) * rPR >> 0) + indent;
				var _y = ((drPage.top + dKoefY * this.TableOutlineDr.CurPos.Y) >> 0) * rPR + indent;

				var _r = _x + ((dKoefX * this.TableOutlineDr.TableOutline.W) * rPR >> 0);
				var _b = _y + ((dKoefY * this.TableOutlineDr.TableOutline.H) * rPR >> 0);

				if (this.TableOutlineDr.IsResizeTableTrack)
				{
					var _lastBounds = this.TableOutlineDr.getLastPageBounds();
					var _lastX = _lastBounds.X;
					var _lastY = this.TableOutlineDr.getFullTopPosition(_lastBounds);
					var _lastYStart = _lastBounds.Y;

					_x = ((drPage.left + dKoefX * _lastX) * rPR >> 0) + indent;
					_y = ((drPage.top + dKoefY * _lastY) * rPR >> 0) + indent;
					var _yStart = ((drPage.top + dKoefY * _lastYStart) * rPR >> 0) + indent;

					_r = _x + ((dKoefX * (_lastBounds.W + this.TableOutlineDr.AddResizeCurrentW)) * rPR >> 0);
					_b = _yStart + ((dKoefY * (_lastBounds.H + this.TableOutlineDr.AddResizeCurrentH)) * rPR >> 0);
				}
				overlay.CheckPoint(_x, _y);
				overlay.CheckPoint(_x, _b);
				overlay.CheckPoint(_r, _y);
				overlay.CheckPoint(_r, _b);

				var ctx = overlay.m_oContext;
				ctx.strokeStyle = "#FFFFFF";

				ctx.beginPath();
				ctx.rect(_x, _y, _r - _x, _b - _y);
				ctx.lineWidth = Math.round(rPR);
				ctx.stroke();

				ctx.strokeStyle = "#000000";
				ctx.beginPath();

				// набиваем пунктир
				var dot_size = 3 * Math.round(rPR);
				for (var i = _x; i < _r; i += dot_size)
				{
					ctx.moveTo(i, _y);
					i += dot_size;

					if (i > _r)
						i = _r;

					ctx.lineTo(i, _y);
				}
				for (var i = _y; i < _b; i += dot_size)
				{
					ctx.moveTo(_r, i);
					i += dot_size;

					if (i > _b)
						i = _b;

					ctx.lineTo(_r, i);
				}
				for (var i = _r; i > _x; i -= dot_size)
				{
					ctx.moveTo(i, _b);
					i -= dot_size;

					if (i < _x)
						i = _x;

					ctx.lineTo(i, _b);
				}
				for (var i = _b; i > _y; i -= dot_size)
				{
					ctx.moveTo(_x, i);
					i -= dot_size;

					if (i < _y)
						i = _y;

					ctx.lineTo(_x, i);
				}

				ctx.stroke();
				ctx.beginPath();
			}
			else
			{
				var _x = this.TableOutlineDr.CurPos.X + _table.GetTableOffsetCorrection();
				var _y = this.TableOutlineDr.CurPos.Y;
				var _r = _x + this.TableOutlineDr.TableOutline.W;
				var _b = _y + this.TableOutlineDr.TableOutline.H;

				if (this.TableOutlineDr.IsResizeTableTrack)
				{
					_x = this.TableOutlineDr.TableOutline.X;
					_y = this.TableOutlineDr.TableOutline.Y;

					_r = _x + (this.TableOutlineDr.TableOutline.W + this.TableOutlineDr.AddResizeCurrentW);
					_b = _y + (this.TableOutlineDr.TableOutline.H + this.TableOutlineDr.AddResizeCurrentH);
				}

				var transform = this.TableOutlineDr.TableMatrix;

				var x1 = transform.TransformPointX(_x, _y);
				var y1 = transform.TransformPointY(_x, _y);

				var x2 = transform.TransformPointX(_r, _y);
				var y2 = transform.TransformPointY(_r, _y);

				var x3 = transform.TransformPointX(_r, _b);
				var y3 = transform.TransformPointY(_r, _b);

				var x4 = transform.TransformPointX(_x, _b);
				var y4 = transform.TransformPointY(_x, _b);

				x1 = drPage.left + dKoefX * x1;
				y1 = drPage.top + dKoefY * y1;

				x2 = drPage.left + dKoefX * x2;
				y2 = drPage.top + dKoefY * y2;

				x3 = drPage.left + dKoefX * x3;
				y3 = drPage.top + dKoefY * y3;

				x4 = drPage.left + dKoefX * x4;
				y4 = drPage.top + dKoefY * y4;

				overlay.CheckPoint(x1, y1);
				overlay.CheckPoint(x2, y2);
				overlay.CheckPoint(x3, y3);
				overlay.CheckPoint(x4, y4);

				var ctx = overlay.m_oContext;
				ctx.strokeStyle = "#FFFFFF";

				ctx.beginPath();
				ctx.moveTo(x1, y1);
				ctx.lineTo(x2, y2);
				ctx.lineTo(x3, y3);
				ctx.lineTo(x4, y4);
				ctx.closePath();
				ctx.stroke();

				ctx.strokeStyle = "#000000";
				ctx.beginPath();
				this.AutoShapesTrack.AddRectDash(ctx, x1, y1, x2, y2, x4, y4, x3, y3, 3, 3, true);
				ctx.beginPath();
			}
		}
		else
		{
			this.LockCursorType("default");

			var _x = global_mouseEvent.X;
			var _y = global_mouseEvent.Y;
			var posMouse = this.ConvertCoordsFromCursor2(_x, _y);

			this.TableOutlineDr.InlinePos = this.m_oWordControl.m_oLogicDocument.Get_NearestPos(posMouse.Page, posMouse.X, posMouse.Y);
			this.TableOutlineDr.InlinePos.Page = posMouse.Page;
			//var posView = this.ConvertCoordsToCursor(this.TableOutlineDr.InlinePos.X, this.TableOutlineDr.InlinePos.Y, posMouse.Page, true);

			var _near = this.TableOutlineDr.InlinePos;
			this.AutoShapesTrack.SetCurrentPage(_near.Page);
			this.AutoShapesTrack.DrawInlineMoveCursor(_near.X, _near.Y, _near.Height, _near.transform);
		}
	};
	this.SetCurrentPage = function (PageIndex)
	{
		if (PageIndex >= this.m_arrPages.length)
			return;
		if (this.m_lCurrentPage == PageIndex)
			return;

		this.m_lCurrentPage = PageIndex;
		this.m_oWordControl.SetCurrentPage();
	};

	this.SelectEnabled = function (bIsEnabled)
	{
		this.m_bIsSelection = bIsEnabled;
		if (false === this.m_bIsSelection)
		{
			this.SelectClear();
			//this.m_oWordControl.CheckUnShowOverlay();
			this.m_oWordControl.OnUpdateOverlay();
			this.m_oWordControl.m_oOverlayApi.m_oContext.globalAlpha = 1.0;
		}
	};
	this.SelectClear = function ()
	{
		if (this.m_oWordControl.MobileTouchManager)
		{
			this.m_oWordControl.MobileTouchManager.RectSelect1 = null;
			this.m_oWordControl.MobileTouchManager.RectSelect2 = null;
		}
	};
	this.SearchClear = function ()
	{
		for (var i = 0; i < this.m_lPagesCount; i++)
		{
			this.m_arrPages[i].searchingArray.splice(0, this.m_arrPages[i].searchingArray.length);
		}

		this._search_HdrFtr_All.splice(0, this._search_HdrFtr_All.length);
		this._search_HdrFtr_All_no_First.splice(0, this._search_HdrFtr_All_no_First.length);
		this._search_HdrFtr_First.splice(0, this._search_HdrFtr_First.length);
		this._search_HdrFtr_Even.splice(0, this._search_HdrFtr_Even.length);
		this._search_HdrFtr_Odd.splice(0, this._search_HdrFtr_Odd.length);
		this._search_HdrFtr_Odd_no_First.splice(0, this._search_HdrFtr_Odd_no_First.length);

		this.m_oWordControl.m_oOverlayApi.Clear();
		this.m_bIsSearching = false;
	};
	this.AddPageSearch = function (findText, rects, type)
	{
		var _len = rects.length;
		if (_len == 0)
			return;

		if (this.m_oWordControl.m_oOverlay.HtmlElement.style.display == "none")
		{
			this.m_oWordControl.ShowOverlay();
			this.m_oWordControl.m_oOverlayApi.m_oContext.globalAlpha = 0.2;
		}

		var navigator = {Page: rects[0].PageNum, Place: rects, Type: type};

		var _find = {text: findText, navigator: navigator};
		this.m_oWordControl.m_oApi.sync_SearchFoundCallback(_find);

		var is_update = false;

		var _type = type & 0x00FF;
		switch (_type)
		{
			case search_Common:
			{
				var _pages = this.m_arrPages;
				for (var i = 0; i < _len; i++)
				{
					var r = rects[i];

					if (this.SearchTransform)
						r.Transform = this.SearchTransform;

					_pages[r.PageNum].searchingArray[_pages[r.PageNum].searchingArray.length] = r;

					if (r.PageNum >= this.m_lDrawingFirst && r.PageNum <= this.m_lDrawingEnd)
						is_update = true;
				}
				break;
			}
			case search_HdrFtr_All:
			{
				for (var i = 0; i < _len; i++)
				{
					if (this.SearchTransform)
						rects[i].Transform = this.SearchTransform;

					this._search_HdrFtr_All[this._search_HdrFtr_All.length] = rects[i];
				}
				is_update = true;

				break;
			}
			case search_HdrFtr_All_no_First:
			{
				for (var i = 0; i < _len; i++)
				{
					if (this.SearchTransform)
						rects[i].Transform = this.SearchTransform;

					this._search_HdrFtr_All_no_First[this._search_HdrFtr_All_no_First.length] = rects[i];
				}
				if (this.m_lDrawingEnd > 0)
					is_update = true;

				break;
			}
			case search_HdrFtr_First:
			{
				for (var i = 0; i < _len; i++)
				{
					if (this.SearchTransform)
						rects[i].Transform = this.SearchTransform;

					this._search_HdrFtr_First[this._search_HdrFtr_First.length] = rects[i];
				}
				if (this.m_lDrawingFirst == 0)
					is_update = true;

				break;
			}
			case search_HdrFtr_Even:
			{
				for (var i = 0; i < _len; i++)
				{
					if (this.SearchTransform)
						rects[i].Transform = this.SearchTransform;

					this._search_HdrFtr_Even[this._search_HdrFtr_Even.length] = rects[i];
				}
				var __c = this.m_lDrawingEnd - this.m_lDrawingFirst;

				if (__c > 1)
					is_update = true;
				else if (__c == 1 && (this.m_lDrawingFirst & 1) == 1)
					is_update = true;

				break;
			}
			case search_HdrFtr_Odd:
			{
				for (var i = 0; i < _len; i++)
				{
					if (this.SearchTransform)
						rects[i].Transform = this.SearchTransform;

					this._search_HdrFtr_Odd[this._search_HdrFtr_Odd.length] = rects[i];
				}
				var __c = this.m_lDrawingEnd - this.m_lDrawingFirst;

				if (__c > 1)
					is_update = true;
				else if (__c == 1 && (this.m_lDrawingFirst & 1) == 0)
					is_update = true;

				break;
			}
			case search_HdrFtr_Odd_no_First:
			{
				for (var i = 0; i < _len; i++)
				{
					if (this.SearchTransform)
						rects[i].Transform = this.SearchTransform;

					this._search_HdrFtr_Odd_no_First[this._search_HdrFtr_Odd_no_First.length] = rects[i];
				}

				if (this.m_lDrawingEnd > 1)
				{
					var __c = this.m_lDrawingEnd - this.m_lDrawingFirst;
					if (__c > 1)
						is_update = true;
					else if (__c == 1 && (this.m_lDrawingFirst & 1) == 0)
						is_update = true;
				}

				break;
			}
			default:
				break;
		}

		if (is_update)
			this.m_oWordControl.OnUpdateOverlay();

	};

	this.StartSearchTransform = function (transform)
	{
		this.SearchTransform = transform.CreateDublicate();
	};

	this.EndSearchTransform = function ()
	{
		this.SearchTransform = null;
	};

	this.StartSearch = function ()
	{
		this.SearchClear();
		if (this.m_bIsSelection)
			this.m_oWordControl.OnUpdateOverlay();
		this.m_bIsSearching = true;
	};
	this.EndSearch = function (bIsChange)
	{
		if (bIsChange)
		{
			this.SearchClear();
			this.m_bIsSearching = false;
			this.m_oWordControl.OnUpdateOverlay();
		}
		else
		{
			this.m_bIsSearching = true;
			this.m_oWordControl.OnUpdateOverlay();
		}
		this.m_oWordControl.m_oApi.sync_SearchEndCallback();
	};

	this.SetTextSelectionOutline = function (isSelectionOutline)
	{
		this.IsTextSelectionOutline = isSelectionOutline;
	};

	this.private_StartDrawSelection = function (overlay, isSelect2)
	{
		this.Overlay = overlay;
		this.IsTextMatrixUse = ((null != this.TextMatrix) && !global_MatrixTransformer.IsIdentity(this.TextMatrix));

		this.Overlay.m_oContext.fillStyle = "rgba(51,102,204,255)";
		this.Overlay.m_oContext.beginPath();

		if (this.m_oWordControl.MobileTouchManager && (true !== isSelect2))
		{
			this.m_oWordControl.MobileTouchManager.RectSelect1 = null;
			this.m_oWordControl.MobileTouchManager.RectSelect2 = null;
		}
	};
	this.private_EndDrawSelection = function ()
	{
		var ctx = this.Overlay.m_oContext;

		ctx.globalAlpha = 0.2;
		ctx.fill();

		if (this.IsTextMatrixUse && this.IsTextSelectionOutline)
		{
			ctx.strokeStyle = "#9ADBFE";
			ctx.lineWidth = Math.round(AscCommon.AscBrowser.retinaPixelRatio);
			ctx.globalAlpha = 1.0;
			ctx.stroke();
		}

		ctx.beginPath();
		ctx.globalAlpha = 1.0;

		this.IsTextMatrixUse = false;
		this.Overlay = null;
	};

	this.AddPageSelection = function (pageIndex, x, y, w, h)
	{
		if (null == this.SelectionMatrix)
			this.SelectionMatrix = this.TextMatrix;

		this.IsTextMatrixUse = ((null != this.TextMatrix) && !global_MatrixTransformer.IsIdentity(this.TextMatrix));
        var rPR = AscCommon.AscBrowser.retinaPixelRatio;
		var page = this.m_arrPages[pageIndex];
		var drawPage = page.drawingPage;

		var dKoefX = (drawPage.right - drawPage.left) / page.width_mm;
		var dKoefY = (drawPage.bottom - drawPage.top) / page.height_mm;

		if (!this.IsTextMatrixUse)
		{
			var _x = ((drawPage.left + dKoefX * x) >> 0);
			var _y = ((drawPage.top + dKoefY * y) >> 0);

			var _r = ((drawPage.left + dKoefX * (x + w)) >> 0);
			var _b = ((drawPage.top + dKoefY * (y + h)) >> 0);

			var _w = _r - _x + 1;
			var _h = _b - _y + 1;

			this.Overlay.CheckRect(rPR * _x, rPR * _y, rPR * _w, rPR * _h);
			this.Overlay.m_oContext.rect((rPR * _x) >> 0, (rPR *_y) >> 0, (_w * rPR) >> 0, (_h * rPR) >> 0);
			// this.Overlay.
		}
		else
		{
			var _x1 = this.TextMatrix.TransformPointX(x, y);
			var _y1 = this.TextMatrix.TransformPointY(x, y);

			var _x2 = this.TextMatrix.TransformPointX(x + w, y);
			var _y2 = this.TextMatrix.TransformPointY(x + w, y);

			var _x3 = this.TextMatrix.TransformPointX(x + w, y + h);
			var _y3 = this.TextMatrix.TransformPointY(x + w, y + h);

			var _x4 = this.TextMatrix.TransformPointX(x, y + h);
			var _y4 = this.TextMatrix.TransformPointY(x, y + h);

			var x1 = (drawPage.left + dKoefX * _x1) * rPR;
			var y1 = (drawPage.top + dKoefY * _y1) * rPR;

			var x2 = (drawPage.left + dKoefX * _x2) * rPR;
			var y2 = (drawPage.top + dKoefY * _y2) * rPR;

			var x3 = (drawPage.left + dKoefX * _x3) * rPR;
			var y3 = (drawPage.top + dKoefY * _y3) * rPR;

			var x4 = (drawPage.left + dKoefX * _x4) * rPR;
			var y4 = (drawPage.top + dKoefY * _y4) * rPR;

			if (global_MatrixTransformer.IsIdentity2(this.TextMatrix))
			{
				var indent = 0.5 * Math.round(rPR);
				x1 = (x1 >> 0) + indent;
				y1 = (y1 >> 0) + indent;

				x2 = (x2 >> 0) + indent;
				y2 = (y2>> 0) + indent;

				x3 = (x3 >> 0) + indent;
				y3 = (y3 >> 0) + indent;

				x4 = (x4 >> 0) + indent;
				y4 = (y4 >> 0) + indent;
			}

			this.Overlay.CheckPoint(x1, y1);
			this.Overlay.CheckPoint(x2, y2);
			this.Overlay.CheckPoint(x3, y3);
			this.Overlay.CheckPoint(x4, y4);

			var ctx = this.Overlay.m_oContext;
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.lineTo(x3, y3);
			ctx.lineTo(x4, y4);
			ctx.closePath();
		}
	};

    this.AddPageSelection2 = function (pageIndex, x, y, w, h)
    {
        if (!this.OverlaySelection2.Data)
            this.OverlaySelection2.Data = [];

        this.OverlaySelection2.Data.push([pageIndex, x, y, w, h]);
    };

    this.DrawPageSelection2 = function(overlay)
	{
		if (this.OverlaySelection2.Data)
		{
			this.private_StartDrawSelection(overlay, true);

			var len = this.OverlaySelection2.Data.length;
			var value;
			for (var i = 0; i < len; i++)
			{
				value = this.OverlaySelection2.Data[i];
				this.AddPageSelection(value[0], value[1], value[2], value[3], value[4]);
			}

            this.private_EndDrawSelection();
		}
        this.OverlaySelection2 = {};
	};

	this.CheckSelectMobile = function (overlay)
	{
		var _select = this.m_oWordControl.m_oLogicDocument.GetSelectionBounds();
		if (!_select)
			return;

		var _rect1 = _select.Start;
		var _rect2 = _select.End;

		if (!_rect1 || !_rect2)
			return;

		var _matrix = this.TextMatrix;

		var ctx = overlay.m_oContext;

		var pos1, pos2, pos3, pos4;

		if (!_matrix || global_MatrixTransformer.IsIdentity(_matrix))
		{
			pos1 = this.ConvertCoordsToCursorWR(_rect1.X, _rect1.Y, _rect1.Page, undefined, false);
			pos2 = this.ConvertCoordsToCursorWR(_rect1.X, _rect1.Y + _rect1.H, _rect1.Page, undefined, false);

			pos3 = this.ConvertCoordsToCursorWR(_rect2.X + _rect2.W, _rect2.Y, _rect2.Page, undefined, false);
			pos4 = this.ConvertCoordsToCursorWR(_rect2.X + _rect2.W, _rect2.Y + _rect2.H, _rect2.Page, undefined, false);

			ctx.strokeStyle = "#1B63BA";

			ctx.moveTo(pos1.X >> 0, pos1.Y >> 0);
			ctx.lineTo(pos2.X >> 0, pos2.Y >> 0);

			ctx.moveTo(pos3.X >> 0, pos3.Y >> 0);
			ctx.lineTo(pos4.X >> 0, pos4.Y >> 0);

			ctx.lineWidth = 2;
			ctx.stroke();

			/*
			 ctx.beginPath();

			 ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
			 overlay.AddEllipse(pos1.X, pos1.Y - 5, 6.5);
			 overlay.AddEllipse(pos4.X, pos4.Y + 5, 6.5);
			 ctx.fill();

			 ctx.beginPath();

			 ctx.fillStyle = "#FFFFFF";
			 overlay.AddEllipse(pos1.X, pos1.Y - 5, 6);
			 overlay.AddEllipse(pos4.X, pos4.Y + 5, 6);
			 ctx.fill();
			 */

			ctx.beginPath();

			ctx.fillStyle = "#1B63BA";
			overlay.AddEllipse(pos1.X, pos1.Y - 5, 5);
			overlay.AddEllipse(pos4.X, pos4.Y + 5, 5);
			ctx.fill();
		}
		else
		{
			var _xx11 = _matrix.TransformPointX(_rect1.X, _rect1.Y);
			var _yy11 = _matrix.TransformPointY(_rect1.X, _rect1.Y);

			var _xx12 = _matrix.TransformPointX(_rect1.X, _rect1.Y + _rect1.H);
			var _yy12 = _matrix.TransformPointY(_rect1.X, _rect1.Y + _rect1.H);

			var _xx21 = _matrix.TransformPointX(_rect2.X + _rect2.W, _rect2.Y);
			var _yy21 = _matrix.TransformPointY(_rect2.X + _rect2.W, _rect2.Y);

			var _xx22 = _matrix.TransformPointX(_rect2.X + _rect2.W, _rect2.Y + _rect2.H);
			var _yy22 = _matrix.TransformPointY(_rect2.X + _rect2.W, _rect2.Y + _rect2.H);

			pos1 = this.ConvertCoordsToCursorWR(_xx11, _yy11, _rect1.Page, undefined, false);
			pos2 = this.ConvertCoordsToCursorWR(_xx12, _yy12, _rect1.Page, undefined, false);

			pos3 = this.ConvertCoordsToCursorWR(_xx21, _yy21, _rect2.Page, undefined, false);
			pos4 = this.ConvertCoordsToCursorWR(_xx22, _yy22, _rect2.Page, undefined, false);

			ctx.strokeStyle = "#1B63BA";

			ctx.moveTo(pos1.X, pos1.Y);
			ctx.lineTo(pos2.X, pos2.Y);

			ctx.moveTo(pos3.X, pos3.Y);
			ctx.lineTo(pos4.X, pos4.Y);

			ctx.lineWidth = 2;
			ctx.stroke();

			/*
			 ctx.beginPath();

			 ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
			 overlay.AddEllipse(pos1.X, pos1.Y - 5, 6.5);
			 overlay.AddEllipse(pos4.X, pos4.Y + 5, 6.5);
			 ctx.fill();

			 ctx.beginPath();

			 ctx.fillStyle = "#FFFFFF";
			 overlay.AddEllipse(pos1.X, pos1.Y - 5, 6);
			 overlay.AddEllipse(pos4.X, pos4.Y + 5, 6);
			 ctx.fill();
			 */

			ctx.beginPath();

			ctx.fillStyle = "#1B63BA";
			overlay.AddEllipse(pos1.X, pos1.Y - 5, 5);
			overlay.AddEllipse(pos4.X, pos4.Y + 5, 5);
			ctx.fill();
		}
	};

	this.SelectShow = function ()
	{
		this.m_oWordControl.OnUpdateOverlay();
	};

    this.OnUpdateOverlay = function ()
    {
        this.m_oWordControl.OnUpdateOverlay();
    };

	this.Set_RulerState_Start = function ()
	{
		this.UpdateRulerStateFlag = true;
	};
	this.Set_RulerState_End = function ()
	{
		if (this.UpdateRulerStateFlag)
		{
			this.UpdateRulerStateFlag = false;
			if (this.UpdateRulerStateParams.length > 0)
			{
				switch (this.UpdateRulerStateParams[0])
				{
					case 0:
					{
						this.Set_RulerState_Table(this.UpdateRulerStateParams[1],
							this.UpdateRulerStateParams[2]);
						break;
					}
					case 1:
					{
						this.Set_RulerState_Paragraph(this.UpdateRulerStateParams[1],
							this.UpdateRulerStateParams[2]);
						break;
					}
					case 2:
					{
						this.Set_RulerState_HdrFtr(this.UpdateRulerStateParams[1],
							this.UpdateRulerStateParams[2],
							this.UpdateRulerStateParams[3]);
						break;
					}
					case 3:
					{
						this.Set_RulerState_Columns(this.UpdateRulerStateParams[1]);
						break;
					}
					default:
						break;
				}

				this.UpdateRulerStateParams = [];
			}
		}
	};

	this.Set_RulerState_Table = function (markup, transform)
	{
		if (this.UpdateRulerStateFlag)
		{
			this.UpdateRulerStateParams.splice(0, this.UpdateRulerStateParams.length);
			this.UpdateRulerStateParams.push(0);
			this.UpdateRulerStateParams.push(markup);
			this.UpdateRulerStateParams.push(transform);
			return;
		}

		this.FrameRect.IsActive = false;

		var hor_ruler = this.m_oWordControl.m_oHorRuler;
		var ver_ruler = this.m_oWordControl.m_oVerRuler;

		hor_ruler.CurrentObjectType = RULER_OBJECT_TYPE_TABLE;
		hor_ruler.m_oTableMarkup = markup.CreateDublicate();

		ver_ruler.CurrentObjectType = RULER_OBJECT_TYPE_TABLE;
		ver_ruler.m_oTableMarkup = markup.CreateDublicate();

		this.TableOutlineDr.TableMatrix = null;
		this.TableOutlineDr.CurrentPageIndex = this.m_lCurrentPage;
		if (transform)
		{
			hor_ruler.m_oTableMarkup.TransformX = transform.tx;
			hor_ruler.m_oTableMarkup.TransformY = transform.ty;

			ver_ruler.m_oTableMarkup.TransformX = transform.tx;
			ver_ruler.m_oTableMarkup.TransformY = transform.ty;

			hor_ruler.m_oTableMarkup.CorrectFrom();
			ver_ruler.m_oTableMarkup.CorrectFrom();

			this.TableOutlineDr.TableMatrix = transform.CreateDublicate();
		}

		hor_ruler.CalculateMargins();

		if (0 <= this.m_lCurrentPage && this.m_lCurrentPage < this.m_lPagesCount)
		{
			hor_ruler.CreateBackground(this.m_arrPages[this.m_lCurrentPage]);
			ver_ruler.CreateBackground(this.m_arrPages[this.m_lCurrentPage]);
		}

		this.m_oWordControl.UpdateHorRuler();
		this.m_oWordControl.UpdateVerRuler();

		if (this.m_oWordControl.MobileTouchManager)
		{
			this.m_oWordControl.MobileTouchManager.TableStartTrack_Check = true;
			markup.Table.StartTrackTable();
			this.m_oWordControl.MobileTouchManager.TableStartTrack_Check = false;
		}
	};

	this.Set_RulerState_Paragraph = function (margins, isCanTrackMargins)
	{
		if (this.UpdateRulerStateFlag)
		{
			this.UpdateRulerStateParams.splice(0, this.UpdateRulerStateParams.length);
			this.UpdateRulerStateParams.push(1);
			this.UpdateRulerStateParams.push(margins);
			this.UpdateRulerStateParams.push(isCanTrackMargins);
			return;
		}

		if (margins && margins.Frame !== undefined)
		{
			var bIsUpdate = false;

			if (!this.FrameRect.IsActive)
				bIsUpdate = true;

			if (!bIsUpdate)
			{
				if (this.FrameRect.Rect.X != margins.L ||
					this.FrameRect.Rect.Y != margins.T ||
					this.FrameRect.Rect.R != margins.R ||
					this.FrameRect.Rect.B != margins.B ||
					this.FrameRect.PageIndex != margins.PageIndex)
				{
					bIsUpdate = true;
				}
			}

			this.FrameRect.IsActive = true;
			this.FrameRect.Rect.X = margins.L;
			this.FrameRect.Rect.Y = margins.T;
			this.FrameRect.Rect.R = margins.R;
			this.FrameRect.Rect.B = margins.B;
			this.FrameRect.PageIndex = margins.PageIndex;
			this.FrameRect.Frame = margins.Frame;

			if (bIsUpdate)
			{
				if (this.m_oWordControl.m_oOverlay.HtmlElement.style.display != "block")
					this.m_oWordControl.ShowOverlay();

				this.m_oWordControl.OnUpdateOverlay();
			}
		}
		else
		{
			if (this.FrameRect.IsActive)
			{
				if (this.m_oWordControl.m_oOverlay.HtmlElement.style.display != "block")
					this.m_oWordControl.ShowOverlay();

				this.FrameRect.IsActive = false;
				this.m_oWordControl.OnUpdateOverlay();
			}
			else
				this.FrameRect.IsActive = false;
		}

		var hor_ruler = this.m_oWordControl.m_oHorRuler;
		var ver_ruler = this.m_oWordControl.m_oVerRuler;

		if (hor_ruler.CurrentObjectType == RULER_OBJECT_TYPE_PARAGRAPH && ver_ruler.CurrentObjectType == RULER_OBJECT_TYPE_PARAGRAPH)
		{
			if ((margins && !hor_ruler.IsCanMoveMargins) || (!margins && hor_ruler.IsCanMoveMargins))
			{
				var bIsNeedUpdate = false;
				if (margins && this.LastParagraphMargins)
				{
					if (margins.L != this.LastParagraphMargins.L ||
						margins.T != this.LastParagraphMargins.T ||
						margins.R != this.LastParagraphMargins.R ||
						margins.B != this.LastParagraphMargins.B)
					{
						bIsNeedUpdate = true;
					}
				}

				if (!bIsNeedUpdate)
					return;
			}
		}

		hor_ruler.CurrentObjectType = RULER_OBJECT_TYPE_PARAGRAPH;
		hor_ruler.m_oTableMarkup = null;
		hor_ruler.m_oColumnMarkup = null;

		ver_ruler.CurrentObjectType = RULER_OBJECT_TYPE_PARAGRAPH;
		ver_ruler.m_oTableMarkup = null;

		// вообще надо посмотреть... может и был параграф до этого.
		// тогда вэкграунд перерисовывать не нужно. Только надо знать, на той же странице это было или нет
		if (-1 != this.m_lCurrentPage && this.m_arrPages[this.m_lCurrentPage])
		{
			if (margins)
			{
				var cachedPage = {};
				cachedPage.width_mm = this.m_arrPages[this.m_lCurrentPage].width_mm;
				cachedPage.height_mm = this.m_arrPages[this.m_lCurrentPage].height_mm;

				cachedPage.margin_left = margins.L;
				cachedPage.margin_top = margins.T;
				cachedPage.margin_right = margins.R;
				cachedPage.margin_bottom = margins.B;

				hor_ruler.CreateBackground(cachedPage);
				ver_ruler.CreateBackground(cachedPage);

				// disable margins
				if (true !== isCanTrackMargins)
				{
					hor_ruler.IsCanMoveMargins = false;
					ver_ruler.IsCanMoveMargins = false;
				}
				else
				{
					hor_ruler.IsCanMoveMargins = true;
					ver_ruler.IsCanMoveMargins = true;
				}

				this.LastParagraphMargins = {};
				this.LastParagraphMargins.L = margins.L;
				this.LastParagraphMargins.T = margins.T;
				this.LastParagraphMargins.R = margins.R;
				this.LastParagraphMargins.B = margins.B;
			}
			else
			{
				hor_ruler.CreateBackground(this.m_arrPages[this.m_lCurrentPage]);
				ver_ruler.CreateBackground(this.m_arrPages[this.m_lCurrentPage]);

				// enable margins
				hor_ruler.IsCanMoveMargins = true;
				ver_ruler.IsCanMoveMargins = true;

				this.LastParagraphMargins = null;
			}
		}

		this.m_oWordControl.UpdateHorRuler();
		this.m_oWordControl.UpdateVerRuler();
	};

	this.Set_RulerState_Columns = function (markup)
	{
		if (this.UpdateRulerStateFlag)
		{
			this.UpdateRulerStateParams.splice(0, this.UpdateRulerStateParams.length);
			this.UpdateRulerStateParams.push(3);
			this.UpdateRulerStateParams.push(markup);
			return;
		}

		this.FrameRect.IsActive = false;

		var hor_ruler = this.m_oWordControl.m_oHorRuler;
		var ver_ruler = this.m_oWordControl.m_oVerRuler;

		hor_ruler.CurrentObjectType = RULER_OBJECT_TYPE_COLUMNS;
		hor_ruler.m_oTableMarkup = null;
		hor_ruler.m_oColumnMarkup = markup.CreateDuplicate();

		ver_ruler.CurrentObjectType = RULER_OBJECT_TYPE_PARAGRAPH;
		ver_ruler.m_oTableMarkup = null;

		this.TableOutlineDr.TableMatrix = null;
		this.TableOutlineDr.CurrentPageIndex = this.m_lCurrentPage;

		hor_ruler.CalculateMargins();

		if (0 <= this.m_lCurrentPage && this.m_lCurrentPage < this.m_lPagesCount)
		{
			hor_ruler.CreateBackground(this.m_arrPages[this.m_lCurrentPage]);
			ver_ruler.CreateBackground(this.m_arrPages[this.m_lCurrentPage]);
		}

		this.m_oWordControl.UpdateHorRuler();
		this.m_oWordControl.UpdateVerRuler();
	};

	this.Set_RulerState_HdrFtr = function (bHeader, Y0, Y1)
	{
		if (this.UpdateRulerStateFlag)
		{
			this.UpdateRulerStateParams.splice(0, this.UpdateRulerStateParams.length);
			this.UpdateRulerStateParams.push(2);
			this.UpdateRulerStateParams.push(bHeader);
			this.UpdateRulerStateParams.push(Y0);
			this.UpdateRulerStateParams.push(Y1);
			return;
		}

		this.FrameRect.IsActive = false;

		var hor_ruler = this.m_oWordControl.m_oHorRuler;
		var ver_ruler = this.m_oWordControl.m_oVerRuler;

		hor_ruler.CurrentObjectType = RULER_OBJECT_TYPE_PARAGRAPH;
		hor_ruler.m_oTableMarkup = null;
		hor_ruler.m_oColumnMarkup = null;

		ver_ruler.CurrentObjectType = (true === bHeader) ? RULER_OBJECT_TYPE_HEADER : RULER_OBJECT_TYPE_FOOTER;
		ver_ruler.header_top = Y0;
		ver_ruler.header_bottom = Y1;
		ver_ruler.m_oTableMarkup = null;

		// вообще надо посмотреть... может и бал параграф до этого.
		// тогда вэкграунд перерисовывать не нужно. Только надо знать, на той же странице это было или нет
		if (-1 != this.m_lCurrentPage)
		{
			hor_ruler.CreateBackground(this.m_arrPages[this.m_lCurrentPage]);
			ver_ruler.CreateBackground(this.m_arrPages[this.m_lCurrentPage]);
		}

		this.m_oWordControl.UpdateHorRuler();
		this.m_oWordControl.UpdateVerRuler();
	};

	this.Update_MathTrack = function (IsActive, IsContentActive, oMath)
	{
		var PixelError = this.GetMMPerDot(1) * 3;
		this.MathTrack.Update(IsActive, IsContentActive, oMath, PixelError);
	};

	this.Update_FieldTrack = function (IsActive, aRects)
	{
		this.FieldTrack.IsActive = IsActive;

		if (true === IsActive)
			this.FieldTrack.Rects = aRects;
		else
			this.FieldTrack.Rects = [];
	};

	this.Update_ParaTab = function (Default_Tab, ParaTabs)
	{
		var hor_ruler = this.m_oWordControl.m_oHorRuler;

		var __tabs = ParaTabs.Tabs;
		if (undefined === __tabs)
			__tabs = ParaTabs;

		var _len = __tabs.length;
		if ((Default_Tab == hor_ruler.m_dDefaultTab) && (hor_ruler.m_arrTabs.length == _len) && (_len == 0))
		{
			// потом можно и проверить сами табы
			return;
		}

		hor_ruler.m_dDefaultTab = Default_Tab;
		hor_ruler.m_arrTabs = [];
		var _ar = hor_ruler.m_arrTabs;

		for (var i = 0; i < _len; i++)
		{
			if (__tabs[i].Value == tab_Left || __tabs[i].Value == tab_Center || __tabs[i].Value == tab_Right)
				_ar[i] = new CTab(__tabs[i].Pos, __tabs[i].Value, __tabs[i].Leader);
			else
			{
				// не должно такого быть. но приходит
				_ar[i] = new CTab(__tabs[i].Pos, tab_Left, __tabs[i].Leader);
			}
		}

		hor_ruler.CorrectTabs();
		this.m_oWordControl.UpdateHorRuler();
	};

	this.CorrectRulerPosition = function (pos)
	{
		if (AscCommon.global_keyboardEvent.AltKey)
			return pos;

		return ((pos / 2.5 + 0.5) >> 0) * 2.5;
	};

	this.UpdateTableRuler = function (isCols, index, position)
	{
		var dKoef_mm_to_pix = g_dKoef_mm_to_pix * this.m_oWordControl.m_nZoomValue / 100;
		if (false === isCols)
		{
			var markup = this.m_oWordControl.m_oVerRuler.m_oTableMarkup;
			if (markup == null)
				return;

			position += markup.TransformY;
			if (0 == index)
			{
				var delta = position - markup.Rows[0].Y;
				markup.Rows[0].Y = position;
				markup.Rows[0].H -= delta;
			}
			else
			{
				var delta = (markup.Rows[index - 1].Y + markup.Rows[index - 1].H) - position;

				markup.Rows[index - 1].H -= delta;

				if (index != markup.Rows.length)
				{
					markup.Rows[index].Y -= delta;
					markup.Rows[index].H += delta;
				}
			}

			if ("none" == this.m_oWordControl.m_oOverlay.HtmlElement.style.display)
				this.m_oWordControl.ShowOverlay();

			this.m_oWordControl.UpdateVerRulerBack();
			this.m_oWordControl.m_oOverlayApi.HorLine(this.m_arrPages[this.m_lCurrentPage].drawingPage.top + position * dKoef_mm_to_pix);
		}
		else
		{
			var markup = this.m_oWordControl.m_oHorRuler.m_oTableMarkup;
			if (markup == null)
				return;

			position += markup.TransformX;

			if (0 == index)
			{
				var _add = markup.X - position;
				markup.X = position;
				if (markup.Cols.length > 0)
					markup.Cols[0] += _add;
			}
			else
			{
				var _start = markup.X;
				for (var i = 0; i < (index - 1); i++)
				{
					_start += markup.Cols[i];
				}

				var _old = markup.Cols[index - 1];
				markup.Cols[index - 1] = position - _start;

				if (index != markup.Cols.length)
				{
					markup.Cols[index] += (_old - markup.Cols[index - 1]);
				}
			}

			if ("none" == this.m_oWordControl.m_oOverlay.HtmlElement.style.display)
				this.m_oWordControl.ShowOverlay();

			this.m_oWordControl.UpdateHorRulerBack();
			this.m_oWordControl.m_oOverlayApi.VertLine(this.m_arrPages[this.m_lCurrentPage].drawingPage.left + position * dKoef_mm_to_pix);
		}
	};
	this.GetDotsPerMM = function (value)
	{
		return value * this.m_oWordControl.m_nZoomValue * g_dKoef_mm_to_pix / 100;
	};

	this.GetMMPerDot = function (value)
	{
		return value / this.GetDotsPerMM(1);
	};
	this.GetVisibleMMHeight = function ()
	{
		var pixHeigth = this.m_oWordControl.m_oEditor.HtmlElement.height;
		pixHeigth /= AscCommon.AscBrowser.retinaPixelRatio;
		var pixBetweenPages = 20 * (this.m_lDrawingEnd - this.m_lDrawingFirst);

		return (pixHeigth - pixBetweenPages) * g_dKoef_pix_to_mm * 100 / this.m_oWordControl.m_nZoomValue;
	};

	// вот оооочень важная функция. она выкидывает из кэша неиспользуемые шрифты
	this.CheckFontCache = function ()
	{
		var map_used = this.m_oWordControl.m_oLogicDocument.Document_CreateFontMap();

		var _measure_map = g_oTextMeasurer.m_oManager.m_oFontsCache.Fonts;
		var _drawing_map = AscCommon.g_fontManager.m_oFontsCache.Fonts;

		var map_keys = {};
		var api = this.m_oWordControl.m_oApi;
		for (var i in map_used)
		{
			var key = AscFonts.GenerateMapId(api, g_fontApplication.GetFontInfoName(map_used[i].Name), map_used[i].Style, map_used[i].Size);
			map_keys[key] = true;
		}

		// а теперь просто пробегаем по кэшам и удаляем ненужное
		for (var i in _measure_map)
		{
			if (map_keys[i] == undefined)
			{
				//_measure_map[i] = undefined;
				delete _measure_map[i];
			}
		}
		for (var i in _drawing_map)
		{
			if (map_keys[i] == undefined)
			{
				//_drawing_map[i] = undefined;
				if (null != _drawing_map[i])
					_drawing_map[i].Destroy();
				delete _drawing_map[i];
			}
		}
	};

	// при загрузке документа - нужно понять какие шрифты используются
	this.CheckFontNeeds = function ()
	{
		var map_keys = this.m_oWordControl.m_oLogicDocument.Document_Get_AllFontNames();
		var dstfonts = [];
		for (var i in map_keys)
		{
			dstfonts[dstfonts.length] = new AscFonts.CFont(i, 0, "", 0, null);
		}
		AscFonts.FontPickerByCharacter.getFontsByString(AscCommon.translateManager.getValue("Heading" + " 123"));
        AscFonts.FontPickerByCharacter.extendFonts(dstfonts);
		this.m_oWordControl.m_oLogicDocument.Fonts = dstfonts;
		return;

		/*
		 var map_used = this.m_oWordControl.m_oLogicDocument.Document_CreateFontMap();

		 var map_keys = {};
		 for (var i in map_used)
		 {
		 var search = map_used[i];
		 var found = map_keys[search.Name];

		 var _need_style = 0;
		 switch (search.Style)
		 {
		 case FontStyle.FontStyleRegular:
		 {
		 _need_style = fontstyle_mask_regular;
		 break;
		 }
		 case FontStyle.FontStyleBold:
		 {
		 _need_style = fontstyle_mask_bold;
		 break;
		 }
		 case FontStyle.FontStyleItalic:
		 {
		 _need_style = fontstyle_mask_italic;
		 break;
		 }
		 case FontStyle.FontStyleBoldItalic:
		 {
		 _need_style = fontstyle_mask_bolditalic;
		 break;
		 }
		 default:
		 {
		 _need_style = fontstyle_mask_regular | fontstyle_mask_italic | fontstyle_mask_bold | fontstyle_mask_bolditalic;
		 break;
		 }
		 }

		 if (undefined === found)
		 {
		 map_keys[search.Name] = _need_style;
		 }
		 else
		 {
		 map_keys[search.Name] |= _need_style;
		 }
		 }

		 // теперь просто пробегаем и заполняем все объектами
		 var dstfonts = [];
		 for (var i in map_keys)
		 {
		 dstfonts[dstfonts.length] = new CFont(i, 0, "", 0, map_keys[i]);
		 }
		 this.m_oWordControl.m_oLogicDocument.Fonts = dstfonts;
		 */
	};

	// фукнции для старта работы
	this.OpenDocument = function ()
	{
		//SetHintsProps(false, false);
		this.m_oDocumentRenderer.InitDocument(this);

		this.m_oWordControl.CalculateDocumentSize();
		this.m_oWordControl.OnScroll();
	};

	// вот здесь весь трекинг
	this.DrawTrack = function (type, matrix, left, top, width, height, isLine, canRotate, isNoMove, isDrawHandles)
	{
		this.AutoShapesTrack.DrawTrack(type, matrix, left, top, width, height, isLine, canRotate, isNoMove, isDrawHandles);
	};

	this.DrawTrackSelectShapes = function (x, y, w, h)
	{
		this.AutoShapesTrack.DrawTrackSelectShapes(x, y, w, h);
	};

	this.DrawAdjustment = function (matrix, x, y, bTextWarp)
	{
		this.AutoShapesTrack.DrawAdjustment(matrix, x, y, bTextWarp);
	};

	this.LockTrackPageNum = function (nPageNum)
	{
		this.AutoShapesTrackLockPageNum = nPageNum;
	};
	this.UnlockTrackPageNum = function ()
	{
		this.AutoShapesTrackLockPageNum = -1;
	};

	this.CheckGuiControlColors = function ()
	{
		// потом реализовать проверку на то, что нужно ли посылать
		var _theme = this.m_oWordControl.m_oLogicDocument.theme;
		var _clrMap = this.m_oWordControl.m_oLogicDocument.clrSchemeMap.color_map;

		var arr_colors = new Array(10);
		var rgba = {R: 0, G: 0, B: 0, A: 255};
		// bg1,tx1,bg2,tx2,accent1 - accent6
		var array_colors_types = [6, 15, 7, 16, 0, 1, 2, 3, 4, 5];
		var _count = array_colors_types.length;

		var color = new AscFormat.CUniColor();
		color.color = new AscFormat.CSchemeColor();
		for (var i = 0; i < _count; ++i)
		{
			color.color.id = array_colors_types[i];
			color.Calculate(_theme, _clrMap, rgba);

			var _rgba = color.RGBA;
			arr_colors[i] = new CColor(_rgba.R, _rgba.G, _rgba.B);
		}

		// теперь проверим
		var bIsSend = false;
		if (this.GuiControlColorsMap != null)
		{
			for (var i = 0; i < _count; ++i)
			{
				var _color1 = this.GuiControlColorsMap[i];
				var _color2 = arr_colors[i];

				if ((_color1.r != _color2.r) || (_color1.g != _color2.g) || (_color1.b != _color2.b))
				{
					bIsSend = true;
					break;
				}
			}
		}
		else
		{
			this.GuiControlColorsMap = new Array(_count);
			bIsSend = true;
		}

		if (bIsSend)
		{
			for (var i = 0; i < _count; ++i)
			{
				this.GuiControlColorsMap[i] = arr_colors[i];
			}

			this.SendControlColors();
		}
	};

	this.SendControlColors = function ()
	{
		var standart_colors = null;
		if (!this.IsSendStandartColors)
		{
			var standartColors = AscCommon.g_oStandartColors;
			var _c_s = standartColors.length;
			standart_colors = new Array(_c_s);

			for (var i = 0; i < _c_s; ++i)
			{
				standart_colors[i] = new CColor(standartColors[i].R, standartColors[i].G, standartColors[i].B);
			}

			this.IsSendStandartColors = true;
		}

		var _count = this.GuiControlColorsMap.length;

		var _ret_array = new Array(_count * 6);
		var _cur_index = 0;

		for (var i = 0; i < _count; ++i)
		{
			var _color_src = this.GuiControlColorsMap[i];

			_ret_array[_cur_index] = new CColor(_color_src.r, _color_src.g, _color_src.b);
			_cur_index++;

			// теперь с модификаторами
			var _count_mods = 5;
			for (var j = 0; j < _count_mods; ++j)
			{
				var dst_mods = new AscFormat.CColorModifiers();
				dst_mods.Mods = AscCommon.GetDefaultMods(_color_src.r, _color_src.g, _color_src.b, j + 1, 1);

				var _rgba = {R: _color_src.r, G: _color_src.g, B: _color_src.b, A: 255};
				dst_mods.Apply(_rgba);

				_ret_array[_cur_index] = new CColor(_rgba.R, _rgba.G, _rgba.B);
				_cur_index++;
			}
		}

		this.m_oWordControl.m_oApi.sync_SendThemeColors(_ret_array, standart_colors);

		// regenerate styles
		if (null == this.m_oWordControl.m_oApi._gui_styles)
		{
			if (window["NATIVE_EDITOR_ENJINE"] === true)
			{
				if (!this.m_oWordControl.m_oApi.asc_checkNeedCallback("asc_onInitEditorStyles"))
					return;
			}
			var StylesPainter = new CStylesPainter();
			StylesPainter.GenerateStyles(this.m_oWordControl.m_oApi, this.m_oWordControl.m_oLogicDocument.Get_Styles().Style);
		}
	};

	this.DrawImageTextureFillShape = function (url)
	{
		if (this.GuiCanvasFillTexture == null)
		{
			this.InitGuiCanvasShape(this.GuiCanvasFillTextureParentId);
		}

		if (this.GuiCanvasFillTexture == null || this.GuiCanvasFillTextureCtx == null || url == this.LastDrawingUrl)
			return;

		this.LastDrawingUrl = url;
		var _width = this.GuiCanvasFillTexture.width;
		var _height = this.GuiCanvasFillTexture.height;

		this.GuiCanvasFillTextureCtx.clearRect(0, 0, _width, _height);

		if (null == this.LastDrawingUrl)
			return;

		var _img = this.m_oWordControl.m_oApi.ImageLoader.map_image_index[AscCommon.getFullImageSrc2(this.LastDrawingUrl)];
		if (_img != undefined && _img.Image != null && _img.Status != AscFonts.ImageLoadStatus.Loading)
		{
			var _x = 0;
			var _y = 0;
			var _w = Math.max(_img.Image.width, 1);
			var _h = Math.max(_img.Image.height, 1);

			var dAspect1 = _width / _height;
			var dAspect2 = _w / _h;

			_w = _width;
			_h = _height;
			if (dAspect1 >= dAspect2)
			{
				_w = dAspect2 * _height;
				_x = (_width - _w) / 2;
			}
			else
			{
				_h = _w / dAspect2;
				_y = (_height - _h) / 2;
			}

			this.GuiCanvasFillTextureCtx.drawImage(_img.Image, _x, _y, _w, _h);
		}
		else if (!_img || !_img.Image)
		{
			this.GuiCanvasFillTextureCtx.lineWidth = 1;

			this.GuiCanvasFillTextureCtx.beginPath();
			this.GuiCanvasFillTextureCtx.moveTo(0, 0);
			this.GuiCanvasFillTextureCtx.lineTo(_width, _height);
			this.GuiCanvasFillTextureCtx.moveTo(_width, 0);
			this.GuiCanvasFillTextureCtx.lineTo(0, _height);
			this.GuiCanvasFillTextureCtx.strokeStyle = "#FF0000";
			this.GuiCanvasFillTextureCtx.stroke();

			this.GuiCanvasFillTextureCtx.beginPath();
			this.GuiCanvasFillTextureCtx.moveTo(0, 0);
			this.GuiCanvasFillTextureCtx.lineTo(_width, 0);
			this.GuiCanvasFillTextureCtx.lineTo(_width, _height);
			this.GuiCanvasFillTextureCtx.lineTo(0, _height);
			this.GuiCanvasFillTextureCtx.closePath();

			this.GuiCanvasFillTextureCtx.strokeStyle = "#000000";
			this.GuiCanvasFillTextureCtx.stroke();
			this.GuiCanvasFillTextureCtx.beginPath();
		}
	};

	this.InitGuiCanvasShape = function (div_id)
	{
		if (null != this.GuiCanvasFillTexture)
		{
			var _div_elem = document.getElementById(this.GuiCanvasFillTextureParentId);
			if (_div_elem)
				_div_elem.removeChild(this.GuiCanvasFillTexture);

			this.GuiCanvasFillTexture = null;
			this.GuiCanvasFillTextureCtx = null;
		}

		this.GuiCanvasFillTextureParentId = div_id;
		var _div_elem = document.getElementById(this.GuiCanvasFillTextureParentId);
		if (!_div_elem)
			return;

		this.GuiCanvasFillTexture = document.createElement('canvas');
		this.GuiCanvasFillTexture.width = parseInt(_div_elem.style.width);
		this.GuiCanvasFillTexture.height = parseInt(_div_elem.style.height);

		this.LastDrawingUrl = "";
		this.GuiCanvasFillTextureCtx = this.GuiCanvasFillTexture.getContext('2d');

		_div_elem.appendChild(this.GuiCanvasFillTexture);
	};

	this.InitGuiCanvasTextProps = function (div_id)
	{
		var _div_elem = document.getElementById(div_id);
		if (null != this.GuiCanvasTextProps)
		{
			var elem = _div_elem.getElementsByTagName('canvas');
			if (elem.length == 0)
			{
				_div_elem.appendChild(this.GuiCanvasTextProps);
			}
			else
			{
				var _width = parseInt(_div_elem.offsetWidth);
				var _height = parseInt(_div_elem.offsetHeight);
				if (0 == _width)
					_width = 300;
				if (0 == _height)
					_height = 80;

				this.GuiCanvasTextProps.style.width = _width + "px";
				this.GuiCanvasTextProps.style.height = _height + "px";
			}

			var old_width = this.GuiCanvasTextProps.width;
			var old_height = this.GuiCanvasTextProps.height;
			AscCommon.calculateCanvasSize(this.GuiCanvasTextProps);

			if (old_width !== this.GuiCanvasTextProps.width || old_height !== this.GuiCanvasTextProps.height)
				this.GuiLastTextProps = null;
		}
		else
		{
			this.GuiCanvasTextProps = document.createElement('canvas');
			this.GuiCanvasTextProps.style.position = "absolute";
			this.GuiCanvasTextProps.style.left = "0px";
			this.GuiCanvasTextProps.style.top = "0px";

			var _width = parseInt(_div_elem.offsetWidth);
			var _height = parseInt(_div_elem.offsetHeight);
			if (0 == _width)
				_width = 300;
			if (0 == _height)
				_height = 80;

			this.GuiCanvasTextProps.style.width = _width + "px";
			this.GuiCanvasTextProps.style.height = _height + "px";

			AscCommon.calculateCanvasSize(this.GuiCanvasTextProps);

			_div_elem.appendChild(this.GuiCanvasTextProps);
		}
	};

	this.DrawGuiCanvasTextProps = function (props)
	{
		var bIsChange = false;
		if (null == this.GuiLastTextProps)
		{
			bIsChange = true;

			this.GuiLastTextProps = new Asc.asc_CParagraphProperty();

			this.GuiLastTextProps.Subscript = props.Subscript;
			this.GuiLastTextProps.Superscript = props.Superscript;
			this.GuiLastTextProps.SmallCaps = props.SmallCaps;
			this.GuiLastTextProps.AllCaps = props.AllCaps;
			this.GuiLastTextProps.Strikeout = props.Strikeout;
			this.GuiLastTextProps.DStrikeout = props.DStrikeout;

			this.GuiLastTextProps.TextSpacing = props.TextSpacing;
			this.GuiLastTextProps.Position = props.Position;
		}
		else
		{
			if (this.GuiLastTextProps.Subscript != props.Subscript)
			{
				this.GuiLastTextProps.Subscript = props.Subscript;
				bIsChange = true;
			}
			if (this.GuiLastTextProps.Superscript != props.Superscript)
			{
				this.GuiLastTextProps.Superscript = props.Superscript;
				bIsChange = true;
			}
			if (this.GuiLastTextProps.SmallCaps != props.SmallCaps)
			{
				this.GuiLastTextProps.SmallCaps = props.SmallCaps;
				bIsChange = true;
			}
			if (this.GuiLastTextProps.AllCaps != props.AllCaps)
			{
				this.GuiLastTextProps.AllCaps = props.AllCaps;
				bIsChange = true;
			}
			if (this.GuiLastTextProps.Strikeout != props.Strikeout)
			{
				this.GuiLastTextProps.Strikeout = props.Strikeout;
				bIsChange = true;
			}
			if (this.GuiLastTextProps.DStrikeout != props.DStrikeout)
			{
				this.GuiLastTextProps.DStrikeout = props.DStrikeout;
				bIsChange = true;
			}
			if (this.GuiLastTextProps.TextSpacing != props.TextSpacing)
			{
				this.GuiLastTextProps.TextSpacing = props.TextSpacing;
				bIsChange = true;
			}
			if (this.GuiLastTextProps.Position != props.Position)
			{
				this.GuiLastTextProps.Position = props.Position;
				bIsChange = true;
			}
		}

		if (undefined !== this.GuiLastTextProps.Position && isNaN(this.GuiLastTextProps.Position))
			this.GuiLastTextProps.Position = undefined;
		if (undefined !== this.GuiLastTextProps.TextSpacing && isNaN(this.GuiLastTextProps.TextSpacing))
			this.GuiLastTextProps.TextSpacing = undefined;

		if (!bIsChange)
			return;

		History.TurnOff();
		var _oldTurn = editor.isViewMode;
		editor.isViewMode = true;

		var par = new Paragraph(this, this.m_oWordControl.m_oLogicDocument);

		par.MoveCursorToStartPos();

		var _paraPr = new CParaPr();
		par.Pr = _paraPr;
		var _textPr = new CTextPr();
		_textPr.FontFamily = {Name: "Arial", Index: -1};
		_textPr.FontSize = (AscCommon.AscBrowser.convertToRetinaValue(11 << 1, true) >> 0) * 0.5;
		_textPr.RFonts.SetAll("Arial");

		_textPr.Strikeout = this.GuiLastTextProps.Strikeout;

		if (true === this.GuiLastTextProps.Subscript)
			_textPr.VertAlign = AscCommon.vertalign_SubScript;
		else if (true === this.GuiLastTextProps.Superscript)
			_textPr.VertAlign = AscCommon.vertalign_SuperScript;
		else
			_textPr.VertAlign = AscCommon.vertalign_Baseline;

		_textPr.DStrikeout = this.GuiLastTextProps.DStrikeout;
		_textPr.Caps = this.GuiLastTextProps.AllCaps;
		_textPr.SmallCaps = this.GuiLastTextProps.SmallCaps;

		_textPr.Spacing = this.GuiLastTextProps.TextSpacing;
		_textPr.Position = this.GuiLastTextProps.Position;

		var parRun = new ParaRun(par);
		parRun.Set_Pr(_textPr);
		parRun.AddText("Hello World");
		par.AddToContent(0, parRun);

		par.Reset(0, 0, 1000, 1000, 0, 0, 1);
		par.Recalculate_Page(0);

		var baseLineOffset = par.Lines[0].Y;
		var _bounds = par.Get_PageBounds(0);

		var ctx = this.GuiCanvasTextProps.getContext('2d');
		var _wPx = this.GuiCanvasTextProps.width;
		var _hPx = this.GuiCanvasTextProps.height;

		var _wMm = _wPx * g_dKoef_pix_to_mm;
		var _hMm = _hPx * g_dKoef_pix_to_mm;

		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(0, 0, _wPx, _hPx);

		var _pxBoundsW = par.Lines[0].Ranges[0].W * g_dKoef_mm_to_pix;//(_bounds.Right - _bounds.Left) * g_dKoef_mm_to_pix;
		var _pxBoundsH = (_bounds.Bottom - _bounds.Top) * g_dKoef_mm_to_pix;

		if (this.GuiLastTextProps.Position !== undefined && this.GuiLastTextProps.Position != null && this.GuiLastTextProps.Position != 0)
		{
			// TODO: нужна высота без учета Position
			// _pxBoundsH -= (this.GuiLastTextProps.Position * g_dKoef_mm_to_pix);
		}

		if (_pxBoundsH < _hPx && _pxBoundsW < _wPx)
		{
			// рисуем линию
			var _lineY = (((_hPx + _pxBoundsH) / 2) >> 0) + 0.5;
			var _lineW = (((_wPx - _pxBoundsW) / 4) >> 0);

			ctx.strokeStyle = "#000000";
			ctx.lineWidth = 1;

			ctx.beginPath();
			ctx.moveTo(0, _lineY);
			ctx.lineTo(_lineW, _lineY);

			ctx.moveTo(_wPx - _lineW, _lineY);
			ctx.lineTo(_wPx, _lineY);

			ctx.stroke();
			ctx.beginPath();
		}

		var _yOffset = (((_hPx + _pxBoundsH) / 2) - baseLineOffset * g_dKoef_mm_to_pix) >> 0;
		var _xOffset = ((_wPx - _pxBoundsW) / 2) >> 0;

		var graphics = new AscCommon.CGraphics();
		graphics.init(ctx, _wPx, _hPx, _wMm, _hMm);
		graphics.m_oFontManager = AscCommon.g_fontManager;

		graphics.m_oCoordTransform.tx = _xOffset;
		graphics.m_oCoordTransform.ty = _yOffset;

		graphics.transform(1, 0, 0, 1, 0, 0);

		var old_marks = this.m_oWordControl.m_oApi.ShowParaMarks;
		this.m_oWordControl.m_oApi.ShowParaMarks = false;
		par.Draw(0, graphics);
		this.m_oWordControl.m_oApi.ShowParaMarks = old_marks;

		History.TurnOn();
		editor.isViewMode = _oldTurn;
	};

	this.SetDrawImagePlaceContents = function(id, props)
	{
		var _div_elem = null;

		if (null == id || "" == id)
		{
			if ("" != this.GuiCanvasFillTOCParentId)
			{
				_div_elem = document.getElementById(this.GuiCanvasFillTOCParentId);

				if (this.GuiCanvasFillTOC && _div_elem)
					_div_elem.removeChild(this.GuiCanvasFillTOC);

				this.GuiCanvasFillTOCParentId = "";
				this.GuiCanvasFillTOC = null;
			}
			return;
		}

		if (id != this.GuiCanvasFillTOCParentId)
		{
			_div_elem = document.getElementById(this.GuiCanvasFillTOCParentId);

			if (this.GuiCanvasFillTOC && _div_elem)
				_div_elem.removeChild(this.GuiCanvasFillTOC);

			this.GuiCanvasFillTOCParentId = "";
			this.GuiCanvasFillTOC = null;
		}

		this.GuiCanvasFillTOCParentId = id;
		_div_elem =  document.getElementById(this.GuiCanvasFillTOCParentId);
		if (!_div_elem)
			return;

		var widthPx = _div_elem.offsetWidth;
		var heightPx = _div_elem.offsetHeight;

		if (null == this.GuiCanvasFillTOC)
		{
			this.GuiCanvasFillTOC = document.createElement('canvas');
			_div_elem.appendChild(this.GuiCanvasFillTOC);
		}

		// draw!
		var wPx = AscBrowser.convertToRetinaValue(widthPx, true);
		var hPx = AscBrowser.convertToRetinaValue(heightPx, true);
		var wMm = wPx * g_dKoef_pix_to_mm / AscCommon.AscBrowser.retinaPixelRatio;
		var hMm = hPx * g_dKoef_pix_to_mm / AscCommon.AscBrowser.retinaPixelRatio;

		var wPxOffset = AscBrowser.convertToRetinaValue(8, true);
		var wMmOffset = wPxOffset * g_dKoef_pix_to_mm / AscCommon.AscBrowser.retinaPixelRatio;

		this.GuiCanvasFillTOC.style.width = widthPx + "px";
		this.GuiCanvasFillTOC.width = wPx;

		History.TurnOff();

		var oLogicDocument = this.m_oWordControl.m_oLogicDocument;

		var bTrackRevisions = false;
		if (oLogicDocument.IsTrackRevisions())
		{
			bTrackRevisions = oLogicDocument.GetLocalTrackRevisions();
			oLogicDocument.SetLocalTrackRevisions(false);
		}

		var _oldTurn = editor.isViewMode;
		editor.isViewMode = true;

		var ctx = this.GuiCanvasFillTOC.getContext('2d');

		var old_marks = this.m_oWordControl.m_oApi.ShowParaMarks;
		this.m_oWordControl.m_oApi.ShowParaMarks = false;

		// content
		var oStyles        = oLogicDocument.GetStyles();

		var oHeader          = new CHeaderFooter(oLogicDocument.HdrFtr, oLogicDocument, this, AscCommon.hdrftr_Header);
		var oDocumentContent = oHeader.GetContent();

		var nOutlineStart = props.get_OutlineStart();
		var nOutlineEnd   = props.get_OutlineEnd();
		var nStylesType   = props.get_StylesType();
		var isShowPageNum = props.get_ShowPageNumbers();
		var isRightTab    = props.get_RightAlignTab();
		var nTabLeader    = props.get_TabLeader();

		if (undefined === nTabLeader || null === nTabLeader)
			nTabLeader = Asc.c_oAscTabLeader.Dot;


		var arrLevels         = [];
		var arrStylesToDelete = [];

		var nStyle, nStylesCount, nAddStyle, nAddStyleCount;
		var nLvl, sName, sStyleId, oStyle, isAddStyle;
		for (nStyle = 0, nStylesCount = props.get_StylesCount(); nStyle < nStylesCount; ++nStyle)
		{
			nLvl  = props.get_StyleLevel(nStyle) - 1;
			sName = props.get_StyleName(nStyle);

			if (!arrLevels[nLvl])
			{
				sStyleId = null;
				if (Asc.c_oAscTOCStylesType.Current === nStylesType)
				{
					sStyleId = oStyles.GetDefaultTOC(nLvl);
				}
				else
				{
					oStyle = new CStyle("", null, null, styletype_Paragraph, true);
					oStyle.CreateTOC(nLvl, nStylesType);
					sStyleId = oStyle.GetId();
					oStyles.Add(oStyle);
					arrStylesToDelete.push(oStyle.GetId());
				}
				arrLevels[nLvl] = {
					Styles  : [],
					StyleId : sStyleId
				};
			}

			isAddStyle = true;
			for (nAddStyle = 0, nAddStyleCount = arrLevels[nLvl].Styles.length; nAddStyle < nAddStyleCount; ++nAddStyle)
			{
				if (arrLevels[nLvl].Styles[nAddStyle] === sName)
				{
					isAddStyle = false;
					break;
				}
			}

			if (isAddStyle)
				arrLevels[nLvl].Styles.push(sName);
		}

		if (-1 !== nOutlineEnd && -1 !== nOutlineStart)
		{
			for (var _nLvl = nOutlineStart; _nLvl <= nOutlineEnd; ++_nLvl)
			{
				sName = "Heading " + _nLvl;
				nLvl  = _nLvl - 1;

				if (!arrLevels[nLvl])
				{
					sStyleId = null;
					if (Asc.c_oAscTOCStylesType.Current === nStylesType)
					{
						sStyleId = oStyles.GetDefaultTOC(nLvl);
					}
					else
					{
						oStyle = new CStyle("", null, null, styletype_Paragraph, true);
						oStyle.CreateTOC(nLvl, nStylesType);
						sStyleId = oStyle.GetId();
						oStyles.Add(oStyle);
						arrStylesToDelete.push(oStyle.GetId());
					}

					arrLevels[nLvl] = {
						Styles  : [],
						StyleId : sStyleId
					};
				}

				isAddStyle = true;
				for (nAddStyle = 0, nAddStyleCount = arrLevels[nLvl].Styles.length; nAddStyle < nAddStyleCount; ++nAddStyle)
				{
					if (arrLevels[nLvl].Styles[nAddStyle] === sName)
					{
						isAddStyle = false;
						break;
					}
				}

				if (isAddStyle)
					arrLevels[nLvl].Styles.push(sName);
			}
		}



		var oParaIndex = 0;
		var nPageIndex = 1;


		for (nLvl = 0; nLvl <= 8; ++nLvl)
		{
			if (!arrLevels[nLvl])
				continue;

			sStyleId = arrLevels[nLvl].StyleId;
			for (nStyle = 0, nStylesCount = arrLevels[nLvl].Styles.length; nStyle < nStylesCount; ++nStyle)
			{
				var sStyleName = AscCommon.translateManager.getValue(arrLevels[nLvl].Styles[nStyle]);

				var oParagraph = new Paragraph(this, oDocumentContent, false);
				oDocumentContent.AddToContent(oParaIndex++, oParagraph);
				oParagraph.SetParagraphStyleById(sStyleId);

				var oRun = new ParaRun(oParagraph, false);
				oParagraph.AddToContent(0, oRun);
				oRun.AddText(sStyleName);

				if (isShowPageNum)
				{
					if (isRightTab)
					{
						var oParaTabs = new CParaTabs();
						oParaTabs.Add(new CParaTab(tab_Right, wMm - 2 - wMmOffset, nTabLeader));
						oParagraph.SetParagraphTabs(oParaTabs);

						oRun.AddToContent(-1, new ParaTab());
					}
					else
					{
						oRun.AddToContent(-1, new ParaSpace());
					}

					oRun.AddText("" + nPageIndex);

					nPageIndex += 2;
				}
			}
		}

		oDocumentContent.Reset(1, 0, 1000, 10000);
		oDocumentContent.Recalculate_Page(0, true);

		for (nStyle = 0, nStylesCount = arrStylesToDelete.length; nStyle < nStylesCount; ++nStyle)
		{
			oStyles.Remove(arrStylesToDelete[nStyle]);
		}

		var nContentHeight = oDocumentContent.GetSummaryHeight();
		var nContentHeightPx = (AscCommon.AscBrowser.retinaPixelRatio * nContentHeight / g_dKoef_pix_to_mm) >> 0;

		if (nContentHeightPx > hPx)
		{
			hPx = nContentHeightPx;
			hMm = nContentHeight;
		}

		this.GuiCanvasFillTOC.style.height = AscBrowser.convertToRetinaValue(hPx, false) + "px";
		this.GuiCanvasFillTOC.height = hPx;

		var ctx = this.GuiCanvasFillTOC.getContext('2d');

		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(0, 0, wPx, hPx);

		var graphics = new AscCommon.CGraphics();
		graphics.init(ctx, wPx, hPx, wMm, hMm);
		graphics.m_oFontManager = AscCommon.g_fontManager;
		graphics.m_oCoordTransform.tx = graphics.m_oCoordTransform.ty = wPxOffset;
		graphics.transform(1, 0, 0, 1, 0, 0);
		oDocumentContent.Draw(0, graphics);

		this.m_oWordControl.m_oApi.ShowParaMarks = old_marks;

		History.TurnOn();

		if (false !== bTrackRevisions)
			oLogicDocument.SetLocalTrackRevisions(bTrackRevisions);

		editor.isViewMode = _oldTurn;
	};

	this.GetTOC_Buttons = function(idDiv1, idDiv2)
	{
		var div1 = document.getElementById(idDiv1);
		var div2 = document.getElementById(idDiv2);

		var canvas1 = div1.childNodes[0];
		var canvas2 = div2.childNodes[0];
		var isAdd = false;

		if (!canvas1 || !canvas2)
		{
			canvas1 && div1.removeChild(canvas1);
			canvas2 && div1.removeChild(canvas2);

			canvas1 = document.createElement("canvas");
			canvas2 = document.createElement("canvas");

			canvas1.style.margins = canvas2.style.margins = "0px";
			canvas1.style.padding = canvas2.style.padding = "0px";

			isAdd = true;
		}

		var scaleAttribute = AscCommon.AscBrowser.retinaPixelRatio;
		var scaleAttributeText = "" + ((scaleAttribute * 100) >> 0);

		if (canvas1.scaleAttributeText === scaleAttributeText && canvas2.scaleAttributeText === scaleAttributeText)
		{
			// уже рисовали и ничего не изменилось
			return;
		}

		canvas1.scaleAttributeText = scaleAttributeText;
		canvas2.scaleAttributeText = scaleAttributeText;

		var pixW = 248;
		var pixW_natural = AscCommon.AscBrowser.convertToRetinaValue(pixW, true);
		var pixH = 0;
		var pixH_natural = 0;

		var mmW = pixW_natural * g_dKoef_pix_to_mm / AscCommon.AscBrowser.retinaPixelRatio;
		var mmH = pixH_natural * g_dKoef_pix_to_mm / AscCommon.AscBrowser.retinaPixelRatio;

		var wPxOffset = AscBrowser.convertToRetinaValue(8, true);
		var wMmOffset = wPxOffset * g_dKoef_pix_to_mm / AscCommon.AscBrowser.retinaPixelRatio;

		var oLogicDocument = this.m_oWordControl.m_oLogicDocument;
		var oStyles        = oLogicDocument.GetStyles();

		// off
		History.TurnOff();

		var oldTrack = false;
		if (oLogicDocument.IsTrackRevisions())
		{
			oldTrack = oLogicDocument.GetLocalTrackRevisions();
			oLogicDocument.SetLocalTrackRevisions(false);
		}

		var oldTurn = editor.isViewMode;
		editor.isViewMode = true;

		var oldMarks = this.m_oWordControl.m_oApi.ShowParaMarks;
		this.m_oWordControl.m_oApi.ShowParaMarks = false;

		var props = [
			{
				OutlineStart : 1,
				OutlineEnd : 3,
				Hyperlink : false,
				StylesType : Asc.c_oAscTOCStylesType.Simple,
				RightTab : true,
				PageNumbers : true,
				TabLeader : Asc.c_oAscTabLeader.Dot,
				Pages : [2, 5, 15]
			},
			{
				OutlineStart : 1,
				OutlineEnd : 3,
				Hyperlink : true,
				StylesType : Asc.c_oAscTOCStylesType.Web,
				RightTab : true,
				PageNumbers : false,
				TabLeader : Asc.c_oAscTabLeader.None
			}
		];

		for (var i = 0; i < 2; i++)
		{
			// content
			var oStyles        = oLogicDocument.GetStyles();

			var oHeader          = new CHeaderFooter(oLogicDocument.HdrFtr, oLogicDocument, this, AscCommon.hdrftr_Header);
			var oDocumentContent = oHeader.GetContent();

			var arrLevels         = [];
			var arrStylesToDelete = [];
			var prop = props[i];

			for (var nCurrentLevel = prop.OutlineStart; nCurrentLevel <= prop.OutlineEnd; ++nCurrentLevel)
			{
				var sName = "Heading " + nCurrentLevel;
				var nLvl  = nCurrentLevel - 1;

				var oStyle = new CStyle("", null, null, styletype_Paragraph, true);
				oStyle.CreateTOC(nLvl, prop.StylesType);

				oStyle.ParaPr.Spacing.Line = 1.2;
				oStyle.ParaPr.Spacing.LineRule = linerule_Auto;
				oStyle.ParaPr.Spacing.Before = 0;
				oStyle.ParaPr.Spacing.After = 0;
				oStyle.ParaPr.ContextualSpacing = true;
				
				oStyle.ParaPr.Ind.Left = 15 * (nCurrentLevel - 1) * g_dKoef_pt_to_mm;

				oStyle.TextPr.FontFamily = {Name: "Arial", Index: -1};
				oStyle.TextPr.FontSize = 10;

				oStyles.Add(oStyle);

				arrLevels[nLvl] = {
					Styles  : [sName],
					StyleId : oStyle.GetId()
				};

				arrStylesToDelete.push(oStyle.GetId());
			}

			for (var nCurrentLevel = prop.OutlineStart; nCurrentLevel <= prop.OutlineEnd; ++nCurrentLevel)
			{
				var sStyleId = arrLevels[nCurrentLevel - 1].StyleId;
				for (var nStyle = 0, nStylesCount = arrLevels[nCurrentLevel - 1].Styles.length; nStyle < nStylesCount; ++nStyle)
				{
					var sStyleName = AscCommon.translateManager.getValue(arrLevels[nCurrentLevel - 1].Styles[nStyle]);

					var oParagraph = new Paragraph(this, oDocumentContent, false);
					oDocumentContent.AddToContent(nCurrentLevel - 1, oParagraph);
					oParagraph.SetParagraphStyleById(sStyleId);

					var oRun = new ParaRun(oParagraph, false);
					oParagraph.AddToContent(0, oRun);
					oRun.AddText(sStyleName);

					if (prop.PageNumbers)
					{
						if (prop.RightTab)
						{
							var oParaTabs = new CParaTabs();
							oParaTabs.Add(new CParaTab(tab_Right, mmW - 4 - wMmOffset, prop.TabLeader));
							oParagraph.SetParagraphTabs(oParaTabs);

							oRun.AddToContent(-1, new ParaTab());
						}
						else
						{
							oRun.AddToContent(-1, new ParaSpace());
						}

						oRun.AddText("" + prop.Pages[nCurrentLevel - 1]);
					}
				}
			}

			// удаляем последний параграф
			oDocumentContent.Content.splice(3, 1);
			oDocumentContent.Reset(1, 0, 1000, 10000);
			oDocumentContent.Recalculate_Page(0, true);

			for (nStyle = 0, nStylesCount = arrStylesToDelete.length; nStyle < nStylesCount; ++nStyle)
			{
				oStyles.Remove(arrStylesToDelete[nStyle]);
			}

			mmH = oDocumentContent.GetSummaryHeight() + (wMmOffset * 2);
			pixH = mmH / g_dKoef_pix_to_mm;
			pixH = ((pixH + 3) >> 2) << 2;
			pixH_natural = AscCommon.AscBrowser.convertToRetinaValue(pixH, true);

			var canvas = (i === 0) ? canvas1 : canvas2;

			canvas.style.width = pixW + "px";
			canvas.style.height = pixH + "px";

			canvas.width = pixW_natural;
			canvas.height = pixH_natural;

			var ctx = canvas.getContext('2d');

			ctx.fillStyle = "#FFFFFF";
			ctx.fillRect(0, 0, pixW_natural, pixH_natural);

			var graphics = new AscCommon.CGraphics();
			graphics.init(ctx, pixW_natural, pixH_natural, mmW, mmH);
			graphics.m_oFontManager = AscCommon.g_fontManager;
			graphics.m_oCoordTransform.tx = graphics.m_oCoordTransform.ty = wPxOffset;
			graphics.transform(1, 0, 0, 1, 0, 0);
			oDocumentContent.Draw(0, graphics);
		}

		this.m_oWordControl.m_oApi.ShowParaMarks = oldMarks;

		History.TurnOn();

		if (false !== oldTrack)
			oLogicDocument.SetLocalTrackRevisions(oldTrack);

		editor.isViewMode = oldTurn;

		if (isAdd)
		{
			div1.appendChild(canvas1);
			div2.appendChild(canvas2);
		}
	};

	this.SetDrawImagePlaceTableOfFigures = function(id, props)
	{
		var _div_elem = null;

		if (null == id || "" == id)
		{
			if ("" != this.GuiCanvasFillTOFParentId)
			{
				_div_elem = document.getElementById(this.GuiCanvasFillTOFParentId);

				if (this.GuiCanvasFillTOF && _div_elem)
					_div_elem.removeChild(this.GuiCanvasFillTOF);

				this.GuiCanvasFillTOFParentId = "";
				this.GuiCanvasFillTOF = null;
			}
			return;
		}

		if (id != this.GuiCanvasFillTOFParentId)
		{
			_div_elem = document.getElementById(this.GuiCanvasFillTOFParentId);

			if (this.GuiCanvasFillTOF && _div_elem)
				_div_elem.removeChild(this.GuiCanvasFillTOF);

			this.GuiCanvasFillTOFParentId = "";
			this.GuiCanvasFillTOF = null;
		}

		this.GuiCanvasFillTOFParentId = id;
		_div_elem =  document.getElementById(this.GuiCanvasFillTOFParentId);
		if (!_div_elem)
			return;

		var widthPx = _div_elem.offsetWidth;
		var heightPx = _div_elem.offsetHeight;

		if (null == this.GuiCanvasFillTOF)
		{
			this.GuiCanvasFillTOF = document.createElement('canvas');
			_div_elem.appendChild(this.GuiCanvasFillTOF);
		}

		// draw!
		var wPx = AscBrowser.convertToRetinaValue(widthPx, true);
		var hPx = AscBrowser.convertToRetinaValue(heightPx, true);
		var wMm = wPx * g_dKoef_pix_to_mm / AscCommon.AscBrowser.retinaPixelRatio;
		var hMm = hPx * g_dKoef_pix_to_mm / AscCommon.AscBrowser.retinaPixelRatio;

		var wPxOffset = AscBrowser.convertToRetinaValue(8, true);
		var wMmOffset = wPxOffset * g_dKoef_pix_to_mm / AscCommon.AscBrowser.retinaPixelRatio;

		this.GuiCanvasFillTOF.style.width = widthPx + "px";
		this.GuiCanvasFillTOF.width = wPx;

		History.TurnOff();
		var oLogicDocument = this.m_oWordControl.m_oLogicDocument;
		var _oldTurn = editor.isViewMode;
		editor.isViewMode = true;

		var bTrackRevisions = false;
		if (oLogicDocument.IsTrackRevisions())
		{
			bTrackRevisions = oLogicDocument.GetLocalTrackRevisions();
			oLogicDocument.SetLocalTrackRevisions(false);
		}

		var ctx = this.GuiCanvasFillTOF.getContext('2d');

		var old_marks = this.m_oWordControl.m_oApi.ShowParaMarks;
		this.m_oWordControl.m_oApi.ShowParaMarks = false;

		// content
		var oStyles        = oLogicDocument.GetStyles();

		var oHeader          = new CHeaderFooter(oLogicDocument.HdrFtr, oLogicDocument, this, AscCommon.hdrftr_Header);
		var oDocumentContent = oHeader.GetContent();


		var nStylesType   = props.get_StylesType();
		var isShowPageNum = props.get_ShowPageNumbers();
		var isRightTab    = props.get_RightAlignTab();
		var nTabLeader    = props.get_TabLeader();

		if (undefined === nTabLeader || null === nTabLeader)
			nTabLeader = Asc.c_oAscTabLeader.Dot;


		var sStyleId = null;
		var sStyleToDelete = null;
		var oStyle;
		if (Asc.c_oAscTOCStylesType.Current === nStylesType)
		{
			sStyleId = oStyles.GetDefaultTOF();
		}
		else
		{
			oStyle = new CStyle("", null, null, styletype_Paragraph, true);
			oStyle.CreateTOF(nStylesType);
			sStyleId = oStyle.GetId();
			oStyles.Add(oStyle);
			sStyleToDelete = oStyle.GetId();
		}

		var oParaIndex = 0;
		var nPageIndex = 1;


		var nCount = 5;
		var sCaption = props.get_Caption();
		if(!sCaption)
		{
			sCaption = AscCommon.translateManager.getValue("Caption");
		}
		var sText;
		var bIncludeLabel = props.get_IncludeLabelAndNumber();
		for (var nIndex = 0; nIndex < nCount; ++nIndex)
		{
			var oParagraph = new Paragraph(this, oDocumentContent, false);
			oDocumentContent.AddToContent(oParaIndex++, oParagraph);
			oParagraph.SetParagraphStyleById(sStyleId);

			var oRun = new ParaRun(oParagraph, false);
			oParagraph.AddToContent(0, oRun);
			if(bIncludeLabel)
			{
				sText = sCaption + " " + (nIndex + 1);
			}
			else
			{
				sText = sCaption = AscCommon.translateManager.getValue("Text") + " (" + (nIndex + 1) + ")"
			}
			oRun.AddText(sText);

			if (isShowPageNum)
			{
				if (isRightTab)
				{
					var oParaTabs = new CParaTabs();
					oParaTabs.Add(new CParaTab(tab_Right, wMm - 2 - wMmOffset, nTabLeader));
					oParagraph.SetParagraphTabs(oParaTabs);

					oRun.AddToContent(-1, new ParaTab());
				}
				else
				{
					oRun.AddToContent(-1, new ParaSpace());
				}
				oRun.AddText("" + nPageIndex);
				nPageIndex += 2;
			}
		}

		oDocumentContent.Reset(1, 0, wMm - 1, 10000);
		oDocumentContent.Recalculate_Page(0, true);

		if(sStyleToDelete)
		{
			oStyles.Remove(sStyleToDelete);
		}

		var nContentHeight = oDocumentContent.GetSummaryHeight();
		var nContentHeightPx = (AscCommon.AscBrowser.retinaPixelRatio * nContentHeight / g_dKoef_pix_to_mm) >> 0;

		if (nContentHeightPx > hPx)
		{
			hPx = nContentHeightPx;
			hMm = nContentHeight;
		}

		this.GuiCanvasFillTOF.style.height = AscBrowser.convertToRetinaValue(hPx, false) + "px";
		this.GuiCanvasFillTOF.height = hPx;

		var ctx = this.GuiCanvasFillTOF.getContext('2d');

		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(0, 0, wPx, hPx);

		var graphics = new AscCommon.CGraphics();
		graphics.init(ctx, wPx, hPx, wMm, hMm);
		graphics.m_oFontManager = AscCommon.g_fontManager;
		graphics.m_oCoordTransform.tx = graphics.m_oCoordTransform.ty = wPxOffset;
		graphics.transform(1, 0, 0, 1, 0, 0);
		oDocumentContent.Draw(0, graphics);

		this.m_oWordControl.m_oApi.ShowParaMarks = old_marks;

		History.TurnOn();

		if (false !== bTrackRevisions)
			oLogicDocument.SetLocalTrackRevisions(bTrackRevisions);

		editor.isViewMode = _oldTurn;
	};

	this.SetDrawImagePreviewMargins = function(id, props)
	{
        var parent =  document.getElementById(id);
        if (!parent)
            return;

        var width_px = parent.clientWidth;
        var height_px = parent.clientHeight;

        var canvas = parent.firstChild;
        if (!canvas)
		{
            canvas = document.createElement('canvas');
            canvas.style.cssText = "pointer-events: none;padding:0;margin:0;user-select:none;";
            canvas.style.width = width_px + "px";
            canvas.style.height = height_px + "px";
			if (width_px > 0 && height_px > 0)
            	parent.appendChild(canvas);
		}

		AscCommon.calculateCanvasSize(canvas, undefined, true);
        canvas.width = canvas.width;

        var ctx = canvas.getContext("2d");
        var rPR = AscCommon.AscBrowser.retinaPixelRatio;

        var offset = 10;
        var page_width_mm = props.W;
        var page_height_mm = props.H;

		var isMirror = props.MirrorMargins;
        var pageRects = [];

        var w_px = width_px - (offset << 1);
        var h_px = height_px - (offset << 1);

        var aspectParent = w_px / h_px;
        var aspectPage = page_width_mm / page_height_mm;
        if (!isMirror)
        {
            if (aspectPage > aspectParent)
            {
            	pageRects.push({X : offset, Y : 0, W : w_px, H : 0});
            	pageRects[0].H = (pageRects[0].W / aspectPage) >> 0;
            	pageRects[0].Y = offset + ((h_px - pageRects[0].H) >> 1);
            }
            else
			{
                pageRects.push({X : 0, Y : offset, W : 0, H : h_px});
                pageRects[0].W = (pageRects[0].H * aspectPage) >> 0;
                pageRects[0].X = offset + ((w_px - pageRects[0].W) >> 1);
			}
		}
		else
		{
			var w_px_2 = (w_px - offset) >> 1;
            aspectParent = w_px_2 / h_px;

            if (aspectPage > aspectParent)
            {
                pageRects.push({X : offset, Y : 0, W : w_px_2, H : 0});
                pageRects[0].H = (pageRects[0].W / aspectPage) >> 0;
                pageRects[0].Y = offset + ((h_px - pageRects[0].H) >> 1);

                pageRects.push({X : offset + ((w_px + offset) >> 1), Y : 0, W : w_px_2, H : 0});
                pageRects[1].H = pageRects[0].H;
                pageRects[1].Y = pageRects[0].Y;
            }
            else
            {
                pageRects.push({X : 0, Y : offset, W : 0, H : h_px});
                pageRects[0].W = (pageRects[0].H * aspectPage) >> 0;
                pageRects[0].X = offset + ((w_px_2 - pageRects[0].W) >> 1);

                pageRects.push({X : 0, Y : offset, W : 0, H : h_px});
                pageRects[1].W = pageRects[0].W;
                pageRects[1].X = offset + ((w_px + offset) >> 1) + ((w_px_2 - pageRects[0].W) >> 1);
            }
		}

		var gutterSize = (props.Gutter * pageRects[0].W / page_width_mm) >> 0;
        var gutterPos = 0; // left
		if (props.GutterRTL)
			gutterPos = 1;
		if (props.GutterAtTop)
			gutterPos = 2; // top
		if (isMirror)
			gutterPos = 1; // right

		ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#000000";
        var lineW = Math.round(rPR);
        ctx.lineWidth = lineW;
		var indent = 0.5 * Math.round(rPR);

		var __move = function(ctx, x, y, is_vert) {
			ctx.moveTo(((x * rPR) >> 0) + (is_vert ? indent : 0), ((y * rPR) >> 0) + (is_vert ? 0 : indent));
		};
		var __line = function(ctx, x, y, is_vert) {
			ctx.lineTo(((x * rPR) >> 0) + (is_vert ? indent : 0), ((y * rPR) >> 0) + (is_vert ? 0 : indent));
		};
		var __rect = function(ctx, x, y, w, h, indent) {
			indent = (undefined === indent) ? 0 : indent;
			ctx.rect(((x * rPR) >> 0) + indent, ((y * rPR) >> 0) + indent, (w * rPR) >> 0, (h * rPR) >> 0);
		};

        for (var page = 0; page < pageRects.length; page++)
		{
			// page
			ctx.beginPath();
			__rect(ctx, pageRects[page].X, pageRects[page].Y, pageRects[page].W, pageRects[page].H);
			ctx.fill();

			ctx.beginPath();
			__rect(ctx, pageRects[page].X, pageRects[page].Y, pageRects[page].W, pageRects[page].H, indent);
			ctx.stroke();
			ctx.beginPath();

			// gutter
			if (gutterSize > 0)
			{
                ctx.setLineDash([Math.round(2 * rPR), Math.round(2 * rPR)]);
                var gutterEvenOdd = 0;
				switch (gutterPos)
				{
					case 0:
					{
                        var x = pageRects[page].X;
						for (var i = 0; i < gutterSize; i += lineW)
						{
							ctx.moveTo(((x * rPR) >> 0) + i + indent, ((pageRects[page].Y + gutterEvenOdd) * rPR) >> 0);
							ctx.lineTo(((x * rPR) >> 0) + i + indent, ((pageRects[page].Y + pageRects[page].H) * rPR) >> 0);
                            ctx.stroke();
                            ctx.beginPath();
                            gutterEvenOdd = (0 === gutterEvenOdd) ? 2 : 0;
                        }
						break;
					}
					case 1:
					{
                        var x = pageRects[page].X + pageRects[page].W;
                        for (var i = 0; i < gutterSize; i += lineW)
                        {
							ctx.moveTo(((x * rPR) >> 0) - i - indent, ((pageRects[page].Y + gutterEvenOdd) * rPR) >> 0);
							ctx.lineTo(((x * rPR) >> 0) - i - indent, ((pageRects[page].Y + pageRects[page].H) * rPR) >> 0);
                            ctx.stroke();
                            ctx.beginPath();
                            gutterEvenOdd = (0 === gutterEvenOdd) ? 2 : 0;
                        }
						break;
					}
					case 2:
					{
                        var y = pageRects[page].Y;
                        for (var i = 0; i < gutterSize; i += lineW)
                        {
							ctx.moveTo(((pageRects[page].X + gutterEvenOdd) * rPR) >> 0, ((y * rPR) >> 0) + i + indent);
							ctx.lineTo(((pageRects[page].X + pageRects[page].W) * rPR) >> 0, ((y * rPR) >> 0) + i + indent);
                            ctx.stroke();
                            ctx.beginPath();
                            gutterEvenOdd = (0 === gutterEvenOdd) ? 2 : 0;
                        }
						break;
					}
					default:
						break;
				}
                ctx.setLineDash([]);
            }

            // text lines
			var left = props.Left;
			var top = props.Top;
			var right = props.Right;
			var bottom = props.Bottom;

			if (left < 0) left = -left;
            if (top < 0) top = -top;
            if (right < 0) right = -right;
            if (bottom < 0) bottom = -bottom;

			if (0 == page && isMirror)
			{
				var tmp = left;
				left = right;
				right = tmp;
			}

			switch (gutterPos)
			{
				case 0:
				{
					left += props.Gutter;
					break;
				}
				case 1:
				{
                    right += props.Gutter;
					break;
				}
				case 2:
				{
                    top += props.Gutter;
					break;
				}
				default:
					break;
			}

			var l = pageRects[page].X + ((left * pageRects[page].W / page_width_mm) >> 0);
            var t = pageRects[page].Y + ((top * pageRects[page].H / page_height_mm) >> 0);
            var r = pageRects[page].X + (pageRects[page].W - ((right * pageRects[page].W / page_width_mm) >> 0));
            var b = pageRects[page].Y + (pageRects[page].H - ((bottom * pageRects[page].H / page_height_mm) >> 0));

            if (l >= r || t >= b)
            	continue;

            var lf = l + (((r - l) / 8) >> 0);
            var rf = l + (((r - l) / 3) >> 0);

			l = (l * rPR) >> 0;
			r = (r * rPR) >> 0;
			b = (b * rPR) >> 0;
			lf = (lf * rPR) >> 0;
			rf = (rf * rPR) >> 0;
            var cur = ((t * rPR) >> 0) + indent;
            var cur_offset = 2 * lineW;
			var cur_offset_end = 6 * lineW;

            while (cur < b)
			{
				ctx.moveTo(lf, cur); ctx.lineTo(r, cur);

				cur += cur_offset;
				if (cur >= b) break;

				ctx.moveTo(l, cur); ctx.lineTo(r, cur);

                cur += cur_offset;
                if (cur >= b) break;

				ctx.moveTo(l, cur); ctx.lineTo(r, cur);

                cur += cur_offset;
                if (cur >= b) break;

				ctx.moveTo(l, cur); ctx.lineTo(rf, cur);

                cur += cur_offset_end;
			}
			ctx.stroke();
            ctx.beginPath();

            gutterPos = 0;
		}
	};

    this.privateGetParagraphByString = function(level, levelNum, counterCurrent, x, y, lineHeight, ctx, w, h)
    {
        var text = "";
        for (var i = 0; i < level.Text.length; i++)
        {
            switch (level.Text[i].Type)
            {
                case Asc.c_oAscNumberingLvlTextType.Text:
                    text += level.Text[i].Value;
                    break;
                case Asc.c_oAscNumberingLvlTextType.Num:
                    var correctNum = 1;
                    if (levelNum === level.Text[i].Value)
                        correctNum = counterCurrent;
                    text += AscCommon.IntToNumberFormat(correctNum, level.Format, level.get_OLang());
                    break;
                default:
                    break;
            }
        }

		var api            = this.m_oWordControl.m_oApi;
		var oLogicDocument = this.m_oWordControl.m_oLogicDocument;
		if (!api || !oLogicDocument)
			return;

		var oldViewMode = api.isViewMode;
        var oldMarks = api.ShowParaMarks;

        api.isViewMode = true;
        api.ShowParaMarks = false;

        var par = new Paragraph(this, this.m_oWordControl.m_oLogicDocument);
        par.MoveCursorToStartPos();

        //par.Pr = level.ParaPr.Copy();
		par.Pr = new CParaPr();
        var textPr = level.TextPr.Copy();
        textPr.FontSize = textPr.FontSizeCS = ((2 * lineHeight * 72 / 96) >> 0) / 2;

        var parRun = new ParaRun(par);
        parRun.Set_Pr(textPr);
        parRun.AddText(text);
        par.AddToContent(0, parRun);

        par.Reset(0, 0, 1000, 1000, 0, 0, 1);
        par.Recalculate_Page(0);
        par.LineNumbersInfo = null;

        var baseLineOffset = par.Lines[0].Y;
        var bounds = par.Get_PageBounds(0);

        var parW = par.Lines[0].Ranges[0].W * AscCommon.g_dKoef_mm_to_pix;
        var parH = (bounds.Bottom - bounds.Top) * AscCommon.g_dKoef_mm_to_pix;

        var yOffset = y - ((baseLineOffset * g_dKoef_mm_to_pix) >> 0);
        var xOffset = x;
        switch (level.Align)
        {
            case AscCommon.align_Right:
                xOffset -= parW;
                break;
            case AscCommon.align_Center:
                xOffset -= (parW >> 1);
                break;
            default:
                break;
        }

        // debug: text rect:
        //ctx.beginPath();
        //ctx.fillStyle = "#FFFF00";
        //ctx.fillRect(xOffset, y, parW, parH);
        //ctx.beginPath();

		var backTextWidth = parW + 4; // 4 - чтобы линия никогде не была 'совсем рядом'
		switch (level.Suff)
		{
			case Asc.c_oAscNumberingSuff.Space:
			case Asc.c_oAscNumberingSuff.None:
				backTextWidth += 4;
				break;
			case Asc.c_oAscNumberingSuff.Tab:
				break;
			default:
				break;
		}

        ctx.fillStyle = "#FFFFFF";
		var rPR = AscCommon.AscBrowser.retinaPixelRatio;
        ctx.fillRect(Math.round(rPR * xOffset), Math.round((y - lineHeight) * rPR), Math.round(backTextWidth * rPR), Math.round((lineHeight + (lineHeight >> 1)) * rPR));
        ctx.beginPath();

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        var graphics = new AscCommon.CGraphics();
        graphics.init(ctx,
			AscCommon.AscBrowser.convertToRetinaValue(w, true),
			AscCommon.AscBrowser.convertToRetinaValue(h, true),
			w * AscCommon.g_dKoef_pix_to_mm, h * AscCommon.g_dKoef_pix_to_mm);
        graphics.m_oFontManager = AscCommon.g_fontManager;

        graphics.m_oCoordTransform.tx = AscCommon.AscBrowser.convertToRetinaValue(xOffset, true);
        graphics.m_oCoordTransform.ty = AscCommon.AscBrowser.convertToRetinaValue(yOffset, true);

        graphics.transform(1, 0, 0, 1, 0, 0);

        par.Draw(0, graphics);

        ctx.restore();
        ctx.restore();

        api.isViewMode = oldViewMode;
        api.ShowParaMarks = oldMarks;
    };

	this.SetDrawImagePreviewBullet = function(id, props, level, is_multi_level, isNoCheckFonts)
	{
		if (!isNoCheckFonts)
		{
            // check need load fonts
            var fontsDict = {};
            for (var i = 0, count = props.Lvl.length; i < count; i++)
            {
                var curLvl = props.Lvl[i];
                var text = "";
                for (var j = 0; j < curLvl.Text.length; j++)
                {
                    switch (curLvl.Text[j].Type)
					{
                        case Asc.c_oAscNumberingLvlTextType.Text:
                            text += curLvl.Text[j].Value;
                            break;
                        case Asc.c_oAscNumberingLvlTextType.Num:
                            text += AscCommon.IntToNumberFormat(1, curLvl.Format, curLvl.get_OLang());
                            break;
                        default:
                            break;
                    }
                }
                AscFonts.FontPickerByCharacter.checkTextLight(text);

                if (curLvl.TextPr && curLvl.TextPr.RFonts)
                {
                    if (curLvl.TextPr.RFonts.Ascii) fontsDict[curLvl.TextPr.RFonts.Ascii.Name] = true;
                    if (curLvl.TextPr.RFonts.EastAsia) fontsDict[curLvl.TextPr.RFonts.EastAsia.Name] = true;
                    if (curLvl.TextPr.RFonts.HAnsi) fontsDict[curLvl.TextPr.RFonts.HAnsi.Name] = true;
                    if (curLvl.TextPr.RFonts.CS) fontsDict[curLvl.TextPr.RFonts.CS.Name] = true;
                }
            }

            var fonts = [];
            for (var familyName in fontsDict)
            {
                fonts.push(new AscFonts.CFont(AscFonts.g_fontApplication.GetFontInfoName(familyName), 0, "", 0, null));
            }
            AscFonts.FontPickerByCharacter.extendFonts(fonts);

            if (false === AscCommon.g_font_loader.CheckFontsNeedLoading(fonts))
            {
                return this.SetDrawImagePreviewBullet(id, props, level, is_multi_level, true);
            }

            this.m_oWordControl.m_oApi.asyncMethodCallback = function()
			{
                this.WordControl.m_oDrawingDocument.SetDrawImagePreviewBullet(id, props, level, is_multi_level, true);
            };
            AscCommon.g_font_loader.LoadDocumentFonts2(fonts);
            return;
        }

        var parent =  document.getElementById(id);
        if (!parent)
            return;

        var width_px = parent.clientWidth;
        var height_px = parent.clientHeight;

        var canvas = parent.firstChild;
        if (!canvas)
        {
            canvas = document.createElement('canvas');
            canvas.style.cssText = "padding:0;margin:0;user-select:none;";
            canvas.style.width = width_px + "px";
            canvas.style.height = height_px + "px";
			if (width_px > 0 && height_px > 0)
            	parent.appendChild(canvas);
        }

		AscCommon.calculateCanvasSize(canvas, undefined, true);
        canvas.width = canvas.width;

        var ctx = canvas.getContext("2d");
		var rPR = AscCommon.AscBrowser.retinaPixelRatio;

        canvas.is_multi_level = is_multi_level;
        canvas.level = level;

        AscCommon.addMouseEvent(canvas, "down", function(e) {
        	AscCommon.stopEvent(e);
        	if (true !== this.is_multi_level)
        		return;

            var offsetBase = 10;
            var line_w = 4;
            var height = parseInt(this.style.height);
            var line_distance = (((height - (offsetBase << 1)) - line_w * 10) / 9) >> 0;
            var offset = (height - (line_w * 10 + line_distance * 9)) >> 1;
            var current = this.currentLevel;

            var yPos = e.pageY;
            if (undefined === yPos)
                yPos = e.clientY;
            yPos = (yPos * AscCommon.AscBrowser.zoom);
            var clientRect = this.getBoundingClientRect();
            if (undefined != clientRect.y)
            	yPos -= clientRect.y;
            else if (undefined != clientRect.top)
            	yPos -= clientRect.top;

            var level = 8;
            var y = offset + 2;
            for (var i = 0; i < 9; i++)
            {
                y += (line_w + line_distance);
                if (i == current)
                    y += (line_w + line_distance);

                if (yPos < (y - ((line_w + line_distance) >> 1)))
                {
                    level = i;
                    break;
                }
            }
            editor.sendEvent("asc_onPreviewLevelChange", level);
        });

        var oDocState = null;
        if (this.m_oLogicDocument)
        	oDocState = this.m_oLogicDocument.StartNoHistoryMode();

        if (!is_multi_level)
        {
            var offsetBase = 10;
            var line_w = 4;
            // считаем расстояние между линиями
            var line_distance = (((height_px - (offsetBase << 1)) - line_w * 10) / 9) >> 0;
            // убираем погрешность в offset
            var offset = (height_px - (line_w * 10 + line_distance * 9)) >> 1;

            var textYs = [];

            ctx.lineWidth = 4 * Math.round(rPR);
            ctx.strokeStyle = "#CBCBCB";
            var y = offset + 2 + 2 * (line_w + line_distance);

			var text_base_offset_x = offset + (6.25 + (6.25 * (level + 1) * AscCommon.g_dKoef_mm_to_pix)) >> 0;
			if (text_base_offset_x > (width_px - offsetBase - 20))
				text_base_offset_x = width_px - offsetBase - 20;

			textYs.push(y + line_w); y += 2 * (line_w + line_distance);
			textYs.push(y + line_w); y += 2 * (line_w + line_distance);
			textYs.push(y + line_w);

			for (var i = 0; i < textYs.length; i++)
			{
				this.privateGetParagraphByString(props.Lvl[level], level, i + 1, (text_base_offset_x- ((6.25 * AscCommon.g_dKoef_mm_to_pix)) >> 0),
					textYs[i], line_distance, ctx, width_px, height_px);
			}

			y = Math.round((offset + 2) * rPR);
			var left_offset = Math.round(text_base_offset_x * rPR),
				right_offset = Math.round((width_px - offsetBase) * rPR),
				y_dist = Math.round((line_w + line_distance) * rPR);

			var left_offset2 = Math.round(offsetBase * rPR);
			var right_offset2 = Math.round((width_px - offsetBase) * rPR);

            ctx.moveTo(left_offset2, y); ctx.lineTo(right_offset2, y); y += y_dist;
            ctx.moveTo(left_offset2, y); ctx.lineTo(right_offset2, y); y += y_dist;
            ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle = "#000000";

            ctx.moveTo(left_offset, y); ctx.lineTo(right_offset, y); y += y_dist;
            ctx.moveTo(left_offset, y); ctx.lineTo(right_offset, y); y += y_dist;
            ctx.moveTo(left_offset, y); ctx.lineTo(right_offset, y); y += y_dist;
            ctx.moveTo(left_offset, y); ctx.lineTo(right_offset, y); y += y_dist;
            ctx.moveTo(left_offset, y); ctx.lineTo(right_offset, y); y += y_dist;
            ctx.moveTo(left_offset, y); ctx.lineTo(right_offset, y); y += y_dist;
            ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle = "#CBCBCB";
            ctx.moveTo(left_offset2, y); ctx.lineTo(right_offset2, y); y += y_dist;
            ctx.moveTo(left_offset2, y); ctx.lineTo(right_offset2, y);
            ctx.stroke();
            ctx.beginPath();
        }
        else
        {
            var offsetBase = 10;
            var line_w = 4;
            // считаем расстояние между линиями
            var line_distance = (((height_px - (offsetBase << 1)) - line_w * 10) / 9) >> 0;
            // убираем погрешность в offset
            var offset = (height_px - (line_w * 10 + line_distance * 9)) >> 1;
            var current = level;
            canvas.currentLevel = level;

            ctx.lineWidth = 4 * Math.round(rPR);
            ctx.strokeStyle = "#CBCBCB";
            var y = offset + 2;
            var text_base_offset_x = offset + ((6.25 * AscCommon.g_dKoef_mm_to_pix) >> 0);
            var text_base_offset_dist = (6.25 * AscCommon.g_dKoef_mm_to_pix) >> 0;

            var textYs = [];
            for (var i = 0; i < 9; i++)
			{
                textYs.push({x: text_base_offset_x - ((6.25 * AscCommon.g_dKoef_mm_to_pix) >> 0), y: y + line_w});
				if (i == current)
				{
					ctx.strokeStyle = "#000000";
                    ctx.moveTo(Math.round(text_base_offset_x * rPR), Math.round(y * rPR)); ctx.lineTo(Math.round((width_px - offsetBase) * rPR), Math.round(y * rPR)); y += (line_w + line_distance);
                    ctx.moveTo(Math.round(text_base_offset_x * rPR), Math.round(y * rPR)); ctx.lineTo(Math.round((width_px - offsetBase) * rPR), Math.round(y * rPR));
                    ctx.stroke();
                    ctx.strokeStyle = "#CBCBCB";
				}
				else
				{
                    ctx.moveTo(Math.round(text_base_offset_x * rPR), Math.round(y * rPR)); ctx.lineTo(Math.round((width_px - offsetBase) * rPR), Math.round(y * rPR));
                    ctx.stroke();
				}
				ctx.beginPath();

                text_base_offset_x += text_base_offset_dist;
                y += (line_w + line_distance);
			}

			for (var i = 0; i < 9; i++)
			{
                this.privateGetParagraphByString(props.Lvl[i], level, 1, textYs[i].x, textYs[i].y, line_distance, ctx, width_px, height_px);
            }
        }

        if (oDocState)
        	this.m_oLogicDocument.EndNoHistoryMode(oDocState);
	};

	this.SetDrawImagePreviewBulletChangeListLevel = function(id, props, isNoCheckFonts)
    {
        if (!isNoCheckFonts)
        {
            // check need load fonts
            var fontsDict = {};
            for (var i = 0, count = props.Lvl.length; i < count; i++)
            {
                var curLvl = props.Lvl[i];
                var text = "";
                for (var j = 0; j < curLvl.Text.length; j++)
                {
                    switch (curLvl.Text[j].Type)
                    {
                        case Asc.c_oAscNumberingLvlTextType.Text:
                            text += curLvl.Text[j].Value;
                            break;
                        case Asc.c_oAscNumberingLvlTextType.Num:
                            text += AscCommon.IntToNumberFormat(1, curLvl.Format, curLvl.get_OLang());
                            break;
                        default:
                            break;
                    }
                }
				if (i == 2 && text.indexOf("1.1.") !== -1)
					props.IsOnes = true;

                AscFonts.FontPickerByCharacter.checkTextLight(text);

                if (curLvl.TextPr && curLvl.TextPr.RFonts)
                {
                    if (curLvl.TextPr.RFonts.Ascii) fontsDict[curLvl.TextPr.RFonts.Ascii.Name] = true;
                    if (curLvl.TextPr.RFonts.EastAsia) fontsDict[curLvl.TextPr.RFonts.EastAsia.Name] = true;
                    if (curLvl.TextPr.RFonts.HAnsi) fontsDict[curLvl.TextPr.RFonts.HAnsi.Name] = true;
                    if (curLvl.TextPr.RFonts.CS) fontsDict[curLvl.TextPr.RFonts.CS.Name] = true;
                }
            }

            var fonts = [];
            for (var familyName in fontsDict)
            {
                fonts.push(new AscFonts.CFont(AscFonts.g_fontApplication.GetFontInfoName(familyName), 0, "", 0, null));
            }
            AscFonts.FontPickerByCharacter.extendFonts(fonts);

            if (false === AscCommon.g_font_loader.CheckFontsNeedLoading(fonts))
            {
                return this.SetDrawImagePreviewBulletChangeListLevel(id, props, true);
            }

            this.m_oWordControl.m_oApi.asyncMethodCallback = function()
            {
                this.WordControl.m_oDrawingDocument.SetDrawImagePreviewBulletChangeListLevel(id, props, true);
            };
            AscCommon.g_font_loader.LoadDocumentFonts2(fonts);
            return;
        }
        
        var offsetBase = 5;
        var line_w = 2;
		var height_px_p = document.getElementById(id[0]).clientHeight;
		var offset = (height_px_p - (line_w << 1)) >> 1;
        var y = (height_px_p >> 1) - (line_w >> 1);
        var text_base_offset_x = offset + ((3.25 * AscCommon.g_dKoef_mm_to_pix) >> 0);
        var text_base_offset_dist = ( (props.IsOnes ? 2.25 : 3.25) * AscCommon.g_dKoef_mm_to_pix) >> 0;

		var oDocState = null;
		if (this.m_oLogicDocument)
			oDocState = this.m_oLogicDocument.StartNoHistoryMode();

        for (var k = 0; k < 9; k++) 
        {
			// чтобы убрать отступ у i
			props.Lvl[k].Align = 1;
            var parent =  document.getElementById(id[k]);
            if (!parent)
                return;

            var width_px = parent.clientWidth;
            var height_px = parent.clientHeight;
            
            var canvas = parent.firstChild;
			if (!canvas)
			{
				canvas = document.createElement('canvas');
				canvas.style.cssText = "padding:0;margin:0;user-select:none;";
				canvas.style.width = width_px + "px";
				canvas.style.height = height_px + "px";
				if (width_px > 0 && height_px > 0)
					parent.appendChild(canvas);
			}

            canvas.width = AscCommon.AscBrowser.convertToRetinaValue(width_px, true);
            canvas.height = AscCommon.AscBrowser.convertToRetinaValue(height_px, true);

            var ctx = canvas.getContext("2d");
			var rPR = AscCommon.AscBrowser.retinaPixelRatio;

            ctx.lineWidth = 2 * Math.round(rPR);
            ctx.strokeStyle = "#CBCBCB";

            var textYs = {x: text_base_offset_x - ((4.25 * AscCommon.g_dKoef_mm_to_pix) >> 0), y: y + (line_w << 1)};

            ctx.moveTo(Math.round(text_base_offset_x * rPR), Math.round(y * rPR)); ctx.lineTo(Math.round((width_px - offsetBase) * rPR), Math.round(y * rPR));
            ctx.stroke();
            ctx.beginPath();

            text_base_offset_x += text_base_offset_dist;

            this.privateGetParagraphByString(props.Lvl[k], k, 1, textYs.x, textYs.y, (height_px >> 1), ctx, width_px, height_px);
        }

        if (oDocState)
        	this.m_oLogicDocument.EndNoHistoryMode(oDocState);
    };

	this.SetDrawImagePreviewBulletForMenu = function(id, type, props, isNoCheckFonts)
	{
		var text = AscCommon.translateManager.getValue("None");
		if (!props)
		{
			props = [];
			var olvl = new Asc.CAscNumberingLvl(0);
			var level = new CNumberingLvl();
			var arr = [];
			for (var i = 0; i < text.length; i++)
			{
				var otext = new CNumberingLvlTextString(text[i]);
				arr.push(otext);
			}
			level.SetLvlText(arr);
			level.FillToAscNumberingLvl(olvl);
			props.push((type == 2) ? [olvl] : olvl);
			if (type === 0)
			{
				for (var i = 1; i < 9; i++)
				{
					var lvl 		= new CNumberingLvl(),
						oLvl		= new Asc.CAscNumberingLvl(i),
						oLvlTextPr	= new CTextPr(),
						sLvlText	= "";
					switch (i)
					{
						case 1:
						{
							sLvlText = String.fromCharCode(0x00B7);
							oLvlTextPr.RFonts.SetAll("Symbol");
							break;
						}
						case 2:
						{
							sLvlText = "o";
							oLvlTextPr.RFonts.SetAll("Courier New");
							break;
						}
						case 3:
						{
							sLvlText = String.fromCharCode(0x00A7);
							oLvlTextPr.RFonts.SetAll("Wingdings");
							break;
						}
						case 4:
						{
							sLvlText = String.fromCharCode(0x0076);
							oLvlTextPr.RFonts.SetAll("Wingdings");
							break;
						}
						case 5:
						{
							sLvlText = String.fromCharCode(0x00D8);
							oLvlTextPr.RFonts.SetAll("Wingdings");
							break;
						}
						case 6:
						{
							sLvlText = String.fromCharCode(0x00FC);
							oLvlTextPr.RFonts.SetAll("Wingdings");
							break;
						}
						case 7:
						{
							sLvlText = String.fromCharCode(0x00A8);
							oLvlTextPr.RFonts.SetAll("Symbol");
							break;
						}
						case 8:
						{
							sLvlText = String.fromCharCode(0x2013);
							oLvlTextPr.RFonts.SetAll("Arial");
							break;
						}
					}
					lvl.SetByType(c_oAscNumberingLevel.Bullet, 0, sLvlText, oLvlTextPr);
					lvl.FillToAscNumberingLvl(oLvl);
					props.push(oLvl);
				}
			}
			else if (type === 1)
			{
				var arrTypes = 
				[
					c_oAscNumberingLevel.UpperLetterDot_Left,
					c_oAscNumberingLevel.LowerLetterBracket_Left,
					c_oAscNumberingLevel.LowerLetterDot_Left,
					c_oAscNumberingLevel.DecimalDot_Right,
					c_oAscNumberingLevel.DecimalBracket_Right,
					c_oAscNumberingLevel.UpperRomanDot_Right,
					c_oAscNumberingLevel.LowerRomanDot_Right
				];
				for (var i = 0; i < arrTypes.length; i++)
				{
					var lvl = new CNumberingLvl();
					var oLvl = new Asc.CAscNumberingLvl(0)
					lvl.SetByType(arrTypes[i], 0);
					lvl.FillToAscNumberingLvl(oLvl);
					oLvl.Align = 1;
					props.push(oLvl);
				}
			}
			else
			{
				var arrTypes = 
				[
					c_oAscMultiLevelNumbering.MultiLevel1,
					c_oAscMultiLevelNumbering.MultiLevel2,
					c_oAscMultiLevelNumbering.MultiLevel3
				];
				for (var i = 0; i < arrTypes.length; i++)
				{
					var tmpArr = [];
					for (var j = 0; j < 3; j++)
					{
						var lvl = new CNumberingLvl();
						var oLvl = new Asc.CAscNumberingLvl(j);
						lvl.InitDefault(j, arrTypes[i]);
						lvl.FillToAscNumberingLvl(oLvl);
						tmpArr.push(oLvl)
					}
					props.push(tmpArr);
				}
			}
		}
		
		if (!isNoCheckFonts)
		{
			// check need load fonts
			var fontsDict = {};
			for (var i = 0, count = props.length; i < count; i++)
			{
				if (type == 2)
				{
					for (var k = 0; k < props[i].length; k++)
					{
						var curLvl = props[i][k];				
						var text = "";
						for (var j = 0; j < curLvl.Text.length; j++)
						{
							switch (curLvl.Text[j].Type)
							{
								case Asc.c_oAscNumberingLvlTextType.Text:
									text += curLvl.Text[j].Value;
									break;
								case Asc.c_oAscNumberingLvlTextType.Num:
									text += AscCommon.IntToNumberFormat(1, curLvl.Format, curLvl.get_OLang());
									break;
								default:
									break;
							}
						}
						AscFonts.FontPickerByCharacter.checkTextLight(text);
		
						if (curLvl.TextPr && curLvl.TextPr.RFonts)
						{
							if (curLvl.TextPr.RFonts.Ascii) fontsDict[curLvl.TextPr.RFonts.Ascii.Name] = true;
							if (curLvl.TextPr.RFonts.EastAsia) fontsDict[curLvl.TextPr.RFonts.EastAsia.Name] = true;
							if (curLvl.TextPr.RFonts.HAnsi) fontsDict[curLvl.TextPr.RFonts.HAnsi.Name] = true;
							if (curLvl.TextPr.RFonts.CS) fontsDict[curLvl.TextPr.RFonts.CS.Name] = true;
						}	
					}
					
				}
				else
				{
					var curLvl = props[i];				
					var text = "";
					for (var j = 0; j < curLvl.Text.length; j++)
					{
						switch (curLvl.Text[j].Type)
						{
							case Asc.c_oAscNumberingLvlTextType.Text:
								text += curLvl.Text[j].Value;
								break;
							case Asc.c_oAscNumberingLvlTextType.Num:
								text += AscCommon.IntToNumberFormat(1, curLvl.Format, curLvl.get_OLang());
								break;
							default:
								break;
						}
					}
					AscFonts.FontPickerByCharacter.checkTextLight(text);
	
					if (curLvl.TextPr && curLvl.TextPr.RFonts)
					{
						if (curLvl.TextPr.RFonts.Ascii) fontsDict[curLvl.TextPr.RFonts.Ascii.Name] = true;
						if (curLvl.TextPr.RFonts.EastAsia) fontsDict[curLvl.TextPr.RFonts.EastAsia.Name] = true;
						if (curLvl.TextPr.RFonts.HAnsi) fontsDict[curLvl.TextPr.RFonts.HAnsi.Name] = true;
						if (curLvl.TextPr.RFonts.CS) fontsDict[curLvl.TextPr.RFonts.CS.Name] = true;
					}
				}
			}

			var fonts = [];
			for (var familyName in fontsDict)
			{
				fonts.push(new AscFonts.CFont(AscFonts.g_fontApplication.GetFontInfoName(familyName), 0, "", 0, null));
			}
			AscFonts.FontPickerByCharacter.extendFonts(fonts);

			if (false === AscCommon.g_font_loader.CheckFontsNeedLoading(fonts))
			{
				return this.SetDrawImagePreviewBulletForMenu(id, type, props, true);
			}

			var loader = new AscCommon.CGlobalFontLoader();
			loader.put_Api(this.m_oWordControl.m_oApi);
			loader.LoadDocumentFonts2(fonts, Asc.c_oAscAsyncActionType.Information, function(){
				this.WordControl.m_oDrawingDocument.SetDrawImagePreviewBulletForMenu(id, type, props, true);
			});
			return;
 		}
		var elNone = document.getElementById(id[0]);

		var oDocState = null;
		if (this.m_oLogicDocument)
			oDocState = this.m_oLogicDocument.StartNoHistoryMode();

		if (elNone)
		{
			var width_px = elNone.clientWidth;
			var height_px = elNone.clientHeight;

			var canvas = elNone.firstChild;
			if (!canvas)
			{
				canvas = document.createElement('canvas');
				canvas.style.cssText = "padding:0;margin:0;user-select:none;";
				canvas.style.width = width_px + "px";
				canvas.style.height = height_px + "px";
				if (width_px > 0 && height_px > 0)
					elNone.appendChild(canvas);
			}

			canvas.width = AscCommon.AscBrowser.convertToRetinaValue(width_px, true);
			canvas.height = AscCommon.AscBrowser.convertToRetinaValue(height_px, true);

			var ctx = canvas.getContext("2d");
			ctx.fillStyle = "#FFFFFF";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.beginPath();
			var line_distance = (height_px == 80) ? (height_px / 5 - 1) : ((height_px >> 2) + ((text.length > 6) ? 0 : 2));
			var par = new Paragraph(this, this.m_oWordControl.m_oLogicDocument);
			par.MoveCursorToStartPos();

			par.Pr = new CParaPr();
			var lvl = (type == 2) ? props[0][0] : props[0];
			var textPr = lvl.TextPr.Copy();
			textPr.FontSize = ((2 * line_distance * 72 / 96) >> 0) / 2;

			var parRun = new ParaRun(par);
			parRun.Set_Pr(textPr);
			parRun.AddText(text);
			par.AddToContent(0, parRun);

			par.Reset(0, 0, 1000, 1000, 0, 0, 1);
			par.Recalculate_Page(0);

			var bounds = par.Get_PageBounds(0);

			var parW = par.Lines[0].Ranges[0].W * AscCommon.g_dKoef_mm_to_pix;
			var parH = (bounds.Bottom - bounds.Top);
			var x = (width_px - (parW >> 0)) >> 1;
			var y = (height_px >> 1) + (parH >> 1);

			this.privateGetParagraphByString(lvl, 0, 0, x, y, line_distance, ctx, width_px, height_px);
		}

		for (var i = 1; i < id.length; i++)
		{
			var parent =  document.getElementById(id[i]);

			if (!parent)
				continue;

			var width_px = parent.clientWidth;
			var height_px = parent.clientHeight;

			var canvas = parent.firstChild;
			if (!canvas)
			{
				canvas = document.createElement('canvas');
				canvas.style.cssText = "padding:0;margin:0;user-select:none;";
				canvas.style.width = width_px + "px";
				canvas.style.height = height_px + "px";
				if (width_px > 0 && height_px > 0)
					parent.appendChild(canvas);
			}

			canvas.width = AscCommon.AscBrowser.convertToRetinaValue(width_px, true);
			canvas.height = AscCommon.AscBrowser.convertToRetinaValue(height_px, true);

			var ctx = canvas.getContext("2d");
			ctx.fillStyle = "#FFFFFF";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.beginPath();
			var rPR = AscCommon.AscBrowser.retinaPixelRatio;
			
			if (!type)
			{
				var line_distance = 32, x = 0, y = 0;

				var text = "";
				for (var k = 0; k < props[i].Text.length; k++)
				{
					switch (props[i].Text[k].Type)
					{
						case Asc.c_oAscNumberingLvlTextType.Text:
							text += props[i].Text[k].Value;
							break;
						case Asc.c_oAscNumberingLvlTextType.Num:
							var correctNum = 1;
							if (levelNum === props[i].Text[k].Value)
								correctNum = counterCurrent;
							text += AscCommon.IntToNumberFormat(correctNum, props[i].Format, props[i].get_OLang());
							break;
						default:
							break;
					}
				}

				var textPr = props[i].TextPr.Copy();
				textPr.FontSize = textPr.FontSizeCS = ((2 * line_distance * 72 / 96) >> 0) / 2;

				if (1 === text.length)
				{
					g_oTextMeasurer.SetTextPr(textPr);
					g_oTextMeasurer.SetFontSlot(fontslot_ASCII, 1);
					var oInfo = g_oTextMeasurer.Measure2Code(text.charCodeAt(0));

					x = (width_px >> 1) - Math.round((oInfo.WidthG / 2 + oInfo.rasterOffsetX) * AscCommon.g_dKoef_mm_to_pix);
					y = (width_px >> 1) + Math.round((oInfo.Height / 2 + (oInfo.Ascent - oInfo.Height + oInfo.rasterOffsetY)) * AscCommon.g_dKoef_mm_to_pix);
				}
				else
				{
					var par = new Paragraph(this, this.m_oWordControl.m_oLogicDocument);
					par.MoveCursorToStartPos();

					par.Pr = new CParaPr();
					var parRun = new ParaRun(par);
					parRun.Set_Pr(textPr);
					parRun.AddText(text);
					par.AddToContent(0, parRun);

					par.Reset(0, 0, 1000, 1000, 0, 0, 1);
					par.Recalculate_Page(0);

					var parW = par.Lines[0].Ranges[0].W * AscCommon.g_dKoef_mm_to_pix;
					x = (width_px >> 1) - Math.round(parW / 2);
					// в office 19 на такой же высоте
					y = par.Lines[0].Y * AscCommon.g_dKoef_mm_to_pix;
				}

				// для размеров окна 38 на 38
				this.privateGetParagraphByString(props[i], 0, 0, x, y, line_distance, ctx, width_px, height_px);
			}
			else
			{
				var offsetBase = 4;
				var line_w = 2;
				// считаем расстояние между линиями
				var line_distance = (((height_px - (offsetBase << 2)) - line_w * 3) / 3) >> 0;
				// убираем погрешность в offset
				var offset = (height_px - (line_w * 3 + line_distance * 3)) >> 1;

				ctx.lineWidth = 2 * Math.round(rPR);
				ctx.strokeStyle = "#CBCBCB";
				var y = offset + 11;
				var text_base_offset_x = offset + ((2.25 * AscCommon.g_dKoef_mm_to_pix) >> 0);
				var text_base_offset_dist = (2.25 * AscCommon.g_dKoef_mm_to_pix) >> 0;

				for (var j = 0; j < 3; j++)
				{
					ctx.moveTo(Math.round(text_base_offset_x * rPR), Math.round(y * rPR)); ctx.lineTo(Math.round((width_px - offsetBase) * rPR), Math.round(y * rPR));
					ctx.stroke();
					ctx.beginPath();
					var textYx =  text_base_offset_x - ((3.25 * AscCommon.g_dKoef_mm_to_pix) >> 0),
						textYy = y + (line_w * 2.5);
					this.privateGetParagraphByString((type == 2) ? props[i][j] : props[i], 0, 1 + ((type == 1) ? j : 0), textYx, textYy, (line_distance - 4), ctx, width_px, height_px);
					y += (line_w + line_distance);
					if (type == 2)
						text_base_offset_x += text_base_offset_dist;
				}
			}
		}

		if (this.m_oLogicDocument)
			this.m_oLogicDocument.EndNoHistoryMode(oDocState);
	};

	this.StartTableStylesCheck = function ()
	{
		this.TableStylesCheckLookFlag = true;
	};

	this.EndTableStylesCheck = function ()
	{
		this.TableStylesCheckLookFlag = false;
		if (this.TableStylesCheckLook != null)
		{
			this.CheckTableStyles(this.TableStylesCheckLook);
			this.TableStylesCheckLook = null;
		}
	};

	this.CheckTableStyles = function (tableLook)
	{
		if (this.TableStylesCheckLookFlag)
		{
			this.TableStylesCheckLook = tableLook;
			return;
		}

		// сначала проверим, подписан ли кто на этот евент
		// а то во вьюере не стоит ничего посылать
		if (!this.m_oWordControl.m_oApi.asc_checkNeedCallback("asc_onInitTableTemplates"))
			return;

        var logicDoc = this.m_oWordControl.m_oLogicDocument;

        var newClrScheme = null;
        if (logicDoc && logicDoc.theme && logicDoc.theme.themeElements)
        	newClrScheme = logicDoc.theme.themeElements.clrScheme;

		let isChanged = false;

		if (!this.TableStylesLastLook || !this.TableStylesLastLook.IsEqual(tableLook))
		{
			this.TableStylesLastLook = tableLook.Copy();
			isChanged = true;
		}

		if (this.TableStylesLastClrScheme !== newClrScheme)
		{
			this.TableStylesLastClrScheme = newClrScheme;
			isChanged = true;
		}

		if (!isChanged)
			return;

		this.m_oWordControl.m_oApi.sync_InitEditorTableStyles();
	};

	this.GetTableStylesPreviews = function(bUseDefault)
	{
		return (new AscCommon.CTableStylesPreviewGenerator(this.m_oWordControl.m_oLogicDocument)).GetAllPreviews(bUseDefault);
	};

	this.GetTableLook = function(isDefault)
	{
		let oTableLook;

		if (isDefault)
		{
			oTableLook = new AscCommon.CTableLook();
			oTableLook.SetDefault();
		}
		else
		{
			oTableLook = this.TableStylesLastLook;
		}

		return oTableLook;
	};

	this.IsMobileVersion = function ()
	{
		if (this.m_oWordControl.MobileTouchManager)
			return true;
		return false;
	};

	this.OnSelectEnd = function ()
	{
		if (this.m_oWordControl && this.m_oWordControl.MobileTouchManager)
			this.m_oWordControl.MobileTouchManager.CheckSelectRects();
	};

    this.DrawCustomTableMode = function(overlay, drawObj, logicObj, isPen)
	{
		var ctx = overlay.m_oContext;

		var page = this.m_arrPages[logicObj.Page];
        if (!page)
            return false;

        var drawingPage = page.drawingPage;
        var koefX = (drawingPage.right - drawingPage.left) / page.width_mm;
        var koefY = (drawingPage.bottom - drawingPage.top) / page.height_mm;

        var rPR = AscCommon.AscBrowser.retinaPixelRatio;

        var x1, y1, x2, y2;

        if (!logicObj.Table)
		{
            ctx.strokeStyle = "rgba(0, 0, 0, 0.75)";
            ctx.lineWidth = 1;

            x1 = (rPR * (drawingPage.left + koefX * logicObj.StartX)) >> 0;
            y1 = (rPR * (drawingPage.top + koefY * logicObj.StartY)) >> 0;
            x2 = (rPR * (drawingPage.left + koefX * logicObj.EndX)) >> 0;
            y2 = (rPR * (drawingPage.top + koefY * logicObj.EndY)) >> 0;

            overlay.CheckPoint(x1, y1);
            overlay.CheckPoint(x2, y2);

            this.AutoShapesTrack.AddRectDashClever(ctx, x1, y1, x2, y2, 2, 2, true);
            ctx.beginPath();
			return;
		}

		if (isPen)
		{
			for (var i = 0; i < drawObj.length; i++)
			{
				var elem = drawObj[i];
                ctx.strokeStyle = (elem.Color === "Red") ? "#FF7B7B" : "#000000";
                ctx.lineWidth = elem.Bold ? 2 : 1;

                x1 = (rPR * (drawingPage.left + koefX * elem.X1)) >> 0;
                y1 = (rPR * (drawingPage.top + koefY * elem.Y1)) >> 0;
                x2 = (rPR * (drawingPage.left + koefX * elem.X2)) >> 0;
                y2 = (rPR * (drawingPage.top + koefY * elem.Y2)) >> 0;

                if (!elem.Bold) {
                    x1 += 0.5;
                    y1 += 0.5;
                    x2 += 0.5;
                    y2 += 0.5;
                }

                overlay.CheckPoint(x1, y1);
                overlay.CheckPoint(x2, y2);

                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
                ctx.beginPath();
            }
		}
		else
		{
            ctx.strokeStyle = "rgba(255, 123, 123, 0.75)";
            ctx.lineWidth = 1;

			x1 = (rPR * (drawingPage.left + koefX * logicObj.StartX)) >> 0;
			y1 = (rPR * (drawingPage.top + koefY * logicObj.StartY)) >> 0;
			x2 = (rPR * (drawingPage.left + koefX * logicObj.EndX)) >> 0;
			y2 = (rPR * (drawingPage.top + koefY * logicObj.EndY)) >> 0;

            overlay.CheckPoint(x1, y1);
            overlay.CheckPoint(x2, y2);

            this.AutoShapesTrack.AddRectDashClever(ctx, x1, y1, x2, y2, 2, 2, true);
            ctx.beginPath();

            ctx.lineWidth = 2;

            for (var i = 0; i < drawObj.length; i++)
            {
                x1 = (rPR * (drawingPage.left + koefX * drawObj[i].X1)) >> 0;
                y1 = (rPR * (drawingPage.top  + koefY * drawObj[i].Y1)) >> 0;
                x2 = (rPR * (drawingPage.left + koefX * drawObj[i].X2)) >> 0;
                y2 = (rPR * (drawingPage.top  + koefY * drawObj[i].Y2)) >> 0;

                overlay.CheckPoint(x1, y1);
                overlay.CheckPoint(x2, y2);

                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
            }

            ctx.stroke();
            ctx.beginPath();
            ctx.lineWidth = 1;
		}
	};

	// mouse events
	this.checkMouseDown_Drawing = function (pos)
	{
		var oWordControl = this.m_oWordControl;
		var _ret = this.TableOutlineDr.checkMouseDown(pos, oWordControl);
		if (_ret === true)
		{
			oWordControl.m_oLogicDocument.RemoveSelection(true);
			this.TableOutlineDr.bIsTracked = true;
			if (!this.TableOutlineDr.IsResizeTableTrack)
				this.LockCursorType("move");
			else
				this.LockCursorType("default");

			this.TableOutlineDr.TableOutline.Table.SelectAll();
			this.TableOutlineDr.TableOutline.Table.Document_SetThisElementCurrent(true);

			if (-1 == oWordControl.m_oTimerScrollSelect)
			{
				oWordControl.m_oTimerScrollSelect = setInterval(oWordControl.SelectWheel, 20);
			}
			oWordControl.EndUpdateOverlay();
			return true;
		}

		if (this.FrameRect.IsActive)
		{
			var eps = 10 * g_dKoef_pix_to_mm * 100 / oWordControl.m_nZoomValue;
			var _check = this.checkCursorOnTrackRect(pos.X, pos.Y, eps, this.FrameRect.Rect);

			if (-1 != _check)
			{
				this.FrameRect.IsTracked = true;
				this.FrameRect.Track.X = pos.X;
				this.FrameRect.Track.Y = pos.Y;
				this.FrameRect.Track.Type = _check;

				switch (_check)
				{
					case 0:
					{
						this.LockCursorType("nw-resize");
						break;
					}
					case 1:
					{
						this.LockCursorType("n-resize");
						break;
					}
					case 2:
					{
						this.LockCursorType("ne-resize");
						break;
					}
					case 3:
					{
						this.LockCursorType("e-resize");
						break;
					}
					case 4:
					{
						this.LockCursorType("se-resize");
						break;
					}
					case 5:
					{
						this.LockCursorType("s-resize");
						break;
					}
					case 6:
					{
						this.LockCursorType("sw-resize");
						break;
					}
					case 7:
					{
						this.LockCursorType("w-resize");
						break;
					}
					default:
					{
						this.LockCursorType("move");
						break;
					}
				}

				if (-1 == oWordControl.m_oTimerScrollSelect)
				{
					oWordControl.m_oTimerScrollSelect = setInterval(oWordControl.SelectWheel, 20);
				}
				oWordControl.EndUpdateOverlay();
				return true;
			}
		}

		if (this.contentControls.onPointerDown(pos))
			return true;

        var _page = this.m_arrPages[pos.Page];
		if (this.placeholders.onPointerDown(pos, _page.drawingPage, _page.width_mm, _page.height_mm))
			return true;

		return false;
	};

	this.checkMouseMove_Drawing = function (pos, isWithoutCoords)
	{
		var oWordControl = this.m_oWordControl;

		if (this.TableOutlineDr.bIsTracked)
		{
			this.TableOutlineDr.checkMouseMove(global_mouseEvent.X, global_mouseEvent.Y, oWordControl);
			oWordControl.ShowOverlay();
			oWordControl.OnUpdateOverlay();
			oWordControl.EndUpdateOverlay();
			return true;
		}
		if (this.TableOutlineDr.checkMouseMoveTrack)
		{
			if (this.TableOutlineDr.checkMouseMoveTrack(pos, oWordControl))
			{
				this.SetCursorType("default");
				return true;
			}
		}
		if (this.TableOutlineDr.checkMouseMove2)
		{
			if (this.TableOutlineDr.checkMouseMove2(global_mouseEvent.X, global_mouseEvent.Y, oWordControl))
				return true;
		}

		if (this.InlineTextTrackEnabled)
		{
			this.contentControls.checkSmallChanges(pos);

			this.InlineTextTrack = oWordControl.m_oLogicDocument.Get_NearestPos(pos.Page, pos.X, pos.Y);
			this.InlineTextTrackPage = pos.Page;

			oWordControl.ShowOverlay();
			oWordControl.OnUpdateOverlay();
			oWordControl.EndUpdateOverlay();
			return true;
		}

		if (this.FrameRect.IsActive)
		{
			if (!this.FrameRect.IsTracked && this.FrameRect.PageIndex == pos.Page)
			{
				var eps = 10 * g_dKoef_pix_to_mm * 100 / oWordControl.m_nZoomValue;
				var _check = this.checkCursorOnTrackRect(pos.X, pos.Y, eps, this.FrameRect.Rect);

				if (_check != -1)
				{
					switch (_check)
					{
						case 0:
						{
							this.SetCursorType("nw-resize");
							break;
						}
						case 1:
						{
							this.SetCursorType("n-resize");
							break;
						}
						case 2:
						{
							this.SetCursorType("ne-resize");
							break;
						}
						case 3:
						{
							this.SetCursorType("e-resize");
							break;
						}
						case 4:
						{
							this.SetCursorType("se-resize");
							break;
						}
						case 5:
						{
							this.SetCursorType("s-resize");
							break;
						}
						case 6:
						{
							this.SetCursorType("sw-resize");
							break;
						}
						case 7:
						{
							this.SetCursorType("w-resize");
							break;
						}
						default:
						{
							this.SetCursorType("move");
							break;
						}
					}
					// оверлей не нужно перерисовывать
					oWordControl.EndUpdateOverlay();
					return true;
				}
			}
			else
			{
				this.checkTrackRect(pos);

				oWordControl.ShowOverlay();
				oWordControl.OnUpdateOverlay();
				oWordControl.EndUpdateOverlay();
				return true;
			}
		}

		if (this.contentControls.onPointerMove(pos, isWithoutCoords))
			return true;

        var _page = this.m_arrPages[pos.Page];
        if (this.placeholders.onPointerMove(pos, _page.drawingPage, _page.width_mm, _page.height_mm))
			return true;

		return false;
	};

	this.checkMouseUp_Drawing = function (pos)
	{
		var oWordControl = this.m_oWordControl;

		if (this.TableOutlineDr.bIsTracked)
		{
			this.TableOutlineDr.checkMouseUp(global_mouseEvent.X, global_mouseEvent.Y, oWordControl);
			oWordControl.m_oLogicDocument.Document_UpdateInterfaceState();
			oWordControl.m_oLogicDocument.Document_UpdateRulersState();

			if (-1 != oWordControl.m_oTimerScrollSelect)
			{
				clearInterval(oWordControl.m_oTimerScrollSelect);
				oWordControl.m_oTimerScrollSelect = -1;
			}
			oWordControl.OnUpdateOverlay();

			oWordControl.EndUpdateOverlay();
			return true;
		}

		if (this.InlineTextTrackEnabled && !this.contentControls.isInlineTrack())
		{
			this.InlineTextTrack = oWordControl.m_oLogicDocument.Get_NearestPos(pos.Page, pos.X, pos.Y);
			this.InlineTextTrackPage = pos.Page;
			this.EndTrackText();

			oWordControl.ShowOverlay();
			oWordControl.OnUpdateOverlay();
			oWordControl.EndUpdateOverlay();
			return true;
		}

		if (this.FrameRect.IsActive && this.FrameRect.IsTracked)
		{
			this.FrameRect.IsTracked = false;

			this.checkTrackRect(pos);
			var _track = this.FrameRect.Track;
			this.FrameRect.Frame.Change_Frame(_track.L, _track.T, _track.R - _track.L, _track.B - _track.T, _track.PageIndex);

			if (-1 != oWordControl.m_oTimerScrollSelect)
			{
				clearInterval(oWordControl.m_oTimerScrollSelect);
				oWordControl.m_oTimerScrollSelect = -1;
			}
			oWordControl.OnUpdateOverlay();

			oWordControl.EndUpdateOverlay();
			return true;
		}

		if (this.contentControls.onPointerUp(pos))
			return true;

        var _page = this.m_arrPages[pos.Page];
        if (this.placeholders.onPointerUp(pos, _page.drawingPage, _page.width_mm, _page.height_mm))
            return true;

		return false;
	};

	this.checkCursorOnTrackRect = function (X, Y, eps, rect)
	{
		// 0-1-...-7 - точки по часовой стрелке, начиная с left-top,
		// 8-..-11 - стороны по часовой стрелке, начиная с top

		var __x_dist1 = Math.abs(X - rect.X);
		var __x_dist2 = Math.abs(X - ((rect.X + rect.R) / 2));
		var __x_dist3 = Math.abs(X - rect.R);

		var __y_dist1 = Math.abs(Y - rect.Y);
		var __y_dist2 = Math.abs(Y - ((rect.Y + rect.B) / 2));
		var __y_dist3 = Math.abs(Y - rect.B);

		if (__y_dist1 < eps)
		{
			if ((X < (rect.X - eps)) || (X > (rect.R + eps)))
				return -1;

			if (__x_dist1 <= __x_dist2 && __x_dist1 <= __x_dist3)
				return (__x_dist1 < eps) ? 0 : 8;

			if (__x_dist2 <= __x_dist1 && __x_dist2 <= __x_dist3)
				return (__x_dist2 < eps) ? 1 : 8;

			if (__x_dist3 <= __x_dist1 && __x_dist3 <= __x_dist2)
				return (__x_dist3 < eps) ? 2 : 8;

			return 8;
		}

		if (__y_dist3 < eps)
		{
			if ((X < (rect.X - eps)) || (X > (rect.R + eps)))
				return -1;

			if (__x_dist1 <= __x_dist2 && __x_dist1 <= __x_dist3)
				return (__x_dist1 < eps) ? 6 : 10;

			if (__x_dist2 <= __x_dist1 && __x_dist2 <= __x_dist3)
				return (__x_dist2 < eps) ? 5 : 10;

			if (__x_dist3 <= __x_dist1 && __x_dist3 <= __x_dist2)
				return (__x_dist3 < eps) ? 4 : 10;

			return 8;
		}

		if (__x_dist1 < eps)
		{
			if ((Y < (rect.Y - eps)) || (Y > (rect.B + eps)))
				return -1;

			if (__y_dist1 <= __y_dist2 && __y_dist1 <= __y_dist3)
				return (__y_dist1 < eps) ? 0 : 11;

			if (__y_dist2 <= __y_dist1 && __y_dist2 <= __y_dist3)
				return (__y_dist2 < eps) ? 7 : 11;

			if (__y_dist3 <= __y_dist1 && __y_dist3 <= __y_dist2)
				return (__y_dist3 < eps) ? 6 : 11;

			return 11;
		}

		if (__x_dist3 < eps)
		{
			if ((Y < (rect.Y - eps)) || (Y > (rect.B + eps)))
				return -1;

			if (__y_dist1 <= __y_dist2 && __y_dist1 <= __y_dist3)
				return (__y_dist1 < eps) ? 2 : 9;

			if (__y_dist2 <= __y_dist1 && __y_dist2 <= __y_dist3)
				return (__y_dist2 < eps) ? 3 : 9;

			if (__y_dist3 <= __y_dist1 && __y_dist3 <= __y_dist2)
				return (__y_dist3 < eps) ? 4 : 9;

			return 9;
		}

		return -1;
	};

	this.checkTrackRect = function (pos)
	{
		var _min_dist = 3; // mm;

		var _track = this.FrameRect.Track;
		var _rect = this.FrameRect.Rect;
		_track.PageIndex = this.FrameRect.PageIndex;
		switch (_track.Type)
		{
			case 0:
			{
				_track.L = _rect.X + (pos.X - _track.X);
				_track.T = _rect.Y + (pos.Y - _track.Y);
				_track.R = _rect.R;
				_track.B = _rect.B;

				if (_track.L > (_track.R - _min_dist))
					_track.L = _track.R - _min_dist;
				if (_track.T > (_track.B - _min_dist))
					_track.T = _track.B - _min_dist;

				break;
			}
			case 1:
			{
				_track.L = _rect.X;
				_track.T = _rect.Y + (pos.Y - _track.Y);
				_track.R = _rect.R;
				_track.B = _rect.B;

				if (_track.T > (_track.B - _min_dist))
					_track.T = _track.B - _min_dist;

				break;
			}
			case 2:
			{
				_track.L = _rect.X;
				_track.T = _rect.Y + (pos.Y - _track.Y);
				_track.R = _rect.R + (pos.X - _track.X);
				_track.B = _rect.B;

				if (_track.R < (_track.L + _min_dist))
					_track.R = _track.L + _min_dist;
				if (_track.T > (_track.B - _min_dist))
					_track.T = _track.B - _min_dist;

				break;
			}
			case 3:
			{
				_track.L = _rect.X;
				_track.T = _rect.Y;
				_track.R = _rect.R + (pos.X - _track.X);
				_track.B = _rect.B;

				if (_track.R < (_track.L + _min_dist))
					_track.R = _track.L + _min_dist;

				break;
			}
			case 4:
			{
				_track.L = _rect.X;
				_track.T = _rect.Y;
				_track.R = _rect.R + (pos.X - _track.X);
				_track.B = _rect.B + (pos.Y - _track.Y);

				if (_track.R < (_track.L + _min_dist))
					_track.R = _track.L + _min_dist;
				if (_track.B < (_track.T + _min_dist))
					_track.B = _track.T + _min_dist;

				break;
			}
			case 5:
			{
				_track.L = _rect.X;
				_track.T = _rect.Y;
				_track.R = _rect.R;
				_track.B = _rect.B + (pos.Y - _track.Y);

				if (_track.B < (_track.T + _min_dist))
					_track.B = _track.T + _min_dist;

				break;
			}
			case 6:
			{
				_track.L = _rect.X + (pos.X - _track.X);
				_track.T = _rect.Y;
				_track.R = _rect.R;
				_track.B = _rect.B + (pos.Y - _track.Y);

				if (_track.L > (_track.R - _min_dist))
					_track.L = _track.R - _min_dist;
				if (_track.B < (_track.T + _min_dist))
					_track.B = _track.T + _min_dist;

				break;
			}
			case 7:
			{
				_track.L = _rect.X + (pos.X - _track.X);
				_track.T = _rect.Y;
				_track.R = _rect.R;
				_track.B = _rect.B;

				if (_track.L > (_track.R - _min_dist))
					_track.L = _track.R - _min_dist;

				break;
			}
			default:
			{
				_track.L = pos.X - (_track.X - _rect.X);
				_track.T = pos.Y - (_track.Y - _rect.Y);
				_track.R = _track.L + _rect.R - _rect.X;
				_track.B = _track.T + _rect.B - _rect.Y;

				_track.PageIndex = pos.Page;
				break;
			}
		}
	};

	this.DrawVerAnchor = function (pageNum, xPos, bIsFromDrawings)
	{
		if (undefined === bIsFromDrawings)
		{
			if (this.m_oWordControl.m_oApi.ShowSnapLines)
			{
				this.HorVerAnchors.push({Type: 0, Page: pageNum, Pos: xPos});
			}
			return;
		}

		var _pos = this.ConvertCoordsToCursor4(xPos, 0, pageNum);
		if (_pos.Error === false)
		{
			this.m_oWordControl.m_oOverlayApi.DashLineColor = "#C8C8C8";
			this.m_oWordControl.m_oOverlayApi.VertLine2(_pos.X);
			this.m_oWordControl.m_oOverlayApi.DashLineColor = "#000000";
		}
	};

	this.DrawHorAnchor = function (pageNum, yPos, bIsFromDrawings)
	{
		if (undefined === bIsFromDrawings)
		{
			if (this.m_oWordControl.m_oApi.ShowSnapLines)
			{
				this.HorVerAnchors.push({Type: 1, Page: pageNum, Pos: yPos});
			}
			return;
		}

		var _pos = this.ConvertCoordsToCursor4(0, yPos, pageNum);
		if (_pos.Error === false)
		{
			this.m_oWordControl.m_oOverlayApi.DashLineColor = "#C8C8C8";
			this.m_oWordControl.m_oOverlayApi.HorLine2(_pos.Y);
			this.m_oWordControl.m_oOverlayApi.DashLineColor = "#000000";
		}
	};

	this.DrawHorVerAnchor = function ()
	{
		for (var i = 0; i < this.HorVerAnchors.length; i++)
		{
			var _anchor = this.HorVerAnchors[i];
			if (_anchor.Type == 0)
				this.DrawVerAnchor(_anchor.Page, _anchor.Pos, true);
			else
				this.DrawHorAnchor(_anchor.Page, _anchor.Pos, true);
		}
		this.HorVerAnchors.splice(0, this.HorVerAnchors.length);
	};

	// track text (inline)
	this.StartTrackText = function ()
	{
		this.InlineTextTrackEnabled = true;
		this.InlineTextTrack = null;
		this.InlineTextTrackPage = -1;
	};
	this.EndTrackText = function (isOnlyMoveTarget)
	{
		this.InlineTextTrackEnabled = false;

		if (true !== isOnlyMoveTarget)
			this.m_oWordControl.m_oLogicDocument.OnEndTextDrag(this.InlineTextTrack, AscCommon.global_keyboardEvent.CtrlKey);
		else if (this.InlineTextTrack)
		{
            var Paragraph = this.InlineTextTrack.Paragraph;
            Paragraph.Cursor_MoveToNearPos(this.InlineTextTrack);
            Paragraph.Document_SetThisElementCurrent(false);

            this.m_oWordControl.m_oLogicDocument.Document_UpdateSelectionState();
            this.m_oWordControl.m_oLogicDocument.Document_UpdateInterfaceState();
            this.m_oWordControl.m_oLogicDocument.Document_UpdateRulersState();
		}

		this.InlineTextTrack = null;
		this.InlineTextTrackPage = -1;
	};

	this.IsTrackText = function ()
	{
		return this.InlineTextTrackEnabled;
	};

	this.CancelTrackText = function ()
	{
		this.InlineTextTrackEnabled = false;
		this.InlineTextTrack = null;
		this.InlineTextTrackPage = -1;
	};

	this.SendMathToMenu = function ()
	{
		if (this.MathMenuLoad)
			return;

		// GENERATE_IMAGES
		//var _MathPainter = new CMathPainter(this.m_oWordControl.m_oApi);
		//_MathPainter.StartLoad();
		//return;

		var _MathPainter = new AscFormat.CMathPainter(this.m_oWordControl.m_oApi);
		_MathPainter.Generate();
		this.MathMenuLoad = true;
	};

	// collaborative targets
	this.Collaborative_UpdateTarget = function (_id, _shortId, _x, _y, _size, _page, _transform, is_from_paint)
	{
		if (is_from_paint !== true)
		{
			this.CollaborativeTargetsUpdateTasks.push([_id, _shortId, _x, _y, _size, _page, _transform]);
			return;
		}

		for (var i = 0; i < this.CollaborativeTargets.length; i++)
		{
			if (_id == this.CollaborativeTargets[i].Id)
			{
				this.CollaborativeTargets[i].CheckPosition(_x, _y, _size, _page, _transform);
				return;
			}
		}
		var _target = new CDrawingCollaborativeTarget(this);
		_target.Id = _id;
		_target.ShortId = _shortId;
		_target.CheckPosition(_x, _y, _size, _page, _transform);
		this.CollaborativeTargets[this.CollaborativeTargets.length] = _target;
	};
	this.Collaborative_RemoveTarget = function (_id)
	{
		var i = 0;
		for (i = 0; i < this.CollaborativeTargets.length; i++)
		{
			if (_id == this.CollaborativeTargets[i].Id)
			{
				this.CollaborativeTargets[i].Remove(this);
				this.CollaborativeTargets.splice(i, 1);
				i--;
			}
		}

		for (i = 0; i < this.CollaborativeTargetsUpdateTasks.length; i++)
		{
			var _tmp = this.CollaborativeTargetsUpdateTasks[i];
			if (_tmp[0] == _id)
			{
				this.CollaborativeTargetsUpdateTasks.splice(i, 1);
				i--;
			}
		}
	};
	this.Collaborative_TargetsUpdate = function (bIsChangePosition)
	{
		var _len_tasks = this.CollaborativeTargetsUpdateTasks.length;
		var i = 0;
		for (i = 0; i < _len_tasks; i++)
		{
			var _tmp = this.CollaborativeTargetsUpdateTasks[i];
			this.Collaborative_UpdateTarget(_tmp[0], _tmp[1], _tmp[2], _tmp[3], _tmp[4], _tmp[5], _tmp[6], true);
		}
		if (_len_tasks != 0)
			this.CollaborativeTargetsUpdateTasks.splice(0, _len_tasks);

		if (bIsChangePosition)
		{
			for (i = 0; i < this.CollaborativeTargets.length; i++)
			{
				this.CollaborativeTargets[i].Update(this);
			}
		}
	};
	this.Collaborative_GetTargetPosition = function (UserId)
	{
		for (var i = 0; i < this.CollaborativeTargets.length; i++)
		{
			if (UserId == this.CollaborativeTargets[i].Id)
				return {X: this.CollaborativeTargets[i].HtmlElementX, Y: this.CollaborativeTargets[i].HtmlElementY};
		}

		return null;
	};

	// print selection
    this.GenerateSelectionPrint = function ()
    {
        History.TurnOff();
        g_oTableId.m_bTurnOff = true;

        this.printedDocument = null;
        try {
            var _drDocument = {
                m_lCountCalculatePages : 0,
                m_lPagesCount : 0,
                m_arrPages : [],

                TargetStart : function () {},
                TargetEnd : function () {},
                TargetShow : function () {},
                GetVisibleMMHeight : function () { return editor.WordControl.m_oDrawingDocument.GetVisibleMMHeight(); },
                UpdateTargetTransform : function () {},
                SetTextSelectionOutline : function () {},
                ClearCachePages : function () {},
                FirePaint : function () {},
                OnStartRecalculate : function (pagesCount) {
                    this.m_lCountCalculatePages = pagesCount;
                    this.m_arrPages = [];
                },
                OnRecalculatePage : function (pageIndex, pageObject) {
                    this.m_lCountCalculatePages = pageIndex + 1;

                    this.m_arrPages[pageIndex] = {
                        width_mm : pageObject.Width,
                        height_mm : pageObject.Height
                    };
                },
                OnEndRecalculate : function (isFull, isBreak) {
                    if (isFull && !isBreak)
                        this.m_lPagesCount = this.m_lCountCalculatePages;
                },
                ConvetToPageCoords : function() { return { Page : -1, X : 0, Y : 0 } },
                GetDotsPerMM : function(v) { return v * g_dKoef_mm_to_pix },
                GetMMPerDot : function(v) { return v / this.GetDotsPerMM(1) }
            };

            var _srcDoc = this.m_oLogicDocument;
            _srcDoc.PrintSelection = true;

            var _isTrackRevision = false;
            if (this.m_oLogicDocument.IsTrackRevisions())
			{
				_isTrackRevision = this.m_oLogicDocument.GetLocalTrackRevisions();
				this.m_oLogicDocument.SetLocalTrackRevisions(false);
			}

            var _document = new CDocument(_drDocument, false);
            var _srcDrawngObjects = _srcDoc.DrawingObjects;
            _srcDoc.DrawingObjects = _document.DrawingObjects;
			_document.PrintSelection = true;

            var _selection = _srcDoc.GetSelectedContent(false, {SaveNumberingValues : true});
            _drDocument.m_oLogicDocument = _document;
            AscCommon.History.Document = _srcDoc;
            var _paragraph = _document.GetCurrentParagraph();
            _paragraph.bFromDocument = true;
            _paragraph.LogicDocument = _document;
            var _nearpos = null;
            if (null != _paragraph) {
                _nearpos = {Paragraph: _paragraph, ContentPos: _paragraph.Get_ParaContentPos(false, false)};
                _paragraph.Check_NearestPos(_nearpos);
            }
            _document.Numbering = _srcDoc.Numbering;
            _document.Styles = _srcDoc.Styles.Copy();
            _document.theme = _srcDoc.theme.createDuplicate();
            _document.clrSchemeMap = _srcDoc.clrSchemeMap.createDuplicate();
			_document.Footnotes = _srcDoc.Footnotes.Copy(_document);

            var oLastSectPr = _selection.GetLastSection();
			if (oLastSectPr)
				_document.SectPr.Copy(oLastSectPr, true);

            editor.WordControl.m_oLogicDocument = _document;
            editor.WordControl.m_oDrawingDocument = _drDocument;

            for (var i = 0; i < _selection.DrawingObjects.length; i++)
                _document.DrawingObjects.addGraphicObject(_selection.DrawingObjects[i]);

            if (_selection.Elements.length)
			{
				_document.RemoveFromContent(0, _document.Content.length, false);
				for (var i = 0, count = _selection.Elements.length; i < count; i++)
				{
					_document.AddToContent(i, _selection.Elements[i].Element, false);
				}
			}

            _document.UpdateAllSectionsInfo();

            var old = window["NATIVE_EDITOR_ENJINE_SYNC_RECALC"];
            window["NATIVE_EDITOR_ENJINE_SYNC_RECALC"] = true;
            _document.RecalculateFromStart(false); // sync
            window["NATIVE_EDITOR_ENJINE_SYNC_RECALC"] = old;

            editor.WordControl.m_oLogicDocument = _srcDoc;
            editor.WordControl.m_oDrawingDocument = this;
            _srcDoc.DrawingObjects = _srcDrawngObjects;
			_srcDoc.PrintSelection = false;

            this.printedDocument = _document;

            if (false !== _isTrackRevision)
            	this.m_oLogicDocument.SetLocalTrackRevisions(_isTrackRevision);
        }
        catch (err)
        {
        }

        g_oTableId.m_bTurnOff = false;
        History.TurnOn();
    };
}
function CStylesPainter()
{
	this.defaultStyles = null;
	this.docStyles = null;

	this.mergedStyles = null;

	this.STYLE_THUMBNAIL_WIDTH = GlobalSkin.STYLE_THUMBNAIL_WIDTH;
	this.STYLE_THUMBNAIL_HEIGHT = GlobalSkin.STYLE_THUMBNAIL_HEIGHT;

	this.CurrentTranslate = null;
}
CStylesPainter.prototype =
{
	CheckStylesNames : function(_api, ds)
	{
        var DocumentStyles = _api.WordControl.m_oLogicDocument.Get_Styles();
        for (var i in ds)
        {
            var style = ds[i];
            if (style.IsExpressStyle(DocumentStyles) && null === DocumentStyles.GetStyleIdByName(style.Name))
            {
            	AscFonts.FontPickerByCharacter.getFontsByString(style.Name);
            }
        }

        AscFonts.FontPickerByCharacter.getFontsByString("Aa");

        var styles = DocumentStyles.Style;

        if (!styles)
            return;

        for (var i in styles)
        {
            var style = styles[i];
            if (style.IsExpressStyle(DocumentStyles))
            {
                AscFonts.FontPickerByCharacter.getFontsByString(style.Name);
                AscFonts.FontPickerByCharacter.getFontsByString(AscCommon.translateManager.getValue(style.Name));
            }
        }
	},

	GenerateStyles: function (_api, ds)
	{
		var _oldX = this.STYLE_THUMBNAIL_WIDTH;
		var _oldY = this.STYLE_THUMBNAIL_HEIGHT;

		this.STYLE_THUMBNAIL_WIDTH 	= AscCommon.AscBrowser.convertToRetinaValue(this.STYLE_THUMBNAIL_WIDTH, true);
		this.STYLE_THUMBNAIL_HEIGHT = AscCommon.AscBrowser.convertToRetinaValue(this.STYLE_THUMBNAIL_HEIGHT, true);

		this.CurrentTranslate = _api.CurrentTranslate;

		this.GenerateDefaultStyles(_api, ds);
		this.GenerateDocumentStyles(_api);

		// стили сформированы. осталось просто сформировать единый список
		var _count_default = this.defaultStyles.length;
		var _count_doc = 0;
		if (null != this.docStyles)
			_count_doc = this.docStyles.length;

		var aPriorityStyles = [];
		var fAddToPriorityStyles = function (style)
		{
			var index = style.uiPriority;
			if (null == index)
				index = 0;
			var aSubArray = aPriorityStyles[index];
			if (null == aSubArray)
			{
				aSubArray = [];
				aPriorityStyles[index] = aSubArray;
			}
			aSubArray.push(style);
		};
		var _map_document = {};

		for (var i = 0; i < _count_doc; i++)
		{
			var style = this.docStyles[i];
			_map_document[style.Name] = 1;
			fAddToPriorityStyles(style);
		}

		for (var i = 0; i < _count_default; i++)
		{
			var style = this.defaultStyles[i];
			if (null == _map_document[style.Name])
				fAddToPriorityStyles(style);
		}

		this.mergedStyles = [];
		for (var index in aPriorityStyles)
		{
			var aSubArray = aPriorityStyles[index];
			aSubArray.sort(function (a, b)
			{
				if (a.Name < b.Name)
					return -1;
				else if (a.Name > b.Name)
					return 1;
				else
					return 0;
			});
			for (var i = 0, length = aSubArray.length; i < length; ++i)
			{
				this.mergedStyles.push(aSubArray[i]);
			}
		}

		this.STYLE_THUMBNAIL_WIDTH = _oldX;
		this.STYLE_THUMBNAIL_HEIGHT = _oldY;

		// export
		this["STYLE_THUMBNAIL_WIDTH"] = this.STYLE_THUMBNAIL_WIDTH;
		this["STYLE_THUMBNAIL_HEIGHT"] = this.STYLE_THUMBNAIL_HEIGHT;

		// теперь просто отдаем евент наверх
		_api.sync_InitEditorStyles(this);
	},
	GenerateDefaultStyles: function (_api, ds)
	{
		var styles = ds;

		// добавили переводы => нельзя кэшировать
		var _canvas = document.createElement('canvas');
		_canvas.width = this.STYLE_THUMBNAIL_WIDTH;
		_canvas.height = this.STYLE_THUMBNAIL_HEIGHT;
		var ctx = _canvas.getContext('2d');

		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(0, 0, _canvas.width, _canvas.height);

		var graphics = new AscCommon.CGraphics();
		graphics.init(ctx, _canvas.width, _canvas.height,
			_canvas.width * g_dKoef_pix_to_mm / AscCommon.AscBrowser.retinaPixelRatio,
			_canvas.height * g_dKoef_pix_to_mm / AscCommon.AscBrowser.retinaPixelRatio);

		graphics.m_oFontManager = AscCommon.g_fontManager;

		var DocumentStyles = _api.WordControl.m_oLogicDocument.Get_Styles();
		this.defaultStyles = [];
		for (var i in styles)
		{
			var style = styles[i];
			if (style.IsExpressStyle(DocumentStyles) && null === DocumentStyles.GetStyleIdByName(style.Name))
			{
				this.drawStyle(_api, graphics, style, AscCommon.translateManager.getValue(style.Name));
				this.defaultStyles.push(new AscCommon.CStyleImage(style.Name, AscCommon.c_oAscStyleImage.Default,
					_canvas.toDataURL("image/png"), style.uiPriority));
			}
		}
	},

	GenerateDocumentStyles: function (_api)
	{
		if (!_api.WordControl.m_oLogicDocument)
		{
			return;
		}

		var __Styles = _api.WordControl.m_oLogicDocument.Get_Styles();
		var styles = __Styles.Style;

		if (!styles)
		{
			return;
		}

		var cur_index = 0;

		var _canvas = document.createElement('canvas');
		_canvas.width = this.STYLE_THUMBNAIL_WIDTH;
		_canvas.height = this.STYLE_THUMBNAIL_HEIGHT;
		var ctx = _canvas.getContext('2d');

		if (window["flat_desine"] !== true)
		{
			ctx.fillStyle = "#FFFFFF";
			ctx.fillRect(0, 0, _canvas.width, _canvas.height);
		}

		var graphics = new AscCommon.CGraphics();
		graphics.init(ctx, _canvas.width, _canvas.height,
			_canvas.width * g_dKoef_pix_to_mm / AscCommon.AscBrowser.retinaPixelRatio,
			_canvas.height * g_dKoef_pix_to_mm / AscCommon.AscBrowser.retinaPixelRatio);
		graphics.m_oFontManager = AscCommon.g_fontManager;

		this.docStyles = [];
		for (var i in styles)
		{
			var style = styles[i];
			if (style.IsExpressStyle(__Styles))
			{
				// как только меняется сериалайзер - меняется и код здесь. Да, не очень удобно,
				// зато быстро делается
				var formalStyle = i.toLowerCase().replace(/\s/g, "");
				var res = formalStyle.match(/^heading([1-9][0-9]*)$/);
				var index = (res) ? res[1] - 1 : -1;

				var _dr_style = __Styles.Get_Pr(i, styletype_Paragraph);
				_dr_style.Name = style.Name;
				_dr_style.Id = i;

				this.drawStyle(_api, graphics, _dr_style,
					__Styles.Is_StyleDefault(style.Name) ? AscCommon.translateManager.getValue(style.Name) : style.Name);
				this.docStyles[cur_index] = new AscCommon.CStyleImage(style.Name, AscCommon.c_oAscStyleImage.Document,
					_canvas.toDataURL("image/png"), style.uiPriority);

				// алгоритм смены имени
				if (style.Default)
				{
					switch (style.Default)
					{
						case 1:
							break;
						case 2:
							this.docStyles[cur_index].Name = "No List";
							break;
						case 3:
							this.docStyles[cur_index].Name = "Normal";
							break;
						case 4:
							this.docStyles[cur_index].Name = "Normal Table";
							break;
					}
				}
				else if (index != -1)
				{
					this.docStyles[cur_index].Name = "Heading ".concat(index + 1);
				}

				cur_index++;
			}
		}
	},
	drawStyle: function (_api, graphics, style, styleName)
	{
		var ctx = graphics.m_oContext;
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(0, 0, this.STYLE_THUMBNAIL_WIDTH, this.STYLE_THUMBNAIL_HEIGHT);

		var font = {
			FontFamily: {Name: "Times New Roman", Index: -1},
			Color: {r: 0, g: 0, b: 0},
			Bold: false,
			Italic: false,
			FontSize: 10
		};

		var textPr = style.TextPr;
		if (textPr.FontFamily != undefined)
		{
			font.FontFamily.Name = textPr.FontFamily.Name;
			font.FontFamily.Index = textPr.FontFamily.Index;
		}

		if (textPr.Bold != undefined)
			font.Bold = textPr.Bold;
		if (textPr.Italic != undefined)
			font.Italic = textPr.Italic;

		if (textPr.FontSize != undefined)
			font.FontSize = textPr.FontSize;

		graphics.SetFont(font);

		if (textPr.Color == undefined)
			graphics.b_color1(0, 0, 0, 255);
		else
			graphics.b_color1(textPr.Color.r, textPr.Color.g, textPr.Color.b, 255);

		var dKoefToMM = g_dKoef_pix_to_mm;
		dKoefToMM /= AscCommon.AscBrowser.retinaPixelRatio;

		if (window["flat_desine"] !== true)
		{
			var y = 0;
			var b = dKoefToMM * this.STYLE_THUMBNAIL_HEIGHT;
			var w = dKoefToMM * this.STYLE_THUMBNAIL_WIDTH;

			graphics.transform(1, 0, 0, 1, 0, 0);
			graphics.save();
			graphics._s();
			graphics._m(-0.5, y);
			graphics._l(w, y);
			graphics._l(w, b);
			graphics._l(0, b);
			graphics._z();
			graphics.clip();

			graphics.t(this.CurrentTranslate.StylesText, 0.5, (y + b) / 2);

			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.fillStyle = "#E8E8E8";

			var _b = this.STYLE_THUMBNAIL_HEIGHT - 1.5;
			var _x = 2;
			var _w = this.STYLE_THUMBNAIL_WIDTH - 4;
			var _h = (this.STYLE_THUMBNAIL_HEIGHT / 3) >> 0;
			ctx.beginPath();
			ctx.moveTo(_x, _b - _h);
			ctx.lineTo(_x + _w, _b - _h);
			ctx.lineTo(_x + _w, _b);
			ctx.lineTo(_x, _b);
			ctx.closePath();
			ctx.fill();

			ctx.lineWidth = 1;
			ctx.strokeStyle = "#D8D8D8";
			ctx.beginPath();
			ctx.rect(0.5, 0.5, this.STYLE_THUMBNAIL_WIDTH - 1, this.STYLE_THUMBNAIL_HEIGHT - 1);

			ctx.stroke();

			graphics.restore();
		}
		else
		{
			g_oTableId.m_bTurnOff = true;
			History.TurnOff();

			var oldDefTabStop = AscCommonWord.Default_Tab_Stop;
			AscCommonWord.Default_Tab_Stop = 1;
			var isShowParaMarks = false;
			if (_api)
			{
				isShowParaMarks = _api.get_ShowParaMarks();
				_api.put_ShowParaMarks(false);
			}

			var hdr = new CHeaderFooter(editor.WordControl.m_oLogicDocument.HdrFtr, editor.WordControl.m_oLogicDocument, editor.WordControl.m_oDrawingDocument, AscCommon.hdrftr_Header);
			var _dc = hdr.Content;//new CDocumentContent(editor.WordControl.m_oLogicDocument, editor.WordControl.m_oDrawingDocument, 0, 0, 0, 0, false, true, false);

			var par = new Paragraph(editor.WordControl.m_oDrawingDocument, _dc, false);
			var run = new ParaRun(par, false);
			run.AddText(styleName);

			_dc.Internal_Content_Add(0, par, false);
			par.Add_ToContent(0, run);
			par.Style_Add(style.Id, false);
			par.Set_Align(AscCommon.align_Left);
			par.Set_Tabs(new CParaTabs());

			if (!textPr.Color || (255 === textPr.Color.r && 255 === textPr.Color.g && 255 === textPr.Color.b))
				run.Set_Color(new CDocumentColor(0, 0, 0, false));

			var _brdL = style.ParaPr.Brd.Left;
			if (undefined !== _brdL && null !== _brdL)
			{
				var brdL = new CDocumentBorder();
				brdL.Set_FromObject(_brdL);
				brdL.Space = 0;
				par.Set_Border(brdL, AscDFH.historyitem_Paragraph_Borders_Left);
			}

			var _brdT = style.ParaPr.Brd.Top;
			if (undefined !== _brdT && null !== _brdT)
			{
				var brd = new CDocumentBorder();
				brd.Set_FromObject(_brdT);
				brd.Space = 0;
				par.Set_Border(brd, AscDFH.historyitem_Paragraph_Borders_Top);
			}

			var _brdB = style.ParaPr.Brd.Bottom;
			if (undefined !== _brdB && null !== _brdB)
			{
				var brd = new CDocumentBorder();
				brd.Set_FromObject(_brdB);
				brd.Space = 0;
				par.Set_Border(brd, AscDFH.historyitem_Paragraph_Borders_Bottom);
			}

			var _brdR = style.ParaPr.Brd.Right;
			if (undefined !== _brdR && null !== _brdR)
			{
				var brd = new CDocumentBorder();
				brd.Set_FromObject(_brdR);
				brd.Space = 0;
				par.Set_Border(brd, AscDFH.historyitem_Paragraph_Borders_Right);
			}

			var _ind = new CParaInd();
			_ind.FirstLine = 0;
			_ind.Left = 0;
			_ind.Right = 0;
			par.Set_Ind(_ind, false);

			var _sp = new CParaSpacing();
			_sp.Line = 1;
			_sp.LineRule = Asc.linerule_Auto;
			_sp.Before = 0;
			_sp.BeforeAutoSpacing = false;
			_sp.After = 0;
			_sp.AfterAutoSpacing = false;
			par.Set_Spacing(_sp, false);

			_dc.Reset(0, 0, 10000, 10000);
			_dc.Recalculate_Page(0, true);

			_dc.Reset(0, 0, par.Lines[0].Ranges[0].W + 0.001, 10000);
			_dc.Recalculate_Page(0, true);
			//par.Reset(0, 0, 10000, 10000, 0);
			//par.Recalculate_Page(0);

			var y = 0;
			var b = dKoefToMM * this.STYLE_THUMBNAIL_HEIGHT;
			var w = dKoefToMM * this.STYLE_THUMBNAIL_WIDTH;
			var off = 10 * dKoefToMM;
			var off2 = 5 * dKoefToMM;
			var off3 = 1 * dKoefToMM;

			graphics.transform(1, 0, 0, 1, 0, 0);
			graphics.save();
			graphics._s();
			graphics._m(off2, y + off3);
			graphics._l(w - off, y + off3);
			graphics._l(w - off, b - off3);
			graphics._l(off2, b - off3);
			graphics._z();
			graphics.clip();

			//graphics.t(style.Name, off + 0.5, y + 0.75 * (b - y));
			var baseline = par.Lines[0].Y;
			par.Shift(0, off + 0.5, y + 0.75 * (b - y) - baseline);
			par.Draw(0, graphics);

			graphics.restore();

			if (_api)
				_api.put_ShowParaMarks(isShowParaMarks);

			AscCommonWord.Default_Tab_Stop = oldDefTabStop;

			g_oTableId.m_bTurnOff = false;
			History.TurnOn();
		}
	}
};
CStylesPainter.prototype.get_MergedStyles = function ()
{
	return this.mergedStyles;
};



function TransformRectByMatrix(m, arr, offX, offY, koefX, koefY)
{
	var ret = [];
	ret.push(offX + koefX * m.TransformPointX(arr[0], arr[1]));
	ret.push(offY + koefY * m.TransformPointY(arr[0], arr[1]));

	ret.push(offX + koefX * m.TransformPointX(arr[2], arr[1]));
	ret.push(offY + koefY * m.TransformPointY(arr[2], arr[1]));

	ret.push(offX + koefX * m.TransformPointX(arr[2], arr[3]));
	ret.push(offY + koefY * m.TransformPointY(arr[2], arr[3]));

	ret.push(offX + koefX * m.TransformPointX(arr[0], arr[3]));
	ret.push(offY + koefY * m.TransformPointY(arr[0], arr[3]));
	return ret;
}

//--------------------------------------------------------export----------------------------------------------------
window['AscCommon'] = window['AscCommon'] || {};
window['AscCommonWord'] = window['AscCommonWord'] || {};
window['AscCommon'].CPage = CPage;
window['AscCommon'].CDrawingDocument = CDrawingDocument;

window['AscCommonWord'].CStylesPainter = CStylesPainter;
CStylesPainter.prototype['get_MergedStyles'] = CStylesPainter.prototype.get_MergedStyles;
