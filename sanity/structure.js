// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Home - Présentation')
        .id('homePresentation')
        .child(
          S.editor()
            .id('homePresentation')
            .schemaType('homePresentation')
            .documentId('homePresentation')
        ),
      ...S.documentTypeListItems().filter(
        listItem => listItem.getId() !== 'homePresentation'
      ),
    ])
