
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  UserCheck,
  Car,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import ContratoDetalle from "./ContratoDetalle";

const statusConfig = {
  activo: { bg: "bg-[var(--neo-green)]", text: "text-black" },
  finalizado: { bg: "bg-[var(--neo-blue)]", text: "text-black" },
  cancelado: { bg: "bg-[var(--neo-red)]", text: "text-white" },
  suspendido: { bg: "bg-[var(--neo-yellow)]", text: "text-black" }
};

export default function ContratoCard({ contrato, onEdit, onDelete, onContratoDeleted }) {
  const [showDetalle, setShowDetalle] = useState(false);
  const status = statusConfig[contrato.estado] || statusConfig.activo;

  return (
    <>
      <div className="neo-card p-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Columna Principal: Info del Contrato */}
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-black text-foreground uppercase">
                  CONTRATO #{contrato.id}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge className={`${status.bg} ${status.text} border-2 border-border font-black text-xs uppercase`}>
                    {contrato.estado || 'Activo'}
                  </Badge>
                  <Badge className="bg-gray-200 text-gray-800 border-2 border-border font-black text-xs uppercase">
                    {contrato.metodo_pago || 'N/A'}
                  </Badge>
                   <Badge variant="outline" className="border-2 border-border font-black text-xs uppercase">
                    <Car className="w-3 h-3 mr-1.5" />
                    {contrato.metodo_clase || 'N/A'}
                  </Badge>
                  <Badge variant="outline" className="border-2 border-border font-black text-xs uppercase">
                    <Clock className="w-3 h-3 mr-1.5" />
                    {contrato.modo_clase || 'N/A'}
                  </Badge>
                  {contrato.horario && (
                    <Badge variant="outline" className="border-2 border-border font-black text-xs uppercase">
                      <Clock className="w-3 h-3 mr-1.5" />
                      {contrato.horario}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-[var(--neo-green)]">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: contrato.moneda || 'USD' }).format(contrato.total || 0)}
                </p>
                <p className="text-sm font-bold text-muted-foreground uppercase">
                  VALOR TOTAL
                </p>
                {contrato.total_instructor > 0 && (
                  <>
                    <p className="text-lg font-black text-[var(--neo-red)] mt-1">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: contrato.moneda || 'USD' }).format(contrato.total_instructor)}
                    </p>
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                      PAGO INSTRUCTOR
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Info del Cliente e Instructor */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-secondary neo-card border-2 border-border">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-black text-muted-foreground uppercase">CLIENTE</span>
                </div>
                <p className="font-black text-foreground uppercase">{contrato.cliente?.nombre || 'Cliente no asignado'}</p>
              </div>

              <div className="p-3 bg-secondary neo-card border-2 border-border">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-black text-muted-foreground uppercase">INSTRUCTOR</span>
                </div>
                <p className="font-black text-foreground uppercase">{contrato.instructor?.nombre || 'No asignado'}</p>
              </div>
            </div>

            {/* Fechas */}
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase">INICIO</p>
                  <p className="font-bold text-foreground">
                    {contrato.fecha_inicio ? format(new Date(contrato.fecha_inicio), 'd MMM yyyy', { locale: es }) : 'No definida'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase">FIN</p>
                  <p className="font-bold text-foreground">
                    {contrato.fecha_fin ? format(new Date(contrato.fecha_fin), 'd MMM yyyy', { locale: es }) : 'No definida'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna de Acciones */}
          <div className="flex lg:flex-col gap-2 w-full lg:w-auto">
            <Button
              onClick={() => setShowDetalle(true)}
              className="neo-button bg-[var(--neo-blue)] text-black hover:bg-blue-400 p-3 flex-1 lg:flex-none"
            >
              <Eye className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">VER DETALLE</span>
            </Button>
            <Button
              onClick={() => onEdit(contrato)}
              className="neo-button bg-secondary hover:bg-muted text-foreground p-3 flex-1 lg:flex-none"
            >
              <Edit className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">EDITAR</span>
            </Button>
            <Button
              onClick={() => onDelete(contrato.id)}
              className="neo-button bg-destructive hover:bg-red-600 text-destructive-foreground p-3 flex-1 lg:flex-none"
            >
              <Trash2 className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">ELIMINAR</span>
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDetalle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetalle(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-6xl h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <ContratoDetalle
                contratoId={contrato.id}
                onClose={() => setShowDetalle(false)}
                onContratoDeleted={() => {
                  setShowDetalle(false);
                  if (onContratoDeleted) {
                    onContratoDeleted();
                  }
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
