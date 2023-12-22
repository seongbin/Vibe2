function on_char(code) {
	if (brw.inputboxID >= 0) {
		brw.inputbox.on_char(code);
	}
}

function on_drag_drop(action, x, y, mask) {
	if (x > brw.scrollbar.x || y < brw.y) {
		action.Effect = 0;
	} else {
		if (g_drag_drop_target_id > -1) {
			if (playlist_can_add_items(g_drag_drop_target_id)) {
				plman.UndoBackup(g_drag_drop_target_id);
				action.Playlist = g_drag_drop_target_id;
				action.Base = plman.GetPlaylistItemCount(g_drag_drop_target_id);
				action.ToSelect = false;
				action.Effect = 1;
			} else {
				action.Effect = 0;
			}
		} else {
			action.Playlist = plman.CreatePlaylist(plman.PlaylistCount, "Dropped Items");
			action.Base = 0;
			action.ToSelect = true;
			action.Effect = 1;
		}
	}
	g_drag_drop_target_id = -1;
	brw.repaint();
}

function on_drag_leave() {
	g_drag_drop_target_id = -1;
	if (cScrollBar.timerID) {
		window.ClearInterval(cScrollBar.timerID);
		cScrollBar.timerID = false;
	}
	brw.repaint();
}

function on_drag_over(action, x, y, mask) {
	if (x > brw.scrollbar.x || y < brw.y) {
		action.Effect = 0;
	} else {
		g_drag_drop_target_id = -1;
		brw.on_mouse("drag_over", x, y);
		if (g_drag_drop_target_id > -1) {
			action.Effect = playlist_can_add_items(g_drag_drop_target_id) ? 1 : 0;
		} else {
			action.Effect = 1;
		}
	}
	brw.repaint();
}

function on_focus(is_focused) {
	if (brw.inputboxID >= 0) {
		brw.inputbox.on_focus(is_focused);
	}
	if (!is_focused) {
		brw.inputboxID = -1;
		brw.repaint();
	}
}

function on_key_down(vkey) {
	if (brw.inputboxID >= 0) {
		if (vkey == VK_ESCAPE) brw.inputboxID = -1;
		brw.inputbox.on_key_down(vkey);
	} else {
		var mask = GetKeyboardMask();

		if (mask == KMask.none) {
			if (brw.rows.length == 0) return;

			switch (vkey) {
			case VK_LEFT : fb.RunMainMenuCommand('Playback/Seek/Back by 5 seconds'); break;
			case VK_RIGHT : fb.RunMainMenuCommand('Playback/Seek/Ahead by 5 seconds'); break;
			case VK_SPACEBAR : fb.PlayOrPause(); break;
			case VK_F2:
				if (playlist_can_rename(brw.selectedRow)) {
					brw.edit_playlist(brw.rows[brw.selectedRow].idx);
				}
				break;
			case VK_F3:
				brw.showActivePlaylist();
				break;
			case VK_RETURN:
				if (brw.selectedRow > -1 && brw.selectedRow < plman.PlaylistCount) {
					plman.ActivePlaylist = brw.selectedRow;
					brw.repaint();
				}
				break;
			case VK_DELETE:
				if (brw.selectedRow >= 0 && brw.selectedRow < plman.PlaylistCount) {
					plman.RemovePlaylistSwitch(brw.selectedRow);
				}
				break;
			case VK_UP:
				if (brw.selectedRow > 0) {
					brw.selectedRow--;
					brw.showSelectedPlaylist();
					brw.repaint();
				}
				break;
			case VK_DOWN:
				if (brw.selectedRow < brw.rows.length - 1) {
					brw.selectedRow++;
					brw.showSelectedPlaylist();
					brw.repaint();
				}
				break;
			case VK_HOME:
				brw.selectedRow = 0;
				brw.showSelectedPlaylist();
				brw.repaint();
				break;
			case VK_END:
				brw.selectedRow = brw.rows.length - 1;
				brw.showSelectedPlaylist();
				brw.repaint();
				break;
			}
		} else if (mask == KMask.ctrl) {
			switch (vkey) {
			case 66: // CTRL+B
				ppt.showScrollBar = !ppt.showScrollBar;
				window.SetProperty("SMOOTH.SHOW.SCROLLBAR", ppt.showScrollBar);
				get_metrics();
				brw.repaint();
				break;
			case 73: // CTRL+I
				ppt.showItemCount = !ppt.showItemCount;
				window.SetProperty("SMOOTH.SHOW.ITEMCOUNT", ppt.showItemCount);
				get_metrics();
				brw.repaint();
				break;
			}
		} else if (mask == KMask.shift) {
			switch (vkey) {
			case 48: // SHIFT+0
				if (ppt.fontSize.value > 9) {
					ppt.fontSize.value = 9;
					window.SetProperty("SMOOTH.FONT.SIZE", ppt.fontSize.value);
					g_margin = scale(ppt.fontSize.value - 4);
					get_font();
					get_metrics();
					get_images();
					brw.size();
					brw.scrollbar.setCursorButton(); // cannot contained in brw.scrollbar.size
					brw.repaint();
				}
				break;
			}
		}
	}
}

