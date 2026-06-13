export default {
  name: 'windowImage',
  title: 'Fenêtre Image',
  type: 'object',
  fields: [
    {
      name: 'photo',
      type: 'image',
      options: {
        hotspot: true, // Permet de définir le point focal
      },
    },
    {
      name: 'title',
      title: 'Titre de la fenêtre',
      type: 'object',
      fields: [
        {
          name: 'fr',
          title: 'Français',
          type: 'string',
          initialValue: 'À propos de moi',
        },
        {
          name: 'en',
          title: 'Anglais',
          type: 'string',
          initialValue: 'About me',
        },
        {
          name: 'de',
          title: 'Allemand',
          type: 'string',
          initialValue: 'Über mich',
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
      name: 'windowSize',
      title: 'Taille de la fenêtre',
      type: 'string',
      options: {
        list: [
          { title: 'Petite', value: 'small' },
          { title: 'Moyenne', value: 'medium' },
          { title: 'Grande', value: 'large' },
        ],
        layout: 'radio',
      },
      initialValue: 'medium',
    },
    {
      name: 'windowOrientation',
      title: 'Format de la fenêtre',
      type: 'string',
      options: {
        list: [
          { title: 'Paysage (Horizontal)', value: 'landscape' },
          { title: 'Portrait (Vertical)', value: 'portrait' },
          { title: 'Carré', value: 'square' },
        ],
        layout: 'radio',
        direction: 'horizontal', // Affiche les boutons côte à côte dans le Studio
      },
      initialValue: 'landscape',
    },
    {
      name: 'externalLink',
      title: 'Lien externe',
      type: 'url',
      validation: Rule =>
        Rule.uri({
          scheme: ['http', 'https', 'mailto', 'tel'],
        }).error(
          'Veuillez entrer une URL valide commençant par http://, https://, mailto: ou tel:'
        ),
    },
  ],
  preview: {
    select: {
      title: 'title.fr',
      media: 'photo',
    },
    prepare(selection) {
      const { title, media } = selection;
      return {
        title: title || 'Fenêtre Image',
        media,
      };
    },
  },
};
