function _panel(options) {
	this.calc_text_width = function (text) {
		return utils.CalcTextWidth(text, this.fonts.name, _scale(this.fonts.size.value));
	}

	this.colours_changed = function () {
		switch (true) {
		case !this.custom_background:
		case this.colours.mode.value == 0:
			if (window.IsDefaultUI) {
				this.colours.background = window.GetColourDUI(1);
				this.colours.text = /*window.GetColourDUI(0)*/DetermineTextColour(this.colours.background);
				this.colours.highlight = window.GetColourDUI(2);
			} else {
				this.colours.background = window.GetColourCUI(3);
				this.colours.text = /*window.GetColourCUI(0)*/DetermineTextColour(this.colours.background);
				this.colours.highlight = window.GetColourCUI(4);
			}
			this.colours.rating = 0xffffa500;
			this.colours.blend = blendColours(this.colours.background, this.colours.text, 0.35);
		break;
		case this.colours.mode.value == 1:
			if (this.metadb) {
				var img = this.metadb.GetAlbumArt(AlbumArtId.front, false);
				if (img) {
					this.arr = img.GetColourScheme(10).toArray().map(function (item) {
						return {
							colour: item,
							luminance: Luminance(item),
						};
					});
					img.Dispose();

					this.colours.background = this.arr[0].colour;
					this.colours.text = DetermineTextColour(this.colours.background);

					if (this.arr.length == 1) {
						this.colours.highlight = this.colours.text;
					} else {
						var luminance = this.arr[0].luminance;
						this.arr.pop();
						
						var diff = 0;
						var idx = 0;
						this.arr.forEach(function (item, i) {
							var tmp = Math.abs(luminance - item.luminance);
							if (tmp > diff) {
								diff = tmp;
								idx = i;
							}
						});
						this.colours.highlight = this.arr[idx].colour;
					}
				} else { // when metadb exists but img absents
					if (window.IsDefaultUI) {
						this.colours.background = window.IsDark ? blendColours(window.GetColourDUI(1), 0xff000000, 0.25) : window.GetColourDUI(1);
						this.colours.text = DetermineTextColour(this.colours.background);
						this.colours.highlight = window.GetColourDUI(2);
					} else {
						this.colours.background = window.IsDark ? blendColours(window.GetColourCUI(3), 0xff000000, 0.25) : window.GetColourCUI(3);
						this.colours.text = DetermineTextColour(this.colours.background);
						this.colours.highlight = window.GetColourCUI(4);
					}
				}
			}
			this.colours.rating = this.colours.highlight;
			this.colours.blend = blendColours(this.colours.background, this.colours.text, 0.50);
		break;
		case this.colours.mode.value == 2:
			this.colours.text = 0xffffffff;
			this.colours.highlight = window.IsDefaultUI ? window.GetColourDUI(2) : window.GetColourCUI(4);
			this.colours.rating = 0xffffa500;
			this.colours.blend = 0xffb6b6b6;
			break;
		case this.colours.mode.value == 3:
			this.colours.background = this.colours.custom_background.value;
			this.colours.text = this.colours.custom_text.value;
			this.colours.highlight = this.colours.custom_highlight.value;
			this.colours.rating = this.colours.highlight;
			this.colours.blend = blendColours(this.colours.background, this.colours.text, 0.35);
			break;
		}
		if (window.IsDefaultUI) {
			this.colours.splitter = window.IsDark ? 0xff333333 : 0xfff0f0f0;
		} {
			this.colours.splitter = window.IsDark ? 0xff424242 : 0xfff0f0f0;
		}
	}

	this.draw_header = function (gr, text) {
		DrawStyledText(gr, text, this.fonts.title, this.colours.highlight, LM, 0, this.w - (LM * 2), TM, DWRITE_TEXT_ALIGNMENT_LEADING, DWRITE_PARAGRAPH_ALIGNMENT_CENTER, DWRITE_WORD_WRAPPING_NO_WRAP, DWRITE_TRIMMING_GRANULARITY_CHARACTER);
		gr.DrawLine(LM, TM + 0.5, this.w - LM, TM + 0.5, 1, this.colours.highlight);
	}

	this.font_changed = function () {
		this.fonts.name = JSON.parse(window.IsDefaultUI ? window.GetFontDUI(0) : window.GetFontCUI(0)).Name;
		this.fonts.normal = JSON.stringify({Name:this.fonts.name,Size:_scale(this.fonts.size.value)});
		this.fonts.bold = JSON.stringify({Name:this.fonts.name,Size:_scale(this.fonts.size.value),Weight:DWRITE_FONT_WEIGHT_SEMI_BOLD});
		this.fonts.title = JSON.stringify({Name:this.fonts.name,Size:_scale(this.fonts.size.value + 2),Weight:DWRITE_FONT_WEIGHT_SEMI_BOLD});
		this.fonts.fixed = JSON.stringify({Name:'Consolas',Size:_scale(this.fonts.size.value)});
		this.fonts.rating = JSON.stringify({Name:utils.CheckFont('Guifx v2 Transports')?'Guifx v2 Transports':'Segoe Fluent Icons',Size:utils.CheckFont('Guifx v2 Transports')?_scale(this.fonts.size.value + 8):_scale(this.fonts.size.value + 4)});
		this.fonts.heart = JSON.stringify({Name:'Segoe Fluent Icons',Size:_scale(this.fonts.size.value + 1)});
		this.fonts.heart_extra = JSON.stringify({Name:'Segoe Fluent Icons',Size:_scale(this.fonts.size.value + 3)});
		this.row_height = _scale(this.fonts.size.value + 8);
		this.bs = _scale(this.fonts.size.value + 15);
		_.invoke(this.text_objects, 'font_changed');
		_.invoke(this.list_objects, 'size', true);
		_.invoke(this.display_objects, 'refresh', true);
	}

	this.get_tfo = function (t) {
		if (!this.tfo[t]) {
			this.tfo[t] = fb.TitleFormat(t);
		}
		return this.tfo[t];
	}

	this.item_focus_change = function () {
		if (!this.metadb_func) return;

		this.metadb = this.selection.value == 0 && fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem();
		this.colours_changed();
		if (!this.metadb) _tt('');
		on_metadb_changed();
	}

	this.key_down = function (vkey) {
		switch (vkey) {
			case VK_LEFT : fb.RunMainMenuCommand('Playback/Seek/Back by 5 seconds'); break;
			case VK_RIGHT : fb.RunMainMenuCommand('Playback/Seek/Ahead by 5 seconds'); break;
			case VK_SPACEBAR : fb.PlayOrPause(); window.Repaint(); break;
		}
		if (utils.IsKeyPressed(VK_SHIFT) && vkey == 48) { // SHIFT+0
			if (this.fonts.size.value > _.first(this.fonts.sizes)) {
				this.fonts.size.value = _.first(this.fonts.sizes);
				window.SetProperty('2K3.PANEL.FONTS.SIZE', this.fonts.size.value);
				this.font_changed();
				on_size();
				window.Repaint();
			}
		}
	}

	this.lbtn_dblclk = function (x, y, object) {
		if (object && object.trace(x, y)) {
			return object.lbtn_dblclk(x, y);
		} else {
			return window.IsDefaultUI ? fb.RunMainMenuCommand('View/Show now playing') : fb.RunMainMenuCommand('View/Playlist view/Activate now playing');
		}
	}

	this.paint = function (gr) {
		switch (true) {
		case !this.custom_background:
		case this.colours.mode.value == 0:
			var col = this.colours.background;
			break;
		case this.colours.mode.value == 1:
		var col = blendColours(this.colours.background, this.colours.splitter, 0.01);
			break;
		case this.colours.mode.value == 2:
		case this.colours.mode.value == 3:
			var col = this.colours.custom_background.value;
			break;
		}
		gr.Clear(col);
	}

	this.rbtn_up = function (x, y, object) {
		this.m = window.CreatePopupMenu();
		this.s1 = window.CreatePopupMenu();
		this.s2 = window.CreatePopupMenu();
		this.s3 = window.CreatePopupMenu();
		this.s10 = window.CreatePopupMenu();
		this.s11 = window.CreatePopupMenu();
		this.s12 = window.CreatePopupMenu();
		this.s13 = window.CreatePopupMenu();
		// panel 1-999
		// object 1000+
		if (object) {
			object.rbtn_up(x, y);
		}
		if (this.list_objects.length || this.text_objects.length || this.display_objects.length) {
			_.forEach(this.fonts.sizes, function (item) {
				this.s1.AppendMenuItem(MF_STRING, item, item);
			}, this);
			this.s1.CheckMenuRadioItem(_.first(this.fonts.sizes), _.last(this.fonts.sizes), this.fonts.size.value);
			this.s1.AppendTo(this.m, MF_STRING, 'Font size');
		}
		if (this.custom_background) {
			this.m.AppendMenuSeparator();
			this.s2.AppendMenuItem(MF_STRING, 100, window.IsDefaultUI ? 'Use default UI setting' : 'Use columns UI setting');
			this.s2.AppendMenuItem(MF_STRING, 101, 'Dynamic colours');
			this.s2.AppendMenuItem(MF_STRING, 102, 'Blurred image');
			this.s2.AppendMenuItem(MF_STRING, 103, 'Custom colours');
			this.s2.CheckMenuRadioItem(100, 103, this.colours.mode.value + 100);
			this.s2.AppendMenuSeparator();
			this.s2.AppendMenuItem(EnableMenuIf(this.colours.mode.value == 3), 104, 'Background colour...');
			this.s2.AppendMenuItem(EnableMenuIf(this.colours.mode.value == 3), 105, 'Text colour...');
			this.s2.AppendMenuItem(EnableMenuIf(this.colours.mode.value == 3), 106, 'Highlight colour...');
			this.s2.AppendTo(this.m, MF_STRING, 'Colours');
		}
		if (this.metadb_func) {
			this.m.AppendMenuSeparator();
			this.s3.AppendMenuItem(MF_STRING, 110, 'Prefer now playing');
			this.s3.AppendMenuItem(MF_STRING, 111, 'Follow selected track (playlist)');
			this.s3.CheckMenuRadioItem(110, 111, this.selection.value + 110);
			this.s3.AppendTo(this.m, MF_STRING, 'Selection mode');
		}

		var idx = this.m.TrackPopupMenu(x, y);
		this.m.Dispose();

		switch (true) {
		case idx == 0:
			break;
		case idx <= 16:
			this.fonts.size.value = idx;
			this.font_changed();
			window.Repaint();
			break;
		case idx == 100:
		case idx == 101:
		case idx == 102:
		case idx == 103:
			this.colours.mode.value = idx - 100;
			on_colours_changed();
			on_size();
			window.Repaint();
			break;
		case idx == 104:
			this.colours.custom_background.value = utils.ColourPicker(this.colours.custom_background.value);
			on_colours_changed();
			window.Repaint();
			break;
		case idx == 105:
			this.colours.custom_text.value = utils.ColourPicker(this.colours.custom_text.value);
			on_colours_changed();
			window.Repaint();
			break;
		case idx == 106:
			this.colours.custom_highlight.value = utils.ColourPicker(this.colours.custom_highlight.value);
			on_colours_changed();
			window.Repaint();
			break;
		case idx == 110:
		case idx == 111:
			this.selection.value = idx - 110;
			this.item_focus_change();
			break;
		case idx > 999:
			if (object) {
				object.rbtn_up_done(idx);
			}
			break;
		}
		return true;
	}

	this.size = function () {
		this.w = window.Width;
		this.h = window.Height;
	}

	this.tf = function (t) {
		if (!this.metadb) {
			return '';
		}
		var tfo = this.get_tfo(t);
		if (this.selection.value == 0 && fb.IsPlaying) {
			return tfo.Eval();
		}
		return tfo.EvalWithMetadb(this.metadb);
	}

	this.update_extra_font_size = function (step) {
		var tmp = _clamp(this.fonts.size.value + step, _.first(this.fonts.sizes), _.last(this.fonts.sizes));
		if (this.fonts.size.value != tmp) {
			this.fonts.size.value = tmp;
			window.SetProperty('2K3.PANEL.FONTS.SIZE', this.fonts.size.value);
			this.font_changed();
			on_size();
			window.Repaint();
		}
	}

	this.wheel = function (s, object) {
		if (utils.IsKeyPressed(VK_SHIFT)) {
			this.update_extra_font_size(s);
		} else if (object) {
			object.wheel(s);
		}
	}

	this.fonts = {};
	this.colours = {};
	this.tfo = {};
	this.arr = [];
	this.list_objects = [];
	this.text_objects = [];
	this.display_objects = [];
	this.custom_background = false;
	this.w = 0;
	this.h = 0;
	this.metadb = fb.GetFocusItem();
	this.metadb_func = typeof on_metadb_changed == 'function';
	this.fonts.sizes = [9, 10, 11, 12, 13, 14];
	this.fonts.size = new _p('2K3.PANEL.FONTS.SIZE', 9);

	if (this.metadb_func) {
		this.selection = new _p('2K3.PANEL.SELECTION', 0);
	}
	if (typeof options == 'object') {
		if (options.custom_background === true) {
			this.custom_background = true;
			this.colours.mode = new _p('2K3.PANEL.COLOURS.MODE', 0);
			this.colours.custom_background = new _p('2K3.PANEL.COLOURS.CUSTOM.BACKGROUND', RGB(32, 32, 32));
			this.colours.custom_text = new _p('2K3.PANEL.COLOURS.CUSTOM.TEXT', RGB(255, 255, 255));
			this.colours.custom_highlight = new _p('2K3.PANEL.COLOURS.CUSTOM.HIGHLIGHT', RGB(0, 102, 204));
		}
	}
	this.colours_changed();
	this.font_changed();
}
