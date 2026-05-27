export default {
  name: 'windowRecommendation',
  title: 'Onglet Recommandation',
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
          initialValue: 'Ma recommandation du moment',
        },
        {
          name: 'en',
          title: 'Anglais',
          type: 'string',
          initialValue: 'My recommendation of the moment',
        },
        {
          name: 'de',
          title: 'Allemand',
          type: 'string',
          initialValue: 'Meine Empfehlung des Augenblicks',
        },
      ],
    },
    {
      name: 'category',
      title: 'Catégorie',
      type: 'string',
      options: {
        list: [
          { title: 'Film', value: 'film' },
          { title: 'Livre', value: 'livre' },
          { title: 'Vidéo', value: 'video' },
          { title: 'Exposition', value: 'expo' },
        ],
      },
    },
    {
      name: 'itemTitle',
      title: "Titre de l'œuvre",
      type: 'object',
      fields: [
        { name: 'fr', title: 'Français', type: 'string' },
        { name: 'en', title: 'Anglais', type: 'string' },
        { name: 'de', title: 'Allemand', type: 'string' },
      ],
    },
    { name: 'cover', title: 'Couverture / Affiche', type: 'image' },
    {
      name: 'description',
      title: 'Avis / Description',
      type: 'object',
      fields: [
        { name: 'fr', title: 'Français', type: 'text' },
        { name: 'en', title: 'Anglais', type: 'text' },
        { name: 'de', title: 'Allemand', type: 'text' },
      ],
    },
    { name: 'link', title: 'Lien externe (optionnel)', type: 'url' },
  ],
};
