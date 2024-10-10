"use client"; // Indicates that this is a client-side component

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductType } from "..";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import useCeloConnect from "@/hooks/useCeloConnect";

const item = () => {
	// Extract functions and data from useCeloConnect hook
	const {
		checkConnection,
		mundoContract,
		tokenContract,
		mundoSelectedAddress,
		tokenSelectedAddress,
		currency
	} = useCeloConnect();
	
	// State to hold the product data
	const [product, setProduct] = useState<ProductType>({
		id: 0,
		name: "",
		category: "",
		image: "",
		price: "",
		rating: 0,
		stock: 0,
		description: "",
	});
	
	// Extract chainId from useAccount hook
	const { chainId } = useAccount();
	
	// Router instance to handle navigation
	const router = useRouter();
	
	// Extract id from the URL parameters
	const params = useParams<{ tag: string; id: string }>();
	const id = params?.id;

	// useEffect to fetch product details when component mounts or dependencies change
	useEffect(() => {
		const getProduct = async () => {
			let decimal: number = 18;
			// Determine decimal places based on chainId
			if (chainId === 44787) {
				decimal = 6; // Celo Alfajores testnet
			} else if (chainId === 42220) {
				decimal = 18; // Celo mainnet
			}
			// Check connection and exit if not connected
			const connect = await checkConnection();
			if (!connect) return;
			// Exit if mundoContract or id is not available
			if (!mundoContract || !id) return;
			// Fetch product details from the contract
			const tx = await mundoContract.getItem(id);

			// Map the contract response to the ProductType format
			const item: ProductType = {
				id: Number(tx[0]),
				name: tx[1],
				category: tx[2],
				image: tx[3],
				price: ethers.formatUnits(tx[4], decimal), // Format price based on decimal
				rating: Number(tx[5]),
				stock: Number(tx[6]),
				description: tx[7],
			};
			// Update state with fetched product details
			setProduct(item);
		};
		// Call getProduct to fetch product details
		getProduct();
	}, [mundoContract, id, chainId]);

	// Function to handle the purchase of the product
	const handleBuy = async () => {
		let decimal: number = 18;
		// Determine decimal places based on chainId
		if (chainId === 44787) {
			decimal = 6; // Celo Alfajores testnet
		} else if (chainId === 42220) {
			decimal = 18; // Celo mainnet
		}
		// Check connection and exit if not connected
		const connect = await checkConnection();
		if (!connect) return;
		// Exit if mundoContract or tokenContract is not available
		if (!mundoContract || !tokenContract) return;
		try {
			// Show loading toast for approval
			toast.loading("Approving, please wait...");
			// Log the product price (for debugging)
			console.log(product.price);
			// Check connection again (optional, as it's already done above)
			checkConnection();
			// Convert product price to units based on decimal
			const price = ethers.parseUnits(product.price, decimal);
			// Approve the token contract to spend the required amount
			const approveTx = await tokenContract.approve(
				mundoSelectedAddress,
				price
			);
			// Wait for approval transaction to be mined
			await approveTx.wait();
			// Dismiss the approval toast and show purchasing toast
			toast.dismiss();
			toast.loading("Purchasing");
			// Execute purchase transaction
			const buyTx = await mundoContract.buy(id, tokenSelectedAddress);
			// Dismiss the purchasing toast and show confirmation toast
			toast.dismiss();
			toast.loading("Waiting for confirmation");
			// Wait for purchase transaction to be mined
			await buyTx.wait();
			// Dismiss the confirmation toast and show success toast
			toast.dismiss();
			toast.success("Purchase successful");
			// Refresh the router to update the view
			router.refresh();
		} catch (error) {
			// Log any errors and show error toast
			console.log(error);
			toast.dismiss();
			toast.error("Failed to purchase item");
		}
	};

	// Render the product details and purchase button
	return (
		<div className="mt-[52px] p-3 md:p-6">
			<h4 className="pl-[74px] font-Manrope mb-[53px] text-[22px] leading-[28px] font-bold text-[#FFFFFF]">
				Product
			</h4>
			<div className="flex items-center pl-[40px] mb-[20px]">
				<img
					src={product.image}
					alt="Cryptovoxels"
					className="w-[580px] h-[301px] mr-[103px]"
				/>

				<div className="flex flex-col space-y-2">
					<p className="text-[#FFFFFF] font-Manrope text-[48px] leading-[65.57px] font-medium mb-[91px]">
						{product.name}
					</p>
					<p className="text-[gray] text-sm mt-3">
						Left in stock: {product.stock}
					</p>

					<p className="text-xl">Price: {Number(product.price).toFixed(2)} {currency}</p>
					<button
						onClick={handleBuy}
						className="w-[417px] text-[14px] leading-[21px] font-manrope font-bold mr-[61px] px-[16px] py-[8px] bg-[#1A5CE5] text-[#FFFFFF] rounded"
					>
						Buy
					</button>
				</div>
			</div>

			<div className="">
				<h4 className="pt-[15px] font-bold text-xl w-[902px] h-[28px] mb-5">
					Description
				</h4>
				<p className="">{product.description}</p>
			</div>
		</div>
	);
};

export default item;
