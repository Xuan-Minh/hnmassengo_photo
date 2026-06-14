export default {
  name: 'windowText',
  title: 'Fenêtre Texte de présentation',
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
          initialValue: 'Présentation',
        },
        {
          name: 'en',
          title: 'Anglais',
          type: 'string',
          initialValue: 'Introduction',
        },
        {
          name: 'de',
          title: 'Allemand',
          type: 'string',
          initialValue: 'Einführung',
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
      name: 'content',
      title: 'Contenu texte',
      type: 'object',
      fields: [
        {
          name: 'fr',
          title: 'Français',
          type: 'array',
          of: [{ type: 'block' }],
        },
        {
          name: 'en',
          title: 'Anglais',
          type: 'array',
          of: [{ type: 'block' }],
        },
        {
          name: 'de',
          title: 'Allemand',
          type: 'array',
          of: [{ type: 'block' }],
        },
      ],
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
      windowTitle: 'title.fr',
      fr: 'content.fr',
      en: 'content.en',
      de: 'content.de',
    },
    prepare(selection) {
      const { windowTitle, fr, en, de } = selection;

      // On récupère le premier bloc de texte disponible selon la langue
      const textBlocks = fr || en || de || '';
      const firstBlock = Array.isArray(textBlocks) ? textBlocks[0] : null;
      const firstSentence = firstBlock?.children?.[0]?.text || '';

      // Si un texte existe, on prend les 50 premiers caractères, sinon on affiche le titre de la fenêtre
      const displayTitle = firstSentence
        ? firstSentence.length > 50
          ? firstSentence.slice(0, 50) + '...'
          : firstSentence
        : windowTitle || 'Fenêtre Texte';

      return {
        title: windowTitle || 'Fenêtre Texte',
        subtitle: `${displayTitle}`,
      };
    },
  },
};
