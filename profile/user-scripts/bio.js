var panel = new _panel({ custom_colour : true });
var lastfm = new _lastfm();
var text = new _text('lastfm_bio');
var thumbs = new _thumbs();
var buttons = new _buttons();

thumbs.properties.cycle.value = 0;

text.paint = function (gr) {
	if (this.text_layout) {
		gr.WriteTextLayout(this.text_layout, panel.colours.text, this.x, this.y, this.w, this.h, this.offset);
	} else {
		gr.WriteText('Nothing found', panel.fonts.normal, panel.colours.blend, this.x, this.y, this.w, this.h, this.offset);
	}
}

thumbs.image_containsxXY = function (x, y) {
	return this.images.length && this.containsXY(x, y);
}

thumbs.move = function (x, y) {
	this.mx = x;
	this.my = y;
	return this.containsXY(x, y);
}

thumbs.paint = function (gr) {
	if (this.images.length) {
		var img = thumbs.images[thumbs.image];
		var grayscale = img.Clone();
		grayscale.ApplyEffect(0);
		this.image_xywh = _drawImage(gr, img, this.x, this.y, this.w, this.h, image.crop_top);
	} else {
		this.image_xywh = [];
		gr.FillRectangle(this.x, this.y, this.w, this.h, 0xff000000);
	}
	gr.FillRectangle(this.x, this.y, this.w, this.h, 0x48000000);
	DrawStyledText(gr, text.header_text(), panel.fonts.title, 0xffffffff, this.x + TM, this.y + TM, this.w - TM * 2, TM, 0, 2, 1, 1);
}

thumbs.wheel = function (s) {
	if (this.containsXY(this.mx, this.my)) {
		if (this.images.length > 1) {
			this.image -= s;
			if (this.image < 0) {
				this.image = this.images.length - 1;
			}
			if (this.image >= this.images.length) {
				this.image = 0;
			}
			buttons.check_default_file();
			window.Repaint();
		}
		return true;
	}
	return false;
}

buttons.update = function () {
	buttons.buttons.delete = new _button(thumbs.x + thumbs.w - panel.bs * 1.25, thumbs.y + panel.bs * 0.25, panel.bs, panel.bs, { char : chars.delete, colour: thumbs.images.length ? 0xffffffff : panel.colours.blend }, { char : chars.delete, colour: thumbs.images.length ? 0xffffffff : panel.colours.blend, bg : thumbs.images.length ? 0x96000000 : 0x48000000 }, function () { if (thumbs.images.length) { utils.RemovePath(thumbs.images[thumbs.image].Path); thumbs.update(); } }, thumbs.images.length ? 'Delete image' : '');
	buttons.buttons.download = new _button(thumbs.x + thumbs.w - panel.bs * 2.25, thumbs.y + panel.bs * 0.25, panel.bs, panel.bs, { char : chars.download, colour: 0xffffffff }, { char : chars.download, colour: 0xffffffff, bg : 0x96000000 }, function () { thumbs.download(); }, 'Download now');
	buttons.buttons.default_file = new _button(thumbs.x + thumbs.w - panel.bs * 3.25, thumbs.y + panel.bs * 0.25, panel.bs, panel.bs, { char : buttons.check_default_file() ? chars.heart_on : chars.heart_off, colour: buttons.check_default_file() ? colours.Red : 0xffffffff }, { char : buttons.check_default_file() ? chars.heart_break : chars.heart_on, colour: colours.Red, bg : 0x96000000 }, function () { try { buttons.check_default_file() ? thumbs.set_default(undefined) : thumbs.set_default(thumbs.images[thumbs.image].Path.split('\\').pop()); } catch (e) {} }, buttons.check_default_file() ? 'Clear default' : 'Set as default');
	buttons.buttons.force = new _button(text.x + text.w - panel.bs * 1.25, thumbs.y + thumbs.h - panel.bs * 1.25, panel.bs, panel.bs, { char : chars.update, colour: 0xffffffff }, { char : chars.update, colour: 0xffffffff, bg : 0x96000000 }, function () { text.get(); text.get_extra(); }, 'Force update');
	buttons.buttons.folder_open = new _button(text.x + text.w - panel.bs * 2.25, thumbs.y + thumbs.h - panel.bs * 1.25, panel.bs, panel.bs, { char : chars.folder_open, colour: 0xffffffff }, { char : chars.folder_open, colour: 0xffffffff, bg : 0x96000000 }, function () { try { buttons.folder_open(); } catch (e) {} }, 'Open containing folder');
}

