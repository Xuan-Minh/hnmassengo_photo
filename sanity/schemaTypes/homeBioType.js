import { defineField, defineType } from 'sanity';

export const homeBioType = defineType({
  name: 'homeBio',
  title: 'Home - Bio',
  type: 'document',
  preview: {
    select: {
      title: 'bio.fr',
    },
    prepare({ title }) {
      return {
        title: title || 'Home bio',
      };
    },
  },
  fields: [
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
