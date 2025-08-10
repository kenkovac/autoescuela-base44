import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  Shield,
  Clock,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function RoleCard({ role, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), "d MMM yyyy, HH:mm", { locale: es });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="neo-card p-4 h-full flex flex-col">
      <div className="flex-grow space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent border-3 border-border neo-card flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-black" />
          </div>
          <div>
            <h3 className="font-black text-foreground text-lg uppercase">{role.display_name}</h3>
            <Badge className="font-mono text-xs" variant="secondary">{role.name}</Badge>
          </div>
        </div>
        
        <div className="space-y-2 text-xs font-bold text-muted-foreground pt-2 border-t-2 border-dashed border-border/20">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span className="uppercase">Creado: {formatDate(role.created_at)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="uppercase">Actualizado: {formatDate(role.updated_at)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button
          onClick={() => onEdit(role)}
          className="neo-button bg-secondary hover:bg-muted text-foreground p-2 flex-1"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => onDelete(role.id)}
          className="neo-button bg-destructive hover:bg-red-600 text-destructive-foreground p-2 flex-1"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}