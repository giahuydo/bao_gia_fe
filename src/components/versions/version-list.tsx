"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Loader2, History, Plus, GitCompare } from "lucide-react";
import { toast } from "sonner";
import { useVersions, useCreateVersion, useCompareVersions } from "@/hooks/use-versions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  quotationId: string;
}

export function VersionList({ quotationId }: Props) {
  const { data: versions, isLoading } = useVersions(quotationId);
  const createMutation = useCreateVersion(quotationId);
  const [createOpen, setCreateOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [changeSummary, setChangeSummary] = useState("");

  // Compare state
  const [compareOpen, setCompareOpen] = useState(false);
  const [versionA, setVersionA] = useState(0);
  const [versionB, setVersionB] = useState(0);
  const { data: diff, isLoading: diffLoading } = useCompareVersions(
    quotationId,
    versionA,
    versionB
  );

  const handleCreate = () => {
    createMutation.mutate(
      {
        label: label || undefined,
        changeSummary: changeSummary || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Version created");
          setCreateOpen(false);
          setLabel("");
          setChangeSummary("");
        },
        onError: () => toast.error("Failed to create version"),
      }
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="size-4" />
            Versions
          </CardTitle>
          <div className="flex gap-2">
            {versions && versions.length >= 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompareOpen(true)}
              >
                <GitCompare className="size-3.5 mr-1" />
                Compare
              </Button>
            )}
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-3.5 mr-1" />
              Snapshot
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : !versions || versions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No versions yet. Create a snapshot to track changes.
            </p>
          ) : (
            <div className="space-y-2">
              {versions.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">v{v.versionNumber}</Badge>
                      {v.label && (
                        <span className="text-sm font-medium">{v.label}</span>
                      )}
                    </div>
                    {v.changeSummary && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {v.changeSummary}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(v.createdAt), "dd/MM/yyyy HH:mm")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Version Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Version Snapshot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. v2 - Post review"
              />
            </div>
            <div className="space-y-2">
              <Label>Change Summary</Label>
              <Input
                value={changeSummary}
                onChange={(e) => setChangeSummary(e.target.value)}
                placeholder="Brief description of changes"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && (
                  <Loader2 className="size-4 animate-spin mr-1" />
                )}
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compare Dialog */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compare Versions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Version A</Label>
                <Select
                  value={String(versionA)}
                  onValueChange={(v) => setVersionA(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {versions?.map((v) => (
                      <SelectItem
                        key={v.versionNumber}
                        value={String(v.versionNumber)}
                      >
                        v{v.versionNumber}
                        {v.label ? ` - ${v.label}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Version B</Label>
                <Select
                  value={String(versionB)}
                  onValueChange={(v) => setVersionB(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {versions?.map((v) => (
                      <SelectItem
                        key={v.versionNumber}
                        value={String(v.versionNumber)}
                      >
                        v{v.versionNumber}
                        {v.label ? ` - ${v.label}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {diffLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : diff ? (
              <div className="space-y-3">
                {/* Items diff */}
                {diff.diff.items.added.length > 0 && (
                  <div>
                    <Label className="text-xs text-green-700">
                      Added Items ({diff.diff.items.added.length})
                    </Label>
                    {diff.diff.items.added.map((a, i) => (
                      <div
                        key={i}
                        className="text-xs bg-green-50 rounded p-2 mt-1"
                      >
                        {JSON.stringify(a.item)}
                      </div>
                    ))}
                  </div>
                )}
                {diff.diff.items.removed.length > 0 && (
                  <div>
                    <Label className="text-xs text-red-700">
                      Removed Items ({diff.diff.items.removed.length})
                    </Label>
                    {diff.diff.items.removed.map((r, i) => (
                      <div
                        key={i}
                        className="text-xs bg-red-50 rounded p-2 mt-1"
                      >
                        {JSON.stringify(r.item)}
                      </div>
                    ))}
                  </div>
                )}
                {diff.diff.items.modified.length > 0 && (
                  <div>
                    <Label className="text-xs text-blue-700">
                      Modified Items ({diff.diff.items.modified.length})
                    </Label>
                    {diff.diff.items.modified.map((m, i) => (
                      <div
                        key={i}
                        className="text-xs bg-blue-50 rounded p-2 mt-1 space-y-1"
                      >
                        {m.changes.map((c, j) => (
                          <div key={j}>
                            <span className="font-medium">{c.field}:</span>{" "}
                            <span className="text-red-600">
                              {String(c.from)}
                            </span>{" "}
                            →{" "}
                            <span className="text-green-600">
                              {String(c.to)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Totals diff */}
                {Object.keys(diff.diff.totals).length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Totals Changed
                    </Label>
                    <div className="text-xs bg-muted/50 rounded p-2 mt-1 space-y-1">
                      {Object.entries(diff.diff.totals).map(([key, val]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span>{" "}
                          <span className="text-red-600">
                            {String(val.from)}
                          </span>{" "}
                          →{" "}
                          <span className="text-green-600">
                            {String(val.to)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {diff.diff.items.added.length === 0 &&
                  diff.diff.items.removed.length === 0 &&
                  diff.diff.items.modified.length === 0 &&
                  Object.keys(diff.diff.totals).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No differences found.
                    </p>
                  )}
              </div>
            ) : versionA > 0 && versionB > 0 ? null : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Select two versions to compare.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
