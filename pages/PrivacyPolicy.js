import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function PrivacyPolicy() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Head>
        <title>DistriButler Privacy Policy | Multi-Chain Token Distribution</title>
        <meta name="description" content="DistriButler&apos;s privacy policy for multi-token distribution on Optimism, Base &amp; Arbitrum. Learn how we protect your data during bulk transfers and airdrops." />
        <meta name="keywords" content="DistriButler, privacy policy, multi-token sender, Optimism, Base, Arbitrum, bulk transfers, airdrops, cryptocurrency distribution" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className={`px-4 h-16 sm:h-20 flex items-center border-b border-blue-200 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 shadow-md' : 'bg-white/80'}`}>
        <div className="container mx-auto flex items-center justify-between">
          <Link className="flex items-center justify-center" href="/">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DistriButler_logo%20f-RZsct2IiP8Fec8gDbvIjXnCGBjN211.png"
              alt="DistriButler Logo"
              className="h-8 sm:h-10 w-auto"
            />
            
          </Link>
          <button
            className="sm:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-6 w-6 text-[#1E5AA8]" /> : <Menu className="h-6 w-6 text-[#1E5AA8]" />}
          </button>
          <nav className={`${isMenuOpen ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row items-center absolute sm:relative top-16 sm:top-0 left-0 right-0 bg-white sm:bg-transparent p-4 sm:p-0 shadow-md sm:shadow-none w-full sm:w-auto mt-4 sm:mt-0 gap-4 sm:gap-6`}>
            <Button variant="ghost" asChild className="w-full sm:w-auto">
              <Link href="/" className="text-[#1E5AA8] hover:text-[#164785] transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-12 md:py-24" role="main">
        <div className="container mx-auto px-4 md:px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter text-center mb-8 text-[#1E5AA8]"
          >
            Privacy Policy
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-lg"
          >
            <h2 className="text-xl md:text-2xl font-semibold text-[#1E5AA8] mb-4">Protecting Your Data Across Multiple Chains</h2>

            {[
              { title: "1. Introduction - Securing Your Multi-Chain Transactions", content: "At DistriButler, we prioritize the security and privacy of your multi-chain token distributions. This policy outlines how we handle your information across Optimism, Base, and Arbitrum networks." },
              { title: "2. Data We Collect - Optimizing Your Token Sending Experience", content: "We collect essential data for executing multi-token transfers, including wallet addresses, transaction data, and network preferences among Optimism, Base, and Arbitrum." },
              { title: "3. Data Usage - Enhancing Multi-Chain Efficiency", content: "We use your data for transaction processing, service optimization, and security enhancements to ensure smooth multi-token distributions across networks." },
              { title: "4. Data Sharing - Limited to Essential Operations", content: "We share data only with carefully selected service providers who assist in multi-chain operations and when required by law, with strict adherence to data protection standards." },
              { title: "5. Security Measures - Fortifying Your Multi-Token Transactions", content: "We employ advanced encryption and security protocols to safeguard your data across all supported networks. Our multi-layered approach ensures the highest level of protection for your bulk transfers." },
              { title: "6. Your Data Rights - Control Over Your Multi-Chain Information", content: "You have the right to access, review, correct, and request deletion of your data across all supported networks, subject to legal and operational requirements." },
              { title: "7. Cookies and Tracking - Optimizing Your Multi-Network Experience", content: "We use cookies to enhance your experience across Optimism, Base, and Arbitrum networks. These help us remember your preferences and optimize gas fees for bulk transfers." },
              { title: "8. International Data Transfers - Seamless Across Borders and Chains", content: "Your information may be processed in countries where our servers are located. We ensure consistent protection standards across all jurisdictions and blockchain networks." },
              { title: "9. Policy Updates - Evolving with Blockchain Technology", content: "We may update this policy to reflect changes in our services or regulatory requirements. We will notify you of significant changes via email or through our dapp." },
              { title: "10. Contact Us - Your Multi-Chain Support Team", content: "For questions about your data across Optimism, Base, or Arbitrum, or to exercise your rights, please contact our dedicated support team." },
            ].map((section, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-lg md:text-xl font-semibold text-[#1E5AA8] mb-2">{section.title}</h3>
                <p className="text-gray-800">{section.content}</p>
              </div>
            ))}

            <p className="mt-8 text-center text-gray-600">
              By using DistriButler, you&apos;re partnering with a leader in secure, multi-chain token distribution. 
              We&apos;re committed to protecting your data as you navigate the world of bulk crypto transfers and airdrops.
            </p>
          </motion.div>
        </div>
      </main>

      <footer className="w-full py-6 bg-[#1E5AA8] px-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-center md:text-left text-white mb-4 md:mb-0">
            © {new Date().getFullYear()} DistriButler. All rights reserved.
          </p>
          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link className="text-sm hover:underline underline-offset-4 text-white" href="/TermsOfService">
              Terms of Service
            </Link>
            <Link className="text-sm hover:underline underline-offset-4 text-white" href="/PrivacyPolicy">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}