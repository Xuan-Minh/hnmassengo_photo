// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure = S =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Home - Bio')
        .id('homeBio')
        .child(
          S.editor().id('homeBio').schemaType('homeBio').documentId('homeBio')
        ),
      ...S.documentTypeListItems().filter(
        listItem => listItem.getId() !== 'homeBio'
      ),
    ]);
