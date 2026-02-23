"use client";

import Link from "next/link";
import { Loader2, Building2, Plus, Crown, Shield, Users, User } from "lucide-react";
import { useOrganizations } from "@/hooks/use-organizations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-800",
  starter: "bg-blue-100 text-blue-800",
  professional: "bg-purple-100 text-purple-800",
  enterprise: "bg-amber-100 text-amber-800",
};

const ROLE_ICONS: Record<string, typeof Crown> = {
  owner: Crown,
  admin: Shield,
  manager: Users,
  member: User,
};

export function OrganizationList() {
  const { data: orgs, isLoading, isError } = useOrganizations();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
        <Button asChild>
          <Link href="/organizations/new">
            <Plus className="size-4 mr-1" />
            New Organization
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p>Failed to load organizations.</p>
        </div>
      ) : !orgs || orgs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Building2 className="size-10 mb-3" />
          <p className="text-lg font-medium">No organizations</p>
          <p className="text-sm">Create one to get started with multi-tenancy.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => {
            const RoleIcon = ROLE_ICONS[org.role] || User;
            return (
              <Link key={org.id} href={`/organizations/${org.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{org.name}</CardTitle>
                      <Badge className={PLAN_COLORS[org.plan] || ""}>
                        {org.plan}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {org.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {org.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <RoleIcon className="size-3" />
                      <span className="capitalize">{org.role}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
