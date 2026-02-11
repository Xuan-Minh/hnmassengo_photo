import { defineField, defineType } from 'sanity';

export const newsletterSubscriber = defineType({
  name: 'newsletterSubscriber',
  title: 'Newsletter — Inscrits',
  type: 'document',
  preview: {
    select: {
      title: 'email',
      subtitle: 'status',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Sans email',
        subtitle: subtitle || 'status',
      };
    },
  },
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule =>
        Rule.required()
          .min(3)
          .custom(value => {
            if (!value) return true;
            const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
            return ok || 'Email invalide';
          }),
    }),
    defineField({
      name: 'locale',
      title: 'Langue',
      type: 'string',
      options: {
        list: [
          { title: 'Français', value: 'fr' },
          { title: 'English', value: 'en' },
          { title: 'Deutsch', value: 'de' },
        ],
        layout: 'radio',
      },
      initialValue: 'fr',
    }),
    defineField({
      name: 'status',
      title: 'Statut',
      type: 'string',
      options: {
        list: [
          { title: 'Actif', value: 'active' },
          { title: 'Désinscrit', value: 'unsubscribed' },
        ],
        layout: 'radio',
      },
      initialValue: 'active',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      description: 'contact-form, standalone, etc.',
    }),
    defineField({
      name: 'createdAt',
      title: 'Créé le',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: Rule => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'updatedAt',
      title: 'Mis à jour le',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
  ],
});
