�����6J�A_s��!   -�p6�,bG��$@��Q�b   Lv?%��Tq���       V   %codec% | %bitrate% kbps | %samplerate% Hz | %channels% | %playback_time%[ / %length%]F��OմLH��.�� JI$   ��ihT ◇��ۈ��      �t�o�@����LQ�9`          QiDUN�Y���C:  �M�7k��- U�P��U�   ��rh�J�#�$�N��n9  ���.hx�L�w��H�3�nlj�6�O�7d{�]�&��߂j�@���!Jݞ�  �  �!  ��߂j�@���!Jݞ��߂j�@���!Jݞ_  +
  4  wv  �  // ==PREPROCESSOR==
// @name "Smooth Playlist Manager"
// @author "Br3tt aka Falstaff"
// @import "%fb2k_component_path%helpers.txt"
// @import "%fb2k_profile_path%user-scripts\smooth\common.js"
// @import "%fb2k_profile_path%user-scripts\smooth\inputbox.js"
// @import "%fb2k_profile_path%user-scripts\smooth\scrollbar.js"
// @import "%fb2k_profile_path%user-scripts\smooth\jsspm.js"
// ==/PREPROCESSOR==

// https://jscript-panel.github.io/gallery/smooth-playlist-manager/      SMOOTH.ACTIVE        SMOOTH.FONT.SIZE 	      SMOOTH.SHOW.ITEMCOUNT      SMOOTH.SHOW.SCROLLBAR       wv  J  var mode = window.GetProperty('2K3.SCRIPT', 0);
var filelist = {
  pls: [
    '%fb2k_component_path%helpers.txt',
    '%fb2k_profile_path%user-scripts\\smooth\\common.js',
    '%fb2k_profile_path%user-scripts\\smooth\\inputbox.js',
    '%fb2k_profile_path%user-scripts\\smooth\\scrollbar.js',
    '%fb2k_profile_path%user-scripts\\smooth\\jssp.js'
  ],
  bio: [
    '%fb2k_component_path%helpers.txt',
    '%fb2k_component_path%samples\\js\\lodash.min.js',
    '%fb2k_profile_path%user-scripts\\js\\common.js',
    '%fb2k_profile_path%user-scripts\\js\\panel.js',
    '%fb2k_component_path%samples\\js\\lastfm.js',
    '%fb2k_component_path%samples\\js\\thumbs.js',
    '%fb2k_component_path%samples\\js\\text.js',
    '%fb2k_profile_path%user-scripts\\bio.js'
  ]
};
var text = '';

switch (mode) {
  case 0:
    for (i = 0; i < filelist.pls.length; i++) {
      text += utils.ReadUTF8(filelist.pls[i].replace('%fb2k_profile_path%', fb.ProfilePath).replace('%fb2k_component_path%', fb.ComponentPath)) + '\n';
    }
    break;
  case 1:
    for (i = 0; i < filelist.bio.length; i++) {
      text += utils.ReadUTF8(filelist.bio[i].replace('%fb2k_profile_path%', fb.ProfilePath).replace('%fb2k_component_path%', fb.ComponentPath)) + '\n';
    }
    break;  
}

eval(text);

(function (global) {
	var original_callback = global.on_notify_data;
	global.on_notify_data = function (name, info) {
		if (name == 'SCRIPT') {
			window.SetProperty('2K3.SCRIPT', info);
			window.Reload();
		} else if (original_callback) {
			original_callback(name, info);
		}
	}
})(this);   #   2K3.PANEL.COLOURS.CUSTOM.BACKGROUND    �"   2K3.PANEL.COLOURS.CUSTOM.HIGHLIGHT �f �   2K3.PANEL.COLOURS.CUSTOM.TEXT ����   2K3.PANEL.COLOURS.MODE        2K3.PANEL.FONTS.SIZE 	      2K3.PANEL.SELECTION     
   2K3.SCRIPT        2K3.TEXT.BIO.EXTRA ��   2K3.TEXT.BIO.FLAG.MAP    korea, republic of|kr   2K3.TEXT.BIO.FLAG.TF    $country_flag(%country%)   2K3.TEXT.BIO.LANG        2K3.THUMBS.ASPECT       2K3.THUMBS.AUTO.DOWNLOAD ��   2K3.THUMBS.CIRCULAR      2K3.THUMBS.CUSTOM.FOLDER.TF    $directory_path(%path%)   2K3.THUMBS.CYCLE        2K3.THUMBS.DOUBLE.CLICK.MODE        2K3.THUMBS.DOWNLOAD.LIMIT 
      2K3.THUMBS.LAYOUT        2K3.THUMBS.MODE       2K3.THUMBS.PX K      2K3.THUMBS.RATIO       �?   2K3.THUMBS.SIZE.LIMIT       2K3.THUMBS.SOURCE       SMOOTH.FONT.SIZE 	      SMOOTH.SHOW.GROUP.HEADERS ��   SMOOTH.SHOW.HEADER.BAR ��   SMOOTH.SHOW.RATING ��   SMOOTH.SHOW.SCROLLBAR ��   SMOOTH.SHOW.STRIPES ��    ������������    ����TfB���;�_�     PC    ��߂j�@���!Jݞ_  wv  �  // ==PREPROCESSOR==
// @name "Smooth Playlist Manager"
// @author "Br3tt aka Falstaff"
// @import "%fb2k_component_path%helpers.txt"
// @import "%fb2k_profile_path%user-scripts\smooth\common.js"
// @import "%fb2k_profile_path%user-scripts\smooth\inputbox.js"
// @import "%fb2k_profile_path%user-scripts\smooth\scrollbar.js"
// @import "%fb2k_profile_path%user-scripts\smooth\jsspm.js"
// ==/PREPROCESSOR==

// https://jscript-panel.github.io/gallery/smooth-playlist-manager/      SMOOTH.ACTIVE        SMOOTH.FONT.SIZE 	      SMOOTH.SHOW.ITEMCOUNT      SMOOTH.SHOW.SCROLLBAR       ��CD    ��߂j�@���!Jݞ+
  wv  J  var mode = window.GetProperty('2K3.SCRIPT', 0);
var filelist = {
  pls: [
    '%fb2k_component_path%helpers.txt',
    '%fb2k_profile_path%user-scripts\\smooth\\common.js',
    '%fb2k_profile_path%user-scripts\\smooth\\inputbox.js',
    '%fb2k_profile_path%user-scripts\\smooth\\scrollbar.js',
    '%fb2k_profile_path%user-scripts\\smooth\\jssp.js'
  ],
  bio: [
    '%fb2k_component_path%helpers.txt',
    '%fb2k_component_path%samples\\js\\lodash.min.js',
    '%fb2k_profile_path%user-scripts\\js\\common.js',
    '%fb2k_profile_path%user-scripts\\js\\panel.js',
    '%fb2k_component_path%samples\\js\\lastfm.js',
    '%fb2k_component_path%samples\\js\\thumbs.js',
    '%fb2k_component_path%samples\\js\\text.js',
    '%fb2k_profile_path%user-scripts\\bio.js'
  ]
};
var text = '';

switch (mode) {
  case 0:
    for (i = 0; i < filelist.pls.length; i++) {
      text += utils.ReadUTF8(filelist.pls[i].replace('%fb2k_profile_path%', fb.ProfilePath).replace('%fb2k_component_path%', fb.ComponentPath)) + '\n';
    }
    break;
  case 1:
    for (i = 0; i < filelist.bio.length; i++) {
      text += utils.ReadUTF8(filelist.bio[i].replace('%fb2k_profile_path%', fb.ProfilePath).replace('%fb2k_component_path%', fb.ComponentPath)) + '\n';
    }
    break;  
}

eval(text);

(function (global) {
	var original_callback = global.on_notify_data;
	global.on_notify_data = function (name, info) {
		if (name == 'SCRIPT') {
			window.SetProperty('2K3.SCRIPT', info);
			window.Reload();
		} else if (original_callback) {
			original_callback(name, info);
		}
	}
})(this);   #   2K3.PANEL.COLOURS.CUSTOM.BACKGROUND    �"   2K3.PANEL.COLOURS.CUSTOM.HIGHLIGHT �f �   2K3.PANEL.COLOURS.CUSTOM.TEXT ����   2K3.PANEL.COLOURS.MODE        2K3.PANEL.FONTS.SIZE 	      2K3.PANEL.SELECTION     
   2K3.SCRIPT        2K3.TEXT.BIO.EXTRA ��   2K3.TEXT.BIO.FLAG.MAP    korea, republic of|kr   2K3.TEXT.BIO.FLAG.TF    $country_flag(%country%)   2K3.TEXT.BIO.LANG        2K3.THUMBS.ASPECT       2K3.THUMBS.AUTO.DOWNLOAD ��   2K3.THUMBS.CIRCULAR      2K3.THUMBS.CUSTOM.FOLDER.TF    $directory_path(%path%)   2K3.THUMBS.CYCLE        2K3.THUMBS.DOUBLE.CLICK.MODE        2K3.THUMBS.DOWNLOAD.LIMIT 
      2K3.THUMBS.LAYOUT        2K3.THUMBS.MODE       2K3.THUMBS.PX K      2K3.THUMBS.RATIO       �?   2K3.THUMBS.SIZE.LIMIT       2K3.THUMBS.SOURCE       SMOOTH.FONT.SIZE 	      SMOOTH.SHOW.GROUP.HEADERS ��   SMOOTH.SHOW.HEADER.BAR ��   SMOOTH.SHOW.RATING ��   SMOOTH.SHOW.SCROLLBAR ��   SMOOTH.SHOW.STRIPES ��    wv  h  // ==PREPROCESSOR==
// @name "Vibe"
// @author "seongbin"
// @import "%fb2k_component_path%helpers.txt"
// @import "%fb2k_component_path%samples\js\lodash.min.js"
// @import "%fb2k_profile_path%user-scripts\js\common.js"
// @import "%fb2k_profile_path%user-scripts\js\panel.js"
// @import "%fb2k_profile_path%user-scripts\vibe2.js"
// ==/PREPROCESSOR==
      2K3.ARTREADER.BORDER ��   2K3.ARTREADER.DOUBLE.CLICK.MODE        2K3.ARTREADER.ID        2K3.ARTREADER.ROUNDED ��#   2K3.PANEL.COLOURS.CUSTOM.BACKGROUND    �"   2K3.PANEL.COLOURS.CUSTOM.HIGHLIGHT �f �   2K3.PANEL.COLOURS.CUSTOM.TEXT ����   2K3.PANEL.COLOURS.MODE        2K3.PANEL.FONTS.SIZE 	      2K3.PANEL.SELECTION         ������������    ����TfB���;�_�   ��D    �nlj�6�O�7d{�]�&�  ��߂j�@���!Jݞ��߂j�@���!Jݞ_  +
  4  wv  �  // ==PREPROCESSOR==
// @name "Smooth Playlist Manager"
// @author "Br3tt aka Falstaff"
// @import "%fb2k_component_path%helpers.txt"
// @import "%fb2k_profile_path%user-scripts\smooth\common.js"
// @import "%fb2k_profile_path%user-scripts\smooth\inputbox.js"
// @import "%fb2k_profile_path%user-scripts\smooth\scrollbar.js"
// @import "%fb2k_profile_path%user-scripts\smooth\jsspm.js"
// ==/PREPROCESSOR==

// https://jscript-panel.github.io/gallery/smooth-playlist-manager/      SMOOTH.ACTIVE        SMOOTH.FONT.SIZE 	      SMOOTH.SHOW.ITEMCOUNT      SMOOTH.SHOW.SCROLLBAR       wv  J  var mode = window.GetProperty('2K3.SCRIPT', 0);
var filelist = {
  pls: [
    '%fb2k_component_path%helpers.txt',
    '%fb2k_profile_path%user-scripts\\smooth\\common.js',
    '%fb2k_profile_path%user-scripts\\smooth\\inputbox.js',
    '%fb2k_profile_path%user-scripts\\smooth\\scrollbar.js',
    '%fb2k_profile_path%user-scripts\\smooth\\jssp.js'
  ],
  bio: [
    '%fb2k_component_path%helpers.txt',
    '%fb2k_component_path%samples\\js\\lodash.min.js',
    '%fb2k_profile_path%user-scripts\\js\\common.js',
    '%fb2k_profile_path%user-scripts\\js\\panel.js',
    '%fb2k_component_path%samples\\js\\lastfm.js',
    '%fb2k_component_path%samples\\js\\thumbs.js',
    '%fb2k_component_path%samples\\js\\text.js',
    '%fb2k_profile_path%user-scripts\\bio.js'
  ]
};
var text = '';

switch (mode) {
  case 0:
    for (i = 0; i < filelist.pls.length; i++) {
      text += utils.ReadUTF8(filelist.pls[i].replace('%fb2k_profile_path%', fb.ProfilePath).replace('%fb2k_component_path%', fb.ComponentPath)) + '\n';
    }
    break;
  case 1:
    for (i = 0; i < filelist.bio.length; i++) {
      text += utils.ReadUTF8(filelist.bio[i].replace('%fb2k_profile_path%', fb.ProfilePath).replace('%fb2k_component_path%', fb.ComponentPath)) + '\n';
    }
    break;  
}

eval(text);

(function (global) {
	var original_callback = global.on_notify_data;
	global.on_notify_data = function (name, info) {
		if (name == 'SCRIPT') {
			window.SetProperty('2K3.SCRIPT', info);
			window.Reload();
		} else if (original_callback) {
			original_callback(name, info);
		}
	}
})(this);   #   2K3.PANEL.COLOURS.CUSTOM.BACKGROUND    �"   2K3.PANEL.COLOURS.CUSTOM.HIGHLIGHT �f �   2K3.PANEL.COLOURS.CUSTOM.TEXT ����   2K3.PANEL.COLOURS.MODE        2K3.PANEL.FONTS.SIZE 	      2K3.PANEL.SELECTION     
   2K3.SCRIPT        2K3.TEXT.BIO.EXTRA ��   2K3.TEXT.BIO.FLAG.MAP    korea, republic of|kr   2K3.TEXT.BIO.FLAG.TF    $country_flag(%country%)   2K3.TEXT.BIO.LANG        2K3.THUMBS.ASPECT       2K3.THUMBS.AUTO.DOWNLOAD ��   2K3.THUMBS.CIRCULAR      2K3.THUMBS.CUSTOM.FOLDER.TF    $directory_path(%path%)   2K3.THUMBS.CYCLE        2K3.THUMBS.DOUBLE.CLICK.MODE        2K3.THUMBS.DOWNLOAD.LIMIT 
      2K3.THUMBS.LAYOUT        2K3.THUMBS.MODE       2K3.THUMBS.PX K      2K3.THUMBS.RATIO       �?   2K3.THUMBS.SIZE.LIMIT       2K3.THUMBS.SOURCE       SMOOTH.FONT.SIZE 	      SMOOTH.SHOW.GROUP.HEADERS ��   SMOOTH.SHOW.HEADER.BAR ��   SMOOTH.SHOW.RATING ��   SMOOTH.SHOW.SCROLLBAR ��   SMOOTH.SHOW.STRIPES ��    ������������    ����TfB���;�_�     PC    ��߂j�@���!Jݞ_  wv  �  // ==PREPROCESSOR==
// @name "Smooth Playlist Manager"
// @author "Br3tt aka Falstaff"
// @import "%fb2k_component_path%helpers.txt"
// @import "%fb2k_profile_path%user-scripts\smooth\common.js"
// @import "%fb2k_profile_path%user-scripts\smooth\inputbox.js"
// @import "%fb2k_profile_path%user-scripts\smooth\scrollbar.js"
// @import "%fb2k_profile_path%user-scripts\smooth\jsspm.js"
// ==/PREPROCESSOR==

// https://jscript-panel.github.io/gallery/smooth-playlist-manager/      SMOOTH.ACTIVE        SMOOTH.FONT.SIZE 	      SMOOTH.SHOW.ITEMCOUNT      SMOOTH.SHOW.SCROLLBAR       ��CD    ��߂j�@���!Jݞ+
  wv  J  var mode = window.GetProperty('2K3.SCRIPT', 0);
var filelist = {
  pls: [
    '%fb2k_component_path%helpers.txt',
    '%fb2k_profile_path%user-scripts\\smooth\\common.js',
    '%fb2k_profile_path%user-scripts\\smooth\\inputbox.js',
    '%fb2k_profile_path%user-scripts\\smooth\\scrollbar.js',
    '%fb2k_profile_path%user-scripts\\smooth\\jssp.js'
  ],
  bio: [
    '%fb2k_component_path%helpers.txt',
    '%fb2k_component_path%samples\\js\\lodash.min.js',
    '%fb2k_profile_path%user-scripts\\js\\common.js',
    '%fb2k_profile_path%user-scripts\\js\\panel.js',
    '%fb2k_component_path%samples\\js\\lastfm.js',
    '%fb2k_component_path%samples\\js\\thumbs.js',
    '%fb2k_component_path%samples\\js\\text.js',
    '%fb2k_profile_path%user-scripts\\bio.js'
  ]
};
var text = '';

switch (mode) {
  case 0:
    for (i = 0; i < filelist.pls.length; i++) {
      text += utils.ReadUTF8(filelist.pls[i].replace('%fb2k_profile_path%', fb.ProfilePath).replace('%fb2k_component_path%', fb.ComponentPath)) + '\n';
    }
    break;
  case 1:
    for (i = 0; i < filelist.bio.length; i++) {
      text += utils.ReadUTF8(filelist.bio[i].replace('%fb2k_profile_path%', fb.ProfilePath).replace('%fb2k_component_path%', fb.ComponentPath)) + '\n';
    }
    break;  
}

eval(text);

(function (global) {
	var original_callback = global.on_notify_data;
	global.on_notify_data = function (name, info) {
		if (name == 'SCRIPT') {
			window.SetProperty('2K3.SCRIPT', info);
			window.Reload();
		} else if (original_callback) {
			original_callback(name, info);
		}
	}
})(this);   #   2K3.PANEL.COLOURS.CUSTOM.BACKGROUND    �"   2K3.PANEL.COLOURS.CUSTOM.HIGHLIGHT �f �   2K3.PANEL.COLOURS.CUSTOM.TEXT ����   2K3.PANEL.COLOURS.MODE        2K3.PANEL.FONTS.SIZE 	      2K3.PANEL.SELECTION     
   2K3.SCRIPT        2K3.TEXT.BIO.EXTRA ��   2K3.TEXT.BIO.FLAG.MAP    korea, republic of|kr   2K3.TEXT.BIO.FLAG.TF    $country_flag(%country%)   2K3.TEXT.BIO.LANG        2K3.THUMBS.ASPECT       2K3.THUMBS.AUTO.DOWNLOAD ��   2K3.THUMBS.CIRCULAR      2K3.THUMBS.CUSTOM.FOLDER.TF    $directory_path(%path%)   2K3.THUMBS.CYCLE        2K3.THUMBS.DOUBLE.CLICK.MODE        2K3.THUMBS.DOWNLOAD.LIMIT 
      2K3.THUMBS.LAYOUT        2K3.THUMBS.MODE       2K3.THUMBS.PX K      2K3.THUMBS.RATIO       �?   2K3.THUMBS.SIZE.LIMIT       2K3.THUMBS.SOURCE       SMOOTH.FONT.SIZE 	      SMOOTH.SHOW.GROUP.HEADERS ��   SMOOTH.SHOW.HEADER.BAR ��   SMOOTH.SHOW.RATING ��   SMOOTH.SHOW.SCROLLBAR ��   SMOOTH.SHOW.STRIPES ��      �B    ��߂j�@���!Jݞ�  wv  h  // ==PREPROCESSOR==
// @name "Vibe"
// @author "seongbin"
// @import "%fb2k_component_path%helpers.txt"
// @import "%fb2k_component_path%samples\js\lodash.min.js"
// @import "%fb2k_profile_path%user-scripts\js\common.js"
// @import "%fb2k_profile_path%user-scripts\js\panel.js"
// @import "%fb2k_profile_path%user-scripts\vibe2.js"
// ==/PREPROCESSOR==
      2K3.ARTREADER.BORDER ��   2K3.ARTREADER.DOUBLE.CLICK.MODE        2K3.ARTREADER.ID        2K3.ARTREADER.ROUNDED ��#   2K3.PANEL.COLOURS.CUSTOM.BACKGROUND    �"   2K3.PANEL.COLOURS.CUSTOM.HIGHLIGHT �f �   2K3.PANEL.COLOURS.CUSTOM.TEXT ����   2K3.PANEL.COLOURS.MODE        2K3.PANEL.FONTS.SIZE 	      2K3.PANEL.SELECTION         ����B��%gq��y      ���.hx�L�w��H�3   Splitter (top/bottom)��߂j�@���!Jݞ   JScript Panel 3�nlj�6�O�7d{�]�&   Splitter (left/right)W��w/�@�MR}at*   ����C)w2�-���rb    ��Y���H���[�b-T   ��ڞM���68   ��]��oA�-��1���   ��@���C�;�2n5����B���j>:B�fe��u� f̀k���
~�F����@� x׀