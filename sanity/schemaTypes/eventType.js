import { defineField, defineType } from "sanity";

export const eventType = defineType({
  name: "blogPost",
  title: "Article de Blog",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Titre",
      type: "object",
      fields: [
        {
          name: "fr",
          title: "Français",
          type: "string",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "en",
          title: "Anglais",
          type: "string",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "de",
          title: "Allemand",
          type: "string",
          validation: (Rule) => Rule.required(),
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "content",
      title: "Contenu Court",
      type: "object",
      fields: [
        {
          name: "fr",
          title: "Français",
          type: "text",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "en",
          title: "Anglais",
          type: "text",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "de",
          title: "Allemand",
          type: "text",
          validation: (Rule) => Rule.required(),
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "fullContent",
      title: "Contenu Complet",
      type: "object",
      fields: [
        {
          name: "fr",
          title: "Français",
          type: "text",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "en",
          title: "Anglais",
          type: "text",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "de",
          title: "Allemand",
          type: "text",
          validation: (Rule) => Rule.required(),
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "layout",
      title: "Disposition",
      type: "string",
      options: {
        list: [
          { title: "Image à Gauche", value: "image-left" },
          { title: "Image à Droite", value: "image-right" },
          { title: "Texte Seulement", value: "text-only" },
        ],
      },
      initialValue: "image-left",
    }),
  ],
});
