var ipcRenderer = require('electron').ipcRenderer;
ipcRenderer.on('new_tab', function () {
	document.getElementById('window_manager').innerHTML += "<button class=\"tablinks\" onclick=\"openCity(event, 'Tokyo')\">Tokyo</button>"
});

ipcRenderer.on('image', function (t, image, width, height) {
	create_sprite(image, width, height);
});

ipcRenderer.on('sound', function (t, sound) {
	create_sound(sound);
});

window.onload = function() {
	global_hide();
	sound_inspector_hide();
	document.getElementById("game_canvas").width = 800;
	document.getElementById("game_canvas").height = 600;
	document.getElementById("shim").style = "display: block";
	document.getElementById("msgbx").style = "display: none";
	document.getElementById("msgbx3").style = "display: none";
	document.getElementById("msgbx4").style = "display: none";
	document.getElementById("screen_option").style = "display: none";
	document.getElementById("msgbx1").style = "display: none";
	document.getElementById("msgbx2").style = "display: none";
	document.getElementById("welcome_msg").style = "display: block";
	document.getElementById("new_screen").style = "display: none";
	document.getElementById("global_settings").style = "display: none";
	document.getElementById("sound_inspector").style = "display: none";
	hide_inspector();
}

function hide_ns() {
	document.getElementById("new_screen").style = "display: none";
	document.getElementById("shim").style = "display: none";
}

function create_new_screen() {
	tag_name = document.getElementById('screen_name').value;
	if (tag_name.length == 0) {
		alert("Error: You have to enter a valid window name");
		return (84);
	}
	ipcRenderer.send('get_screen');
	ipcRenderer.once('retreive_array', (event, screen) => {
		var count = 0;
		screen.forEach(element => {
			count++;
		});
		screen_obj = {};
		screen_obj.tag = tag_name,
		screen_obj.unique_id = token(),
		screen_obj.screen_id = count
		screen_obj.onenter_script = "";
		screen_obj.onframe_script = "";
		screen.push(screen_obj);
		ipcRenderer.send('save_screen', screen);
		document.getElementById('window_manager').innerHTML += "<button class=\"tablinks\" onclick=\"openScreen(" + screen_obj.screen_id + ")\" oncontextmenu=\"javascript:show_screen_option();\">" + screen_obj.tag + "</button>"
		document.getElementById("new_screen").style = "display: none";
		document.getElementById("shim").style = "display: none";
		openScreen(screen_obj.screen_id)
	})
}

function create_new_project() {
	ipcRenderer.send('new_project');
	ipcRenderer.once('action_success', () => {
		document.getElementById("welcome_msg").style = "display: none";
		document.getElementById("shim").style = "display: none";
		document.getElementById("new_screen").style = "display: block";
		document.getElementById("new_screen_cancel").style = "display: none";
		document.getElementById("shim").style = "display: block";
	});
}

function open_project() {
	ipcRenderer.send('open_project');
	ipcRenderer.once('action_success', ()=> {
		document.getElementById("welcome_msg").style = "display: none";
		document.getElementById("shim").style = "display: none";
		ipcRenderer.send('get_screen');
		ipcRenderer.once('retreive_array', (event, screen) => {
			screen.forEach(element => {
				document.getElementById('window_manager').innerHTML += "<button class=\"tablinks\" id=\"" + element.screen_id + "\" onclick=\"openScreen(this.id)\" oncontextmenu=\"javascript:show_screen_option();\">" + element.tag + "</button>"
			});
			update_canvas();
		})
	});
}

function __new_screen()
{
	document.getElementById("new_screen").style = "display: block";
	document.getElementById("shim").style = "display: block";
}

ipcRenderer.on('new_screen', ()=> {
	document.getElementById("new_screen").style = "display: block";
	document.getElementById("shim").style = "display: block";
});

ipcRenderer.on('show_global', ()=> {
	show_global();
});

