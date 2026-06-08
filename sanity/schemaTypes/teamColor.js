export default {
  name: 'teamColor',
  title: 'Catalogue des Couleurs',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Nom de la couleur',
      type: 'string',
      description: 'Exemple : "Bleu Rétro", "Gris Windows", etc.',
    },
    {
      name: 'colorValue',
      title: 'Valeur de la couleur',
      type: 'color',
    },
  ],
};
