import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function InstructorCardSkeleton() {
  return (
    <Card className="neo-card p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-none" />
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-secondary neo-card border-2 border-border space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="p-3 bg-secondary neo-card border-2 border-border space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-none" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex lg:flex-col gap-2">
          <Skeleton className="h-10 w-full lg:w-28" />
          <Skeleton className="h-10 w-full lg:w-28" />
        </div>
      </div>
    </Card>
  );
}