import { defineField, defineType } from 'sanity';

export const loadingImageType = defineType({
  name: 'loadingImagesDesktop',
  title: 'Images de Chargement - DESKTOP',
  type: 'document',
  fields: [
    defineField({
      name: 'imagesList',
      title: 'Liste des images Desktop',
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
        title: 'Images de Chargement - DESKTOP',
      };
    },
  },
});
