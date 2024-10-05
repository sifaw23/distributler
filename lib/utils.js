import { ethers } from 'ethers';
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility function for merging class names
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// ABI for ERC20 token interface
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

// ABI for BulkTokenSender contract
const BULK_TOKEN_SENDER_ABI = [
  "function bulkTransferERC20(address token, address[] memory recipients, uint256[] memory amounts)",
  "function bulkTransferETH(address[] memory recipients, uint256[] memory amounts) payable"
];

// Contract addresses (replace with actual addresses after deployment)
const BULK_TOKEN_SENDER_ADDRESS = {
  optimism: "0x...", // Replace with actual address on Optimism
  base: "0x..."      // Replace with actual address on Base
};

export const getTokenBalance = async (tokenAddress, walletAddress, chain) => {
  const provider = new ethers.providers.JsonRpcProvider(NETWORKS[chain].rpcUrl);
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const balance = await contract.balanceOf(walletAddress);
  return ethers.utils.formatUnits(balance, 18); // Assuming 18 decimals, adjust if needed
};

export const approveToken = async (tokenAddress, spenderAddress, amount, signer) => {
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const transaction = await contract.approve(spenderAddress, ethers.utils.parseUnits(amount, 18));
  return transaction.wait();
};

export const bulkSendTokens = async (tokenAddress, recipients, amounts, signer, chain) => {
  const bulkSenderAddress = BULK_TOKEN_SENDER_ADDRESS[chain];
  const bulkSender = new ethers.Contract(bulkSenderAddress, BULK_TOKEN_SENDER_ABI, signer);

  if (tokenAddress === ethers.constants.AddressZero) {
    // Sending ETH
    const totalAmount = amounts.reduce((a, b) => a.add(b), ethers.BigNumber.from(0));
    const transaction = await bulkSender.bulkTransferETH(recipients, amounts, { value: totalAmount });
    return transaction.wait();
  } else {
    // Sending ERC20 tokens
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const totalAmount = amounts.reduce((a, b) => a.add(b), ethers.BigNumber.from(0));

    // Check allowance and approve if necessary
    const allowance = await token.allowance(await signer.getAddress(), bulkSenderAddress);
    if (allowance.lt(totalAmount)) {
      const approveTx = await token.approve(bulkSenderAddress, totalAmount);
      await approveTx.wait();
    }

    const transaction = await bulkSender.bulkTransferERC20(tokenAddress, recipients, amounts);
    return transaction.wait();
  }
};

export const estimateGasFee = async (tokenAddress, recipients, amounts, chain) => {
  const provider = new ethers.providers.JsonRpcProvider(NETWORKS[chain].rpcUrl);
  const bulkSenderAddress = BULK_TOKEN_SENDER_ADDRESS[chain];
  const bulkSender = new ethers.Contract(bulkSenderAddress, BULK_TOKEN_SENDER_ABI, provider);

  let gasEstimate;
  if (tokenAddress === ethers.constants.AddressZero) {
    // Estimating for ETH transfer
    gasEstimate = await bulkSender.estimateGas.bulkTransferETH(recipients, amounts, { value: ethers.utils.parseEther("1") });
  } else {
    // Estimating for ERC20 transfer
    gasEstimate = await bulkSender.estimateGas.bulkTransferERC20(tokenAddress, recipients, amounts);
  }

  const gasPrice = await provider.getGasPrice();
  const gasFee = gasEstimate.mul(gasPrice);
  return ethers.utils.formatEther(gasFee);
};

export const switchNetwork = async (chainId) => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.utils.hexValue(chainId) }],
      });
    } catch (error) {
      if (error.code === 4902) {
        // Chain not added, implement adding the chain
        console.error('Network not added to MetaMask');
      } else {
        console.error('Failed to switch network:', error);
      }
    }
  }
};

// Add Optimism and Base network configurations
export const NETWORKS = {
  optimism: {
    chainId: 10,
    name: 'Optimism',
    rpcUrl: 'https://mainnet.optimism.io',
  },
  base: {
    chainId: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
  },
};