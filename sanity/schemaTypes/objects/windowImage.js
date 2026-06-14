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
    {
      name: 'startsOnTop',
      title: '🌟 Mettre au premier plan',
      description:
        'Cochez cette case pour que cette fenêtre apparaisse au-dessus des autres au chargement de la page.',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'positionX',
      title: 'Position Horizontale (De gauche à droite)',
      description:
        'Exemple : 0 = Tout à gauche, 50 = Au milieu, 80 = Presque tout à droite. Laissez vide pour un placement automatique.',
      type: 'number',
      validation: Rule => Rule.min(0).max(100),
    },
    {
      name: 'positionY',
      title: 'Position Verticale (De haut en bas)',
      description:
        'Exemple : 0 = Tout en haut, 50 = Au milieu, 80 = Presque tout en bas. Laissez vide pour un placement automatique.',
      type: 'number',
      validation: Rule => Rule.min(0).max(100),
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
