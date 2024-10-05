import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Button } from "@/components/ui/button";
import { connectWallet, getAvailableWallets } from '@/utils/web3';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

export default function WalletConnect({ onConnect }) {
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [availableWallets, setAvailableWallets] = useState([]);

  useEffect(() => {
    const checkAvailableWallets = async () => {
      const wallets = await getAvailableWallets();
      setAvailableWallets(wallets);
      if (wallets.length === 0) {
        setWarning('No compatible wallets detected. Please install a Web3 wallet.');
      }
    };

    checkAvailableWallets();
  }, []);

  const handleConnectWallet = useCallback(async (walletType) => {
    setIsConnecting(true);
    setError(null);
    setWarning(null);
    try {
      const walletInfo = await connectWallet(walletType);
      setWallet(walletInfo);
      onConnect(walletInfo);

      // Set up listeners for account and chain changes
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  }, [onConnect]);

  const handleAccountsChanged = useCallback(async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnectWallet();
    } else {
      // User switched to a different account
      const newAddress = accounts[0];
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const newWalletInfo = {
        ...wallet,
        address: newAddress,
        signer: signer,
        provider: provider
      };
      setWallet(newWalletInfo);
      onConnect(newWalletInfo);
    }
  }, [wallet, onConnect]);

  const handleChainChanged = useCallback(() => {
    // Reload the page when the chain changes
    window.location.reload();
  }, []);

  const disconnectWallet = useCallback(() => {
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
    setWallet(null);
    onConnect(null);
  }, [onConnect, handleAccountsChanged, handleChainChanged]);

  useEffect(() => {
    // Cleanup function to remove listeners when component unmounts
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [handleAccountsChanged, handleChainChanged]);

  return (
    <div>
      {wallet ? (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <p className="text-sm">Connected: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</p>
          <Button onClick={disconnectWallet} variant="outline">Disconnect</Button>
        </div>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              className="w-full"
              disabled={isConnecting || availableWallets.length === 0}
            >
              {isConnecting ? 'Connecting...' : (availableWallets.length === 0 ? 'No Wallets Detected' : 'Connect Wallet')}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Select a Wallet</DialogTitle>
              <DialogDescription>
                Choose a wallet to connect to the application.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {availableWallets.map((wallet) => (
                <Button key={wallet} onClick={() => handleConnectWallet(wallet)}>
                  Connect {wallet}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
      {warning && (
        <div className="flex items-center mt-2 p-2 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <AlertTriangle className="w-4 h-4 mr-2" />
          <p className="text-sm">{warning}</p>
        </div>
      )}
      {error && (
        <div className="flex items-center mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          <AlertCircle className="w-4 h-4 mr-2" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}