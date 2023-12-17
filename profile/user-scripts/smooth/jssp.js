function on_char(code) {
	if (ppt.showHeaderBar && brw.inputbox.edit) {
		brw.inputbox.on_char(code);
	}
}

function on_drag_drop(action, x, y, mask) {
	if (x > brw.scrollbar.x || y < brw.y) {
		action.Effect = 0;
	} else {
		if (playlist_can_add_items(plman.ActivePlaylist)) {
			plman.ClearPlaylistSelection(plman.ActivePlaylist);
			action.Playlist = plman.ActivePlaylist;
			action.Base = plman.GetPlaylistItemCount(plman.ActivePlaylist);
			action.ToSelect = true;
			action.Effect = 1;
		} else if (plman.PlaylistCount == 0 || plman.ActivePlaylist == -1) {
			action.Playlist = plman.CreatePlaylist(plman.PlaylistCount, "Dropped Items");
			action.Base = 0;
			action.ToSelect = true;
			action.Effect = 1;
		} else {
			action.Effect = 0;
		}
	}
}

function on_drag_over(action, x, y, mask) {
	if (x > brw.scrollbar.x || y < brw.y) {
		action.Effect = 0;
	} else {
		if (plman.PlaylistCount == 0 || plman.ActivePlaylist == -1 || playlist_can_add_items(plman.ActivePlaylist)) {
			action.Effect = 1;
		} else {
			action.Effect = 0;
		}
	}
}

function on_focus(is_focused) {
	if (is_focused) {
		plman.SetActivePlaylistContext();
		g_selHolder.SetPlaylistSelectionTracking();
	} else {
		brw.repaint();
	}
}

function on_item_focus_change(playlist, from, to) {
	g_focus_id = to;

	if (playlist == g_active_playlist) {
		g_focus_row = brw.getOffsetFocusItem(g_focus_id);
		if (g_focus_row < scroll / ppt.rowHeight || g_focus_row > scroll / ppt.rowHeight + brw.totalRowsVis - 0.1) {
			var old = scroll;
			scroll = (g_focus_row - Math.floor(brw.totalRowsVis / 2)) * ppt.rowHeight;
			scroll = check_scroll(scroll);
			if (Math.abs(scroll - scroll_) > ppt.rowHeight * 5) {
				if (scroll_ > scroll) {
					scroll_ = scroll + ppt.rowHeight * 5;
				} else {
					scroll_ = scroll - ppt.rowHeight * 5;
				}
			}
			brw.scrollbar.updateScrollbar();
		}

		if (!isScrolling)
			brw.repaint();
	}
}

function on_key_down(vkey) {
	if (ppt.showHeaderBar && brw.inputbox.edit) {
		brw.inputbox.on_key_down(vkey);
	} else {
		var mask = GetKeyboardMask();

		if (mask == KMask.none) {
			switch (vkey) {
			case VK_LEFT : fb.RunMainMenuCommand('Playback/Seek/Back by 5 seconds'); break;
			case VK_RIGHT : fb.RunMainMenuCommand('Playback/Seek/Ahead by 5 seconds'); break;
			case VK_SPACEBAR : fb.PlayOrPause(); break;
			case VK_UP:
				if (brw.rows.length > 0 && !brw.keypressed && !cScrollBar.timerID) {
					brw.keypressed = true;

					brw.vk_up();
					if (!cScrollBar.timerID) {
						cScrollBar.timerID = window.SetTimeout(function () {
							cScrollBar.timerID = window.SetInterval(brw.vk_up, 100);
						}, 400);
					}
				}
				break;
			case VK_DOWN:
				if (brw.rows.length > 0 && !brw.keypressed && !cScrollBar.timerID) {
					brw.keypressed = true;

					brw.vk_down();
					if (!cScrollBar.timerID) {
						cScrollBar.timerID = window.SetTimeout(function () {
							cScrollBar.timerID = window.SetInterval(brw.vk_down, 100);
						}, 400);
					}
				}
				break;
			case VK_PGUP:
				if (brw.rows.length > 0 && !brw.keypressed && !cScrollBar.timerID) {
					brw.keypressed = true;

					brw.vk_pgup();
					if (!cScrollBar.timerID) {
						cScrollBar.timerID = window.SetTimeout(function () {
							cScrollBar.timerID = window.SetInterval(brw.vk_pgup, 100);
						}, 400);
					}
				}
				break;
			case VK_PGDN:
				if (brw.rows.length > 0 && !brw.keypressed && !cScrollBar.timerID) {
					brw.keypressed = true;

					brw.vk_pgdn();
					if (!cScrollBar.timerID) {
						cScrollBar.timerID = window.SetTimeout(function () {
							cScrollBar.timerID = window.SetInterval(brw.vk_pgdn, 100);
						}, 400);
					}
				}
				break;
			case VK_RETURN:
				play(g_active_playlist, g_focus_id);
				break;
			case VK_END:
				if (brw.rows.length > 0) {
					var new_focus_id = brw.rows[brw.rows.length - 1].playlistTrackId;
					plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
					plman.ClearPlaylistSelection(g_active_playlist);
					plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
				}
				break;
			case VK_HOME:
				if (brw.rows.length > 0) {
					var new_focus_id = brw.rows[0].playlistTrackId;
					plman.ClearPlaylistSelection(g_active_playlist);
					plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
					plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
				}
				break;
			case VK_DELETE:
				if (playlist_can_remove_items(g_active_playlist)) {
					plman.UndoBackup(g_active_playlist);
					plman.RemovePlaylistSelection(g_active_playlist);
				}
				break;
			}
		} else if (mask == KMask.shift) {
			switch (vkey) {
			case VK_SHIFT:
				brw.SHIFT_count = 0;
				break;
			case VK_UP:
				if (brw.SHIFT_count == 0) {
					if (brw.SHIFT_start_id == null) {
						brw.SHIFT_start_id = g_focus_id;
					}
					plman.ClearPlaylistSelection(g_active_playlist);
					plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, true);
					if (g_focus_id > 0) {
						brw.SHIFT_count--;
						g_focus_id--;
						plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, true);
						plman.SetPlaylistFocusItem(g_active_playlist, g_focus_id);
					}
				} else if (brw.SHIFT_count < 0) {
					if (g_focus_id > 0) {
						brw.SHIFT_count--;
						g_focus_id--;
						plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, true);
						plman.SetPlaylistFocusItem(g_active_playlist, g_focus_id);
					}
				} else {
					plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, false);
					brw.SHIFT_count--;
					g_focus_id--;
					plman.SetPlaylistFocusItem(g_active_playlist, g_focus_id);
				}
				break;
			case VK_DOWN:
				if (brw.SHIFT_count == 0) {
					if (brw.SHIFT_start_id == null) {
						brw.SHIFT_start_id = g_focus_id;
					}
					plman.ClearPlaylistSelection(g_active_playlist);
					plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, true);
					if (g_focus_id < brw.list.Count - 1) {
						brw.SHIFT_count++;
						g_focus_id++;
						plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, true);
						plman.SetPlaylistFocusItem(g_active_playlist, g_focus_id);
					}
				} else if (brw.SHIFT_count > 0) {
					if (g_focus_id < brw.list.Count - 1) {
						brw.SHIFT_count++;
						g_focus_id++;
						plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, true);
						plman.SetPlaylistFocusItem(g_active_playlist, g_focus_id);
					}
				} else {
					plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, false);
					brw.SHIFT_count++;
					g_focus_id++;
					plman.SetPlaylistFocusItem(g_active_playlist, g_focus_id);
				}
				break;
			}
		} else if (mask == KMask.ctrl) {
			switch (vkey) {
			case 65: // CTRL+A
				fb.RunMainMenuCommand("Edit/Select all");
				brw.repaint();
				break;
			case 66: // CTRL+B
				ppt.showScrollBar = !ppt.showScrollBar;
				window.SetProperty("SMOOTH.SHOW.SCROLLBAR", ppt.showScrollBar);
				get_metrics();
				brw.repaint();
				break;
			case 67: // CTRL+C
				var items = plman.GetPlaylistSelectedItems(g_active_playlist);
				items.CopyToClipboard();
				items.Dispose();
				break;
			case 69: // CTRL+E
				ppt.showStripes = !ppt.showStripes;
				window.SetProperty("SMOOTH.SHOW.STRIPES", ppt.showStripes);
				get_metrics();
				brw.repaint();
				break;
			case 71: // CTRL+G
				ppt.showGroupHeaders = !ppt.showGroupHeaders;
				window.SetProperty("SMOOTH.SHOW.GROUP.HEADERS", ppt.showGroupHeaders);
				get_metrics();
				brw.repaint();
				break;
			case 82: // CTRL+R
				ppt.showRating = !ppt.showRating;
				window.SetProperty("SMOOTH.SHOW.RATING", ppt.showRating);
				get_metrics();
				brw.repaint();
				break;
			case 84: // CTRL+T
				ppt.showHeaderBar = !ppt.showHeaderBar;
				window.SetProperty("SMOOTH.SHOW.HEADER.BAR", ppt.showHeaderBar);
				get_metrics();
				brw.repaint();
				break;
			case 86: // CTRL+V
				if (playlist_can_add_items(g_active_playlist) && fb.CheckClipboardContents()) {
					var clipboard_contents = fb.GetClipboardContents();
					plman.UndoBackup(g_active_playlist);
					plman.InsertPlaylistItems(g_active_playlist, plman.GetPlaylistItemCount(g_active_playlist), clipboard_contents);
					clipboard_contents.Dispose();
				}
				break;
			case 88: // CTRL+X
				if (playlist_can_remove_items(g_active_playlist)) {
					var items = plman.GetPlaylistSelectedItems(g_active_playlist);
					if (items.CopyToClipboard()) {
						plman.UndoBackup(g_active_playlist);
						plman.RemovePlaylistSelection(g_active_playlist);
					}
					items.Dispose();
				}
				break;
			case 89: // CTRL+Y
				fb.RunMainMenuCommand("Edit/Redo");
				break;
			case 90: // CTRL+Z
				fb.RunMainMenuCommand("Edit/Undo");
				break;
			}
		}
	}
}

