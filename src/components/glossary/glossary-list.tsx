"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Download,
  Upload,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGlossaryTerms,
  useCreateGlossaryTerm,
  useUpdateGlossaryTerm,
  useDeleteGlossaryTerm,
  useExportGlossary,
} from "@/hooks/use-glossary";
import type {
  IGlossaryTerm,
  CreateGlossaryTermDto,
  UpdateGlossaryTermDto,
} from "@/lib/api/glossary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
const CATEGORIES = ["lab", "biotech", "icu", "analytical", "general"];

export function GlossaryList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTerm, setEditTerm] = useState<IGlossaryTerm | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateGlossaryTermDto>({
    sourceTerm: "",
    targetTerm: "",
    sourceLanguage: "en",
    targetLanguage: "vi",
    category: "",
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: terms, isLoading } = useGlossaryTerms({
    search: debouncedSearch || undefined,
    category: category === ALL ? undefined : category,
  });

  const createMutation = useCreateGlossaryTerm();
  const updateMutation = useUpdateGlossaryTerm(editTerm?.id || "");
  const deleteMutation = useDeleteGlossaryTerm();
  const exportMutation = useExportGlossary();

  const openCreate = useCallback(() => {
    setEditTerm(null);
    setFormData({
      sourceTerm: "",
      targetTerm: "",
      sourceLanguage: "en",
      targetLanguage: "vi",
      category: "",
    });
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((term: IGlossaryTerm) => {
    setEditTerm(term);
    setFormData({
      sourceTerm: term.sourceTerm,
      targetTerm: term.targetTerm,
      sourceLanguage: term.sourceLanguage,
      targetLanguage: term.targetLanguage,
      category: term.category || "",
    });
    setDialogOpen(true);
  }, []);

  const handleSave = () => {
    if (!formData.sourceTerm || !formData.targetTerm) {
      toast.error("Source and target terms are required");
      return;
    }

    if (editTerm) {
      const dto: UpdateGlossaryTermDto = {
        targetTerm: formData.targetTerm,
        sourceLanguage: formData.sourceLanguage,
        targetLanguage: formData.targetLanguage,
        category: formData.category || undefined,
      };
      updateMutation.mutate(dto, {
        onSuccess: () => {
          toast.success("Term updated");
          setDialogOpen(false);
        },
        onError: () => toast.error("Failed to update term"),
      });
    } else {
      createMutation.mutate(
        { ...formData, category: formData.category || undefined },
        {
          onSuccess: () => {
            toast.success("Term created");
            setDialogOpen(false);
          },
          onError: () => toast.error("Failed to create term"),
        }
      );
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Term deleted");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete term"),
    });
  };

  const handleExport = () => {
    exportMutation.mutate(category === ALL ? undefined : category, {
      onSuccess: (data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "glossary-export.json";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Glossary exported");
      },
      onError: () => toast.error("Failed to export"),
    });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Glossary</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="size-3.5 mr-1" />
              Export
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-3.5 mr-1" />
              Add Term
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search terms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={category}
            onValueChange={setCategory}
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
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : !terms || terms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <BookOpen className="size-10 mb-3" />
            <p className="text-lg font-medium">No glossary terms</p>
            <p className="text-sm">
              Add terms to ensure consistent translations.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source Term</TableHead>
                  <TableHead>Target Term</TableHead>
                  <TableHead>Languages</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {terms.map((term) => (
                  <TableRow key={term.id}>
                    <TableCell className="font-medium">
                      {term.sourceTerm}
                    </TableCell>
                    <TableCell>{term.targetTerm}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {term.sourceLanguage} → {term.targetLanguage}
                    </TableCell>
                    <TableCell>
                      {term.category ? (
                        <Badge variant="secondary" className="capitalize">
                          {term.category}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(term)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(term.id)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editTerm ? "Edit Term" : "New Glossary Term"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Source Term *</Label>
              <Input
                value={formData.sourceTerm}
                onChange={(e) =>
                  setFormData({ ...formData, sourceTerm: e.target.value })
                }
                placeholder="e.g. Centrifuge"
                disabled={!!editTerm}
              />
            </div>
            <div className="space-y-2">
              <Label>Target Term *</Label>
              <Input
                value={formData.targetTerm}
                onChange={(e) =>
                  setFormData({ ...formData, targetTerm: e.target.value })
                }
                placeholder="e.g. May ly tam"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Source Language</Label>
                <Input
                  value={formData.sourceLanguage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sourceLanguage: e.target.value,
                    })
                  }
                  placeholder="en"
                />
              </div>
              <div className="space-y-2">
                <Label>Target Language</Label>
                <Input
                  value={formData.targetLanguage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetLanguage: e.target.value,
                    })
                  }
                  placeholder="vi"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category || "none"}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    category: v === "none" ? "" : v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && (
                  <Loader2 className="size-4 animate-spin mr-1" />
                )}
                {editTerm ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete glossary term?</AlertDialogTitle>
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
