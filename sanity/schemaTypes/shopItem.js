import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'shopItem',
  title: 'Produit de la Boutique',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nom du Produit',
      description: 'Le nom qui sera affiché dans la boutique',
      type: 'object',
      fields: [
        {
          name: 'fr',
          title: 'Français',
          type: 'string',
          validation: Rule => Rule.required(),
        },
        {
          name: 'en',
          title: 'Anglais',
          type: 'string',
          validation: Rule => Rule.required(),
        },
        {
          name: 'de',
          title: 'Allemand',
          type: 'string',
          validation: Rule => Rule.required(),
        },
      ],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Identifiant URL',
      description: 'Généré automatiquement à partir du nom français',
      type: 'slug',
      options: { source: 'title.fr', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description du Produit',
      description: 'Description détaillée affichée dans la boutique',
      type: 'object',
      fields: [
        { name: 'fr', title: 'Français', type: 'text' },
        { name: 'en', title: 'Anglais', type: 'text' },
        { name: 'de', title: 'Allemand', type: 'text' },
      ],
    }),
    defineField({
      name: 'price',
      title: 'Prix (€)',
      description: 'Prix en euros (HT ou TTC selon votre configuration)',
      type: 'number',
      validation: Rule => Rule.required().min(0),
    }),
    defineField({
      name: 'image',
      title: 'Image Principale',
      description: 'Image principale affichée dans la boutique',
      type: 'image',
      options: { hotspot: true },
      validation: Rule => Rule.required(),
      fields: [
        defineField({
          name: 'alt',
          title: 'Texte Alternatif (SEO)',
          description: 'Description de l\'image pour l\'accessibilité et le SEO',
          type: 'object',
          fields: [
            { name: 'fr', title: 'Français', type: 'string' },
            { name: 'en', title: 'Anglais', type: 'string' },
            { name: 'de', title: 'Allemand', type: 'string' },
          ],
        }),
      ],
    }),
    defineField({
      name: 'imgHover',
      title: 'Image au Survol',
      description: 'Image affichée quand la souris passe sur le produit (optionnel)',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'formats',
      title: 'Formats Disponibles',
      description: 'Formats d\'impression disponibles (ex: A4, A3, 30x40cm)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'available',
      title: 'Disponible à la Vente',
      description: 'Produit visible et disponible dans la boutique',
      type: 'boolean',
      initialValue: true,
    }),
  ],
});
