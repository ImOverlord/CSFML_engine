/*
** EPITECH PROJECT, 2018
** game_event.c
** File description:
** function for handling game events
*/

#include "engine.h"

void engine_exit(global *global)
{
	sfRenderWindow_close(global->window);
	global->current_screen = -1;
}