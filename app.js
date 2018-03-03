const electron = require('electron')
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const ipcRenderer = electron.ipcRenderer;
const electronSend = electron.electronSend;
const dialog = electron.dialog;
const Menu = electron.Menu;
const path_ = require('path');
const url = require('url');
const fs = require('fs');
const fs_extra = require('fs-extra');
var sizeOf = require('image-size');
let mainWindow
let project_path;

function setMainMenu() {
	const template = 
	[{
		label: 'File',
		submenu: [{
			label: 'New Project',
			accelerator: 'Shift+CmdOrCtrl+N',
			click() {
				console.log('New Project!')
				new_project();
			}
		}, {
			label: 'Open Project',
			accelerator: 'CmdOrCtrl+K+O',
			click() {
				console.log('Open Project!')
				if (open_project() == 84) {
					//Show Error Message;
				}
			}
		}]
	},{
		label: 'Assets',
		submenu: [{
			label: "Add Sprite",
			click() {
				open_image();
			}}, {
			label: "Add Sound",
			click() {
				console.log("New Sound")
				open_sound();
			}
		}]
	},{
		label: 'Engine',
		submenu: [{
			label: "New Window",
			accelerator: 'CmdOrCtrl+N',
			click() {
				mainWindow.webContents.send('new_screen');
			}}, {
			label: "Game Settings",
			click() {
				console.log("Show Global");
				mainWindow.webContents.send('show_global');
			}}, {
			label: "Build",
			click() {
				console.log("BUILD GAME");
				build_game();
			}
		}]
	}];
	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow () {
	mainWindow = new BrowserWindow({show: false, showDevTools : true})
	mainWindow.loadURL(url.format({
		pathname: path_.join(__dirname, '/visual/index.html'),
		protocol: 'file:',
		slashes: true
	}))
	setMainMenu();
	mainWindow.once('ready-to-show', () => {
		mainWindow.maximize();
		mainWindow.show()
	})
	mainWindow.on('closed', function () {
		mainWindow = null
	})
}

function get_folder_name(path) {
	var i = path.length;

	while (path[i] != '/') {
		i--;
	}
	i++;
	var test = [];
	while (i < path.length) {
		test.push(path[i]);
		i++;
	}
	path = test.toString().replace(/,/g, '');
	return (path);
}

//Project Handling Functions

function new_project() {
	var path = dialog.showOpenDialog({properties: ['openDirectory']});
	if (path == undefined) {
		return (84);
	} else {
		fs.writeFile(path[0] + "/"+ get_folder_name(path[0]) + ".engine", get_folder_name(path[0]), function(err) {
			if (err) throw err;
		})
		fs.mkdir(path[0] + "/data", function(err) {
			if (err) throw err;
			fs.writeFile(path[0] + "/data" + "/elements.engine", "[]", function (err) {
				if (err) throw err;
			})
			fs.writeFile(path[0] + "/data" + "/global.engine", `{
				"title": "Demo",
				"width": 800,
				"height": 600,
				"fps": 60,
				"cr": 0.1
			}`, function (err) {
				if (err) throw err;
			})
			fs.writeFile(path[0] + "/data" + "/screen.engine", "[]", function (err) {
				if (err) throw err;
			})
			fs.writeFile(path[0] + "/data" + "/sounds.engine", "[]", function (err) {
				if (err) throw err;
			})
		})
		fs.mkdir(path[0] + "/engine_src", function(err) {
			if (err) throw err;
		});
		fs.mkdir(path[0] + "/include", function(err) {
			if (err) throw err;
		});
		fs.mkdir(path[0] + "/ressources", function(err) {
			if (err) throw err;
		});
		project_path = path[0];
	}
}

function open_project() {
	var path = dialog.showOpenDialog({properties: ['openFile'], filters : [{name: 'Engine', extensions: ['engine']}]});
	if (path != undefined) {
		var data_path = path_.dirname(path[0]);
		if (fs.statSync(data_path + "/data/elements.engine")) {
			console.log("TAT");
		} else {
			return (84);
		}
		if (fs.statSync(data_path + "/data/global.engine")) {
			console.log("TAT");
		} else {
			return (84);
		}
		if (fs.statSync(data_path + "/data/screen.engine")) {
			console.log("TAT");
		} else {
			return (84);
		}
		if (fs.statSync(data_path + "/data/sounds.engine")) {
			console.log("TAT");
		} else {
			return (84);
		}
		project_path = data_path;
	} else {
		return (84);
	}
}

function open_image() {
	var path = dialog.showOpenDialog({properties: ['openFile'], defaultPath: project_path, filters : [{name: 'Image', extensions: ['png']}]});
	if (path != undefined) {
		sizeOf(path[0], function (err, dimensions) {
			mainWindow.webContents.send('image', path[0], dimensions.width, dimensions.height);
		});
	} else {
		mainWindow.webContents.send('image', '__canceled__');
	}
}

function open_sound() {
	var path = dialog.showOpenDialog({properties: ['openFile'], defaultPath: project_path, filters : [{name: 'Sound', extensions: ['wav', 'ogg']}]});
	if (path != undefined) {
		mainWindow.webContents.send('sound', path[0]);
	} else {
		mainWindow.webContents.send('sound', '__canceled__');
	}
}

ipcMain.on('open_image', (event, list) => {
	open_image();
});

ipcMain.on('open_sound', (event, list) => {
	open_sound();
});

ipcMain.on('new_project', (event, list) => {
	if (new_project() != 84) {
		event.sender.send('action_success');
	}
});
ipcMain.on('open_project', (event, list) => {
	if (open_project() != 84) {
		event.sender.send('action_success');
	}
});

//Communication Functions

ipcMain.on('save_elements', (event, list) => {
	var json_ = JSON.stringify(list);
	fs.writeFile(project_path + "/data/elements.engine", json_, function(err) {
		if (err) throw err;
	});
});

ipcMain.on('save_sound', (event, list) => {
	var json_ = JSON.stringify(list);
	fs.writeFile(project_path + "/data/sounds.engine", json_, function(err) {
		if (err) throw err;
	});
});

ipcMain.on('save_global', (event, global) => {
	var json_ = JSON.stringify(global);
	fs.writeFile(project_path + "/data/global.engine", json_, function(err) {
		if (err) throw err;
	});
});

ipcMain.on('save_screen', (event, screen) => {
	var json_ = JSON.stringify(screen);
	console.log("Screen Saved");
	console.log(json_);
	fs.writeFile(project_path + "/data/screen.engine", json_, function(err) {
		if (err) throw err;
	});
});

ipcMain.on('get_elements', (event) => {
	fs.readFile(project_path + "/data/elements.engine", function(err, data, buffer) {
		var json_= JSON.parse(data);
		event.sender.send('retreive_elements', json_);
	})	
})
ipcMain.on('get_global', (event) => {
	fs.readFile(project_path + "/data/global.engine", function(err, data, buffer) {
		var json_= JSON.parse(data);
		event.sender.send('retreive_array', json_);
	})
})
ipcMain.on('get_screen', (event) => {
	fs.readFile(project_path + "/data/screen.engine", function(err, data, buffer) {
		var json_= JSON.parse(data);
		event.sender.send('retreive_array', json_);
	})
})
ipcMain.on('get_sounds', (event) => {
	fs.readFile(project_path + "/data/sounds.engine", function(err, data, buffer) {
		var json_= JSON.parse(data);
		event.sender.send('retreive_array', json_);
	})
})
ipcMain.on('get_sounds_2', (event) => {
	fs.readFile(project_path + "/data/sounds.engine", function(err, data, buffer) {
		var json_= JSON.parse(data);
		event.sender.send('retreive_array_2', json_);
	})
})

ipcMain.on('save_screen', (event, screen) => {
	var json_ = JSON.stringify(screen);
	fs.writeFile(project_path + "/data/screen.engine", json_, function(err) {
		if (err) throw err;
	});
});

ipcMain.on('create_script', (event, script_name) => {
	var script_basic = 
`#include "engine.h"
//Do Not Change function prototype and return.
game_object *` + script_name + `(global *global, game_object *self)
{
	return (self);
}`
	fs.writeFile(project_path + "/engine_src/" + script_name + ".engine.c", script_basic, function(err) {
		if (err) throw err;
	});
});


ipcMain.on('create_script_screen', (event, script_name) => {
	console.log("Script created");
	var script_basic = 
`#include "engine.h"
//Do Not Change function prototype and return.
global *` + script_name + `(global *global)
{
	return (global);
}`
	fs.writeFile(project_path + "/engine_src/" + script_name + ".engine.c", script_basic, function(err) {
		if (err) throw err;
	});
});
//defaults vars

//Game building functions
function build_game() {
	//update_engine();
	build_header();
	build_objects();
	build_main();
	build_screen();
	build_screen_manager();
	build_screen_draw();
	build_analyse_event();
	build_engine_functions();
	create_makefile();

}

function build_header() {
	fs.readFile(project_path + "/data/elements.engine", function (err, data, buffer) {
		var elements = JSON.parse(data);
		var string =
`#include <stdlib.h>
#include <SFML/Graphics.h>
#include <SFML/System.h>
#include <SFML/Audio.h>
#include <stdio.h>
#include <string.h>

typedef struct game_object_t game_object;
typedef struct global_t global;
typedef game_object *(*onclick_func)(global *global, game_object *self);
typedef game_object *(*onframe_func)(global *global, game_object *self);
typedef game_object *(*onhover_func)(global *global, game_object *self);

typedef struct game_object_t {
	char *unique_id;
	char *path;
	char *tag;
	int screen_id;
	float width;
	float height;
	float original_width;
	float original_height;
	float x;
	float y;
	int visible;
	sfTexture *texture;
	sfSprite *sprite;
	onclick_func onclick;
	onframe_func onframe;
	onhover_func onhover;
	struct game_object_t *next;
	struct game_object_t *previous;
}game_object;

typedef struct sound_object_t {
	char *unique_id;
	char *path;
	char *tag;
	int screen_id;
	sfSound *sound;
	float volume;
	sfSoundBuffer *sound_buffer;
	struct sound_object_t *next;
	struct sound_object_t *previous;
}sound_object;

typedef struct global_t {
	int current_screen;
	float delta_time;
	sfRenderWindow *window;
	sfFont *font;
	struct game_object_t *head;
	struct sound_object_t *sound;
}global;
game_object *create_elements(void);
global *create_global(game_object *engine_elements, sound_object *sound_element);
void screen_manager(sfRenderWindow *window, global *game_global);
void engine_manage_mouse_click(sfMouseButtonEvent event, global *game_global);
void engine_change_screen_by_id(global *global, int id);
game_object *get_first(game_object *elements);
game_object *engine_find_one(game_object *game_elements, char *tag);
int engine_find_count(game_object *game_elements, char *tag);
game_object **engine_find(game_object *game_elements, char *tag);
game_object *engine_function_null(global *global, game_object *self);
game_object *engine_predraw(game_object *self);
void engine_garbage_collector(global *global);
sound_object *create_sound(void);
int engine_play_sound(global *global, char *tag);
int engine_pause_sound(global *global, char *tag);
void engine_manage_mouse_hover(sfMouseButtonEvent event, global *game_global);
int engine_collide(game_object *obj1, game_object *obj2);
void engine_exit(global *global);
`
		elements.forEach(element => {
			if (element.newframe_script.length != 0) {
				string += "game_object *" + element.newframe_script + "(global *global, game_object *self);\n"
			}
			if (element.onclick_script.length != 0) {
				string += "game_object *" + element.onclick_script + "(global *global, game_object *self);\n"
			}
			if (element.onhover_script.length != 0) {
				string += "game_object *" + element.onhover_script + "(global *global, game_object *self);\n"
			}
		});
		fs.readFile(project_path + "/data/screen.engine", function (err, screens, buffer) {
			screens = JSON.parse(screens);
			screens.forEach(screen => {
				string += "void " + screen.tag + "_analyse_event(sfRenderWindow *window, sfEvent event, global *game_global);\n"
				string += "global *" + screen.tag + "_draw(sfRenderWindow *window, global *game_global);\n";
				string += "void " + screen.tag + "(sfRenderWindow *window, global *game_global);\n";
				if (screen.onenter_script.length != 0) {
					string += "global *" + screen.onenter_script + "(global *global);\n"
				}
				if (screen.onframe_script.length != 0) {
					string += "global *" + screen.onframe_script + "(global *global);\n"
				}
			})
			fs.writeFile(project_path + "/include/engine.h", string, function(err) {
				if (err) throw err;
			})
		});
	});
}

function build_objects() {
	fs.readFile(project_path + "/data/elements.engine", function (err, data, buffer) {
		var elements = JSON.parse(data);
		var string = 
`#include "engine.h"
//engine Generated

global *create_global(game_object *engine_elements, sound_object *sound_element)
{
	global *new_global;

	new_global = (global*)malloc(sizeof(global));
	new_global->current_screen = 0;
	new_global->head = engine_elements;
	new_global->sound = sound_element;
	new_global->font = sfFont_createFromFile("./engine_ressources/arial.ttf");
	return (new_global);
}

game_object *create_elements(void)
{
	game_object *head = NULL;
	game_object *new_node;
`
		elements.forEach(element => {
			string += "\tnew_node = (game_object*)malloc(sizeof(game_object));\n";
			string += "\tnew_node->unique_id = strdup(\"" + element.unique_id + "\");\n";
			string += "\tnew_node->tag = strdup(\"" + element.tag + "\");\n"
			string += "\tnew_node->screen_id = " + element.screen_id + ";\n";
			string += "\tnew_node->width = " + element.width + ";\n";
			string += "\tnew_node->height = " + element.height + ";\n";
			string += "\tnew_node->original_width = " + element.original_width + ";\n";
			string += "\tnew_node->original_height = " + element.original_height + ";\n";
			string += "\tnew_node->x = " + element.x + ";\n";
			string += "\tnew_node->y = " + element.y + ";\n";
			string += "\tnew_node->visible = " + element.visible + ";\n";
			string += "\tnew_node->path = strdup(\"./ressources/" + get_folder_name(element.path) + "\");\n";
			string += "\tnew_node->sprite = sfSprite_create();\n";
			string += "\tnew_node->texture = sfTexture_createFromFile(new_node->path, NULL);\n"
			string += "\tsfSprite_setTexture(new_node->sprite, new_node->texture, sfTrue);\n";
			if (element.onclick_script.length != 0) {
				string += "\tnew_node->onclick = &" + element.onclick_script + ";\n"
			} else {
				string += "\tnew_node->onclick = &engine_function_null;\n";
			}
			if (element.newframe_script.length != 0) {
				string += "\tnew_node->onframe = &" + element.newframe_script + ";\n"
			} else {
				string += "\tnew_node->onframe = &engine_function_null;\n";
			}
			if (element.onhover_script.length != 0) {
				string += "\tnew_node->onhover = &" + element.onhover_script + ";\n"
			} else {
				string += "\tnew_node->onhover = &engine_function_null;\n";
			}
			string += "\tnew_node->next = head;\n";
			string += "\tnew_node->previous = NULL;\n";
			string += "\tif (head != NULL)\n\t\thead->previous = new_node;\n";
			string += "\thead = new_node;\n"
		});
		string += "\treturn (head);\n}";

		fs.readFile(project_path + "/data/sounds.engine", function (err, sounds, buffer) {
			sounds = JSON.parse(sounds);
			var sound_text =
`

sound_object *create_sound(void)
{
	sound_object *head = NULL;
	sound_object *new_node;

`
			sounds.forEach( sound => {
				sound_text += "\tnew_node = (sound_object*)malloc(sizeof(sound_object));\n";
				sound_text += "\tnew_node->unique_id = strdup(\"" + sound.unique_id + "\");\n";
				sound_text += "\tnew_node->tag = strdup(\"" + sound.tag + "\");\n"
				sound_text += "\tnew_node->screen_id = " + sound.screen_id + ";\n";
				sound_text += "\tnew_node->path = strdup(\"./ressources/" + get_folder_name(sound.path) + "\");\n";
				sound_text += "\tnew_node->sound = sfSound_create();\n";
				sound_text += "\tnew_node->sound_buffer = sfSoundBuffer_createFromFile(new_node->path);\n"
				sound_text += "\tnew_node->volume = " + sound.volume + ";\n";
				sound_text += "\tnew_node->next = head;\n";
				sound_text += "\tnew_node->previous = NULL;\n";
				sound_text += "\tif (head != NULL)\n\t\thead->previous = new_node;\n";
				sound_text += "\thead = new_node;\n"
			})
			sound_text += "\treturn (head);\n}";
			string += sound_text;
			fs.writeFile(project_path + "/engine_src/elements.c", string, function(err) {
				if (err) throw err;
			})
		})
		
	});

}

function build_main() {
	fs.readFile(project_path + "/data/global.engine", function(err, data, buffer) {
		var global = JSON.parse(data);
		var string =
`
#include "engine.h"

`;

string += `
int main(void)
{
	sfVideoMode mode = {` + global.width + `, ` + global.height + `, 32};
	sfRenderWindow* window;
	game_object *engine_elements = create_elements();
	sound_object *sound_elements = create_sound();
	global *game_global = create_global(engine_elements, sound_elements);

	window = sfRenderWindow_create(mode, "` + global.title + `", sfResize | sfClose, NULL);
	game_global->window = window;
	sfRenderWindow_setFramerateLimit(window, ` + global.fps + `);
	while (sfRenderWindow_isOpen(window)) {
		screen_manager(window, game_global);
	}
	sfRenderWindow_destroy(window);
	engine_garbage_collector(game_global);
	return (1);
}
`
		fs.writeFile(project_path + "/engine_src/" + "main.c", string, function (err) {
			if (err) throw err;
		})
	})
}

function build_screen() {
	fs.readFile(project_path + "/data/global.engine", function (err, data, buffer) {
		var global = JSON.parse(data);
		fs.readFile(project_path + "/data/screen.engine", function(err, data, buffer) {
		var screens = JSON.parse(data);
		screens.forEach(screen => {
			var string = "#include \"engine.h\"\n\n";
			string += "void " + screen.tag + "(sfRenderWindow *window, global *game_global)";
			string +=
`{
	sfEvent event;
	sfClock *clock = sfClock_create();
	float seconds = 0.0;`
	if (screen.onenter_script.length != 0) {
		string += "\t" + screen.onenter_script + "(game_global);\n";
	}
string += `
	while (game_global->current_screen == ` + screen.screen_id + `)
	{
		seconds = sfClock_getElapsedTime(clock).microseconds/1000000.0;
		if (seconds > ` + global.cr + `) {
			game_global->delta_time = seconds;
			sfRenderWindow_clear(window, sfBlack);
			` + screen.tag + `_analyse_event(window, event, game_global);
			` + screen.tag + `_draw(window, game_global);
			sfRenderWindow_display(window);
			sfClock_restart(clock);
		}
	}
}
`
			fs.writeFile(project_path + "/engine_src/" + screen.tag + ".engine.c", string, function (err) {
				if (err) throw err;
			})
		});
	});})
}

function build_screen_manager() {
	fs.readFile(project_path + "/data/screen.engine", function(err, data, buffer) {
		var screens = JSON.parse(data);
	
		var string = "#include \"engine.h\"\n";
		string += "void screen_manager(sfRenderWindow *window, global *game_global)\n{\n";
		screens.forEach(element => {
			string += "\tif (game_global->current_screen == " + element.screen_id +") {\n\t\t" + element.tag + "(window, game_global);\n\t}\n";
		});
		string += "}\n";
		fs.writeFile(project_path + "/engine_src/screen_manager.engine.c", string, function (err) {
			if (err) throw err;
		})
	});
}

function build_screen_draw() {
	fs.readFile(project_path + "/data/screen.engine", function(err, data, buffer) {
		var screens = JSON.parse(data);
		screens.forEach(element => {
			var string = "";
			string += "#include \"engine.h\"\n";
			string += "\nglobal *" + element.tag + "_draw(sfRenderWindow *window, global *game_global)\n{\n"
			if (element.onframe_script.length != 0) {
				string += "\t" + element.onframe_script + "(game_global);\n";
			}
			string += "\tgame_object *game_elements = game_global->head;\n";
			string += "\twhile (game_elements) {\n";
			string += "\t\tgame_elements->onframe(game_global, game_elements);\n";
			string += "\t\tengine_predraw(game_elements);\n";
			string += "\t\tif (game_elements->visible == 1 && game_global->current_screen == game_elements->screen_id)\n"
			string += "\t\t\tsfRenderWindow_drawSprite(window, game_elements->sprite, NULL);\n"
			string += "\t\tgame_elements = game_elements->next;\n";
			string += "\t}\n";
			string += "\treturn (game_global);\n}";
			fs.writeFile(project_path + "/engine_src/" + element.tag + "_draw.engine.c", string, function (err) {
				if (err) throw err;
			})
		});
	});
}

function build_analyse_event() {
	fs.readFile(project_path + "/data/screen.engine", function(err, data, buffer) {
		var screens = JSON.parse(data);
		screens.forEach(element => {
			var analyse_event_main =
`#include "engine.h"

void ` + element.tag + `_analyse_event(sfRenderWindow *window, sfEvent event, global *game_global)
{
	while (sfRenderWindow_pollEvent(window, &event)) {
		engine_manage_mouse_hover(event.mouseButton, game_global);
		if (event.type == sfEvtMouseButtonPressed) {
			engine_manage_mouse_click(event.mouseButton, game_global);
		}
		if (event.type == sfEvtClosed) {
			game_global->current_screen = -1;
			sfRenderWindow_close(window);
		}
	}
}
`;
			fs.writeFile(project_path + "/engine_src/" + element.tag + "_analyse_event.engine.c", analyse_event_main, function (err) {
				if (err) throw err;
			})
		})
	})
}

function build_engine_functions()
{
	fs_extra.copy('./engine_functions', project_path + "/engine_functions", function (err) {
		if (err) {
			if (err) throw err;
		} else {
			fs_extra.copy('./engine_ressources', project_path + "/engine_ressources", function (err) {
				if (err) throw err;
			})
		}
	});
}

function create_makefile()
{
	var makefile =
`#CSFML_Engine Makefile -- ImOverlord

NAME	=	game

INCLUDE	=	include

SRC	=	./engine_functions/*.c	\
		./engine_src/*.c

TEST_SRC=	

OBJ	=	$(SRC:.c=.o)

TEST_OBJ=	$(TEST_SRC:.c=.o)

CFLAGS	=	-Wall -pedantic -I./include -lc_graph_prog

OFLAGS	=	-Wall -pedantic -I./include

TFLAGS	=	-Wall -pedantic -I./include --criterion

all:		$(NAME)

$(NAME):	
		gcc $(CFLAGS) $(SRC) -c
		gcc $(CFLAGS) *.o -o $(NAME) 

clean:	
		rm -f $(OBJ)
		rm -f *.o

fclean:		clean
		rm -f $(NAME)

re:		fclean all

run:		fclean all
		make clean
		./$(NAME)
`
	fs.writeFile(project_path + "/Makefile", makefile, function (err) {
		if (err) throw err;
	})
}
app.on('ready', createWindow)

app.on('window-all-closed', app.quit);
app.on('before-quit', () => {
	mainWindow.removeAllListeners('close');
	mainWindow.close();
});
