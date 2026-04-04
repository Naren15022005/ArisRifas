import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="es">
        <Head>
          {/* Favicon and small head items kept in Document for consistent SSR */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="alternate icon" href={`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='100%25' height='100%25' fill='%2310B981'/%3E%3C/svg%3E`} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
