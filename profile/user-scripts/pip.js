var panel = new _panel({ custom_background : true });
var pip = new _pip();
var volume = new _volume();
var buttons = new _buttons();

var bx = 0;
var by = 0;

panel.item_focus_change();

function _pip() {
	this.metadb_changed = function () {
		var img = null;
		if (panel.metadb) {
			img = panel.metadb.GetAlbumArt(0);

			if (this.img) this.img.Dispose();
			if (this.blurred) this.blurred.Dispose();
			this.img = this.blurred = null;
			if (img) {
				this.img = img;
				this.blurred = this.img.Clone();
				this.blurred.StackBlur(200);
				this.grayscale = this.img.Clone();
				this.grayscale.ApplyEffect(0);
			}
		}
	}
	
	this.trace = function (x, y) { return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h; }

	this.lbtn_dblclk = function (x, y) {
		fb.RunMainMenuCommand('View/Activate or hide');
	}

	this.leave = function () {
		if (this.hover) {
			this.hover = false;
			this.repaint();
		}
	}

	this.move = function (x, y) {
		if (this.trace(x, y)) {
			this.hover = true;
			this.repaint();
			return true;
		} else {
			this.leave();
			return false;
		}
	}

	this.repaint = function () {
		window.RepaintRect(this.x, this.y, this.w, this.h);
	}

	this.size = function () { this.x = 0; this.y = 0; this.w = panel.w; this.h = panel.h; }

	this.paint = function (gr) {
		if (this.img) {
			_drawImage(gr, this.blurred, 0, 0, panel.w, panel.h, image.stretch);
			_drawOverlay(gr, 0, 0, panel.w, panel.h, 100);
			_drawImage(gr, fb.IsPaused ? this.grayscale : this.img, this.x, this.y, this.w, this.h, image.centre);
		} else {
			gr.WriteText('NO\n COVER', panel.fonts.title, panel.colours.blend, this.x, this.y, this.w, this.h, 2, 2);
		}
		if (this.hover) {
			FillGradientRectangle(gr, 0, 0, panel.w, panel.row_height * 4, 0, 0x96000000, 0x00000000);
			FillGradientRectangle(gr, 0, panel.h - panel.row_height * 4, panel.w, panel.row_height * 4, 0, 0x00000000, 0x96000000);
			gr.WriteText(panel.tf(tfo.title), panel.fonts.title, 0xffffffff, this.x + LM * 2, this.y + LM * 2, this.w - panel.bs - LM * 4, panel.row_height, 0, 2, 1, 1);
			gr.WriteText(panel.tf(tfo.artist), panel.fonts.title, 0xffffffff, this.x + LM * 2, this.y + LM * 2 + panel.row_height, this.w - panel.bs - LM * 4, panel.row_height, 0, 2, 1, 1);
		}
	}

	this.x = 0;
	this.y = 0;
	this.w = 0;
	this.h = 0;
	this.img = null;
	this.blurred = null;
	this.hover = false;
}

function _volume() {
	this.vol2percentage = function (v) {
		return (Math.pow(10, v / 50) - 0.01) / 0.99;
	}

	this.wheel = function (s) {
		if (s == 1) {
			fb.VolumeUp();
		} else {
			fb.VolumeDown();
		}
	}

	this.size = function () {
		this.x = LM * 2;
		this.y = LM * 2 + panel.row_height * 2;
		this.w = panel.w;
		this.h = panel.row_height;
	}

	this.paint = function (gr) {
		if (this.timer) {
			this.str = Math.ceil(this.vol2percentage(fb.Volume) * 100) + '%';
			gr.WriteText(this.str, panel.fonts.title, 0xffffffff, this.x, this.y, this.w, this.h, 0, 2);
		}
	}

	this.timer = 0;
}

