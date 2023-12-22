var panel = new _panel({ custom_background : true });
var albumart = new _albumart();
var seekbar = new _seekbar();
var rating = new _rating();
var volume = new _volume();
var picker = new _picker();
var esl = new _esl();
var buttons = new _buttons();

var bx = 0, by = 0;

panel.item_focus_change();

function _albumart() {
	this.metadb_changed = function () {
		var img = null;
		if (panel.metadb) {
			img = panel.metadb.GetAlbumArt(this.properties.id.value);

			if (this.img) this.img.Dispose();
			if (this.blurred) this.blurred.Dispose();
			this.img = this.blurred = null;
			this.tooltip = this.path = '';
			if (img) {
				this.img = img;
				this.blurred = this.img.Clone();
				this.blurred.StackBlur(250);
				this.grayscale = this.img.Clone();
				this.grayscale.ApplyEffect(0);
				this.tooltip = 'Original dimensions: ' + this.img.Width + 'x' + this.img.Height + 'px';
				this.path = this.img.Path;
				if (this.path.length) {
					this.tooltip += '\nPath: ' + this.path;
				}
			}
		}
	}

	this.trace = function (x, y) { return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h; }

	this.wheel = function (s) {
		if (this.trace(this.mx, this.my)) {
			var id = this.properties.id.value - s;
			if (id < 0) {
				id = 4;
			}
			if (id > 4) {
				id = 0;
			}
			this.properties.id.value = id;
			_tt('');
			panel.item_focus_change();
			return true;
		} else {
			volume.wheel(s);
		}
	}
	
	this.move = function (x, y) {
		this.mx = x;
		this.my = y;
		
		if (this.trace(x, y)) {
			if (this.img) {
				// _tt(this.tooltip);
			}
			this.hover = true;
			return true;
		}
		
		if (this.hover) {
			_tt('');
		}
		this.hover = false;
		return false;
	}
	
	this.lbtn_dblclk = function (x, y) {
		if (this.trace(x, y)) {
			if (panel.metadb) {
				switch (this.properties.double_click_mode.value) {
				case 0:
					if (panel.metadb.Path == this.path) {
						_explorer(this.path);
					} else if (utils.IsFile(this.path) || this.path.indexOf('http') == 0) {
						utils.Run(this.path);
					}
					break;
				case 1:
					panel.metadb.ShowAlbumArtViewer(this.properties.id.value);
					break;
				case 2:
					if (utils.IsFile(this.path)) _explorer(this.path);
					break;
				}
			}
			return true;
		}
		return false;
	}

	this.rbtn_up = function () {
		panel.m.AppendMenuItem(MF_STRING, 1010, 'Enable border');
		panel.m.CheckMenuItem(1010, this.properties.border.enabled);
		panel.m.AppendMenuItem(MF_STRING, 1011, 'Enable rounded corner');
		panel.m.CheckMenuItem(1011, this.properties.rounded.enabled);
		panel.m.AppendMenuSeparator();
		panel.m.AppendMenuItem(EnableMenuIf(panel.metadb && utils.IsFile(this.path)), 1020, 'Open containing folder');
		panel.m.AppendMenuSeparator();
		panel.m.AppendMenuItem(EnableMenuIf(panel.metadb), 1030, 'Google image search');
		panel.m.AppendMenuItem(EnableMenuIf(panel.metadb), 1031, 'Spotify artist search');
		panel.m.AppendMenuSeparator();
		panel.s10.AppendMenuItem(MF_STRING, 1040, 'Opens image in external viewer');
		panel.s10.AppendMenuItem(MF_STRING, 1041, 'Opens image using fb2k viewer');
		panel.s10.AppendMenuItem(MF_STRING, 1042, 'Opens containing folder');
		panel.s10.CheckMenuRadioItem(1040, 1042, this.properties.double_click_mode.value + 1040);
		panel.s10.AppendTo(panel.m, MF_STRING, 'Double click');
	}

	this.rbtn_up_done = function (idx) {
		switch (idx) {
		case 1010:
			this.properties.border.toggle();
			panel.item_focus_change();
			break;
		case 1011:
			this.properties.rounded.toggle();
			panel.item_focus_change();
			break;
		case 1020:
			_explorer(this.path);
			break;
		case 1030:
			utils.Run('https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(panel.tf('%album artist%[ %album%]')));
			break;
		case 1031:
			utils.Run('https://open.spotify.com/search/' + encodeURIComponent(panel.tf('%album artist%')));
			break;
		case 1040:
		case 1041:
		case 1042:
			this.properties.double_click_mode.value = idx - 1040;
			break;
		}
	}

	this.size = function () {
		this.x = panel.bs;
		this.w = panel.w - this.x * 2;
		this.h = this.w;
		if (Math.round((panel.h * 0.5) - this.h) > panel.bs * 7) {
			this.y = Math.round(panel.h * 0.5) - this.h;
		} else {
			this.y = panel.bs * 7;
		};
	}

	this.paint = function (gr) {
		if (this.img) {
			if (panel.colours.mode.value == 2) {
				_drawImage(gr, this.blurred, 0, 0, panel.w, panel.h, image.crop);
				_drawOverlay(gr, 0, 0, panel.w, panel.h, 120);
			}
			_drawImage(gr, fb.IsPaused ? this.grayscale : this.img, this.x, this.y, this.w, this.h, image.centre, this.properties.rounded.enabled, this.properties.border.enabled ? panel.colours.text & 0x24ffffff : 0);
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
		gr.WriteText(panel.tf(tfo.album), panel.fonts.title, panel.colours.text, this.x, this.y - panel.row_height * 3.5, this.w, panel.row_height, 0, 2, 1, 1);
		gr.WriteText(panel.tf(tfo.album_artist), panel.fonts.title, panel.colours.blend, this.x, this.y - panel.row_height * 2.5, this.w, panel.row_height, 0, 2, 1, 1);
		gr.WriteText(panel.tf(tfo.genre), panel.fonts.bold, panel.colours.blend, this.x, this.y - panel.row_height * 1.5, this.w, panel.row_height, 0, 2, 1, 1);
		gr.WriteText(panel.tf(tfo.title), panel.fonts.title, panel.colours.text, this.x, this.y + this.h + panel.row_height * 2.5, this.w, panel.row_height, 0, 2, 1, 1);
		gr.WriteText(panel.tf(tfo.artist), panel.fonts.title, panel.colours.blend, this.x, this.y + this.h + panel.row_height * 3.5, this.w, panel.row_height, 0, 2, 1, 1);
		gr.WriteText(panel.tf(tfo.count), panel.fonts.bold, panel.colours.blend, this.x, this.y + this.h + panel.row_height * 4.5, this.w, panel.row_height, 0, 2, 1, 1);
		gr.WriteText(panel.tf(tfo.released), panel.fonts.normal, panel.colours.blend, this.x, this.y + this.h + panel.row_height * 5.5, this.w, panel.row_height, 0, 2, 1, 1);
		gr.WriteText(panel.tf(tfo.publisher), panel.fonts.normal, panel.colours.blend, this.x, this.y + this.h + panel.row_height * 6.5, this.w, panel.row_height, 0, 2, 1, 1);
	}

	this.tooltip = '';
	this.img = null;
	this.blurred = null;
	this.path = null;
	this.hover = false;
	this.ids = ['Front', 'Back', 'Disc', 'Icon', 'Artist'];
	this.properties = {
		border : new _p('2K3.ARTREADER.BORDER', true),
		double_click_mode : new _p('2K3.ARTREADER.DOUBLE.CLICK.MODE', 0), // 0 external viewer 1 fb2k viewer 2 explorer
		id : new _p('2K3.ARTREADER.ID', 0),
		rounded : new _p('2K3.ARTREADER.ROUNDED', true)
	};
}

function _seekbar() {
	this.interval_func = _.bind(function () {
		if (fb.IsPlaying && !fb.IsPaused && fb.PlaybackLength) {
			this.repaint();
		}
	}, this);

	this.lbtn_down = function (x, y) {
		if (this.trace(x, y)) {
			if (fb.IsPlaying && fb.PlaybackLength) {
				this.drag = true;
			}
			return true;
		}
		return false;		
	}

	this.lbtn_up = function (x, y) {
		if (this.trace(x, y)) {
			if (this.drag) {
				this.drag = false;
				fb.PlaybackTime = fb.PlaybackLength * this.drag_seek;
			}
			return true;
		}
		return false;		
	}

	this.move = function (x, y) {
		this.mx = x;
		this.my = y;
		if (this.trace(x, y)) {
			if (fb.IsPlaying && fb.PlaybackLength) {
				x -= this.x;
				this.drag_seek = x < 0 ? 0 : x > this.w ? 1 : x / this.w;
				if (this.drag) {
					this.playback_seek();
				}
			}
			this.hover = true;
			window.SetCursor(IDC_HAND);
			// _tt(utils.FormatDuration(fb.PlaybackLength * this.drag_seek));
			this.repaint();
			return true;
		}

		this.leave();
		this.drag = false;
		return false;		
	}

	this.leave = function () {
		if (this.hover) {
			this.hover = false;
			window.SetCursor(IDC_ARROW);
			// _tt('');
			this.repaint();
		}
	}

	this.playback_seek = function () { this.repaint(); }

	this.playback_stop = function () { this.playback_seek(); }

	this.pos = function () { return Math.ceil(this.w * (this.drag ? this.drag_seek : fb.PlaybackTime / fb.PlaybackLength)); }

	this.repaint = function () { window.RepaintRect(this.x, this.y - this.mh * 0.5, this.w, this.h + this.mh + panel.row_height * 1.25); }

	this.trace = function (x, y) { var m = this.drag ? 200 : 0; return x > this.x - m && x < this.x + this.w + (m * 2) && y > this.y - m - this.mh * 0.5 && y < this.y + this.h + (m * 2) + this.mh; }

	this.wheel = function (s) {
		if (this.trace(this.mx, this.my)) {
			switch (true) {
			case !fb.IsPlaying:
			case fb.PlaybackLength <= 0:
				break;
			case fb.PlaybackLength < 60:
				fb.PlaybackTime += s * 5;
				break;
			case fb.PlaybackLength < 600:
				fb.PlaybackTime += s * 10;
				break;
			default:
				fb.PlaybackTime += s * 60;
				break;
			}
			// _tt('');
			return true;
		}
		return false;
	}

	this.size = function () {
		this.x = albumart.x;
		this.y = albumart.y + albumart.h + panel.row_height * 0.75;
		this.w = albumart.w;
		this.h = panel.row_height * 0.25;
		this.mw = panel.row_height * 0.25;
		this.mh = panel.row_height * 0.50;
	}

	this.paint = function (gr) {
		if (fb.IsPlaying) {
			if (panel.selection.value != 1) {
				gr.FillRectangle(this.x, this.y, this.w, this.h, panel.colours.blend & 0x32ffffff);
				if (fb.PlaybackLength > 0) {
					gr.FillRectangle(this.x, this.y, this.pos(), this.h, this.hover ? panel.colours.text : panel.colours.blend & 0xccffffff);
					gr.FillRectangle(this.x + this.pos(), this.y - this.mh * 0.5, this.mw, this.h + this.mh, this.hover ? panel.colours.text : 0);
					gr.WriteText(panel.tf(tfo.elap, true), panel.fonts.normal, panel.colours.blend, this.x, this.y + this.h + panel.row_height * 0.25, albumart.h, panel.row_height, 0, 2, 1, 1);
					gr.WriteText(panel.tf(tfo.remain, true), panel.fonts.normal, panel.colours.blend, this.x, this.y + this.h + panel.row_height * 0.25, albumart.h, panel.row_height, 1, 2, 1, 1);
				}
			}
		}
	}

	this.hover = false;
	this.drag = false;
	this.drag_seek = 0;
	window.SetInterval(this.interval_func, 150);
}

function _rating() {
	this.metadb_changed = function () {
		if (panel.metadb) {
			this.hover = false;
			this.rating = this.get_rating();
			this.hrating = this.rating;
			this.tiptext = panel.tf('Rate "%title%" by "%artist%".');
		}
		window.Repaint();
	}

	this.trace = function (x, y) {
		return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
	}

	this.move = function (x, y) {
		if (this.trace(x, y)) {
			if (panel.metadb) {
				// _tt(this.tiptext);
				this.hover = true;
				this.hrating = Math.ceil((x - this.x) / this.h);
				window.RepaintRect(this.x, this.y, this.w, this.h);
			}
			return true;
		}
		this.leave();
		return false;
	}

	this.leave = function () {
		if (this.hover) {
			// _tt('');
			this.hover = false;
			window.RepaintRect(this.x, this.y, this.w, this.h);
		}
	}

	this.lbtn_up = function (x, y) {
		if (this.trace(x, y)) {
			if (panel.metadb) {
				this.set_rating();
			}
			return true;
		}
		return false;
	}

	this.get_rating = function () {
		return panel.tf('$if2(%rating%,0)');
	}

	this.set_rating = function () {
		var handles = fb.CreateHandleList(panel.metadb);
		handles.RunContextCommand('Playback Statistics/Rating/' + (this.hrating == this.rating ? '<not set>' : this.hrating));
		handles.Dispose();
	}

	this.size = function () {
		this.x = albumart.x - 2;
		this.y = albumart.y + albumart.h + panel.row_height * 7.5;
		this.h = panel.row_height;
		this.w = this.h * 5;
	}

	this.paint = function (gr) {
		if (panel.metadb) {
			for (var i = 0; i < 5; i++) {
				gr.WriteText(utils.CheckFont('Guifx v2 Transports') ? 'b' : i + 1 > (this.hover ? this.hrating : this.rating) ? chars.rating_off : chars.rating_on, panel.fonts.rating, i + 1 > (this.hover ? this.hrating : this.rating) ? panel.colours.blend & 0x48ffffff : panel.colours.rating, this.x + (i * this.h), this.y, this.h, this.h, 0, 2);
			}
		}
	}

	this.hover = false;
	this.rating = 0;
	this.hrating = 0;
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
		this.w = panel.bs * 2;
		this.h = this.w;
		this.x = albumart.x + albumart.w * 0.5 - this.w * 0.5;
		this.y = albumart.y + albumart.h * 0.5 - this.h * 0.5;
	}

	this.paint = function (gr) {
		if (this.timer) {
			this.str = Math.ceil(this.vol2percentage(fb.Volume) * 100) + '%';
			gr.FillRoundedRectangle(this.x, this.y, this.w, this.h, this.h * 0.5, this.h * 0.5, 0xcc000000);
			gr.WriteText(this.str, panel.fonts.title, 0xffffffff, this.x, this.y, this.w, this.h, 2, 2);
		}
	}

	this.timer = 0;
}

function _picker() {
	this.lbtn_up = function (x, y) {
		if (this.trace(x, y) && panel.custom_background && panel.colours.mode.value == 3) {
			for (var i = 0; i < this.colours.length; i++) {
				if (x > this.x + (this.w + LM) * i && x < this.x + this.w * (i + 1) + LM * i) {
					this.colours[i].value = utils.ColourPicker(this.colours[i].value);
				}
			}
			on_colours_changed();
			return true;
		}
		return false;
	}

	this.leave = function () {
		for (var i = 0; i < this.colours.length; i++) {
			if (this.hover) {
				_tt('');
				this.hover = false;
			}
		}
	}

	this.move = function (x, y) {
		if (this.trace(x, y) && panel.custom_background && panel.colours.mode.value == 3) {
			for (var i = 0; i < this.colours.length; i++) {
				if (x > this.x + (this.w + LM) * i && x < this.x + this.w * (i + 1) + LM * i) {
				_tt((i == 0 ? 'Background: ' : i == 1 ? 'Text: ' : i == 2 ? 'Highlight: ' : '') + 'RGB(' + toRGB(this.colours[i].value).toString() + ')');
				this.hover = true;
				}
			}
			return true;
		}
		this.leave();
		return false;
	}

	this.trace = function (x, y) {
		return x > this.x && x < this.x + this.w * this.colours.length + LM * (this.colours.length - 1) && y > this.y && y < this.y + this.h;
	}

	this.size = function () {
		this.w = LM * 3; this.h = this.w; this.x = albumart.x; this.y = panel.h - this.h * 2;
	}

	this.paint = function (gr) {
		if (panel.custom_background && panel.colours.mode.value == 3) {
			for (var i = 0; i < this.colours.length; i++) {
				gr.FillRectangle(this.x + (this.w + LM) * i, this.y, this.w, this.h, this.colours[i].value);
				gr.DrawRectangle(this.x + (this.w + LM) * i, this.y, this.w, this.h, _scale(1), panel.colours.blend);
			}
		}
	}

	this.colours = new Array(panel.colours.custom_background, panel.colours.custom_text, panel.colours.custom_highlight);
	this.hover = false;
}

function _esl() {	
	this.metadb_changed = function () {
		try {
			if (panel.metadb) {
				this.object.BannerText = panel.tf('Title: ' + tfo.title + '$crlf()' + 'Artist: ' + tfo.artist + '$crlf()' + 'Album: ' + tfo.album);
			}
		} catch (e) {}
	}

	this.colours_changed = function () {
		try {
			this.pane.SetBackgroundColor(panel.colours.splitter);
			this.pane.SetTextColor(blendColours(panel.colours.splitter, panel.colours.text, 0.15));
			this.pane.SetTextHighlightColor(panel.colours.text);
		} catch (e) {}
	}
	
	this.font_changed = function () {
		try {
			this.pane.SetTextFont(panel.fonts.name, _scale(panel.fonts.size.value + 9), 0);
		} catch (e) {}
	}
	
	this.size = function () {
		if (fb.CheckComponent('foo_uie_eslyric')) {
			this.object = new ActiveXObject('ESLyric');
			this.pane = this.object.GetAll();
			this.pane.SetTextRenderer(2);
			this.pane.SetTextAlign(0);
			this.pane.SetLineSpace(0);
			this.pane.SetHorizMargin(panel.bs);
			this.pane.SetVertMargin(panel.bs);
			this.pane.SetSentenceSpace(panel.row_height * 0.25);
		} else { return; }
	}

	this.size();
	this.colours_changed();
	this.font_changed();
}

buttons.update = function () {
	buttons.buttons.pref = new _button(panel.bs * 0.25, panel.bs * 0.25, panel.bs, panel.bs, { char : chars.preferences, colour: panel.colours.blend }, { char : chars.preferences, colour: panel.colours.text, bg : panel.colours.blend & 0x48ffffff }, function () { fb.RunMainMenuCommand('File/Preferences'); }, 'Preferences');
	buttons.buttons.flowin = new _button(panel.w - panel.bs * 1.25, panel.bs * 0.25, panel.bs, panel.bs, { char : chars.flowin, colour: panel.colours.blend }, { char : chars.flowin, colour: panel.colours.text, bg : panel.colours.blend & 0x48ffffff }, function () { fb.RunMainMenuCommand('View/Flowin/Picture in picture/Show'); }, 'Picture in picture');

	bx = panel.w * 0.5 - panel.bs * 0.5;
	by = albumart.y - panel.row_height * 3.5 - panel.bs * 1.5;
	buttons.buttons.shuffle = new _button(bx - panel.bs * 2.50, by, panel.bs, panel.bs, { char : chars.shuffle, colour : (plman.PlaybackOrder == 4) ? panel.colours.text : panel.colours.blend }, { char : chars.shuffle, colour : panel.colours.text }, function () { buttons.shuffle(); }, plman.PlaybackOrder == 4 ? 'Turn off shuffle' : 'Turn on shuffle');
	buttons.buttons.prev = new _button(bx - panel.bs * 1.25, by, panel.bs, panel.bs, { char : chars.prev, colour : panel.colours.blend }, { char : chars.prev, colour : panel.colours.text }, function () { fb.Prev(); }, 'Previous');
	buttons.buttons.play = new _button(bx, by, panel.bs, panel.bs, { char : fb.IsPlaying ? !fb.IsPlaying || fb.IsPaused ? chars.play : chars.pause : chars.stop, colour : panel.colours.text, bg : panel.colours.blend & 0x48ffffff }, { char : fb.IsPlaying ? !fb.IsPlaying || fb.IsPaused ? chars.play : chars.pause : chars.stop, colour : panel.colours.text, bg : panel.colours.blend & 0x96ffffff }, function () { fb.PlayOrPause(); }, !fb.IsPlaying || fb.IsPaused ? 'Play' : 'Pause');
	buttons.buttons.next = new _button(bx + panel.bs * 1.25, by, panel.bs, panel.bs, { char : chars.next, colour : panel.colours.blend }, { char : chars.next, colour : panel.colours.text }, function () { fb.Next(); }, 'Next');
	buttons.buttons.repeat = new _button(bx + panel.bs * 2.50, by, panel.bs, panel.bs, { char : (plman.PlaybackOrder == 2) ? chars.repeat_one : chars.repeat_all, colour : (plman.PlaybackOrder == 4 || plman.PlaybackOrder == 2 || plman.PlaybackOrder == 1) ? panel.colours.text : panel.colours.blend }, { char : (plman.PlaybackOrder == 2) ? chars.repeat_one : chars.repeat_all, colour : panel.colours.text }, function () { buttons.repeat() }, plman.PlaybackOrder == 2 ? 'Turn off repeat' : plman.PlaybackOrder == 1 ? 'Repeat current track' : 'Repeat playlist');
}

buttons.shuffle = function () {
	if (plman.PlaybackOrder !== 4) {
		plman.PlaybackOrder = 4;
	}	else {
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

buttons.output = function (x, y) {
	var menu = window.CreatePopupMenu();
	var str = fb.GetOutputDevices();
	var arr = JSON.parse(str);
	var active = 0;
	for (var i = 0; i < arr.length; i++) {
		menu.AppendMenuItem(MF_STRING, i + 1, arr[i].name);
		if (arr[i].active) active = i;
	}

	if (active > -1) menu.CheckMenuRadioItem(1, arr.length + 1, active + 1);

	var idx = menu.TrackPopupMenu(x, y);
	menu.Dispose();

	if (idx) fb.RunMainMenuCommand('Playback/Device/' + arr[idx - 1].name);
}

function on_colours_changed() { panel.colours_changed(); esl.colours_changed(); buttons.update(); window.Repaint(); }
function on_font_changed() { panel.font_changed(); esl.font_changed(); window.Repaint(); }
function on_item_focus_change() { if (panel.selection.value == 0 && fb.IsPlaying) return; panel.item_focus_change(); buttons.update(); }
function on_key_down(vkey) { return panel.key_down(vkey); }
function on_metadb_changed() { albumart.metadb_changed(); rating.metadb_changed(); esl.metadb_changed(); }
function on_mouse_lbtn_dblclk(x, y) { return panel.lbtn_dblclk(x, y, albumart); }
function on_mouse_lbtn_down(x, y) { seekbar.lbtn_down(x, y); }
function on_mouse_lbtn_up(x, y) { seekbar.lbtn_up(x, y); rating.lbtn_up(x, y); picker.lbtn_up(x, y); buttons.lbtn_up(x, y); }
function on_mouse_leave() { rating.leave(); picker.leave(); buttons.leave(); }
function on_mouse_move(x, y) { albumart.move(x, y); seekbar.move(x, y); rating.move(x, y); picker.move(x, y); buttons.move(x, y); }
function on_mouse_rbtn_up(x, y) { return true; }
function on_mouse_wheel(s) { return panel.wheel(s, albumart); }
function on_playback_dynamic_info_track() { panel.item_focus_change(); }
function on_playback_new_track() { panel.item_focus_change(); buttons.update(); }
function on_playback_order_changed() { buttons.update(); window.Repaint(); }
function on_playback_seek() { seekbar.playback_seek(); }
function on_playback_stop(reason) { if (reason != 2) { panel.item_focus_change(); } seekbar.playback_stop(); buttons.update(); }
function on_playback_pause() { buttons.update(); window.Repaint(); }
function on_playback_starting() { buttons.update(); }
function on_playlist_stop_after_current_changed() {}
function on_playlist_switch() { if (panel.selection.value == 0 && fb.IsPlaying) return; panel.item_focus_change(); buttons.update(); }
function on_volume_change() { if (volume.timer) window.ClearTimeout(volume.timer); volume.timer = window.SetTimeout(function () { volume.timer = 0; window.Repaint(); }, 1500); window.Repaint(); }
function on_size() { panel.size(); albumart.size(); seekbar.size(); rating.size(); volume.size(); picker.size(); esl.size(); buttons.update(); window.MaxWidth = panel.bs * 12; window.MinWidth = panel.bs * 9; }
function on_paint(gr) { panel.paint(gr); albumart.paint(gr); seekbar.paint(gr); rating.paint(gr); volume.paint(gr); picker.paint(gr); buttons.paint(gr); }
