/*
** EPITECH PROJECT, 2018
** text.c
** File description:
** functions to print text
*/

#include "engine.h"

void engine_create_text(global *global, char *text, int info[3], sfColor color)
{
	sfText *engine_text;
	sfVector2f position = {info[0], info[1]};

	engine_text = sfText_create();
	sfText_setFont(engine_text, global->font);
	sfText_setString(engine_text, text);
	sfText_setCharacterSize(engine_text, info[2]);
	sfText_setPosition(engine_text, position);
	sfText_setColor(engine_text, color);
	sfRenderWindow_drawText(global->window, engine_text, NULL);
	sfText_destroy(engine_text);
}