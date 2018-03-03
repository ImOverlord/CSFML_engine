/*
** EPITECH PROJECT, 2018
** sprite.c
** File description:
** functions for handling sprites
*/

#include "engine.h"

int engine_invisible_sprite(global *global, char *tag, int bool)
{
	game_object *head = global->head;

	if (bool != 0 && bool != 1)
		return (1);
	while (head) {
		if (strcmp(head->tag, tag) == 0) {
			head->visible = bool;
		}
		head = head->next;
	}
	return (0);
}