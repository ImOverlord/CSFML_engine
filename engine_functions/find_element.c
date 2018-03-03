/*
** EPITECH PROJECT, 2018
** find_element.c
** File description:
** function to find element
*/

#include "engine.h"

game_object *get_first(game_object *elements)
{
	game_object *head = elements;
	while (head->previous != NULL)
	{
		head = head->previous;
	}
	return (head);
}

game_object *engine_find_one(game_object *game_elements, char *tag)
{
	game_object *head = get_first(game_elements);

	while (head) {
		if (strcmp(head->tag, tag) == 0) {
			return (head);
		}
		head = head->next;
	}
	return (NULL);
}

int engine_find_count(game_object *game_elements, char *tag)
{
	game_object *head = get_first(game_elements);
	int count = 0;

	while (head) {
		if (strcmp(head->tag, tag) == 0) {
			count++;
		}
		head = head->next;
	}
	return (count);
}

game_object **engine_find(game_object *game_elements, char *tag)
{
	int count = engine_find_count(game_elements, tag);
	int i = 0;
	game_object *head = get_first(game_elements);
	game_object **tab = malloc(count * sizeof(game_elements));

	while (head) {
		if (strcmp(head->tag, tag) == 0) {
			tab[i] =  head;
			i++;
		}
		head = head->next;
	}
	return (tab);
}