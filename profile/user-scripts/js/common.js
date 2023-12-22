function _artistFolder(artist) {
	var folder = folders.artists + utils.ReplaceIllegalChars(artist, true, true);
	utils.CreateFolder(folder);
	return folder + '\\';
}

function _button(x, y, w, h, normal, hover, fn, tiptext) {
	this.paint = function (gr) {
		if (this.current) {
			gr.FillEllipse(this.x + this.w * 0.5, this.y + this.h * 0.5, this.w * 0.5, this.h * 0.5, this.current.bg);
			gr.WriteText(this.current.char, this.font, this.current.colour & 0xeeffffff, this.x, this.y, this.w, this.h, 2, 2);
		}
	}

	this.trace = function (x, y) {
		return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
	}

	this.lbtn_up = function (x, y, mask) {
		if (this.fn) {
			this.fn(x, y, mask);
		}
	}

	this.cs = function (s) {
		if (s == 'hover') {
			this.current = this.hover;
			_tt(this.tiptext);
		} else {
			this.current = this.normal;
		}
		window.RepaintRect(this.x, this.y, this.w, this.h);
	}

	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.fn = fn;
	this.tiptext = tiptext;
	this.normal = normal;
	this.hover = hover || normal;
	this.current = normal;
	this.font = JSON.stringify({Name:'Segoe Fluent Icons',Size:this.h * 0.5});
}

function _buttons() {
	this.paint = function (gr) {
		_.invoke(this.buttons, 'paint', gr);
	}

	this.move = function (x, y) {
		var temp_btn = null;
		_.forEach(this.buttons, function (item, i) {
			if (item.trace(x, y)) {
				temp_btn = i;
			}
		});
		if (this.btn == temp_btn) {
			return this.btn;
		}
		if (this.btn) {
			this.buttons[this.btn].cs('normal');
		}
		if (temp_btn) {
			this.buttons[temp_btn].cs('hover');
		} else {
			_tt('');
		}
		this.btn = temp_btn;
		return this.btn;
	}

	this.leave = function () {
		if (this.btn) {
			_tt('');
			this.buttons[this.btn].cs('normal');
		}
		this.btn = null;
	}

	this.lbtn_up = function (x, y, mask) {
		if (this.btn) {
			this.buttons[this.btn].lbtn_up(x, y, mask);
			return true;
		}
		return false;
	}

	this.change_font = function (name) {
		_.forEach(this.buttons, function (item) {
			item.font = JSON.stringify({Name:name,Size:item.h});
		});
	}

	this.buttons = {};
	this.btn = null;
}

function _clamp(value, min, max) {
	if (value < min) return min;
	if (value > max) return max;
	return value;
}

function _dispose() {
	_.forEach(arguments, function (item) {
		if (item) {
			item.Dispose();
		}
	});
}

