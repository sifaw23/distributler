import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'

const inter = Inter({ subsets: ['latin'] })

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className={`${inter.className} min-h-screen bg-white dark:bg-gray-900`}>
        <Component {...pageProps} />
      </div>
    </ThemeProvider>
  )
}

export default MyApp