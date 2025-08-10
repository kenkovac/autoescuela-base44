
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Search,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ApiService from "../components/api/ApiService";

import UsuarioForm from "../components/usuarios/UsuarioForm";
import UsuarioCard from "../components/usuarios/UsuarioCard";
import UsuarioCardSkeleton from "../components/usuarios/UsuarioCardSkeleton";
import ConfirmationDialog from "../components/ui/ConfirmationDialog";

const PAGE_LIMIT = 10;

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Added refreshKey
  const [dialogState, setDialogState] = useState({ isOpen: false });

  const observer = useRef();
  const lastUsuarioElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const loadUsuarios = useCallback(async () => {
    if (!hasMore && page > 1) return; // Prevent loading more if there's no more data
    setIsLoading(true);
    try {
      const params = {
        page: page,
        limit: PAGE_LIMIT,
        search: searchTerm
      };
      
      const response = await ApiService.getUsuarios(params);
      const data = response.data || [];
      
      if (page === 1) {
        setUsuarios(data);
      } else {
        setUsuarios(prev => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_LIMIT);

    } catch (error) {
      console.error("Error loading usuarios:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, hasMore]);

  useEffect(() => {
    loadUsuarios();
  }, [loadUsuarios]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [searchTerm, refreshKey]); // Added refreshKey to dependencies

  const handleSubmit = async (usuarioData) => {
    try {
      if (editingUsuario) {
        await ApiService.updateUsuario(editingUsuario.id, usuarioData);
      } else {
        await ApiService.createUsuario(usuarioData);
      }
      
      setShowForm(false);
      setEditingUsuario(null);
      setUsuarios([]); // Limpiar datos actuales
      setRefreshKey(k => k + 1); // Forzar recarga
    } catch (error) {
      console.error("Error saving usuario:", error);
      // Removed alert(), error will be handled by the form component (e.g., via form error state or toast)
    }
  };

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    setShowForm(true);
  };

  const performDelete = async (id) => {
    try {
      await ApiService.deleteUsuario(id);
      setUsuarios([]); // Limpiar datos actuales
      setRefreshKey(k => k + 1);
    } catch (error) {
      console.error("Error deleting usuario:", error);
      // Error will be shown in a toast or handled by the UI
    } finally {
      setDialogState({ isOpen: false });
    }
  };

  const handleDeleteRequest = (id) => {
    setDialogState({
      isOpen: true,
      title: '¿ELIMINAR USUARIO?',
      description: 'El usuario será eliminado permanentemente y perderá el acceso al sistema. ¿Estás seguro?',
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
          <h1 className="text-5xl font-black text-foreground uppercase">USUARIOS</h1>
          <p className="text-muted-foreground mt-2 font-bold uppercase text-sm">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingUsuario(null); // Ensure no user is being edited when opening for new user
            setShowForm(true);
          }}
          className="neo-button bg-[var(--neo-blue)] text-black hover:bg-blue-400 px-6 py-3 text-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          NUEVO USUARIO
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="neo-card bg-[var(--neo-blue)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-black uppercase">Total Usuarios</p>
                <p className="text-2xl font-black text-black">{usuarios.length}</p>
              </div>
              <Users className="w-8 h-8 text-black" />
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
                placeholder="BUSCAR POR NOMBRE O EMAIL..."
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
              <UsuarioForm
                usuario={editingUsuario}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingUsuario(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Usuarios Grid */}
      <div className="grid gap-6">
        <AnimatePresence mode="popLayout"> {/* Use popLayout for better exit animations during list changes */}
          {usuarios.map((usuario, index) => {
            if (usuarios.length === index + 1) {
              return (
                <motion.div
                  ref={lastUsuarioElementRef}
                  key={usuario.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  layout // Enables layout animations
                >
                  <UsuarioCard
                    usuario={usuario}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest}
                  />
                </motion.div>
              );
            } else {
              return (
                <motion.div
                  key={usuario.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  layout // Enables layout animations
                >
                  <UsuarioCard
                    usuario={usuario}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest}
                  />
                </motion.div>
              );
            }
          })}
        </AnimatePresence>

        {isLoading && (
          // Only show skeletons if there are no existing users or if loading more
          usuarios.length === 0 || page > 1 ?
            [...Array(PAGE_LIMIT)].map((_, i) => <UsuarioCardSkeleton key={i} />)
            :
            // If loading initial data, just show a few skeletons, not necessarily PAGE_LIMIT
            [...Array(3)].map((_, i) => <UsuarioCardSkeleton key={i} />)
        )}

        {!isLoading && usuarios.length === 0 && (
          <Card className="neo-card">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-black text-foreground uppercase mb-2">
                NO SE ENCONTRARON USUARIOS
              </h3>
              <p className="text-muted-foreground font-bold uppercase">
                {searchTerm
                  ? "Intenta cambiar los filtros de búsqueda"
                  : "Comienza creando tu primer usuario"}
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Loader/End of list indicator */}
        {!isLoading && !hasMore && usuarios.length > 0 && (
          <div className="text-center text-muted-foreground text-sm font-bold uppercase py-4">
            Fin de la lista
          </div>
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