function _drawImage(gr, img, dst_x, dst_y, dst_w, dst_h, mode, rounded, border, opacity) {
	if (!img) {
		return [];
	}

	var rounded_mask = utils.CreateImage(img.Width, img.Height);
	var temp_gr = rounded_mask.GetGraphics();
	temp_gr.FillRoundedRectangle(0, 0, img.Width, img.Height, img.Width * 0.02, img.Height * 0.02, 0xff000000);
	rounded_mask.ReleaseGraphics();
	temp_gr = null;

	switch (true) {
	case (dst_w == dst_h && img.Width == img.Height) || (dst_w == img.Width && dst_h == img.Height):
	case mode == image.stretch:
		if (rounded) {
			gr.DrawImageWithMask(img, rounded_mask, dst_x, dst_y, dst_w, dst_h);
			gr.DrawRoundedRectangle(dst_x, dst_y, dst_w, dst_h, dst_w * 0.02, dst_w * 0.02, _scale(1), border);
		} else {
			gr.DrawImage(img, dst_x, dst_y, dst_w, dst_h, 0, 0, img.Width, img.Height, opacity || 1);
			gr.DrawRectangle(dst_x, dst_y, dst_w, dst_h, _scale(1), border);
		}
		break;
	case mode == image.crop:
	case mode == image.crop_top:
		if (img.Width / img.Height < dst_w / dst_h) {
			var src_x = 0;
			var src_w = img.Width;
			var src_h = Math.round(dst_h * img.Width / dst_w);
			var src_y = Math.round((img.Height - src_h) / (mode == image.crop_top ? 4 : 2));
		} else {
			var src_y = 0;
			var src_w = Math.round(dst_w * img.Height / dst_h);
			var src_h = img.Height;
			var src_x = Math.round((img.Width - src_w) / 2);
		}
		if (rounded) {
			gr.DrawImageWithMask(img, rounded_mask, dst_x, dst_y, dst_w, dst_h);
			gr.DrawRoundedRectangle(dst_x, dst_y, dst_w - 1, dst_h - 1, dst_w * 0.02, dst_w * 0.02, 1, border);
		} else {
			gr.DrawImage(img, dst_x, dst_y, dst_w, dst_h, src_x + 3, src_y + 3, src_w - 6, src_h - 6, opacity || 1);
			gr.DrawRectangle(dst_x, dst_y, dst_w - 1, dst_h - 1, 1, border);
		}
		break;
	case mode == image.centre:
	default:
		var s = Math.min(dst_w / img.Width, dst_h / img.Height);
		var w = Math.floor(img.Width * s);
		var h = Math.floor(img.Height * s);
		dst_x += Math.round((dst_w - w) / 2);
		dst_y += Math.round((dst_h - h) / 2);
		dst_w = w;
		dst_h = h;
		if (rounded) {
			gr.DrawImageWithMask(img, rounded_mask, dst_x, dst_y, dst_w, dst_h);
			gr.DrawRoundedRectangle(dst_x, dst_y, dst_w - 1, dst_h - 1, dst_w * 0.02, dst_w * 0.02, 1, border);
		} else {
			gr.DrawImage(img, dst_x, dst_y, dst_w, dst_h, 0, 0, img.Width, img.Height, opacity || 1);
			gr.DrawRectangle(dst_x, dst_y, dst_w - 1, dst_h - 1, 1, border);
		}
		break;
	}
	return [dst_x, dst_y, dst_w, dst_h];
}

function _drawOverlay(gr, x, y, w, h, alpha) {
	gr.FillRectangle(x, y, w, h, RGBA(0, 0, 0, alpha || 230));
}

function _explorer(file) {
	if (utils.IsFile(file)) {
		utils.Run('explorer', '/select,' + _q(file));
	}
}