function display_inspector(element) {
	document.getElementById("info_current_object").innerHTML = element.unique_id;
	document.getElementById("obj_tag").style = "display: inline";
	document.getElementById("obj_tag").innerHTML = element.tag;
	document.getElementById("obj_x").style = "display: inline";
	document.getElementById("obj_x").innerHTML = element.x;
	document.getElementById("obj_y").style = "display: inline";
	document.getElementById("obj_y").innerHTML = element.y;
	document.getElementById("obj_width").style = "display: inline";
	document.getElementById("obj_width").innerHTML = element.width;
	document.getElementById("obj_height").style = "display: inline";
	document.getElementById("obj_height").innerHTML = element.height;
	document.getElementById("obj_onclick_editor").style = "display: inline";
	document.getElementById("obj_onhover_editor").style = "display: inline";
	document.getElementById("obj_onframe_editor").style = "display: inline";
	document.getElementById("obj_visible_editor").style = "display: inline";
	document.getElementById("obj_delete").style = "display: inline";
	if (element.visible == 1) {
		document.getElementById("obj_visible_editor").checked = true;
	} else {
		document.getElementById("obj_visible_editor").checked = false;
	}
}

function hide_inspector() {
	document.getElementById("obj_tag").style = "display: none";
	document.getElementById("obj_x").style = "display: none";
	document.getElementById("obj_y").style = "display: none";
	document.getElementById("obj_width").style = "display: none";
	document.getElementById("obj_height").style = "display: none";
	document.getElementById("obj_onclick").style = "display: none";
	document.getElementById("obj_onhover").style = "display: none";
	document.getElementById("obj_onframe").style = "display: none";
	document.getElementById("obj_onclick_editor").style = "display: none";
	document.getElementById("obj_onhover_editor").style = "display: none";
	document.getElementById("obj_onframe_editor").style = "display: none";
	document.getElementById("obj_visible_editor").style = "display: none";
	document.getElementById("obj_tag_editor").style = "display: none";
	document.getElementById("obj_x_editor").style = "display: none";
	document.getElementById("obj_y_editor").style = "display: none";
	document.getElementById("obj_width_editor").style = "display: none";
	document.getElementById("obj_height_editor").style = "display: none";
	document.getElementById("obj_delete").style = "display: none";
}

function canvas_onclick() {
	var screen_id = document.getElementById("info_current_screen").innerHTML;
	var c=document.getElementById("game_canvas");
	var rect = c.getBoundingClientRect();
	var y = event.y - rect.top;
	var x = event.x - rect.left;
	var clicked = false;
	ipcRenderer.send('get_global');
	ipcRenderer.once('retreive_array', (event, global) => {
		ipcRenderer.send('get_elements');
		ipcRenderer.once('retreive_elements', (event, list) => {
		list.forEach(element => {
			new_x = (element.x * c.width) / global.width;
			new_y = (element.y * c.height) / global.height;
			new_w = (element.width * c.width) / global.width;
			new_h = (element.height * c.height) / global.height;
			if (x >= new_x && x <= new_x + new_w && 
			y >= new_y && y <= new_y + new_h && element.screen_id == screen_id) {
					display_inspector(element);
					clicked = true;
					return;
			}
		});
		if (clicked == false) {
			hide_inspector();
		}
	});
	})
}

function update_canvas() {
	var screen_id = document.getElementById("info_current_screen").innerHTML;
	var c=document.getElementById("game_canvas");
	var ctx=c.getContext("2d");
	ctx.clearRect(0, 0, c.width, c.height);
	var global = {};
	global.width = 800;
	global.height = 600;
	var i = 0;
	ipcRenderer.send('get_global');
	ipcRenderer.once('retreive_array', (event, global) => {
		ipcRenderer.send('get_elements');
		ipcRenderer.once('retreive_elements', (event, elements) => {
			elements.forEach(element => {
				if (element.screen_id == screen_id && element.visible == 1) {
					i++;
					ctx.fillStyle="#FF0000";
					var image = new Image();
					image.src = element.path;
					new_x = (element.x * c.width) / global.width;
					new_y = (element.y * c.height) / global.height;
					new_w = (element.width * c.width) / global.width;
					new_h = (element.height * c.height) / global.height;
					ctx.drawImage(image, new_x, new_y, new_w, new_h);
				}
			});
			update_hierarchy();
		});
	});
	
}

