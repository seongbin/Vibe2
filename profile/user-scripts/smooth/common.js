String.prototype.calc_width = function (font_str) {
	var font = JSON.parse(font_str);
	return utils.CalcTextWidth(this, font.Name, font.Size, font.Weight || DWRITE_FONT_WEIGHT_REGULAR);
}

function on_colours_changed() {
	get_colours();
	brw.scrollbar.repaint();
	brw.repaint();
}

function on_font_changed() {
	get_font();
	get_metrics();
	brw.repaint();
}

function on_get_album_art_done(metadb, art_id, image) {
	if (!image) return;
	for (var i = 0; i < brw.groups.length; i++) {
		if (brw.groups[i].metadb && brw.groups[i].metadb.Compare(metadb)) {
			var cached_filename = generate_filename(brw.groups[i].cachekey, art_id);
			image.SaveAs(cached_filename);
			images.cache[cached_filename] = image;
			brw.groups[i].cover_image = image;
			brw.repaint();
			break;
		}
	}
}

function on_size() {
	ww = window.Width;
	wh = window.Height;
	brw.size();
}

function clamp(value, min, max) {
	if (value < min) return min;
	if (value > max) return max;
	return value;
}

function update_extra_font_size(step) {
	var tmp = clamp(ppt.fontSize.value + step, 9, 14);
	if (ppt.fontSize.value != tmp) {
		ppt.fontSize.value = tmp;
		window.SetProperty("SMOOTH.FONT.SIZE", ppt.fontSize.value);
		get_font();
		get_metrics();
		get_images();
		brw.repaint();
	}
}

function get_images() {
	var gb;
	var cover_size = scale(ppt.fontSize.value + 41);
	var button_size = scale(ppt.fontSize.value + 7);
	var icon_font = _font("Segoe Fluent Icons", button_size * 0.5);

	images.noart = utils.CreateImage(cover_size, cover_size);
	gb = images.noart.GetGraphics();
	gb.FillRectangle(0, 0, cover_size, cover_size, g_colour_splitter);
	gb.WriteText("No\nCover", g_font_bold, g_colour_blend, 1, 1, cover_size, cover_size, 2, 2);
	images.noart.ReleaseGraphics();

	images.stream = utils.CreateImage(cover_size, cover_size);
	gb = images.stream.GetGraphics();
	gb.FillRectangle(0, 0, cover_size, cover_size, g_colour_splitter);
	gb.WriteText("Web\nRadios", g_font_bold, g_colour_blend, 1, 1, cover_size, cover_size, 2, 2);
	images.stream.ReleaseGraphics();

	images.magnify = utils.CreateImage(button_size, button_size);
	gb = images.magnify.GetGraphics();
	gb.WriteText("\uf78b", icon_font, g_colour_blend, 0, 0, button_size, button_size, 2, 2);
	images.magnify.ReleaseGraphics();

	images.reset_normal = utils.CreateImage(button_size, button_size);
	gb = images.reset_normal.GetGraphics();
	gb.WriteText("\ue711", icon_font, g_colour_blend, 0, 0, button_size, button_size, 2, 2);
	images.reset_normal.ReleaseGraphics();

	images.reset_hover = utils.CreateImage(button_size, button_size);
	gb = images.reset_hover.GetGraphics();
	gb.WriteText("\ue711", icon_font, g_colour_text, 0, 0, button_size, button_size, 2, 2);
	images.reset_hover.ReleaseGraphics();

	images.reset_down = utils.CreateImage(button_size, button_size);
	gb = images.reset_down.GetGraphics();
	gb.WriteText("\ue711", icon_font, g_colour_text, 0, 0, button_size, button_size, 2, 2);
	images.reset_down.ReleaseGraphics();
}

function validate_indexes(playlist, item) {
	return playlist >=0 && playlist < plman.PlaylistCount && item >= 0 && item < plman.GetPlaylistItemCount(playlist);
}

function play(playlist, item) {
	if (validate_indexes(playlist, item)) {
		plman.ExecutePlaylistDefaultAction(playlist, item);
	}
}

function generate_filename(cachekey, art_id) {
	var prefix = art_id == 4 ? "artist" : "front";
	return CACHE_FOLDER + prefix + cachekey + ".jpg";
}

function get_art(metadb, cachekey, art_id) {
	var filename = generate_filename(cachekey, art_id);
	var img = images.cache[filename];
	if (img) return img;

	img = utils.LoadImage(filename);
	if (img) {
		images.cache[filename] = img;
		return img;
	}

	window.SetTimeout(function () {
		metadb.GetAlbumArtThumbAsync(window.ID, art_id);
	}, 10);
	return img;
}

