import { defineField, defineType } from 'sanity';

export const loadingImageMobileType = defineType({
  name: 'loadingImagesMobile',
  title: 'Images de Chargement - MOBILE',
  type: 'document',
  fields: [
    defineField({
      name: 'imagesList',
      title: 'Liste des images Mobile',
      type: 'array',
      options: {
        layout: 'grid',
      },
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
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
            },
          ],
          // Ça, c'est le preview pour chaque petite image DANS la grille
          preview: {
            select: {
              title: 'alt.fr',
              media: 'asset',
            },
            prepare(selection) {
              const { title, media } = selection;
              return {
                title: title || 'Image sans texte alternatif',
                media: media,
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Images de Chargement - MOBILE',
      };
    },
  },
});
