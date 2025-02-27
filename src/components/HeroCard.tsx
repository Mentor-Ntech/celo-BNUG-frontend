import { BellRing, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";


type CardProps = React.ComponentProps<typeof Card>;

export function HeroCard({ className, ...props }: CardProps) {
  return (
    <div className="flex justify-center ">
      <Card
        className={cn(
          "w-[70%]  relative bg-hero-bg h-[480px] bg-cover bg-center",
          className
        )}
        {...props}
      >
        <CardFooter className="absolute md:px-10 bottom-0 z-10">
          <div>
            <h3 className="text-3xl font-bold text-white mb-4">
              The Metaverse is Here
            </h3>

            <p className="text-[14px]  font-light text-white mb-3">
              Explore a digital world of art, fashion, and more. Shop the latest
              drops from your favorite creators
            </p>

            <Link href='/categories'><Button className="bg-blue-600 hover:bg-blue-500">Shop</Button></Link>
          </div>
        </CardFooter>
        <div className="absolute bg-gray-700/20 w-full h-full ">

        </div>
      </Card>
    </div>
  );
}
