var cScrollBar = {
	visible: true,
	ButtonType: { cursor: 0, up: 1, down: 2 },
	defaultMinCursorHeight: utils.GetSystemMetrics(3) * 2,
	minCursorHeight: scale(utils.GetSystemMetrics(3) * 2),
	timerID: false,
	timerCounter: -1
};

function oScrollbar() {
	this.buttons = new Array(3);
	this.buttonClick = false;

	this.repaint = function () {
		this.setButtons();
		this.setCursorButton();
	}

	this.setButtons = function () {
		var gb;
		var font = _font("Segoe Fluent Icons", Math.round(this.w * 0.25));

		this.upImage_normal = utils.CreateImage(this.w, this.w);
		gb = this.upImage_normal.GetGraphics();
		gb.WriteText('\uf090', font, setAlpha(g_colour_text, 96), 0, 0, this.w, this.w, 2, 2);
		this.upImage_normal.ReleaseGraphics();

		this.upImage_hover = utils.CreateImage(this.w, this.w);
		gb = this.upImage_hover.GetGraphics();
		gb.WriteText('\uf090', font, setAlpha(g_colour_text, 128), 0, 0, this.w, this.w, 2, 2);
		this.upImage_hover.ReleaseGraphics();

		this.upImage_down = utils.CreateImage(this.w, this.w);
		gb = this.upImage_down.GetGraphics();
		gb.WriteText('\uf090', font, g_colour_text, 0, 0, this.w, this.w, 2, 2);
		this.upImage_down.ReleaseGraphics();

		this.downImage_normal = utils.CreateImage(this.w, this.w);
		gb = this.downImage_normal.GetGraphics();
		gb.WriteText('\uf08e', font, setAlpha(g_colour_text, 96), 0, 0, this.w, this.w, 2, 2);
		this.downImage_normal.ReleaseGraphics();

		this.downImage_hover = utils.CreateImage(this.w, this.w);
		gb = this.downImage_hover.GetGraphics();
		gb.WriteText('\uf08e', font, setAlpha(g_colour_text, 128), 0, 0, this.w, this.w, 2, 2);
		this.downImage_hover.ReleaseGraphics();

		this.downImage_down = utils.CreateImage(this.w, this.w);
		gb = this.downImage_down.GetGraphics();
		gb.WriteText('\uf08e', font, g_colour_text, 0, 0, this.w, this.w, 2, 2);
		this.downImage_down.ReleaseGraphics();

		/*
		this.theme = window.CreateThemeManager("scrollbar");

		this.upImage_normal = utils.CreateImage(this.w, this.w);
    gb = this.upImage_normal.GetGraphics();
		this.theme.SetPartAndStateID(1, 1);
		this.theme.DrawThemeBackground(gb, 0, 0, this.w, this.w);
    this.upImage_normal.ReleaseGraphics();

		this.upImage_hover = utils.CreateImage(this.w, this.w);
    gb = this.upImage_hover.GetGraphics();
		this.theme.SetPartAndStateID(1, 2);
		this.theme.DrawThemeBackground(gb, 0, 0, this.w, this.w);
    this.upImage_hover.ReleaseGraphics();

		this.upImage_down = utils.CreateImage(this.w, this.w);
    gb = this.upImage_down.GetGraphics();
		this.theme.SetPartAndStateID(1, 3);
		this.theme.DrawThemeBackground(gb, 0, 0, this.w, this.w);
    this.upImage_down.ReleaseGraphics();

		this.downImage_normal = utils.CreateImage(this.w, this.w);
    gb = this.downImage_normal.GetGraphics();
		this.theme.SetPartAndStateID(1, 5);
		this.theme.DrawThemeBackground(gb, 0, 0, this.w, this.w);
    this.downImage_normal.ReleaseGraphics();

		this.downImage_hover = utils.CreateImage(this.w, this.w);
    gb = this.downImage_hover.GetGraphics();
		this.theme.SetPartAndStateID(1, 6);
		this.theme.DrawThemeBackground(gb, 0, 0, this.w, this.w);
    this.downImage_hover.ReleaseGraphics();

		this.downImage_down = utils.CreateImage(this.w, this.w);
    gb = this.downImage_down.GetGraphics();
		this.theme.SetPartAndStateID(1, 7);
		this.theme.DrawThemeBackground(gb, 0, 0, this.w, this.w);
    this.downImage_down.ReleaseGraphics();
		*/

		this.buttons[cScrollBar.ButtonType.up] = new button(this.upImage_normal, this.upImage_hover, this.upImage_down);
		this.buttons[cScrollBar.ButtonType.down] = new button(this.downImage_normal, this.downImage_hover, this.downImage_down);
	}

	this.setCursorButton = function () {
		var gb;

		this.cursorImage_normal = utils.CreateImage(this.cursorw, this.cursorh);
		gb = this.cursorImage_normal.GetGraphics();
		gb.FillRoundedRectangle(Math.round(this.cursorw * 0.25), 0, Math.round(this.cursorw * 0.5), this.cursorh, Math.round(this.cursorw * 0.25), Math.round(this.cursorw * 0.25), setAlpha(g_colour_text, 24));
		this.cursorImage_normal.ReleaseGraphics();

		this.cursorImage_hover = utils.CreateImage(this.cursorw, this.cursorh);
		gb = this.cursorImage_hover.GetGraphics();
		gb.FillRoundedRectangle(Math.round(this.cursorw * 0.25), 0, Math.round(this.cursorw * 0.5), this.cursorh, Math.round(this.cursorw * 0.25), Math.round(this.cursorw * 0.25), setAlpha(g_colour_text, 48));
		this.cursorImage_hover.ReleaseGraphics();

		this.cursorImage_down = utils.CreateImage(this.cursorw, this.cursorh);
		gb = this.cursorImage_down.GetGraphics();
		gb.FillRoundedRectangle(Math.round(this.cursorw * 0.25), 0, Math.round(this.cursorw * 0.5), this.cursorh, Math.round(this.cursorw * 0.25), Math.round(this.cursorw * 0.25), setAlpha(g_colour_text, 96));
		this.cursorImage_down.ReleaseGraphics();

		this.buttons[cScrollBar.ButtonType.cursor] = new button(this.cursorImage_normal, this.cursorImage_hover, this.cursorImage_down);
		this.buttons[cScrollBar.ButtonType.cursor].x = this.x;
		this.buttons[cScrollBar.ButtonType.cursor].y = this.cursory;
	}

	this.paint = function (gr) {
		if (cScrollBar.visible) {
			this.buttons[cScrollBar.ButtonType.cursor].paint(gr, this.x, this.cursory, 200);
		}
		// this.buttons[cScrollBar.ButtonType.up].paint(gr, this.x, this.y, 200);
		// this.buttons[cScrollBar.ButtonType.down].paint(gr, this.x, this.y + this.h, 200);
	}

	this.updateScrollbar = function () {
		var prev_cursorh = this.cursorh;
		this.total = typeof brw.rowsCount == "number" ? brw.rowsCount : brw.rows.length;
		this.rowh = typeof brw.rowHeight == "number" ? brw.rowHeight : ppt.rowHeight;
		this.totalh = this.total * this.rowh;
		cScrollBar.visible = this.totalh > brw.h;
		this.cursorw = this.w;
		if (this.total > 0) {
			this.cursorh = Math.round((brw.h / this.totalh) * this.h);
			if (this.cursorh < cScrollBar.minCursorHeight)
				this.cursorh = cScrollBar.minCursorHeight;
		} else {
			this.cursorh = cScrollBar.minCursorHeight;
		}
		this.setCursorY();
		if (this.cursorw && this.cursorh && this.cursorh != prev_cursorh)
			this.setCursorButton();
	}

	this.setCursorY = function () {
		var ratio = scroll / (this.totalh - brw.h);
		this.cursory = this.y + Math.round((this.h - this.cursorh) * ratio);
	}

	this.size = function () {
		this.x = brw.x + brw.w;
		this.y = brw.y - ppt.headerBarHeight * 0;
		this.w = scale(g_fsize.value + 4);
		this.h = brw.h + ppt.headerBarHeight * 0;
		this.setButtons();
	}

	this.setScrollFromCursorPos = function () {
		var ratio = (this.cursory - this.y) / (this.h - this.cursorh);
		scroll = Math.round((this.totalh - brw.h) * ratio);
	}

	this.cursorCheck = function (event, x, y) {
		if (!this.buttons[cScrollBar.ButtonType.cursor])
			return;
		switch (event) {
		case "lbtn_down":
			var tmp = this.buttons[cScrollBar.ButtonType.cursor].checkstate(event, x, y);
			if (tmp == ButtonStates.down) {
				this.cursorClickX = x;
				this.cursorClickY = y;
				this.cursorDrag = true;
				this.cursorDragDelta = y - this.cursory;
			}
			break;
		case "lbtn_up":
			this.buttons[cScrollBar.ButtonType.cursor].checkstate(event, x, y);
			if (this.cursorDrag) {
				this.setScrollFromCursorPos();
				brw.repaint();
			}
			this.cursorClickX = 0;
			this.cursorClickY = 0;
			this.cursorDrag = false;
			break;
		case "move":
			this.buttons[cScrollBar.ButtonType.cursor].checkstate(event, x, y);
			if (this.cursorDrag) {
				this.cursory = y - this.cursorDragDelta;
				if (this.cursory + this.cursorh > this.y + this.h) {
					this.cursory = (this.y + this.h) - this.cursorh;
				}
				if (this.cursory < this.y) {
					this.cursory = this.y;
				}
				this.setScrollFromCursorPos();
				brw.repaint();
			}
			break;
		}
	}

	this.trace = function (x, y) {
		return (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h);
	}

	this.trace_cursor = function (x, y) {
		return (x >= this.x && x <= this.x + this.w && y >= this.cursory && y <= this.cursory + this.cursorh);
	}

	this.on_mouse = function (event, x, y, delta) {
		this.hover = this.trace(x, y);
		this.hover_cursor = this.trace_cursor(x, y);
		this.hover_buttons = this.hover && !this.hover_cursor;
		this.hover_empty = this.hover && !this.hover_cursor;

		var scroll_step = this.rowh;
		var scroll_step_page = brw.h;

		switch (event) {
		case "lbtn_down":
		case "lbtn_dblclk":
			if ((this.hover_cursor || this.cursorDrag) && !this.buttonClick && !this.hover_empty) {
				this.cursorCheck(event, x, y);
			} else {
				var bt_state = ButtonStates.normal;
				for (var i = 1; i < 3; i++) {
					switch (i) {
					case 1: // up button
						bt_state = this.buttons[i].checkstate(event, x, y);
						if ((event == "lbtn_down" && bt_state == ButtonStates.down) || (event == "lbtn_dblclk" && bt_state == ButtonStates.hover)) {
							this.buttonClick = true;
							scroll = scroll - scroll_step;
							scroll = check_scroll(scroll);
							if (!cScrollBar.timerID) {
								cScrollBar.timerID = window.SetInterval(function () {
									if (cScrollBar.timerCounter > 6) {
										scroll = scroll - scroll_step;
										scroll = check_scroll(scroll);
									} else {
										cScrollBar.timerCounter++;
									}
								}, 80);
							}
						}
						break;
					case 2: // down button
						bt_state = this.buttons[i].checkstate(event, x, y);
						if ((event == "lbtn_down" && bt_state == ButtonStates.down) || (event == "lbtn_dblclk" && bt_state == ButtonStates.hover)) {
							this.buttonClick = true;
							scroll = scroll + scroll_step;
							scroll = check_scroll(scroll);
							if (!cScrollBar.timerID) {
								cScrollBar.timerID = window.SetInterval(function () {
									if (cScrollBar.timerCounter > 6) {
										scroll = scroll + scroll_step;
										scroll = check_scroll(scroll);
									} else {
										cScrollBar.timerCounter++;
									}
								}, 80);
							}
						}
						break;
					}
				}
				if (!this.buttonClick && this.hover_empty) {
					if (y < this.cursory) {
						this.buttonClick = true;
						scroll = scroll - scroll_step_page;
						scroll = check_scroll(scroll);
						if (!cScrollBar.timerID) {
							cScrollBar.timerID = window.SetInterval(function () {
								if (cScrollBar.timerCounter > 6 && m_y < brw.scrollbar.cursory) {
									scroll = scroll - scroll_step_page;
									scroll = check_scroll(scroll);
								} else {
									cScrollBar.timerCounter++;
								}
							}, 80);
						}
					} else {
						this.buttonClick = true;
						scroll = scroll + scroll_step_page;
						scroll = check_scroll(scroll);
						if (!cScrollBar.timerID) {
							cScrollBar.timerID = window.SetInterval(function () {
								if (cScrollBar.timerCounter > 6 && m_y > brw.scrollbar.cursory + brw.scrollbar.cursorh) {
									scroll = scroll + scroll_step_page;
									scroll = check_scroll(scroll);
								} else {
									cScrollBar.timerCounter++;
								}
							}, 80);
						}
					}
				}
			}
			break;
		case "rbtn_up":
		case "lbtn_up":
			if (cScrollBar.timerID) {
				window.ClearInterval(cScrollBar.timerID);
				cScrollBar.timerID = false;
			}
			cScrollBar.timerCounter = -1;

			this.cursorCheck(event, x, y);
			for (var i = 1; i < 3; i++) {
				this.buttons[i].checkstate(event, x, y);
			}
			this.buttonClick = false;
			break;
		case "move":
			this.cursorCheck(event, x, y);
			for (var i = 1; i < 3; i++) {
				this.buttons[i].checkstate(event, x, y);
			}
			break;
		case "wheel":
			if (!this.buttonClick) {
				this.updateScrollbar();
			}
			break;
		}
	}
}
