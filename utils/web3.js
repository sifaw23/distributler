import { ethers } from 'ethers';
import { contractAddresses, contractABI } from './contractInfo';

export const getWeb3Provider = () => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    return new ethers.providers.Web3Provider(window.ethereum, "any");
  }
  return null;
};

export const getAvailableWallets = async () => {
  const wallets = [];
  if (typeof window !== 'undefined') {
    if (window.ethereum) {
      if (window.ethereum.isMetaMask) {
        wallets.push('MetaMask');
      }
      // Check for other injected wallets
      if (window.ethereum.isCoinbaseWallet) {
        wallets.push('Coinbase Wallet');
      }
      // Add more checks for other popular wallets if needed
    }
    if (window.solana) wallets.push('Phantom');
    // You can add checks for other wallet types here
  }
  return wallets;
};
export const connectWallet = async (walletType) => {
  let provider;
  switch (walletType) {
    case 'MetaMask':
      if (typeof window.ethereum !== 'undefined') {
        provider = new ethers.providers.Web3Provider(window.ethereum, "any");

        // Check if already connected
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          const network = await provider.getNetwork();
          return { provider, signer, address, chainId: network.chainId, type: walletType };
        }
      } else {
        throw new Error("MetaMask not detected");
      }
      break;
    case 'Phantom':
      // Implement Phantom connection logic
      throw new Error("Phantom wallet connection not implemented");
    // Add cases for other wallet types
    default:
      throw new Error("Unsupported wallet type");
  }

  try {
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();

    return { provider, signer, address, chainId: network.chainId, type: walletType };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    if (error.code === 4001) {
      throw new Error("User rejected the connection request.");
    } else if (error.message.includes("Already processing eth_requestAccounts")) {
      throw new Error("Connection request already pending. Please check your wallet.");
    } else {
      throw new Error("Failed to connect wallet. Please try again.");
    }
  }
};

export const getMultiTokenDistributorContract = (signerOrProvider, chainId) => {
  const address = getContractAddressForChain(chainId);
  return new ethers.Contract(address, contractABI, signerOrProvider);
};

