import { defineField, defineType } from 'sanity';

export const projectType = defineType({
  name: 'project',
  title: 'Projet Galerie',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nom du Projet',
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
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Type de Projet',
      type: 'string',
      options: {
        list: [
          { title: 'Artwork', value: 'artwork' },
          { title: 'Commission', value: 'commission' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Texte alternatif',
              type: 'object',
              fields: [
                { name: 'fr', title: 'Français', type: 'string' },
                { name: 'en', title: 'Anglais', type: 'string' },
                { name: 'de', title: 'Allemand', type: 'string' },
              ],
            }),
          ],
        },
      ],
      validation: Rule => Rule.required().min(1),
    }),
    defineField({
      name: 'coords',
      title: 'Coordonnées Géographiques',
      type: 'string',
      description: 'Ex: 48.3705° N, 10.8978° E',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'object',
      fields: [
        {
          name: 'fr',
          title: 'Français',
          type: 'text',
          validation: Rule => Rule.required(),
        },
        {
          name: 'en',
          title: 'Anglais',
          type: 'text',
          validation: Rule => Rule.required(),
        },
        {
          name: 'de',
          title: 'Allemand',
          type: 'text',
          validation: Rule => Rule.required(),
        },
      ],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date (optionnel)',
      type: 'datetime',
    }),
  ],
});
