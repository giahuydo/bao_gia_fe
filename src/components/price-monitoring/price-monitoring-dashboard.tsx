"use client";

import { Play, Loader2, Activity } from "lucide-react";
import { toast } from "sonner";
import { useTriggerMonitoring } from "@/hooks/use-price-monitoring";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { MonitoringJobList } from "./monitoring-job-list";
import { PriceAlertList } from "./price-alert-list";

export function PriceMonitoringDashboard() {
  const triggerMonitoring = useTriggerMonitoring();

  const handleRunNow = () => {
    triggerMonitoring.mutate(undefined, {
      onSuccess: () => {
        toast.success("Price monitoring started", {
          description: "A new monitoring job has been queued.",
        });
      },
      onError: (error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Failed to start monitoring";
        toast.error("Failed to trigger monitoring", {
          description: message,
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="size-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Price Monitoring</h1>
        </div>
        <Button
          onClick={handleRunNow}
          disabled={triggerMonitoring.isPending}
        >
          {triggerMonitoring.isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Play className="mr-2 size-4" />
          )}
          Run Now
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        <TabsContent value="jobs" className="mt-4">
          <MonitoringJobList />
        </TabsContent>
        <TabsContent value="alerts" className="mt-4">
          <PriceAlertList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
