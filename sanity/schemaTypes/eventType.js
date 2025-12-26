import { defineField, defineType } from "sanity";

export const eventType = defineType({
  name: "blogPost",
  title: "Article de Blog",
  type: "document",
  fields: [
    defineField({
      name: "title_fr",
      title: "Titre (Français)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title_en",
      title: "Titre (Anglais)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title_de",
      title: "Titre (Allemand)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "content_fr",
      title: "Contenu Court (Français)",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "content_en",
      title: "Contenu Court (Anglais)",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "content_de",
      title: "Contenu Court (Allemand)",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "fullContent_fr",
      title: "Contenu Complet (Français)",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "fullContent_en",
      title: "Contenu Complet (Anglais)",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "fullContent_de",
      title: "Contenu Complet (Allemand)",
      type: "text",
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
