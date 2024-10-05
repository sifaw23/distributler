import { ethers } from 'ethers';

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
];

export const sendTokens = async (signer, tokenAddress, recipients, amounts) => {
  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const decimals = await tokenContract.decimals();

  for (let i = 0; i < recipients.length; i++) {
    try {
      const tx = await tokenContract.transfer(recipients[i], amounts[i]);
      await tx.wait();
      console.log(`Sent ${ethers.utils.formatUnits(amounts[i], decimals)} tokens to ${recipients[i]}`);
    } catch (error) {
      console.error(`Failed to send tokens to ${recipients[i]}:`, error);
      throw error;
    }
  }
};