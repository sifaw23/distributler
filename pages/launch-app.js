import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Send, Upload, Download, AlertCircle, Menu, X, FileText } from 'lucide-react';
import Link from 'next/link';
import WalletConnect from '@/components/WalletConnect';
import { 
  switchChain, 
  getMultiTokenDistributorContract, 
  getTokenBalance, 
  getNetworkEnum,
  connectWallet
} from '@/utils/web3';
import { estimateGas } from '@/utils/gasEstimator';
import { ethers } from 'ethers';
import { Toast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function SEOHead() {
  return (
    <Head>
      <title>DistriButler App - Multi Token Distribution Tool</title>
      <meta name="description" content="Use DistriButler to send multiple tokens to numerous addresses in one transaction on Optimism, Base & Arbitrum. Efficient for airdrops and bulk transfers." />
      <meta name="keywords" content="token distribution app, crypto airdrop tool, bulk transfer dApp, Optimism, Base, Arbitrum" />
      <meta name="author" content="DistriButler" />
      <meta property="og:title" content="DistriButler App - Multi Token Distribution Tool" />
      <meta property="og:description" content="Efficient multi-token distribution on Optimism, Base & Arbitrum. Perfect for airdrops and bulk transfers." />
      <meta property="og:image" content="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DistriButler_logo%20f-RZsct2IiP8Fec8gDbvIjXnCGBjN211.png" />
      <meta property="og:url" content="https://distributler.com/launch-app" />
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
  );
}

function decodeError(error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return "Insufficient funds in your wallet to complete this transaction.";
  }
  if (error.message.includes('Internal JSON-RPC error')) {
    return "The transaction failed. This might be due to network congestion or contract limitations. Please try again with fewer recipients or smaller amounts.";
  }
  if (error.message.includes('network does not support ENS')) {
    return "Invalid Ethereum address format. Please check your input and ensure all addresses are correct.";
  }
  return error.message || 'An unknown error occurred';
}

const getBlockExplorerUrl = (chainId) => {
  switch(chainId) {
    case 10: return 'https://optimistic.etherscan.io';
    case 8453: return 'https://basescan.org';
    case 42161: return 'https://arbiscan.io';
    default: return 'https://etherscan.io'; // fallback to Ethereum mainnet
  }
};

function GasPriceOptimizer({ provider }) {
  const [gasPrice, setGasPrice] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    const fetchGasPrice = async () => {
      const price = await provider.getGasPrice();
      setGasPrice(ethers.utils.formatUnits(price, 'gwei'));
    };

    fetchGasPrice();
    const interval = setInterval(fetchGasPrice, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [provider]);

  useEffect(() => {
    if (gasPrice === null) return;

    if (gasPrice < 30) {
      setRecommendation('Gas prices are low. Good time to transact.');
    } else if (gasPrice < 50) {
      setRecommendation('Gas prices are moderate. Consider waiting if not urgent.');
    } else {
      setRecommendation('Gas prices are high. Consider waiting for lower prices if possible.');
    }
  }, [gasPrice]);

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-[#1E5AA8] text-[#1E5AA8]">
      <p>Current Gas Price: {gasPrice} Gwei</p>
      <p>{recommendation}</p>
    </div>
  );
}

