export default {
  name: 'windowText',
  title: 'Fenêtre Texte de présentation',
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
      name: 'windowColor',
      title: 'Couleur de la fenêtre',
      type: 'reference',
      to: [{ type: 'teamColor' }],
      validation: Rule =>
        Rule.required().error('Vous devez choisir une couleur.'),
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
      preview: {
        select: {
          title: 'content.fr',
        },
        prepare(selection) {
          const { title } = selection;
          return {
            title: title.fr || 'Fenêtre Texte',
          };
        },
      },
    },
  ],
};
