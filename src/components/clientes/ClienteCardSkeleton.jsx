import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClienteCardSkeleton() {
  return (
    <div className="neo-card p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-none" />
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <div className="flex items-center gap-2 mt-1">
                  <Skeleton className="w-4 h-4" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-secondary neo-card border-2 border-border space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-full" />
            </div>
            <div className="p-3 bg-secondary neo-card border-2 border-border space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-full" />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs pt-2 border-t-2 border-dashed">
            <div className="flex items-center gap-1.5">
              <Skeleton className="w-3.5 h-3.5" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>

        <div className="flex md:flex-col gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
}