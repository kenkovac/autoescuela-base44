
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save, User, FileSignature } from "lucide-react";

export default function ClienteForm({ cliente, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: cliente?.nombre || "",
    correo: cliente?.correo || "",
    telefono: cliente?.telefono || "",
    direccion: cliente?.direccion || "",
    tipo_documento: cliente?.tipo_documento || "CEDULA", // Changed default value
    documento: cliente?.documento || ""
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
    <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto neo-card">
      <CardHeader className="border-b-4 border-border">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase">
            <User className="w-6 h-6 text-accent" />
            {cliente ? "EDITAR CLIENTE" : "NUEVO CLIENTE"}
          </CardTitle>
          <Button onClick={onCancel} className="neo-button bg-destructive text-destructive-foreground p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-6">
            <h3 className="text-lg font-black text-foreground uppercase">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-black uppercase">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  required
                  className="neo-input h-12 font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-sm font-black uppercase">Teléfono *</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleChange("telefono", e.target.value)}
                  required
                  className="neo-input h-12 font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="correo" className="text-sm font-black uppercase">Email (Opcional)</Label>
                <Input
                  id="correo"
                  type="email"
                  value={formData.correo}
                  onChange={(e) => handleChange("correo", e.target.value)}
                  className="neo-input h-12 font-bold"
                />
              </div>

               <div className="space-y-2">
                <Label htmlFor="direccion" className="text-sm font-black uppercase">Dirección (Opcional)</Label> {/* Changed label text */}
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => handleChange("direccion", e.target.value)}
                  className="neo-input h-12 font-bold"
                  // Removed 'required' attribute
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-black text-foreground uppercase">Información de Identificación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tipo_documento" className="text-sm font-black uppercase">Tipo de Documento *</Label>
                <Select value={formData.tipo_documento} onValueChange={(value) => handleChange("tipo_documento", value)}>
                  <SelectTrigger className="neo-input h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="neo-card border-4 border-border">
                    <SelectItem value="CEDULA" className="font-bold">CÉDULA</SelectItem> {/* Changed value and text */}
                    <SelectItem value="RIF" className="font-bold">RIF</SelectItem> {/* Changed value and text, removed others */}
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
                  className="neo-input h-12 font-bold"
                />
              </div>
            </div>
          </div>
        </CardContent>

        <div className="border-t-4 border-border px-8 py-6 flex justify-end gap-4">
          <Button type="button" onClick={onCancel} disabled={isSubmitting} className="neo-button bg-secondary text-foreground font-black uppercase">
            CANCELAR
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="neo-button bg-accent text-black font-black uppercase"
          >
            {isSubmitting ? "GUARDANDO..." : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {cliente ? "ACTUALIZAR" : "CREAR"} CLIENTE
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
