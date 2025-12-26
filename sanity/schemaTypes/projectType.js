import { defineField, defineType } from "sanity";

export const projectType = defineType({
  name: "project",
  title: "Projet Galerie",
  type: "document",
  fields: [
    defineField({
      name: "name_fr",
      title: "Nom du Projet (Français)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "name_en",
      title: "Nom du Projet (Anglais)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "name_de",
      title: "Nom du Projet (Allemand)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "type",
      title: "Type de Projet",
      type: "string",
      options: {
        list: [
          { title: "Artwork", value: "artwork" },
          { title: "Commission", value: "commission" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "coords",
      title: "Coordonnées Géographiques",
      type: "string",
      description: "Ex: 48.3705° N, 10.8978° E",
    }),
    defineField({
      name: "description_fr",
      title: "Description (Français)",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description_en",
      title: "Description (Anglais)",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description_de",
      title: "Description (Allemand)",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Date (optionnel)",
      type: "datetime",
    }),
  ],
});
