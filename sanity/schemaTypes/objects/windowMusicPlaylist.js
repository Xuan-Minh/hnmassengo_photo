export default {
  name: 'windowMusicPlaylist',
  title: 'Fenêtre Playlist Musique',
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
          initialValue: 'Playlist Musique',
        },
        {
          name: 'en',
          title: 'Anglais',
          type: 'string',
          initialValue: 'Music Playlist',
        },
        {
          name: 'de',
          title: 'Allemand',
          type: 'string',
          initialValue: 'Musik Playlist',
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
      name: 'spotifyUrlFolder',
      title: 'Lien Spotify (Morceau, Album ou Playlist)',
      type: 'array',
      of: [{ type: 'url' }],
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
    },
  },
};
