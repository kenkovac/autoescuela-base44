import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save, UserPlus } from "lucide-react";

export default function ClienteQuickForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    documento: "",
    tipo_documento: "CEDULA",
    direccion: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
    setIsSubmitting(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full neo-card">
      <CardHeader className="border-b-4 border-border">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3 text-xl font-black uppercase">
            <UserPlus className="w-6 h-6 text-accent" />
            CREAR CLIENTE RÁPIDO
          </CardTitle>
          <Button onClick={onCancel} className="neo-button bg-destructive text-destructive-foreground p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-black uppercase">Nombre Completo *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                required
                className="neo-input h-10 font-bold"
                placeholder="Juan Pérez"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-sm font-black uppercase">Teléfono *</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                required
                className="neo-input h-10 font-bold"
                placeholder="04141234567"
              />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="tipo_documento" className="text-sm font-black uppercase">Tipo de Documento *</Label>
                <Select value={formData.tipo_documento} onValueChange={(value) => handleChange("tipo_documento", value)}>
                  <SelectTrigger className="neo-input h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="neo-card border-4 border-border">
                    <SelectItem value="CEDULA" className="font-bold">CÉDULA</SelectItem>
                    <SelectItem value="RIF" className="font-bold">RIF</SelectItem>
                  </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documento" className="text-sm font-black uppercase">Número de Documento *</Label>
              <Input
                id="documento"
                value={formData.documento}
                onChange={(e) => handleChange("documento", e.target.value)}
                required
                className="neo-input h-10 font-bold"
                placeholder="12345678"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="correo" className="text-sm font-black uppercase">Email (Opcional)</Label>
              <Input
                id="correo"
                type="email"
                value={formData.correo}
                onChange={(e) => handleChange("correo", e.target.value)}
                className="neo-input h-10 font-bold"
                placeholder="juan@example.com"
              />
            </div>
          </div>
        </CardContent>

        <div className="border-t-4 border-border px-6 py-4 flex justify-end gap-3">
          <Button type="button" onClick={onCancel} disabled={isSubmitting} className="neo-button bg-secondary text-foreground font-black uppercase">
            CANCELAR
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="neo-button bg-accent text-black font-black uppercase"
          >
            {isSubmitting ? "CREANDO..." : (
              <>
                <Save className="w-4 h-4 mr-2" />
                CREAR CLIENTE
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}