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
      name: 'windowColor',
      title: 'Couleur de la fenêtre',
      type: 'reference',
      to: [{ type: 'teamColor' }],
      validation: Rule =>
        Rule.required().error('Vous devez choisir une couleur.'),
    },
    {
      name: 'content',
      title: 'Contenu',
      type: 'array',
      of: [{ type: 'block' }],
    },
  ],
  preview: {
    select: {
      title: 'title.fr',
    },
    prepare(selection) {
      const { title } = selection;
      return {
        title: title || 'Fenêtre Personnalisée',
      };
    },
  },
};