function update_hierarchy()
{
	var screen_id = document.getElementById("info_current_screen").innerHTML;
	hierarchy = document.getElementById("hierarchy_list").innerHTML = "";
	ipcRenderer.send('get_elements');
	ipcRenderer.once('retreive_elements', (event, elements) => {
		elements.forEach(element => {
			if (screen_id == element.screen_id)
				document.getElementById("hierarchy_list").innerHTML += "<span id='" + element.unique_id + "' onclick='hierarchy_click(this.id)'> <i class=\"glyphicon glyphicon-picture\"></i>" + element.tag + "</span> <br>";
		});
		ipcRenderer.send('get_sounds_2');
		ipcRenderer.once('retreive_array_2', (event, sounds) => {
			sounds.forEach(sound => {
				document.getElementById("hierarchy_list").innerHTML += "<span id='" + sound.unique_id + "' onclick='openSound(this.id)'> <i class=\"glyphicon-glyphicon-music\"></i>" + sound.tag + "</span> <br>";
			});
		});
	});
}

function hierarchy_click(id)
{
	ipcRenderer.send('get_elements');
	ipcRenderer.once('retreive_elements', (event, elements) => {
		id = elements.map(x => x.unique_id).indexOf(id);
		display_inspector(elements[id]);
	});
}

function openScreen(screen_id) {
	var i, tabcontent, tablinks;

	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}
	tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
	}
	document.getElementById("info_current_screen").innerHTML = screen_id;
	update_canvas();
	hide_inspector();
}

function add_new_sprite_1() {
	var screen_id = document.getElementById("info_current_screen").innerHTML;
	var new_element = {};
	new_element.tag = "TAG";
	new_element.unique_id = token();
	new_element.x = 0;
	new_element.y = 0;
	new_element.height = 100;
	new_element.width = 100;
	new_element.screen_id = screen_id;
	new_element.onclick_script = "";
	new_element.newframe_script = "";
	new_element.onhover_script = "";
	ipcRenderer.send('get_elements');
	ipcRenderer.once('retreive_elements', (event, list) => {
		list.push(new_element);
		ipcRenderer.send('save_elements', list);
		update_canvas();
	})
}

function create_sprite(image, width, height) {
	var screen_id = document.getElementById("info_current_screen").innerHTML;

	var new_element = {};
	new_element.tag = "TAG";
	new_element.unique_id = token();
	new_element.x = 0;
	new_element.y = 0;
	new_element.original_height = height;
	new_element.original_width = width;
	new_element.height = height;
	new_element.width = width;
	new_element.screen_id = screen_id;
	new_element.onclick_script = "";
	new_element.newframe_script = "";
	new_element.onhover_script = "";
	new_element.visible = 1;
	new_element.path = image;
	ipcRenderer.send('get_elements');
	ipcRenderer.once('retreive_elements', (event, list) => {
		console.log(list);
		list.push(new_element);
		ipcRenderer.send('save_elements', list);
		console.log(list);
		update_canvas();
	});
}
function add_new_sprite_() {
	ipcRenderer.send('open_image');
	ipcRenderer.once('image', (event, image, width, height) => {
		if (image != "__canceled__") {
			create_sprite(image, width, height);
		}
	});
}

function inspector_edit(this_id) {
	document.getElementById(this_id).style = "display: none";
	document.getElementById(this_id + "_editor").style = "display: inline";
	document.getElementById(this_id + "_editor").value = document.getElementById(this_id).innerHTML;
}

