import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { ProductType } from "..";
import useCeloConnect from "@/hooks/useCeloConnect";

const Categories = () => {
	// Extract checkConnection, mundoContract, and currency from useCeloConnect hook
	const { checkConnection, mundoContract, currency } = useCeloConnect();
	// State variables to store categorized product data
	const [electronicsCat, setElectronicsCat] = useState<ProductType[]>([]);
	const [clothingsCat, setClothingsCat] = useState<ProductType[]>([]);
	const [petsCat, setPetsCat] = useState<ProductType[]>([]);
	// Extract chainId from useAccount hook
	const { chainId } = useAccount();

	// useEffect to fetch and categorize items from the contract
	useEffect(() => {
		let decimal: number;
		// Determine decimal places based on chainId
		if (chainId === 44787) {
			decimal = 6; // Celo Alfajores testnet
		} else if (chainId === 42220) {
			decimal = 18; // Celo mainnet
		}
		// Return early if mundoContract is not available
		if (!mundoContract) return;
		// Function to fetch all items from the contract and categorize them
		const getAllItems = async () => {
			// Fetch all marketplace items from the contract
			const items = await mundoContract.getAllMarketPlaceItems();

			// Map items to the ProductType format
			const res = items.map((item: any) => {
				return {
					id: Number(item[0]),
					name: item[1],
					category: item[2],
					image: item[3],
					price: ethers.formatUnits(item[4], decimal), // Format price based on decimal
					rating: Number(item[5]),
					stock: Number(item[6]),
					description: item[7],
				};
			});

			// Filter items by category
			const filteredElect = res.filter(
				(item: ProductType) => item.category === "electronics"
			);
			const filteredClothing = res.filter(
				(item: ProductType) => item.category === "clothing"
			);
			const filteredPets = res.filter((item: any) => item.category === "pets");

			// Update state with filtered items
			setElectronicsCat(filteredElect);
			setClothingsCat(filteredClothing);
			setPetsCat(filteredPets);
		};
		// Call getAllItems if mundoContract is available
		mundoContract && getAllItems();
	}, [mundoContract, chainId]);

	// Render the categories and their items
	return (
		<div className="space-y-7">
			<div className="px-4 md:px-8 lg:px-[160px] my-4">
				<h3 className="text-[#9EA6B8] text-[16px] font-medium my-[36px]">
					Categories / Products
				</h3>
			</div>

			{electronicsCat?.length > 0 && (
				<div className="px-4 md:px-8 lg:px-[160px]">
					<h2 className="text-3xl text-[#FFFFFF] font-semibold my-5">
						Electronics
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 my-4">
						{electronicsCat.map((item) => (
							<>
								<div key={item.id} className="">
									<Link
										href={`/item/${item.id}`}
										className=" rounded-lg hover:bg-gray-800 flex flex-col"
									>
										<img
											src={item.image}
											alt={item.name}
											className="w-full h-auto "
										/>
										<h3 className="text-[16px] text-[#FFFFFF] font-medium mt-5">
											{item.name}
										</h3>
										{/* <p className="text-[14px] text-[#9EA6B8] mt-2">
											{item.description}
										</p> */}
										<p className="text-xl">
											Price: {Number(item.price).toFixed(2)} {currency}
										</p>
									</Link>
								</div>
							</>
						))}
					</div>
				</div>
			)}

			{clothingsCat?.length > 0 && (
				<div className="px-4 md:px-8 lg:px-[160px]">
					<h2 className="text-3xl text-[#FFFFFF] font-semibold my-5">
						Clothing
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 my-4">
						{clothingsCat.map((item) => (
							<>
								<div key={item.id} className="">
									<Link
										href={`/item/${item.id}`}
										className=" rounded-lg hover:bg-gray-800 flex flex-col"
									>
										<img
											src={item.image}
											alt={item.name}
											className="w-full h-auto "
										/>
										<h3 className="text-[16px] text-[#FFFFFF] font-medium mt-5">
											{item.name}
										</h3>
										{/* <p className="text-[14px] text-[#9EA6B8] mt-2">
											{item.description}
										</p> */}
										<p className="text-xl">
										Price: {Number(item.price).toFixed(2)} {currency}
										</p>
									</Link>
								</div>
							</>
						))}
					</div>
				</div>
			)}

			{petsCat.length > 0 && (
				<div className="px-4 md:px-8 lg:px-[160px]">
					<h2 className="text-3xl text-[#FFFFFF] font-semibold my-5">Pets</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 my-4">
						{petsCat.map((item) => (
							<>
								<div key={item.id} className="">
									<Link
										href={`/item/${item.id}`}
										className=" rounded-lg hover:bg-gray-800 flex flex-col"
									>
										<img
											src={item.image}
											alt={item.name}
											className="w-full h-auto "
										/>
										<h3 className="text-[16px] text-[#FFFFFF] font-medium mt-5">
											{item.name}
										</h3>
										{/* <p className="text-[14px] text-[#9EA6B8] mt-2">
											{item.description}
										</p> */}
										<p className="text-xl">
										Price: {Number(item.price).toFixed(2)} {currency}
										</p>
									</Link>
								</div>
							</>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default Categories;
