import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const colorVariants = {
  blue: "var(--neo-blue)",
  green: "var(--neo-green)", 
  yellow: "var(--neo-yellow)",
  pink: "var(--neo-pink)",
  red: "var(--neo-red)"
};

export default function StatsCard({ title, value, total, icon: Icon, color, trend, isLoading }) {
  const colorValue = colorVariants[color] || colorVariants.blue;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="neo-card overflow-hidden relative">
        <div 
          className="absolute top-0 right-0 w-24 h-24 transform translate-x-6 -translate-y-6 opacity-20"
          style={{ backgroundColor: colorValue }}
        />
        <CardHeader className="pb-3 relative z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-sm font-black text-muted-foreground mb-3 uppercase tracking-wide">
                {title}
              </CardTitle>
              {isLoading ? (
                <Skeleton className="h-10 w-20 bg-muted" />
              ) : (
                <div className="text-4xl font-black text-foreground">
                  {value}
                  {total && (
                    <span className="text-xl text-muted-foreground ml-2">/ {total}</span>
                  )}
                </div>
              )}
            </div>
            <div 
              className="p-3 border-3 border-border neo-card"
              style={{ backgroundColor: colorValue }}
            >
              <Icon className="w-6 h-6 text-black" />
            </div>
          </div>
        </CardHeader>
        {trend && (
          <CardContent className="pt-0 relative z-10">
            <p className="text-sm text-muted-foreground font-bold uppercase">{trend}</p>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}