export default function LaunchApp() {
  const [isMobile, setIsMobile] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [chain, setChain] = useState('optimism');
  const [token, setToken] = useState(ethers.constants.AddressZero);
  const [recipients, setRecipients] = useState('');
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [estimatedGas, setEstimatedGas] = useState(null);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isScrolled, setIsScrolled] = useState(false);
  const [addressCount, setAddressCount] = useState(0);
  const transactionsPerPage = 10;
  const MAX_ADDRESSES = 200;

  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
      const mobile = Boolean(
        userAgent.match(
          /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
        )
      );
      setIsMobile(mobile);
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);




  useEffect(() => {
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length > 0) {
        const newAddress = accounts[0];
        if (wallet && newAddress.toLowerCase() !== wallet.address.toLowerCase()) {
          try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const newWalletInfo = {
              ...wallet,
              address: newAddress,
              signer: signer,
              provider: provider
            };
            setWallet(newWalletInfo);

            // Update balance
            if (newWalletInfo && provider && token) {
              try {
                setIsLoading(true);
                let bal;
                if (token === ethers.constants.AddressZero) {
                  bal = await provider.getBalance(newAddress);
                } else {
                  const tokenContract = new ethers.Contract(
                    token,
                    ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
                    provider
                  );
                  const decimals = await tokenContract.decimals();
                  bal = await tokenContract.balanceOf(newAddress);
                  bal = ethers.utils.formatUnits(bal, decimals);
                }
                setBalance(ethers.utils.formatEther(bal));
              } catch (error) {
                console.error('Error updating balance:', error);
                setError('Failed to update balance. Please try reconnecting your wallet.');
              } finally {
                setIsLoading(false);
              }
            }

            setToastMessage({ message: 'Wallet account changed', type: 'info' });
          } catch (error) {
            console.error('Error updating wallet:', error);
            setError(error.message || 'An error occurred while updating the wallet.');
          }
        }
      } else {
        setWallet(null);
        setBalance(null);
        setToastMessage({ message: 'Wallet disconnected', type: 'info' });
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [wallet, token]);




  const updateBalance = useCallback(async (currentWallet = wallet) => {
    if (currentWallet && provider && token) {
      try {
        setIsLoading(true);
        let bal;
        if (token === ethers.constants.AddressZero) {
          bal = await provider.getBalance(currentWallet.address);
          setBalance(ethers.utils.formatEther(bal));
        } else {
          const tokenContract = new ethers.Contract(
            token,
            ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
            provider
          );
          const decimals = await tokenContract.decimals();
          bal = await tokenContract.balanceOf(currentWallet.address);
          setBalance(ethers.utils.formatUnits(bal, decimals));
        }
      } catch (error) {
        console.error('Error updating balance:', error);
        setError('Failed to update balance. Please try reconnecting your wallet.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [wallet, provider, token]);







  useEffect(() => {
    if (wallet && provider) {
      updateBalance();
    }
  }, [wallet, provider, token, updateBalance]);

  const fetchTransactionHistory = useCallback(async () => {
    if (!wallet || !wallet.provider) return;

    try {
      setIsLoading(true);
      const contract = getMultiTokenDistributorContract(wallet.provider, getChainId(chain));

      const ethFilter = contract.filters.EthDistributed();
      const tokenFilter = contract.filters.TokensDistributed();

      const ethEvents = await contract.queryFilter(ethFilter, -1000);
      const tokenEvents = await contract.queryFilter(tokenFilter, -1000);

      const allEvents = [...ethEvents, ...tokenEvents].sort((a, b) => b.blockNumber - a.blockNumber);

      const history = await Promise.all(allEvents.map(async (event) => {
        const { transactionHash, args, blockNumber } = event;
        const block = await wallet.provider.getBlock(blockNumber);
        const tx = await wallet.provider.getTransaction(transactionHash);

        if (tx.from.toLowerCase() !== wallet.address.toLowerCase()) {
          return null;
        }

        let tokenAddress, recipientCount, totalAmount, tokenSymbol;

        if (event.event === 'EthDistributed') {
          tokenAddress = ethers.constants.AddressZero;
          recipientCount = args[0].length;
          totalAmount = args[1].reduce((sum, amount) => sum.add(amount), ethers.BigNumber.from(0));
          tokenSymbol = 'ETH';
        } else {
          tokenAddress = args[0];
          recipientCount = args[1].length;
          totalAmount = args[2].reduce((sum, amount) => sum.add(amount), ethers.BigNumber.from(0));
          if (tokenAddress === ethers.constants.AddressZero) {
            tokenSymbol = 'ETH';
          } else {
            const tokenContract = new ethers.Contract(tokenAddress, ['function symbol() view returns (string)'], wallet.provider);
            tokenSymbol = await tokenContract.symbol();
          }
        }

        return {
          transactionHash,
          timestamp: new Date(block.timestamp * 1000).toLocaleString(),
          tokenSymbol,
          recipientCount,
          totalAmount: ethers.utils.formatEther(totalAmount)
        };
      }));

      setTransactionHistory(history.filter(tx => tx !== null));
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [wallet, chain]);

  useEffect(() => {
    if (wallet && wallet.provider) {
      fetchTransactionHistory();
    }
  }, [wallet, chain, fetchTransactionHistory]);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleError = (error) => {
    console.error('Error:', error);
    const errorMessage = decodeError(error);
    setError(errorMessage);
    showToast(errorMessage, 'error');
  };



  const handleWalletConnect = useCallback(async (walletInfo) => {
    if (walletInfo) {
      try {
        setIsLoading(true);
        setWallet(walletInfo);
        setProvider(walletInfo.provider);
        setChain(getChainName(walletInfo.chainId));
        await updateBalance(walletInfo);
        showToast('Wallet connected successfully', 'success');
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setWallet(null);
      setProvider(null);
      setBalance(null);
      showToast('Wallet disconnected', 'info');
    }
  }, [updateBalance]);

  useEffect(() => {
    if (wallet && provider) {
      updateBalance();
    }
  }, [wallet, provider, token, updateBalance]);

  const handleChainChange = async (e) => {
    const newChain = e.target.value;
    setChain(newChain);
    if (wallet && wallet.provider) {
      try {
        setIsLoading(true);
        const chainId = getChainId(newChain);
        const newSigner = await switchChain(wallet.provider, chainId);
        setWallet({ ...wallet, signer: newSigner });
        updateBalance();
        showToast(`Switched to ${newChain} network`, 'success');
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const validateForm = () => {
    let isValid = true;
    let errors = {};

    if (!chain) {
      errors.chain = 'Please select a chain';
      isValid = false;
    }

    if (token !== ethers.constants.AddressZero && !ethers.utils.isAddress(token)) {
      errors.token = 'Invalid token address';
      isValid = false;
    }

    if (!recipients.trim()) {
      errors.recipients = 'Please enter at least one recipient';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const validateInput = (recipientList, amountList) => {
    if (recipientList.length === 0 || amountList.length === 0) {
      throw new Error("Please enter at least one recipient and amount.");
    }
    if (recipientList.length !== amountList.length) {
      throw new Error("Number of recipients and amounts do not match.");
    }
    if (recipientList.length > MAX_ADDRESSES) {
      throw new Error(`Maximum of ${MAX_ADDRESSES} recipients allowed per transaction.`);
    }

    // Validate Ethereum addresses
    const invalidAddresses = recipientList.filter(address => 
      !ethers.utils.isAddress(address)
    );
    if (invalidAddresses.length > 0) {
      throw new Error(`Invalid Ethereum address(es) detected: ${invalidAddresses.join(', ')}. Please check your input.`);
    }

    // Validate amounts
    const invalidAmounts = amountList.filter(amount => {
      try {
        ethers.utils.parseEther(amount);
        return false;
      } catch {
        return true;
      }
    });
    if (invalidAmounts.length > 0) {
      throw new Error(`Invalid amount(s) detected: ${invalidAmounts.join(', ')}. Please ensure all amounts are valid decimal numbers.`);
    }
  };

  const checkAndHandleTokenApproval = async (tokenAddress, spenderAddress, amount) => {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ['function approve(address spender, uint256 amount) returns (bool)', 'function allowance(address owner, address spender) view returns (uint256)'],
      wallet.signer
    );

    const currentAllowance = await tokenContract.allowance(wallet.address, spenderAddress);

    if (currentAllowance.lt(amount)) {
      setApprovalStatus('Approval needed. Please confirm the transaction in your wallet.');
      try {
        setIsLoading(true);
        const approveTx = await tokenContract.approve(spenderAddress, amount);
        setApprovalStatus('Approval transaction submitted. Waiting for confirmation...');

        await approveTx.wait();
        setApprovalStatus('Approval successful. You can now proceed with the token distribution.');
        showToast('Token approval successful', 'success');
        return true;
      } catch (error) {
        handleError(error);
        return false;
      } finally {
        setIsLoading(false);
      }
    }
    return true;
  };

  const handleEstimateGas = async () => {
    if (!validateForm()) {
      return;
    }

    if (!wallet || !wallet.provider) {
      setError("Please connect your wallet first.");
      return;
    }

    setError(null);
    setEstimatedGas(null);

    try {
      setIsLoading(true);
      const lines = recipients.split('\n').map(line => line.trim()).filter(line => line);
      const [recipientList, amountList] = lines.reduce((acc, line) => {
        const [address, amount] = line.split(',').map(item => item.trim());
        acc[0].push(address);
        acc[1].push(amount);
        return acc;
      }, [[], []]);

      setAddressCount(recipientList.length);

      console.log('Number of recipients:', recipientList.length);

      validateInput(recipientList, amountList);

      const contract = getMultiTokenDistributorContract(wallet.signer, getChainId(chain));
      const networkEnum = getNetworkEnum(getChainId(chain));

      let parsedAmounts, totalAmount, tokenDecimals;

      if (token === ethers.constants.AddressZero) {
        parsedAmounts = amountList.map(a => ethers.utils.parseEther(a));
        totalAmount = parsedAmounts.reduce((sum, amount) => sum.add(amount), ethers.BigNumber.from(0));
        tokenDecimals = 18;
      } else {
        const tokenContract = new ethers.Contract(
          token,
          ['function decimals() view returns (uint8)'],
          wallet.provider
        );
        tokenDecimals = await tokenContract.decimals();
        parsedAmounts = amountList.map(a => ethers.utils.parseUnits(a, tokenDecimals));
        totalAmount = parsedAmounts.reduce((sum, amount) => sum.add(amount), ethers.BigNumber.from(0));
      }

      console.log('Total Amount:', ethers.utils.formatUnits(totalAmount, tokenDecimals));

      const feeAmount = await contract.calculateFee(totalAmount, recipientList.length, networkEnum);
      const totalWithFee = totalAmount.add(feeAmount);

      console.log('Fee Amount:', ethers.utils.formatUnits(feeAmount, tokenDecimals));
      console.log('Total with Fee:', ethers.utils.formatUnits(totalWithFee, tokenDecimals));

      // Use the contract's estimateGasCost function first
      try {
        const gasEstimate = await contract.estimateGasCost(token, recipientList.length);

        console.log('Contract Gas Estimate:', ethers.utils.formatUnits(gasEstimate, 'gwei'), 'gwei');

        const gasPrice = await wallet.provider.getGasPrice();
        const estimatedCost = gasEstimate.mul(gasPrice);

        setEstimatedGas(ethers.utils.formatEther(estimatedCost));
        showToast(`Estimated gas cost: ${ethers.utils.formatEther(estimatedCost)} ETH`, 'info');
      } catch (estimateError) {
        console.error('Contract gas estimation failed:', estimateError);

        // Fallback to manual estimation
        console.log('Falling back to manual gas estimation...');
        const gasEstimate = await estimateGas(
          wallet.provider,
          token,
          recipientList,
          parsedAmounts,
          getChainId(chain),
          totalWithFee
        );

        setEstimatedGas(gasEstimate);
        showToast(`Estimated gas cost: ${gasEstimate} ETH`, 'info');
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };




  const handleSendTokens = async () => {
    if (!validateForm()) {
      return;
    }

    if (!wallet) {
      setError('Please connect your wallet first.');
      return;
    }

    setError(null);
    setTransactionStatus('Processing transaction...');
    setApprovalStatus(null); // Reset approval status at the start of a new transaction

    try {
      setIsLoading(true);


      
      const lines = recipients.split('\n').map(line => line.trim()).filter(line => line);
      const [recipientList, amountList] = lines.reduce((acc, line) => {
        const [address, amount] = line.split(',').map(item => item.trim());
        acc[0].push(address);
        acc[1].push(amount);
        return acc;
      }, [[], []]);

      validateInput(recipientList, amountList);

      const contract = getMultiTokenDistributorContract(wallet.signer, getChainId(chain));
      const networkEnum = getNetworkEnum(getChainId(chain));

      let parsedAmounts, totalAmount, tokenDecimals, tokenSymbol;





      
      if (token === ethers.constants.AddressZero) {
        parsedAmounts = amountList.map(a => ethers.utils.parseEther(a));
        totalAmount = parsedAmounts.reduce((sum, amount) => sum.add(amount), ethers.BigNumber.from(0));
        tokenDecimals = 18;
        tokenSymbol = 'ETH';
      } else {
        const tokenContract = new ethers.Contract(
          token,
          ['function decimals() view returns (uint8)', 'function symbol() view returns (string)'],
          wallet.provider
        );
        tokenDecimals = await tokenContract.decimals();
        tokenSymbol = await tokenContract.symbol();
        parsedAmounts = amountList.map(a => ethers.utils.parseUnits(a, tokenDecimals));
        totalAmount = parsedAmounts.reduce((sum, amount) => sum.add(amount), ethers.BigNumber.from(0));
      }

      const feeAmount = await contract.calculateFee(totalAmount, recipientList.length, networkEnum);
      const totalWithFee = totalAmount.add(feeAmount);

      console.log('Total Amount:', ethers.utils.formatUnits(totalAmount, tokenDecimals), tokenSymbol);
      console.log('Fee Amount:', ethers.utils.formatUnits(feeAmount, tokenDecimals), tokenSymbol);
      console.log('Total with Fee:', ethers.utils.formatUnits(totalWithFee, tokenDecimals), tokenSymbol);

      // Check balance
      let balance;
      if (token === ethers.constants.AddressZero) {
        balance = await wallet.provider.getBalance(wallet.address);
      } else {
        const tokenContract = new ethers.Contract(token, ['function balanceOf(address) view returns (uint256)'], wallet.provider);
        balance = await tokenContract.balanceOf(wallet.address);
      }

      console.log('Balance:', ethers.utils.formatUnits(balance, tokenDecimals), tokenSymbol);

      if (balance.lt(totalWithFee)) {
        throw new Error(`Insufficient ${tokenSymbol} balance. You need at least ${ethers.utils.formatUnits(totalWithFee, tokenDecimals)} ${tokenSymbol} (including fee), but your balance is ${ethers.utils.formatUnits(balance, tokenDecimals)} ${tokenSymbol}.`);
      }








      
      let tx;
      if (token === ethers.constants.AddressZero) {
        // For ETH distribution
        tx = await contract.distributeEth(recipientList, parsedAmounts, networkEnum, {
          value: totalWithFee,
          gasLimit: 3000000 // Set a high gas limit
        });
      } else {
        // For token distribution
        // Check and handle token approval
        const isApproved = await checkAndHandleTokenApproval(token, contract.address, totalWithFee);
        if (!isApproved) {
          throw new Error('Token approval failed or was rejected.');
        }

        tx = await contract.distributeTokens(token, recipientList, parsedAmounts, networkEnum, {
          gasLimit: 3000000 // Set a high gas limit
        });
      }

      setTransactionStatus(`Transaction submitted. Hash: ${tx.hash}`);
      showToast(`Transaction submitted. Hash: ${tx.hash}`, 'info');
      await tx.wait();
      setTransactionStatus(`Transaction successful! Hash: ${tx.hash}`);
      showToast('Transaction successful!', 'success');
      updateBalance();
      fetchTransactionHistory();
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split('\n');
        const formattedLines = lines.map(line => {
          return line.replace(/^["'\s]+|["'\s]+$/g, '');
        }).filter(line => line.trim() !== '');

        setRecipients(formattedLines.join('\n'));
        setAddressCount(formattedLines.length);
        showToast('CSV file uploaded successfully', 'success');
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadTemplate = () => {
    const template = "Recipient Address,Amount\n0x1234...5678,0.1\n0x8765...4321,0.2";
    const blob = new Blob([template], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'distribution_template.csv';
    link.click();
    showToast('Template downloaded', 'success');
  };

  const getChainId = (chain) => {
    switch(chain) {
      case 'optimism': return 10;
      case 'base': return 8453;
      case 'arbitrum': return 42161;
      default: throw new Error("Unsupported chain");
    }
  };

  const getChainName = (chainId) => {
    switch(chainId) {
      case 10: return 'optimism';
      case 8453: return 'base';
      case 42161: return 'arbitrum';
      default: return 'unknown';
    }
  };

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactionHistory.slice(indexOfFirstTransaction, indexOfLastTransaction);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCloseConfirmation = useCallback(() => {
    setIsConfirmationOpen(false);
  }, []);

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <header className="px-4 h-24 flex items-center border-b border-blue-200 bg-white/80 backdrop-blur-sm">
          <Link className="flex items-center justify-center" href="/">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DistriButler_logo%20f-RZsct2IiP8Fec8gDbvIjXnCGBjN211.png"
              alt="DistriButler Logo"
              className="h-16 w-auto mr-2"
            />
          </Link>
        </header>
        <main className="flex-1 py-12 px-4" role="main">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
            <h1 className="text-2xl font-bold mb-4 text-[#1E5AA8]">Mobile Access Limited</h1>
            <p className="mb-4 text-gray-600">
              We apologize, but the DistriButler app is currently optimized for desktop use only. We&apos;re working on making it mobile-friendly in the future.
            </p>
            <p className="text-gray-600">
              For the best experience, please access DistriButler from a desktop computer.
            </p>
          </div>
        </main>
        <footer className="w-full py-6 bg-[#1E5AA8] text-white mt-12">
          <div className="container px-4 mx-auto text-center">
            <p className="text-sm">
              © 2024 DistriButler. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <>
      <SEOHead />
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <header className={`px-4 h-16 sm:h-20 flex items-center border-b border-blue-200 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 shadow-md' : 'bg-white/80'}`}>
          <div className="container mx-auto flex items-center justify-between">
            <Link className="flex items-center justify-center group" href="/">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DistriButler_logo%20f-RZsct2IiP8Fec8gDbvIjXnCGBjN211.png"
                alt="DistriButler Pro Logo"
                className="h-8 sm:h-10 w-auto transition-transform duration-300 ease-in-out group-hover:scale-105"
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
                          <Link className="text-sm font-medium text-gray-600 hover:text-[#1E5AA8] transition-colors w-full sm:w-auto text-center" href="/#features">
                            Features
                          </Link>
                          <Link className="text-sm font-medium text-gray-600 hover:text-[#1E5AA8] transition-colors w-full sm:w-auto text-center" href="/#how-it-works">
                            How It Works
                          </Link>
                          <Link className="text-sm font-medium text-gray-600 hover:text-[#1E5AA8] transition-colors w-full sm:w-auto text-center" href="/#pricing">
                            Fees
                          </Link>
                          <Link className="text-sm font-medium text-gray-600 hover:text-[#1E5AA8] transition-colors w-full sm:w-auto text-center" href="/#faq">
                            FAQ
                          </Link>
                          <Link className="text-sm font-medium text-gray-600 hover:text-[#1E5AA8] transition-colors w-full sm:w-auto text-center flex items-center" href="/DocumentationPage">
                            <FileText className="inline-block mr-1 h-4 w-4" />
                            Docs
                          </Link>
                          {wallet ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-[#1E5AA8]">Connected</span>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                          ) : (
                            <WalletConnect onConnect={handleWalletConnect} />
                          )}
                        </nav>
                      </div>
                    </header>

                    <main className="flex-1 py-12 md:py-24 lg:py-32" role="main">
                      <div className="container px-4 md:px-6 mx-auto">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-[#1E5AA8]">
                          DistriButler App
                        </h1>
                        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                          <WalletConnect onConnect={handleWalletConnect} />
                          {wallet && provider && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="font-semibold text-[#1E5AA8]">Connected: {wallet.address}</p>
                              {balance !== null && <p className="text-[#1E5AA8]">Balance: {balance} {token === ethers.constants.AddressZero ? 'ETH' : 'Tokens'}</p>}
                            </div>
                          )}
                          {approvalStatus && (
                            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-400 text-yellow-800">
                              <p>{approvalStatus}</p>
                            </div>
                          )}
                          {wallet && wallet.provider && (
                            <GasPriceOptimizer provider={wallet.provider} />
                          )}
                          <Tabs defaultValue="send" className="w-full mt-8">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="send" className="text-[#1E5AA8]">Send Tokens</TabsTrigger>
                              <TabsTrigger value="history" className="text-[#1E5AA8]">Transaction History</TabsTrigger>
                            </TabsList>
                            <TabsContent value="send">
                              <div className="space-y-6 mt-6">
                                <div className="space-y-2">
                                  <Label htmlFor="chain">Select Chain</Label>
                                  <select 
                                    id="chain" 
                                    className="w-full p-2 border rounded border-[#1E5AA8] focus:ring-2 focus:ring-[#1E5AA8]"
                                    value={chain}
                                    onChange={handleChainChange}
                                  >
                                    <option value="optimism">Optimism</option>
                                    <option value="base">Base</option>
                                    <option value="arbitrum">Arbitrum</option>
                                  </select>
                                  {formErrors.chain && <p className="text-red-500 text-sm">{formErrors.chain}</p>}
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="token">Token Address (leave empty for ETH)</Label>
                                  <Input
                                    id="token"
                                    placeholder="Token Address"
                                    value={token === ethers.constants.AddressZero ? '' : token}
                                    onChange={(e) => setToken(e.target.value || ethers.constants.AddressZero)}
                                    className="border-[#1E5AA8] focus:ring-[#1E5AA8]"
                                  />
                                  {formErrors.token && <p className="text-red-500 text-sm">{formErrors.token}</p>}
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="recipients">Recipient Addresses and Amounts</Label>
                                  <textarea
                                    id="recipients"
                                    className="w-full h-32 p-2 border rounded border-[#1E5AA8] focus:ring-2 focus:ring-[#1E5AA8]"
                                    placeholder="0x1234...5678,0.1&#10;0x8765...4321,0.2..."
                                    value={recipients}
                                    onChange={(e) => {
                                      setRecipients(e.target.value);
                                      setAddressCount(e.target.value.split('\n').filter(line => line.trim() !== '').length);
                                    }}
                                  ></textarea>
                                  {formErrors.recipients && <p className="text-red-500 text-sm">{formErrors.recipients}</p>}
                                  <p className="text-sm text-gray-600">
                                    Addresses: {addressCount} / {MAX_ADDRESSES}
                                  </p>
                                </div>
                                <div className="flex justify-between">
                                  <Button variant="outline" className="border-[#1E5AA8] text-[#1E5AA8] hover:bg-[#1E5AA8] hover:text-white">
                                    <label htmlFor="file-upload" className="cursor-pointer flex items-center">
                                      <Upload className="mr-2 h-4 w-4" />
                                      Upload CSV
                                    </label>
                                    <input 
                                      id="file-upload" 
                                      type="file" 
                                      accept=".csv" 
                                      className="hidden" 
                                      onChange={handleFileUpload}
                                    />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    className="border-[#1E5AA8] text-[#1E5AA8] hover:bg-[#1E5AA8] hover:text-white"
                                    onClick={handleDownloadTemplate}
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Template
                                  </Button>
                                </div>
                                <Button className="w-full bg-[#1E5AA8] hover:bg-[#164785] text-white" onClick={handleEstimateGas} disabled={isLoading}>
                                  {isLoading ? <Spinner className="mr-2" /> : null}
                                  {isLoading ? 'Estimating...' : 'Estimate Gas Fee'}
                                </Button>
                                {estimatedGas && (
                                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-[#1E5AA8] text-[#1E5AA8]">
                                    <p>Estimated Gas Fee: {estimatedGas} ETH</p>
                                  </div>
                                )}
                                <Button className="w-full bg-[#1E5AA8] hover:bg-[#164785] text-white" onClick={() => setIsConfirmationOpen(true)} disabled={isLoading}>
                                  {isLoading ? <Spinner className="mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                                  {isLoading ? 'Sending...' : 'Send Tokens'}
                                </Button>
                                {transactionStatus && (
                                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-[#1E5AA8] text-[#1E5AA8]">
                                    <p>{transactionStatus}</p>
                                  </div>
                                )}
                                {error && (
                                  <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-400 text-red-800 flex items-start">
                                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                                    <p>{error}</p>
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                            <TabsContent value="history">
                              <div className="mt-6">
                                <div className="bg-blue-50 p-6 rounded-lg border border-[#1E5AA8]">
                                  <h3 className="font-semibold mb-4 text-[#1E5AA8] text-xl">Recent Transactions</h3>
                                  {isLoading ? (
                                    <p className="text-gray-600">Loading transaction history...</p>
                                  ) : currentTransactions.length > 0 ? (
                                    <>
                                      <ul className="space-y-4">
                                        {currentTransactions.map((tx, index) => (
                                          <li key={tx.transactionHash} className="bg-white p-4 rounded-md shadow-sm">
                                            <div className="flex justify-between items-center">
                                              <span className="font-medium text-[#1E5AA8]">Sent {tx.totalAmount} {tx.tokenSymbol}</span>
                                              <span className="text-sm text-gray-500">{tx.timestamp}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">To {tx.recipientCount} recipients</p>
                                            <a 
                                              href={`${getBlockExplorerUrl(getChainId(chain))}/tx/${tx.transactionHash}`}
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-[#1E5AA8] hover:underline text-sm"
                                            >
                                              View on Block Explorer
                                            </a>
                                          </li>
                                        ))}
                                      </ul>
                                      <div className="flex justify-center mt-4">
                                        {[...Array(Math.ceil(transactionHistory.length / transactionsPerPage)).keys()].map((number) => (
                                          <button
                                            key={number + 1}
                                            onClick={() => paginate(number + 1)}
                                            className={`mx-1 px-3 py-1 rounded ${currentPage === number + 1 ? 'bg-[#1E5AA8] text-white' : 'bg-white text-[#1E5AA8]'}`}
                                          >
                                            {number + 1}
                                          </button>
                                        ))}
                                      </div>
                                    </>
                                  ) : (
                                    <p className="text-gray-600">No recent transactions found.</p>
                                  )}
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </div>
                    </main>
                    <footer className="w-full py-6 bg-[#1E5AA8] text-white mt-12">
                      <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm">
                          © 2024 DistriButler. All rights reserved.
                        </p>
                        <nav className="flex gap-4 sm:gap-6 mt-4 md:mt-0">
                          <Link className="text-sm hover:underline underline-offset-4" href="/TermsOfService">
                            Terms of Service
                          </Link>
                          <Link className="text-sm hover:underline underline-offset-4" href="/PrivacyPolicy">
                            Privacy Policy
                          </Link>
                        </nav>
                      </div>
                    </footer>
                  </div>




      <Dialog 
        open={isConfirmationOpen} 
        onOpenChange={setIsConfirmationOpen}
      >
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Confirm Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to send these tokens? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsConfirmationOpen(false)}>Cancel</Button>
            <Button onClick={() => { setIsConfirmationOpen(false); handleSendTokens(); }}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>




                  {toastMessage && (
                    <Toast
                      variant={toastMessage.type}
                      title={toastMessage.type === 'error' ? 'Error' : 'Information'}
                      description={toastMessage.message}
                    />
                  )}
                </>
              );
            }