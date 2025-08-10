
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Edit,
  Trash2,
  User,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function UsuarioCard({ usuario, onEdit, onDelete }) {
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
               <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.name || 'U')}&background=3b82f6&color=fff&font-size=0.5&bold=true`}
                  alt={`Avatar de ${usuario.name || 'Usuario'}`}
                  className="w-14 h-14 neo-card border-3 border-border object-cover flex-shrink-0"
                />
              <div>
                <h3 className="font-black text-foreground text-lg uppercase">{usuario.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground">{usuario.email}</span>
                  {usuario.email_verified_at ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Badge className={`border-2 border-border font-black ${
                usuario.email_verified_at 
                  ? "bg-[var(--neo-green)] text-black" 
                  : "bg-[var(--neo-red)] text-white"
              }`}>
                {usuario.email_verified_at ? "VERIFICADO" : "SIN VERIFICAR"}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-foreground block">ID: {usuario.id}</span>
              </div>
            </div>
            
            {usuario.email_verified_at && (
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-foreground block">Email verificado</span>
                  <span className="text-muted-foreground text-xs">{formatDate(usuario.email_verified_at)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground pt-2 border-t-2 border-dashed border-border/20">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span className="uppercase">Creado: {formatDate(usuario.created_at)}</span>
            </div>
            {usuario.updated_at && usuario.updated_at !== usuario.created_at && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span className="uppercase">Actualizado: {formatDate(usuario.updated_at)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex md:flex-col gap-2">
          <Button
            onClick={() => onEdit(usuario)}
            className="neo-button bg-secondary hover:bg-muted text-foreground p-2 flex-1"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onDelete(usuario.id)}
            className="neo-button bg-destructive hover:bg-red-600 text-destructive-foreground p-2 flex-1"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