function _fbEscape(value) {
	if (typeof value != 'string') return '';
	return value.replace(/'/g, "''").replace(/[\(\)\[\],$]/g, "'$&'");
}

function _fileExpired(file, period) {
	return Math.floor(Date.now() / 1000) - utils.GetLastModified(file) > period;
}

function _firstElement(obj, tag_name) {
	try {
		return _.first(obj.getElementsByTagName(tag_name));
	} catch (e) {}

	return undefined;
}

function _formatNumber(number, separator) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

function _getElementsByTagName(value, tag) {
	doc.open();
	var div = doc.createElement('div');
	div.innerHTML = value;
	var data = div.getElementsByTagName(tag);
	doc.close();
	return data;
}

function _getExt(path) {
	return path.split('.').pop().toLowerCase();
}

function _getFiles(folder, exts) {
	var files = [];

	if (_.isArray(folder)) {
		folder.forEach(function (item) {
			Array.prototype.push.apply(files, utils.ListFiles(item).toArray());
		});
	} else {
		files = utils.ListFiles(folder).toArray();
	}

	if (!exts) {
		return files;
	}
	return _.filter(files, function (item) {
		var ext = _getExt(item);
		return _.includes(exts, ext);
	});
}

function _help(x, y, flags) {
	var menu = window.CreatePopupMenu();
	_.forEach(ha_links, function (item, i) {
		menu.AppendMenuItem(MF_STRING, i + 100, item[0]);
		if (i == 1) {
			menu.AppendMenuSeparator();
		}
	});
	menu.AppendMenuSeparator();
	menu.AppendMenuItem(MF_STRING, 1, 'Configure...');

	var idx = menu.TrackPopupMenu(x, y, flags);
	menu.Dispose();

	switch (true) {
	case idx == 0:
		break;
	case idx == 1:
		window.ShowConfigure();
		break;
	default:
		utils.Run(ha_links[idx - 100][1]);
		break;
	}
}

function _isUUID(value) {
	var re = /^[0-9a-f]{8}-[0-9a-f]{4}-[345][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
	return re.test(value);
}

function _jsonParse(value) {
	try {
		var data = JSON.parse(value);
		return data;
	} catch (e) {
		return [];
	}
}

function _jsonParseFile(file) {
	return _jsonParse(utils.ReadUTF8(file));
}

function _lockSize(w, h) {
	window.MinWidth = window.MaxWidth = w;
	window.MinHeight = window.MaxHeight = h;
}

function _menu(x, y, flags) {
	var menu = window.CreatePopupMenu();
	var file = new _main_menu_helper('File', 10000, menu);
	var edit = new _main_menu_helper('Edit', 20000, menu);
	var view = new _main_menu_helper('View', 30000, menu);
	var playback = new _main_menu_helper('Playback', 40000, menu);
	var library = new _main_menu_helper('Library', 50000, menu);
	var help = new _main_menu_helper('Help', 60000, menu);

	var idx = menu.TrackPopupMenu(x, y, flags);
	menu.Dispose();

	switch (true) {
	case idx == 0:
		break;
	case idx < 20000:
		file.mm.ExecuteByID(idx - 10000);
		break;
	case idx < 30000:
		edit.mm.ExecuteByID(idx - 20000);
		break;
	case idx < 40000:
		view.mm.ExecuteByID(idx - 30000);
		break;
	case idx < 50000:
		playback.mm.ExecuteByID(idx - 40000);
		break;
	case idx < 60000:
		library.mm.ExecuteByID(idx - 50000);
		break;
	case idx < 70000:
		help.mm.ExecuteByID(idx - 60000);
		break;
	}

	file.mm.Dispose();
	edit.mm.Dispose();
	view.mm.Dispose();
	playback.mm.Dispose();
	library.mm.Dispose();
	help.mm.Dispose();
}

function _main_menu_helper(name, base_id, main_menu) {
	this.popup = window.CreatePopupMenu();
	this.mm = fb.CreateMainMenuManager(name);
	this.mm.BuildMenu(this.popup, base_id);
	this.popup.AppendTo(main_menu, MF_STRING, name);
}

function _p(name, default_) {
	Object.defineProperty(this, _.isBoolean(default_) ? 'enabled' : 'value', {
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

function _q(value) {
	return '"' + value + '"';
}

function _save(file, value) {
	if (utils.WriteTextFile(file, value)) {
		return true;
	}
	console.log('Error saving to ' + file);
	return false;
}

function _sb(ch, x, y, w, h, v, fn) {
	this.paint = function (gr, colour) {
		if (this.v()) {
			gr.WriteText(this.ch, this.font, colour, this.x, this.y, this.w, this.h, 2, 2);
		}
	}

	this.trace = function (x, y) {
		return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h && this.v();
	}

	this.move = function (x, y) {
		if (this.trace(x, y)) {
			window.SetCursor(IDC_HAND);
			this.hover = true;
			return true;
		}

		//window.SetCursor(IDC_ARROW);
		this.hover =false;
		return false;
	}

	this.lbtn_up = function (x, y) {
		if (this.trace(x, y)) {
			if (this.fn) {
				this.fn(x, y);
			}
			return true;
		}
		return false;
	}

	this.hover = false;
	this.ch = ch;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.v = v;
	this.fn = fn;
	this.font = JSON.stringify({Name:'Segoe Fluent Icons',Size:h});
}

function _scale(size) {
	return Math.round(size * DPI / 72);
}

function _stringToArray(str, sep) {
	if (typeof str != 'string' || typeof sep != 'string') return [];
	return str.split(sep).map(function (item) { return item.trim(); }).filter(function (item) { return !item.empty(); });
}

function _stripTags(value) {
	doc.open();
	var div = doc.createElement('div');
	div.innerHTML = value.toString().replace(/<[Pp][^>]*>/g, '').replace(/<\/[Pp]>/g, '<br>').replace(/\n/g, '<br>');
	var tmp = div.innerText.trim();
	doc.close();
	return tmp;
}

function _tagged(value) {
	return value != '' && value != '?';
}

function _tt(value) {
	if (tooltip.Text != value) {
		tooltip.Text = value;
		tooltip.Activate();
	}
}

var doc = new ActiveXObject('htmlfile');

var ONE_DAY = 86400;
var DEFAULT_ARTIST = '$meta(artist,0)';
var N = window.Name + ':';
var LM = _scale(5);
var TM = _scale(20);

var tooltip = window.CreateTooltip('Segoe UI', _scale(12));
tooltip.SetMaxWidth(800);

var folders = {};
folders.home = 'c:\\muzik\\cache\\';
folders.images = folders.home;
folders.data = folders.home;
folders.artists = folders.data;
folders.lastfm = folders.data;

var image = {
	crop : 0,
	crop_top : 1,
	stretch : 2,
	centre : 3
};

var ha_links = [
	['Title Formatting Reference', 'https://wiki.hydrogenaud.io/index.php?title=Foobar2000:Title_Formatting_Reference'],
	['Query Syntax', 'https://wiki.hydrogenaud.io/index.php?title=Foobar2000:Query_syntax'],
	['Homepage', 'https://www.foobar2000.org/'],
	['Components', 'https://www.foobar2000.org/components'],
	['Wiki', 'https://wiki.hydrogenaud.io/index.php?title=Foobar2000:Foobar2000'],
	['Forums', 'https://hydrogenaud.io/index.php/board,28.0.html']
];

var tfo = {
	album: '$if(%length%,$if2(%album%,Single),Web Radios)',
	album_artist: '$if(%length%,$if2(%album artist%,Unknown album artist),Streams)',
	genre: '$if2([%year%],Unknown year)$if2( \u00B7 [%genre%],Unspecified genre)[ \u00B7 $num(%totaltracks%,) song$ifgreater(%totaltracks%,1,s,)]',
	title: '[%title%]',
	artist: '$if2([%artist%],Unknown artist)',
	count: '$ifequal(%play_count%,0,Never played,$ifequal(%play_count%,1,Played only once,$ifequal(%play_count%,2,Played twice,Played %play_count% times)))',
	released: '$if3([%releasedate%],[%date%],[%last_modified%])',
	publisher: '$if3([%publisher%],%url%,Unspecified publisher)',
	elap: '[%playback_time%]',
	remain: '[\'-\'%playback_time_remaining%]',
	status: '%codec% \u00B7 %bitrate% kbps [\u00B7 %samplerate% Hz ][\u00B7 %channels% ][\u00B7 %playback_time% / ][%length%]'
};

chars.close = '\ue8bb';
chars.flowin = '\uea5f';
chars.heart_broken = '\ue00c';
chars.horizental = '\ue147';
chars.next = '\ue623';
chars.output = '\uebde';
chars.pause = '\uf8ae';
chars.play = '\uf5b0';
chars.prev = '\ue622';
chars.stop = '\ue002';
chars.vertical = '\ue146';
chars.volume0 = '\ue992';
chars.volume1 = '\ue993';
chars.volume2 = '\ue994'; 
chars.volume3 = '\ue995';
chars.volume4 = '\ue74f';