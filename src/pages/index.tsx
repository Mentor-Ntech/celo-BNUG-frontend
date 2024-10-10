import FeaturedCollection from "@/components/FeaturedCollection";
import React, { useEffect, useState } from "react";
import NewArrival from "@/components/NewArrival";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import useCeloConnect from "@/hooks/useCeloConnect";
import { HeroCard } from "@/components/HeroCard";

export interface ProductType {
	id: number; // Unique identifier for the product
	name: string; // Name of the product
	category: string; // Category the product belongs to
	image: string; // URL of the product image
	price: string; // Price of the product
	rating: number; // Rating of the product
	stock: number; // Number of items in stock
	description: string; // Description of the product
}

export default function Home() {
	// State to hold the list of products
	const [products, setProducts] = useState<ProductType[]>([]);

	// Extract functions and data from useCeloConnect hook
	const { checkConnection, mundoContract } = useCeloConnect();
	console.log(mundoContract)
	
	// Extract account information from wagmi hook
	const { chainId } = useAccount();

	useEffect(() => {
		let decimal: number;
		// Determine decimal places based on chainId
		if (chainId === 44787) {
			decimal = 6; // Celo Alfajores testnet
		} else if (chainId === 42220) {
			decimal = 18; // Celo mainnet
		}

		const getAllItems = async () => {
			// Exit if mundoContract is not available
			if (!mundoContract) return;
			
			// Fetch all marketplace items from the contract
			const tx = await mundoContract.getAllMarketPlaceItems();

			// Map and format the fetched items
			const res = tx.map((t: any) => {
				return {
					id: Number(t[0]), // Convert ID to number
					name: t[1], // Product name
					category: t[2], // Product category
					image: t[3], // Product image URL
					price: ethers.formatUnits(t[4], decimal), // Convert price from wei to units
					rating: Number(t[5]), // Product rating
					stock: Number(t[6]), // Product stock
					description: t[7], // Product description
				};
			});

			// Update state with the fetched and formatted products
			setProducts(res);
		};

		// Fetch items when component mounts or mundoContract changes
		getAllItems();
	}, [mundoContract]); // Dependency array for useEffect

	return (
		<div className="p-6 flex flex-col gap-6">
			{/* Render HeroCard component */}
			<HeroCard />
			
			{/* Render FeaturedCollection component with products */}
			<FeaturedCollection products={products} />
			
			{/* Render NewArrival component with products */}
			<NewArrival products={products} />
		</div>
	);
}
