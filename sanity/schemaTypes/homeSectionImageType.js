import { defineField, defineType } from 'sanity';

export const homeSectionImageType = defineType({
  name: 'homeSectionImage',
  title: 'Home Section Image',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Texte alternatif',
      type: 'object',
      fields: [
        {
          name: 'fr',
          title: 'Français',
          type: 'string',
          validation: Rule => Rule.required(),
        },
        {
          name: 'en',
          title: 'Anglais',
          type: 'string',
          validation: Rule => Rule.required(),
        },
        {
          name: 'de',
          title: 'Allemand',
          type: 'string',
          validation: Rule => Rule.required(),
        },
      ],
    }),
    defineField({
      name: 'order',
      title: "Ordre d'affichage",
      type: 'number',
      description: 'Numéro pour définir la position (1, 2, 3, ...)',
      validation: Rule => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'alt.fr',
      media: 'image',
    },
    prepare({ title, media }) {
      return {
        title: title || 'Home image',
        media,
      };
    },
  },
  orderings: [
    {
      title: "Ordre d'affichage",
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
});
