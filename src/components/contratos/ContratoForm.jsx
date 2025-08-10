
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save, FileText, Plus, Trash2, Calendar, Clock, Zap } from "lucide-react";
import ApiService from "../api/ApiService";
import ClienteQuickForm from "../clientes/ClienteQuickForm";
import { motion, AnimatePresence } from "framer-motion";
import SearchableCombobox from "../ui/SearchableCombobox";
import { useToast } from "../ui/ToastProvider";

const diasSemana = [
    { id: 1, label: "Lunes" }, { id: 2, label: "Martes" }, { id: 3, label: "Miércoles" },
    { id: 4, label: "Jueves" }, { id: 5, label: "Viernes" }, { id: 6, label: "Sábado" }, { id: 7, label: "Domingo" }
];

const metodoPagoOptions = [
    { label: 'Cashea Business', value: 'Cashea Business', currency: 'VES' },
    { label: 'Cashea Link', value: 'Cashea Link', currency: 'VES' },
    { label: 'Dolares', value: 'Dolares', currency: 'USD' },
    { label: 'Bolivares', value: 'Bolivares', currency: 'VES' },
    { label: 'Pago Movil', value: 'Pago Movil', currency: 'VES' },
    { label: 'Zelle', value: 'Zelle', currency: 'USD' },
    { label: 'M Panama', value: 'M Panama', currency: 'USD' },
    { label: 'Crypto', value: 'Crypto', currency: 'USD' },
];

const metodoClaseOptions = [
    { label: 'Vehiculo Automatico', value: 'Vehiculo Automatico' },
    { label: 'Vehiculo Sincronico', value: 'Vehiculo Sincronico' },
    { label: 'Moto Automatica', value: 'Moto Automatica' },
    { label: 'Moto Sincronica', value: 'Moto Sincronica' }
];

const modoClaseOptions = [
    { label: 'Semanal', value: 'Semanal' },
    { label: 'Fin de Semana', value: 'Fin de Semana' }
];

