export default {
  name: 'windowColor',
  title: 'Réglages des Couleurs',
  type: 'document',
  fields: [
    {
      name: 'tabColors',
      title: 'Couleurs des onglets',
      description:
        'Définissez les couleurs de fond pour les onglets de la page "Test".',
      type: 'array',
      of: [{ type: 'color' }],
      validation: Rule =>
        Rule.max(4).warning('Vous ne devriez pas avoir plus de 4 couleurs.'),
    },
  ],
};