function on_key_up(vkey) {
	brw.keypressed = false;
	kill_scrollbar_timer()
	if (vkey == VK_SHIFT) {
		brw.SHIFT_start_id = null;
		brw.SHIFT_count = 0;
	}
	brw.repaint();
}

function on_metadb_changed(handles, fromhook) {
	if (!foo_playcount && fromhook) return;
	brw.populate();
}

function on_mouse_lbtn_dblclk(x, y, mask) {
	brw.on_mouse("lbtn_dblclk", x, y);
}

function on_mouse_lbtn_down(x, y) {
	brw.on_mouse("lbtn_down", x, y);
}

function on_mouse_lbtn_up(x, y) {
	brw.on_mouse("lbtn_up", x, y);
}

function on_mouse_move(x, y) {
	if (m_x == x && m_y == y)
		return;

	brw.on_mouse("move", x, y);

	m_x = x;
	m_y = y;
}

function on_mouse_rbtn_up(x, y) {
	brw.on_mouse("rbtn_up", x, y);
	return true;
}

function on_mouse_wheel(step) {
	if (utils.IsKeyPressed(VK_CONTROL)) {
		update_extra_font_size(step);
	} else {
		scroll -= step * ppt.rowHeight * ppt.rowScrollStep;
		scroll = check_scroll(scroll);
		brw.on_mouse("wheel", m_x, m_y, step);
	}
}

function on_paint(gr) {
	gr.Clear(g_colour_background);
	brw.paint(gr);
}

function on_playback_dynamic_info_track(type) {
	brw.repaint();
}

function on_playback_new_track() {
	brw.repaint();
}

function on_playback_pause(state) {
	if (brw.nowplaying_y + ppt.rowHeight > brw.y && brw.nowplaying_y < brw.y + brw.h) {
		brw.repaint();
	}
}

function on_playback_stop(reason) {
	brw.repaint();
}

function on_playback_time() {
	if (brw.nowplaying_y + ppt.rowHeight > brw.y && brw.nowplaying_y < brw.y + brw.h) {
		brw.repaint();
	}
}

function on_playlist_item_ensure_visible(playlist, index) {
	on_item_focus_change(playlist, 0, index);
}

function on_playlist_items_added(playlist_idx) {
	if (playlist_idx == g_active_playlist) {
		g_focus_id = getFocusId();
		brw.populate();
	}
}

function on_playlist_items_removed(playlist_idx, new_count) {
	if (playlist_idx == g_active_playlist) {
		if (new_count == 0) {
			scroll = scroll_ = 0;
		}
		g_focus_id = getFocusId();
		brw.populate();
	}
}

