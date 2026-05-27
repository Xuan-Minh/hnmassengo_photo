export default {
  name: 'windowCustom',
  title: 'Fenêtre Personnalisée',
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
        },
        {
          name: 'en',
          title: 'Anglais',
          type: 'string',
        },
        {
          name: 'de',
          title: 'Allemand',
          type: 'string',
        },
      ],
    },
    {
      name: 'content',
      title: 'Contenu',
      type: 'array',
      of: [{ type: 'block' }],
    },
  ],
};
