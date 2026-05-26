export default {
  name: 'windowMusic',
  title: 'Onglet Musique',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Titre de la fenêtre',
      type: 'string',
      initialValue: 'Musique du moment',
    },
    {
      name: 'spotifyUrl',
      title: 'Lien Spotify (Morceau, Album ou Playlist)',
      type: 'url',
    },
  ],
};
