import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import ApiService from "../api/ApiService";
import MovimientoContableCard from "../movimientos/MovimientoContableCard";
import MovimientoContableForm from "../movimientos/MovimientoContableForm";
import MovimientoContableCardSkeleton from "../movimientos/MovimientoContableCardSkeleton";
import ConfirmationDialog from '../ui/ConfirmationDialog';
import { motion, AnimatePresence } from 'framer-motion';

export default function MovimientosContablesTab({ contrato }) {
  const [movimientos, setMovimientos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMovimiento, setEditingMovimiento] = useState(null);
  const [dialogState, setDialogState] = useState({ isOpen: false });
  const [refreshKey, setRefreshKey] = useState(0);

  const loadMovimientos = useCallback(async () => {
    if (!contrato?.id) return;
    setIsLoading(true);
    try {
      const params = { contrato_id: contrato.id, limit: 1000 };
      const response = await ApiService.getMovimientosContables(params);
      const data = Array.isArray(response) ? response : (response?.data || []);
      const sortedData = data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setMovimientos(sortedData);
    } catch (error) {
      console.error("Error loading movimientos for contract:", error);
    } finally {
      setIsLoading(false);
    }
  }, [contrato?.id, refreshKey]);

  useEffect(() => {
    loadMovimientos();
  }, [loadMovimientos]);

  const refreshMovimientos = () => {
    setRefreshKey(k => k + 1);
  };

  const handleEdit = (movimiento) => {
    setEditingMovimiento(movimiento);
    setShowForm(true);
  };

  const handleDeleteRequest = (id) => {
    setDialogState({
      isOpen: true,
      title: '¿ELIMINAR MOVIMIENTO?',
      description: 'Esta acción es irreversible y afectará los balances contables. ¿Continuar?',
      onConfirm: () => performDelete(id),
      confirmText: 'SÍ, ELIMINAR'
    });
  };

  const performDelete = async (id) => {
    try {
      await ApiService.deleteMovimientoContable(id);
      refreshMovimientos();
    } catch (error) {
      console.error("Error deleting movimiento:", error);
    } finally {
      setDialogState({ isOpen: false });
    }
  };

  const handleSubmit = async (movimientoData) => {
    try {
      const finalData = { ...movimientoData, contrato_id: contrato.id, gestoria_venta_id: null };
      if (editingMovimiento) {
        await ApiService.updateMovimientoContable(editingMovimiento.id, finalData);
      } else {
        await ApiService.createMovimientoContable(finalData);
      }
      setShowForm(false);
      setEditingMovimiento(null);
      refreshMovimientos();
    } catch (error) {
      console.error("Error saving movimiento:", error);
      // Toast notifications can be added in the form itself
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-black uppercase text-foreground">Movimientos Contables Asociados</h3>
        <Button onClick={() => { setEditingMovimiento(null); setShowForm(true); }} className="neo-button bg-accent text-black">
          <Plus className="w-4 h-4 mr-2" />
          Añadir Movimiento
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4"
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
                contrato={contrato}
                hideRelations={true}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        [...Array(2)].map((_, i) => <MovimientoContableCardSkeleton key={i} />)
      ) : movimientos.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-bold uppercase text-muted-foreground">No hay movimientos contables</p>
        </div>
      ) : (
        <div className="space-y-4">
          {movimientos.map(mov => (
            <MovimientoContableCard key={mov.id} movimiento={mov} onEdit={handleEdit} onDelete={handleDeleteRequest} />
          ))}
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