import Image from "next/image"; // Importing the Image component for optimized image rendering in Next.js
import Link from "next/link"; // Importing Link component for client-side navigation
import { History } from "lucide-react"; // Importing History icon from the Lucide React library
import { Button } from "./ui/button"; // Importing a custom Button component from the UI folder
import React, { useState, useEffect, FormEvent } from "react"; // Importing React, hooks, and FormEvent for handling form submissions
import { ConnectButton } from "@rainbow-me/rainbowkit"; // Importing ConnectButton for wallet connection from RainbowKit
import { useAccount, useConnect } from "wagmi"; // Importing hooks from Wagmi for managing wallet connection and account state
import { injected } from "wagmi/connectors"; // Importing injected connector for wallet integration (e.g., MetaMask)
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Importing custom AlertDialog components for displaying modals
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Importing custom Select components for dropdowns
import { Label } from "./ui/label"; // Importing Label component for form labels
import { Input } from "./ui/input"; // Importing Input component for form inputs
import useCeloConnect from "../hooks/useCeloConnect"; // Importing custom hook for Celo blockchain integration
import { ethers } from "ethers"; // Importing ethers.js library for interacting with Ethereum and compatible blockchains
import { useRouter } from "next/navigation"; // Importing useRouter from Next.js for programmatic navigation
import { toast } from "react-toastify"; // Importing toast for notification handling
import { Textarea } from "./ui/textarea"; // Importing Textarea component for multiline text input

// Array of product categories for selection
const selectOptions = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "pets", label: "Pets" },
];

