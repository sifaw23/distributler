// utils/basenameResolver.js

import { ethers } from 'ethers';
import { BASENAME_REGISTRY_ADDRESS, BASENAME_REGISTRY_ABI } from './basenameRegistryInfo';

export async function resolveBasename(basename, provider) {
  const basenameRegistry = new ethers.Contract(BASENAME_REGISTRY_ADDRESS, BASENAME_REGISTRY_ABI, provider);

  try {
    const address = await basenameRegistry.resolve(basename);
    if (address === ethers.constants.AddressZero) {
      console.warn(`Basename ${basename} resolved to zero address`);
      return null;
    }
    return address;
  } catch (error) {
    console.error(`Error resolving Basename ${basename}:`, error);
    return null;
  }
}

export async function resolveENS(ensName, provider) {
  try {
    const address = await provider.resolveName(ensName);
    if (!address) {
      console.warn(`ENS name ${ensName} could not be resolved`);
      return null;
    }
    return address;
  } catch (error) {
    console.error(`Error resolving ENS name ${ensName}:`, error);
    return null;
  }
}

export async function resolveAddressOrName(input, provider) {
  if (ethers.utils.isAddress(input)) {
    return input; // It's already an Ethereum address
  } else if (input.endsWith('.base')) {
    return await resolveBasename(input, provider);
  } else if (input.includes('.')) {
    return await resolveENS(input, provider);
  } else {
    throw new Error(`Invalid input: ${input}. Must be an Ethereum address, a Basename ending with .base, or an ENS name.`);
  }
}