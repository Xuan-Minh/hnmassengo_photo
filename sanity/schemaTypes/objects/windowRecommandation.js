export default {
  name: 'windowRecommandation',
  title: 'Fenêtre Recommandation',
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
          initialValue: 'Mes recommandations',
        },
        {
          name: 'en',
          title: 'Anglais',
          type: 'string',
          initialValue: 'My recommendations',
        },
        {
          name: 'de',
          title: 'Allemand',
          type: 'string',
          initialValue: 'Meine Empfehlungen',
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
      name: 'recommandation',
      title: 'Recommandation',
      type: 'array',
      of: [{ type: 'string' }],
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
  ],
};
