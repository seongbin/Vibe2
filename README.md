This is a simple 'Now Playing' mockup built with samples included in [marc2k3](https://github.com/marc2k3)'s [JScript Panel 3](https://github.com/jscript-panel/release/releases).

## Components

* [JScript Panel 3](https://github.com/jscript-panel/release/releases) (3.3.4+)
* [Flowin](https://github.com/ttsping/foo_flowin) (0.2.0)
* [Playback Statistics](https://www.foobar2000.org/components/view/foo_playcount) (3.1.5)

## Hotkeys

1. <kbd>Space</kbd>, Play/Pause
2. <kbd>→</kbd>, Ahead by 5 seconds
3. <kbd>←</kbd>, Back by 5 seconds
4. <kbd>Ctrl</kbd>+<kbd>wheel</kbd>, scaling layout

## Notes

* If the flowing art panel is invisible on your monitor, go to <b>[View]-[Flowin]-[Picture in picture]-[Reset position]</b>, then hold the scroll button of your mouse on the panel to adjust the position
* For biography, create a new JScript 3 panel with code below
```
// ==PREPROCESSOR==
// @name "Last.fm Bio + Images"
// @author "marc2003"
// @import "%fb2k_component_path%helpers.txt"
// @import "%fb2k_component_path%samples\js\lodash.min.js"
// @import "%fb2k_profile_path%user-scripts\js\common.js"
// @import "%fb2k_profile_path%user-scripts\js\panel.js"
// @import "%fb2k_component_path%samples\js\lastfm.js"
// @import "%fb2k_component_path%samples\js\thumbs.js"
// @import "%fb2k_component_path%samples\js\text.js"
// @import "%fb2k_profile_path%user-scripts\bio.js"
// ==/PREPROCESSOR==
```
* Default biography cache file location is changed, you can edit yourself in file %fb2k_profile_path%user-scripts\js\common.js, go to line 475

## Screenshot

![](Preview.png)
