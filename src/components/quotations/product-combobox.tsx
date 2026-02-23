"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useProducts } from "@/hooks/use-products";

interface ProductSelection {
  name: string;
  unit: string;
  unitPrice: number;
  description: string;
}

interface ProductComboboxProps {
  onSelect: (product: ProductSelection) => void;
}

export function ProductCombobox({ onSelect }: ProductComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useProducts({
    search: search || undefined,
    isActive: true,
    limit: 20,
  });

  const products = data?.data ?? [];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs"
        >
          <Search className="size-3" />
          Product
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search products..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : products.length === 0 ? (
              <CommandEmpty>No products found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {products.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.id}
                    onSelect={() => {
                      onSelect({
                        name: product.name,
                        unit: product.unit,
                        unitPrice: product.defaultPrice,
                        description: product.description || "",
                      });
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex flex-col">
                        <span>{product.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {product.unit}
                          {product.category && ` · ${product.category}`}
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        {formatPrice(product.defaultPrice)}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
