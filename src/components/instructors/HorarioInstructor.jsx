
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Clock, Save, Trash2, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ApiService from "../api/ApiService";

export default function HorarioInstructor({ instructorId, instructorNombre, onCancel }) {
  const [horarios, setHorarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHorario, setEditingHorario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    instructor_id: instructorId,
    dia_semana: "",
    hora_inicio: "",
    hora_fin: ""
  });

  useEffect(() => {
    loadHorarios();
  }, [instructorId]);

  const loadHorarios = async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.getHorariosInstructor(instructorId);
      setHorarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading horarios:", error);
      setHorarios([]);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHorario) {
        await ApiService.updateHorarioInstructor(editingHorario.id, formData);
      } else {
        await ApiService.createHorarioInstructor(formData);
      }
      setShowForm(false);
      setEditingHorario(null);
      resetForm();
      loadHorarios();
    } catch (error) {
      console.error("Error saving horario:", error);
      alert("Error al guardar horario. Verifica los datos e intenta nuevamente.");
    }
  };

  const handleEdit = (horario) => {
    setEditingHorario(horario);
    setFormData({
      instructor_id: instructorId,
      dia_semana: String(horario.dia_semana), // Convertir a string para el Select
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este horario?")) {
      try {
        await ApiService.deleteHorarioInstructor(id);
        loadHorarios();
      } catch (error) {
        console.error("Error deleting horario:", error);
        alert("Error al eliminar horario.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      instructor_id: instructorId,
      dia_semana: "",
      hora_inicio: "",
      hora_fin: ""
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const diasSemana = [
    { id: "1", label: "Lunes" },
    { id: "2", label: "Martes" },
    { id: "3", label: "Miércoles" },
    { id: "4", label: "Jueves" },
    { id: "5", label: "Viernes" },
    { id: "6", label: "Sábado" },
    { id: "7", label: "Domingo" }
  ];

  return (
    <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto neo-card">
      <CardHeader className="border-b-4 border-border">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase">
            <Clock className="w-6 h-6 text-accent" />
            HORARIO - {instructorNombre}
          </CardTitle>
          <Button onClick={onCancel} className="neo-button bg-destructive text-destructive-foreground p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Botón Agregar Horario */}
        <div className="flex justify-end">
          <Button
            onClick={() => {
              resetForm();
              setEditingHorario(null);
              setShowForm(true);
            }}
            className="neo-button bg-[var(--neo-green)] text-black hover:bg-green-400"
          >
            <Plus className="w-4 h-4 mr-2" />
            AGREGAR HORARIO
          </Button>
        </div>

        {/* Formulario */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-secondary p-6 neo-card border-4 border-border"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dia_semana" className="text-sm font-black uppercase">Día de la Semana *</Label>
                    <Select value={formData.dia_semana} onValueChange={(value) => handleChange("dia_semana", value)}>
                      <SelectTrigger className="neo-input h-12">
                        <SelectValue placeholder="Seleccionar Día" />
                      </SelectTrigger>
                      <SelectContent className="neo-card border-4 border-border">
                        {diasSemana.map(dia => (
                          <SelectItem key={dia.id} value={dia.id} className="font-bold">
                            {dia.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hora_inicio" className="text-sm font-black uppercase">Hora Inicio *</Label>
                    <Input
                      id="hora_inicio"
                      type="time"
                      value={formData.hora_inicio}
                      onChange={(e) => handleChange("hora_inicio", e.target.value)}
                      required
                      className="neo-input h-12 font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hora_fin" className="text-sm font-black uppercase">Hora Fin *</Label>
                    <Input
                      id="hora_fin"
                      type="time"
                      value={formData.hora_fin}
                      onChange={(e) => handleChange("hora_fin", e.target.value)}
                      required
                      className="neo-input h-12 font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingHorario(null);
                      resetForm();
                    }}
                    className="neo-button bg-secondary text-foreground"
                  >
                    CANCELAR
                  </Button>
                  <Button type="submit" className="neo-button bg-accent text-black">
                    <Save className="w-4 h-4 mr-2" />
                    {editingHorario ? "ACTUALIZAR" : "CREAR"} HORARIO
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de Horarios */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-foreground border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground font-bold uppercase">CARGANDO HORARIOS...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {horarios.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-black text-foreground uppercase">NO HAY HORARIOS CONFIGURADOS</h3>
                <p className="text-muted-foreground font-bold">Agrega el primer horario para este instructor.</p>
              </div>
            ) : (
              horarios.map((horario) => (
                <div key={horario.id} className="bg-card p-4 neo-card border-2 border-border">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h4 className="text-lg font-black text-foreground uppercase">
                          {diasSemana.find(d => d.id == horario.dia_semana)?.label || `Día ${horario.dia_semana}`}
                        </h4>
                        <span className="text-accent font-black text-lg">
                          {horario.hora_inicio} - {horario.hora_fin}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(horario)}
                        className="neo-button bg-secondary text-foreground p-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(horario.id)}
                        className="neo-button bg-destructive text-destructive-foreground p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