function change_visibility()
{
	ipcRenderer.send('get_elements');
	ipcRenderer.once('retreive_elements', (event, elements) => {
		var element_id = document.getElementById("info_current_object").innerHTML;
		element_id = elements.map(x => x.unique_id).indexOf(element_id);

		if (elements[element_id].visible == 1) {
			document.getElementById("obj_visible_editor").checked = false;
			elements[element_id].visible = 0;
		} else {
			document.getElementById("obj_visible_editor").checked = true;
			elements[element_id].visible = 1;
		}
		ipcRenderer.send('save_elements', elements);
		update_canvas();
	});
}

function show_global() {
	ipcRenderer.send('get_global');
	ipcRenderer.once('retreive_array', (event, global) => {
		document.getElementById("shim").style = "display: block";
		document.getElementById("global_settings").style = "display: block";
		document.getElementById("global_title").innerHTML = global.title;
		document.getElementById("global_width").innerHTML = global.width;
		document.getElementById("global_height").innerHTML = global.height;
		document.getElementById("global_fps").innerHTML = global.fps;
		document.getElementById("global_cr").innerHTML = global.cr;
	})
}

function global_hide() {
	document.getElementById("shim").style = "display: none";
	document.getElementById("global_settings").style = "display: none";
	document.getElementById("global_title_editor").style = "display: none";
	document.getElementById("global_width_editor").style = "display: none";
	document.getElementById("global_height_editor").style = "display: none";
	document.getElementById("global_fps_editor").style = "display: none";
	document.getElementById("global_cr_editor").style = "display: none";

}

function global_edit(this_id) {
	document.getElementById(this_id).style = "display: none";
	document.getElementById(this_id + "_editor").style = "display: inline";
	document.getElementById(this_id + "_editor").value = document.getElementById(this_id).innerHTML;
}

function global_save(this_id, type) {
	ipcRenderer.send('get_global');
	ipcRenderer.once('retreive_array', (event, global) => {
		document.getElementById("global_title").innerHTML = global.title;
		document.getElementById("global_width").innerHTML = global.width;
		document.getElementById("global_height").innerHTML = global.height;
		document.getElementById("global_fps").innerHTML = global.fps;
		document.getElementById("global_cr").innerHTML = global.cr;
	})
}

function global_init() {
	ipcRenderer.send('get_global');
	ipcRenderer.once('retreive_array', (event, global) => {
		document.getElementById("global_title").innerHTML = global.title;
		document.getElementById("global_width").innerHTML = global.width;
		document.getElementById("global_height").innerHTML = global.height;
		document.getElementById("global_fps").innerHTML = global.fps;
		document.getElementById("global_cr").innerHTML = global.cr;
	})
}

function change_global(this_id, e, id) {
	if (e.keyCode == 13) {
		ipcRenderer.send('get_global');
		ipcRenderer.once('retreive_array', (event, global) => {
			var new_element = document.getElementById(this_id).value;
			if (id == 0) {
				global.title = new_element;
			}
			if (id == 1) {
				global.width = new_element;
			}
			if (id == 2) {
				global.height = new_element;
			}
			if (id == 3) {
				global.fps = new_element;
			}
			if (id == 4) {
				global.cr = new_element;
			}
			ipcRenderer.send('save_global', global);
			document.getElementById(this_id).style = "display: none";
			global_init();
			this_id = this_id.replace("_editor", "");
			console.log(this_id);
			document.getElementById(this_id).style = "display: inline";
		});
	}
}

