/*
** EPITECH PROJECT, 2018
** garbage.c
** File description:
** function to clean up game
*/

#include "engine.h"

void engine_garbage_sound(global *global)
{
	sound_object *snd = global->sound;

	while (snd) {
		sfSoundBuffer_destroy(snd->sound_buffer);
		sfSound_destroy(snd->sound);
		free(snd->tag);
		free(snd->unique_id);
		snd = snd->next;
		if (snd != NULL)
			free(snd->previous);
	}
}
void engine_garbage_collector(global *global)
{
	game_object *obj = global->head;

	while (obj) {
		sfTexture_destroy(obj->texture);
		sfSprite_destroy(obj->sprite);
		free(obj->tag);
		free(obj->unique_id);
		obj = obj->next;
		if (obj != NULL)
			free(obj->previous);
	}
	engine_garbage_sound(global);
}

