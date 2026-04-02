import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { SessionProvider, useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { api } from '../lib/api'
import { CartProvider, useCart } from '../contexts/CartContext'
import CheckoutModal from '../components/CheckoutModal'

function AuthTokenSetter({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  useEffect(() => {
    const token = (session as any)?.accessToken
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    else delete api.defaults.headers.common['Authorization']
  }, [session])
  return <>{children}</>
}

// Renders the global CheckoutModal using the cart context
function GlobalCheckout() {
  const { checkoutOpen, closeCheckout, clearCart, items } = useCart()
  if (!checkoutOpen) return null
  return (
    <CheckoutModal
      items={items}
      onClose={closeCheckout}
      onFinish={() => { clearCart(); closeCheckout() }}
    />
  )
}

export default function App({ Component, pageProps }: AppProps) {
  const { session, ...rest } = pageProps || {}
  const svgFavicon = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='100%25' height='100%25' fill='%2310B981'/%3E%3C/svg%3E"
  return (
    <SessionProvider session={session}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="alternate icon" href={`data:image/svg+xml,${svgFavicon}`} />
      </Head>
      <CartProvider>
        <AuthTokenSetter>
          <Component {...(rest as any)} />
        </AuthTokenSetter>
        <GlobalCheckout />
      </CartProvider>
    </SessionProvider>
  )
}
