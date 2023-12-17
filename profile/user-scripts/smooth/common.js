String.prototype.calc_width = function (font_str) {
	var font = JSON.parse(font_str);
	return utils.CalcTextWidth(this, font.Name, font.Size, font.Weight || 400);
}

String.prototype.repeat = function (num) {
	if (num >= 0 && num <= 5) {
		var g = Math.round(num);
	} else {
		return "";
	}
	return new Array(g + 1).join(this);
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
	var max_size = 300;
	for (var i = 0; i < brw.groups.length; i++) {
		if (brw.groups[i].metadb && brw.groups[i].metadb.Compare(metadb)) {
			if (image.Width > max_size || image.Height > max_size) {
				var s = Math.min(max_size / image.Width, max_size / image.Height);
				var w = Math.floor(image.Width * s);
				var h = Math.floor(image.Height * s);
				image.Resize(w, h);
			}
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

function update_extra_font_size(s) {
	var tmp = clamp(g_fsize.value + s, 9, 14);
	if (g_fsize.value != tmp) {
		g_fsize.value = tmp;
		window.SetProperty("SMOOTH.FONT.SIZE", g_fsize.value);
		get_font();
		get_metrics();
		get_images();
		brw.scrollbar.setCursorButton();
		brw.repaint();
	}
}

function get_images() {
	var gb;
	var cs = scale(g_fsize.value + 91); // cover size
	var bs = scale(g_fsize.value + 5);
	var font_cover = _font("Segoe Fluent Icons", cs * 0.25);
	var font_icon = _font("Segoe Fluent Icons", bs * 0.5);

	images.noart = utils.CreateImage(cs, cs);
	gb = images.noart.GetGraphics();
	gb.FillRectangle(0, 0, cs, cs, g_colour_splitter);
	gb.WriteText("\ue189", font_cover, g_colour_blend, 1, 1, cs, cs, 2, 2);
	images.noart.ReleaseGraphics();

	images.stream = utils.CreateImage(cs, cs);
	gb = images.stream.GetGraphics();
	gb.FillRectangle(0, 0, cs, cs, g_colour_splitter);
	gb.WriteText("\ue93e", font_cover, g_colour_blend, 1, 1, cs, cs, 2, 2);
	images.stream.ReleaseGraphics();

	images.magnify = utils.CreateImage(bs, bs);
	gb = images.magnify.GetGraphics();
	gb.WriteText("\uf78b", font_icon, g_colour_blend, 0, 0, bs, bs, 2, 2);
	images.magnify.ReleaseGraphics();

	images.reset_normal = utils.CreateImage(bs, bs);
	gb = images.reset_normal.GetGraphics();
	gb.WriteText("\ue711", font_icon, g_colour_blend, 0, 0, bs, bs, 2, 2);
	images.reset_normal.ReleaseGraphics();

	images.reset_hover = utils.CreateImage(bs, bs);
	gb = images.reset_hover.GetGraphics();
	gb.WriteText("\ue711", font_icon, g_colour_text, 0, 0, bs, bs, 2, 2);
	images.reset_hover.ReleaseGraphics();
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

function get_art(metadb, filename, art_id) {
	var img = images.cache[filename];
	if (img) return img;

	img = utils.LoadImage(filename);
	if (img) {
		images.cache[filename] = img;
		return img;
	}

	window.SetTimeout(function () {
		metadb.GetAlbumArtAsync(window.ID, art_id, false);
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
	if (g_themed) {
		g_theme.DrawThemeBackground(gr, x, y, w, h);
	} else {
	gr.FillRectangle(x, y, w, h, setAlpha(g_colour_selection, 96));
	}
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
	Object.defineProperty(this, typeof default_ == 'boolean' ? 'enabled' : 'value', {
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

	g_font = _font(name, g_fsize.value);
	g_font_group = _font(name, g_fsize.value + 2, true);

	switch (true){
		case utils.CheckFont("Guifx v2 Transports"):
			g_font_rating = _font("Guifx v2 Transports", g_fsize.value + 5);
			chars.rating_on = 'b';
			chars.rating_off = 'b';
			break;
		default:
			g_font_rating = _font("Segoe Fluent Icons", g_fsize.value + 5);
			chars.rating_on = '\ue1cf';
			chars.rating_off = '\ue1ce';	
	}

	g_font_height = height(g_font);
	g_font_group_height = height(g_font_group);
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
	// check g_theme to make sure window.CreateThemeManager didn't return null
	// window.IsThemed is a new boolean property for 3.2.11 and later, undefined for previous versions
	g_themed = g_theme && window.IsThemed;
	if (g_themed) {
		g_theme.SetPartAndStateID(6, 12);
		g_colour_selected_text = utils.GetSysColour(8);
	}
	get_images();
}

function process_string(str) {
  str_ = [];
  str = str.toLowerCase();
  while (str != (temp = str.replace(' ', ' ')))
    str = temp;
  var str = str.split(' ').sort();
  for (var i in str) {
    if (str[i] != '')
      str_[str_.length] = str[i];
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
};

var CACHE_FOLDER = fb.ProfilePath + "cache\\";
utils.CreateFolder(CACHE_FOLDER);

var g_font = "";
var g_font_group = "";
var g_fsize = new _p('SMOOTH.FONT.SIZE', 9);;

var g_colour_text = 0;
var g_colour_selected_text = 0;
var g_colour_background = 0;
var g_colour_selection = 0;
var g_colour_highlight = 0;
var g_colour_splitter = 0;
var g_themed = false;
var g_theme = window.CreateThemeManager("LISTVIEW");

var isScrolling = false;
var need_repaint = false;
var g_start_ = 0, g_end_ = 0;
var m_x = 0, m_y = 0;
var scroll_ = 0, scroll = 0, scroll_prev = 0;
var ww = 0, wh = 0;
var margin = scale(g_fsize.value - 4);

get_font();
get_colours();