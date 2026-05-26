export default {
  name: 'windowText',
  title: 'Onglet Texte',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Titre de la fenêtre',
      type: 'string',
      initialValue: 'Présentation',
    },
    {
      name: 'content',
      title: 'Contenu texte',
      type: 'array',
      of: [{ type: 'block' }], // Portable Text standard
    },
  ],
};
