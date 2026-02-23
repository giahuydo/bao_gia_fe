"use client";

import { Badge } from "@/components/ui/badge";

interface ProductStatusBadgeProps {
  isActive: boolean;
}

export function ProductStatusBadge({ isActive }: ProductStatusBadgeProps) {
  return isActive ? (
    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
      Active
    </Badge>
  ) : (
    <Badge variant="secondary">Inactive</Badge>
  );
}
