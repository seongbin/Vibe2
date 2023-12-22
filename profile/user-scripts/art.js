var panel = new _panel({ custom_background : true });
// art
var albumart = new _albumart();
// bio
var lastfm = new _lastfm();
var text = new _text('lastfm_bio');
var thumbs = new _thumbs();
var buttons = new _buttons();

panel.mode = new _p('2K3.PANEL.MODE', 0);
panel.item_focus_change();
panel.selection.value = 1;
thumbs.properties.cycle.value = 0;

function _albumart() {
  this.metadb_changed = function () {
    var img = null;
    if (panel.metadb) {
      img = panel.metadb.GetAlbumArt(this.properties.id.value);

      if (this.img) this.img.Dispose();
      this.img = null;
      if (img) {
        this.img = img;
        this.grayscale = this.img.Clone();
        this.grayscale.ApplyEffect(0);
        this.blurred = this.img.Clone();
        this.blurred.StackBlur(200);
      }
    }
  }

  this.leave = function () {
    if (this.hover) {
      this.repaint();
      this.hover = false;
    }
  }

	this.move = function (x, y) {
    if (this.trace(x, y)) {
      this.hover = true;
      this.repaint();
    }
	}

  this.trace = function (x, y) {
    return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
  }

  this.repaint = function () {
    window.RepaintRect(this.x, this.y, this.w, this.h);
	}

  this.wheel = function (s) {
    var id = this.properties.id.value - s;
    if (id < 0) {
      id = 4;
    }
    if (id > 4) {
      id = 0;
    }
    this.properties.id.value = id;
    panel.item_focus_change();
    return true;
  }

  this.size = function () {
    this.x = 0;
    this.y = 0;
    this.w = panel.w;
    this.h = panel.h;
  }

  this.paint = function (gr) {
    if (this.img) {
      _drawImage(gr, this.blurred, 0, 0, panel.w, panel.h, image.stretch);
      _drawImage(gr, fb.IsPaused ? this.grayscale : this.img, this.x, this.y, this.w, this.h, image.centre);
    } else {
			if ((panel.tf('$if2(%__@%,%path%)').indexOf('http') > -1)) {
				gr.WriteText('Web\nRadios', panel.fonts.title, panel.colours.blend, this.x, this.y, this.w, this.h, 2, 2);
			} else {
				switch (this.properties.id.value) {
				case 0: gr.WriteText('NO\nFRONT COVER', panel.fonts.title, panel.colours.blend, this.x, this.y, this.w, this.h, 2, 2); break;
				case 1: gr.WriteText('NO\nBACK COVER', panel.fonts.title, panel.colours.blend, this.x, this.y, this.w, this.h, 2, 2); break;
				case 2: gr.WriteText('NO\nDISC PICTURE', panel.fonts.title, panel.colours.blend, this.x, this.y, this.w, this.h, 2, 2); break;
				case 3: gr.WriteText('NO\nICON PICTURE', panel.fonts.title, panel.colours.blend, this.x, this.y, this.w, this.h, 2, 2); break;
				case 4: gr.WriteText('NO\nARTIST PICTURE', panel.fonts.title, panel.colours.blend, this.x, this.y, this.w, this.h, 2, 2); break;
				}
			}
		}
  }

  this.properties = {
    id : new _p('2K3.ARTREADER.ID', 0)
  };
}

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
	// buttons.buttons.default_file = new _button(thumbs.x + thumbs.w - panel.bs * 4.25, thumbs.y + thumbs.h - panel.bs * 1.25, panel.bs, panel.bs, { char : buttons.check_default_file() ? chars.heart_on : chars.heart_off, colour: buttons.check_default_file() ? colours.Red : 0x96ffffff, bg : 0x48000000 }, { char : buttons.check_default_file() ? chars.heart_break : chars.heart_on, colour: colours.Red, bg : 0x96000000 }, function () { try { buttons.check_default_file() ? thumbs.set_default(undefined) : thumbs.set_default(thumbs.images[thumbs.image].Path.split('\\').pop()); } catch (e) {} }, buttons.check_default_file() ? 'Clear default' : 'Set as default image');
	// buttons.buttons.download = new _button(thumbs.x + thumbs.w - panel.bs * 3.25, thumbs.y + thumbs.h - panel.bs * 1.25, panel.bs, panel.bs, { char : chars.download, colour: 0x96ffffff, bg : 0x48000000 }, { char : chars.download, colour: 0xffffffff, bg : 0x96000000 }, function () { thumbs.download(); }, 'Download image now');
	// buttons.buttons.force = new _button(thumbs.x + thumbs.w - panel.bs * 2.25, thumbs.y + thumbs.h - panel.bs * 1.25, panel.bs, panel.bs, { char : chars.update, colour: 0x96ffffff, bg : 0x48000000 }, { char : chars.update, colour: 0xffffffff, bg : 0x96000000 }, function () { text.get(); text.get_extra(); }, 'Force update text (F5)');
	// buttons.buttons.folder_open = new _button(thumbs.x + thumbs.w - panel.bs * 1.25, thumbs.y + thumbs.h - panel.bs * 1.25, panel.bs, panel.bs, { char : chars.folder_open, colour: 0x96ffffff, bg : 0x48000000 }, { char : chars.folder_open, colour: 0xffffffff, bg : 0x96000000 }, function () { try { buttons.folder_open(); } catch (e) {} }, 'Open containing folder');
  buttons.buttons.layout = new _button(thumbs.x + thumbs.w - panel.bs * 1.25, thumbs.y + panel.bs * 0.25, panel.bs, panel.bs, { char : thumbs.properties.layout.value ? chars.vertical : chars.horizental, colour: 0x96ffffff, bg : 0x48000000 }, { char : thumbs.properties.layout.value ? chars.horizental : chars.vertical, colour: 0xffffffff, bg : 0x96000000 }, function () { thumbs.properties.layout.value ? thumbs.properties.layout.value -= 1 : thumbs.properties.layout.value += 1; on_size(); window.Repaint(); }, thumbs.properties.layout.value ? 'Horizental split' : 'Vertical split');
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

