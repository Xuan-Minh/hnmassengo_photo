import { defineField, defineType } from 'sanity';

export const homeBioType = defineType({
  name: 'homeBio',
  title: 'Home - Bio',
  type: 'document',
  preview: {
    select: {
      title: 'title.fr',
      subtitle: 'bio.fr',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Home bio',
        subtitle: subtitle || 'Bio complete',
      };
    },
  },
  fields: [
    defineField({
      name: 'title',
      title: 'Titre (optionnel)',
      description: 'Laisser vide pour ne pas afficher de titre dans la home.',
      type: 'object',
      fields: [
        {
          name: 'fr',
          title: 'Francais',
          type: 'string',
        },
        {
          name: 'en',
          title: 'English',
          type: 'string',
        },
        {
          name: 'de',
          title: 'Deutsch',
          type: 'string',
        },
      ],
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'object',
      fields: [
        {
          name: 'fr',
          title: 'Francais',
          type: 'text',
          rows: 18,
          validation: Rule => Rule.required(),
        },
        {
          name: 'en',
          title: 'English',
          type: 'text',
          rows: 18,
          validation: Rule => Rule.required(),
        },
        {
          name: 'de',
          title: 'Deutsch',
          type: 'text',
          rows: 18,
          validation: Rule => Rule.required(),
        },
      ],
      validation: Rule => Rule.required(),
    }),
  ],
});
