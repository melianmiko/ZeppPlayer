/*
 * port_miui
 *
 * Authors:
 *  - 2022, MelianMiko <support@melianmiko.ru> (initial developer)
 * 
 * If you publish any modification of this script, please DO NOT
 * remove previous developers. We do not obussify our JS code and
 * give you ability to use them, and hope for respect.
 *
 * Если вы публикуете модификацию этого скрипта, не удаляйте
 * информацию о предыдущих авторах. Мы не обусифицируем наш код,
 * чтобы вы могли с ним работать, и надеемся на уважительное
 * отношение.
 */

// Tk-independed version, specially for ZeppPlayer demo

(() => {
	/**
	 * This function will create an array for font_array
	 * param. {} in pattern will be replaced with current int.
	 * Eg. pattern - 'time/{}.png' -> result ['time/0.png', 'time/1.png', ..., 
	 * 'time/9png']
	 */
	function mkFontArrayAt(pattern, len=10) {
		const out = [];
		for(let i = 0; i < len; i++) {
			out.push(pattern.replace("{}", i));
		}
		return out;
	}

	/**
	 * This function will create date widget with
	 * user selected format.
	 */
	function makeOrderedDate(config) {
		const time = hmSensor.createSensor(hmSensor.id.TIME);

		// Dispatch format
		const formats = [
			"mm.dd", "dd.mm", "mm.dd", // without year
			"yy.mm.dd", "dd.mm.yy", "mm.dd.yy", // with year
			"yyyy.mm.dd", "dd.mm.yyyy", "mm.dd.yyyy" // with full year
		]

		let formatId = hmSetting.getDateFormat();
		if(config.withYear) formatId += 3;
		if(config.withYear && config.fullYear) formatId += 3;

		const currentFormat = formats[formatId];
		console.log("current date format", currentFormat);

		// Create TEXT_IMG
		const display = hmUI.createWidget(hmUI.widget.TEXT_IMG, {
			...config,
			text: "",
			_name: 'makeOrderedDate' // name visible in explorer panel
		});

		// Update date func
		const str = (v, l) => {
			v = v.toString();
			if(v.length > l) v = v.substring(v.length-l, v.length);
			return v.padStart(l, "0");
		}

		let lastVal = "";
		const updateDate = () => {
			let val = currentFormat.replace("yyyy", str(time.year, 4))
								   .replace("yy", str(time.year, 2))
								   .replace("mm", str(time.month, 2))
								   .replace("dd", str(time.day, 2));

			if(val == lastVal) return;
			display.setProperty(hmUI.prop.TEXT, val);
		}

		updateDate();
		timer.createTimer(0, 2000, updateDate);
	}

	/**
	 * Main watchface function
	 */
	function entrypoint() {
		const OFFSET_TOP = 192;
		const EDIT_TYPE_VOID = 0;
	
		// Default optional activities
		const WF_EDIT_DEFAULTS = [1, 2, 0, 0];
	
		// List of optional activity variants
		// name, props, edit_type
		const WF_ACTIVITY_CONFIGS = [
			["steps", {type: hmUI.data_type.STEP}, 1],
			["heart", {type: hmUI.data_type.HEART}, 2 ],
			["calories", {type: hmUI.data_type.CAL}, 3],
			["distance", {type: hmUI.data_type.DISTANCE}, 4],
			["pai", {type: hmUI.data_type.PAI_DAILY}, 5],
			["empty", null, EDIT_TYPE_VOID]
		];
	
		// Draw editables
		const editables = [];
		let editY = OFFSET_TOP + 100;
	
		for(let i = 0; i < 4; i++) {
			editables[i] = hmUI.createWidget(hmUI.widget.WATCHFACE_EDIT_GROUP, {
				edit_id: 100 + i,
				x: 40,
				y: editY, 
				w: 96,
				h: 28,
				select_image: "edit_tip_focus.png",
				un_select_image: "edit_tip.png",
				default_type: WF_EDIT_DEFAULTS[i],
				optional_types: WF_ACTIVITY_CONFIGS.map((row) => {
					const [name, data, type] = row;
					return {
						type,
						preview: `preview/${name}.png`, 
						title_en: "Activity",
						title_sc: "Activity",
						title_tc: "Activity"
					}
				}),
				count: WF_ACTIVITY_CONFIGS.length,
				tips_BG: "",
				tips_x: -100,
				tips_y: 0,
				tips_width: 20,
				tips_margin: 1,
				show_level: hmUI.show_level.ALL,
				_name: "Editor " + i
			});
	
			editY += 32;
		}
	
		// Move to bottom for all disabled activities
		let y = OFFSET_TOP;
		for(let i in editables) {
			if(editables[i].getProperty(hmUI.prop.CURRENT_TYPE) == EDIT_TYPE_VOID)
				y += 32;
		}
	
		// BG GIF
		hmUI.createWidget(hmUI.widget.IMG_ANIM, {
			anim_path: "gif",
			anim_prefix: "earth",
			anim_ext: "png",
			anim_fps: 10,
			anim_size: 60,
			repeat_count: 0,
			anim_status: hmUI.anim_status.START,
			x: 0,
			y: 25,
			show_level: hmUI.show_level.ONLY_NORMAL | hmUI.show_level.ONLY_EDIT
		});
	
		// Status
		hmUI.createWidget(hmUI.widget.IMG, {
			x: 80, y: 16, src: "indicators/bg.png"
		});
		hmUI.createWidget(hmUI.widget.IMG_STATUS, {
			x: 96, y: 16, src: "indicators/moon.png",
			type: hmUI.system_status.DISTURB
		});
		hmUI.createWidget(hmUI.widget.IMG_STATUS, {
			x: 80, y: 16, src: "indicators/disconnect.png",
			type: hmUI.system_status.DISCONNECT
		});
	
		// Clock
		const clockParams = {
			hour_zero: 1,
			minute_zero: 1,
			minute_follow: 1,
			hour_startX: 4,
			hour_startY: y,
			hour_space: 1,
			minute_space: 1,
		};
	
		const clockfont = mkFontArrayAt("font_clock/{}.png");
		hmUI.createWidget(hmUI.widget.IMG_TIME, {
			...clockParams,
			hour_array: clockfont,
			minute_array: clockfont,
			hour_unit_sc: "font_clock/10.png",
			hour_unit_tc: "font_clock/10.png",
			hour_unit_en: "font_clock/10.png",
			show_level: hmUI.show_level.ONLY_NORMAL
		});
	
		const clockfontAod = mkFontArrayAt("font_clock_aod/{}.png");
		hmUI.createWidget(hmUI.widget.IMG_TIME, {
			...clockParams,
			hour_array: clockfontAod,
			minute_array: clockfontAod,
			hour_unit_sc: "font_clock_aod/10.png",
			hour_unit_tc: "font_clock_aod/10.png",
			hour_unit_en: "font_clock_aod/10.png",
			show_level: hmUI.show_level.ONLY_AOD
		});
	
		y += 60;
	
		// Date
		makeOrderedDate({
			x: 55,
			y: y,
			font_array: mkFontArrayAt("font_date/{}.png"),
			dot_image: "font_date/10.png",
			space: 2,
			withYear: false,
			show_level: hmUI.show_level.ONLY_NORMAL | hmUI.show_level.ONLY_AOD
		});
	
		y += 40;
	
		// Activity
		const activityFont = mkFontArrayAt("font_activity/{}.png");
		for(let i = 0; i < 4; i++) {
			let data = WF_ACTIVITY_CONFIGS[i], 
				id = editables[i].getProperty(hmUI.prop.CURRENT_TYPE);
	
			// Find user-selected variant
			for(let j = 0; j < WF_ACTIVITY_CONFIGS.length; j++) {
				if(WF_ACTIVITY_CONFIGS[j][2] == id) {
					data = WF_ACTIVITY_CONFIGS[j];
					break;
				}
			}
	
			// Skip, if disables
			if(data[1] == null) continue;
	
			// Show level
			let show_level = hmUI.show_level.ONLY_NORMAL;
			if(i == 0) show_level = show_level | hmUI.show_level.ONLY_AOD;
	
			// Draw
			hmUI.createWidget(hmUI.widget.TEXT_IMG, {
				x: 40, y: y + 1, show_level,
				icon: `icons/${data[0]}.png`,
				w: 150,
				icon_space: 12,
				h_space: 2,
				font_array: activityFont,
				dot_image: "font_activity/dot.png",
				...data[1]
			})
	
			y += 32;
		}
	
		// Battery
		hmUI.createWidget(hmUI.widget.TEXT_IMG, {
			x: 40, y: 440,
			icon: "icons/battery.png",
			w: 150,
			type: hmUI.data_type.BATTERY,
			font_array: activityFont,
			h_space: 2,
			unit_sc: "font_activity/perc.png",
			unit_tc: "font_activity/perc.png",
			unit_en: "font_activity/perc.png",
			icon_space: 12,
			alpha: 180
		})
	}

	// Export watchface module to device
	var __$$app$$__ = __$$hmAppManager$$__.currentApp;
	var __$$module$$__ = __$$app$$__.current;
	__$$module$$__.module = DeviceRuntimeCore.WatchFace({
		onInit() {
			entrypoint();
		}
	});
})();