export default function ContratoForm({ contrato, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    cliente_id: "",
    fk_instructor: "",
    total: "",
    total_instructor: "",
    fecha_inicio: "",
    fecha_fin: "",
    metodo_pago: "Dolares",
    tipo_pago: "",
    metodo_clase: "Vehiculo Automatico",
    punto_encuentro: "",
    modo_clase: "Semanal",
    horario: "", // Added 'horario' field
    notas: ""
  });

  const [bloques, setBloques] = useState([]);
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para la generación automática de horarios
  const [autoGenerate, setAutoGenerate] = useState({
    enabled: false,
    horaInicio: "08:00",
    horaFin: "12:00"
  });

  const { addToast } = useToast();

  // Obtener la moneda basada en el método de pago seleccionado
  const getSelectedCurrency = () => {
    const selectedMethod = metodoPagoOptions.find(method => method.value === formData.metodo_pago);
    return selectedMethod ? selectedMethod.currency : 'USD';
  };

  useEffect(() => {
    loadInitialData();
  }, [contrato]);

  const loadInitialData = async () => {
    setIsLoading(true);
    if (contrato) {
        setFormData({
            ...contrato,
            cliente_id: contrato.cliente_id?.toString() || "",
            fk_instructor: contrato.fk_instructor?.toString() || "",
            total: contrato.total || "",
            total_instructor: contrato.total_instructor || "",
            metodo_pago: contrato.metodo_pago || "Dolares",
            tipo_pago: contrato.tipo_pago || "",
            horario: contrato.horario || "", // Load existing 'horario'
        });
        try {
            const bloquesResponse = await ApiService.getBloquesContrato(contrato.id);
            const bloquesData = Array.isArray(bloquesResponse) ? bloquesResponse : (bloquesResponse.data || []);
            
            if (bloquesData.length > 0) {
                setBloques(bloquesData.map(b => ({...b, dia_semana: b.dia_semana.toString()})));
            }
        } catch(error) {
            console.error("Error loading bloques", error);
            addToast("Error al cargar bloques del contrato.", "error");
        }
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Helper function to format 24-hour to 12-hour (e.g., "14:30" -> "2:30 PM")
    const formatHour12 = (hour24) => {
        if (!hour24) return '';
        const [hoursStr, minutesStr] = hour24.split(':');
        const hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);

        if (isNaN(hours) || isNaN(minutes)) return '';

        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12; // Converts 0 to 12 for AM/PM format
        const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;

        return `${hour12}:${paddedMinutes} ${ampm}`;
    };

    try {
      // Filtrar bloques válidos (que tengan todos los campos requeridos)
      const validBloques = bloques.filter(bloque => 
        bloque.dia_semana && 
        bloque.hora_inicio && 
        bloque.hora_fin &&
        bloque.dia_semana !== '' &&
        bloque.hora_inicio !== '' &&
        bloque.hora_fin !== ''
      );

      let horarioString = "";
      if (validBloques.length > 0) {
        const firstBloque = validBloques[0]; // Take the first valid bloque for summary
        const horaInicio = formatHour12(firstBloque.hora_inicio);
        const horaFin = formatHour12(firstBloque.hora_fin);
        if (horaInicio && horaFin) {
          horarioString = `${horaInicio} - ${horaFin}`;
        }
      }

      // Preparar SOLO los datos del contrato (sin relaciones)
      const contratoData = {
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        total: parseFloat(formData.total),
        total_instructor: parseFloat(formData.total_instructor) || 0,
        metodo_pago: formData.metodo_pago,
        tipo_pago: formData.tipo_pago,
        metodo_clase: formData.metodo_clase,
        punto_encuentro: formData.punto_encuentro,
        modo_clase: formData.modo_clase,
        horario: horarioString, // Include the generated/updated 'horario' string
        notas: formData.notas,
        fk_instructor: parseInt(formData.fk_instructor),
        cliente_id: parseInt(formData.cliente_id),
        moneda: getSelectedCurrency()
      };
      
      const bloquesData = validBloques.map(b => ({
        dia_semana: parseInt(b.dia_semana),
        hora_inicio: b.hora_inicio,
        hora_fin: b.hora_fin
      }));
      
      await onSubmit(contratoData, bloquesData);
    } catch (error) {
      console.error("Error submitting form:", error);
      addToast("Error al guardar contrato. Por favor intenta nuevamente.", "error");
    }
    
    setIsSubmitting(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleBloqueChange = (index, field, value) => {
    const newBloques = [...bloques];
    newBloques[index][field] = value;
    setBloques(newBloques);
  };

  const addBloque = () => {
    setBloques([...bloques, { dia_semana: '', hora_inicio: '', hora_fin: '' }]);
  };

  const removeBloque = (index) => {
    const newBloques = bloques.filter((_, i) => i !== index);
    setBloques(newBloques);
  };

  const generateAutoSchedule = () => {
    if (!formData.fecha_inicio || !formData.fecha_fin || !autoGenerate.horaInicio || !autoGenerate.horaFin) {
      addToast("Por favor completa las fechas de inicio y fin del contrato, y las horas de clase.", "error");
      return;
    }

    const newBloques = [];
    let diasTarget = [];

    // Determinar qué días generar basado en el modo de clase
    if (formData.modo_clase === 'Semanal') {
      diasTarget = [1, 2, 3, 4, 5]; // Lunes a Viernes
    } else if (formData.modo_clase === 'Fin de Semana') {
      diasTarget = [6, 7]; // Sábado y Domingo
    }

    // Generar bloques para cada día objetivo
    diasTarget.forEach(dia => {
      newBloques.push({
        dia_semana: dia.toString(),
        hora_inicio: autoGenerate.horaInicio,
        hora_fin: autoGenerate.horaFin
      });
    });

    setBloques(newBloques);
    setAutoGenerate(prev => ({ ...prev, enabled: false }));
    addToast(`Horarios generados automáticamente para ${formData.modo_clase}`, "success");
  };

  const handleClienteCreated = async (nuevoCliente) => {
    try {
        const clienteCreado = await ApiService.createCliente(nuevoCliente);
        handleChange("cliente_id", clienteCreado.id.toString());
        setShowClienteForm(false);
        addToast("Cliente creado y seleccionado exitosamente.", "success");
    } catch (error) {
        console.error("Error creating cliente:", error);
        addToast("Error al crear cliente. Por favor intenta nuevamente.", "error");
    }
  };

  if (isLoading) {
    return <Card className="neo-card p-12 text-center"><p>Cargando...</p></Card>;
  }

  const currentCurrency = getSelectedCurrency();

  return (
    <>
      <Card className="w-full max-h-[90vh] overflow-y-auto neo-card">
        <CardHeader className="border-b-4 border-border">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase">
              <FileText className="w-6 h-6 text-accent" />
              {contrato ? "EDITAR CONTRATO" : "NUEVO CONTRATO"}
            </CardTitle>
            <Button onClick={onCancel} className="neo-button bg-destructive text-destructive-foreground p-2">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna Izquierda */}
            <div className="space-y-6">
              <h3 className="text-lg font-black text-foreground uppercase">Información del Contrato</h3>
              
              {/* Mostrar ID del contrato si está en modo edición */}
              {contrato && (
                <div className="p-4 bg-secondary/50 neo-card border-2 border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-muted-foreground uppercase">ID del Contrato</p>
                      <p className="text-2xl font-black text-foreground">#{contrato.id}</p>
                    </div>
                    <div className="text-xs font-bold text-muted-foreground uppercase">
                      ID Automático
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fk_instructor" className="text-sm font-black uppercase">Instructor *</Label>
                  <SearchableCombobox
                    apiFetchFunction={(params) => ApiService.getInstructores(params)}
                    value={formData.fk_instructor}
                    onChange={(value) => handleChange("fk_instructor", value)}
                    placeholder="Seleccionar Instructor..."
                    searchPlaceholder="Buscar instructor..."
                    displayField="nombre"
                    valueField="id"
                  />
                </div>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="cliente_id" className="text-sm font-black uppercase">Cliente *</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                       <SearchableCombobox
                          apiFetchFunction={(params) => ApiService.getClientes(params)}
                          value={formData.cliente_id}
                          onChange={(value) => handleChange("cliente_id", value)}
                          placeholder="Seleccionar Cliente..."
                          searchPlaceholder="Buscar cliente..."
                          displayRender={(item) => `${item.nombre} - ${item.documento}`}
                          valueField="id"
                        />
                    </div>
                    <Button type="button" onClick={() => setShowClienteForm(true)} className="neo-button bg-accent text-black px-4"><Plus className="w-4 h-4" /></Button>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fecha_inicio" className="text-sm font-black uppercase">Fecha Inicio</Label>
                  <Input id="fecha_inicio" type="date" value={formData.fecha_inicio} onChange={(e) => handleChange("fecha_inicio", e.target.value)} className="neo-input h-12 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_fin" className="text-sm font-black uppercase">Fecha Fin</Label>
                  <Input id="fecha_fin" type="date" value={formData.fecha_fin} onChange={(e) => handleChange("fecha_fin", e.target.value)} className="neo-input h-12 font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="punto_encuentro" className="text-sm font-black uppercase">Punto de Encuentro</Label>
                <Input id="punto_encuentro" value={formData.punto_encuentro} onChange={(e) => handleChange("punto_encuentro", e.target.value)} className="neo-input h-12 font-bold" placeholder="Ubicación de inicio de clases" />
              </div>

              {/* Display 'Horario de Clases' */}
              {formData.horario && (
                <div className="p-4 bg-secondary/50 neo-card border-2 border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-muted-foreground uppercase">Horario de Clases</p>
                      <p className="text-xl font-black text-foreground flex items-center gap-2">
                        <Clock className="w-5 h-5 text-accent" />
                        {formData.horario}
                      </p>
                    </div>
                    <div className="text-xs font-bold text-muted-foreground uppercase">
                      Horario Principal
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notas" className="text-sm font-black uppercase">Notas</Label>
                <Textarea id="notas" value={formData.notas} onChange={(e) => handleChange("notas", e.target.value)} rows={3} className="neo-input" />
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-6">
              <h3 className="text-lg font-black text-foreground uppercase">Valores y Pagos</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <Label htmlFor="total" className="text-sm font-black uppercase">Valor Total ({currentCurrency}) *</Label>
                  <Input id="total" type="number" step="0.01" value={formData.total} onChange={(e) => handleChange("total", e.target.value)} required className="neo-input h-12 font-bold" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="total_instructor" className="text-sm font-black uppercase">Pago Instructor ({currentCurrency})</Label>
                  <Input id="total_instructor" type="number" step="0.01" value={formData.total_instructor} onChange={(e) => handleChange("total_instructor", e.target.value)} className="neo-input h-12 font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="metodo_pago" className="text-sm font-black uppercase">Método Pago *</Label>
                  <Select value={formData.metodo_pago} onValueChange={(value) => handleChange("metodo_pago", value)} required>
                    <SelectTrigger className="neo-input h-12"><SelectValue /></SelectTrigger>
                    <SelectContent className="neo-card border-4 border-border">
                      {metodoPagoOptions.map(method => (
                        <SelectItem key={method.value} value={method.value} className="font-bold">
                          {method.label} ({method.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo_pago" className="text-sm font-black uppercase">Tipo Pago</Label>
                  <Input 
                    id="tipo_pago" 
                    value={formData.tipo_pago} 
                    onChange={(e) => handleChange("tipo_pago", e.target.value)} 
                    className="neo-input h-12 font-bold" 
                    placeholder="Ej: Contado, 3 cuotas, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="metodo_clase" className="text-sm font-black uppercase">Método Clase</Label>
                  <Select value={formData.metodo_clase} onValueChange={(value) => handleChange("metodo_clase", value)}>
                    <SelectTrigger className="neo-input h-12"><SelectValue /></SelectTrigger>
                    <SelectContent className="neo-card border-4 border-border">
                      {metodoClaseOptions.map(method => (
                        <SelectItem key={method.value} value={method.value} className="font-bold">
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modo_clase" className="text-sm font-black uppercase">Modo Clase</Label>
                  <Select value={formData.modo_clase} onValueChange={(value) => handleChange("modo_clase", value)}>
                    <SelectTrigger className="neo-input h-12"><SelectValue /></SelectTrigger>
                    <SelectContent className="neo-card border-4 border-border">
                      {modoClaseOptions.map(mode => (
                        <SelectItem key={mode.value} value={mode.value} className="font-bold">
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <h3 className="text-lg font-black text-foreground uppercase pt-4 border-t-2 border-border/20">Horario de Clases</h3>
              
              {/* Generador Automático de Horarios */}
              <div className="bg-accent/10 p-4 neo-card border-2 border-accent">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-accent" />
                  <h4 className="font-black text-foreground uppercase">Generador Automático</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase">Hora Inicio</Label>
                    <Input 
                      type="time" 
                      value={autoGenerate.horaInicio} 
                      onChange={(e) => setAutoGenerate(prev => ({...prev, horaInicio: e.target.value}))}
                      className="neo-input h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase">Hora Fin</Label>
                    <Input 
                      type="time" 
                      value={autoGenerate.horaFin} 
                      onChange={(e) => setAutoGenerate(prev => ({...prev, horaFin: e.target.value}))}
                      className="neo-input h-10"
                    />
                  </div>
                </div>
                <Button 
                  type="button" 
                  onClick={generateAutoSchedule}
                  className="neo-button bg-accent text-black w-full"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  GENERAR HORARIOS {formData.modo_clase === 'Semanal' ? '(LUN-VIE)' : '(SÁB-DOM)'}
                </Button>
              </div>

              <div className="space-y-4">
                {bloques.map((bloque, index) => (
                  <div key={index} className="flex items-end gap-2 p-2 bg-secondary/50 border-2 border-border/20">
                     <div className="flex-1 space-y-1">
                        <Label className="text-xs font-black uppercase">Día</Label>
                        <Select value={bloque.dia_semana?.toString()} onValueChange={(v) => handleBloqueChange(index, 'dia_semana', v)}>
                            <SelectTrigger className="neo-input h-10"><SelectValue placeholder="Día" /></SelectTrigger>
                            <SelectContent className="neo-card border-4 border-border">{diasSemana.map(d=><SelectItem key={d.id} value={d.id.toString()} className="font-bold">{d.label}</SelectItem>)}</SelectContent>
                        </Select>
                     </div>
                     <div className="flex-1 space-y-1">
                         <Label className="text-xs font-black uppercase">Inicio</Label>
                         <Input type="time" value={bloque.hora_inicio} onChange={e=>handleBloqueChange(index, 'hora_inicio', e.target.value)} className="neo-input h-10"/>
                     </div>
                     <div className="flex-1 space-y-1">
                         <Label className="text-xs font-black uppercase">Fin</Label>
                         <Input type="time" value={bloque.hora_fin} onChange={e=>handleBloqueChange(index, 'hora_fin', e.target.value)} className="neo-input h-10"/>
                     </div>
                     <Button type="button" onClick={() => removeBloque(index)} className="neo-button bg-destructive text-destructive-foreground p-2 h-10"><Trash2 className="w-4 h-4"/></Button>
                  </div>
                ))}
                <Button type="button" onClick={addBloque} className="neo-button bg-secondary w-full"><Plus className="w-4 h-4 mr-2"/>Añadir Horario Manual</Button>
              </div>

            </div>
          </CardContent>

          <div className="border-t-4 border-border px-8 py-6 flex justify-end gap-4">
            <Button type="button" onClick={onCancel} disabled={isSubmitting} className="neo-button bg-secondary text-foreground font-black uppercase">CANCELAR</Button>
            <Button type="submit" disabled={isSubmitting} className="neo-button bg-accent text-black font-black uppercase">
              {isSubmitting ? "GUARDANDO..." : <><Save className="w-4 h-4 mr-2" />{contrato ? "ACTUALIZAR" : "CREAR"} CONTRATO</>}
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl"
            >
              <ClienteQuickForm onSubmit={handleClienteCreated} onCancel={() => setShowClienteForm(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
