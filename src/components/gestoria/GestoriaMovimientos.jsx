
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  Hash,
  FileText,
  Plus,
  Edit,
  Trash2,
  Save
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import ApiService from "../api/ApiService";
import MovimientoContableForm from "../movimientos/MovimientoContableForm";
import ConfirmationDialog from "../ui/ConfirmationDialog";

export default function GestoriaMovimientos({ gestoriaId, gestoriaInfo, onCancel, onDataChange }) {
  const [movimientos, setMovimientos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMovimiento, setEditingMovimiento] = useState(null);
  const [dialogState, setDialogState] = useState({ isOpen: false });

  useEffect(() => {
    loadMovimientos();
  }, [gestoriaId]);

  const loadMovimientos = async () => {
    setIsLoading(true);
    try {
      // SIEMPRE hacer consulta directa a la API para obtener datos frescos
      const response = await ApiService.getMovimientosContables({ 
        gestoria_venta_id: gestoriaId,
        limit: 1000,
        skipCache: true // Forzar que no use caché
      });
      const data = Array.isArray(response) ? response : (response?.data || []);
      const movimientosFiltrados = data.filter(m => m && m.gestoria_venta_id === gestoriaId);
      setMovimientos(movimientosFiltrados);
    } catch (error) {
      console.error("Error loading movimientos:", error);
      setMovimientos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (movimientoData) => {
    try {
      // Asegurar que el movimiento esté asociado a esta gestoría
      const dataWithGestoria = {
        ...movimientoData,
        gestoria_venta_id: gestoriaId,
        contrato_id: null // Los movimientos de gestoría no van asociados a contratos
      };

      if (editingMovimiento) {
        await ApiService.updateMovimientoContable(editingMovimiento.id, dataWithGestoria);
      } else {
        await ApiService.createMovimientoContable(dataWithGestoria);
      }
      
      setShowForm(false);
      setEditingMovimiento(null);
      
      // Recargar movimientos del mini-CRUD
      await loadMovimientos();
      
      // Notificar al padre que los datos cambiaron (para actualizar la página principal)
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error("Error saving movimiento:", error);
      alert("Error al guardar movimiento. Intenta nuevamente.");
    }
  };

  const handleEdit = (movimiento) => {
    setEditingMovimiento(movimiento);
    setShowForm(true);
  };

  const performDelete = async (id) => {
    try {
      await ApiService.deleteMovimientoContable(id);
      
      // Recargar movimientos del mini-CRUD
      await loadMovimientos();
      
      // Notificar al padre que los datos cambiaron (para actualizar la página principal)
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error("Error deleting movimiento:", error);
      alert("Error al eliminar movimiento.");
    } finally {
      setDialogState({ isOpen: false });
    }
  };

  const handleDeleteRequest = (id) => {
    setDialogState({
      isOpen: true,
      title: '¿ELIMINAR MOVIMIENTO?',
      description: 'Esta acción es permanente y afectará los balances contables. ¿Estás seguro?',
      onConfirm: () => performDelete(id),
      confirmText: 'SÍ, ELIMINAR'
    });
  };

  const tipoMovimientoConfig = {
    ingreso: { bg: "bg-green-100 text-green-800", label: "Ingreso", icon: TrendingUp },
    gasto: { bg: "bg-red-100 text-red-800", label: "Gasto", icon: TrendingDown },
    ajuste: { bg: "bg-blue-100 text-blue-800", label: "Ajuste", icon: FileText }
  };

  const getTotales = () => {
    const totalDebe = movimientos.reduce((sum, m) => sum + (parseFloat(m.debe) || 0), 0);
    const totalHaber = movimientos.reduce((sum, m) => sum + (parseFloat(m.haber) || 0), 0);
    return { totalDebe, totalHaber, saldo: totalDebe - totalHaber };
  };

  const totales = getTotales();

  return (
    <>
      <Card className="w-full max-h-[90vh] overflow-y-auto neo-card">
        <CardHeader className="border-b-4 border-border">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase">
              <CreditCard className="w-6 h-6 text-accent" />
              MOVIMIENTOS CONTABLES
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowForm(true)}
                className="neo-button bg-[var(--neo-green)] text-black px-4 py-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                NUEVO
              </Button>
              <Button onClick={onCancel} className="neo-button bg-destructive text-destructive-foreground p-2">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Info de la Gestoría */}
          <div className="mt-4 p-4 bg-secondary neo-card border-2 border-border">
            <h3 className="font-black text-foreground text-lg uppercase mb-2">
              {gestoriaInfo?.tipo_tramite}
            </h3>
            <p className="text-sm text-muted-foreground font-bold">
              Cliente: {gestoriaInfo?.cliente?.nombre} - Monto: ${gestoriaInfo?.monto} {gestoriaInfo?.moneda}
            </p>
          </div>

          {/* Resumen Totales */}
          {movimientos.length > 0 && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-[var(--neo-green)] neo-card border-2 border-border text-center">
                <p className="text-xs font-black text-black uppercase">Total Debe</p>
                <p className="text-lg font-black text-black">${totales.totalDebe.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-[var(--neo-red)] neo-card border-2 border-border text-center">
                <p className="text-xs font-black text-black uppercase">Total Haber</p>
                <p className="text-lg font-black text-black">${totales.totalHaber.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-[var(--neo-blue)] neo-card border-2 border-border text-center">
                <p className="text-xs font-black text-black uppercase">Saldo</p>
                <p className="text-lg font-black text-black">${totales.saldo.toLocaleString()}</p>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 border-4 border-foreground border-t-transparent animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground font-bold uppercase">CARGANDO MOVIMIENTOS...</p>
            </div>
          ) : movimientos.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-black text-foreground uppercase mb-2">
                NO HAY MOVIMIENTOS
              </h3>
              <p className="text-muted-foreground font-bold uppercase mb-4">
                Esta gestoría no tiene movimientos contables asociados
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="neo-button bg-accent text-black px-6 py-3"
              >
                <Plus className="w-5 h-5 mr-2" />
                CREAR PRIMER MOVIMIENTO
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {movimientos.map((movimiento) => {
                  const tipoConfig = tipoMovimientoConfig[movimiento.tipo_movimiento] || tipoMovimientoConfig.ajuste;
                  const TipoIcon = tipoConfig.icon;
                  const debe = parseFloat(movimiento.debe) || 0;
                  const haber = parseFloat(movimiento.haber) || 0;
                  const neto = debe - haber;

                  return (
                    <motion.div
                      key={movimiento.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="neo-card p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 neo-card border-2 border-border ${tipoConfig.bg}`}>
                          <TipoIcon className="w-5 h-5" />
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-black text-foreground text-lg uppercase">
                              {movimiento.descripcion}
                            </h4>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleEdit(movimiento)}
                                className="neo-button bg-secondary text-foreground p-2"
                                size="sm"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteRequest(movimiento.id)}
                                className="neo-button bg-destructive text-destructive-foreground p-2"
                                size="sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge className={`${tipoConfig.bg} border-2 border-border font-black text-xs uppercase`}>
                              {tipoConfig.label}
                            </Badge>
                            <Badge className="bg-gray-100 text-gray-800 border-2 border-border font-black text-xs uppercase">
                              {movimiento.cuenta || 'Sin cuenta'}
                            </Badge>
                            <Badge className="bg-purple-100 text-purple-800 border-2 border-border font-black text-xs uppercase">
                              {movimiento.moneda}
                            </Badge>
                          </div>

                          <div className="grid md:grid-cols-4 gap-4 text-sm mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs font-black text-muted-foreground uppercase">FECHA</p>
                                <p className="font-bold text-foreground">
                                  {format(new Date(movimiento.fecha), 'd MMM yyyy', { locale: es })}
                                </p>
                              </div>
                            </div>

                            {movimiento.referencia && (
                              <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs font-black text-muted-foreground uppercase">REFERENCIA</p>
                                  <p className="font-bold text-foreground">{movimiento.referencia}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="grid md:grid-cols-3 gap-4 p-3 bg-secondary neo-card border-2 border-border">
                            <div className="text-center">
                              <p className="text-xs font-black text-green-700 uppercase">DEBE</p>
                              <p className="text-lg font-black text-green-700">
                                {debe > 0 ? `$${debe.toLocaleString()}` : '-'}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-black text-red-700 uppercase">HABER</p>
                              <p className="text-lg font-black text-red-700">
                                {haber > 0 ? `$${haber.toLocaleString()}` : '-'}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-black text-foreground uppercase">NETO</p>
                              <p className={`text-lg font-black ${neto >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {neto >= 0 ? '+' : ''}${neto.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para Formulario */}
      <AnimatePresence>
        {showForm && (
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
              className="w-full max-w-4xl"
            >
              <MovimientoContableForm
                movimiento={editingMovimiento}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingMovimiento(null);
                }}
                hideRelations={true}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diálogo de Confirmación */}
      <ConfirmationDialog
        isOpen={dialogState.isOpen}
        onCancel={() => setDialogState({ isOpen: false })}
        onConfirm={dialogState.onConfirm}
        title={dialogState.title}
        description={dialogState.description}
        confirmText={dialogState.confirmText}
      />
    </>
  );
}
