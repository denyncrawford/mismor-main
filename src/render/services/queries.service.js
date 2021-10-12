
export const searchEntriesByMetadata = (search) => {
  return {
    $or: [
      {
        'title': {
          $regex: search,
          $options: 'i',
        },
      },
      {
        'details': {
          $regex: search,
          $options: 'i',
        },
      },
      {
        'tags': {
          $regex: search,
          $options: 'i',
        },
      },
      {
        'clients.name': {
          $regex: search,
          $options: 'i',
        },
      },
      {
        'dibujo': {
          $regex: search,
          $options: 'i',
        },
      },
      {
        'corte': {
          $regex: search,
          $options: 'i',
        },
      },
      {
        'articulo': {
          $regex: search,
          $options: 'i',
        },
      },
      {
        'shortId': {
          $regex: search,
          $options: 'i',
        },
      },
    ],
  }
}

export const printOptions = {
  silent: false,
  printBackground: true,
  color: false,
  margin: {
      marginType: 'printableArea'
  },
  landscape: false,
  pagesPerSheet: 1,
  collate: false,
  copies: 1,
  header: 'Header of the Page',
  footer: 'Footer of the Page'
}