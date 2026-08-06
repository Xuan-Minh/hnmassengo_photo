import { defineField, defineType } from 'sanity';
import {
  orderRankField,
  orderRankOrdering,
} from '@sanity/orderable-document-list';

export const loadingImageMobileType = defineType({
  name: 'loadingImageMobile',
  title: 'Image de Chargement - MOBILE',
  type: 'document',
  orderings: [orderRankOrdering], // On active le tri du plugin
  fields: [
    // Le nouveau champ caché pour le drag & drop
    orderRankField({ type: 'loadingImageMobile' }),

    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
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
    // L'ancien champ conservé temporairement
    defineField({
      name: 'order',
      title: "ANCIEN Ordre d'affichage (À SUPPRIMER BIENTÔT)",
      type: 'number',
      description: 'Sert uniquement de repère pour le drag & drop',
    }),
  ],
  preview: {
    select: {
      title: 'alt.fr',
      order: 'order', // On sélectionne l'ancien numéro
      media: 'image',
    },
    prepare(selection) {
      const { title, order, media } = selection;
      // On affiche l'ancien numéro directement dans le titre de la liste
      return {
        title: `[Ancien n° ${order || '?'}] ${title || 'Sans titre'}`,
        media: media,
      };
    },
  },
});
