
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Search,
  FileText,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ApiService from "../components/api/ApiService";

import ContratoForm from "../components/contratos/ContratoForm";
import ContratoCard from "../components/contratos/ContratoCard";
import ContratoFilters from "../components/contratos/ContratoFilters";
import ContratoCardSkeleton from "../components/contratos/ContratoCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmationDialog from "../components/ui/ConfirmationDialog";

const PAGE_LIMIT = 5;

export default function Contratos() {
  const [contratos, setContratos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingContrato, setEditingContrato] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    cliente_id: "", // Changed from client_id to cliente_id
    fk_instructor: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialogState, setDialogState] = useState({ isOpen: false });
  
  // State for statistics
  const [stats, setStats] = useState({ count: 0 }); // Removed 'ingresos'
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const observer = useRef();
  const lastContratoElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const loadContratos = useCallback(async () => {
    if (page > 1 && !hasMore) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const params = {
        page: page,
        limit: PAGE_LIMIT,
        search: searchTerm,
        ...filters
      };
      
      const response = await ApiService.getContratos(params);
      const data = response.data || [];
      
      if (page === 1) {
        setContratos(data);
      } else {
        setContratos(prev => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_LIMIT);

    } catch (error) {
      console.error("Error loading contratos:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, filters, hasMore, refreshKey]); // Añadido refreshKey como dependencia

  // Effect to fetch global stats
  useEffect(() => {
    const fetchStats = async () => {
      setIsStatsLoading(true);
      try {
        const response = await ApiService.getContratos({ limit: 10000, skipCache: true });
        const allContratos = response.data || [];
        
        setStats({
          count: allContratos.length
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsStatsLoading(false);
      }
    };
    fetchStats();
  }, [refreshKey]);

  useEffect(() => {
    setPage(1);
    setHasMore(true); // Asegurar que hasMore se reinicie
  }, [searchTerm, filters, refreshKey]);

  useEffect(() => {
    loadContratos();
  }, [loadContratos]); // Changed dependency array to rely on loadContratos memoization

  const refreshContratos = () => {
    setContratos([]); // Limpiar datos actuales
    setRefreshKey(prevKey => prevKey + 1);
  };

  const handleSubmit = async (contratoData, bloquesData) => {
    try {
      if (editingContrato) {
        // Al editar, se pasa contratoData completo, incluyendo la moneda
        await ApiService.updateContrato(editingContrato.id, contratoData);
        await updateAssociatedRecords(editingContrato.id, contratoData, bloquesData);
      } else {
        const newContrato = await ApiService.createContrato(contratoData);
        await createAssociatedRecords(newContrato.id, contratoData, bloquesData);
      }
      setShowForm(false);
      setEditingContrato(null);
      
      // Forzar recarga completa
      setContratos([]);
      setPage(1);
      setHasMore(true);
      setRefreshKey(prevKey => prevKey + 1);
    } catch (error) {
      console.error("Error saving contrato:", error);
      // Error will be handled by form component
    }
  };

  const createAssociatedRecords = async (contratoId, contratoData, bloquesData) => {
    const bloques = Array.isArray(bloquesData) ? bloquesData : [];
    for (const bloque of bloques) {
      await ApiService.createBloqueContrato({ ...bloque, contrato_id: contratoId });
    }
    
    const cliente = await ApiService.getCliente(contratoData.cliente_id);
    const movimientoIngresoData = {
      contrato_id: contratoId,
      fecha: contratoData.fecha_inicio || new Date().toISOString().split('T')[0],
      descripcion: `Ingreso por Contrato #${contratoId} - ${cliente.nombre}`,
      tipo_movimiento: 'ingreso',
      cuenta: `${contratoData.metodo_pago}`,
      moneda: contratoData.moneda,
      debe: parseFloat(contratoData.total) || 0,
      haber: 0,
      referencia: `CT-${contratoId}-INGRESO`
    };
    await ApiService.createMovimientoContable(movimientoIngresoData);

    if (contratoData.total_instructor > 0) {
      const instructor = await ApiService.getInstructor(contratoData.fk_instructor);
      const movimientoPagoInstructorData = {
        contrato_id: contratoId,
        fecha: contratoData.fecha_inicio || new Date().toISOString().split('T')[0],
        descripcion: `Pago a Instructor ${instructor?.nombre || 'N/A'} por Contrato #${contratoId}`,
        tipo_movimiento: 'gasto',
        cuenta: 'Pago Instructores',
        moneda: contratoData.moneda,
        debe: 0,
        haber: parseFloat(contratoData.total_instructor) || 0,
        referencia: `CT-${contratoId}-INSTRUCTOR`
      };
      await ApiService.createMovimientoContable(movimientoPagoInstructorData);
    }
  };

  const updateAssociatedRecords = async (contratoId, contratoData, bloquesData) => {
    try {
      const bloquesResponse = await ApiService.getBloquesContrato(contratoId);
      const oldBloques = Array.isArray(bloquesResponse) ? bloquesResponse : (bloquesResponse.data || []);
      
      for (const bloque of oldBloques) {
        await ApiService.deleteBloqueContrato(bloque.id);
      }
      
      const bloques = Array.isArray(bloquesData) ? bloquesData : [];
      for (const bloque of bloques) {
        await ApiService.createBloqueContrato({ ...bloque, contrato_id: contratoId });
      }

      try {
        const movimientosResponse = await ApiService.getMovimientosContables({ limit: 10000 });
        console.log("Update contract - Movimientos response:", movimientosResponse); // Debug log
        
        // Enhanced defensive extraction
        let allMovimientos = [];
        if (Array.isArray(movimientosResponse)) {
          allMovimientos = movimientosResponse;
        } else if (movimientosResponse && Array.isArray(movimientosResponse.data)) {
          allMovimientos = movimientosResponse.data;
        } else if (movimientosResponse && movimientosResponse.items && Array.isArray(movimientosResponse.items)) {
          allMovimientos = movimientosResponse.items;
        }
        
        if (Array.isArray(allMovimientos)) {
          const oldMovimientos = allMovimientos.filter(m => m && m.contrato_id === contratoId);
          for (const movimiento of oldMovimientos) {
            await ApiService.deleteMovimientoContable(movimiento.id);
          }
        } else {
          console.warn("Could not extract valid array from movimientos response for contract update");
        }
      } catch (error) {
        console.error("Error managing movimientos in contract update:", error);
      }

      const cliente = await ApiService.getCliente(contratoData.cliente_id);
      
      const movimientoIngresoData = {
        contrato_id: contratoId,
        fecha: contratoData.fecha_inicio || new Date().toISOString().split('T')[0],
        descripcion: `Ingreso por Contrato #${contratoId} - ${cliente.nombre}`,
        tipo_movimiento: 'ingreso',
        cuenta: contratoData.metodo_pago,
        moneda: contratoData.moneda,
        debe: parseFloat(contratoData.total) || 0,
        haber: 0,
        referencia: `CT-${contratoId}-INGRESO`
      };
      await ApiService.createMovimientoContable(movimientoIngresoData);

      if (contratoData.total_instructor > 0) {
        const instructor = await ApiService.getInstructor(contratoData.fk_instructor);
        const movimientoPagoInstructorData = {
          contrato_id: contratoId,
          fecha: contratoData.fecha_inicio || new Date().toISOString().split('T')[0],
          descripcion: `Pago a Instructor ${instructor?.nombre || 'N/A'} por Contrato #${contratoId}`,
          tipo_movimiento: 'gasto',
          cuenta: 'Pago Instructores',
          moneda: contratoData.moneda,
          debe: 0,
          haber: parseFloat(contratoData.total_instructor) || 0,
          referencia: `CT-${contratoId}-INSTRUCTOR`
        };
        await ApiService.createMovimientoContable(movimientoPagoInstructorData);
      }
    } catch (error) {
      console.error("Error in updateAssociatedRecords:", error);
      throw error;
    }
  };

  const handleEdit = (contrato) => {
    setEditingContrato(contrato);
    setShowForm(true);
  };

  const performDelete = async (id) => {
    try {
      const bloquesResponse = await ApiService.getBloquesContrato(id);
      const oldBloques = Array.isArray(bloquesResponse) ? bloquesResponse : (bloquesResponse.data || []);
      for (const bloque of oldBloques) {
        await ApiService.deleteBloqueContrato(bloque.id);
      }

      const movimientosResponse = await ApiService.getMovimientosContables({ limit: 10000 });
      console.log("Delete contract - Movimientos response:", movimientosResponse); // Debug log
      
      // Enhanced defensive extraction
      let allMovimientos = [];
      if (Array.isArray(movimientosResponse)) {
        allMovimientos = movimientosResponse;
      } else if (movimientosResponse && Array.isArray(movimientosResponse.data)) {
        allMovimientos = movimientosResponse.data;
      } else if (movimientosResponse && movimientosResponse.items && Array.isArray(movimientosResponse.items)) {
        allMovimientos = movimientosResponse.items;
      }
      
      if (Array.isArray(allMovimientos)) {
        const oldMovimientos = allMovimientos.filter(m => m && m.contrato_id === id);
        for (const movimiento of oldMovimientos) {
          await ApiService.deleteMovimientoContable(movimiento.id);
        }
      } else {
        console.warn("Could not extract valid array from movimientos response for contract delete");
      }
      
      await ApiService.deleteContrato(id);
      
      // Forzar recarga completa
      setContratos([]);
      setPage(1);
      setHasMore(true);
      setRefreshKey(prevKey => prevKey + 1);
    } catch (error) {
      console.error("Error deleting contrato:", error);
      // Error will be handled by UI components
    } finally {
      setDialogState({ isOpen: false });
    }
  };

  const handleDeleteRequest = (id) => {
    setDialogState({
      isOpen: true,
      title: '¿ELIMINAR CONTRATO?',
      description: 'Esta acción es irreversible y eliminará el contrato junto con sus movimientos contables y horarios asociados. ¿Continuar?',
      onConfirm: () => performDelete(id),
      confirmText: 'SÍ, ELIMINAR'
    });
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
          <h1 className="text-5xl font-black text-foreground uppercase">CONTRATOS</h1>
          <p className="text-muted-foreground mt-2 font-bold uppercase text-sm">
            Gestiona los contratos de enseñanza de la autoescuela
          </p>
        </div>
        <Button
          onClick={() => { setEditingContrato(null); setShowForm(true); }}
          className="neo-button bg-[var(--neo-blue)] text-black hover:bg-blue-400 px-6 py-3 text-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          NUEVO CONTRATO
        </Button>
      </motion.div>

      <div className="space-y-6">
        <Card className="neo-card bg-[var(--neo-green)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-black uppercase">Contratos Totales</p>
                {isStatsLoading ? <Skeleton className="h-8 w-24 mt-1 bg-black/20" /> : <p className="text-2xl font-black text-black">{stats.count}</p>}
              </div>
              <FileText className="w-8 h-8 text-black" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="neo-card">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="BUSCAR CONTRATOS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neo-input pl-10 font-bold uppercase text-lg h-12"
              />
            </div>
            <ContratoFilters onFilterChange={setFilters} />
          </div>
        </CardContent>
      </Card>

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
              className="w-full max-w-6xl"
            >
              <ContratoForm
                contrato={editingContrato}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingContrato(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6">
        <AnimatePresence>
          {contratos.map((contrato, index) => {
            const isLastElement = contratos.length === index + 1;
            return (
              <motion.div
                ref={isLastElement ? lastContratoElementRef : null}
                key={contrato.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ContratoCard
                  contrato={contrato}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                  onContratoDeleted={refreshContratos} // This is still called, but the handleDelete/handleSubmit now directly reload
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isLoading && (
          [...Array(PAGE_LIMIT)].map((_, i) => <ContratoCardSkeleton key={i} />)
        )}

        {!isLoading && contratos.length === 0 && (
          <Card className="neo-card">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-black text-foreground uppercase mb-2">
                NO SE ENCONTRARON CONTRATOS
              </h3>
              <p className="text-muted-foreground font-bold uppercase">
                {searchTerm || filters.cliente_id !== "" || filters.fk_instructor !== "" // Changed from client_id to cliente_id
                  ? "Intenta cambiar los filtros de búsqueda"
                  : "Comienza creando tu primer contrato"}
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
