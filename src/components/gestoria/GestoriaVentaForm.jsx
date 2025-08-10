
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save, Building2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ApiService from "../api/ApiService";
import ClienteQuickForm from "../clientes/ClienteQuickForm";
import SearchableCombobox from "../ui/SearchableCombobox";
import { useToast } from "../ui/ToastProvider";

export default function GestoriaVentaForm({ gestoria, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    cliente_id: gestoria?.cliente_id || "",
    fecha: gestoria?.fecha || new Date().toISOString().split('T')[0],
    tipo_tramite: gestoria?.tipo_tramite || "",
    descripcion: gestoria?.descripcion || "",
    monto: gestoria?.monto || "",
    moneda: gestoria?.moneda || "USD",
    referencia_pago: gestoria?.referencia_pago || "",
    observaciones: gestoria?.observaciones || ""
  });
  
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const finalData = {
        ...formData,
        cliente_id: parseInt(formData.cliente_id),
        monto: parseFloat(formData.monto)
      };
      
      await onSubmit(finalData);
    } catch (error) {
      console.error("Error submitting gestoria:", error);
      addToast("Error al guardar gestoría. Por favor intenta nuevamente.", "error");
    }
    
    setIsSubmitting(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClienteCreated = async (nuevoCliente) => {
    try {
      const clienteCreado = await ApiService.createCliente(nuevoCliente);
      handleChange("cliente_id", clienteCreado.id.toString());
      setShowClienteForm(false);
      addToast("Cliente creado exitosamente.", "success");
    } catch (error) {
      console.error("Error creating cliente:", error);
      addToast("Error al crear cliente. Por favor, intenta de nuevo.", "error");
    }
  };

  return (
    <>
      <Card className="w-full max-h-[90vh] overflow-y-auto neo-card">
        <CardHeader className="border-b-4 border-border">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase">
              <Building2 className="w-6 h-6 text-accent" />
              {gestoria ? "EDITAR GESTORÍA" : "NUEVA GESTORÍA"}
            </CardTitle>
            <Button onClick={onCancel} className="neo-button bg-destructive text-destructive-foreground p-2">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-8 space-y-8">
            {/* Información del Cliente */}
            <div className="space-y-6">
              <h3 className="text-lg font-black text-foreground uppercase">Información del Cliente</h3>
              <div className="space-y-2">
                <Label htmlFor="cliente_id" className="text-sm font-black uppercase">Cliente *</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <SearchableCombobox
                      apiFetchFunction={(params) => ApiService.getClientes(params)}
                      value={formData.cliente_id}
                      onChange={(value) => handleChange("cliente_id", value)}
                      placeholder="SELECCIONAR CLIENTE"
                      searchPlaceholder="Buscar cliente..."
                      displayRender={(item) => `${item.nombre} - ${item.documento}`}
                      valueField="id"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowClienteForm(true)}
                    className="neo-button bg-accent text-black px-4"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Información del Trámite */}
            <div className="space-y-6">
              <h3 className="text-lg font-black text-foreground uppercase">Información del Trámite</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fecha" className="text-sm font-black uppercase">Fecha *</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => handleChange("fecha", e.target.value)}
                    required
                    className="neo-input h-12 font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo_tramite" className="text-sm font-black uppercase">Tipo de Trámite *</Label>
                  <Input
                    id="tipo_tramite"
                    value={formData.tipo_tramite}
                    onChange={(e) => handleChange("tipo_tramite", e.target.value)}
                    required
                    className="neo-input h-12 font-bold"
                    placeholder="Duplicado, Renovación, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-sm font-black uppercase">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleChange("descripcion", e.target.value)}
                  placeholder="DESCRIBE EL TRÁMITE A REALIZAR..."
                  rows={3}
                  className="neo-input font-bold placeholder:text-muted-foreground/50 placeholder:uppercase"
                />
              </div>
            </div>

            {/* Información Financiera */}
            <div className="space-y-6">
              <h3 className="text-lg font-black text-foreground uppercase">Información Financiera</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="monto" className="text-sm font-black uppercase">Monto *</Label>
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    value={formData.monto}
                    onChange={(e) => handleChange("monto", e.target.value)}
                    required
                    className="neo-input h-12 font-bold"
                    placeholder="150.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moneda" className="text-sm font-black uppercase">Moneda *</Label>
                  <Select value={formData.moneda} onValueChange={(value) => handleChange("moneda", value)}>
                    <SelectTrigger className="neo-input h-12">
                      <SelectValue placeholder="Seleccionar Moneda" />
                    </SelectTrigger>
                    <SelectContent className="neo-card border-4 border-border">
                      <SelectItem value="USD" className="font-bold">USD - DÓLAR</SelectItem>
                      <SelectItem value="EUR" className="font-bold">EUR - EURO</SelectItem>
                      <SelectItem value="VES" className="font-bold">VES - BOLÍVAR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referencia_pago" className="text-sm font-black uppercase">Referencia de Pago</Label>
                  <Input
                    id="referencia_pago"
                    value={formData.referencia_pago}
                    onChange={(e) => handleChange("referencia_pago", e.target.value)}
                    className="neo-input h-12 font-bold"
                    placeholder="REF12345"
                  />
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-foreground uppercase">Observaciones</h3>
              <div className="space-y-2">
                <Label htmlFor="observaciones" className="text-sm font-black uppercase">Observaciones Adicionales</Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => handleChange("observaciones", e.target.value)}
                  placeholder="AGREGA CUALQUIER INFORMACIÓN ADICIONAL..."
                  rows={4}
                  className="neo-input font-bold placeholder:text-muted-foreground/50 placeholder:uppercase"
                />
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
                  {gestoria ? "ACTUALIZAR" : "CREAR"} GESTORÍA
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      <AnimatePresence>
        {showClienteForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl"
            >
              <ClienteQuickForm
                onSubmit={handleClienteCreated}
                onCancel={() => setShowClienteForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
