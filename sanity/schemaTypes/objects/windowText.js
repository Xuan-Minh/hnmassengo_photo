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
      preview: {
        select: {
          fr: 'content.fr',
          en: 'content.en',
          de: 'content.de',
        },
        prepare(selection) {
          const { fr, en, de } = selection;
          const text = fr || en || de || '';
          const firstBlock = Array.isArray(text) ? text[0] : null;
          const firstSentence = firstBlock?.children?.[0]?.text || '';
          return {
            title:
              firstSentence.length > 50
                ? firstSentence.slice(0, 50) + '...'
                : firstSentence,
            subtitle: 'Fenêtre Texte',
          };
        },
      },
    },
  ],
};
