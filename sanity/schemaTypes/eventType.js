import { defineField, defineType } from 'sanity';

export const eventType = defineType({
  name: 'blogPost',
  title: 'Article de Blog',
  type: 'document',
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
        subtitle: subtitle ? new Date(subtitle).toLocaleDateString('fr-FR') : 'Date non définie',
        media,
      };
    },
  },
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
      name: 'date',
      title: 'Date',
      type: 'datetime',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Extrait (court)',
      type: 'object',
      fields: [
        {
          name: 'fr',
          title: 'Français',
          type: 'text',
          rows: 3,
          validation: Rule => Rule.required(),
        },
        {
          name: 'en',
          title: 'Anglais',
          type: 'text',
          rows: 3,
          validation: Rule => Rule.required(),
        },
        {
          name: 'de',
          title: 'Allemand',
          type: 'text',
          rows: 3,
          validation: Rule => Rule.required(),
        },
      ],
      validation: Rule => Rule.required(),
      description: "Texte court affiché dans les listes d'articles",
    }),
    defineField({
      name: 'content',
      title: 'Contenu Court (obsolète - utiliser Excerpt)',
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
      name: 'fullContent',
      title: 'Contenu Complet',
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
      name: 'category',
      title: 'Catégorie',
      type: 'string',
      options: {
        list: [
          { title: 'Actualités', value: 'news' },
          { title: 'Technique', value: 'technique' },
          { title: 'Derrière les scènes', value: 'behind-scenes' },
          { title: 'Expositions', value: 'exhibitions' },
          { title: 'Autre', value: 'other' },
        ],
      },
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
