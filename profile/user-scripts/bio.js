var panel = new _panel({ custom_background: true });
var lastfm = new _lastfm();
var text = new _text('lastfm_bio');
var thumbs = new _thumbs();
var buttons = new _buttons();

thumbs.properties.cycle.value = 0;
thumbs.properties.double_click_mode.value = 2;

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
			buttons.update();
			window.Repaint();
		}
		return true;
	}
	return false;
}

buttons.update = function () {
	buttons.buttons.layout = new _button(thumbs.x + thumbs.w - panel.bs * 1.25, thumbs.y + panel.bs * 0.25, panel.bs, panel.bs, { char: thumbs.properties.layout.value ? chars.vertical: chars.horizental, colour: 0xffffffff, bg: 0x96000000 }, { char: thumbs.properties.layout.value ? chars.horizental: chars.vertical, colour: 0xffffffff, bg: 0xff000000 }, function () { thumbs.properties.layout.value ? thumbs.properties.layout.value -= 1: thumbs.properties.layout.value += 1; on_size(); window.Repaint(); }, thumbs.properties.layout.value ? 'Horizental split': 'Vertical split');
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
}

function on_item_focus_change() {
	if (panel.selection.value == 0 && fb.IsPlaying) return;
	panel.item_focus_change();
}

function on_key_down(k) {
	panel.key_down(k);
	// text.key_down(k);
	// thumbs.key_down(k);
	switch (k) {
	case VK_F5:
		text.get();
		text.get_extra();
		break;
	case VK_DELETE:
		if (thumbs.images.length) {
			utils.RemovePath(thumbs.images[thumbs.image].Path);
			thumbs.update();
		}
		break;
	}
	if (utils.IsKeyPressed(VK_CONTROL) && k == 48) {
		thumbs.properties.ratio.value = 0.5;
		on_size();
		window.Repaint();
	}
}

function on_metadb_changed(handles, fromhook) {
	if (fromhook) return;
	text.metadb_changed();
	thumbs.metadb_changed();
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
	if (utils.IsKeyPressed(VK_CONTROL)) {
		var value = _clamp(thumbs.properties.ratio.value - (s * 0.05), 0.2, 0.8);
		if (value != thumbs.properties.ratio.value) {
			thumbs.properties.ratio.value = value;
			on_size();
			window.Repaint();
		}
	} else if (utils.IsKeyPressed(VK_SHIFT)) {
		panel.wheel(s);
	} else {
		thumbs.wheel(s);
		text.wheel(s);
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

	switch (thumbs.properties.layout.value) {
		case 0:
			thumbs.x = TM;
			thumbs.y = TM;
			thumbs.w = panel.w - TM * 2;
			thumbs.h = panel.h * thumbs.properties.ratio.value;

			text.x = TM;
			text.y = thumbs.x + thumbs.h + TM;
			text.w = panel.w - TM * 2;
			text.h = panel.h - thumbs.y - thumbs.h - TM * 2;
			break;
		case 1:
			thumbs.x = TM;
			thumbs.y = TM;
			thumbs.w = panel.w * thumbs.properties.ratio.value;
			thumbs.h = panel.h - TM * 2;
	
			text.x = thumbs.x + thumbs.w + TM;
			text.y = TM;
			text.w = panel.w - thumbs.w - TM * 3;
			text.h = panel.h - TM * 2;
			break;
	}
	text.size();

	buttons.update();
}