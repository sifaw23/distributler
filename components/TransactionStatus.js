import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const getExplorerUrl = (chainId, txHash) => {
  switch(chainId) {
    case 10: return `https://optimistic.etherscan.io/tx/${txHash}`;
    case 8453: return `https://basescan.org/tx/${txHash}`;
    case 42161: return `https://arbiscan.io/tx/${txHash}`;
    default: return '#';
  }
};

export default function TransactionStatus({ txHash, provider, chainId }) {
  const [status, setStatus] = useState('Pending');

  useEffect(() => {
    const checkStatus = async () => {
      if (txHash && provider) {
        try {
          const receipt = await provider.waitForTransaction(txHash);
          setStatus(receipt.status === 1 ? 'Confirmed' : 'Failed');
        } catch (error) {
          console.error('Error checking transaction status:', error);
          setStatus('Error');
        }
      }
    };
    checkStatus();
  }, [txHash, provider]);

  return (
    <div className="mt-4">
      <p className="font-semibold">Transaction Status: {status}</p>
      {txHash && (
        <a 
          href={getExplorerUrl(chainId, txHash)} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          View on Block Explorer
        </a>
      )}
    </div>
  );
}