import { defineField, defineType } from 'sanity';

export const newsletterCampaign = defineType({
  name: 'newsletterCampaign',
  title: 'Newsletter — Campagnes',
  type: 'document',
  preview: {
    select: {
      postTitle: 'post.title.fr',
      sentAt: 'sentAt',
      status: 'status',
    },
    prepare({ postTitle, sentAt, status }) {
      const subtitleParts = [];
      if (status) subtitleParts.push(status);
      if (sentAt) subtitleParts.push(new Date(sentAt).toLocaleString('fr-FR'));
      return {
        title: postTitle || 'Campagne',
        subtitle: subtitleParts.join(' — '),
      };
    },
  },
  fields: [
    defineField({
      name: 'post',
      title: 'Article',
      type: 'reference',
      to: [{ type: 'blogPost' }],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Statut',
      type: 'string',
      options: {
        list: [
          { title: 'Envoi en cours', value: 'sending' },
          { title: 'Envoyé', value: 'sent' },
          { title: 'Erreur', value: 'error' },
          { title: 'Ignoré (déjà envoyé)', value: 'skipped' },
        ],
      },
      initialValue: 'sending',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'sentAt',
      title: 'Envoyé le',
      type: 'datetime',
    }),
    defineField({
      name: 'subscriberCount',
      title: 'Nombre de destinataires',
      type: 'number',
    }),
    defineField({
      name: 'errorCount',
      title: 'Nombre d’erreurs',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'lastError',
      title: 'Dernière erreur',
      type: 'text',
      rows: 4,
    }),
  ],
});
