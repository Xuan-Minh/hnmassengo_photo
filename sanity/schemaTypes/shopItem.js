export default {
  name: "shopItem",
  title: "Article du Shop",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Titre",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "description",
      title: "Description",
      type: "text",
    },
    {
      name: "price",
      title: "Prix",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    },
    {
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "category",
      title: "Catégorie",
      type: "string",
    },
    {
      name: "available",
      title: "Disponible",
      type: "boolean",
      initialValue: true,
    },
  ],
};
