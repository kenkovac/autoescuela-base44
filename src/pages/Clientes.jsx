
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Search,
  Users,
  Clock,
  UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ApiService from "../components/api/ApiService";

import ClienteForm from "../components/clientes/ClienteForm";
import ClienteCard from "../components/clientes/ClienteCard";
import ClienteCardSkeleton from "../components/clientes/ClienteCardSkeleton";
import ConfirmationDialog from "../components/ui/ConfirmationDialog";

const PAGE_LIMIT = 8;

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    confirmText: ''
  });

  const observer = useRef();
  const lastClienteElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const loadClientes = useCallback(async () => {
    if (page > 1 && !hasMore) {
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: page,
        limit: PAGE_LIMIT,
        search: searchTerm
      };
      
      const response = await ApiService.getClientes(params);
      const data = response.data || [];
      
      if (page === 1) {
        setClientes(data);
      } else {
        setClientes(prev => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_LIMIT);

    } catch (error) {
      console.error("Error loading clientes:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, hasMore, refreshKey]); // Añadido refreshKey como dependencia

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [searchTerm, refreshKey]);
  
  const handleSubmit = async (clienteData) => {
    try {
      if (editingCliente) {
        await ApiService.updateCliente(editingCliente.id, clienteData);
      } else {
        await ApiService.createCliente(clienteData);
      }
      setShowForm(false);
      setEditingCliente(null);
      
      // Forzar recarga completa
      setClientes([]);
      setPage(1);
      setHasMore(true);
      setRefreshKey(k => k + 1);
    } catch (error) {
      console.error("Error saving cliente:", error);
      // Error will be handled by form component
    }
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setShowForm(true);
  };

  const performDelete = async (id) => {
    try {
      await ApiService.deleteCliente(id);
      
      // Forzar recarga completa
      setClientes([]);
      setPage(1);
      setHasMore(true);
      setRefreshKey(k => k + 1); 
    } catch (error) {
      console.error("Error deleting cliente:", error);
      // Error will be handled by UI components
    } finally {
      setDialogState({ isOpen: false });
    }
  };

  const handleDeleteRequest = (id) => {
    setDialogState({
      isOpen: true,
      title: '¿ELIMINAR CLIENTE?',
      description: 'Esta acción es permanente. Se eliminarán todos los datos asociados a este cliente. ¿Estás seguro?',
      onConfirm: () => performDelete(id),
      confirmText: 'SÍ, ELIMINAR'
    });
  };

  const getRecentClientsCount = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7));
    return clientes.filter((c) => new Date(c.created_at) > sevenDaysAgo).length;
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
          <h1 className="text-5xl font-black text-foreground uppercase">CLIENTES</h1>
          <p className="text-muted-foreground mt-2 font-bold uppercase text-sm">
            Gestiona la base de clientes de la autoescuela
          </p>
        </div>
        <Button
          onClick={() => {setEditingCliente(null);setShowForm(true);}}
          className="neo-button bg-[var(--neo-blue)] text-black hover:bg-blue-400 px-6 py-3 text-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          NUEVO CLIENTE
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="neo-card bg-[var(--neo-green)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-black uppercase">Clientes Totales</p>
                <p className="text-2xl font-black text-black">{clientes.length}</p>
              </div>
              <Users className="w-8 h-8 text-black" />
            </div>
          </CardContent>
        </Card>

        <Card className="neo-card bg-[var(--neo-yellow)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-black uppercase">Nuevos (Últimos 7 días)</p>
                <p className="text-2xl font-black text-black">{getRecentClientsCount()}</p>
              </div>
              <Clock className="w-8 h-8 text-black" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="neo-card">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="BUSCAR POR NOMBRE, CORREO O DOCUMENTO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="neo-input pl-10 font-bold uppercase text-lg h-12"
            />
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
              <ClienteForm
                cliente={editingCliente}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingCliente(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clientes Grid */}
      {error ? (
        <Card className="neo-card bg-red-50 dark:bg-red-900/20 border-red-500">
          <CardContent className="p-12 text-center">
            <UserPlus className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-red-600 dark:text-red-400 uppercase mb-2">
              Error al cargar clientes
            </h3>
            <p className="text-red-700 dark:text-red-300 font-bold">
              {error}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence>
            {clientes.map((cliente, index) => {
              if (clientes.length === index + 1) {
                return (
                  <motion.div
                    ref={lastClienteElementRef}
                    key={cliente.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <ClienteCard
                      cliente={cliente}
                      onEdit={handleEdit}
                      onDelete={handleDeleteRequest}
                    />
                  </motion.div>
                );
              } else {
                return (
                  <motion.div
                    key={cliente.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <ClienteCard
                      cliente={cliente}
                      onEdit={handleEdit}
                      onDelete={handleDeleteRequest}
                    />
                  </motion.div>
                );
              }
            })}
          </AnimatePresence>

          {isLoading && (
            [...Array(PAGE_LIMIT)].map((_, i) => <ClienteCardSkeleton key={i} />)
          )}

          {!isLoading && clientes.length === 0 && !error && (
            <Card className="neo-card">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-black text-foreground uppercase mb-2">
                  NO SE ENCONTRARON CLIENTES
                </h3>
                <p className="text-muted-foreground font-bold uppercase">
                  {searchTerm ?
                    "Intenta cambiar los términos de búsqueda" :
                    "Comienza agregando tu primer cliente"}
                </p>
              </CardContent>
            </Card>
          )}
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