function change_inspector(this_id, e, id) {
	if (e.keyCode == 13) {
		ipcRenderer.send('get_elements');
		ipcRenderer.once('retreive_elements', (event, list) => {
			var element_id = document.getElementById("info_current_object").innerHTML;
			element_id = list.map(x => x.unique_id).indexOf(element_id);
			var new_element = document.getElementById(this_id).value;
			if (id == 0) {
				list[element_id].tag = new_element;
			}
			if (id == 1) {
				list[element_id].x = new_element;
			}
			if (id == 2) {
				list[element_id].y = new_element;
			}
			if (id == 3) {
				list[element_id].width = new_element;
			}
			if (id == 4) {
				list[element_id].height = new_element;
			}
			ipcRenderer.send('save_elements', list);
			document.getElementById(this_id).style = "display: none";
			update_canvas();
			this_id = this_id.replace("_editor", "");
			console.log(this_id);
			document.getElementById(this_id).style = "display: inline";
			update_inspector();
		});
	}
}

function update_inspector() {
	var element_id = document.getElementById("info_current_object").innerHTML;
	ipcRenderer.send('get_elements');
	ipcRenderer.once('retreive_elements', (event, list) => {
		console.log(list);
		element_id = list.map(x => x.unique_id).indexOf(element_id);
		element = list[element_id];
		document.getElementById("obj_tag").style = "display: inline";
		document.getElementById("obj_tag").innerHTML = element.tag;
		document.getElementById("obj_x").style = "display: inline";
		document.getElementById("obj_x").innerHTML = element.x;
		document.getElementById("obj_y").style = "display: inline";
		document.getElementById("obj_y").innerHTML = element.y;
		document.getElementById("obj_width").style = "display: inline";
		document.getElementById("obj_width").innerHTML = element.width;
		document.getElementById("obj_height").style = "display: inline";
		document.getElementById("obj_height").innerHTML = element.height;
		document.getElementById("obj_onclick").style = "display: inline";
		document.getElementById("obj_onhover").style = "display: inline";
		document.getElementById("obj_onframe").style = "display: inline";

	});

}

function onclick_show_script_editor() {
	var script_name = document.getElementById("script_input_name").value;
	if (script_name.length == 0) {
		alert("Invalid Script Name");
	}
	var element_id = document.getElementById("info_current_object").innerHTML;
	var failed = false;
	ipcRenderer.send('get_elements');
	ipcRenderer.once('retreive_elements', (event, list) => {
		element_id = list.map(x => x.unique_id).indexOf(element_id);
		list.forEach(element => {
			if (element.onhover_script == script_name || element.onclick_script == script_name || element.newframe_script == script_name) {
				alert("Script Name already exist");
				failed = true;
			}
		});
		if (failed == false) {
			list[element_id].onclick_script = script_name;
			ipcRenderer.send('save_elements', list);
			ipcRenderer.send('create_script', script_name);
			alert("Script Created, You can now edit it with your code editor");
			document.getElementById("shim").style = "display: none";
			document.getElementById("msgbx").style = "display: none";
		}
	});
}

function onframe_show_script_editor() {
	var script_name = document.getElementById("script1_input_name").value;
	if (script_name.length == 0) {
		alert("Invalid Script Name");
	}
	var element_id = document.getElementById("info_current_object").innerHTML;
	var failed = false;
	ipcRenderer.send('get_elements');
	ipcRenderer.once('retreive_elements', (event, list) => {
		element_id = list.map(x => x.unique_id).indexOf(element_id);
		list.forEach(element => {
			if (element.onhover_script == script_name || element.onclick_script == script_name || element.newframe_script == script_name) {
				alert("Script Name already exist");
				failed = true;
			}
		});
		if (failed == false) {
			list[element_id].newframe_script = script_name;
			ipcRenderer.send('save_elements', list);
			ipcRenderer.send('create_script', script_name);
			alert("Script Created, You can now edit it with your code editor");
			document.getElementById("shim").style = "display: none";
			document.getElementById("msgbx1").style = "display: none";
		}
	});
}

