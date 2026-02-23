"use client";

import { useState } from "react";
import { Crown, Shield, Users, User, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useRemoveMember,
  useUpdateMemberRole,
} from "@/hooks/use-organizations";
import type { IOrganizationMember } from "@/lib/api/organizations";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ROLE_ICONS: Record<string, typeof Crown> = {
  owner: Crown,
  admin: Shield,
  manager: Users,
  member: User,
};

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-amber-100 text-amber-800",
  admin: "bg-purple-100 text-purple-800",
  manager: "bg-blue-100 text-blue-800",
  member: "bg-gray-100 text-gray-800",
};

const ROLES = ["owner", "admin", "manager", "member"] as const;

interface Props {
  orgId: string;
  members: IOrganizationMember[];
  currentUserRole: string;
}

export function MemberList({ orgId, members, currentUserRole }: Props) {
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const removeMutation = useRemoveMember(orgId);
  const updateRoleMutation = useUpdateMemberRole(orgId);

  const canManage = currentUserRole === "owner" || currentUserRole === "admin";
  const canChangeRoles = currentUserRole === "owner";

  const handleRemove = () => {
    if (!removeTarget) return;
    removeMutation.mutate(removeTarget, {
      onSuccess: () => {
        toast.success("Member removed");
        setRemoveTarget(null);
      },
      onError: () => toast.error("Failed to remove member"),
    });
  };

  const handleRoleChange = (userId: string, role: string) => {
    updateRoleMutation.mutate(
      {
        userId,
        dto: { role: role as IOrganizationMember["role"] },
      },
      {
        onSuccess: () => toast.success("Role updated"),
        onError: () => toast.error("Failed to update role"),
      }
    );
  };

  return (
    <>
      <div className="space-y-2">
        {members.map((member) => {
          const RoleIcon = ROLE_ICONS[member.role] || User;
          return (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {member.user?.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "?"}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {member.user?.fullName || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {member.user?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {canChangeRoles ? (
                  <Select
                    value={member.role}
                    onValueChange={(v) => handleRoleChange(member.userId, v)}
                    disabled={updateRoleMutation.isPending}
                  >
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r} className="capitalize">
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={ROLE_COLORS[member.role]}>
                    <RoleIcon className="size-3 mr-1" />
                    {member.role}
                  </Badge>
                )}

                {canManage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRemoveTarget(member.userId)}
                    disabled={removeMutation.isPending}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog
        open={!!removeTarget}
        onOpenChange={() => setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the member from the organization. They will lose
              access to all organization resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending && (
                <Loader2 className="size-4 animate-spin mr-1" />
              )}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
