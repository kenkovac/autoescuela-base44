import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContratoCardSkeleton() {
  return (
    <div className="neo-card p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-secondary neo-card border-2 border-border space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="p-3 bg-secondary neo-card border-2 border-border space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </div>

        <div className="flex lg:flex-col gap-2 w-full lg:w-auto">
          <Skeleton className="h-10 w-full lg:w-28" />
          <Skeleton className="h-10 w-full lg:w-28" />
          <Skeleton className="h-10 w-full lg:w-28" />
        </div>
      </div>
    </div>
  );
}