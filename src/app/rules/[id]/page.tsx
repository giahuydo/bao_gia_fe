"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Pencil } from "lucide-react";
import { useRuleSet } from "@/hooks/use-rules";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CATEGORY_COLORS: Record<string, string> = {
  lab: "bg-blue-100 text-blue-800",
  biotech: "bg-green-100 text-green-800",
  icu: "bg-red-100 text-red-800",
  analytical: "bg-purple-100 text-purple-800",
  general: "bg-gray-100 text-gray-800",
};

export default function RuleSetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: ruleSet, isLoading } = useRuleSet(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!ruleSet) {
    return (
      <div className="container mx-auto py-6 px-4">
        <p className="text-center text-muted-foreground py-16">
          Rule set not found.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/rules">
            <ChevronLeft className="size-4 mr-1" />
            Back to Rule Sets
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {ruleSet.name}
            </h1>
            <Badge className={`${CATEGORY_COLORS[ruleSet.category]} capitalize`}>
              {ruleSet.category}
            </Badge>
            <Badge variant={ruleSet.isActive ? "default" : "secondary"}>
              {ruleSet.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/rules/${id}/edit`}>
              <Pencil className="size-4 mr-1" />
              Edit
            </Link>
          </Button>
        </div>
        {ruleSet.description && (
          <p className="text-muted-foreground mt-1">{ruleSet.description}</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rules ({ruleSet.rules.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {ruleSet.rules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No rules defined.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Priority</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ruleSet.rules
                  .sort((a, b) => a.priority - b.priority)
                  .map((rule, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs">
                        {rule.priority}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {rule.field}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{rule.operator}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {String(rule.value)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            rule.action === "reject"
                              ? "destructive"
                              : rule.action === "flag"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {rule.action}
                        </Badge>
                        {rule.actionValue !== undefined && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            → {String(rule.actionValue)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {rule.message || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
