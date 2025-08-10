import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Mail, 
  Edit,
  Trash2,
  FileSignature,
  MapPin,
  Clock,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ClienteCard({ cliente, onEdit, onDelete }) {
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), "d MMM yyyy, HH:mm", { locale: es });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="neo-card p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-accent border-3 border-border neo-card flex items-center justify-center flex-shrink-0">
                <span className="text-black font-black text-xl uppercase">
                    {cliente.nombre?.[0] || 'C'}
                </span>
                </div>
                <div>
                <h3 className="font-black text-foreground text-lg uppercase">{cliente.nombre}</h3>
                <p className="text-sm font-bold text-muted-foreground uppercase">{cliente.tipo_documento}: {cliente.documento}</p>
                </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="font-bold text-foreground">{cliente.telefono}</span>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="truncate font-bold text-foreground">{cliente.correo || 'No registrado'}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="font-bold text-foreground">{cliente.direccion}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground pt-2 border-t-2 border-dashed border-border/20">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span className="uppercase">Creado: {formatDate(cliente.created_at)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="uppercase">Actualizado: {formatDate(cliente.updated_at)}</span>
            </div>
          </div>

        </div>
        <div className="flex md:flex-col gap-2">
          <Button
            onClick={() => onEdit(cliente)}
            className="neo-button bg-secondary hover:bg-muted text-foreground p-2 flex-1"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onDelete(cliente.id)}
            className="neo-button bg-destructive hover:bg-red-600 text-destructive-foreground p-2 flex-1"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}