buttons.folder_open = function () {
	switch (true) {
		case text.properties.extra && utils.IsFile(text.filename_extra):
		_explorer(text.filename_extra);
		break;
		case utils.IsFile(text.filename):
		_explorer(text.filename);
		break;
		case utils.IsFolder(thumbs.folder):
		_explorer(thumbs.images[thumbs.image].Path);
		break;
	}
}

buttons.check_default_file = function () {
	if (thumbs.images.length) {
		return thumbs.images[thumbs.image].Path == thumbs.default_file;
	}
}

panel.item_focus_change();

function on_colours_changed() {
	panel.colours_changed();
	buttons.update();
	window.Repaint();
}

function on_download_file_done(path, success, error_text) {
	text.download_file_done(path, success, error_text);
}

function on_font_changed() {
	panel.font_changed();
	window.Repaint();
}

function on_http_request_done(task_id, success, response_text) {
	thumbs.http_request_done(task_id, success, response_text);
	text.http_request_done(task_id, success, response_text);
	buttons.update();
}

function on_item_focus_change() {
	if (panel.selection.value == 0 && fb.IsPlaying) return;
	panel.item_focus_change();
	buttons.check_default_file();
	buttons.update();
}

function on_key_down(k) {
	text.key_down(k);
	thumbs.key_down(k);
}

function on_metadb_changed(handles, fromhook) {
	if (fromhook) return;
	text.metadb_changed();
	thumbs.metadb_changed();
	buttons.check_default_file();
	buttons.update();
}

function on_mouse_leave() {
	buttons.leave();
}

function on_mouse_lbtn_up(x, y) {
	text.lbtn_up(x, y);
	buttons.lbtn_up(x, y);
	buttons.update();
}

function on_mouse_move(x, y) {
	text.move(x, y);
	thumbs.move(x, y);
	buttons.move(x, y);
}

function on_mouse_lbtn_dblclk(x, y) {
	thumbs.lbtn_dblclk(x, y);
}

function on_mouse_rbtn_up(x, y) {
	// if (text.containsXY(x, y)) {
	// 	return panel.rbtn_up(x, y, text);
	// }
	// return panel.rbtn_up(x, y, thumbs);
	return true;
}

function on_mouse_wheel(s) {
	if (utils.IsKeyPressed(VK_SHIFT)) {
		var value = _clamp(thumbs.properties.ratio.value - (s * 0.05), 0.2, 0.8);
		if (value != thumbs.properties.ratio.value) {
			thumbs.properties.ratio.value = value;
			on_size();
			window.Repaint();
		}
	} else if (utils.IsKeyPressed(VK_CONTROL)) {
		panel.wheel(s);
	} else {
		thumbs.wheel(s);
		text.wheel(s);
		buttons.update();
	}
}

function on_paint(gr) {
	panel.paint(gr);
	thumbs.paint(gr);
	text.paint(gr);
	buttons.paint(gr);
}

function on_playback_dynamic_info_track(type) {
	if (type == 0) {
		text.metadb_changed();
		thumbs.playback_new_track();
		buttons.update();
	}
}

function on_playback_new_track() {
	panel.item_focus_change();
	thumbs.playback_new_track();
	buttons.update();
}

function on_playback_stop(reason) {
	if (reason != 2) {
		panel.item_focus_change();
	}
}

function on_playback_time() {
	thumbs.playback_time();
}

function on_playlist_switch() {
	on_item_focus_change();
}

function on_size() {
	panel.size();

	thumbs.x = TM;
	thumbs.y = TM;
	thumbs.w = panel.w - TM * 2;
	thumbs.h = panel.h * thumbs.properties.ratio.value;

	text.x = TM;
	text.y = thumbs.x + thumbs.h + TM;
	text.w = panel.w - TM * 2;
	text.h = panel.h - thumbs.y - thumbs.h - TM * 2;

	text.size();

	buttons.update();
}