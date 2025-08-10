import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Mail, 
  Edit,
  Trash2,
  Car,
  User,
  ShieldCheck,
  Clock
} from "lucide-react";
import HorarioInstructor from "./HorarioInstructor";
import { motion, AnimatePresence } from "framer-motion";

export default function InstructorCard({ instructor, onEdit, onDelete }) {
  const [showHorario, setShowHorario] = useState(false);

  return (
    <>
      <div className="neo-card p-4">
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Columna Izquierda: Perfil y Contacto */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-4">
              <img 
                src={instructor.photo_perfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.nombre || 'Instructor')}&background=fbbf24&color=000&font-size=0.5`}
                alt={`Foto de ${instructor.nombre || 'Instructor'}`}
                className="w-16 h-16 neo-card border-3 border-border object-cover"
              />
              <div>
                <h3 className="font-black text-foreground text-lg uppercase">{instructor.nombre || 'Sin nombre'}</h3>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {instructor.telefono && (
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span className="font-bold">{instructor.telefono}</span></div>
              )}
              {instructor.email && (
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /><span className="font-bold">{instructor.email}</span></div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Vehículo y Acciones */}
          <div className="flex-1 bg-secondary p-4 neo-card border-3 border-border space-y-3">
            <div className="flex items-center gap-4">
              <img 
                src={instructor.photo_vehicle || `https://placehold.co/100x100/3b82f6/fff/png?text=Auto`}
                alt={`Vehículo de ${instructor.nombre || 'Instructor'}`}
                className="w-16 h-16 neo-card border-3 border-border object-cover"
              />
              <div>
                <h4 className="font-black text-foreground uppercase">
                  {instructor.marca_vehiculo || 'Sin marca'} {instructor.modelo_vehiculo || ''}
                </h4>
                {instructor.placa_vehiculo && (
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                    <span className="font-bold text-foreground">{instructor.placa_vehiculo}</span>
                  </div>
                )}
                {instructor.color_vehiculo && (
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <span className="font-bold text-foreground">{instructor.color_vehiculo}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <Button onClick={() => onEdit(instructor)} className="neo-button bg-secondary text-foreground p-2 flex-1"><Edit className="w-4 h-4 mr-2" /> EDITAR</Button>
            <Button onClick={() => setShowHorario(true)} className="neo-button bg-secondary text-foreground p-2 flex-1"><Clock className="w-4 h-4 mr-2" /> HORARIO</Button>
            <Button onClick={() => onDelete(instructor.id)} className="neo-button bg-destructive text-destructive-foreground p-2 flex-1"><Trash2 className="w-4 h-4 mr-2" /> ELIMINAR</Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showHorario && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowHorario(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <HorarioInstructor instructorId={instructor.id} instructorNombre={instructor.nombre || 'Instructor'} onCancel={() => setShowHorario(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}