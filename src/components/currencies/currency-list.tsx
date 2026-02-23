"use client";

import { useState } from "react";
import { Loader2, Coins, Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import {
  useCurrencies,
  useDeleteCurrency,
} from "@/hooks/use-currencies";
import type { ICurrency } from "@/lib/api/currencies";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CurrencyFormDialog } from "./currency-form-dialog";

export function CurrencyList() {
  const { data: currencies, isLoading, isError } = useCurrencies();
  const deleteMutation = useDeleteCurrency();
  const [editCurrency, setEditCurrency] = useState<ICurrency | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Currency deactivated");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete currency"),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Currencies</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          Add Currency
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p>Failed to load currencies. Please try again.</p>
        </div>
      ) : !currencies || currencies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Coins className="size-10 mb-3" />
          <p className="text-lg font-medium">No currencies configured</p>
          <p className="text-sm">Add your first currency to get started.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead className="text-right">Exchange Rate</TableHead>
                <TableHead className="text-center">Decimals</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencies.map((currency: ICurrency) => (
                <TableRow key={currency.id}>
                  <TableCell className="font-medium font-mono">
                    {currency.code}
                    {currency.isDefault && (
                      <Star className="inline size-3 ml-1 text-yellow-500 fill-yellow-500" />
                    )}
                  </TableCell>
                  <TableCell>{currency.name}</TableCell>
                  <TableCell className="font-mono">{currency.symbol}</TableCell>
                  <TableCell className="text-right font-mono">
                    {currency.exchangeRate}
                  </TableCell>
                  <TableCell className="text-center">
                    {currency.decimalPlaces}
                  </TableCell>
                  <TableCell>
                    {currency.isActive ? (
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800 hover:bg-green-100"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => setEditCurrency(currency)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      {!currency.isDefault && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive"
                          onClick={() => setDeleteId(currency.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CurrencyFormDialog
        open={showCreate}
        onOpenChange={setShowCreate}
      />

      <CurrencyFormDialog
        open={!!editCurrency}
        onOpenChange={(open) => !open && setEditCurrency(null)}
        defaultValues={editCurrency ?? undefined}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate currency?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the currency. Existing quotations using this
              currency will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deactivating..." : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
