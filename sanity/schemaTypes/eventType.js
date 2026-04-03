import { defineField, defineType } from 'sanity';

export const eventType = defineType({
  name: 'blogPost',
  title: 'Article de Blog',
  type: 'document',
  orderings: [
    {
      title: 'Date (Plus récent)',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
    {
      title: 'Date (Plus ancien)',
      name: 'dateAsc',
      by: [{ field: 'date', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title.fr',
      subtitle: 'date',
      media: 'image',
    },
    prepare(selection) {
      const { title, subtitle, media } = selection;
      return {
        title: title || 'Sans titre',
        subtitle: subtitle
          ? new Date(subtitle).toLocaleDateString('fr-FR')
          : 'Date non définie',
        media,
      };
    },
  },
  fields: [
    defineField({
      name: 'title',
      title: 'Title (EN)',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'Titre (unique en anglais)',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: Rule => Rule.required(),
      description: 'Date du jour automatiquement à la création',
    }),
    defineField({
      name: 'texte',
      title: 'Texte',
      type: 'object',
      fields: [
        {
          name: 'fr',
          title: 'Français',
          type: 'text',
          rows: 6,
          validation: Rule => Rule.required(),
        },
        {
          name: 'en',
          title: 'Anglais',
          type: 'text',
          rows: 6,
          validation: Rule => Rule.required(),
        },
        {
          name: 'de',
          title: 'Allemand',
          type: 'text',
          rows: 6,
          validation: Rule => Rule.required(),
        },
      ],
      validation: Rule => Rule.required(),
      description:
        "Texte affiché dans le home (tronqué automatiquement) et en entier dans l'article.",
    }),
    defineField({
      name: 'image',
      title: 'Image',
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
    }),
    defineField({
      name: 'layout',
      title: 'Disposition',
      type: 'string',
      options: {
        list: [
          { title: 'Image à Gauche', value: 'image-left' },
          { title: 'Image à Droite', value: 'image-right' },
          { title: 'Texte Seulement', value: 'text-only' },
        ],
      },
      initialValue: 'image-left',
    }),
  ],
});
