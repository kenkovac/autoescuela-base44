
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save, CreditCard, TrendingUp, TrendingDown } from "lucide-react";
import ApiService from "../api/ApiService";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from "../ui/ToastProvider";

export default function MovimientoContableForm({ movimiento, onSubmit, onCancel, hideRelations = false, contrato = null }) {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    descripcion: "",
    tipo_movimiento: "ingreso",
    cuenta: "Caja", // Default to "Caja"
    moneda: contrato?.moneda || "USD", // Default to contract currency or USD
    debe: "",
    haber: "",
    referencia: "",
    contrato_id: null, // Default to null
    gestoria_venta_id: null // Default to null
  });

  const [contratos, setContratos] = useState([]);
  const [gestoriaVentas, setGestoriaVentas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!hideRelations); // Set isLoading based on hideRelations

  const { addToast } = useToast();

  useEffect(() => {
    if (!hideRelations) {
      loadRelatedData();
    }
    if (movimiento) {
      // If editing an existing movement, populate form data from it
      setFormData({
        fecha: movimiento.fecha || new Date().toISOString().split('T')[0],
        descripcion: movimiento.descripcion || "",
        tipo_movimiento: movimiento.tipo_movimiento || "ingreso",
        cuenta: movimiento.cuenta || "Caja",
        moneda: movimiento.moneda || "USD",
        debe: movimiento.debe || "",
        haber: movimiento.haber || "",
        referencia: movimiento.referencia || "",
        contrato_id: movimiento.contrato_id || null,
        gestoria_venta_id: movimiento.gestoria_venta_id || null
      });
    } else if (contrato) {
      // If creating a new movement for a specific contract, pre-fill some fields
      setFormData(prev => ({
        ...prev,
        moneda: contrato.moneda || "USD",
        contrato_id: contrato.id || null
      }));
    }
  }, [movimiento, hideRelations, contrato]); // Dependencies include movimiento, hideRelations, and contrato

  const loadRelatedData = async () => {
    setIsLoading(true);
    try {
      const [contratosData, gestoriaData] = await Promise.all([
        ApiService.getContratos(),
        ApiService.getGestoriaVentas()
      ]);
      
      // Extraer correctamente los arrays de las respuestas
      const contratosArray = Array.isArray(contratosData) ? contratosData : (contratosData.data || []);
      const gestoriaArray = Array.isArray(gestoriaData) ? gestoriaData : (gestoriaData.data || []);
      
      setContratos(contratosArray);
      setGestoriaVentas(gestoriaArray);
    } catch (error) {
      console.error("Error loading related data:", error);
      addToast("Error al cargar datos relacionados.", "error");
      // Establecer arrays vacíos en caso de error
      setContratos([]);
      setGestoriaVentas([]);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const finalData = {
        ...formData,
        debe: parseFloat(formData.debe) || 0,
        haber: parseFloat(formData.haber) || 0,
        contrato_id: formData.contrato_id ? parseInt(formData.contrato_id) : null,
        gestoria_venta_id: formData.gestoria_venta_id ? parseInt(formData.gestoria_venta_id) : null
      };
      
      await onSubmit(finalData);
    } catch (error) {
      console.error("Error submitting movimiento:", error);
      addToast("Error al guardar movimiento contable. Por favor intenta nuevamente.", "error");
    }
    
    setIsSubmitting(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading && !hideRelations) { // Only show loading when data needs to be fetched and not hidden
    return (
      <Card className="neo-card w-full">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 border-4 border-foreground border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-bold uppercase">CARGANDO DATOS...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-h-[90vh] overflow-y-auto neo-card">
      <CardHeader className="border-b-4 border-border">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase">
            <CreditCard className="w-6 h-6 text-accent" />
            {movimiento ? "EDITAR MOVIMIENTO" : "NUEVO MOVIMIENTO"}
          </CardTitle>
          <Button onClick={onCancel} className="neo-button bg-destructive text-destructive-foreground p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="p-8 space-y-8">
          {/* Información Básica */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-foreground uppercase">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <Label htmlFor="tipo_movimiento" className="text-sm font-black uppercase">Tipo de Movimiento *</Label>
                <Select value={formData.tipo_movimiento} onValueChange={(value) => handleChange("tipo_movimiento", value)}>
                  <SelectTrigger className="neo-input h-12">
                    <SelectValue placeholder="Seleccionar Tipo" />
                  </SelectTrigger>
                  <SelectContent className="neo-card border-4 border-border">
                    <SelectItem value="ingreso" className="font-bold">INGRESO</SelectItem>
                    <SelectItem value="gasto" className="font-bold">GASTO</SelectItem>
                    <SelectItem value="ajuste" className="font-bold">AJUSTE</SelectItem>
                  </SelectContent>
                </Select>
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
            </div>
          </div>

          {/* Cuenta y Referencia */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-foreground uppercase">Cuenta y Referencia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cuenta" className="text-sm font-black uppercase">Cuenta (Opcional)</Label>
                <Input
                  id="cuenta"
                  value={formData.cuenta}
                  onChange={(e) => handleChange("cuenta", e.target.value)}
                  className="neo-input h-12 font-bold"
                  placeholder="Caja, Banco, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referencia" className="text-sm font-black uppercase">Referencia</Label>
                <Input
                  id="referencia"
                  value={formData.referencia}
                  onChange={(e) => handleChange("referencia", e.target.value)}
                  className="neo-input h-12 font-bold"
                  placeholder="Número de referencia"
                />
              </div>
            </div>
          </div>

          {/* Montos */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-foreground uppercase">Montos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="debe" className="text-sm font-black uppercase flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Debe (Ingreso)
                </Label>
                <Input
                  id="debe"
                  type="number"
                  step="0.01"
                  value={formData.debe}
                  onChange={(e) => handleChange("debe", e.target.value)}
                  className="neo-input h-12 font-bold"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="haber" className="text-sm font-black uppercase flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  Haber (Gasto)
                </Label>
                <Input
                  id="haber"
                  type="number"
                  step="0.01"
                  value={formData.haber}
                  onChange={(e) => handleChange("haber", e.target.value)}
                  className="neo-input h-12 font-bold"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Relaciones */}
          {!hideRelations && (
            <div className="space-y-6">
              <h3 className="text-lg font-black text-foreground uppercase">Relaciones (Opcional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contrato_id" className="text-sm font-black uppercase">Contrato Relacionado</Label>
                  <Select value={formData.contrato_id?.toString() || "none"} onValueChange={(value) => handleChange("contrato_id", value === "none" ? null : value)}>
                    <SelectTrigger className="neo-input h-12">
                      <SelectValue placeholder="Seleccionar Contrato" />
                    </SelectTrigger>
                    <SelectContent className="neo-card border-4 border-border">
                      <SelectItem value="none" className="font-bold">NINGUNO</SelectItem>
                      {Array.isArray(contratos) && contratos.map(contrato => (
                        <SelectItem key={contrato.id} value={contrato.id.toString()} className="font-bold text-xs">
                          ID: {contrato.id} - {contrato.instructor?.nombre || 'S/I'} - {contrato.cliente?.nombre || 'S/A'} - {contrato.created_at ? format(new Date(contrato.created_at), 'dd/MM/yy', { locale: es }) : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gestoria_venta_id" className="text-sm font-black uppercase">Gestoría Relacionada</Label>
                  <Select value={formData.gestoria_venta_id?.toString() || "none"} onValueChange={(value) => handleChange("gestoria_venta_id", value === "none" ? null : value)}>
                    <SelectTrigger className="neo-input h-12">
                      <SelectValue placeholder="Seleccionar Gestoría" />
                    </SelectTrigger>
                    <SelectContent className="neo-card border-4 border-border">
                      <SelectItem value="none" className="font-bold">NINGUNA</SelectItem>
                      {Array.isArray(gestoriaVentas) && gestoriaVentas.map(gestoria => (
                        <SelectItem key={gestoria.id} value={gestoria.id.toString()} className="font-bold text-xs">
                          {gestoria.fecha ? format(new Date(gestoria.fecha), 'dd/MM/yy', { locale: es }) : ''} - {gestoria.tipo_tramite || 'Trámite'} - {gestoria.cliente?.nombre || 'Cliente N/A'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Descripción */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-foreground uppercase">Descripción</h3>
            <div className="space-y-2">
              <Label htmlFor="descripcion" className="text-sm font-black uppercase">Descripción del Movimiento</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
                placeholder="DESCRIBE EL MOTIVO DEL MOVIMIENTO..."
                rows={3}
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
                {movimiento ? "ACTUALIZAR" : "CREAR"} MOVIMIENTO
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
