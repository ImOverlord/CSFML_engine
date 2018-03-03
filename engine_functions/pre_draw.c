/*
** EPITECH PROJECT, 2018
** function_null.c
** File description:
** null callback function
*/

#include "engine.h"

game_object *engine_predraw(game_object *self)
{
	sfVector2f position = {self->x, self->y};
	sfVector2f scale = {self->width / self->original_width,
	self->height / self->original_height};

	sfSprite_setTexture(self->sprite, self->texture, sfTrue);
	sfSprite_setPosition(self->sprite, position);
	sfSprite_setScale(self->sprite, scale);
	return (self);
}