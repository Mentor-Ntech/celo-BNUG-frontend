import React from "react";
import { ProductType } from "@/pages";
import Link from "next/link";
import useCeloConnect from "../hooks/useCeloConnect";

const NewArrival = ({ products }: { products: ProductType[] }) => {
  const { currency } = useCeloConnect();
  return (
    <>
      <div className=" flex items-center justify-center">
        <div className="w-[70%] ">
          <h3 className="p-2 text-3xl">New Arrival</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full ">
            {products
              .reverse()
              ?.slice(0, 4)
              .map((item) => (
                <Link
                  href={`/item/${item.id}`}
                  key={item.id}
                  className="hover:bg-gray-800 p-[15px]"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-40 object-cover rounded-sm"
                  />
                  <h4 className="mt-5 text-xl">{item.name}</h4>
                  {/* <p className="text-[gray]">{item.description}</p> */}
                  <p className="text-[gray] text-sm mt-3">
                    Left in stock: {item.stock}
                  </p>
                  <p className="text-lg">
                    Price: {Number(item.price).toFixed(2)} {currency}
                  </p>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default NewArrival;