buttons.update = function () {
	buttons.buttons.ext = new _button(panel.w - panel.bs * 1.25, panel.bs * 0.25, panel.bs, panel.bs, {}, { char : chars.close, colour: 0xffffffff }, function () { fb.RunMainMenuCommand('View/Flowin/Picture in picture/Show'); }, '');

	bx = panel.w * 0.5 - panel.bs * 0.5;
	by = panel.h - panel.bs * 2;
	buttons.buttons.prev = new _button(bx - panel.bs * 1.5, by, panel.bs, panel.bs, { char : chars.prev, colour : 0xffffffff }, { char : chars.prev, colour : 0xffffffff, bg : 0x96000000 }, function () { fb.Prev(); }, '');
	buttons.buttons.play = new _button(bx, by, panel.bs, panel.bs, { char : fb.IsPlaying ? !fb.IsPlaying || fb.IsPaused ? chars.play : chars.pause : chars.stop, colour : 0xffffffff }, { char : fb.IsPlaying ? !fb.IsPlaying || fb.IsPaused ? chars.play : chars.pause : chars.stop, colour : 0xffffffff, bg : 0x96000000 }, function () { fb.PlayOrPause(); }, '');
	buttons.buttons.next = new _button(bx + panel.bs * 1.5, by, panel.bs, panel.bs, { char : chars.next, colour : 0xffffffff }, { char : chars.next, colour : 0xffffffff, bg : 0x96000000 }, function () { fb.Next(); }, '');
}

buttons.shuffle = function () {
	if (plman.PlaybackOrder !== 4) {
		plman.PlaybackOrder = 4;
	}
	else {
		plman.PlaybackOrder = 0;
	}
	window.Repaint();
}

buttons.repeat = function () {
	if (plman.PlaybackOrder < 2) {
		plman.PlaybackOrder += 1;
	} else if (plman.PlaybackOrder === 2) {
		plman.PlaybackOrder = 0;
	} else {
		plman.PlaybackOrder = 1;
	}
	window.Repaint();
}

function on_colours_changed() { panel.colours_changed(); buttons.update(); window.Repaint(); }
function on_font_changed() { panel.font_changed(); }
function on_item_focus_change() { if (panel.selection.value == 0 && fb.IsPlaying) return; panel.item_focus_change(); buttons.update(); }
function on_key_down(vkey) { panel.key_down(vkey); }
function on_metadb_changed() { pip.metadb_changed(); window.Repaint(); }
function on_mouse_lbtn_dblclk(x, y) { pip.lbtn_dblclk(x, y); }
function on_mouse_lbtn_down(x, y) {}
function on_mouse_lbtn_up(x, y) { buttons.lbtn_up(x, y); }
function on_mouse_leave() { pip.leave(); buttons.leave(); }
function on_mouse_move(x, y) { pip.move(x, y); buttons.move(x, y); }
function on_mouse_rbtn_up(x, y) { return true; }
function on_mouse_wheel(s) { return panel.wheel(s, volume); }
function on_playback_dynamic_info_track() { if (type == 1) panel.item_focus_change(); }
function on_playback_edited() {}
function on_playback_new_track() { panel.item_focus_change(); buttons.update(); }
function on_playback_order_changed () { buttons.update(); }
function on_playback_seek() {}
function on_playback_stop(reason) { if (reason != 2) { panel.item_focus_change(); } buttons.update(); }
function on_playback_pause() { buttons.update(); window.Repaint(); }
function on_playback_starting() { buttons.update(); }
function on_playlist_stop_after_current_changed() { buttons.update(); window.Repaint(); }
function on_playlist_switch() { if (panel.selection.value == 0 && fb.IsPlaying) return; panel.item_focus_change(); buttons.update(); }
function on_volume_change() { if (volume.timer) window.ClearTimeout(volume.timer); volume.timer = window.SetTimeout(function () { volume.timer = 0; window.Repaint(); }, 1500); window.Repaint(); }
function on_size() { panel.size(); pip.size(); volume.size(); buttons.update(); }
function on_paint(gr) { panel.paint(gr); pip.paint(gr); volume.paint(gr); pip.hover && buttons.paint(gr); }