function drawImage(gr, img, dst_x, dst_y, dst_w, dst_h, auto_fill, border, opacity) {
	if (!img || !dst_w || !dst_h) {
		return;
	}
	if (auto_fill) {
		if (img.Width / img.Height < dst_w / dst_h) {
			var src_x = 0;
			var src_w = img.Width;
			var src_h = Math.round(dst_h * img.Width / dst_w);
			var src_y = Math.round((img.Height - src_h) / 2);
		} else {
			var src_y = 0;
			var src_w = Math.round(dst_w * img.Height / dst_h);
			var src_h = img.Height;
			var src_x = Math.round((img.Width - src_w) / 2);
		}
		gr.DrawImage(img, dst_x, dst_y, dst_w, dst_h, src_x + 3, src_y + 3, src_w - 6, src_h - 6, opacity || 1);
	} else {
		var s = Math.min(dst_w / img.Width, dst_h / img.Height);
		var w = Math.floor(img.Width * s);
		var h = Math.floor(img.Height * s);
		dst_x += Math.round((dst_w - w) / 2);
		dst_y += Math.round((dst_h - h) / 2);
		dst_w = w;
		dst_h = h;
		gr.DrawImage(img, dst_x, dst_y, dst_w, dst_h, 0, 0, img.Width, img.Height, opacity || 1);
	}
	if (border) {
		gr.DrawRectangle(dst_x, dst_y, dst_w - 1, dst_h - 1, 1, border);
	}
}

function drawSelectedRectangle(gr, x, y, w, h) {
	gr.FillRectangle(x, y, w, h, setAlpha(g_colour_selection, 48));
}

function GetKeyboardMask() {
	if (utils.IsKeyPressed(VK_CONTROL))
		return KMask.ctrl;
	if (utils.IsKeyPressed(VK_SHIFT))
		return KMask.shift;
	return KMask.none;
}

function button(normal, hover, down) {
	this.x = 0;
	this.y = 0;
	this.w = normal.Width;
	this.h = normal.Height;
	this.img = [normal, hover, down];
	this.state = ButtonStates.normal;

	this.update = function (normal, hover, down) {
		this.w = normal.Width;
		this.h = normal.Height;
		this.img = [normal, hover, down];
	}

	this.paint = function (gr, x, y, alpha) {
		this.x = x;
		this.y = y;
		if (this.img[this.state]) {
			gr.DrawImage(this.img[this.state], this.x, this.y, this.w, this.h, 0, 0, this.w, this.h);
		}
	}

	this.repaint = function () {
		window.RepaintRect(this.x, this.y, this.w, this.h);
	}

	this.checkstate = function (event, x, y) {
		this.ishover = (x > this.x && x < this.x + this.w - 1 && y > this.y && y < this.y + this.h - 1);
		this.old = this.state;
		switch (event) {
		case "lbtn_down":
			switch (this.state) {
			case ButtonStates.normal:
			case ButtonStates.hover:
				this.state = this.ishover ? ButtonStates.down : ButtonStates.normal;
				this.isdown = true;
				break;
			}
			break;
		case "lbtn_up":
			this.state = this.ishover ? ButtonStates.hover : ButtonStates.normal;
			this.isdown = false;
			break;
		case "move":
			switch (this.state) {
			case ButtonStates.normal:
			case ButtonStates.hover:
				this.state = this.ishover ? ButtonStates.hover : ButtonStates.normal;
				break;
			}
			break;
		case "leave":
			this.state = this.isdown ? ButtonStates.down : ButtonStates.normal;
			break;
		}
		if (this.state != this.old)
			this.repaint();
		return this.state;
	}
}

function height(font) {
	return JSON.parse(font).Size + 8;
}

function scale(size) {
	return Math.round(size * window.DPI / 72);
}

function _p(name, default_) {
	Object.defineProperty(this, typeof default_ == "boolean" ? "enabled" : "value", {
		get : function () {
			return this.val;
		},
		set : function (value) {
			this.val = value;
			window.SetProperty(this.name, this.val);
		}
	});

	this.toggle = function () {
		this.val = !this.val;
		window.SetProperty(this.name, this.val);
	}

	this.name = name;
	this.default_ = default_;
	this.val = window.GetProperty(name, default_);
}

function _font(name, size, bold, style) {
	var font = {
		Name : name,
		Size : scale(size),
		Weight : bold ? DWRITE_FONT_WEIGHT_SEMI_BOLD : DWRITE_FONT_WEIGHT_REGULAR,
		Style : typeof style == "number" ? style : 0
	};
	return JSON.stringify(font);
}

