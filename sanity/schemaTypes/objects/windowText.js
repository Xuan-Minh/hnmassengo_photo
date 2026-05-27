export default {
  name: 'windowText',
  title: 'Onglet Texte',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Titre de la fenêtre',
      type: 'object',
      fields: [
        {
          name: 'fr',
          title: 'Français',
          type: 'string',
          initialValue: 'Présentation',
        },
        {
          name: 'en',
          title: 'Anglais',
          type: 'string',
          initialValue: 'Introduction',
        },
        {
          name: 'de',
          title: 'Allemand',
          type: 'string',
          initialValue: 'Einführung',
        },
      ],
    },
    {
      name: 'content',
      title: 'Contenu texte',
      type: 'object',
      fields: [
        {
          name: 'fr',
          title: 'Français',
          type: 'array',
          of: [{ type: 'block' }],
        },
        {
          name: 'en',
          title: 'Anglais',
          type: 'array',
          of: [{ type: 'block' }],
        },
        {
          name: 'de',
          title: 'Allemand',
          type: 'array',
          of: [{ type: 'block' }],
        },
      ],
    },
  ],
};
