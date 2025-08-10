import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function RoleCardSkeleton() {
  return (
    <Card className="neo-card h-48">
      <CardHeader className="border-b-4 border-border">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8" />
          <div className="flex-1">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div>
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </CardContent>
    </Card>
  );
}