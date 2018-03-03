/*
** EPITECH PROJECT, 2018
** change_screen.c
** File description:
** function to change screen
*/

#include "engine.h"

void engine_change_screen_by_id(global *global, int id)
{
	global->current_screen = id;
}