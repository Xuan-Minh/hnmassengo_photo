export default {
  name: 'homePage',
  title: "Onglets - Page d'accueil",
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
        { type: 'windowText' },
        { type: 'windowVideo' },
        { type: 'windowImage' },
      ],
    },
  ],
};