function on_playlist_items_reordered(playlist_idx) {
	if (playlist_idx == g_active_playlist) {
		g_focus_id = getFocusId();
		brw.populate();
	}
}

function on_playlist_items_selection_change() {
	brw.repaint();
}

function on_playlist_switch() {
	g_active_playlist = plman.ActivePlaylist;
	g_focus_id = getFocusId();
	brw.populate();
}

function on_playlists_changed() {
	g_active_playlist = plman.ActivePlaylist;
	brw.repaint();
}

function oBrowser() {
	this.repaint = function () {
		need_repaint = true;
	}

	this.size = function () {
		this.x = 0;
		this.y = ppt.showHeaderBar ? ppt.headerBarHeight : 0;
		this.w = ww - (ppt.showScrollBar ? this.scrollbar.w : 0) - this.x;
		this.h = wh - this.y;
		this.totalRows = Math.ceil(this.h / ppt.rowHeight);
		this.totalRowsVis = Math.floor(this.h / ppt.rowHeight);

		this.scrollbar.size();
		scroll = Math.round(scroll / ppt.rowHeight) * ppt.rowHeight;
		scroll = check_scroll(scroll);
		scroll_ = scroll;
		this.scrollbar.updateScrollbar();

		this.inputbox.size(Math.min(ww * 0.25, scale(250)), ppt.headerBarHeight - 2);
		this.reset_bt = new button(images.reset_normal, images.reset_hover, images.reset_hover);
		this.magnify_bt = new button(images.magnify, images.magnify, images.magnify);
	}

	this.setList = function () {
		this.rows = [];
		var r = 0;

		for (var i = 0; i < this.groups.length; i++) {
			var s = this.groups[i].start;

			if (ppt.showGroupHeaders) {
				this.groups[i].rowId = r;
				for (var k = 0; k < groupHeaderRowsNumber; k++) {
					this.rows[r] = new Object();
					this.rows[r].type = k + 1;
					this.rows[r].metadb = this.groups[i].metadb;
					this.rows[r].albumId = i;
					this.rows[r].albumTrackId = 0;
					this.rows[r].playlistTrackId = s;
					this.rows[r].groupkey = this.groups[i].groupkey;
					r++;
				}
			}

			var m = this.groups[i].count;
			for (var j = 0; j < m; j++) {
				this.rows[r] = new Object();
				this.rows[r].type = 0;
				this.rows[r].metadb = this.list.GetItem(s + j);
				this.rows[r].track_tf = this.track_tf_arr[s + j];
				this.rows[r].albumId = i;
				this.rows[r].albumTrackId = j;
				this.rows[r].playlistTrackId = s + j;
				this.rows[r].groupkey = this.groups[i].groupkey;
				r++;
			}
		}
	}

	this.showFocusedItem = function () {
		g_focus_row = this.getOffsetFocusItem(g_focus_id);
		scroll = (g_focus_row - Math.floor(this.totalRowsVis / 2)) * ppt.rowHeight;
		scroll = check_scroll(scroll);
		this.scrollbar.updateScrollbar();
	}

	this.selectAtoB = function (start_id, end_id) {
		if (start_id == -1 || end_id == -1) return;
		var affectedItems = Array();

		if (this.SHIFT_start_id == null) {
			this.SHIFT_start_id = start_id;
		}

		plman.ClearPlaylistSelection(g_active_playlist);

		var previous_focus_id = g_focus_id;

		if (start_id < end_id) {
			var deb = start_id;
			var fin = end_id;
		} else {
			var deb = end_id;
			var fin = start_id;
		}

		for (var i = deb; i <= fin; i++) {
			affectedItems.push(i);
		}
		plman.SetPlaylistSelection(g_active_playlist, affectedItems, true);
		plman.SetPlaylistFocusItem(g_active_playlist, end_id);

		if (affectedItems.length > 1) {
			if (end_id > previous_focus_id) {
				var delta = end_id - previous_focus_id;
				this.SHIFT_count += delta;
			} else {
				var delta = previous_focus_id - end_id;
				this.SHIFT_count -= delta;
			}
		}
	}

	this.getAlbumIdfromTrackId = function (value) {
		if (value >= 0) {
			var mediane = 0;
			var deb = 0;
			var fin = this.groups.length - 1;
			while (deb <= fin) {
				mediane = Math.floor((fin + deb) / 2);
				if (value >= this.groups[mediane].start && value < this.groups[mediane].start + this.groups[mediane].count) {
					return mediane;
				} else if (value < this.groups[mediane].start) {
					fin = mediane - 1;
				} else {
					deb = mediane + 1;
				}
			}
		}
		return -1;
	}

	this.getOffsetFocusItem = function (fid) {
		var row_idx = 0;
		if (fid > -1) {
			if (ppt.showGroupHeaders) {
				g_focus_album_id = this.getAlbumIdfromTrackId(fid);
				for (i = 0; i < this.rows.length; i++) {
					if (this.rows[i].type != 0 && this.rows[i].albumId == g_focus_album_id) {
						var albumTrackId = g_focus_id - this.groups[g_focus_album_id].start;
						row_idx = i + groupHeaderRowsNumber + albumTrackId;
						break;
					}
				}
			} else {
				g_focus_album_id = this.getAlbumIdfromTrackId(fid);
				for (i = 0; i < this.rows.length; i++) {
					if (this.rows[i].type == 0 && this.rows[i].albumId == g_focus_album_id) {
						var albumTrackId = g_focus_id - this.groups[g_focus_album_id].start;
						row_idx = i + albumTrackId;
						break;
					}
				}
			}
		}
		return row_idx;
	}

	this.get_track_tags = function (index) {
		var track_arr = this.rows[index].track_tf.split(" ^^ ");
		var tags = {
			artist : track_arr[0],
			title : track_arr[1],
			tracknumber : track_arr[2],
			length : track_arr[3],
			rating : track_arr[4],
		};
		return tags;
	}

	this.init_groups = function () {
		this.groups = [];
		if (this.list.Count == 0) return;

		var arr = tfo.groupkey.EvalWithMetadbs(this.list).toArray();
		var previous = "";
		var g = 0, t = 0;

		var filter_text = process_string(g_filter_text);

		for (var i = 0; i < this.list.Count; i++) {
			var handle = this.list.GetItem(i);
			var pos = arr[i].lastIndexOf(" ^^ ");
			var cachekey = arr[i].substr(pos + 4);
			var meta = arr[i].substr(0, pos);
			var current = meta.toLowerCase();

			if (filter_text.length > 0) {
				var filter_key = current.split(" ^^ ") + this.track_tf_arr[i].split(" ^^ ").slice(0, 2);
				var toAdd = match(filter_key, filter_text);
			} else {
				var toAdd = true;
			}

			if (toAdd) {
				if (current != previous) {
					if (g > 0) {
						this.groups[g - 1].finalise(t);
						t = 0;
					}
					this.groups.push(new oGroup(g, i, handle, meta, cachekey));
					t++;
					g++;
					previous = current;
				} else {
					t++;
				}
			}
		}

		if (g > 0) {
			this.groups[g - 1].finalise(t);
		}
	}

	this.populate = function () {
		this.list = plman.GetPlaylistItems(g_active_playlist);
		this.track_tf_arr = tfo.track.EvalWithMetadbs(this.list).toArray();

		this.init_groups();
		this.setList();
		g_focus_row = this.getOffsetFocusItem(g_focus_id);

		this.scrollbar.updateScrollbar();
		this.repaint();
	}

	this.getlimits = function () {
		if (this.rows.length <= this.totalRowsVis) {
			var start_ = 0;
			var end_ = this.rows.length - 1;
		} else {
			if (scroll_ < 0)
			scroll_ = scroll;
			var start_ = Math.round(scroll_ / ppt.rowHeight + 0.4);
			var end_ = start_ + this.totalRows + (groupHeaderRowsNumber - 1);
			start_ = start_ > 0 ? start_ - 1 : start_;
			if (start_ < 0)
			start_ = 0;
			if (end_ >= this.rows.length)
			end_ = this.rows.length - 1;
		}
		g_start_ = start_;
		g_end_ = end_;
	}

	this.paint = function (gr) {
		this.getlimits();

		if (this.rows.length > 0) {
			var ax = this.x + margin;
			var ay = this.y;
			var aw = this.w - ax * 2;
			var ah = ppt.rowHeight;

			if (fb.IsPlaying && plman.PlayingPlaylist == g_active_playlist) {
				this.nowplaying = plman.GetPlayingItemLocation();
			} else {
				this.nowplaying = null;
			}

			for (var i = g_start_; i <= g_end_; i++) {
				ay = Math.floor(this.y + (i * ah) - scroll_);

				switch (this.rows[i].type) {
					case groupHeaderRowsNumber:
					var isplaying_group = this.nowplaying && this.nowplaying.PlaylistItemIndex >= this.groups[this.rows[i].albumId].start && this.nowplaying.PlaylistItemIndex < this.groups[this.rows[i].albumId].start + this.groups[this.rows[i].albumId].count;

					ay -= (groupHeaderRowsNumber - 1) * ah;

					// group border
					gr.DrawRectangle(ax, ay, aw, ah * groupHeaderRowsNumber, 1, (ppt.showGroupHeaders && ppt.showStripes) ? setAlpha(g_colour_blend, 24) : 0); // group border

					// playing group background
					if (isplaying_group) {
						gr.FillRectangle(this.x, ay, margin, ah * groupHeaderRowsNumber, g_colour_highlight);
					}

					// group cover part
					var id = this.rows[i].albumId;
					var group_height = 0;

					if (groupHeaderRowsNumber >= 2) {
						group_height = ah * groupHeaderRowsNumber;
						if (!this.groups[id].cover_image && !this.groups[id].image_requested) {
							this.groups[id].image_requested = true;
							var filename = generate_filename(this.groups[id].cachekey, AlbumArtId.front);
							this.groups[id].cover_image = get_art(this.rows[i].metadb, filename, AlbumArtId.front);
						}
						drawImage(gr, this.groups[id].cover_image || (this.rows[i].metadb.Length ? images.noart : images.stream), ax + margin, ay + margin, group_height - margin * 2, group_height - margin * 2, 0, setAlpha(g_colour_blend, 96));
					}

					// group text part
					var top_right_width = Math.min(this.groups[id].top_right.calc_width(g_font_group), aw * 0.35);
					var bottom_right_width = Math.min(this.groups[id].bottom_right.calc_width(g_font_group), aw * 0.35);
					gr.WriteText(this.groups[id].top_right, g_font_group, g_colour_text, aw - top_right_width - margin, ay + group_height * 0.5 - g_font_group_height - margin * 0.5, top_right_width, g_font_group_height, 0, 0, 1, 1);
					gr.WriteText(this.groups[id].top_left, g_font_group, g_colour_text, ax + group_height + margin, ay + group_height * 0.5 - g_font_group_height - margin * 0.5, aw - group_height - top_right_width - margin * 4, g_font_group_height, 0, 0, 1, 1);
					gr.DrawLine(ax + group_height + margin, ay + group_height * 0.5 + 2, aw - margin, ay + group_height * 0.5, 1, setAlpha(g_colour_blend, 24));
					gr.WriteText(this.groups[id].bottom_right, g_font_group, g_colour_blend, aw - bottom_right_width - margin, ay + group_height * 0.5 + margin * 0.5, bottom_right_width, g_font_group_height, 0, 1, 1, 1);
					gr.WriteText(this.groups[id].bottom_left, g_font_group, g_colour_blend, ax + group_height + margin, ay + group_height * 0.5 + margin * 0.5, aw - group_height - bottom_right_width - margin * 4, g_font_group_height, 0, 1, 1, 1);
				break;
				case 0:
					var isplaying = this.nowplaying && this.rows[i].playlistTrackId == this.nowplaying.PlaylistItemIndex;

					if (!this.rows[i].tags) {
						this.rows[i].tags = this.get_track_tags(i);
					}
					var tags = this.rows[i].tags;

					// odd/even background
					if (ppt.showStripes) {
						if (ppt.showGroupHeaders ? this.rows[i].albumTrackId % 2 == 0 : i % 2 != 0) {
							gr.FillRectangle(ax, ay, aw, ah, setAlpha(g_colour_blend, 8));
						}
					}

					// selection background
					if (plman.IsPlaylistItemSelected(g_active_playlist, this.rows[i].playlistTrackId)) {
						drawSelectedRectangle(gr, ax, ay, aw, ah);
					}

					// playing background
					if (isplaying) {
						gr.FillRectangle(this.x, ay, margin, ah, g_colour_highlight);
					}

					// track number part
					tnw = ppt.showGroupHeaders ? ah : ah * 2; // track number part width
					gr.WriteText(ppt.showGroupHeaders ? tags.tracknumber : (i + 1), g_font, g_colour_blend, ax, ay, tnw, ah, 2, 2, 1, 1);

					// length part
					lw = "00:00:00".calc_width(g_font);
					gr.WriteText(tags.length, g_font, g_colour_blend, aw - lw - margin, ay, lw, ah, 1, 2, 1, 1);

					// rating part
					rw = ppt.showRating ? chars.rating_off.repeat(5).calc_width(g_font_rating) : 0; // rating part width
					if (ppt.showRating) {
						this.rating_x = aw - rw - lw;
						gr.WriteText(chars.rating_off.repeat(5), g_font_rating, setAlpha(g_colour_blend, 48), this.rating_x, ay - 2, rw, ah, 0, 2);
						gr.WriteText(chars.rating_on.repeat(tags.rating), g_font_rating, 0xffffa500, this.rating_x, ay - 2, rw, ah, 0, 2);
					}

					tw = tags.title.calc_width(g_font); // title part width
					// title part
					gr.WriteText(tags.title, g_font, g_colour_text, ax + tnw, ay, aw - tnw - rw - lw - margin * 2, ah, 0, 2, 1, 1);
					// track artist part
					gr.WriteText((tags.artist.length > 0) ? " \u00B7 " + tags.artist : "", g_font, g_colour_blend, ax + tnw + tw, ay, aw - tnw - rw - lw - tw - margin * 2, ah, 0, 2, 1, 1);
					break;
				}
			}
		} else {
			var text = plman.IsAutoPlaylist(plman.ActivePlaylist) ? "Autoplaylist <" + plman.GetPlaylistName(plman.ActivePlaylist) + "> is empty.\nClick to edit the query!" : "<" + plman.GetPlaylistName(plman.ActivePlaylist) + "> is empty.\nClick to add a folder or\ndrag files and folders.";
			gr.WriteText(plman.IsAutoPlaylist(plman.ActivePlaylist) ? "\uf45e" : "\ue1da", _font("Segoe Fluent Icons", g_fsize.value * 15), setAlpha(g_colour_highlight, 24), this.x, this.y, this.w, this.h, 2, 2, 1, 1);
			gr.WriteText(text, _font(g_font.Name, g_fsize.value + 6), g_colour_blend, this.x, this.y, this.w, this.h, 2, 2, 1, 1);
		}

		// scroll bar part
		this.scrollbar.paint(gr);

		// header bar part
		if (ppt.showHeaderBar) {
			gr.FillRectangle(0, 0, ww, this.y - 1, g_colour_background);
			gr.FillRectangle(this.x, ppt.headerBarHeight - 2, this.w + this.scrollbar.w, 1, setAlpha(g_colour_blend, 24));

			var btx = (ppt.headerBarHeight - images.magnify.Width) * 0.5;
			var bty = (ppt.headerBarHeight - images.magnify.Height) * 0.5;

			gr.DrawLine(this.inputbox.w + ppt.headerBarHeight + 1, ppt.headerBarHeight * 0.25, this.inputbox.w + ppt.headerBarHeight + 1, this.inputbox.h - ppt.headerBarHeight * 0.25, 1, setAlpha(g_colour_blend, 48));

			if (this.inputbox.text.length > 0) {
				this.reset_bt.paint(gr, btx, bty);
			} else {
				this.magnify_bt.paint(gr, btx, bty);
			}
			this.inputbox.paint(gr, ppt.headerBarHeight, 0);
		}
	}

	this.selectGroupTracks = function (aId) {
		var affectedItems = [];
		var end = this.groups[aId].start + this.groups[aId].count;
		for (var i = this.groups[aId].start; i < end; i++) {
			affectedItems.push(i);
		}
		plman.SetPlaylistSelection(g_active_playlist, affectedItems, true);
	}

	this.trace = function (x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
	}

	this.on_mouse = function (event, x, y) {
		if (g_active_playlist == -1) return;
		this.ishover = this.trace(x, y);

		if (this.ishover) {
			this.activeRow = Math.ceil((y + scroll_ - this.y) / ppt.rowHeight - 1);
			if (this.activeRow >= this.rows.length) {
				this.activeRow = -1;
			}
		} else {
			this.activeRow = -1;
		}

		var rating_hover = ppt.showRating && this.activeRow > -1 && x > this.rating_x && x < this.rating_x + rw;

		switch (event) {
		case "lbtn_down":
			if (y > this.y && !rating_hover && Math.abs(scroll - scroll_) < 2) {
				if (this.activeRow == -1) {
					plman.ClearPlaylistSelection(g_active_playlist);
				} else {
					var playlistTrackId = this.rows[this.activeRow].playlistTrackId;
					var rowType = this.rows[this.activeRow].type;

					switch (true) {
					case rowType > 0: // ----------------> group header row
						if (utils.IsKeyPressed(VK_SHIFT)) {
							if (g_focus_id != playlistTrackId) {
								if (this.SHIFT_start_id != null) {
									this.selectAtoB(this.SHIFT_start_id, playlistTrackId);
								} else {
									this.selectAtoB(g_focus_id, playlistTrackId);
								}
							}
						} else if (utils.IsKeyPressed(VK_CONTROL)) {
							this.selectGroupTracks(this.rows[this.activeRow].albumId);
							this.SHIFT_start_id = null;
						} else {
							plman.ClearPlaylistSelection(g_active_playlist);
							this.selectGroupTracks(this.rows[this.activeRow].albumId);
							this.SHIFT_start_id = null;
						}
						plman.SetPlaylistFocusItem(g_active_playlist, playlistTrackId);
						break;
					case rowType == 0: // ----------------> track row
						if (utils.IsKeyPressed(VK_SHIFT)) {
							if (g_focus_id != playlistTrackId) {
								if (this.SHIFT_start_id != null) {
									this.selectAtoB(this.SHIFT_start_id, playlistTrackId);
								} else {
									this.selectAtoB(g_focus_id, playlistTrackId);
								}
							}
						} else if (utils.IsKeyPressed(VK_CONTROL)) {
							if (plman.IsPlaylistItemSelected(g_active_playlist, playlistTrackId)) {
								plman.SetPlaylistSelectionSingle(g_active_playlist, playlistTrackId, false);
							} else {
								plman.SetPlaylistSelectionSingle(g_active_playlist, playlistTrackId, true);
								plman.SetPlaylistFocusItem(g_active_playlist, playlistTrackId);
							}
							this.SHIFT_start_id = null;
						} else {
							if (!plman.IsPlaylistItemSelected(g_active_playlist, playlistTrackId)) {
								plman.ClearPlaylistSelection(g_active_playlist);
								plman.SetPlaylistSelectionSingle(g_active_playlist, playlistTrackId, true);
								plman.SetPlaylistFocusItem(g_active_playlist, playlistTrackId);
							}
							this.SHIFT_start_id = null;
						}
						break;
					}
					this.repaint();
				}
			}

			if (ppt.showHeaderBar) {
				this.reset_bt.checkstate("lbtn_down", x, y);
			}
			break;
		case "lbtn_up":
			if (rating_hover && this.rows[this.activeRow].metadb) {
				var handles = fb.CreateHandleList(this.rows[this.activeRow].metadb);
				var new_rating = Math.ceil((x - this.rating_x) / (rw / 5));

				if (foo_playcount) {
					if (new_rating != this.rows[this.activeRow].tags.rating && new_rating > 0) {
						handles.RunContextCommand("Playback Statistics/Rating/" + new_rating);
					} else {
						handles.RunContextCommand("Playback Statistics/Rating/<not set>");
					}
				} else {
					var rp = this.rows[this.activeRow].metadb.RawPath;
					if (rp.indexOf("file://") == 0 || rp.indexOf("cdda://") == 0) {
						if (new_rating != this.rows[this.activeRow].tags.rating && new_rating > 0) {
							handles.UpdateFileInfoFromJSON(JSON.stringify({"RATING" : new_rating}));
						} else {
							handles.UpdateFileInfoFromJSON(JSON.stringify({"RATING" : ""}));
						}
					}
				}

				handles.Dispose();
			} else {
				if (this.activeRow > -1) {
					if (this.rows[this.activeRow].type == 0) { // ----------------> track row
						var playlistTrackId = this.rows[this.activeRow].playlistTrackId;
						if (!utils.IsKeyPressed(VK_SHIFT) && !utils.IsKeyPressed(VK_CONTROL)) {
							if (plman.IsPlaylistItemSelected(g_active_playlist, playlistTrackId)) {
								if (plman.GetPlaylistSelectedItems(g_active_playlist).Count > 1) {
									plman.ClearPlaylistSelection(g_active_playlist);
									plman.SetPlaylistSelectionSingle(g_active_playlist, playlistTrackId, true);
									plman.SetPlaylistFocusItem(g_active_playlist, playlistTrackId);
								}
							}
						}
					}
					this.repaint();
				}
			}

			if (plman.GetPlaylistItemCount(plman.ActivePlaylist) == 0 && y > ppt.headerBarHeight) {
				plman.IsAutoPlaylist(plman.ActivePlaylist) ? plman.ShowAutoPlaylistUI(plman.ActivePlaylist) : fb.AddDirectory();
			}

			if (ppt.showHeaderBar) {
				if (this.reset_bt.checkstate("lbtn_up", x, y) == ButtonStates.hover) {
					this.inputbox.text = "";
					this.inputbox.offset = 0;
					g_sendResponse();
					this.reset_bt.state == ButtonStates.normal;
					try { // in case playlist is empty
						if (fb.IsPlaying) {
							g_focus_id = this.nowplaying.PlaylistItemIndex;
							g_focus_row = this.getOffsetFocusItem(g_focus_id);
							plman.ClearPlaylistSelection(g_active_playlist);
							plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, true);
							plman.SetPlaylistFocusItem(g_active_playlist, g_focus_id);
							this.showFocusedItem();
						}
					} catch (e) {}
				}
			}
			break;
		case "lbtn_dblclk":
			if (y < this.y && fb.IsPlaying) {
				// fb.GetNowPlaying().ShowAlbumArtViewer();
			} else if (y > this.y && !rating_hover && this.ishover && this.activeRow > -1 && Math.abs(scroll - scroll_) < 2) {
				if (this.rows[this.activeRow].type == 0) {
					play(g_active_playlist, this.rows[this.activeRow].playlistTrackId);
				}
				this.repaint();
			}
			break;
		case "move":
			if (ppt.showHeaderBar) {
				this.reset_bt.checkstate("move", x, y);
			}
			break;
		case "rbtn_up":
			if (this.ishover && this.activeRow > -1 && Math.abs(scroll - scroll_) < 2) {
				var rowType = this.rows[this.activeRow].type;
				switch (true) {
				case rowType > 0: // ----------------> group header row
					var playlistTrackId = this.rows[this.activeRow].playlistTrackId;
					if (!plman.IsPlaylistItemSelected(g_active_playlist, playlistTrackId)) {
						plman.ClearPlaylistSelection(g_active_playlist);
						this.selectGroupTracks(this.rows[this.activeRow].albumId);
						plman.SetPlaylistFocusItem(g_active_playlist, playlistTrackId);
						this.SHIFT_start_id = null;
					}
					this.context_menu(x, y, this.track_index, this.row_index);
					break;
				case rowType == 0: // ----------------> track row
					var playlistTrackId = this.rows[this.activeRow].playlistTrackId;
					if (!plman.IsPlaylistItemSelected(g_active_playlist, playlistTrackId)) {
						plman.ClearPlaylistSelection(g_active_playlist);
						plman.SetPlaylistSelectionSingle(g_active_playlist, playlistTrackId, true);
						plman.SetPlaylistFocusItem(g_active_playlist, playlistTrackId);
					}
					this.context_menu(x, y, playlistTrackId, this.activeRow);
					break;
				}
				this.repaint();
			} else if (!this.inputbox.hover) {
				this.settings_context_menu(x, y);
			}
			break;
		}

		if (ppt.showHeaderBar) {
			this.inputbox.check(event, x, y);
		}

		if (cScrollBar.visible) {
			this.scrollbar.on_mouse(event, x, y);
		}
	}

	this.g_time = window.SetInterval(function () {
		if (!window.IsVisible) {
			need_repaint = true;
			return;
		}

		if (m_y > brw.y && m_y < brw.y + brw.h) {
			brw.activeRow = Math.ceil((m_y + scroll_ - brw.y) / ppt.rowHeight - 1);
			if (brw.activeRow >= brw.rows.length)
				brw.activeRow = -1;
		} else {
			brw.activeRow = -1;
		}

		scroll = check_scroll(scroll);
		if (Math.abs(scroll - scroll_) >= 1) {
			scroll_ += (scroll - scroll_) / ppt.scrollSmoothness;
			need_repaint = true;
			isScrolling = true;
			if (scroll_prev != scroll)
				brw.scrollbar.updateScrollbar();
		} else {
			if (isScrolling) {
				if (scroll_ < 1)
					scroll_ = 0;
				isScrolling = false;
				need_repaint = true;
			}
		}
		if (need_repaint) {
			need_repaint = false;
			window.Repaint();
		}

		scroll_prev = scroll;

	}, ppt.refreshRate);

	this.context_menu = function (x, y, id, row_id) {
		var menu = window.CreatePopupMenu();
		var add = window.CreatePopupMenu();
		var context = fb.CreateContextMenuManager();

		var remove_flag = EnableMenuIf(playlist_can_remove_items(g_active_playlist));

		menu.AppendMenuItem(remove_flag, 1, "Crop");
		menu.AppendMenuItem(remove_flag, 2, "Remove");
		menu.AppendMenuItem(MF_STRING, 3, "Invert Selection");
		menu.AppendMenuSeparator();
		menu.AppendMenuItem(remove_flag, 4, "Cut");
		menu.AppendMenuItem(MF_STRING, 5, "Copy");
		menu.AppendMenuItem(EnableMenuIf(playlist_can_add_items(g_active_playlist) && fb.CheckClipboardContents()), 6, "Paste");
		menu.AppendMenuSeparator();

		add.AppendMenuItem(MF_STRING, 10, "New Playlist");
		if (plman.PlaylistCount > 0) {
			add.AppendMenuSeparator();
		}
		for (var i = 0; i < plman.PlaylistCount; i++) {
			add.AppendMenuItem(EnableMenuIf(i != g_active_playlist && playlist_can_add_items(i)), 100 + i, plman.GetPlaylistName(i));
		}
		add.AppendTo(menu, MF_STRING, "Add to");
		menu.AppendMenuSeparator();

		var selected_items = plman.GetPlaylistSelectedItems(g_active_playlist);
		context.InitContextPlaylist();
		context.BuildMenu(menu, 1000);

		var idx = menu.TrackPopupMenu(x, y);
		menu.Dispose();

		switch (true) {
		case idx == 0:
			break;
		case idx == 1:
			plman.UndoBackup(g_active_playlist);
			plman.RemovePlaylistSelection(g_active_playlist, true);
			break;
		case idx == 2:
			plman.UndoBackup(g_active_playlist);
			plman.RemovePlaylistSelection(g_active_playlist);
			break;
		case idx == 3:
			plman.InvertSelection(g_active_playlist);
			break;
		case idx == 4:
			selected_items.CopyToClipboard();
			plman.UndoBackup(g_active_playlist);
			plman.RemovePlaylistSelection(g_active_playlist);
			break;
		case idx == 5:
			selected_items.CopyToClipboard();
			break;
		case idx == 6:
			var base = getFocusId();
			if (base == -1) {
				base = plman.GetPlaylistItemCount(g_active_playlist);
			} else {
				base++;
			}
			var clipboard_contents = fb.GetClipboardContents();
			plman.UndoBackup(g_active_playlist);
			plman.InsertPlaylistItems(g_active_playlist, base, clipboard_contents);
			clipboard_contents.Dispose();
			break;
		case idx == 10:
			var pl = plman.CreatePlaylist();
			plman.ActivePlaylist = pl;
			plman.InsertPlaylistItems(pl, 0, selected_items);
			break;
		case idx < 1000:
			var pl = idx - 100;
			plman.UndoBackup(pl);
			plman.InsertPlaylistItems(pl, plman.GetPlaylistItemCount(pl), selected_items);
			break;
		case idx >= 1000:
			context.ExecuteByID(idx - 1000);
			break;
		}
		selected_items.Dispose();
		context.Dispose();
		return true;
	}

	this.vk_up = function () {
		var scrollstep = 1;
		var new_focus_id = 0;
		var new_row = 0;

		new_row = g_focus_row - scrollstep;
		if (new_row < 0) {
			if (ppt.showGroupHeaders) {
				new_row = groupHeaderRowsNumber;
			} else {
				new_row = 0;
			}
			kill_scrollbar_timer();
		} else {
			if (this.rows[new_row].type != 0) {
				new_row -= groupHeaderRowsNumber;
			}
		}
		if (new_row >= 0) {
			new_focus_id = this.rows[new_row].playlistTrackId;
			plman.ClearPlaylistSelection(g_active_playlist);
			plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
			plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
		} else {
			kill_scrollbar_timer();
		}
	}

	this.vk_down = function () {
		var scrollstep = 1;
		var new_focus_id = 0;
		var new_row = 0;

		new_row = g_focus_row + scrollstep;
		if (new_row > this.rows.length - 1) {
			new_row = this.rows.length - 1;
			kill_scrollbar_timer();
		} else {
			if (this.rows[new_row].type != 0) {
				if (this.rows[new_row].type <= 1) {
					new_row += groupHeaderRowsNumber;
				}
			}
		}
		if (new_row < this.rows.length) {
			new_focus_id = this.rows[new_row].playlistTrackId;
			plman.ClearPlaylistSelection(g_active_playlist);
			plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
			plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
		} else {
			kill_scrollbar_timer();
		}
	}

	this.vk_pgup = function () {
		var scrollstep = this.totalRowsVis;
		var new_focus_id = 0;
		var new_row = 0;

		new_row = g_focus_row - scrollstep;
		if (new_row < 0) {
			new_row = groupHeaderRowsNumber;
			kill_scrollbar_timer();
		} else {
			if (this.rows[new_row].type != 0) {
				new_row += (groupHeaderRowsNumber - this.rows[new_row].type + 1);
			}
		}
		if (new_row >= 0) {
			new_focus_id = this.rows[new_row].playlistTrackId;
			plman.ClearPlaylistSelection(g_active_playlist);
			plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
			plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
		} else {
			kill_scrollbar_timer();
		}
	}

	this.vk_pgdn = function () {
		var scrollstep = this.totalRowsVis;
		var new_focus_id = 0,
		new_row = 0;

		new_row = g_focus_row + scrollstep;
		if (new_row > this.rows.length - 1) {
			new_row = this.rows.length - 1;
		} else {
			if (this.rows[new_row].type != 0) {
				new_row += (groupHeaderRowsNumber - this.rows[new_row].type + 1);
			}
		}
		if (new_row < this.rows.length) {
			new_focus_id = this.rows[new_row].playlistTrackId;
			plman.ClearPlaylistSelection(g_active_playlist);
			plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
			plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
		} else {
			kill_scrollbar_timer();
		}
	}

	this.settings_context_menu = function (x, y) {
		var menu = window.CreatePopupMenu();

		menu.AppendMenuItem(CheckMenuIf(ppt.showHeaderBar), 1, "Show Header\tCtrl+T");
		menu.AppendMenuSeparator();
		menu.AppendMenuItem(CheckMenuIf(ppt.showGroupHeaders), 10, "Show Groups\tCtrl+G");
		menu.AppendMenuItem(CheckMenuIf(ppt.showRating), 11, "Show Ratings\tCtrl+R");
		menu.AppendMenuItem(CheckMenuIf(ppt.showScrollBar), 12, "Show Scrollbar\tCtrl+B");
		menu.AppendMenuItem(CheckMenuIf(ppt.showStripes), 13, "Show Stripes\tCtrl+E");

		var idx = menu.TrackPopupMenu(x, y);
		menu.Dispose();

		switch (idx) {
		case 1:
			ppt.showHeaderBar = !ppt.showHeaderBar;
			window.SetProperty("SMOOTH.SHOW.TOP.BAR", ppt.showHeaderBar);
			get_metrics();
			this.repaint();
			break;
		case 10:
			ppt.showGroupHeaders = !ppt.showGroupHeaders;
			window.SetProperty("SMOOTH.SHOW.GROUP.HEADERS", ppt.showGroupHeaders);
			get_metrics();
			this.repaint();
			break;
		case 11:
			ppt.showRating = !ppt.showRating;
			window.SetProperty("SMOOTH.SHOW.RATING", ppt.showRating);
			get_metrics();
			this.repaint();
			break;
		case 12:
			ppt.showScrollBar = !ppt.showScrollBar;
			window.SetProperty("SMOOTH.SHOW.SCROLLBAR", ppt.showScrollBar);
			get_metrics();
			this.repaint();
			break;
		case 13:
			ppt.showStripes = !ppt.showStripes;
			window.SetProperty("SMOOTH.SHOW.STRIPES", ppt.showStripes);
			get_metrics();
			brw.repaint();
			break;
		}

		return true;
	}
	window.SetTimeout(function () {
		brw.populate();
		brw.showFocusedItem();
	}, 100);

	this.groups = [];
	this.rows = [];
	this.SHIFT_start_id = null;
	this.SHIFT_count = 0;
	this.scrollbar = new oScrollbar();
	this.list = fb.CreateHandleList();
	this.track_tf_arr = [];
	this.inputbox = new oInputbox(ww, ppt.headerBarHeight - 2, true, "", "Type here to search", g_sendResponse);
}

