/*
** EPITECH PROJECT, 2018
** sound.c
** File description:
** function to control sound
*/

#include "engine.h"

int engine_play_sound(global *global, char *tag)
{
	sound_object *head = global->sound;

	while (head) {
		if (strcmp(head->tag, tag) == 0) {
			sfSound_setBuffer(head->sound, head->sound_buffer);
			sfSound_setVolume(head->sound, head->volume);
			sfSound_play(head->sound);
			return (1);
		}
		head = head->next;
	}
	return (0);
}

int engine_pause_sound(global *global, char *tag)
{
	sound_object *head = global->sound;

	while (head) {
		if (strcmp(head->tag, tag) == 0 && head->sound != NULL) {
			sfSound_pause(head->sound);
			return (1);
		}
		head = head->next;
	}
	return (0);
}

int engine_volume_sound(global *global, char *tag, float volume)
{
	sound_object *head = global->sound;

	if (volume > 100 || volume < 0)
		return (0);
	while (head) {
		if (strcmp(head->tag, tag) == 0) {
			sfSound_setVolume(head->sound, volume);
			return (1);
		}
		head = head->next;
	}
	return (0);
}

int engine_loop_sound(global *global, char *tag, int loop)
{
	sound_object *head = global->sound;

	if (loop != 0 && loop != 1)
		return (0);
	while (head) {
		if (strcmp(head->tag, tag) == 0) {
			sfSound_setLoop(head->sound, (loop==1)?sfTrue:sfFalse);
			return (1);
		}
		head = head->next;
	}
	return (0);
}