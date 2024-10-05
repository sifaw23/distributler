import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Menu, ArrowUp } from 'lucide-react'
import Link from 'next/link'

export default function DocumentationPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Head>
        <title>DistriButler Documentation | Multi-Chain Token Distribution Guide</title>
        <meta name="description" content="Comprehensive guide for using DistriButler, the leading multi-chain token distribution dApp for Optimism, Base & Arbitrum networks. Learn how to efficiently conduct airdrops and bulk transfers." />
        <meta name="keywords" content="DistriButler, token distribution, crypto airdrop, bulk transfer, Optimism, Base, Arbitrum, ERC-20, documentation, guide" />
        <meta name="author" content="DistriButler" />
        <link rel="canonical" href="https://distributler.com/documentation" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://distributler.com/documentation" />
        <meta property="og:title" content="DistriButler Documentation | Multi-Chain Token Distribution Guide" />
        <meta property="og:description" content="Learn how to use DistriButler for efficient token distribution across Optimism, Base & Arbitrum networks. Perfect for airdrops and bulk transfers." />
        <meta property="og:image" content="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DistriButler_logo%20f-RZsct2IiP8Fec8gDbvIjXnCGBjN211.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://distributler.com/documentation" />
        <meta property="twitter:title" content="DistriButler Documentation | Multi-Chain Token Distribution Guide" />
        <meta property="twitter:description" content="Learn how to use DistriButler for efficient token distribution across Optimism, Base & Arbitrum networks. Perfect for airdrops and bulk transfers." />
        <meta property="twitter:image" content="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DistriButler_logo%20f-RZsct2IiP8Fec8gDbvIjXnCGBjN211.png" />

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* Structured Data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            "headline": "DistriButler Documentation: Multi-Chain Token Distribution Guide",
            "description": "Comprehensive guide for using DistriButler, the leading multi-chain token distribution dApp for Optimism, Base & Arbitrum networks.",
            "image": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DistriButler_logo%20f-RZsct2IiP8Fec8gDbvIjXnCGBjN211.png",
            "author": {
              "@type": "Organization",
              "name": "DistriButler"
            },
            "publisher": {
              "@type": "Organization",
              "name": "DistriButler",
              "logo": {
                "@type": "ImageObject",
                "url": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DistriButler_logo%20f-RZsct2IiP8Fec8gDbvIjXnCGBjN211.png"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://distributler.com/documentation"
            }
          })}
        </script>
      </Head>

      <header className="px-4 lg:px-6 h-16 sm:h-20 flex items-center border-b border-blue-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link className="flex items-center justify-center" href="/">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DistriButler_logo%20f-RZsct2IiP8Fec8gDbvIjXnCGBjN211.png"
              alt="DistriButler Logo"
              className="h-10 sm:h-12 w-auto"
            />
          </Link>
          <button
            className="sm:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <Menu className="h-6 w-6 text-[#1E5AA8]" />
          </button>
          <nav className={`${isMenuOpen ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row items-center absolute sm:relative top-16 sm:top-0 left-0 right-0 bg-white sm:bg-transparent p-4 sm:p-0 shadow-md sm:shadow-none w-full sm:w-auto mt-4 sm:mt-0 gap-4 sm:gap-6`}>
            <Link className="text-sm font-medium text-gray-600 hover:text-[#1E5AA8] transition-colors" href="#getting-started">
              Getting Started
            </Link>
            <Link className="text-sm font-medium text-gray-600 hover:text-[#1E5AA8] transition-colors" href="#features">
              Features
            </Link>
            <Link className="text-sm font-medium text-gray-600 hover:text-[#1E5AA8] transition-colors" href="#usage-guide">
              Usage Guide
            </Link>
            <Link className="text-sm font-medium text-gray-600 hover:text-[#1E5AA8] transition-colors" href="#faq">
              FAQ
            </Link>
            <Button className="w-full sm:w-auto bg-[#1E5AA8] text-white hover:bg-[#164785] transition-colors mt-4 sm:mt-0">
              <Link href="/launch-app">Launch App</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-8 sm:py-12" role="main">
        <div className="container px-4 md:px-6 mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter text-[#1E5AA8] text-center mb-6 sm:mb-8">
            DistriButler Documentation
          </h1>

          <section id="getting-started" className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E5AA8] mb-4">Getting Started</h2>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h3 className="text-lg sm:text-xl font-semibold text-[#1E5AA8] mb-2">Prerequisites</h3>
              <ul className="list-disc pl-5 mb-4 text-sm sm:text-base text-gray-700">
                <li>A Web3-enabled browser (e.g., Chrome with MetaMask)</li>
                <li>An Ethereum wallet with funds on supported networks</li>
                <li>Tokens to distribute (if applicable)</li>
              </ul>
              <h3 className="text-lg sm:text-xl font-semibold text-[#1E5AA8] mb-2">Connecting Your Wallet</h3>
              <ol className="list-decimal pl-5 text-sm sm:text-base text-gray-700">
                <li>Navigate to the DistriButler app page</li>
                <li>Click on the &quot;Connect Wallet&quot; button</li>
                <li>Select your preferred wallet provider</li>
                <li>Follow the prompts to connect your wallet</li>
              </ol>
            </div>
          </section>

          <section id="features" className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E5AA8] mb-4">Features</h2>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <FeatureCard
                title="Multi-Chain Support"
                description="Distribute tokens on Optimism, Base & Arbitrum networks"
              />
              <FeatureCard
                title="Multiple Token Distribution"
                description="Send various ERC-20 tokens in a single transaction"
              />
              <FeatureCard
                title="Bulk Transfers"
                description="Send to multiple recipients, reducing gas costs"
              />
              <FeatureCard
                title="Gas Fee Estimation"
                description="Get accurate estimates before executing transactions"
              />
            </div>
          </section>

          <section id="usage-guide" className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E5AA8] mb-4">Usage Guide</h2>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h3 className="text-lg sm:text-xl font-semibold text-[#1E5AA8] mb-2">Step-by-Step Instructions</h3>
              <ol className="list-decimal pl-5 text-sm sm:text-base text-gray-700 space-y-3 sm:space-y-4">
                <li><strong>Select Network:</strong> Choose Optimism, Base, or Arbitrum from the network dropdown.</li>
                <li><strong>Choose Tokens:</strong> Enter the token contract address or leave empty for native token (ETH).</li>
                <li><strong>Add Recipients:</strong> Enter recipient addresses and amounts in the format: <code>address,amount</code> (one per line).</li>
                <li><strong>Estimate Gas:</strong> Click &quot;Estimate Gas Fee&quot; to get an estimate of the transaction cost.</li>
                <li><strong>Execute Transaction:</strong> Review details and click &quot;Send Tokens&quot; to initiate the distribution.</li>
                <li><strong>Confirm in Wallet:</strong> Approve the transaction in your connected wallet.</li>
              </ol>
            </div>
          </section>

          <section id="faq" className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E5AA8] mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <FAQItem
                question="Which tokens are supported by DistriButler?"
                answer="DistriButler supports native tokens (ETH) and any ERC-20 tokens on Optimism, Base, and Arbitrum networks."
              />
              <FAQItem
                question="Is there a limit to the number of recipients per transaction?"
                answer="The current limit is 200 recipients per transaction due to gas limitations."
              />
              <FAQItem
                question="How are fees calculated?"
                answer="DistriButler charges a base fee of 0.5% on the total distribution amount, with additional fees for distributions to more than 10 recipients. See our Fee Structure for details."
              />
            </div>
          </section>
        </div>
      </main>

      <footer className="w-full py-4 sm:py-6 bg-[#1E5AA8]">
        <div className="container px-4 md:px-6 mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs sm:text-sm text-center sm:text-left text-white mb-2 sm:mb-0">
            © 2024 DistriButler. All rights reserved.
          </p>
          <nav className="flex gap-4">
            <Link className="text-xs sm:text-sm hover:underline underline-offset-4 text-white" href="/terms-of-service">
              Terms of Service
            </Link>
            <Link className="text-xs sm:text-sm hover:underline underline-offset-4 text-white" href="/privacy-policy">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </footer>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 bg-[#1E5AA8] text-white p-2 rounded-full shadow-lg hover:bg-[#164785] transition-colors"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}

function FeatureCard({ title, description }) {
  return (
    <div className="flex flex-col space-y-2 p-4 sm:p-6 bg-blue-50 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <h3 className="text-lg sm:text-xl font-bold text-[#1E5AA8]">{title}</h3>
      <p className="text-sm sm:text-base text-gray-600">{description}</p>
    </div>
  )
}

function FAQItem({ question, answer }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h3 className="text-base sm:text-lg font-semibold text-[#1E5AA8] mb-2">{question}</h3>
      <p className="text-sm sm:text-base text-gray-700">{answer}</p>
    </div>
  )
}