function oGroup(index, start, handle, groupkey, cachekey) {
	this.index = index;
	this.start = start;
	this.count = 1;
	this.metadb = handle;
	this.groupkey = groupkey;
	this.cachekey = cachekey;
	this.cover_image = null;
	this.image_requested = false;

	var arr = this.groupkey.split(" ^^ ");
	this.top_left = arr[0] + arr[4] || "";
	this.bottom_left = arr[1] || "";
	this.top_right = arr[2] || "";
	this.bottom_right = arr[3] || "";

	this.finalise = function (count) {
		this.count = count;
	}
}

function get_metrics() {
	ppt.rowHeight = scale(g_fsize.value + 11);

	if (ppt.showHeaderBar) {
		ppt.headerBarHeight = ppt.rowHeight * 2;
	} else {
		ppt.headerBarHeight = 0;
	}

	brw.size();
	brw.setList();
}

function kill_scrollbar_timer() {
	cScrollBar.timerCounter = -1;
	if (cScrollBar.timerID) {
		window.ClearTimeout(cScrollBar.timerID);
		cScrollBar.timerID = false;
	}
}

function check_scroll(scroll___) {
	if (scroll___ < 0)
		scroll___ = 0;
	var g1 = brw.h - (brw.totalRowsVis * ppt.rowHeight);
	var end_limit = (brw.rows.length * ppt.rowHeight) - (brw.totalRowsVis * ppt.rowHeight) - g1;
	if (scroll___ != 0 && scroll___ > end_limit) {
		scroll___ = end_limit;
	}
	return isNaN(scroll___) ? 0 : scroll___;
}

