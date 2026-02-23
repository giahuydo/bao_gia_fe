"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ReviewDetail } from "@/components/reviews/review-detail";
import { Button } from "@/components/ui/button";

export default function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="container mx-auto py-6 px-4">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/reviews">
          <ChevronLeft className="size-4 mr-1" />
          Back to Reviews
        </Link>
      </Button>
      <ReviewDetail reviewId={id} />
    </div>
  );
}
