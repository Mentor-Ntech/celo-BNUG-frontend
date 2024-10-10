import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Star } from 'lucide-react';
import useCeloConnect from '../hooks/useCeloConnect';

// Define the types based on the contract structure
type Item = {
  id: number;
  name: string;
  category: string;
  image: string;
  cost: number;
  rating: number;
  stock: number;
  description: string;
};

export type Order = {
  time: number;
  item: Item;
};

type UserOrdersProps = {
  orders: Order[]; 
};

const UserOrders: React.FC<UserOrdersProps> = ({ orders }) => {
    const {currency} = useCeloConnect()
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Your Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>A list of your recent orders</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Order Time</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Cost</TableHead>
              {/* <TableHead>Rating</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(Number(order.time) * 1000).toLocaleString()}</TableCell>
                <TableCell className="font-medium">{order.item.name}</TableCell>
                <TableCell>{order.item.category}</TableCell>
                <TableCell>{(order.item.cost)} {currency}</TableCell>
                {/* <TableCell>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-400" />
                    {order.item.rating}
                  </div>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UserOrders;