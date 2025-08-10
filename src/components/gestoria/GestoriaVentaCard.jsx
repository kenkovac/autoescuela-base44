
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Edit,
  Trash2,
  User,
  CreditCard,
  Calendar,
  FileText,
  DollarSign,
  Hash,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import GestoriaMovimientos from "./GestoriaMovimientos";

export default function GestoriaVentaCard({ gestoria, onEdit, onDelete, onDataChange }) {
  const [showMovimientos, setShowMovimientos] = useState(false);

  return (
    <>
      <div className="neo-card p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Columna Principal: Info de la Gestoria */}
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-black text-foreground uppercase">
                  {gestoria.tipo_tramite}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge className="bg-purple-100 text-purple-800 border-2 border-border font-black text-xs uppercase">
                    {gestoria.moneda}
                  </Badge>
                  {gestoria.referencia_pago && (
                    <Badge className="bg-blue-100 text-blue-800 border-2 border-border font-black text-xs uppercase">
                      REF: {gestoria.referencia_pago}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-[var(--neo-pink)]">
                  ${gestoria.monto?.toLocaleString()}
                </p>
                <p className="text-sm font-bold text-muted-foreground uppercase">
                  {gestoria.moneda}
                </p>
              </div>
            </div>

            {/* Info del Cliente */}
            <div className="p-4 bg-secondary neo-card border-2 border-border">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-black text-muted-foreground uppercase">CLIENTE</p>
                    <p className="font-black text-foreground">{gestoria.cliente?.nombre || 'Sin nombre'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-black text-muted-foreground uppercase">DOCUMENTO</p>
                    <p className="font-bold text-foreground">{gestoria.cliente?.documento || 'No registrado'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fecha */}
            <div className="p-3 bg-muted neo-card border-2 border-border">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-black text-muted-foreground uppercase">FECHA</span>
              </div>
              <p className="font-bold text-foreground">
                {format(new Date(gestoria.fecha), 'd MMM yyyy', { locale: es })}
              </p>
            </div>

            {/* Descripción */}
            {gestoria.descripcion && (
              <div className="p-3 bg-accent/10 neo-card border-2 border-border">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-black text-muted-foreground uppercase">DESCRIPCIÓN</span>
                </div>
                <p className="text-sm font-bold text-foreground">{gestoria.descripcion}</p>
              </div>
            )}

            {/* Observaciones */}
            {gestoria.observaciones && (
              <div className="p-3 bg-yellow-50 neo-card border-2 border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-black text-muted-foreground uppercase">OBSERVACIONES</span>
                </div>
                <p className="text-sm font-bold text-foreground">{gestoria.observaciones}</p>
              </div>
            )}
          </div>

          {/* Columna de Acciones */}
          <div className="flex lg:flex-col gap-2 w-full lg:w-auto">
            <Button
              onClick={() => setShowMovimientos(true)}
              className="neo-button bg-[var(--neo-blue)] hover:bg-blue-400 text-black p-3 flex-1 lg:flex-none"
            >
              <Eye className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">MOVIMIENTOS</span>
            </Button>
            <Button
              onClick={() => onEdit(gestoria)}
              className="neo-button bg-secondary hover:bg-muted text-foreground p-3 flex-1 lg:flex-none"
            >
              <Edit className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">EDITAR</span>
            </Button>
            <Button
              onClick={() => onDelete(gestoria.id)}
              className="neo-button bg-destructive hover:bg-red-600 text-destructive-foreground p-3 flex-1 lg:flex-none"
            >
              <Trash2 className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">ELIMINAR</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Movimientos */}
      <AnimatePresence>
        {showMovimientos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-6xl"
            >
              <GestoriaMovimientos
                gestoriaId={gestoria.id}
                gestoriaInfo={gestoria}
                onCancel={() => setShowMovimientos(false)}
                onDataChange={onDataChange}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
