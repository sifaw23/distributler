import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function TermsOfService() {
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
        <title>DistriButler Terms of Service | Multi-Chain Token Distribution</title>
        <meta name="description" content="Terms of Service for DistriButler&apos;s multi-token distribution platform on Optimism, Base &amp; Arbitrum. Learn about our policies for bulk transfers and airdrops." />
        <meta name="keywords" content="DistriButler, terms of service, multi-token sender, Optimism, Base, Arbitrum, bulk transfers, airdrops, cryptocurrency distribution" />
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
            Terms of Service
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-lg"
          >
            <h2 className="text-xl md:text-2xl font-semibold text-[#1E5AA8] mb-4">
              Welcome to DistriButler: Your Multi-Chain Token Distribution Solution
            </h2>
            <p className="mb-6 text-gray-800">
              By using DistriButler for multi-token distribution across Optimism, Base, and Arbitrum networks, 
              you agree to these terms. Our service is designed for efficient bulk transfers and airdrops, 
              optimizing your cryptocurrency operations.
            </p>

            {[
              { title: "1. Service Description - Multi-Chain Efficiency", content: "DistriButler provides a platform for distributing multiple tokens to numerous addresses in a single transaction across Optimism, Base, and Arbitrum networks. Our service is optimized for airdrops, rewards, and bulk transfers." },
              { title: "2. User Responsibilities - Secure Multi-Network Operations", content: "Users are responsible for ensuring the accuracy of recipient addresses and token amounts across all supported networks. DistriButler facilitates transactions but cannot reverse or modify executed transfers." },
              { title: "3. Fee Structure - Transparent Multi-Chain Pricing", content: "Our fee structure includes a base fee of 0.5% on the total distribution amount, with additional fees for large distributions. Fees may vary slightly between Optimism, Base, and Arbitrum networks to account for different gas costs." },
              { title: "4. Prohibited Activities - Maintaining Network Integrity", content: "Users must not use DistriButler for any illegal activities or in ways that could damage, disable, or impair our multi-chain services. This includes attempts to gain unauthorized access to our systems or other users&apos; accounts." },
              { title: "5. Intellectual Property - Protecting Our Multi-Network Innovation", content: "All content, features, and functionality of DistriButler, including our multi-chain distribution algorithms, are the exclusive property of DistriButler and are protected by international copyright, trademark, and other intellectual property laws." },
              { title: "6. Limitation of Liability - Understanding Multi-Chain Risks", content: "DistriButler is not liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our service across Optimism, Base, and Arbitrum networks. Our liability is limited to the amount of fees paid for the specific transaction in question." },
              { title: "7. Modifications to Service - Evolving with Blockchain Technology", content: "We reserve the right to modify or discontinue DistriButler with or without notice. This includes updates to supported networks, token types, or features to enhance multi-chain functionality and security." },
              { title: "8. Governing Law - Multi-Jurisdictional Compliance", content: "These terms are governed by the laws of the jurisdiction where DistriButler is headquartered, without regard to its conflict of law provisions. This applies to all supported networks and international users." },
              { title: "9. Dispute Resolution - Efficient Conflict Management", content: "Any disputes arising from the use of DistriButler across Optimism, Base, or Arbitrum networks will be resolved through binding arbitration, unless prohibited by applicable law. This ensures swift and fair resolution of any issues." },
              { title: "10. Termination - Protecting Our Multi-Chain Ecosystem", content: "We reserve the right to terminate or suspend access to DistriButler for violations of these terms or any illegal or unauthorized use of the service across any supported network." },
              { title: "11. Updates to Terms - Adapting to Blockchain Evolution", content: "DistriButler may update these terms to reflect changes in our services, user needs, or legal requirements. We&apos;ll notify users of significant changes via email or through our dapp." },
              { title: "12. Contact Information - Your Multi-Chain Support Team", content: "For questions about these terms or DistriButler's services across Optimism, Base, and Arbitrum networks, please contact our dedicated support team." },
            ].map((section, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-lg md:text-xl font-semibold text-[#1E5AA8] mb-2">{section.title}</h3>
                <p className="text-gray-800">{section.content}</p>
              </div>
            ))}

            <p className="mt-8 text-center text-gray-600">
              By using DistriButler, you&apos;re agreeing to these terms and joining a community dedicated to 
              efficient, secure multi-chain token distribution. We&apos;re committed to providing top-tier service 
              for all your bulk transfer and airdrop needs across Optimism, Base, and Arbitrum networks.
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