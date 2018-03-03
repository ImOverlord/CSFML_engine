/*
** EPITECH PROJECT, 2018
** collision.c
** File description:
** functions for collisions
*/

#include "engine.h"

int engine_collide(game_object *obj1, game_object *obj2)
{
	if (obj1->x < obj2->x + obj2->width &&
	obj1->x + obj1->width > obj2->x &&
	obj1->y < obj2->y + obj2->height &&
	obj1->y + obj1->height > obj2->y) {
		return (1);
	}
	return (0);
}