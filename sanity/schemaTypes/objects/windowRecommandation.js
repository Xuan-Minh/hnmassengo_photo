export default {
  name: 'windowRecommandation',
  title: 'Onglet Recommandation',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Titre de la fenêtre',
      type: 'string',
      initialValue: 'Ma recommandation du moment',
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
    { name: 'itemTitle', title: "Titre de l'œuvre", type: 'string' },
    { name: 'cover', title: 'Couverture / Affiche', type: 'image' },
    { name: 'description', title: 'Avis / Description', type: 'text' },
    { name: 'link', title: 'Lien externe (optionnel)', type: 'url' },
  ],
};
