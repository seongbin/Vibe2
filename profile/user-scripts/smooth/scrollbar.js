cScrollBar = {
	visible: true,
	ButtonType: { cursor: 0, up: 1, down: 2 },
	minCursorHeight: scale(utils.GetSystemMetrics(3) * 2),
	timerID: false,
	timerCounter: -1
};

function oScrollbar(parent) {
	this.x = 0;
	this.y = 0;
	this.w = 0;
	this.h = 0;
	this.buttons = new Array(3);
	this.buttonClick = false;

	this.repaint = function () {
		this.setCursorButton();
	}

	this.setCursorButton = function () {
		var gb;

		this.cursorImage_normal = utils.CreateImage(this.cursorw, this.cursorh);
		gb = this.cursorImage_normal.GetGraphics();
		gb.FillRoundedRectangle(this.cursorw * 0.25, 0, this.cursorw * 0.5, this.cursorh, this.cursorw * 0.25, this.cursorw * 0.25, setAlpha(g_colour_text, 24));
		this.cursorImage_normal.ReleaseGraphics();

		this.cursorImage_hover = utils.CreateImage(this.cursorw, this.cursorh);
		gb = this.cursorImage_hover.GetGraphics();
		gb.FillRoundedRectangle(this.cursorw * 0.25, 0, this.cursorw * 0.5, this.cursorh, this.cursorw * 0.25, this.cursorw * 0.25, setAlpha(g_colour_text, 48));
		this.cursorImage_hover.ReleaseGraphics();

		this.cursorImage_down = utils.CreateImage(this.cursorw, this.cursorh);
		gb = this.cursorImage_down.GetGraphics();
		gb.FillRoundedRectangle(this.cursorw * 0.25, 0, this.cursorw * 0.5, this.cursorh, this.cursorw * 0.25, this.cursorw * 0.25, setAlpha(g_colour_text, 96));
		this.cursorImage_down.ReleaseGraphics();

		this.buttons[cScrollBar.ButtonType.cursor] = new button(this.cursorImage_normal, this.cursorImage_hover, this.cursorImage_down);
		this.buttons[cScrollBar.ButtonType.cursor].x = this.x;
		this.buttons[cScrollBar.ButtonType.cursor].y = this.cursory;
	}

	this.paint = function (gr) {
		if (cScrollBar.visible) {
			this.buttons[cScrollBar.ButtonType.cursor].paint(gr, this.x, this.cursory, 200);
		}
	}

	this.updateScrollbar = function () {
		var prev_cursorh = this.cursorh;
		this.total = typeof parent.rowsCount == "number" ? parent.rowsCount : parent.rows.length;
		this.rowh = typeof parent.rowHeight == "number" ? parent.rowHeight : ppt.rowHeight;
		this.totalh = this.total * this.rowh;
		cScrollBar.visible = this.totalh > parent.h;
		this.cursorw = this.w;
		if (this.total > 0) {
			this.cursorh = Math.round((parent.h / this.totalh) * this.h);
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
		var ratio = scroll / (this.totalh - parent.h);
		this.cursory = this.y + Math.round((this.h - this.cursorh) * ratio);
	}

	this.size = function () {
		this.x = parent.x + parent.w;
		this.y = parent.y;
		this.w = g_margin + scale(11);
		this.h = parent.h;
	}

	this.setScrollFromCursorPos = function () {
		var ratio = (this.cursory - this.y) / (this.h - this.cursorh);
		scroll = Math.round((this.totalh - parent.h) * ratio);
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
				parent.repaint();
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
				parent.repaint();
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

		var scroll_step_page = parent.h;

		switch (event) {
		case "lbtn_down":
		case "lbtn_dblclk":
			if ((this.hover_cursor || this.cursorDrag) && !this.buttonClick && !this.hover_empty) {
				this.cursorCheck(event, x, y);
			} else {
				if (!this.buttonClick && this.hover_empty) {
					if (y < this.cursory) {
						this.buttonClick = true;
						scroll = scroll - scroll_step_page;
						scroll = check_scroll(scroll);
						if (!cScrollBar.timerID) {
							cScrollBar.timerID = window.SetInterval(function () {
								if (cScrollBar.timerCounter > 6 && m_y < parent.scrollbar.cursory) {
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
								if (cScrollBar.timerCounter > 6 && m_y > parent.scrollbar.cursory + parent.scrollbar.cursorh) {
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
			this.buttonClick = false;
			break;
		case "move":
			this.cursorCheck(event, x, y);
			break;
		case "wheel":
			if (!this.buttonClick) {
				this.updateScrollbar();
			}
			break;
		}
	}
}