function get_font() {
	var name = JSON.parse(window.IsDefaultUI ? window.GetFontDUI(0) : window.GetFontCUI(0)).Name;

	g_font = _font(name, ppt.fontSize.value);
	g_font_bold = _font(name, ppt.fontSize.value, true);
	g_font_group = _font(name, ppt.fontSize.value + 2);

	if (ppt.ratingStar.enabled) {
		if (utils.CheckFont("Guifx v2 Transports")) {
			g_font_rating = _font("Guifx v2 Transports", ppt.fontSize.value + 5);
			chars.rating_on = "b";
			chars.rating_off = "b";
		} else {
			g_font_rating = _font("Segoe Fluent Icons", ppt.fontSize.value + 5);
			chars.rating_on = "\ue1cf";
			chars.rating_off = "\ue1ce";
		}
	} else {
		g_font_rating = _font("Segoe Fluent Icons", ppt.fontSize.value + 1);
		chars.heart_on = "\ue00b";
		chars.heart_off = "\ue006";
	}
	g_font_height = height(g_font);
	g_font_bold_height = height(g_font_bold);
	g_font_group_height = height(g_font_group);
	g_margin = scale(ppt.fontSize.value - 4);
}

function get_colours() {
	if (window.IsDefaultUI) {
		g_colour_background = window.GetColourDUI(ColourTypeDUI.background);
		g_colour_selection = window.GetColourDUI(ColourTypeDUI.selection);
		g_colour_text = /*window.GetColourDUI(ColourTypeDUI.text)*/DetermineTextColour(g_colour_background);
		g_colour_selected_text = DetermineTextColour(g_colour_selection);
		g_colour_highlight = window.GetColourDUI(ColourTypeDUI.highlight);
		g_colour_splitter = window.IsDark ? 0xff424242 : 0xfff0f0f0;
	} else {
		g_colour_background = window.GetColourCUI(ColourTypeCUI.background);
		g_colour_selection = window.GetColourCUI(ColourTypeCUI.selection_background);
		g_colour_text = /*window.GetColourCUI(ColourTypeCUI.text)*/DetermineTextColour(g_colour_background);
		g_colour_selected_text = window.GetColourCUI(ColourTypeCUI.selection_text);
		g_colour_highlight = window.GetColourCUI(ColourTypeCUI.selection_background);
		g_colour_splitter = window.IsDark ? 0xff333333 : 0xfff0f0f0;
	}
	g_colour_blend = blendColours(g_colour_background, g_colour_text, 0.35);
	get_images();
}

function process_string(str) {
	var str_ = [];
	str = str.toLowerCase();
	while (str != (temp = str.replace("  ", " ")))
		str = temp;
	str = str.split(" ").sort();
	for (var i in str) {
		if (str[i] != "") {
			str_[str_.length] = str[i];
		}
	}
	return str_;
}

function match(input, str) {
	input = input.toLowerCase();
	for (var j in str) {
		if (input.indexOf(str[j]) < 0)
			return false;
	}
	return true;
}

var ButtonStates = {
	normal: 0,
	hover: 1,
	down: 2
};

var KMask = {
	none: 0,
	ctrl: 1,
	shift: 2,
};

var images = {
	cache : {},
	clear : function () {
		for (var i in this.cache) {
			this.cache[i].Dispose();
		}
		this.cache = {};
	}
}

var ppt = {
	headerBarHeight: 0,
	refreshRate: 25,
	scrollSmoothness: 2.5,
	rowScrollStep: 3,
	ratingStar: new _p("SMOOTH.RATING.STAR", false),
	fontSize: new _p("SMOOTH.FONT.SIZE", 9)
};

var CACHE_FOLDER = fb.ProfilePath + "cache\\";
utils.CreateFolder(CACHE_FOLDER);

var g_font = undefined;
var g_font_bold = undefined;
var g_font_group = undefined;
var g_margin = 0;

var g_colour_text = undefined;
var g_colour_blend = undefined;
var g_colour_selected_text = undefined;
var g_colour_background = undefined;
var g_colour_selection = undefined;
var g_colour_highlight = undefined;
var g_colour_splitter = undefined;

var isScrolling = false;
var need_repaint = false;
var g_start_ = 0, g_end_ = 0;
var m_x = 0, m_y = 0;
var scroll_ = 0, scroll = 0, scroll_prev = 0;
var ww = 0, wh = 0;

get_font();
get_colours();