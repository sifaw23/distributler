import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { connectWallet, switchChain, distributeTokens, distributeEth, resolveRecipients } from '../utils/web3';
import { estimateGas } from '../utils/gasEstimator';
import TransactionStatus from './TransactionStatus';
import { contractAddresses } from '../utils/contractInfo';

export default function MultiTokenSenderForm() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState('');
  const [recipients, setRecipients] = useState([{ address: '', amount: '' }]);
  const [tokenAddress, setTokenAddress] = useState(ethers.constants.AddressZero);
  const [selectedChain, setSelectedChain] = useState('optimism');
  const [gasEstimate, setGasEstimate] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  const connectWalletHandler = async () => {
    try {
      const { provider, signer, address } = await connectWallet();
      setProvider(provider);
      setSigner(signer);
      setAddress(address);
      setWalletConnected(true);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setError("Failed to connect wallet. Please try again.");
    }
  };

  const handleChainChange = async (e) => {
    setSelectedChain(e.target.value);
    if (provider) {
      try {
        await switchChain(provider, getChainId(e.target.value));
      } catch (error) {
        console.error("Failed to switch chain:", error);
        setError("Failed to switch network. Please try switching manually in your wallet.");
      }
    }
  };

  const addRecipient = () => {
    setRecipients([...recipients, { address: '', amount: '' }]);
  };

  const updateRecipient = (index, field, value) => {
    const newRecipients = [...recipients];
    newRecipients[index][field] = value;
    setRecipients(newRecipients);
  };

  const handleEstimateGas = async () => {
    if (!provider || !signer || recipients.length === 0) {
      setError("Please fill in all fields and connect your wallet before estimating gas.");
      return;
    }

    try {
      const { validRecipients, validAmounts } = await processRecipients();
      if (validRecipients.length === 0) {
        setError("No valid recipients. Please check your inputs.");
        return;
      }

      const chainId = getChainId(selectedChain);
      const totalAmount = validAmounts.reduce((sum, amount) => sum.add(amount), ethers.BigNumber.from(0));

      // Check if the sender has sufficient balance
      const balance = await getBalance(signer, tokenAddress);
      if (balance.lt(totalAmount)) {
        setError("Insufficient balance to complete this transaction.");
        return;
      }

      const estimate = await estimateGas(
        provider,
        tokenAddress,
        validRecipients,
        validAmounts,
        chainId,
        totalAmount
      );
      setGasEstimate(estimate);
    } catch (error) {
      console.error('Error estimating gas:', error);
      setError(error.message || "Failed to estimate gas. Please check your inputs.");
    }
  };

  const processRecipients = async () => {
    const recipientInputs = recipients.map(r => r.address);
    const amounts = recipients.map(r => ethers.utils.parseUnits(r.amount, 18));

    // Resolve recipient addresses
    const resolvedRecipients = await resolveRecipients(recipientInputs, provider);

    // Filter out any failed resolutions
    const validRecipients = resolvedRecipients.filter(address => address !== null);
    const validAmounts = amounts.filter((_, index) => resolvedRecipients[index] !== null);

    if (validRecipients.length !== recipientInputs.length) {
      setWarning(`Some addresses could not be resolved. Proceeding with ${validRecipients.length} out of ${recipientInputs.length} recipients.`);
    }

    return { validRecipients, validAmounts };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setWarning(null);
    if (!signer) {
      setError("Please connect your wallet first.");
      return;
    }
    try {
      const chainId = getChainId(selectedChain);
      const { validRecipients, validAmounts } = await processRecipients();

      if (validRecipients.length === 0) {
        setError("No valid recipients. Please check your inputs.");
        return;
      }

      // Check if the sender has sufficient balance
      const balance = await getBalance(signer, tokenAddress);
      const totalAmount = validAmounts.reduce((sum, amount) => sum.add(amount), ethers.BigNumber.from(0));

      if (balance.lt(totalAmount)) {
        setError("Insufficient balance to complete this transaction.");
        return;
      }

      let tx;
      if (tokenAddress === ethers.constants.AddressZero) {
        tx = await distributeEth(validRecipients, validAmounts, chainId);
      } else {
        tx = await distributeTokens(tokenAddress, validRecipients, validAmounts, chainId);
      }
      setTxHash(tx.hash);
      await tx.wait();
      setError(null);
    } catch (error) {
      console.error('Error sending tokens:', error);
      setError(error.message || "Failed to send tokens. Please check your inputs and try again.");
    }
  };

  const getBalance = async (signer, tokenAddress) => {
    if (tokenAddress === ethers.constants.AddressZero) {
      return await signer.getBalance();
    } else {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function balanceOf(address) view returns (uint256)'],
        signer
      );
      return await tokenContract.balanceOf(await signer.getAddress());
    }
  };

  const getChainId = (chain) => {
    switch(chain) {
      case 'optimism': return 10;
      case 'base': return 8453;
      case 'arbitrum': return 42161;
      default: throw new Error("Unsupported chain");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Multi Token Sender</CardTitle>
        <CardDescription>Send tokens to multiple recipients in one transaction</CardDescription>
      </CardHeader>
      <CardContent>
        {!walletConnected ? (
          <Button onClick={connectWalletHandler}>Connect Wallet</Button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select value={selectedChain} onChange={handleChainChange}>
              <option value="optimism">Optimism</option>
              <option value="base">Base</option>
              <option value="arbitrum">Arbitrum</option>
            </Select>
            <Input
              placeholder="Token Address (leave empty for ETH)"
              value={tokenAddress === ethers.constants.AddressZero ? '' : tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value || ethers.constants.AddressZero)}
            />
            {recipients.map((recipient, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  placeholder="Recipient Address or ENS name"
                  value={recipient.address}
                  onChange={(e) => updateRecipient(index, 'address', e.target.value)}
                />
                <Input
                  placeholder="Amount"
                  value={recipient.amount}
                  onChange={(e) => updateRecipient(index, 'amount', e.target.value)}
                />
              </div>
            ))}
            <Button type="button" onClick={addRecipient}>Add Recipient</Button>
            <Button type="button" onClick={handleEstimateGas}>Estimate Gas Fee</Button>
            {gasEstimate && (
              <p>Estimated gas cost: {gasEstimate} ETH</p>
            )}
            <Button type="submit">Send Tokens</Button>
          </form>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {warning && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>{warning}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        {txHash && <TransactionStatus txHash={txHash} provider={provider} chainId={getChainId(selectedChain)} />}
      </CardFooter>
    </Card>
  );
}