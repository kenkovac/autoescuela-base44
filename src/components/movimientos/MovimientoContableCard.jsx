
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Hash,
  Building2
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const tipoMovimientoConfig = {
  ingreso: { bg: "bg-green-100 text-green-800", label: "Ingreso", icon: TrendingUp },
  gasto: { bg: "bg-red-100 text-red-800", label: "Gasto", icon: TrendingDown },
  ajuste: { bg: "bg-blue-100 text-blue-800", label: "Ajuste", icon: FileText }
};

export default function MovimientoContableCard({ movimiento, onEdit, onDelete }) {
  const tipoConfig = tipoMovimientoConfig[movimiento.tipo_movimiento] || tipoMovimientoConfig.ajuste;
  const TipoIcon = tipoConfig.icon;

  const debe = parseFloat(movimiento.debe) || 0;
  const haber = parseFloat(movimiento.haber) || 0;
  const neto = debe - haber;

  return (
    <div className="neo-card p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Columna Principal: Info del Movimiento */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 neo-card border-2 border-border ${tipoConfig.bg}`}>
                  <TipoIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-foreground uppercase leading-tight">
                    {movimiento.descripcion || "Sin descripción"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge className={`${tipoConfig.bg} border-2 border-border font-black text-xs uppercase flex items-center gap-1`}>
                      <TipoIcon className="w-3 h-3" />
                      {tipoConfig.label}
                    </Badge>
                    <Badge className="bg-gray-100 text-gray-800 border-2 border-border font-black text-xs uppercase">
                      {movimiento.cuenta}
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800 border-2 border-border font-black text-xs uppercase">
                      {movimiento.moneda}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Detalles del movimiento */}
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-black text-muted-foreground uppercase">FECHA</p>
                    <p className="font-bold text-foreground">
                      {format(new Date(movimiento.fecha), 'd MMM yyyy', { locale: es })}
                    </p>
                  </div>
                </div>

                {movimiento.referencia && (
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-black text-muted-foreground uppercase">REFERENCIA</p>
                      <p className="font-bold text-foreground">{movimiento.referencia}</p>
                    </div>
                  </div>
                )}

                {movimiento.contrato && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-black text-muted-foreground uppercase">CONTRATO</p>
                      <p className="font-bold text-foreground">{movimiento.contrato.numero}</p>
                    </div>
                  </div>
                )}

                {movimiento.gestoriaVenta && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-black text-muted-foreground uppercase">GESTORÍA</p>
                      <p className="font-bold text-foreground">{movimiento.gestoriaVenta.cliente_nombre}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Montos */}
              <div className="grid md:grid-cols-3 gap-4 mt-4 p-4 bg-secondary neo-card border-2 border-border">
                <div className="text-center">
                  <p className="text-xs font-black text-green-700 uppercase">DEBE</p>
                  <p className="text-lg font-black text-green-700">
                    {debe > 0 ? `$${debe.toLocaleString()}` : '-'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-red-700 uppercase">HABER</p>
                  <p className="text-lg font-black text-red-700">
                    {haber > 0 ? `$${haber.toLocaleString()}` : '-'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-foreground uppercase">NETO</p>
                  <p className={`text-lg font-black ${neto >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {neto >= 0 ? '+' : ''}${neto.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna de Acciones */}
        <div className="flex lg:flex-col gap-2 w-full lg:w-auto">
          <Button
            onClick={() => onEdit(movimiento)}
            className="neo-button bg-secondary hover:bg-muted text-foreground p-3 flex-1 lg:flex-none"
          >
            <Edit className="w-4 h-4 lg:mr-2" />
            <span className="hidden lg:inline">EDITAR</span>
          </Button>
          <Button
            onClick={() => onDelete(movimiento.id)}
            className="neo-button bg-destructive hover:bg-red-600 text-destructive-foreground p-3 flex-1 lg:flex-none"
          >
            <Trash2 className="w-4 h-4 lg:mr-2" />
            <span className="hidden lg:inline">ELIMINAR</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
