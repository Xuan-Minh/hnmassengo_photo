export default {
  name: 'windowBio',
  title: 'Fenêtre Bio',
  type: 'object',
  fields: [
    {
      name: 'photo',
      title: 'Photo de la bio',
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
      name: 'name',
      title: 'Prénom et nom',
      type: 'string',
      initialValue: 'Han-Noah MASSENGO',
    },
    {
      name: 'lastConnexion',
      title: 'Dernière connexion',
      type: 'string',
    },
  ],
};
