export default {
  name: "shopItem",
  title: "Article du Shop",
  type: "document",
  fields: [
    {
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
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title.fr", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "description",
      title: "Description",
      type: "object",
      fields: [
        { name: "fr", title: "Français", type: "text" },
        { name: "en", title: "Anglais", type: "text" },
        { name: "de", title: "Allemand", type: "text" },
      ],
    },
    {
      name: "price",
      title: "Prix (€)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    },
    {
      name: "image",
      title: "Image Principale",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "imgHover",
      title: "Image au Hover",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "formats",
      title: "Formats Disponibles",
      type: "array",
      of: [{ type: "string" }],
      description: "Liste des formats (e.g., A4, A3, A2)",
    },
    {
      name: "available",
      title: "Disponible",
      type: "boolean",
      initialValue: true,
    },
  ],
};
