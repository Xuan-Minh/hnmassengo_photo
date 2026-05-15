import { defineField, defineType } from 'sanity';

export const homeSectionImageType = defineType({
  name: 'homeSectionImage',
  title: 'Home Section Image',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Texte alternatif',
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
    }),
    defineField({
      name: 'isActive',
      title: 'Image active',
      type: 'boolean',
      description:
        'Cochez pour rendre cette image active. Une seule image doit être active.',
      initialValue: false,
      validation: Rule =>
        Rule.custom(async (isActive, context) => {
          if (!isActive) return true;
          try {
            const client = context.getClient({ apiVersion: '2021-06-07' });
            const { document } = context;
            const others = await client.fetch(
              '*[_type == "homeSectionImage" && isActive == true && _id != $id]{_id}',
              { id: document._id }
            );
            return others && others.length > 0
              ? "Il ne peut y avoir qu'une seule image active."
              : true;
          } catch {
            return true;
          }
        }),
    }),
  ],
  preview: {
    select: {
      title: 'alt.fr',
      media: 'image',
    },
    prepare({ title, media }) {
      return {
        title: title || 'Home image',
        media,
      };
    },
  },
  // Le tri par 'order' a été supprimé ; on utilise `isActive` pour indiquer l'image active.
});
