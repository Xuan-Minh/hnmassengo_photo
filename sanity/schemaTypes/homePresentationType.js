import { defineField, defineType } from 'sanity';

export const homePresentationType = defineType({
  name: 'homePresentation',
  title: 'Home - Présentation',
  type: 'document',
  preview: {
    select: {
      title: 'line1.fr',
      subtitle: 'line2.fr',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Présentation home',
        subtitle: subtitle || 'Configurer les lignes FR/EN/DE',
      };
    },
  },
  fields: [
    defineField({
      name: 'line1',
      title: 'Paragraphe 1',
      type: 'object',
      fields: [
        {
          name: 'fr',
          title: 'Français',
          type: 'text',
          rows: 4,
          validation: Rule => Rule.required(),
        },
        {
          name: 'en',
          title: 'Anglais',
          type: 'text',
          rows: 4,
          validation: Rule => Rule.required(),
        },
        {
          name: 'de',
          title: 'Allemand',
          type: 'text',
          rows: 4,
          validation: Rule => Rule.required(),
        },
      ],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'line2',
      title: 'Paragraphe 2',
      type: 'object',
      fields: [
        {
          name: 'fr',
          title: 'Français',
          type: 'text',
          rows: 4,
          validation: Rule => Rule.required(),
        },
        {
          name: 'en',
          title: 'Anglais',
          type: 'text',
          rows: 4,
          validation: Rule => Rule.required(),
        },
        {
          name: 'de',
          title: 'Allemand',
          type: 'text',
          rows: 4,
          validation: Rule => Rule.required(),
        },
      ],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'line3',
      title: 'Paragraphe 3',
      type: 'object',
      fields: [
        {
          name: 'fr',
          title: 'Français',
          type: 'text',
          rows: 4,
          validation: Rule => Rule.required(),
        },
        {
          name: 'en',
          title: 'Anglais',
          type: 'text',
          rows: 4,
          validation: Rule => Rule.required(),
        },
        {
          name: 'de',
          title: 'Allemand',
          type: 'text',
          rows: 4,
          validation: Rule => Rule.required(),
        },
      ],
      validation: Rule => Rule.required(),
    }),
  ],
});