function on_key_up(vkey) {
	cScrollBar.timerCounter = -1;
	if (cScrollBar.timerID) {
		window.ClearTimeout(cScrollBar.timerID);
		cScrollBar.timerID = false;
	}
	brw.repaint();
}

function on_mouse_lbtn_down(x, y) {
	brw.on_mouse("lbtn_down", x, y);
}

function on_mouse_lbtn_up(x, y) {
	brw.on_mouse("lbtn_up", x, y);
}

function on_mouse_lbtn_dblclk(x, y, mask) {
	if (y < brw.y) {
		brw.showActivePlaylist();
	} else {
		brw.on_mouse("lbtn_dblclk", x, y);
		if (fb.IsPlaying && plman.ActivePlaylist == plman.PlayingPlaylist) {
			window.IsDefaultUI ? fb.RunMainMenuCommand('View/Show now playing') : fb.RunMainMenuCommand('View/Playlist view/Activate now playing');
		}
	}
}

function on_mouse_rbtn_up(x, y) {
	brw.on_mouse("rbtn_up", x, y);
	return true;
}

function on_mouse_move(x, y) {
	if (m_x == x && m_y == y)
		return;

	brw.on_mouse("move", x, y);

	m_x = x;
	m_y = y;
}

function on_mouse_wheel(step) {
	if (utils.IsKeyPressed(VK_SHIFT)) {
		brw.inputboxID = -1;
		update_extra_font_size(step);
	} else {
		scroll -= step * ppt.rowHeight * ppt.rowScrollStep;
		scroll = check_scroll(scroll);
		brw.on_mouse("wheel", m_x, m_y, step);
	}
}

function on_notify_data(name, info) {
	if (name == 'ACTIVE') {
		active.value = info;
		window.Repaint();
	}
}

function on_paint(gr) {
	gr.Clear(g_colour_splitter);
	brw.paint(gr);
}

function on_playback_dynamic_info_track(type) {
}

function on_playback_new_track() {
	brw.repaint();
}

function on_playback_stop(reason) {
	brw.repaint();
}

function on_playlist_items_added() {
	brw.populate();
	brw.repaint();
}

function on_playlist_items_removed() {
	brw.populate();
	brw.repaint();
}

function on_playlist_switch() {
	brw.showActivePlaylist();
	if (brw.selectedRow >= brw.rows.length)
		brw.selectedRow = plman.ActivePlaylist;
	brw.repaint();
}

function on_playlists_changed() {
	brw.populate();
}

