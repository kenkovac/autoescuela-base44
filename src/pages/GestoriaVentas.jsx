
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Building2,
  DollarSign,
  FileText,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ApiService from "../components/api/ApiService";

import GestoriaVentaForm from "../components/gestoria/GestoriaVentaForm";
import GestoriaVentaCard from "../components/gestoria/GestoriaVentaCard";
import GestoriaFilters from "../components/gestoria/GestoriaFilters";
import GestoriaVentaCardSkeleton from "../components/gestoria/GestoriaVentaCardSkeleton";
import ConfirmationDialog from "../components/ui/ConfirmationDialog";

const PAGE_LIMIT = 6;

export default function GestoriaVentas() {
  const [gestoriaVentas, setGestoriaVentas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGestoria, setEditingGestoria] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    tipo_tramite: "all",
    moneda: "all"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Added refreshKey state
  const [dialogState, setDialogState] = useState({ isOpen: false });

  const observer = useRef();
  const lastGestoriaElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const loadGestoriaVentas = useCallback(async () => {
    if (page > 1 && !hasMore) return;
    setIsLoading(true);
    try {
      const params = {
        page: page,
        limit: PAGE_LIMIT,
        search: searchTerm,
        ...filters
      };
      
      const response = await ApiService.getGestoriaVentas(params);
      const data = response.data || [];
      
      if (page === 1) {
        setGestoriaVentas(data);
      } else {
        setGestoriaVentas(prev => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_LIMIT);

    } catch (error) {
      console.error("Error loading gestoria ventas:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, filters, hasMore]);

  useEffect(() => {
    setPage(1); // Reset page to 1 whenever search term, filters, or refreshKey change
    setHasMore(true); // Reset hasMore to true for a fresh load
  }, [searchTerm, filters, refreshKey]); // refreshKey added to dependencies

  useEffect(() => {
    loadGestoriaVentas();
  }, [loadGestoriaVentas]);

  const createMovimientoForGestoria = async (gestoriaId, gestoriaData) => {
    try {
      const cliente = await ApiService.getCliente(gestoriaData.cliente_id);
      
      const movimientoData = {
        gestoria_venta_id: gestoriaId,
        fecha: gestoriaData.fecha,
        descripcion: `Venta gestoría ${gestoriaData.tipo_tramite} - ${cliente.nombre}`,
        tipo_movimiento: "ingreso",
        cuenta: "Caja",
        moneda: gestoriaData.moneda,
        debe: parseFloat(gestoriaData.monto),
        haber: 0,
        referencia: gestoriaData.referencia_pago || `GV-${gestoriaId}`
      };

      await ApiService.createMovimientoContable(movimientoData);
    } catch (error) {
      console.error("Error creando movimiento automático:", error);
    }
  };

  const handleSubmit = async (gestoriaData) => {
    try {
      if (editingGestoria) {
        await ApiService.updateGestoriaVenta(editingGestoria.id, gestoriaData);
        
        // Si estamos editando, eliminar los movimientos anteriores usando los datos que ya tenemos
        if (editingGestoria.movimientos_bancarios && Array.isArray(editingGestoria.movimientos_bancarios)) {
          for (const movimiento of editingGestoria.movimientos_bancarios) {
            try {
              await ApiService.deleteMovimientoContable(movimiento.id);
            } catch (error) {
              console.error("Error eliminando movimiento:", movimiento.id, error);
            }
          }
        }

        await createMovimientoForGestoria(editingGestoria.id, gestoriaData);
      } else {
        const nuevaGestoria = await ApiService.createGestoriaVenta(gestoriaData);
        await createMovimientoForGestoria(nuevaGestoria.id, gestoriaData);
      }
      
      setShowForm(false);
      setEditingGestoria(null);
      setGestoriaVentas([]); // Limpiar datos actuales
      setRefreshKey(k => k + 1); // Forzar recarga
    } catch (error) {
      console.error("Error saving gestoria:", error);
      // Error will be handled by form component
    }
  };

  const handleEdit = (gestoria) => {
    setEditingGestoria(gestoria);
    setShowForm(true);
  };

  const performDelete = async (id) => {
    try {
      // Encontrar la gestoría que se va a eliminar para acceder a sus movimientos
      const gestoriaToDelete = gestoriaVentas.find(g => g.id === id);
      
      // Eliminar movimientos asociados usando los datos que ya tenemos
      if (gestoriaToDelete && gestoriaToDelete.movimientos_bancarios && Array.isArray(gestoriaToDelete.movimientos_bancarios)) {
        for (const movimiento of gestoriaToDelete.movimientos_bancarios) {
          try {
            await ApiService.deleteMovimientoContable(movimiento.id);
          } catch (error) {
            console.error("Error eliminando movimiento:", movimiento.id, error);
          }
        }
      }

      await ApiService.deleteGestoriaVenta(id);
      setGestoriaVentas([]); // Limpiar datos actuales
      setRefreshKey(k => k + 1); // Forzar recarga
    } catch (error) {
      console.error("Error deleting gestoria:", error);
      // Error will be handled by UI components
    } finally {
      setDialogState({ isOpen: false });
    }
  };

  const handleDeleteRequest = (id) => {
    setDialogState({
      isOpen: true,
      title: '¿ELIMINAR GESTORÍA?',
      description: 'Se eliminará la venta de gestoría y su movimiento contable asociado. Esta acción no se puede deshacer.',
      onConfirm: () => performDelete(id),
      confirmText: 'SÍ, ELIMINAR'
    });
  };

  const getTotalesPorMoneda = () => {
    const totales = {};
    gestoriaVentas.forEach(gestoria => {
      const moneda = gestoria.moneda || 'N/A';
      if (!totales[moneda]) {
        totales[moneda] = { total: 0, cantidad: 0 };
      }
      totales[moneda].total += parseFloat(gestoria.monto) || 0;
      totales[moneda].cantidad += 1;
    });
    return totales;
  };

  const totalesPorMoneda = getTotalesPorMoneda();

  const handleDataChange = () => {
    setGestoriaVentas([]); // Limpiar datos actuales
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-5xl font-black text-foreground uppercase">GESTORÍA VENTAS</h1>
          <p className="text-muted-foreground mt-2 font-bold uppercase text-sm">
            Gestiona los servicios de trámites de licencias
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="neo-button bg-[var(--neo-green)] text-black hover:bg-green-400 px-6 py-3 text-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          NUEVA VENTA
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="space-y-6">
        <Card className="neo-card bg-[var(--neo-yellow)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-black uppercase">Total Gestorías</p>
                <p className="text-2xl font-black text-black">{gestoriaVentas.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-black" />
            </div>
          </CardContent>
        </Card>

        {Object.entries(totalesPorMoneda).length > 0 && (
          <div>
            <h2 className="text-2xl font-black text-foreground uppercase mb-4">Totales por Moneda</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(totalesPorMoneda).map(([moneda, data]) => (
                <Card key={moneda} className="neo-card bg-[var(--neo-green)]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-black text-black uppercase">{moneda}</p>
                        <p className="text-2xl font-black text-black">${data.total.toLocaleString()}</p>
                        <p className="text-xs font-bold text-black/70">{data.cantidad} ventas</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-black" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="neo-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="BUSCAR POR CLIENTE, DOCUMENTO, TRÁMITE..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neo-input pl-10 font-bold uppercase text-lg h-12"
              />
            </div>
            <GestoriaFilters onFilterChange={setFilters} />
          </div>
        </CardContent>
      </Card>

      {/* Modal Form */}
      <AnimatePresence>
        {showForm && (
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
              className="w-full max-w-4xl"
            >
              <GestoriaVentaForm
                gestoria={editingGestoria}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingGestoria(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gestoria Grid */}
      <div className="grid gap-6">
        <AnimatePresence>
          {gestoriaVentas.map((gestoria, index) => {
            if (gestoriaVentas.length === index + 1) {
              return (
                <motion.div
                  ref={lastGestoriaElementRef}
                  key={gestoria.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <GestoriaVentaCard
                    gestoria={gestoria}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest}
                    onDataChange={handleDataChange}
                  />
                </motion.div>
              );
            } else {
              return (
                <motion.div
                  key={gestoria.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <GestoriaVentaCard
                    gestoria={gestoria}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest}
                    onDataChange={handleDataChange}
                  />
                </motion.div>
              );
            }
          })}
        </AnimatePresence>

        {isLoading && (
          [...Array(PAGE_LIMIT)].map((_, i) => <GestoriaVentaCardSkeleton key={i} />)
        )}

        {!isLoading && gestoriaVentas.length === 0 && (
          <Card className="neo-card">
            <CardContent className="p-12 text-center">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-black text-foreground uppercase mb-2">
                NO SE ENCONTRARON GESTORÍAS
              </h3>
              <p className="text-muted-foreground font-bold uppercase">
                {searchTerm || filters.tipo_tramite !== "all" || filters.moneda !== "all"
                  ? "Intenta cambiar los filtros de búsqueda"
                  : "Comienza creando tu primera gestoría"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
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
