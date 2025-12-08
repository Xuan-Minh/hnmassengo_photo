import { defineField, defineType } from "sanity";

export const eventType = defineType({
  name: "postBlog",
  title: "Post",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
    }),
    defineField({
      name: "photo",
      type: "image",
    }),
    defineField({
      name: "date",
      type: "datetime",
    }),
    defineField({
      name: "location",
      type: "string",
    }),
    defineField({
      name: "description",
      type: "text",
    }),
  ],
});
