import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function GestoriaVentaCardSkeleton() {
  return (
    <div className="neo-card p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-none" />
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-8 w-28 mb-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-secondary neo-card border-2 border-border space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-full" />
            </div>
            <div className="p-3 bg-secondary neo-card border-2 border-border space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-full" />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs pt-2 border-t-2 border-dashed">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>

        <div className="flex lg:flex-col gap-2">
          <Skeleton className="h-10 w-full lg:w-28" />
          <Skeleton className="h-10 w-full lg:w-28" />
        </div>
      </div>
    </div>
  );
}