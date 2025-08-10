
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Search,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ApiService from "../components/api/ApiService";

import RoleForm from "../components/roles/RoleForm";
import RoleCard from "../components/roles/RoleCard";
import RoleCardSkeleton from "../components/roles/RoleCardSkeleton";
import ConfirmationDialog from "../components/ui/ConfirmationDialog";

const PAGE_LIMIT = 12;

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialogState, setDialogState] = useState({ isOpen: false });

  const observer = useRef();
  const lastRoleElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const loadRoles = useCallback(async () => {
    // If it's the first page or a refresh triggered by CRUD, we want to load.
    // If it's subsequent pages and no more data, we stop.
    if (!hasMore && page > 1) return;
    setIsLoading(true);
    try {
      const params = {
        page: page,
        limit: PAGE_LIMIT,
        search: searchTerm
      };
      
      const response = await ApiService.getRoles(params);
      const data = response.data || []; // Extract data from the response object
      
      if (page === 1) {
        setRoles(data);
      } else {
        setRoles(prev => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_LIMIT);

    } catch (error) {
      console.error("Error loading roles:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, hasMore]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [searchTerm, refreshKey]);

  const handleSubmit = async (roleData) => {
    try {
      if (editingRole) {
        await ApiService.updateRole(editingRole.id, roleData);
      } else {
        await ApiService.createRole(roleData);
      }
      setShowForm(false);
      setEditingRole(null);
      setRoles([]); // Limpiar datos actuales
      setRefreshKey(k => k + 1); // Forzar recarga
    } catch (error) {
      console.error("Error saving role:", error);
      // Error will be handled by form component
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setShowForm(true);
  };

  const performDelete = async (id) => {
    try {
      await ApiService.deleteRole(id);
      setRoles([]); // Limpiar datos actuales
      setRefreshKey(k => k + 1);
    } catch (error) {
      console.error("Error deleting role:", error);
      // Error will be handled by UI components
    } finally {
      setDialogState({ isOpen: false });
    }
  };

  const handleDeleteRequest = (id) => {
    setDialogState({
      isOpen: true,
      title: '¿ELIMINAR ROL?',
      description: 'Eliminar un rol puede afectar a los usuarios que lo tengan asignado. Esta acción no se puede deshacer.',
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
          <h1 className="text-5xl font-black text-foreground uppercase">Roles de Usuario</h1>
          <p className="text-muted-foreground mt-2 font-bold uppercase text-sm">
            Define los permisos y niveles de acceso del sistema
          </p>
        </div>
        <Button
          onClick={() => { setEditingRole(null); setShowForm(true); }}
          className="neo-button bg-[var(--neo-green)] text-black hover:bg-green-400 px-6 py-3 text-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          NUEVO ROL
        </Button>
      </motion.div>

      {/* Stats Card */}
      <Card className="neo-card bg-[var(--neo-blue)]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-black uppercase">Roles Totales</p>
              <p className="text-2xl font-black text-black">{roles.length}</p>
            </div>
            <Shield className="w-8 h-8 text-black" />
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Card className="neo-card">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="BUSCAR POR NOMBRE O SLUG..."
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
              className="w-full max-w-lg"
            >
              <RoleForm
                role={editingRole}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingRole(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {roles.map((role, index) => {
            if (roles.length === index + 1) {
              return (
                <motion.div
                  ref={lastRoleElementRef}
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <RoleCard
                    role={role}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest}
                  />
                </motion.div>
              );
            } else {
              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <RoleCard
                    role={role}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest}
                  />
                </motion.div>
              );
            }
          })}
        </AnimatePresence>

        {isLoading && (
          [...Array(PAGE_LIMIT)].map((_, i) => <RoleCardSkeleton key={i} />)
        )}
      </div>

      {!isLoading && roles.length === 0 && (
        <Card className="neo-card">
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-black text-foreground uppercase mb-2">
              NO SE ENCONTRARON ROLES
            </h3>
            <p className="text-muted-foreground font-bold uppercase">
              {searchTerm ?
                "Intenta cambiar los términos de búsqueda" :
                "Comienza creando tu primer rol"}
            </p>
          </CardContent>
        </Card>
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
