Array.prototype.srt=function(){for(var z=0,t;t=this[z];z++){this[z]=[];var x=0,y=-1,n=true,i,j;while(i=(j=t.charAt(x++)).charCodeAt(0)){var m=(i==46||(i>=48&&i<=57));if(m!==n){this[z][++y]='';n=m;}
this[z][y]+=j;}}
this.sort(function(a,b){for(var x=0,aa,bb;(aa=a[x])&&(bb=b[x]);x++){aa=aa.toLowerCase();bb=bb.toLowerCase();if(aa!==bb){var c=Number(aa),d=Number(bb);if(c==aa&&d==bb){return c-d;}else return(aa>bb)?1:-1;}}
return a.length-b.length;});for(var z=0;z<this.length;z++)
this[z]=this[z].join('');}

Array.prototype.empty = function () {
	return this.length == 0;
}

String.prototype.empty = function () {
	return this.length == 0;
}

function _artistFolder(artist) {
	var folder = folders.artists + _sanitiseFolder(artist);
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
			window.SetCursor(IDC_ARROW);
		}
		if (temp_btn) {
			this.buttons[temp_btn].cs('hover');
			window.SetCursor(IDC_HAND);
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
			item.font = JSON.stringify({Name:name,Size:item.h - _scale(10)});
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
	temp_gr.FillRoundedRectangle(0, 0, img.Width, img.Height, img.Width * 0.02, img.Height * 0.02, RGB(0, 0, 0));
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
	var folders = _stringToArray(folder, '|');
	for (var i = 0; i < folders.length; i++) {
		Array.prototype.push.apply(files, utils.ListFiles(folders[i]).toArray());
	}
	files.srt();
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
	var file = new _main_menu_helper('File', 1000, menu);
	var edit = new _main_menu_helper('Edit', 2000, menu);
	var view = new _main_menu_helper('View', 3000, menu);
	var playback = new _main_menu_helper('Playback', 4000, menu);
	var library = new _main_menu_helper('Library', 5000, menu);
	var help = new _main_menu_helper('Help', 6000, menu);

	var idx = menu.TrackPopupMenu(x, y, flags);
	menu.Dispose();

	switch (true) {
	case idx == 0:
		break;
	case idx < 2000:
		file.mm.ExecuteByID(idx - 1000);
		break;
	case idx < 3000:
		edit.mm.ExecuteByID(idx - 2000);
		break;
	case idx < 4000:
		view.mm.ExecuteByID(idx - 3000);
		break;
	case idx < 5000:
		playback.mm.ExecuteByID(idx - 4000);
		break;
	case idx < 6000:
		library.mm.ExecuteByID(idx - 5000);
		break;
	case idx < 7000:
		help.mm.ExecuteByID(idx - 6000);
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

function _sanitiseFolder(folder) {
	return utils.ReplaceIllegalChars(folder).replace(/\.+$/, '');
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
		} else {
			//window.SetCursor(IDC_ARROW);
			this.hover =false;
			return false;
		}
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
	var tmp = _.trim(div.innerText);
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

var tooltip = window.CreateTooltip('Segoe UI', _scale(11));
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

var chars = {
	prev: '\ue622',
	play: '\uf5b0',
	pause: '\uf8ae',
	stop: '\ue002',
	next: '\ue623',
	heart_break: '\uea92',
	heart_off: '\ueb51',
	heart_on: '\ueb52',
	rating_off: '\ue1ce',
	rating_on: '\ue1cf',
	shuffle: '\ue14b',
	repeat_off: '\ue8ee',
	repeat_on: '\ue8ed',
	volume0: '\ue992',
	volume1: '\ue993',
	volume2: '\ue994', 
	volume3: '\ue995',
	volume4: '\ue74f',
	close: '\ue8bb',
	menu: '\ue700',
	more: '\ue712',
	pip: '\uea5f',
	flowin: '\ue7c4',
	output: '\uebde',
	smile: '\ueb68',
	pref: '\ue713',
	down: '\ue70d',
	up: '\ue70e',
	download: '\ue118',
	update: '\ue777',
	folder_open: '\ue838',
	delete: '\ue107',
	// Ignore these, they are special chars for $rgb and $font parsing
	etx : String.fromCharCode(3),
	bel : String.fromCharCode(7),
	tab : '\t',
};
