import { defineField, defineType } from 'sanity';

export const projectType = defineType({
  name: 'project',
  title: 'Projet Galerie',
  type: 'document',
  preview: {
    select: {
      title: 'name.fr',
      subtitle: 'type',
      media: 'images.0',
    },
    prepare(selection) {
      const { title, subtitle, media } = selection;
      return {
        title: title || 'Sans titre',
        subtitle:
          subtitle === 'artwork'
            ? 'Artwork'
            : subtitle === 'commission'
              ? 'Commission'
              : subtitle,
        media,
      };
    },
  },
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
      description: 'Catégorie principale du projet photographique',
      type: 'string',
      options: {
        list: [
          { title: 'Artwork - Œuvre Artistique', value: 'artwork' },
          { title: 'Commission - Projet sur Mesure', value: 'commission' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'images',
      title: 'Images du Projet',
      description: "Galerie d'images du projet (minimum 1 image requise)",
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Texte Alternatif (SEO)',
              description:
                "Description de l'image pour l'accessibilité et le SEO",
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
      description:
        'Lieu de prise de vue (optionnel) - Format: latitude, longitude',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description du Projet',
      description: 'Description détaillée du projet photographique',
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
      title: 'Date de Réalisation',
      description:
        'Date de prise de vue ou de réalisation du projet (optionnel)',
      type: 'datetime',
    }),
  ],
});
