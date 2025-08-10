import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Clock, Trash2, Calendar, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ApiService from "../api/ApiService";
import ConfirmationDialog from '../ui/ConfirmationDialog';
import { useToast } from "../ui/ToastProvider";

const diasSemana = [
  { id: 1, label: "Lunes" },
  { id: 2, label: "Martes" },
  { id: 3, label: "Miércoles" },
  { id: 4, label: "Jueves" },
  { id: 5, label: "Viernes" },
  { id: 6, label: "Sábado" },
  { id: 7, label: "Domingo" }
];

export default function BloquesContratoTab({ contratoId, onDataChange }) {
  const [bloques, setBloques] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialogState, setDialogState] = useState({ isOpen: false });
  const [formData, setFormData] = useState({
    dia_semana: '',
    hora_inicio: '',
    hora_fin: ''
  });

  const { addToast } = useToast();

  const loadBloques = useCallback(async () => {
    if (!contratoId) return;
    setIsLoading(true);
    try {
      const response = await ApiService.getBloquesContrato(contratoId);
      let bloquesData = [];
      if (Array.isArray(response)) {
        bloquesData = response;
      } else if (response && Array.isArray(response.data)) {
        bloquesData = response.data;
      }
      setBloques(bloquesData);
    } catch (error) {
      console.error("Error loading bloques:", error);
      setBloques([]);
    } finally {
      setIsLoading(false);
    }
  }, [contratoId, refreshKey]);

  useEffect(() => {
    loadBloques();
  }, [loadBloques]);

  const refreshBloques = () => {
    setRefreshKey(k => k + 1);
    if (onDataChange) onDataChange();
  };

  const resetForm = () => {
    setFormData({
      dia_semana: '',
      hora_inicio: '',
      hora_fin: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.dia_semana || !formData.hora_inicio || !formData.hora_fin) {
      addToast("Por favor completa todos los campos.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const bloqueData = {
        contrato_id: contratoId,
        dia_semana: parseInt(formData.dia_semana),
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin
      };

      await ApiService.createBloqueContrato(bloqueData);
      setShowForm(false);
      resetForm();
      refreshBloques();
      addToast("Horario agregado exitosamente.", "success");
    } catch (error) {
      console.error("Error creating bloque:", error);
      addToast("Error al agregar horario. Por favor intenta nuevamente.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = (bloqueId) => {
    setDialogState({
      isOpen: true,
      title: '¿ELIMINAR HORARIO?',
      description: 'Este horario será eliminado permanentemente del contrato. ¿Estás seguro?',
      onConfirm: () => performDelete(bloqueId),
      confirmText: 'SÍ, ELIMINAR'
    });
  };

  const performDelete = async (bloqueId) => {
    try {
      await ApiService.deleteBloqueContrato(bloqueId);
      refreshBloques();
      addToast("Horario eliminado exitosamente.", "success");
    } catch (error) {
      console.error("Error deleting bloque:", error);
      addToast("Error al eliminar horario.", "error");
    } finally {
      setDialogState({ isOpen: false });
    }
  };

  const getDiaNombre = (diaNumero) => {
    const dia = diasSemana.find(d => d.id === parseInt(diaNumero));
    return dia ? dia.label : `Día ${diaNumero}`;
  };

  const formatHora = (hora) => {
    if (!hora) return '';
    const [hours, minutes] = hora.split(':');
    if (isNaN(hours) || isNaN(minutes)) return hora; // Fallback for invalid format
    const h = parseInt(hours);
    const m = parseInt(minutes);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-secondary animate-pulse rounded-lg mb-4"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-black uppercase text-foreground">Horarios de Clase</h3>
          <Badge className="bg-secondary text-foreground border-2 border-border font-black">
            {bloques.length} BLOQUE(S) DEFINIDO(S)
          </Badge>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="neo-button bg-[var(--neo-green)] text-black hover:bg-green-400"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'OCULTAR FORMULARIO' : 'AGREGAR HORARIO'}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-secondary p-6 neo-card border-4 border-border overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="text-lg font-black uppercase text-foreground mb-4">Nuevo Horario</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-black uppercase">Día de la Semana *</Label>
                  <Select 
                    value={formData.dia_semana} 
                    onValueChange={(value) => setFormData(prev => ({...prev, dia_semana: value}))}
                  >
                    <SelectTrigger className="neo-input h-12">
                      <SelectValue placeholder="Seleccionar Día" />
                    </SelectTrigger>
                    <SelectContent className="neo-card border-4 border-border">
                      {diasSemana.map(dia => (
                        <SelectItem key={dia.id} value={dia.id.toString()} className="font-bold">
                          {dia.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-black uppercase">Hora Inicio *</Label>
                  <Input
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData(prev => ({...prev, hora_inicio: e.target.value}))}
                    required
                    className="neo-input h-12 font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-black uppercase">Hora Fin *</Label>
                  <Input
                    type="time"
                    value={formData.hora_fin}
                    onChange={(e) => setFormData(prev => ({...prev, hora_fin: e.target.value}))}
                    required
                    className="neo-input h-12 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                  className="neo-button bg-secondary text-foreground"
                >
                  <X className="w-4 h-4 mr-2" />
                  CANCELAR
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="neo-button bg-accent text-black"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "GUARDANDO..." : "GUARDAR HORARIO"}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {bloques.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-xl font-black text-foreground uppercase mb-2">Sin Horarios Definidos</h4>
          <p className="text-muted-foreground font-bold uppercase">
            Este contrato no tiene bloques de horario configurados.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {bloques.map((bloque) => (
              <motion.div
                key={bloque.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="neo-card bg-white/80">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent neo-card border-3 border-border flex items-center justify-center">
                          <Clock className="w-6 h-6 text-black" />
                        </div>
                        <div>
                          <h4 className="font-black text-foreground text-lg uppercase">
                            {getDiaNombre(bloque.dia_semana)}
                          </h4>
                          <p className="text-sm font-bold text-muted-foreground uppercase">
                            {formatHora(bloque.hora_inicio)} - {formatHora(bloque.hora_fin)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleDeleteRequest(bloque.id)}
                          className="neo-button bg-destructive text-destructive-foreground p-2"
                          title="Eliminar horario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ConfirmationDialog
        isOpen={dialogState.isOpen}
        onCancel={() => setDialogState({ isOpen: false })}
        onConfirm={dialogState.onConfirm}
        title={dialogState.title}
        description={dialogState.description}
        confirmText={dialogState.confirmText}
      />
    </div>
  );
}