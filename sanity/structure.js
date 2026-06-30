// sanity/structure.js
export const structure = S =>
  S.list()
    .title('Content')
    .items([
      S.listItem().title("Page d'accueil").id('homePage').child(
        S.editor()
          .id('homePage')
          .schemaType('homePage') // Le type de votre document
          .documentId('c9ea024d-7509-446d-9e7f-afda42528d38') // L'ID exact du document retrouvé !
      ),
      ...S.documentTypeListItems().filter(
        listItem => listItem.getId() !== 'homePage'
      ),
    ]);
