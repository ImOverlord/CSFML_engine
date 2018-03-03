/*
** EPITECH PROJECT, 2018
** click_event.c
** File description:
** function to handle click events
*/

#include "engine.h"

void engine_mouse_click(sfMouseButtonEvent event, global *game_global)
{
	game_object *engine_elements = game_global->head;

	while (engine_elements) {
		if (event.x >= engine_elements->x &&
		event.x <= engine_elements->x + engine_elements->width &&
		event.y >= engine_elements->y &&
		event.y <= engine_elements->y + engine_elements->height &&
		engine_elements->screen_id == game_global->current_screen &&
		engine_elements->visible == 1) {
			engine_elements = engine_elements->onclick(game_global,
			engine_elements);
			break;
		}
		engine_elements = engine_elements->next;
	}
}

void engine_manage_mouse_click(sfMouseButtonEvent event, global *game_global)
{
	if (event.button == sfMouseLeft) {
		engine_mouse_click(event, game_global);
	}
}

void engine_manage_mouse_hover(sfMouseButtonEvent event, global *game_global)
{
	game_object *engine_elements = game_global->head;
	sfVector2i mouse =
	sfMouse_getPositionRenderWindow(game_global->window);

	while (engine_elements) {
		if (mouse.x >= engine_elements->x &&
		mouse.x <= engine_elements->x + engine_elements->width &&
		mouse.y >= engine_elements->y &&
		mouse.y <= engine_elements->y + engine_elements->height &&
		engine_elements->screen_id == game_global->current_screen &&
		engine_elements->visible == 1) {
			engine_elements=engine_elements->onhover(game_global,
			engine_elements);
			break;
		}
		engine_elements = engine_elements->next;
	}
}