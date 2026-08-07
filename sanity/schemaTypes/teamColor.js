import React from 'react';
import { defineField, defineType } from 'sanity';

export const teamColorType = defineType({
  name: 'teamColor',
  title: "Couleur de l'équipe",
  type: 'document',
  fields: [
    defineField({
      name: 'teamName',
      title: 'Couleur',
      type: 'string',
    }),
    defineField({
      name: 'colorValue',
      title: 'Couleur',
      type: 'color',
    }),
  ],
  preview: {
    select: {
      title: 'teamName',
      hexColor: 'colorValue.hex',
    },
    prepare(selection) {
      const { title, hexColor } = selection;

      return {
        title: title || 'Couleur sans nom',
        subtitle: hexColor ? `Code : ${hexColor}` : 'Aucune couleur définie',
        media: () => (
          <div
            style={{
              backgroundColor: hexColor || '#transparent',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '1px solid #e2e8f0',
            }}
          />
        ),
      };
    },
  },
});