function oBrowser() {
	this.repaint = function () {
		need_repaint = true;
	}

	this.size = function () {
		this.x = 0;
		this.y = 0;
		this.w = ww - (ppt.showScrollBar ? this.scrollbar.w : 0) - this.x;
		this.h = wh - this.y;
		this.totalRows = Math.ceil(this.h / ppt.rowHeight);
		this.totalRowsVis = Math.floor(this.h / ppt.rowHeight);

		if (this.inputboxID > -1) {
			var rh = ppt.rowHeight;
			var tw = this.w - this.x - g_margin * 2;
			if (this.inputbox) {
				this.inputbox.size(tw, rh);
			}
		}

		this.scrollbar.size();

		scroll = Math.round(scroll / ppt.rowHeight) * ppt.rowHeight;
		scroll = check_scroll(scroll);
		scroll_ = scroll;

		this.scrollbar.updateScrollbar();
	}

	this.getlimits = function () {
		if (this.rows.length <= this.totalRowsVis) {
			var start_ = 0;
			var end_ = this.rows.length - 1;
		} else {
			if (scroll_ < 0)
				scroll_ = scroll;
			var start_ = Math.round(scroll_ / ppt.rowHeight + 0.4);
			var end_ = start_ + this.totalRows;
			start_ = start_ > 0 ? start_ - 1 : start_;
			if (start_ < 0)
				start_ = 0;
			if (end_ >= this.rows.length)
				end_ = this.rows.length - 1;
		}
		g_start_ = start_;
		g_end_ = end_;
	}

	this.populate = function () {
		var total = plman.PlaylistCount;
		this.rows = [];

		for (var i = 0; i < total; i++) {
			this.rows.push(new oPlaylist(i, plman.GetPlaylistName(i), plman.GetPlaylistItemCount(i).toString()));
		}

		if (this.selectedRow >= this.rows.length)
			this.selectedRow = plman.ActivePlaylist;

		this.scrollbar.updateScrollbar();
		this.repaint();
	}

	this.getRowIdFromIdx = function (idx) {
		var total = this.rows.length;
		var rowId = -1;
		if (plman.PlaylistCount > 0) {
			for (var i = 0; i < total; i++) {
				if (this.rows[i].idx == idx) {
					rowId = i;
					break;
				}
			}
		}
		return rowId;
	}

	this.isVisiblePlaylist = function (idx) {
		var rowId = this.getRowIdFromIdx(idx);
		var offset_active_pl = ppt.rowHeight * rowId;
		if (offset_active_pl < scroll || offset_active_pl + ppt.rowHeight > scroll + this.h) {
			return false;
		} else {
			return true;
		}
	}

	this.showSelectedPlaylist = function () {
		var rowId = this.getRowIdFromIdx(this.selectedRow);

		if (!this.isVisiblePlaylist(this.selectedRow)) {
			scroll = (rowId - Math.floor(this.totalRowsVis / 2)) * ppt.rowHeight;
			scroll = check_scroll(scroll);
			this.scrollbar.updateScrollbar();
		}
	}

	this.showActivePlaylist = function () {
		var rowId = this.getRowIdFromIdx(plman.ActivePlaylist);

		if (!this.isVisiblePlaylist(plman.ActivePlaylist)) {
			scroll = (rowId - Math.floor(this.totalRowsVis / 2)) * ppt.rowHeight;
			scroll = check_scroll(scroll);
			this.scrollbar.updateScrollbar();
		}
	}

	this.paint = function (gr) {
		if (this.rows.length != plman.PlaylistCount) this.populate();
		this.getlimits();

		if (this.rows.length > 0) {
			var ax = this.x;
			var ay = this.y;
			var aw = this.w - ax;
			var ah = ppt.rowHeight;

			for (var i = g_start_; i <= g_end_; i++) {
				ay = Math.floor(this.y + (i * ah) - scroll_);

				// selection background
				var isselected = i == this.selectedRow;
				if (isselected) {
					gr.FillRectangle(ax, ay, aw, ah, setAlpha(g_colour_selection, 48));
				}

				if (cPlaylistManager.drag_target_id == i) {
					if (cPlaylistManager.drag_target_id > cPlaylistManager.drag_source_id) {
						gr.DrawRectangle(ax, ay + ppt.rowHeight - 1, aw - 1, 1, 2.0, g_colour_selection);
					} else if (cPlaylistManager.drag_target_id < cPlaylistManager.drag_source_id) {
						gr.DrawRectangle(ax, ay + 1, aw - 1, 1, 2.0, g_colour_selection);
					}
				}

				// drag and drop background
				var isdropdrag = i == g_drag_drop_target_id && playlist_can_add_items(i);
				if (isdropdrag) {
					gr.DrawRectangle(ax + 1, ay + 1, aw - 2, ah - 2, 2.0, g_colour_selection);
				}

				// active background
				var isactive = this.rows[i].idx == plman.ActivePlaylist;
				if (isactive) {
					gr.FillRectangle(ax, ay, aw, ah, setAlpha(g_colour_selection, 96));
				}

				// playing background
				var isplaying = fb.IsPlaying && this.rows[i].idx == plman.PlayingPlaylist;
				if (isplaying) {
					gr.FillRectangle(ax, ay, g_margin, ah, g_colour_highlight);
				}

				var colour = isactive || isselected ? DetermineTextColour(g_colour_selection) : g_colour_blend;

				if (this.inputboxID == i) {
					this.inputbox.paint(gr, ax + g_margin * 2, ay);
				} else {
					var icw = []; // item count width
					icw[i] = ppt.showItemCount ? this.rows[i].count.calc_width(g_font) : 0;
					gr.WriteText(this.rows[i].name, g_font, colour, ax + g_margin * 2, ay, aw - icw[i] - g_margin * 4, ah, 0, 2, 1, 1);
					gr.WriteText(this.rows[i].count, g_font, colour, aw - icw[i] - g_margin, ay, icw[i], ah, 1, 2, 1, 1);
				}
			}
		}

		this.scrollbar.paint(gr);
	}

	this.trace = function (x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
	}

	this.on_mouse = function (event, x, y) {
		this.ishover = this.trace(x, y);

		if (y > this.y && y < this.y + this.h) {
			this.activeRow = Math.ceil((y + scroll_ - this.y) / ppt.rowHeight - 1);
			if (this.activeRow >= this.rows.length)
				this.activeRow = -1;
		} else {
			this.activeRow = -1;
		}

		switch (event) {
		case "lbtn_down":
			this.down = true;
			if (this.ishover && this.activeRow > -1 && Math.abs(scroll - scroll_) < 2) {
				this.selectedRow = this.activeRow;
				if (this.activeRow == this.inputboxID) {
					this.inputbox.check("lbtn_down", x, y);
				} else {
					if (this.inputboxID > -1)
						this.inputboxID = -1;
					if (!this.up) {
						cPlaylistManager.drag_clicked = true;
						cPlaylistManager.drag_source_id = this.selectedRow;
					}
				}
				this.repaint();
			} else {
				if (this.inputboxID > -1)
					this.inputboxID = -1;
			}
			this.up = false;
			break;
		case "lbtn_up":
			this.up = true;
			if (this.down) {
				if (this.inputboxID >= 0) {
					this.inputbox.check("lbtn_up", x, y);
				} else if (cPlaylistManager.drag_target_id > -1 && cPlaylistManager.drag_target_id != cPlaylistManager.drag_source_id) {
					plman.MovePlaylist(this.rows[cPlaylistManager.drag_source_id].idx, this.rows[cPlaylistManager.drag_target_id].idx);
					this.selectedRow = cPlaylistManager.drag_target_id;
				}

				if (timers.movePlaylist) {
					window.ClearInterval(timers.movePlaylist);
					timers.movePlaylist = false;
				}
			}

			this.down = false;

			if (cPlaylistManager.drag_moved)
				window.SetCursor(IDC_ARROW);

			cPlaylistManager.drag_clicked = false;
			cPlaylistManager.drag_moved = false;
			cPlaylistManager.drag_source_id = -1;
			cPlaylistManager.drag_target_id = -1;
			break;
		case "lbtn_dblclk":
			if (this.ishover && this.activeRow > -1 && Math.abs(scroll - scroll_) < 2) {
				if (plman.ActivePlaylist != this.rows[this.activeRow].idx) {
					if (this.inputboxID > -1)
						this.inputboxID = -1;
					this.repaint();
					plman.ActivePlaylist = this.rows[this.activeRow].idx;
				}
			} else {
				var p = plman.CreatePlaylist();
				plman.ActivePlaylist = p;
			}
			break;
		case "leave":
			break;
		case "move":
			this.up = false;
			if (this.inputboxID >= 0) {
				this.inputbox.check("move", x, y);
			} else {
				if (cPlaylistManager.drag_clicked) {
					cPlaylistManager.drag_moved = true;
				}
				if (cPlaylistManager.drag_moved) {
					window.SetCursor(IDC_HELP);
					if (this.activeRow > -1) {
						if (timers.movePlaylist) {
							window.ClearInterval(timers.movePlaylist);
							timers.movePlaylist = false;
						}
						if (this.activeRow != cPlaylistManager.drag_source_id) {
							cPlaylistManager.drag_target_id = this.activeRow;
						} else {
							cPlaylistManager.drag_target_id = -1;
						}
					} else {
						if (y < this.y) {
							if (!timers.movePlaylist) {
								timers.movePlaylist = window.SetInterval(function () {
									scroll -= ppt.rowHeight;
									scroll = check_scroll(scroll);
									cPlaylistManager.drag_target_id = cPlaylistManager.drag_target_id > 0 ? cPlaylistManager.drag_target_id - 1 : 0;
								}, 100);
							}
						} else if (y > this.y + this.h) {
							if (!timers.movePlaylist) {
								timers.movePlaylist = window.SetInterval((function () {
									scroll += ppt.rowHeight;
									scroll = check_scroll(scroll);
									cPlaylistManager.drag_target_id = cPlaylistManager.drag_target_id < this.rows.length - 1 ? cPlaylistManager.drag_target_id + 1 : this.rows.length - 1;
								}).bind(this), 100);
							}
						}
					}
					this.repaint();
				}
			}
			break;
		case "rbtn_up":
			if (this.inputboxID >= 0) {
				if (!this.inputbox.hover) {
					this.inputboxID = -1;
					this.on_mouse("rbtn_up", x, y);
				} else {
					this.inputbox.check("rbtn_up", x, y);
				}
			} else {
				if (this.ishover) {
					if (this.activeRow > -1 && Math.abs(scroll - scroll_) < 2) {
						this.repaint();
						this.selectedRow = this.activeRow;
						this.context_menu(x, y, this.selectedRow);
					} else {
						this.context_menu(x, y, this.activeRow);
					}
				} else {
					this.settings_context_menu(x, y);
				}
			}
			break;
		case "drag_over":
			if (this.rows.length > 0 && this.activeRow > -1) {
				g_drag_drop_target_id = this.activeRow;
			}
			break;
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

	this.edit_playlist = function (p) {
		var rh = ppt.rowHeight;
		var tw = this.w - this.x - g_margin * 2;
		this.inputbox = new oInputbox(tw, rh, false, plman.GetPlaylistName(p), "", "renamePlaylist()", this);
		this.inputbox.size(tw, rh);
		this.inputboxID = p;
		this.inputbox.on_focus(true);
		this.inputbox.edit = true;
		this.inputbox.Cpos = this.inputbox.text.length;
		this.inputbox.anchor = this.inputbox.Cpos;
		this.inputbox.SelBegin = this.inputbox.Cpos;
		this.inputbox.SelEnd = this.inputbox.Cpos;
		if (!cInputbox.timer_cursor) {
			this.inputbox.resetCursorTimer();
		}
		this.inputbox.dblclk = true;
		this.inputbox.SelBegin = 0;
		this.inputbox.SelEnd = this.inputbox.text.length;
		this.inputbox.text_selected = this.inputbox.text;
		this.inputbox.select = true;
		this.repaint();
	}

	this.context_menu = function (x, y, id) {
		var menu = window.CreatePopupMenu();
		var autoplaylist = window.CreatePopupMenu();
		var restore = window.CreatePopupMenu();
		var items = window.CreatePopupMenu();
		var context = fb.CreateContextMenuManager();

		var count = plman.PlaylistCount;
		var recycler_count = plman.RecyclerCount;
		var history = [];

		for (var i = 0; i < autoplaylists.length; i++) {
			autoplaylist.AppendMenuItem(MF_STRING, 200 + i, autoplaylists[i][0]);
		}

		menu.AppendMenuItem(MF_STRING, 100, "New Playlist");
		menu.AppendMenuItem(MF_STRING, 101, "New Autoplaylist");
		autoplaylist.AppendTo(menu, MF_STRING, "Preset AutoPlaylists");
		menu.AppendMenuSeparator();
		menu.AppendMenuItem(MF_STRING, 102, "Load Playlist...");

		if (recycler_count > 0) {
			menu.AppendMenuSeparator();
			for (var i = 0; i < recycler_count; i++) {
				history.push(i);
				restore.AppendMenuItem(MF_STRING, 10 + i, plman.GetRecyclerName(i));
			}
			restore.AppendMenuSeparator();
			restore.AppendMenuItem(MF_STRING, 99, "Clear history");
			restore.AppendTo(menu, MF_STRING, "Restore");
		}
		menu.AppendMenuSeparator();
		menu.AppendMenuItem(EnableMenuIf(count > 1), 1, "Sort playlists A-Z");
		menu.AppendMenuItem(EnableMenuIf(count > 1), 2, "Sort playlists Z-A");

		if (id > -1) {
			menu.AppendMenuSeparator();
			var lock_name = plman.GetPlaylistLockName(id);

			menu.AppendMenuItem(MF_STRING, 3, "Duplicate this playlist");
			menu.AppendMenuItem(EnableMenuIf(playlist_can_rename(id)), 4, "Rename this playlist\tF2");
			menu.AppendMenuItem(EnableMenuIf(playlist_can_remove(id)), 5, "Remove this playlist\tDel");
			menu.AppendMenuSeparator();
			if (plman.IsAutoPlaylist(id)) {
				menu.AppendMenuItem(MF_STRING, 6, lock_name + " properties");
				menu.AppendMenuItem(MF_STRING, 7, "Convert to a normal playlist");
			} else {
				var is_locked = plman.IsPlaylistLocked(id);
				var is_mine = lock_name == "JScript Panel 3";

				menu.AppendMenuItem(EnableMenuIf(is_mine || !is_locked), 8, "Edit playlist lock...");
				menu.AppendMenuItem(EnableMenuIf(is_mine), 9, "Remove playlist lock");
			}
			var playlist_items = plman.GetPlaylistItems(id);
			if (playlist_items.Count > 0) {
				menu.AppendMenuSeparator();
				context.InitContext(playlist_items);
				context.BuildMenu(items, 1000);
				items.AppendTo(menu, MF_STRING, 'Items');
			}
		}

		menu.AppendMenuSeparator();
		menu.AppendMenuItem(CheckMenuIf(ppt.showItemCount), 103, "Show Items\tCtrl+I");
		menu.AppendMenuItem(CheckMenuIf(ppt.showScrollBar), 104, "Show Scrollbar\tCtrl+B");

		var idx = menu.TrackPopupMenu(x, y);
		menu.Dispose();

		switch (true) {
		case idx == 0:
			break;
		case idx == 1:
			plman.SortPlaylistsByName(1);
			break;
		case idx == 2:
			plman.SortPlaylistsByName(-1);
			break;
		case idx == 3:
			plman.ActivePlaylist = plman.DuplicatePlaylist(id, "Copy of " + plman.GetPlaylistName(id));
			break;
		case idx == 4:
			this.edit_playlist(id);
			break;
		case idx == 5:
			plman.RemovePlaylistSwitch(id);
			break;
		case idx == 6:
			plman.ShowAutoPlaylistUI(id);
			break;
		case idx == 7:
			plman.ActivePlaylist = plman.DuplicatePlaylist(id, plman.GetPlaylistName(id));
			plman.RemovePlaylist(id);
			break;
		case idx == 8:
			plman.ShowPlaylistLockUI(id);
			break;
		case idx == 9:
			plman.RemovePlaylistLock(id);
			break;
		case idx >= 10 && idx <= 98:
			plman.RecyclerRestore(idx - 10);
			plman.ActivePlaylist = plman.PlaylistCount - 1;
			break;
		case idx == 99:
			plman.RecyclerPurge(history);
			break;
		case idx == 100:
			var p = plman.CreatePlaylist();
			plman.ActivePlaylist = p;
			this.edit_playlist(p);
			break;
		case idx == 101:
			var p = plman.CreateAutoPlaylist(plman.PlaylistCount, "", "enter your query here");
			plman.ActivePlaylist = p;
			plman.ShowAutoPlaylistUI(p);
			this.edit_playlist(p);
			break;
		case idx == 102:
			fb.LoadPlaylist();
			break;
		case idx == 103:
			ppt.showItemCount = !ppt.showItemCount;
			window.SetProperty("SMOOTH.SHOW.ITEMCOUNT", ppt.showItemCount);
			break;
		case idx == 104:
			ppt.showScrollBar = !ppt.showScrollBar;
			window.SetProperty("SMOOTH.SHOW.SCROLLBAR", ppt.showScrollBar);
			this.size();
			break;
		case idx >= 200 && idx < 200 + autoplaylists.length:
			var item = autoplaylists[idx - 200];
			plman.ActivePlaylist = plman.CreateAutoPlaylist(plman.PlaylistCount, item[0], item[1], ppt.autoplaylist_sort_pattern, 1);
			break;
		case idx >= 1000:
			context.ExecuteByID(idx - 1000);
			break;
		}

		context.Dispose();
		this.repaint();
		return true;
	}

	this.settings_context_menu = function (x, y) {
		return true;
	}

	window.SetTimeout(function () {
		brw.populate();
	}, 100);

	this.rows = [];
	this.scrollbar = new oScrollbar(this);
	this.inputbox = null;
	this.inputboxID = -1;
	this.selectedRow = plman.ActivePlaylist;
}

function oPlaylist(idx, name, count) {
	this.idx = idx;
	this.rowId = idx;
	this.name = name;
	this.count = count;
}

function get_metrics() {
	ppt.rowHeight = scale(ppt.fontSize.value + 8) * 1.5;

	brw.size();

	window.MinWidth = ppt.showScrollBar ? (ppt.rowHeight * 4 - brw.scrollbar.w) : ppt.rowHeight * 4;
}

function check_scroll(scroll___) {
	if (scroll___ < 0)
		scroll___ = 0;
	var g1 = brw.h - (brw.totalRowsVis * ppt.rowHeight);
	var end_limit = (brw.rows.length * ppt.rowHeight) - (brw.totalRowsVis * ppt.rowHeight) - g1;
	if (scroll___ != 0 && scroll___ > end_limit) {
		scroll___ = end_limit;
	}
	return scroll___;
}

function renamePlaylist() {
	if (!brw.inputbox.text || brw.inputbox.text == "" || brw.inputboxID == -1)
		brw.inputbox.text = brw.rows[brw.inputboxID].name;
	if (brw.inputbox.text.length > 1 || (brw.inputbox.text.length == 1 && (brw.inputbox.text >= "a" && brw.inputbox.text <= "z") || (brw.inputbox.text >= "A" && brw.inputbox.text <= "Z") || (brw.inputbox.text >= "0" && brw.inputbox.text <= "9"))) {
		brw.rows[brw.inputboxID].name = brw.inputbox.text;
		plman.RenamePlaylist(brw.rows[brw.inputboxID].idx, brw.inputbox.text);
		brw.repaint();
	}
	brw.inputboxID = -1;
}

ppt.autoplaylist_sort_pattern = "%album artist% | $if(%album%,%date%,9999) | %album% | %discnumber% | %tracknumber% | %title%";
ppt.showItemCount = window.GetProperty("SMOOTH.SHOW.ITEMCOUNT", false);
ppt.showScrollBar = window.GetProperty("SMOOTH.SHOW.SCROLLBAR", false);

var autoplaylists = [
	["Media Library", "ALL"],
	["Recently added", "%added% DURING LAST 4 WEEKS"],
	["Never played", "%play_count% MISSING"],
	["Favorite", "%rating% IS 5"],
];

var cPlaylistManager = {
	drag_clicked: false,
	drag_source_id: -1,
	drag_target_id: -1,
};

var timers = {
	movePlaylist: false,
};

var g_drag_drop_target_id = -1;
var brw = new oBrowser();
var menu = new Array();
var active = new _p("SMOOTH.ACTIVE", 0);

get_metrics();