function onhover_show_script_editor() {
	var script_name = document.getElementById("script2_input_name").value;
	if (script_name.length == 0) {
		alert("Invalid Script Name");
	}
	var element_id = document.getElementById("info_current_object").innerHTML;
	var failed = false;
	ipcRenderer.send('get_elements');
	ipcRenderer.once('retreive_elements', (event, list) => {
		element_id = list.map(x => x.unique_id).indexOf(element_id);
		list.forEach(element => {
			if (element.onhover_script == script_name || element.onclick_script == script_name || element.newframe_script == script_name) {
				alert("Script Name already exist");
				failed = true;
			}
		});
		if (failed == false) {
			list[element_id].onhover_script = script_name;
			ipcRenderer.send('save_elements', list);
			ipcRenderer.send('create_script', script_name);
			alert("Script Created, You can now edit it with your code editor");
			document.getElementById("shim").style = "display: none";
			document.getElementById("msgbx2").style = "display: none";
		}
	});
}

function on_click_script() {
	var element_id = document.getElementById("info_current_object").innerHTML;
	ipcRenderer.send('get_elements');
	ipcRenderer.once('retreive_elements', (event, list) => {
		element_id = list.map(x => x.unique_id).indexOf(element_id);
		if (list[element_id].onclick_script.length == 0) {
			//create new script
			document.getElementById("msgbx").style = "display: block";
			document.getElementById("shim").style = "display: block";
		} else {
			alert("Edit " + list[element_id].onclick_script + ".engine.c");
		}
	});
}
function on_hover_script() {
	var element_id = document.getElementById("info_current_object").innerHTML;
	ipcRenderer.send('get_elements');
	ipcRenderer.once('retreive_elements', (event, list) => {
		element_id = list.map(x => x.unique_id).indexOf(element_id);
		if (list[element_id].onhover_script.length == 0) {
			//create new script
			document.getElementById("msgbx2").style = "display: block";
			document.getElementById("shim").style = "display: block";
		} else {
			alert("Edit " + list[element_id].onhover_script + ".engine.c");
		}
	});
}
function on_frame_script() {
	var element_id = document.getElementById("info_current_object").innerHTML;
	ipcRenderer.send('get_elements');
	ipcRenderer.once('retreive_elements', (event, list) => {
		element_id = list.map(x => x.unique_id).indexOf(element_id);
		if (list[element_id].newframe_script.length == 0) {
			//create new script
			document.getElementById("msgbx1").style = "display: block";
			document.getElementById("shim").style = "display: block";
		} else {
			alert("Edit " + list[element_id].newframe_script + ".engine.c");
		}
	});
}

function delete_item()
{
	var element_id = document.getElementById("info_current_object").innerHTML
	ipcRenderer.send('get_elements');
	ipcRenderer.once('retreive_elements', (event, list) => {
		element_id = list.map(x => x.unique_id).indexOf(element_id);
		console.log(list[element_id]);
		var check = confirm("Are you sure you want to delete " + list[element_id].tag);
		if (check == true) {
			id = list.map(x => x.unique_id).indexOf(element_id);
			list.splice(id, 1);
			ipcRenderer.send('save_elements', list);
			update_canvas();
		}
	});
}

function add_new_sound()
{
	ipcRenderer.send('open_sound');
	ipcRenderer.once('sound', (event, sound) => {
		if (sound != "__canceled__") {
			create_sound(sound);
		}
	});
}

function create_sound(sound)
{
	var screen_id = document.getElementById("info_current_screen").innerHTML;

	var new_element = {};
	new_element.tag = "sound";
	new_element.unique_id = token();
	new_element.screen_id = screen_id;
	new_element.volume = 100;
	new_element.state = 1;
	new_element.path = sound;
	ipcRenderer.send('get_sounds');
	ipcRenderer.once('retreive_array', (event, list) => {
		list.push(new_element);
		ipcRenderer.send('save_sound', list);
		update_hierarchy();
	})
}

