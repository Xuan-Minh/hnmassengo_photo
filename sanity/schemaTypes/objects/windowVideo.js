export default {
  name: 'windowVideo',
  title: 'Fenêtre Video',
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
      title: 'Contenu de la fenêtre (URL de la vidéo)',
      type: 'url',
      validation: Rule =>
        Rule.uri({
          scheme: ['http', 'https'],
        }).error(
          'Veuillez entrer une URL valide commençant par http:// ou https://'
        ),
    },
  ],
  preview: {
    select: {
      title: 'title.fr',
    },
    prepare(selection) {
      const { title } = selection;
      return {
        title: title || 'Fenêtre Video',
      };
    },
  },
};