const getContractAddressForChain = (chainId) => {
  let networkName;
  switch(chainId) {
    case 10:
      networkName = 'optimism';
      break;
    case 8453:
      networkName = 'base';
      break;
    case 42161:
      networkName = 'arbitrum';
      break;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  const address = contractAddresses[networkName];
  if (!address) {
    throw new Error(`No contract address found for network: ${networkName}`);
  }
  return address;
};

export const switchChain = async (provider, chainId) => {
  try {
    await provider.send("wallet_switchEthereumChain", [{ chainId: ethers.utils.hexValue(chainId) }]);
    const signer = provider.getSigner();
    return signer;
  } catch (error) {
    if (error.code === 4902) {
      await addChain(provider, chainId);
    } else {
      console.error("Failed to switch chain:", error);
      throw error;
    }
  }
};

const addChain = async (provider, chainId) => {
  const chainParams = getChainParams(chainId);
  await provider.send("wallet_addEthereumChain", [chainParams]);
};

const getChainParams = (chainId) => {
  switch(chainId) {
    case 10:
      return {
        chainId: ethers.utils.hexValue(10),
        chainName: "Optimism",
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://mainnet.optimism.io"],
        blockExplorerUrls: ["https://optimistic.etherscan.io"]
      };
    case 8453:
      return {
        chainId: ethers.utils.hexValue(8453),
        chainName: "Base",
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://mainnet.base.org"],
        blockExplorerUrls: ["https://basescan.org"]
      };
    case 42161:
      return {
        chainId: ethers.utils.hexValue(42161),
        chainName: "Arbitrum One",
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://arb1.arbitrum.io/rpc"],
        blockExplorerUrls: ["https://arbiscan.io"]
      };
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

export const resolveAddressOrName = async (input, provider) => {
  if (ethers.utils.isAddress(input)) {
    return input; // It's already an Ethereum address
  } else {
    try {
      const address = await provider.resolveName(input);
      if (address) {
        return address;
      } else {
        throw new Error(`Could not resolve ENS name: ${input}`);
      }
    } catch (error) {
      console.error(`Error resolving address or name: ${input}`, error);
      return null;
    }
  }
};

export const resolveRecipients = async (recipientInputs, provider) => {
  return await Promise.all(recipientInputs.map(input => resolveAddressOrName(input, provider)));
};

export const distributeEth = async (recipients, amounts, chainId) => {
  const provider = getWeb3Provider();
  const signer = provider.getSigner();
  const contract = getMultiTokenDistributorContract(signer, chainId);

  const networkEnum = getNetworkEnum(chainId);
  const totalAmount = amounts.reduce((sum, amount) => sum.add(amount), ethers.BigNumber.from(0));

  const feeAmount = await contract.calculateFee(totalAmount, recipients.length, networkEnum);
  const totalWithFee = totalAmount.add(feeAmount);

  const tx = await contract.distributeEth(recipients, amounts, networkEnum, {
    value: totalWithFee,
    gasLimit: 3000000 // Set a high gas limit
  });

  return tx;
};

export const distributeTokens = async (tokenAddress, recipients, amounts, chainId) => {
  const provider = getWeb3Provider();
  const signer = provider.getSigner();
  const contract = getMultiTokenDistributorContract(signer, chainId);

  const networkEnum = getNetworkEnum(chainId);

  // First, approve the contract to spend tokens
  const tokenContract = new ethers.Contract(
    tokenAddress,
    ['function approve(address spender, uint256 amount) returns (bool)'],
    signer
  );

  const totalAmount = amounts.reduce((sum, amount) => sum.add(amount), ethers.BigNumber.from(0));
  const feeAmount = await contract.calculateFee(totalAmount, recipients.length, networkEnum);
  const totalWithFee = totalAmount.add(feeAmount);

  const approveTx = await tokenContract.approve(contract.address, totalWithFee);
  await approveTx.wait();

  const tx = await contract.distributeTokens(tokenAddress, recipients, amounts, networkEnum, {
    gasLimit: 3000000 // Set a high gas limit
  });

  return tx;
};

export const getNetworkEnum = (chainId) => {
  switch(chainId) {
    case 10: return 0; // Optimism
    case 8453: return 1; // Base
    case 42161: return 2; // Arbitrum
    default: throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

export const getTokenBalance = async (tokenAddress, accountAddress, chainId) => {
  const provider = getWeb3Provider();
  if (!provider) {
    throw new Error("No Web3 provider detected");
  }

  if (tokenAddress === ethers.constants.AddressZero) {
    const balance = await provider.getBalance(accountAddress);
    return ethers.utils.formatEther(balance);
  } else {
    const tokenContract = new ethers.Contract(tokenAddress, [
      "function balanceOf(address) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ], provider);

    const balance = await tokenContract.balanceOf(accountAddress);
    const decimals = await tokenContract.decimals();
    return ethers.utils.formatUnits(balance, decimals);
  }
};

export const estimateGas = async (provider, token, recipients, amounts, chainId, totalValue) => {
  const signer = provider.getSigner();
  const contract = getMultiTokenDistributorContract(signer, chainId);

  try {
    const networkEnum = getNetworkEnum(chainId);

    let gasEstimate;
    if (token === ethers.constants.AddressZero) {
      // Estimating for ETH distribution
      const feeAmount = await contract.calculateFee(totalValue, recipients.length, networkEnum);
      const totalWithFee = totalValue.add(feeAmount);

      gasEstimate = await contract.estimateGas.distributeEth(
        recipients, 
        amounts, 
        networkEnum,
        { value: totalWithFee }
      );
    } else {
      // Estimating for token distribution
      gasEstimate = await contract.estimateGas.distributeTokens(
        token, 
        recipients, 
        amounts,
        networkEnum
      );
    }

    // Add a buffer to the gas estimate
    gasEstimate = gasEstimate.mul(120).div(100); // Add 20% buffer

    const gasPrice = await provider.getGasPrice();
    const totalCost = gasEstimate.mul(gasPrice);

    return ethers.utils.formatEther(totalCost);
  } catch (error) {
    console.error('Error estimating gas:', error);
    throw new Error('Failed to estimate gas. The transaction might exceed contract limits or there might be an issue with the input data.');
  }
};