function openSound(token)
{
	ipcRenderer.send('get_sounds');
	ipcRenderer.once('retreive_array', (event, list) => {
		list.forEach(element => {
			if (element.unique_id == token) {
				document.getElementById("info_current_sound").innerHTML = list.indexOf(element);
				document.getElementById("sound_tag").innerHTML = element.tag;
				document.getElementById("sound_volume").innerHTML = element.volume;
			//	document.getElementById("sound_state").innerHTML = element.state;
				document.getElementById("shim").style.display = "block";
				document.getElementById("sound_inspector").style.display = "block";
				return;
			}
		})
	})
}

function sound_inspector_hide()
{
	document.getElementById("shim").style = "display: none";
	document.getElementById("sound_inspector").style = "display: none";
	document.getElementById("sound_tag_editor").style = "display: none";
	//document.getElementById("sound_state_editor").style = "display: none";
	document.getElementById("sound_volume_editor").style = "display: none";
}

function sound_inspector_delete()
{
	var element_id = parseInt(document.getElementById("info_current_sound").innerHTML)
	ipcRenderer.send('get_sounds');
	ipcRenderer.once('retreive_array', (event, list) => {
		var check = confirm("Are you sure you want to delete " + list[element_id].tag);
		if (check == true) {
			list.splice(element_id, 1);
			ipcRenderer.send('save_sound', list);
			sound_inspector_hide();
			update_hierarchy();
		}
	});
}

function change_sound(this_id, e, id)
{
	if (e.keyCode == 13) {
		ipcRenderer.send('get_sounds');
		ipcRenderer.once('retreive_array', (event, list) => {
			var element_id = document.getElementById("info_current_sound").innerHTML;
			element_id = parseInt(element_id);
			var new_element = document.getElementById(this_id).value;
			console.log(new_element);
			if (id == 0) {
				list[element_id].tag = new_element;
			}
			if (id == 1) {
				list[element_id].volume = new_element;
			}
			ipcRenderer.send('save_sound', list);
			document.getElementById(this_id).style = "display: none";
			update_hierarchy();
			this_id = this_id.replace("_editor", "");
			document.getElementById(this_id).style = "display: inline";
			document.getElementById(this_id).innerHTML = new_element;
		});
	}
}

function sound_edit(this_id) {
	document.getElementById(this_id).style = "display: none";
	document.getElementById(this_id + "_editor").style = "display: inline";
	document.getElementById(this_id + "_editor").value = document.getElementById(this_id).innerHTML;
}

function onclick_hide_script_input()
{
	document.getElementById("msgbx").style = "display: none";
	document.getElementById("shim").style = "display: none"
}

function onhover_hide_script_input()
{
	document.getElementById("msgbx2").style = "display: none";
	document.getElementById("shim").style = "display: none"
}

function onframe_hide_script_input()
{
	document.getElementById("msgbx1").style = "display: none";
	document.getElementById("shim").style = "display: none"
}

function show_screen_option()
{
	var screen_id = document.getElementById("info_current_screen").innerHTML;
	document.getElementById("screen_option").style = "display: block";
	document.getElementById("shim").style = "display: block"
}

function hide_screen_option()
{
	document.getElementById("screen_option").style = "display: none";
	document.getElementById("shim").style = "display: none"
}

function delete_screen()
{
	var screen_id = parseInt(document.getElementById("info_current_screen").innerHTML);
	ipcRenderer.send('get_screen');
	ipcRenderer.once('retreive_array', (event, screen) => {
		screen.splice(screen_id, 1);
		ipcRenderer.send('save_screen', screen);
		ipcRenderer.send('get_elements');
		ipcRenderer.once('retreive_elements', (event, objects) => {
			objects.forEach(object => {
				if (object.screen_id == screen_id) {
					id = objects.map(x => x.unique_id).indexOf(object.unique_id);
					objects.splice(id, 1);
					alert("OBJ was deleted");
				}
			});
			ipcRenderer.send('save_elements', objects);
		});

		document.getElementById("info_current_screen").innerHTML = screen_id - 1;
		ipcRenderer.send('get_screen');
		ipcRenderer.once('retreive_array', (event, screen) => {
			document.getElementById('window_manager').innerHTML = "";
			screen.forEach(element => {
				document.getElementById('window_manager').innerHTML += "<button class=\"tablinks\" id=\"" + element.screen_id + "\" onclick=\"openScreen(this.id)\" oncontextmenu=\"javascript:show_screen_option();\">" + element.tag + "</button>"
			});
			update_canvas();
		})
		hide_screen_option();
		update_canvas();
		if (screen_id -1 == -1) {
			__new_screen();
		}
	});
}

