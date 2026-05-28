export default {
  name: 'homePage',
  title: "Page d'accueil",
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Titre de la page',
      type: 'string',
    },
    {
      name: 'windows',
      title: 'Fenêtres MySpace actives',
      type: 'array',
      description:
        "Ajoute, supprime ou réorganise les fenêtres flottantes de la page d'accueil.",
      of: [
        { type: 'windowBio' },
        { type: 'windowMusic' },
        { type: 'windowRecommendation' },
        { type: 'windowText' },
        { type: 'windowCustom' },
      ],
    },
  ],
};
