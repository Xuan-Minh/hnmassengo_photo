// sanity/structure.js
export const structure = S =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title("Page d'accueil")
        .id('homePage')
        .child(
          S.editor()
            .id('homePage')
            .schemaType('homePage')
            .documentId('homePage')
        ),
      ...S.documentTypeListItems().filter(
        listItem => listItem.getId() !== 'homePage'
      ),
    ]);