function on_key_down(vkey) {
  panel.key_down(vkey);
  if (panel.mode.value == 0) { // art panel
  } else {
    switch (vkey) {
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
}

function on_metadb_changed(handles, fromhook) {
  if (fromhook) return;
  if (panel.mode.value == 0) { // art panel
    albumart.metadb_changed();
    window.Repaint();
  } else {
    text.metadb_changed();
    thumbs.metadb_changed();
  }
}

function on_mouse_lbtn_up(x, y) {
  if (panel.mode.value == 0) { // art panel
  } else {
    text.lbtn_up(x, y);
    buttons.lbtn_up(x, y);
    buttons.update();
  }
}

function on_mouse_leave() {
  if (panel.mode.value == 0) { // art panel
    albumart.leave();
  } else {}
  buttons.leave();
}

function on_mouse_move(x, y) {
  if (panel.mode.value == 0) { // art panel
    albumart.move(x, y);
  } else {
    text.move(x, y);
    thumbs.move(x, y);
  }
  buttons.move(x, y);
}

function on_mouse_lbtn_dblclk(x, y) {
  if (panel.mode.value == 0) { // art panel
  } else {
    thumbs.lbtn_dblclk(x, y);
  }
}

function on_mouse_lbtn_down(x, y) {
}

function on_mouse_rbtn_up(x, y) {
  return true;
}

function on_mouse_wheel(s) {
  if (panel.mode.value == 0) { // art panel
    albumart.wheel(s);
  } else {
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
}

function on_playback_dynamic_info_track(type) {
  if (panel.mode.value == 0) { // art panel
    if (type == 1) {
      albumart.metadb_changed();
    }
  } else {
    if (type == 0) {
      text.metadb_changed();
      thumbs.playback_new_track();
      buttons.update();
    }
  }
}

function on_playback_new_track() {
  panel.item_focus_change();
  if (panel.mode.value == 0) { // art panel
  } else {
    thumbs.playback_new_track();
    buttons.update();
  }
}

function on_playback_pause() {
  if (panel.mode.value == 0) { // art panel
    albumart.repaint();
  } else {}
}

function on_playback_stop(reason) {
  if (reason != 2) {
    panel.item_focus_change();
  }
}

function on_playback_time() {
  if (panel.mode.value == 0) { // art panel
  } else {
    thumbs.playback_time();
  }
}

function on_playlist_switch() {
    on_item_focus_change();
}

function on_size() {
  panel.size();
  if (panel.mode.value == 0) { // art panel
    albumart.size();
  } else {
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
    window.MaxWidth = window.MinWidth = panel.h;
}

function on_paint(gr) {
  panel.paint(gr);
  if (panel.mode.value == 0) { // art panel
    albumart.paint(gr);
  } else {
    thumbs.paint(gr);
    text.paint(gr);
    buttons.paint(gr);
  }
}