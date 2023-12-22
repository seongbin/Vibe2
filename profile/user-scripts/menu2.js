var panel = new _panel({ custom_background : true });
var menu = new Array();
var active = new _p('2K3.ACTIVE', 0);

panel.item_focus_change();

function _textbutton(text, x, y) {
	this.text = text;
	this.x = x;
	this.y = y;
	this.w = panel.calc_text_width(this.text) + LM * 4;
	this.h = panel.h;
	this.state = 0;

	this.repaint = function () {
		window.RepaintRect(this.x, this.y, this.w, this.h);
	}

	this.trace = function (x, y) {
		return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
	}

	this.lbtn_down = function (x, y) {
		this.old = this.state;
		switch (this.state) {
			case 0:
			case 1:
				this.state = this.trace(x, y) ? 2 : 0;
				this.isdown = true;
				break;
		}
		if (this.state != this.old) this.repaint();
		return this.state;
	}

	this.lbtn_up = function (x, y) {
		this.old = this.state;
		this.state = this.trace(x, y) ? 1 : 0;
		this.isdown = false;
		if (this.state != this.old) this.repaint();
		return this.state;
	}

	this.leave = function () {
		this.old = this.state;
		this.state = this.isdown ? 2 : 0;
		if (this.state != this.old) this.repaint();
		return this.state;
	}

	this.move = function (x, y) {
		this.old = this.state;
		switch (this.state) {
			case 0:
			case 1:
				this.state = this.trace(x, y) ? 1 : 0;
				break;
		}
		if (this.state != this.old) this.repaint();
		return this.state;
	}

	this.paint = function (gr, active) {
		this.col = [panel.colours.blend, panel.colours.text, panel.colours.text];
		gr.FillRectangle(this.x, this.y, this.w, this.h, active ? panel.colours.highlight : 0);
		gr.WriteText(this.text, panel.fonts.normal, active ? DetermineTextColour(panel.colours.highlight) : this.col[this.state], this.x, this.y, this.w, this.h, 2, 2);
	}
}

function on_colours_changed() { panel.colours_changed(); window.Repaint(); }
function on_font_changed() { panel.font_changed(); on_size(); window.Repaint(); }
function on_key_down(vkey) { return panel.key_down(vkey); }
function on_mouse_lbtn_dblclk(x, y) { return true; }
function on_mouse_lbtn_down(x, y) { menu.pls.lbtn_down(x, y); menu.bio.lbtn_down(x, y); }
function on_mouse_lbtn_up(x, y) { menu.pls.lbtn_up(x, y) && active.value != 0 && window.NotifyOthers('SCRIPT', 0); menu.bio.lbtn_up(x, y) && active.value != 1 && window.NotifyOthers('SCRIPT', 1); }
function on_mouse_leave() { menu.pls.leave(); menu.bio.leave(); }
function on_mouse_move(x, y) { menu.pls.move(x, y); menu.bio.move(x, y); }
function on_mouse_rbtn_up(x, y) { return true; }
function on_mouse_wheel(step) { return panel.wheel(step); }
function on_notify_data(name, info) {
	if (name == 'ACTIVE') {
		active.value = info;
		window.Repaint();
	}
}
function on_size() {
  panel.size();
	menu.pls = new _textbutton('Playlist', 0, 0);
	menu.bio = new _textbutton('Biography', menu.pls.x + menu.pls.w, 0);
  window.MinHeight = window.MaxHeight = panel.row_height * 1.5;
}
function on_paint(gr) {
  panel.paint(gr);
  menu.pls.paint(gr, active.value == 0 ? true : false);
	menu.bio.paint(gr, active.value == 1 ? true : false);
}