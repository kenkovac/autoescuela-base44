
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import ApiService from "../components/api/ApiService";

import MovimientoContableForm from "../components/movimientos/MovimientoContableForm";
import MovimientoContableCard from "../components/movimientos/MovimientoContableCard";
import MovimientosFilters from "../components/movimientos/MovimientosFilters";
import MovimientoContableCardSkeleton from "../components/movimientos/MovimientoContableCardSkeleton";
import ConfirmationDialog from "../components/ui/ConfirmationDialog";

const PAGE_LIMIT = 8;

export default function MovimientosContables() {
  const [movimientos, setMovimientos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMovimiento, setEditingMovimiento] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    tipo_movimiento: "all",
    moneda: "all"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialogState, setDialogState] = useState({ isOpen: false });

  const observer = useRef();
  const lastMovimientoElementRef = useCallback((node) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const loadMovimientos = useCallback(async () => {
    // If it's not the first page and there's no more data, stop.
    // Allow page 1 to load even if hasMore was false previously (e.g., after a search yielded no results)
    if (isLoading && page > 1) return; // Prevent multiple simultaneous fetches, especially during infinite scroll
    if (page > 1 && !hasMore) return; // Don't fetch if no more data for subsequent pages

    setIsLoading(true);
    try {
      const params = {
        page: page,
        limit: PAGE_LIMIT,
        search: searchTerm,
        ...filters
      };

      const response = await ApiService.getMovimientosContables(params);
      // FIX: Robustly handle both { data: [...] } and [...] as response
      const data = Array.isArray(response) ? response : (response?.data || []);
      // Sort data by 'fecha' as per outline
      const sortedData = data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      // If it's the first page, replace all movements. Otherwise, append.
      if (page === 1) {
        setMovimientos(sortedData);
      } else {
        setMovimientos((prev) => [...prev, ...sortedData]);
      }
      setHasMore(data.length === PAGE_LIMIT);

    } catch (error) {
      console.error("Error loading movimientos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, filters, hasMore]); // isLoading is deliberately omitted here to prevent re-creation of useCallback itself

  // Helper function to trigger a full refresh of movements
  const refreshMovimientos = () => {
    setMovimientos([]); // Limpiar datos actuales
    setRefreshKey((k) => k + 1);
  };

  // When search/filters/refreshKey change, reset to page 1 and ensure hasMore is true
  useEffect(() => {
    setPage(1);
    setHasMore(true); // Ensure hasMore is reset to true for new searches/filters/refreshes
  }, [searchTerm, filters, refreshKey]);

  // Load movements when page, search term, filters, or refresh key change
  useEffect(() => {
    loadMovimientos();
  }, [loadMovimientos]); // loadMovimientos is a useCallback that already depends on page, searchTerm, filters, and hasMore

  const handleSubmit = async (movimientoData) => {
    try {
      if (editingMovimiento) {
        await ApiService.updateMovimientoContable(editingMovimiento.id, movimientoData);
      } else {
        await ApiService.createMovimientoContable(movimientoData);
      }
      setShowForm(false);
      setEditingMovimiento(null);
      refreshMovimientos(); // Force a full reload of the movements
    } catch (error) {
      console.error("Error saving movimiento:", error);
      // Error will be handled by form component
    }
  };

  const handleEdit = (movimiento) => {
    setEditingMovimiento(movimiento);
    setShowForm(true);
  };

  const performDelete = async (id) => {
    try {
      await ApiService.deleteMovimientoContable(id);
      refreshMovimientos();
    } catch (error) {
      console.error("Error deleting movimiento:", error);
      // Error will be handled by UI components
    } finally {
      setDialogState({ isOpen: false });
    }
  };

  const handleDeleteRequest = (id) => {
    setDialogState({
      isOpen: true,
      title: '¿ELIMINAR MOVIMIENTO?',
      description: 'Esta acción no puede deshacerse y afectará los balances contables. ¿Estás seguro?',
      onConfirm: () => performDelete(id),
      confirmText: 'SÍ, ELIMINAR'
    });
  };

  const getTotalesPorMoneda = () => {
    const totales = {};

    movimientos.forEach((mov) => {
      const moneda = mov.moneda || 'N/A';
      if (!totales[moneda]) {
        totales[moneda] = { totalDebe: 0, totalHaber: 0 };
      }
      totales[moneda].totalDebe += parseFloat(mov.debe) || 0;
      totales[moneda].totalHaber += parseFloat(mov.haber) || 0;
    });

    Object.keys(totales).forEach((moneda) => {
      totales[moneda].saldoActual = totales[moneda].totalDebe - totales[moneda].totalHaber;
    });

    return totales;
  };

  const getMonedas = () => {
    const monedas = [...new Set(movimientos.map((m) => m.moneda).filter(Boolean))];
    return monedas;
  };

  const totalesPorMoneda = getTotalesPorMoneda();

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

        <div>
          <h1 className="text-5xl font-black text-foreground uppercase">MOVIMIENTOS CONTABLES</h1>
          <p className="text-muted-foreground mt-2 font-bold uppercase text-sm">
            Visualiza y gestiona todos los movimientos financieros
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="neo-button bg-[var(--neo-blue)] text-black hover:bg-blue-400 px-6 py-3 text-lg">

          <Plus className="w-5 h-5 mr-2" />
          NUEVO MOVIMIENTO
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="space-y-8">
        <Card className="neo-card bg-secondary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-foreground uppercase">Total de Movimientos</p>
                <p className="text-2xl font-black text-foreground">{movimientos.length}</p>
              </div>
              <CreditCard className="w-8 h-8 text-foreground" />
            </div>
          </CardContent>
        </Card>

        {Object.entries(totalesPorMoneda).length > 0 ?
        Object.entries(totalesPorMoneda).map(([moneda, data]) =>
        <div key={moneda}>
              <h2 className="text-2xl font-black text-foreground uppercase mb-4">Resumen en {moneda}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="neo-card bg-[var(--neo-green)]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-black text-black uppercase">TOTAL DEBE</p>
                        <p className="text-2xl font-black text-black">${data.totalDebe.toLocaleString()}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-black" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="neo-card bg-[var(--neo-red)]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-black text-black uppercase">TOTAL HABER</p>
                        <p className="text-2xl font-black text-black">${data.totalHaber.toLocaleString()}</p>
                      </div>
                      <TrendingDown className="w-8 h-8 text-black" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="neo-card bg-[var(--neo-blue)]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-black text-black uppercase">SALDO ACTUAL</p>
                        <p className="text-2xl font-black text-black">${data.saldoActual.toLocaleString()}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-black" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
        ) :

        !isLoading &&
        <Card className="neo-card">
              <CardContent className="p-6 text-center">
                <p className="font-bold uppercase text-muted-foreground">No hay datos financieros para mostrar.</p>
              </CardContent>
            </Card>

        }
      </div>

      {/* Search and Filters */}
      <Card className="neo-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="BUSCAR MOVIMIENTOS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neo-input pl-10 font-bold uppercase text-lg h-12" />

            </div>
            <MovimientosFilters onFilterChange={setFilters} monedas={getMonedas()} />
          </div>
        </CardContent>
      </Card>

      {/* Modal Form */}
      <AnimatePresence>
        {showForm &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

            <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-4xl">

              <MovimientoContableForm
              movimiento={editingMovimiento}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingMovimiento(null);
              }} />

            </motion.div>
          </motion.div>
        }
      </AnimatePresence>

      {/* Movimientos Grid */}
      <div className="grid gap-6">
        <AnimatePresence>
          {movimientos.map((movimiento, index) => {
            if (movimientos.length === index + 1) {
              return (
                <motion.div
                  ref={lastMovimientoElementRef}
                  key={movimiento.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}>

                  <MovimientoContableCard
                    movimiento={movimiento}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest} />

                </motion.div>);

            } else {
              return (
                <motion.div
                  key={movimiento.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}>

                  <MovimientoContableCard
                    movimiento={movimiento}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest} />

                </motion.div>);

            }
          })}
        </AnimatePresence>

        {isLoading &&
        [...Array(PAGE_LIMIT)].map((_, i) => <MovimientoContableCardSkeleton key={i} />)
        }

        {!isLoading && movimientos.length === 0 &&
        <Card className="neo-card">
            <CardContent className="p-12 text-center">
              <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-black text-foreground uppercase mb-2">
                NO SE ENCONTRARON MOVIMIENTOS
              </h3>
              <p className="text-muted-foreground font-bold uppercase">
                {searchTerm || filters.tipo_movimiento !== "all" || filters.moneda !== "all" ?
              "Intenta cambiar los filtros de búsqueda" :
              "Comienza agregando tu primer movimiento"}
              </p>
            </CardContent>
          </Card>
        }
      </div>
      <ConfirmationDialog
        isOpen={dialogState.isOpen}
        onCancel={() => setDialogState({ isOpen: false })}
        onConfirm={dialogState.onConfirm}
        title={dialogState.title}
        description={dialogState.description}
        confirmText={dialogState.confirmText}
      />
    </div>);

}