function onenter_script()
{
	var element_id = parseInt(document.getElementById("info_current_screen").innerHTML);
	ipcRenderer.send('get_screen');
	ipcRenderer.once('retreive_array', (event, list) => {
		//alert(list[element_id].onenter_script.length);
		if (list[element_id].onenter_script.length == 0) {
			//create new script
			//alert("New Script");
			document.getElementById("msgbx3").style = "display: block";
			document.getElementById("shim").style = "display: block";
		} else {
			alert("Edit " + list[element_id].onenter_script + ".engine.c");
		}
	});
}

function onsframe_script()
{
	var element_id = parseInt(document.getElementById("info_current_screen").innerHTML);
	ipcRenderer.send('get_screen');
	ipcRenderer.once('retreive_array', (event, list) => {
		//alert(list[element_id].onenter_script.length);
		if (list[element_id].onframe_script.length == 0) {
			//create new script
			//alert("New Script");
			document.getElementById("msgbx4").style = "display: block";
			document.getElementById("shim").style = "display: block";
		} else {
			alert("Edit " + list[element_id].onframe_script + ".engine.c");
		}
	});
}

function onenter_hide_script_input()
{
	document.getElementById("msgbx3").style = "display: none";
}

function onsframe_hide_script_input() //Screen every frame
{
	document.getElementById("msgbx4").style = "display: none";
}

function onsframes_show_script_editor()
{
	var script_name = document.getElementById("script4_input_name").value;
	if (script_name.length == 0) {
		alert("Invalid Script Name");
	}
	var element_id = parseInt(document.getElementById("info_current_screen").innerHTML);
	var failed = false;
	ipcRenderer.send('get_screen');
	ipcRenderer.once('retreive_array', (event, list) => {
		//element_id = list.map(x => x.unique_id).indexOf(element_id);
		list.forEach(element => {
			if (element.onenter_script == script_name || element.onframe == script_name) {
				alert("Script Name already exist");
				failed = true;
			}
		});
		if (failed == false) {
			list[element_id].onframe_script = script_name;
			ipcRenderer.send('save_screen', list);
			ipcRenderer.send('create_script_screen', script_name);
			alert("Script Created, You can now edit it with your code editor");
			document.getElementById("shim").style = "display: none";
			document.getElementById("msgbx4").style = "display: none";
		}
	});
}

function onenter_show_script_editor()
{
	var script_name = document.getElementById("script3_input_name").value;
	if (script_name.length == 0) {
		alert("Invalid Script Name");
	}
	var element_id = parseInt(document.getElementById("info_current_screen").innerHTML);
	var failed = false;
	ipcRenderer.send('get_screen');
	ipcRenderer.once('retreive_array', (event, list) => {
		//element_id = list.map(x => x.unique_id).indexOf(element_id);
		list.forEach(element => {
			if (element.onenter_script == script_name || element.onframe == script_name) {
				alert("Script Name already exist");
				failed = true;
			}
		});
		if (failed == false) {
			list[element_id].onenter_script = script_name;
			ipcRenderer.send('save_screen', list);
			ipcRenderer.send('create_script_screen', script_name);
			alert("Script Created, You can now edit it with your code editor");
			document.getElementById("shim").style = "display: none";
			document.getElementById("msgbx3").style = "display: none";
		}
	});
}

function rand() {
	return(Math.random().toString(36).substr(2));
};
function token() {
	return(rand() + rand());
};
