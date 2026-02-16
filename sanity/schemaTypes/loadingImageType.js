import { defineField, defineType } from 'sanity';

export const loadingImageType = defineType({
  name: 'loadingImage',
  title: 'Image de Chargement',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true, // Permet de définir le point focal
      },
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
      description:
        "Numéro pour définir l'ordre (1 = première, 2 = deuxième, etc.)",
      validation: Rule => Rule.required().min(1),
    }),
    defineField({
      name: 'portraitOnly',
      title: 'Affichage mobile uniquement',
      type: 'boolean',
      description:
        'Si activé, cette image sera affichée SEULEMENT sur mobile (format portrait). Sur desktop, elle sera cachée.',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'alt.fr',
      media: 'image',
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
