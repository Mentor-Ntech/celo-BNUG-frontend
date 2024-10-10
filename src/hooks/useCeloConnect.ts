import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAccount, useSwitchChain } from "wagmi";
import { ethers, Contract } from "ethers";
import {
	MUNDO_ABI,
	MUNDO_MAINNET_CA,
	MUNDO_TESTNET_CA,
	ERC20_ABI,
	USDC_CA,
	CKES_CA,
} from "../utils/constants";

type Currency = "USDC" | "cKES" | null;

export default function useCeloConnect() {
	// Destructure isConnected and chainId from useAccount hook
	const { isConnected, chainId } = useAccount();
	// Destructure openConnectModal from useConnectModal hook
	const { openConnectModal } = useConnectModal();
	// Destructure switchChain from useSwitchChain hook
	const { switchChain } = useSwitchChain();

	// State variables for managing contracts and selected addresses
	const [mundoContract, setMundoContract] = useState<Contract | null>(null);
	const [mundoSelectedAddress, setMundoSelectedAddress] = useState<string | null>(null);
	const [tokenSelectedAddress, setTokenSelectedAddress] = useState<string | null>(null);
	const [tokenContract, setTokenContract] = useState<Contract | null>(null);
	const [currency, setCurrency] = useState<Currency>(null);

	// Function to check connection and handle chain switching
	const checkConnection = useCallback(async (): Promise<boolean> => {
		// If the wallet is not connected, show an error and open connect modal
		if (!isConnected) {
			toast.error("Please connect your wallet.");
			openConnectModal?.();
			return false;
		}
		// If the chain is not Celo Alfajores testnet or Celo mainnet, switch to Celo Alfajores testnet
		if (chainId !== 44787 && chainId !== 42220) {
			// Switch to Celo Alfajores testnet (chainId: 44787)
			switchChain({ chainId: 44787 });
			return false;
		}
		// Return true if the connection is valid and on the correct chain
		return true;
	}, [isConnected, openConnectModal, switchChain, chainId]);

	// useEffect to set up contracts and provider based on the current chain
	useEffect(() => {
		const getSignerProvider = async () => {
			// Initialize contract variables
			let contract: Contract | null = null;
			let tokenContract: Contract | null = null;
			// Create a provider and signer instance from window.ethereum
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();

			// Set up contracts based on the current chainId
			if (chainId === 44787) {
				// For Celo Alfajores testnet
				contract = new ethers.Contract(MUNDO_TESTNET_CA, MUNDO_ABI, signer);
				tokenContract = new ethers.Contract(USDC_CA, ERC20_ABI, signer);
				// Update state with testnet contract addresses and currency
				setMundoSelectedAddress(MUNDO_TESTNET_CA);
				setTokenSelectedAddress(USDC_CA);
				setCurrency("USDC");
			} else if (chainId === 42220) {
				// For Celo mainnet
				contract = new ethers.Contract(MUNDO_MAINNET_CA, MUNDO_ABI, signer);
				tokenContract = new ethers.Contract(CKES_CA, ERC20_ABI, signer);
				// Update state with mainnet contract addresses and currency
				setMundoSelectedAddress(MUNDO_MAINNET_CA);
				setTokenSelectedAddress(CKES_CA);
				setCurrency("cKES");
			}

			// Update state with contract instances
			setMundoContract(contract);
			setTokenContract(tokenContract);
		};

		// Call getSignerProvider if chainId is available
		if (chainId) {
			getSignerProvider();
		}
	}, [chainId]);

	// Return state and utility functions for use in other components
	return {
		checkConnection,
		mundoContract,
		tokenContract,
		mundoSelectedAddress,
		tokenSelectedAddress,
		currency,
	};
}
