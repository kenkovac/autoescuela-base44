import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MovimientoContableCardSkeleton() {
  return (
    <div className="neo-card p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-none" />
              <div>
                <Skeleton className="h-5 w-64 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-28" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs pt-2 border-t-2 border-dashed">
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        <div className="flex md:flex-col gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}