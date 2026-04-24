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
      title: 'title',
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

    defineField({
      name: 'imagePosition',
      title: "Position de l'image (haut / bas)",
      type: 'string',
      options: {
        list: [
          { title: 'En haut', value: 'image-top' },
          { tile: 'En bas', value: 'image-bot' },
        ],
      },
      initialValue: 'image-top',
    }),
    defineField({
      name: 'extras',
      title: 'Extras (audio, YouTube, fichier)',
      type: 'array',
      of: [
        {
          type: 'object',
          title: 'Élément',
          fields: [
            {
              name: 'type',
              title: 'Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Audio', value: 'audio' },
                  { title: 'Lien YouTube', value: 'youtube' },
                  { title: 'Fichier', value: 'file' },
                ],
              },
              validation: Rule => Rule.required(),
            },
            {
              name: 'audio',
              title: 'Fichier audio',
              type: 'file',
              options: { accept: 'audio/*' },
              hidden: ({ parent }) => parent?.type !== 'audio',
            },
            {
              name: 'youtube',
              title: 'Lien YouTube',
              type: 'url',
              hidden: ({ parent }) => parent?.type !== 'youtube',
            },
            {
              name: 'file',
              title: 'Fichier',
              type: 'file',
              hidden: ({ parent }) => parent?.type !== 'file',
            },
          ],
        },
      ],
      description:
        'Ajoutez un ou plusieurs éléments : audio, lien YouTube ou fichier.',
    }),
    defineField({
      name: 'extrasPosition',
      title: 'Position des extras',
      type: 'string',
      options: {
        list: [
          { title: 'Début du post', value: 'start' },
          { title: 'Fin du post', value: 'end' },
        ],
      },
      initialValue: 'end',
      description: 'Choisissez où afficher les extras dans le post.',
    }),
  ],
});
