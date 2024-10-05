import { ethers } from 'ethers';
import { getMultiTokenDistributorContract, resolveRecipients } from './web3';

export const estimateGas = async (provider, tokenAddress, recipients, amounts, chainId, totalValue) => {
  const signer = provider.getSigner();
  const contract = getMultiTokenDistributorContract(signer, chainId);

  try {
    const networkEnum = getNetworkEnum(chainId);

    // Resolve recipient addresses
    const resolvedRecipients = await resolveRecipients(recipients, provider);

    // Filter out any failed resolutions
    const validRecipients = resolvedRecipients.filter(address => address !== null);
    const validAmounts = amounts.filter((_, index) => resolvedRecipients[index] !== null);

    if (validRecipients.length !== recipients.length) {
      console.warn(`Some addresses or Basenames could not be resolved. Proceeding with ${validRecipients.length} valid recipients.`);
    }

    let gasEstimate;
    if (tokenAddress === ethers.constants.AddressZero) {
      // Estimating for ETH distribution
      const feeAmount = await contract.calculateFee(totalValue, validRecipients.length, networkEnum);
      const totalWithFee = totalValue.add(feeAmount);

      gasEstimate = await contract.estimateGas.distributeEth(
        validRecipients, 
        validAmounts, 
        networkEnum,
        { value: totalWithFee }
      );
    } else {
      // Estimating for token distribution
      gasEstimate = await contract.estimateGas.distributeTokens(
        tokenAddress, 
        validRecipients, 
        validAmounts,
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
    if (error.error && error.error.data) {
      try {
        const decodedError = contract.interface.parseError(error.error.data);
        if (decodedError) {
          throw new Error(`Contract error: ${decodedError.name}`);
        }
      } catch (parseError) {
        console.error('Error parsing contract error:', parseError);
      }
    }
    throw new Error('Failed to estimate gas. The transaction might exceed contract limits or there might be an issue with the input data.');
  }
};

const getNetworkEnum = (chainId) => {
  switch(chainId) {
    case 10: return 0; // Optimism
    case 8453: return 1; // Base
    case 42161: return 2; // Arbitrum
    default: throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};