"use client"; // Enables server-side rendering for this component in Next.js

import React, { FormEvent, useEffect, useState } from "react"; // Importing React and hooks for managing state, effects, and form events
import { ReactNode } from "react"; // Importing the type for children components
import Header from "../Header"; // Importing Header component
import Footer from "../Footer"; // Importing Footer component
import useCeloConnect from "../../hooks/useCeloConnect"; // Custom hook to handle Celo connection logic
import { ethers } from "ethers"; // Importing ethers.js for Ethereum-related utilities
import { useAccount } from "wagmi"; // Wagmi hook for accessing wallet account details
import { toast } from "react-toastify"; // Toast notifications for user feedback
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Importing components from the UI for a modal dialog
import { Button } from "../ui/button"; // Importing a button component
import { Label } from "../ui/label"; // Importing label component
import { Input } from "../ui/input"; // Importing input component
import { useRouter } from "next/navigation"; // Hook to enable routing in Next.js

// Interface for defining props for the layout component
interface LayoutProps {
	children: ReactNode; // 'children' represents any child component passed into this layout
}

// Main RootLayout component definition
const RootLayout: React.FC<LayoutProps> = ({ children }) => {
	const { checkConnection, mundoContract, currency, tokenSelectedAddress } =
		useCeloConnect(); // Destructuring properties from the custom Celo hook
	const { chain, chainId, address, isConnected } = useAccount(); // Getting account, chain info, and connection status using wagmi
	const [isTokenAddressSet, setIsTokenAddressSet] = useState(false); // State to track if a token address is set
	const [isFetching, setIsFetching] = useState(true); // State to handle loading state while fetching data
	const [tokenAddress, setTokenAddress] = useState(""); // State to store the input token address
	const [openModal, setOpenModal] = useState(false); // State to manage the visibility of the modal
	const router = useRouter(); // Router for refreshing or redirecting the page

	// Function to handle setting a token address when the form is submitted
	const handleSetToken = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault(); // Prevent default form submission
		try {
			toast.loading("Adding token address"); // Show loading notification
			if (!ethers.isAddress(tokenAddress)) { // Check if the token address is valid using ethers.js
				toast.error("Invalid token address"); // Show error if invalid
				return;
			}
			if (!mundoContract) return; // Exit if the contract is not available
			const tx = await mundoContract.addToken(tokenAddress); // Call contract function to add the token
			await tx.wait(); // Wait for the transaction to be confirmed

			console.log(tx); // Log the transaction

			toast.dismiss(); // Dismiss loading toast
			toast.success("Token address added successfully"); // Show success notification
			setOpenModal(false); // Close the modal after success
			router.refresh(); // Refresh the page to update data
		} catch (error) {
			console.log(error); // Log the error for debugging
			toast.dismiss(); // Dismiss loading toast
			toast.error("Failed to add token address"); // Show error notification if the transaction fails
		}
	};

	// useEffect hook to check if the token address is set when the component mounts
	useEffect(() => {
		const checkContractAddress = async () => {
			try {
				const connect = await checkConnection(); // Check if wallet is connected
				if (!connect || !mundoContract) return; // Exit if connection or contract is not available
				const owner = await mundoContract?.owner(); // Get the contract owner

				// Check if the selected token address is allowed by the contract
				const isTokenAllowed = await mundoContract.checkAllowedTokens(tokenSelectedAddress);
				if (owner === address && !isTokenAllowed) {
					setOpenModal(true); // Open the modal if the user is the owner and the token is not allowed
				}
				console.log(isTokenAllowed); // Log the token allowed status
				setIsTokenAddressSet(isTokenAllowed); // Set the token address status in the state
			} catch (error) {
				toast.error("Failed to check token address"); // Show error notification if the check fails
			} finally {
				setIsFetching(false); // Stop the loading state after the check
			}
		};
		checkContractAddress(); // Call the function to check the contract address
	}, [mundoContract, chainId]); // Dependency array ensures this effect runs when mundoContract or chainId changes

	// JSX for rendering the layout
	return (
		<div className="flex flex-col min-h-screen text-white bg-black">
			<Header /> {/* Renders the Header component */}
			{!isFetching && isConnected && !isTokenAddressSet && (
				// Conditional rendering of the alert dialog if the user is connected and token address is not set
				<AlertDialog open={openModal} onOpenChange={setOpenModal}>
					<AlertDialogContent className="bg-black text-white">
						<AlertDialogHeader>
							<AlertDialogTitle>
								Set Token Address For Payments
							</AlertDialogTitle>
							<AlertDialogDescription>
								Fill the form below to set token address for Mundo on{" "}
								{chain?.name} {/* Show the current chain name */}
							</AlertDialogDescription>
							<form onSubmit={handleSetToken} className="space-y-4">
								<div className="grid w-full text-white mt-4 space-y-1 items-center gap-1.5">
									<Label className="text-white" htmlFor="name">
										Token address for {currency} {/* Display the current currency */}
									</Label>
									<Input
										type="text"
										id="tokenAddress"
										placeholder="0x0000000000000000000000000000000"
										value={tokenAddress} // Input value is the token address state
										className="text-white"
										required
										onChange={(e) => setTokenAddress(e.target.value)} // Update the token address state on change
									/>
								</div>

								<Button
									type="submit"
									className="bg-green-800 float-end hover:bg-green-700"
								>
									Set token address {/* Button to submit the form */}
								</Button>
							</form>
						</AlertDialogHeader>
					</AlertDialogContent>
				</AlertDialog>
			)}
			<main className="flex-grow">{children}</main> {/* Main content area for child components */}
			<div className="mt-auto">
				<Footer /> {/* Footer component displayed at the bottom */}
			</div>
		</div>
	);
};

export default RootLayout; // Export the RootLayout component as default
