export default {
  name: 'windowBio',
  title: 'Fenêtre Bio',
  type: 'object',
  fields: [
    {
      name: 'photo',
      title: 'Photo de la bio',
      type: 'image',
      options: {
        hotspot: true, // Permet de définir le point focal
      },
    },
    {
      name: 'title',
      title: 'Titre de la fenêtre',
      type: 'object',
      fields: [
        {
          name: 'fr',
          title: 'Français',
          type: 'string',
          initialValue: 'À propos de moi',
        },
        {
          name: 'en',
          title: 'Anglais',
          type: 'string',
          initialValue: 'About me',
        },
        {
          name: 'de',
          title: 'Allemand',
          type: 'string',
          initialValue: 'Über mich',
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
      name: 'name',
      title: 'Prénom et nom',
      type: 'string',
      initialValue: 'Han-Noah MASSENGO',
    },
    {
      name: 'occupation',
      title: 'Occupation',
      type: 'string',
      initialValue: 'Soccer / Photographer',
    },
    {
      name: 'location',
      title: 'Localisation',
      type: 'string',
      initialValue: 'Augsbourg / Paris 📌',
    },
  ],
  preview: {
    select: {
      titreFr: 'title.fr', // On va chercher le texte dans l'objet title
      nomUtilisateur: 'name',
      photoBio: 'photo', // On sélectionne l'image pour la miniature
    },
    prepare(selection) {
      const { titreFr, nomUtilisateur, photoBio } = selection;
      return {
        title: titreFr || 'Fenêtre Biographie (Sans titre)',
        subtitle: nomUtilisateur ? `Profil : ${nomUtilisateur}` : '',
        media: photoBio,
      };
    },
  },
};
