import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'shopItem',
  title: 'Article du Shop',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
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
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title.fr', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'object',
      fields: [
        { name: 'fr', title: 'Français', type: 'text' },
        { name: 'en', title: 'Anglais', type: 'text' },
        { name: 'de', title: 'Allemand', type: 'text' },
      ],
    }),
    defineField({
      name: 'price',
      title: 'Prix (€)',
      type: 'number',
      validation: Rule => Rule.required().min(0),
    }),
    defineField({
      name: 'image',
      title: 'Image Principale',
      type: 'image',
      options: { hotspot: true },
      validation: Rule => Rule.required(),
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
    }),
    defineField({
      name: 'imgHover',
      title: 'Image au Hover',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'formats',
      title: 'Formats Disponibles',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Liste des formats (e.g., A4, A3, A2)',
    }),
    defineField({
      name: 'available',
      title: 'Disponible',
      type: 'boolean',
      initialValue: true,
    }),
  ],
});
