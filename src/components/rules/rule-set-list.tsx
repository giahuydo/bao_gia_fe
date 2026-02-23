"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Scale, Plus, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRuleSets, useDeleteRuleSet } from "@/hooks/use-rules";
import type { RuleCategory } from "@/lib/api/rules";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const ALL = "all";
const CATEGORIES: RuleCategory[] = [
  "lab",
  "biotech",
  "icu",
  "analytical",
  "general",
];

const CATEGORY_COLORS: Record<RuleCategory, string> = {
  lab: "bg-blue-100 text-blue-800",
  biotech: "bg-green-100 text-green-800",
  icu: "bg-red-100 text-red-800",
  analytical: "bg-purple-100 text-purple-800",
  general: "bg-gray-100 text-gray-800",
};

export function RuleSetList() {
  const [category, setCategory] = useState<RuleCategory | typeof ALL>(ALL);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: ruleSets, isLoading, isError } = useRuleSets(
    category === ALL ? undefined : category
  );
  const deleteMutation = useDeleteRuleSet();

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Rule set deleted");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete rule set"),
    });
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Rule Sets</h1>
          <div className="flex gap-2">
            <Select
              value={category}
              onValueChange={(v) =>
                setCategory(v as RuleCategory | typeof ALL)
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button asChild>
              <Link href="/rules/new">
                <Plus className="size-4 mr-1" />
                New Rule Set
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p>Failed to load rule sets.</p>
          </div>
        ) : !ruleSets || ruleSets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Scale className="size-10 mb-3" />
            <p className="text-lg font-medium">No rule sets</p>
            <p className="text-sm">
              Create rules to validate quotation items automatically.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Rules</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {ruleSets.map((rs) => (
                  <TableRow key={rs.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{rs.name}</p>
                        {rs.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {rs.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${CATEGORY_COLORS[rs.category]} capitalize`}
                      >
                        {rs.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {rs.rules.length} rule{rs.rules.length !== 1 && "s"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={rs.isActive ? "default" : "secondary"}
                      >
                        {rs.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/rules/${rs.id}`}>
                            <Eye className="size-3.5" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(rs.id)}
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete rule set?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