// Header component that handles the display of the navbar and form submission for adding products
export default function Header() {
  const [hideConnectBtn, setHideConnectBtn] = useState<boolean>(false); // State to hide/show ConnectButton
  const { connect } = useConnect(); // Hook for handling wallet connection
  const { address, chainId } = useAccount(); // Hook for accessing the connected wallet's address and chain ID
  const { checkConnection, mundoContract, currency } = useCeloConnect(); // Hook for interacting with Celo blockchain and contract
  const [name, setName] = useState<string>(""); // State for product name
  const [description, setDescription] = useState<string>(""); // State for product description
  const [image, setImage] = useState<string>(""); // State for product image URL
  const [price, setPrice] = useState<string>(""); // State for product price
  const [stock, setStock] = useState<string>(""); // State for product stock
  const [category, setCategory] = useState<string>(""); // State for product category
  const [owner, setOwner] = useState(""); // State to store the owner's address

  console.log({ owner, address });
  const router = useRouter(); // Hook for programmatic navigation

  // Effect to handle MiniPay wallet connection and listen for account or chain changes
  useEffect(() => {
    if (window.ethereum && (window.ethereum as any).isMiniPay) {
      setHideConnectBtn(true); // Hide the connect button if MiniPay is detected
      connect({ connector: injected({ target: "metaMask" }) }); // Connect using MetaMask if MiniPay is available
    }

    window.ethereum.on("accountsChanged", () => {
      router.refresh(); // Refresh page when the wallet account is changed
    });

    window.ethereum.on("chainChanged", () => {
      router.refresh(); // Refresh page when the chain is changed
    });

    // Cleanup event listeners when the component is unmounted
    return () => {
      window.ethereum.removeListener("accountsChanged", () => {
        router.refresh();
      });
      window.ethereum.removeListener("chainChanged", () => {
        router.refresh();
      });
    };
  }, [connect]);

  // Effect to fetch the owner of the contract if connected
  useEffect(() => {
    const getOwner = async () => {
      const connect = await checkConnection(); // Check if the connection is established
      if (!connect) return;
      if (window.ethereum) {
        if (!mundoContract) return;
        const owner = await mundoContract?.owner(); // Get the owner address from the smart contract
        setOwner(owner); // Set the owner in the state
      }
    };
    mundoContract && address && getOwner(); // Trigger the owner fetch if the contract and address are available
  }, [address, mundoContract]);

  // Handle form submission to add a new product to the contract
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let decimal: number = 18;
    if (chainId === 44787) {
      // Alfajores testnet has different decimals for the native currency
      decimal = 6;
    } else if (chainId === 42220) {
      // Celo mainnet uses 18 decimals
      decimal = 18;
    }
    try {
      const connect = await checkConnection(); // Check if the connection is established
      if (!connect || !mundoContract) {
        return;
      }
      toast.loading("Adding product"); // Show loading toast notification
      const newPrice = ethers.parseUnits(price, decimal); // Convert the product price to the appropriate decimal units
      const tx = await mundoContract.list(
        name,
        category,
        image,
        newPrice,
        0,
        stock,
        description // Call the contract function to list the product
      );
      toast.dismiss(); // Dismiss the loading notification
      toast.loading("Waiting for network confirmation"); // Show confirmation toast notification
      const response = await tx.wait(); // Wait for the transaction to be mined
      setName(""); // Reset the form fields
      setDescription("");
      setImage("");
      setPrice("");
      setStock("");
      toast.dismiss(); // Dismiss all toasts
      toast.success("Product added successfully"); // Show success notification
      router.refresh(); // Refresh the page after adding the product
    } catch (error) {
      toast.error("Failed to add product"); // Show error notification if something goes wrong
    }
  };

  return (
    <header className="sticky bg-black top-0 z-30">
      <div className="p-3 flex items-center justify-between">
        <Link href={"/"}>
          <h2 className="text-4xl">E-commerce</h2>
          {/* <Image
						src={"/logo/cag-logo.svg"}
						width={181}
						height={23}
						alt="cag logo"
					/> */}
        </Link>

        <nav className="flex gap-3 items-center">
          {address === owner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant={"outline"}
                  className="text-black hover:opacity-75"
                >
                  Add product
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-black text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Add product</AlertDialogTitle>
                  <AlertDialogDescription>
                    Fill the product details below to add to the products list.
                  </AlertDialogDescription>
                  <form onSubmit={handleSubmit} className="space-y-4 ">
                    <div className="grid w-full text-white mt-4 space-y-1 items-center gap-1.5">
                      <Label className="text-white" htmlFor="name">
                        Product name
                      </Label>
                      <Input
                        type="text"
                        id="name"
                        placeholder="A test product"
                        value={name}
                        className="text-white"
                        required
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="grid w-full space-y-1 items-center gap-1.5">
                      <Label className="text-white" htmlFor="description">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="This product is ..."
                        value={description}
                        required
                        className="text-white"
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    <div className="grid w-full space-y-1 items-center gap-1.5">
                      <Label className="text-white" htmlFor="image">
                        Product image url
                      </Label>
                      <Input
                        type="text"
                        id="image"
                        required
                        className="text-white"
                        placeholder="https://www.example.com/product-image.png"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                      />
                    </div>
                    <div className="grid w-full space-y-1 items-center gap-1.5">
                      <Label className="text-white" htmlFor="price">
                        Price ({currency})
                      </Label>
                      <Input
                        type="number"
                        id="price"
                        placeholder="10.5"
                        required
                        className="text-white"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                    <div className="grid w-full space-y-1 items-center gap-1.5">
                      <Label className="text-white" htmlFor="price">
                        Category
                      </Label>
                      <Select
                        required
                        onValueChange={(value) => setCategory(value)}
                      >
                        <SelectTrigger className="w-full text-white">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {selectOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid w-full space-y-1 items-center gap-1.5">
                      <Label className="text-white" htmlFor="stock">
                        Stock
                      </Label>
                      <Input
                        required
                        type="number"
                        id="stock"
                        className="text-white"
                        placeholder="4"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        type="button"
                        className="bg-red-700 hover:text-white hover:bg-red-500 border-0"
                      >
                        Cancel
                      </AlertDialogCancel>
                      <Button
                        type="submit"
                        className="bg-green-800 hover:bg-green-700"
                      >
                        Add product
                      </Button>
                    </AlertDialogFooter>
                  </form>
                </AlertDialogHeader>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {/* <Link
						href={"#"}
						className="p-2 bg-[#292E38] hover:opacity-70  rounded-xl ml-8"
					>
						<Search />
					</Link>
					<Link
						href={"#"}
						className="p-2 bg-[#292E38] hover:opacity-70  rounded-xl"
					>
						<UserRound />
					</Link>
					<Link
						href={"#"}
						className="p-2 bg-[#292E38] hover:opacity-70  rounded-xl"
					>
						<ShoppingBag />
					</Link> */}
          <Link
            href={"/categories"}
            className="p-2 bg-[#292E38] hover:opacity-70  rounded-xl"
          >
            Categories
          </Link>
          <Link
            href={"/orders"}
            title="Order History"
            className="p-2 bg-[#292E38] hover:opacity-70  rounded-xl"
          >
            <History />
          </Link>

          {!hideConnectBtn && (
            <ConnectButton
              showBalance={{
                smallScreen: true,
                largeScreen: false,
              }}
            />
          )}
        </nav>
      </div>
      <hr />
    </header>
  );
}
