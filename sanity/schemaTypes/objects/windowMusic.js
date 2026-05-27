export default {
  name: 'windowMusic',
  title: 'Onglet Musique',
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
          initialValue: 'Musique du moment',
        },
        {
          name: 'en',
          title: 'Anglais',
          type: 'string',
          initialValue: 'Music of the moment',
        },
        {
          name: 'de',
          title: 'Allemand',
          type: 'string',
          initialValue: 'Musik des Augenblicks',
        },
      ],
    },
    {
      name: 'spotifyUrl',
      title: 'Lien Spotify (Morceau, Album ou Playlist)',
      type: 'url',
    },
  ],
};
