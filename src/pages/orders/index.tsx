"use client" // Indicates that this is a client-side component

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import UserOrders, { Order } from "@/components/UserOrder";
import { useAccount } from "wagmi";
import useCeloConnect from "@/hooks/useCeloConnect";

const OrdersPage: React.FC = () => {
	// Extract functions and data from useCeloConnect hook
	const { checkConnection, mundoContract } = useCeloConnect();
	
	// Extract account information from wagmi hook
	const { address, chainId, isConnected } = useAccount();

	// State to hold the list of orders
	const [orders, setOrders] = useState<Order[]>([]);

	// useEffect to fetch orders when component mounts or dependencies change
	useEffect(() => {
		console.log("first"); // Debugging log to indicate useEffect execution

		const fetchOrders = async () => {
			try {
				let decimal: number;
				// Determine decimal places based on chainId
				if (chainId === 44787) {
					decimal = 6; // Celo Alfajores testnet
				} else if (chainId === 42220) {
					decimal = 18; // Celo mainnet
				}
				// Exit if mundoContract is not available
				if (!mundoContract) return;
				// Fetch orders for the current address from the contract
				const fetchedOrders = await mundoContract.getAllOrders(address); 
                
				// Map and format the fetched orders
				const formattedOrders = fetchedOrders.map((order: any) => {
					return {
						time: Number(order[0]), // Convert timestamp to number
						item: {
							id: Number(order[1][0]), // Convert ID to number
							name: order[1][1], // Item name
							category: order[1][2], // Item category
							image: order[1][3], // Item image URL
							cost: Number(ethers.formatUnits(order[1][4], decimal)), // Convert cost from wei to units
							rating: Number(order[1][5]), // Item rating
							stock: Number(order[1][6]), // Item stock
							description: order[1][7], // Item description
						},
					};
				});
				console.log(formattedOrders); // Debugging log to view formatted orders
				// Update state with the fetched and formatted orders
				setOrders(formattedOrders);
			} catch (error) {
				// Log any errors that occur during fetch
				console.error("Error fetching orders:", error);
			}
		};

		// Fetch orders only if the user is connected
		isConnected && fetchOrders();
	}, [chainId, mundoContract]); // Dependencies for useEffect

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-3xl font-bold mb-4">Your Order History</h1>
			{/* Render the UserOrders component with the fetched orders */}
			<UserOrders orders={orders} />
		</div>
	);
};

export default OrdersPage;