function getFocusId() {
	return plman.GetPlaylistFocusItemIndex(g_active_playlist);
}

function g_sendResponse() {
	if (brw.inputbox.text.length == 0) {
		g_filter_text = "";
	} else {
		g_filter_text = brw.inputbox.text;
	}
	brw.populate();
}

ppt.groupkey_tf = "$if2(%album%,$if(%length%,'('Singles')',%title%)) ^^ $if2(%album artist%,$if(%length%,%directory%,Stream)) ^^ [%year%] ^^ $if3([%publisher%],[%url%],[%genre%]) ^^ $ifgreater(%totaldiscs%,1,[ - Disc %discnumber%],)";
ppt.showHeaderBar = window.GetProperty("SMOOTH.SHOW.HEADER.BAR", false);
ppt.showGroupHeaders = window.GetProperty("SMOOTH.SHOW.GROUP.HEADERS", true);
ppt.showRating = window.GetProperty("SMOOTH.SHOW.RATING", true);
ppt.showScrollBar = window.GetProperty("SMOOTH.SHOW.SCROLLBAR", true);
ppt.showStripes = window.GetProperty("SMOOTH.SHOW.STRIPES", true);

var tfo = {
	track : fb.TitleFormat("[%track artist%] ^^ [%title%] ^^ [%tracknumber%] ^^ [%length%] ^^ $if2(%rating%,0)"),
	time : fb.TitleFormat("$if3(-%playback_time_remaining%,%playback_time%,)"),
	groupkey : fb.TitleFormat(ppt.groupkey_tf + " ^^ $crc32(%path%)"),
}

var groupHeaderRowsNumber = 3;
var foo_playcount = fb.CheckComponent("foo_playcount");

var g_active_playlist = plman.ActivePlaylist;
var g_focus_id = getFocusId();
var g_focus_row = 0;
var g_focus_album_id = -1;
var g_filter_text = "";

var g_selHolder = fb.AcquireSelectionHolder();
g_selHolder.SetPlaylistSelectionTracking();
plman.SetActivePlaylistContext();

var brw = new oBrowser();

get_metrics();