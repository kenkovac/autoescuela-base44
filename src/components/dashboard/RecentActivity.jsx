import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, FileText, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

export default function RecentActivity({ contratos, isLoading }) {
  return (
    <Card className="neo-card">
      <CardHeader className="border-b-2 border-border">
        <CardTitle className="flex items-center gap-3 text-xl font-black uppercase">
          <Activity className="w-6 h-6 text-[var(--neo-green)]" />
          CONTRATOS RECIENTES
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <AnimatePresence>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4 neo-card">
                  <Skeleton className="w-10 h-10 bg-muted" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-2 bg-muted" />
                    <Skeleton className="h-3 w-24 bg-muted" />
                  </div>
                </div>
              ))
            ) : contratos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-bold uppercase">NO HAY CONTRATOS RECIENTES</p>
              </div>
            ) : (
              contratos.map((contrato, index) => (
                <motion.div
                  key={contrato.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 neo-card bg-secondary hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 bg-[var(--neo-blue)] border-2 border-border neo-card flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-foreground uppercase">
                      CONTRATO #{contrato.numero}
                    </p>
                    <p className="text-sm text-muted-foreground font-bold truncate">
                      CLIENTE: {contrato.cliente_id} • ${contrato.total}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground font-bold">
                        <Clock className="w-3 h-3" />
                        {format(new Date(contrato.created_date), "d MMM, HH:mm", { locale: es })}
                      </div>
                      <Badge className={`border-2 border-border font-black text-xs ${
                        contrato.estado === 'activo' ? 'bg-[var(--neo-green)] text-black' :
                        contrato.estado === 'finalizado' ? 'bg-[var(--neo-blue)] text-black' :
                        'bg-[var(--neo-red)] text-white'
                      }`}>
                        {contrato.estado?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}