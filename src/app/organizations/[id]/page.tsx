"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Pencil, Users } from "lucide-react";
import { useOrganization } from "@/hooks/use-organizations";
import { MemberList } from "@/components/organizations/member-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-800",
  starter: "bg-blue-100 text-blue-800",
  professional: "bg-purple-100 text-purple-800",
  enterprise: "bg-amber-100 text-amber-800",
};

export default function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: org, isLoading } = useOrganization(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="container mx-auto py-6 px-4">
        <p className="text-center text-muted-foreground py-16">
          Organization not found.
        </p>
      </div>
    );
  }

  const canEdit =
    org.currentUserRole === "owner" || org.currentUserRole === "admin";

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/organizations">
            <ChevronLeft className="size-4 mr-1" />
            Back to Organizations
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{org.name}</h1>
            <Badge className={PLAN_COLORS[org.plan]}>{org.plan}</Badge>
          </div>
          {canEdit && (
            <Button variant="outline" asChild>
              <Link href={`/organizations/${id}/edit`}>
                <Pencil className="size-4 mr-1" />
                Edit
              </Link>
            </Button>
          )}
        </div>
        {org.description && (
          <p className="text-muted-foreground mt-1">{org.description}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Slug
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm">{org.slug}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Token Limit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {org.monthlyTokenLimit.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">tokens/month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Your Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold capitalize">
              {org.currentUserRole}
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="size-5" />
          <h2 className="text-lg font-semibold">
            Members ({org.members.length})
          </h2>
        </div>
        <MemberList
          orgId={id}
          members={org.members}
          currentUserRole={org.currentUserRole}
        />
      </div>
    </div>
  );
}
