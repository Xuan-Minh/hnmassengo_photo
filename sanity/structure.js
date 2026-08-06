import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';

// Ajout du paramètre 'context' ici 👇
export const structure = (S, context) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title("Onglets - Page d'accueil")
        .id('homePage')
        .child(
          S.editor()
            .id('homePage')
            .schemaType('homePage')
            .documentId('c9ea024d-7509-446d-9e7f-afda42528d38')
        ),
      ...S.documentTypeListItems().filter(
        listItem =>
          !['homePage', 'loadingImageDesktop', 'loadingImageMobile'].includes(
            listItem.getId()
          )
      ),
      orderableDocumentListDeskItem({
        type: 'loadingImageDesktop',
        title: 'Images Desktop (Ordonnables)',
        S,
        context,
      }),
      orderableDocumentListDeskItem({
        type: 'loadingImageMobile',
        title: 'Images Mobile (Ordonnables)',
        S,
        context,
      }),
    ]);
