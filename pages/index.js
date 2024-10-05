import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ArrowRight, Zap, Shield, Coins, ChevronRight, Menu, Twitter, Mail, FileText, X, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileWarning, setShowMobileWarning] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    const checkIfMobile = () => {
      const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
      const mobile = Boolean(
        userAgent.match(
          /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
        )
      );
      setIsMobile(mobile);
    };

    window.addEventListener('scroll', handleScroll)
    window.addEventListener("resize", checkIfMobile)
    checkIfMobile();

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  const handleLaunchApp = (e) => {
    if (isMobile) {
      e.preventDefault();
      setShowMobileWarning(true);
    }
  }

  const handleLearnMore = (e) => {
    if (isMobile) {
      e.preventDefault();
      const howItWorksSection = document.getElementById('how-it-works');
      if (howItWorksSection) {
        howItWorksSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Head>
        <title>DistriButler - Multi Token Sender for Optimism, Base &amp; Arbitrum</title>
        <meta name="description" content="Effortlessly distribute multiple tokens to numerous addresses in a single transaction. Perfect for airdrops, rewards, and bulk transfers on Optimism, Base &amp; Arbitrum networks." />
        <meta name="keywords" content="crypto distribution, token sender, Optimism, Base, Arbitrum, airdrop tool, bulk transfer, multi-chain, ERC-20" />
        <meta name="author" content="DistriButler" />
        <meta property="og:title" content="DistriButler - Multi Token Sender for Optimism, Base &amp; Arbitrum" />
        <meta property="og:description" content="Effortlessly distribute multiple tokens to numerous addresses in a single transaction. Perfect for airdrops, rewards, and bulk transfers on Optimism, Base &amp; Arbitrum networks." />
        <meta property="og:image" content="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DistriButler_logo%20f-RZsct2IiP8Fec8gDbvIjXnCGBjN211.png" />
        <meta property="og:url" content="https://distributler.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://distributler.com" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "DistriButler",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "description": "Multi-token distribution tool for Optimism, Base &amp; Arbitrum networks",
            "offers": {
              "@type": "Offer",
              "price": "0.5%",
              "priceCurrency": "ETH"
            },
            "creator": {
              "@type": "Organization",
              "name": "DistriButler",
              "url": "https://distributler.com"
            }
          })}
        </script>
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
            <Link className="text-sm font-medium text-gray-600 hover:text-[#1E5AA8] transition-colors w-full sm:w-auto text-center" href="#features">
              Features
            </Link>
            <Link className="text-sm font-medium text-gray-600 hover:text-[#1E5AA8] transition-colors w-full sm:w-auto text-center" href="#how-it-works">
              How It Works
            </Link>
            <Link className="text-sm font-medium text-gray-600 hover:text-[#1E5AA8] transition-colors w-full sm:w-auto text-center" href="#pricing">
              Fees
            </Link>
            <Link className="text-sm font-medium text-gray-600 hover:text-[#1E5AA8] transition-colors w-full sm:w-auto text-center" href="#faq">
              FAQ
            </Link>
            <Link className="text-sm font-medium text-gray-600 hover:text-[#1E5AA8] transition-colors w-full sm:w-auto text-center" href="/DocumentationPage">
              <FileText className="inline-block mr-1 h-4 w-4" />
              Docs
            </Link>
            <Button className="w-full sm:w-auto bg-[#1E5AA8] text-white hover:bg-[#164785] transition-colors mt-4 sm:mt-0">
              <Link href="/launch-app" onClick={handleLaunchApp}>Launch App</Link>
            </Button>
          </nav>
        </div>
      </header>

        <main className="flex-1" role="main">
          {isMobile && (
            <div className="px-4 w-full max-w-md mx-auto">
              <Alert variant="warning" className="mt-4 bg-yellow-100 border border-yellow-400 rounded-lg shadow-md">
                <div className="flex flex-col items-start space-y-2">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-700" />
                    <AlertTitle className="text-lg font-semibold text-yellow-800">Mobile Access Limited</AlertTitle>
                  </div>
                  <AlertDescription className="text-sm text-yellow-800 mt-1">
                    Our app is optimized for desktop use. You can browse information here, but a desktop computer is required to access all features.
                  </AlertDescription>
                </div>
              </Alert>
            </div>
          )}

        

        <section className="w-full py-12 md:py-24 px-4 bg-[#1E5AA8] text-white">
          <div className="container mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter"
            >
              Multi Token Sender for
              <br />
              <span className="text-blue-300">Optimism, Base &amp; Arbitrum</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-base sm:text-lg md:text-xl text-blue-100 max-w-3xl mx-auto"
            >
              Effortlessly distribute multiple tokens to numerous addresses in a single transaction. Perfect for airdrops, rewards, and bulk transfers.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-white text-[#1E5AA8] hover:bg-blue-100 transition-colors w-full sm:w-auto">
                <Link href="/launch-app" className="flex items-center justify-center" onClick={handleLaunchApp}>
                  Launch App
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 transition-colors w-full sm:w-auto">
                <Link href="#how-it-works" className="flex items-center justify-center" onClick={handleLearnMore}>
                  Learn More
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 bg-white px-4">
          <div className="container mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tighter text-[#1E5AA8] text-center mb-8 sm:mb-12">Features</h2>
            <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Zap className="h-8 w-8 sm:h-10 sm:w-10 text-[#1E5AA8]" />}
                title="Multi-Chain Support"
                description="Seamlessly operate on Optimism, Base &amp; Arbitrum networks."
              />
              <FeatureCard
                icon={<Coins className="h-8 w-8 sm:h-10 sm:w-10 text-[#1E5AA8]" />}
                title="Multiple Token Support"
                description="Send different tokens to various recipients in one transaction."
              />
              <FeatureCard
                icon={<Shield className="h-8 w-8 sm:h-10 sm:w-10 text-[#1E5AA8]" />}
                title="Enhanced Security"
                description="Advanced measures to ensure safe and secure transactions."
              />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 bg-blue-50 px-4">
          <div className="container mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tighter text-[#1E5AA8] text-center mb-8 sm:mb-12">How It Works</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StepCard number={1} title="Connect Your Wallet" description="Securely link your wallet to DistriButler." />
              <StepCard number={2} title="Select Tokens &amp; Recipients" description="Choose tokens and specify multiple recipients with amounts." />
              <StepCard number={3} title="Review Transaction" description="Confirm details and estimated gas fees before sending." />
              <StepCard number={4} title="Execute Bulk Transfer" description="Complete the transaction with a single approval." />
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 bg-white px-4">
          <div className="container mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tighter text-[#1E5AA8] text-center mb-8">Our Fee Structure</h2>
            <div className="max-w-3xl mx-auto">
              <p className="mb-6 text-center text-gray-800">Our fee structure is designed to be fair, transparent, and adaptable to different networks and distribution sizes.</p>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-blue-100 p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                  <h4 className="text-lg sm:text-xl font-semibold text-[#1E5AA8] mb-2">Base Fee</h4>
                  <p className="text-sm sm:text-base text-gray-800">We charge a base fee of 0.5% on the total amount of tokens or ETH being distributed, regardless of the number of recipients or the network used.</p>
                </div>
                <div className="bg-blue-100 p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                  <h4 className="text-lg sm:text-xl font-semibold text-[#1E5AA8] mb-2">Additional Fees</h4>
                  <p className="text-sm sm:text-base text-gray-800">
                    For distributions to more than 10 recipients, we apply a small additional fee per batch of 10 recipients:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-sm sm:text-base text-gray-800">
                    <li>Optimism and Base: 0.05% per batch</li>
                    <li>Arbitrum: 0.075% per batch</li>
                  </ul>
                </div>
              </div>
              <p className="mt-6 text-center text-sm sm:text-base text-gray-800">For Arbitrum, we implement a dynamic fee adjustment based on current gas prices, capped at 1.5 times the standard fee to ensure predictability.</p>
            </div>
          </div>
        </section>

        <section id="faq" className="w-full py-12 md:py-24 bg-blue-50 px-4">
          <div className="container mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tighter text-[#1E5AA8] text-center mb-8">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto space-y-4">
              <AccordionItem value="item-1" className="bg-white rounded-lg shadow-sm">
                <AccordionTrigger className="text-[#1E5AA8] hover:no-underline px-4 py-3">
                  <span className="text-left font-semibold">Which tokens are supported by DistriButler?</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-800 px-4 pb-3">
                  DistriButler supports a wide range of ERC-20 tokens on Optimism, Base &amp; Arbitrum networks. The full list of supported tokens is available in our documentation and is regularly updated.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-white rounded-lg shadow-sm">
                <AccordionTrigger className="text-[#1E5AA8] hover:no-underline px-4 py-3">
                  <span className="text-left font-semibold">How does DistriButler save on gas fees?</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-800 px-4 pb-3">
                  By batching multiple token transfers into a single transaction, DistriButler significantly reduces the overall gas cost compared to individual transfers. This is particularly beneficial for large-scale distributions or airdrops.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-white rounded-lg shadow-sm">
                <AccordionTrigger className="text-[#1E5AA8] hover:no-underline px-4 py-3">
                  <span className="text-left font-semibold">Is there a limit to the number of recipients per transaction?</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-800 px-4 pb-3">
                  The limit varies based on network conditions and the complexity of the transaction. Generally, you can send to hundreds of recipients in a single transaction, but we recommend testing with smaller batches first to optimize for gas efficiency.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-white rounded-lg shadow-sm">
                <AccordionTrigger className="text-[#1E5AA8] hover:no-underline px-4 py-3">
                  <span className="text-left font-semibold">How secure is DistriButler?</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-800 px-4 pb-3">
                  Security is our top priority. Our smart contracts have undergone thorough audits, and we implement industry-standard security practices. However, always exercise caution and verify transaction details before confirmation.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="bg-white rounded-lg shadow-sm">
                <AccordionTrigger className="text-[#1E5AA8] hover:no-underline px-4 py-3">
                  <span className="text-left font-semibold">How is the fee calculated for large distributions?</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-800 px-4 pb-3">
                  <p>For distributions to more than 10 recipients, we apply an additional fee per batch of 10 recipients beyond the first 10. The rates are:</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>Optimism and Base networks: 0.05% per batch of 10</li>
                    <li>Arbitrum network: 0.075% per batch of 10</li>
                  </ul>
                  <p className="mt-2">For example, if you&apos;re distributing 100,000 tokens to 25 recipients on Arbitrum:</p>
                  <ol className="list-decimal pl-5 mt-2">
                    <li>Base fee: 100,000 * 0.5% = 500 tokens</li>
                    <li>Additional fee for 15 recipients beyond the first 10 (2 batches): 100,000 * 0.075% * 2 = 150 tokens</li>
                    <li>Total fee: 500 + 150 = 650 tokens</li>
                  </ol>
                  <p className="mt-2">Note: On Arbitrum, the fee may increase up to 1.5 times during high network congestion.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        <section id="contact" className="w-full py-12 md:py-24 bg-white px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tighter text-[#1E5AA8] mb-6">Get in Touch</h2>
            <p className="text-base sm:text-lg text-gray-600 mb-8">Have questions or suggestions? We&apos;d love to hear from you!</p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <a href="https://twitter.com/DistriButler" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-[#1E5AA8] hover:text-[#164785] transition-colors">
                <Twitter className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                Follow us on X
              </a>
              <a href="mailto:hello@distributler.com" className="flex items-center justify-center text-[#1E5AA8] hover:text-[#164785] transition-colors">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                Email Us
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 bg-[#1E5AA8] px-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-center md:text-left text-white mb-4 md:mb-0">
            © 2024 DistriButler. All rights reserved.
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

      <Dialog open={showMobileWarning} onOpenChange={() => setShowMobileWarning(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mobile Access Limited</DialogTitle>
            <DialogDescription>
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <p>
                  The DistriButler app is optimized for desktop use. While you can browse the landing page on mobile, 
                  you&apos;ll need a desktop computer to use the full app features. We apologize for any inconvenience.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowMobileWarning(false)}>Understood</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="flex flex-col items-center space-y-3 text-center p-4 sm:p-6 bg-blue-50 rounded-lg transition-all duration-300 hover:shadow-lg"
    >
      <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-[#1E5AA8]/20 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-[#1E5AA8]">{title}</h3>
      <p className="text-sm sm:text-base text-gray-600">{description}</p>
    </motion.div>
  )
}

function StepCard({ number, title, description }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="flex flex-col items-center space-y-3 text-center p-4 sm:p-6 bg-white rounded-lg shadow-md transition-all duration-300"
    >
      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#1E5AA8] text-white text-lg sm:text-xl font-bold">
        {number}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-[#1E5AA8]">{title}</h3>
      <p className="text-sm sm:text-base text-gray-600">{description}</p>
    </motion.div>
  )
}