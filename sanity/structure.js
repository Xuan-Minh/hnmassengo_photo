export const structure = S =>
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

      // L'onglet fixe pour les images Desktop
      S.listItem()
        .title('Images de chargement - Desktop')
        .id('overlayDesktop')
        .child(
          S.editor()
            .id('loadingImagesDesktop')
            .schemaType('loadingImagesDesktop')
            .documentId('singleton-loading-desktop')
        ),

      // L'onglet fixe pour les images Mobile
      S.listItem()
        .title('Images de chargement - Mobile')
        .id('overlayMobile')
        .child(
          S.editor()
            .id('loadingImagesMobile')
            .schemaType('loadingImagesMobile')
            .documentId('singleton-loading-mobile')
        ),

      // Filtre pour cacher les autres éléments et éviter les doublons
      ...S.documentTypeListItems().filter(
        listItem =>
          !['homePage', 'loadingImagesDesktop', 'loadingImagesMobile'].includes(
            listItem.getId()
          )
      ),
    ]);
