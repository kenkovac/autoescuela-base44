
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ApiService from "../components/api/ApiService";

import InstructorForm from "../components/instructors/InstructorForm";
import InstructorCard from "../components/instructors/InstructorCard";
import InstructorCardSkeleton from "../components/instructors/InstructorCardSkeleton";
import ConfirmationDialog from "../components/ui/ConfirmationDialog";

const PAGE_LIMIT = 6;

export default function Instructores() {
  const [instructores, setInstructores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialogState, setDialogState] = useState({ isOpen: false });

  const observer = useRef();
  const lastInstructorElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const loadInstructores = useCallback(async () => {
    // If it's page 1 and there are no instructors, or if we're trying to load past what's available
    // Corrected condition order
    if (page > 1 && !hasMore) {
      setIsLoading(false); // Ensure loading state is reset if no more data
      return;
    } 
    setIsLoading(true);
    try {
      const params = {
        page: page,
        limit: PAGE_LIMIT,
        search: searchTerm
      };
      
      const response = await ApiService.getInstructores(params);
      const data = response.data || [];
      
      if (page === 1) { // If it's the first page, replace instructors
        setInstructores(data);
      } else { // Otherwise, append them
        setInstructores(prev => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_LIMIT);

    } catch (error) {
      console.error("Error loading instructores:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, hasMore, refreshKey]); // Añadido refreshKey como dependencia

  // refreshInstructores is no longer needed, direct state manipulation is used

  // This useEffect now only resets page and hasMore when searchTerm or refreshKey changes
  useEffect(() => {
    setPage(1); // Reset page to 1 when search term or refreshKey changes
    setHasMore(true); // Always assume more when starting a new search
  }, [searchTerm, refreshKey]);

  // This useEffect now triggers loadInstructores whenever the loadInstructores callback itself changes (due to its dependencies: page, searchTerm, hasMore, refreshKey)
  useEffect(() => {
    loadInstructores();
  }, [loadInstructores]);

  const handleSubmit = async (instructorData, photoFiles, photosToDelete = { perfil: false, vehiculo: false }) => {
    try {
      let finalData = { ...instructorData };

      if (editingInstructor && photosToDelete.perfil && editingInstructor.photo_perfil) {
        try {
          await ApiService.removeInstructorPhoto(editingInstructor.id, 'perfil');
          finalData.photo_perfil = null;
        } catch (e) {
          console.warn("Could not remove old profile photo:", e);
        }
      }

      if (editingInstructor && photosToDelete.vehiculo && editingInstructor.photo_vehicle) {
        try {
          await ApiService.removeInstructorPhoto(editingInstructor.id, 'vehicle');
          finalData.photo_vehicle = null;
        } catch (e) {
          console.warn("Could not remove old vehicle photo, proceeding anyway.", e);
        }
      }

      if (photoFiles.perfil) {
        if (editingInstructor && editingInstructor.photo_perfil && !photosToDelete.perfil) {
          try {
            await ApiService.removeInstructorPhoto(editingInstructor.id, 'perfil');
          } catch (e) {
            console.warn("Could not remove old profile photo, proceeding anyway.", e);
          }
        }
        const { url } = await ApiService.uploadInstructorPhoto(photoFiles.perfil, 'perfil');
        finalData.photo_perfil = url;
      }

      if (photoFiles.vehiculo) {
        if (editingInstructor && editingInstructor.photo_vehicle && !photosToDelete.vehiculo) {
          try {
            await ApiService.removeInstructorPhoto(editingInstructor.id, 'vehicle'); // Corrected: should be editingInstructor.id not photoFiles.vehiculo
          } catch (e) {
            console.warn("Could not remove old vehicle photo, proceeding anyway.", e);
          }
        }
        const { url } = await ApiService.uploadInstructorPhoto(photoFiles.vehiculo, 'vehicle');
        finalData.photo_vehicle = url;
      }

      if (editingInstructor) {
        await ApiService.updateInstructor(editingInstructor.id, finalData);
      } else {
        await ApiService.createInstructor(finalData);
      }

      setShowForm(false);
      setEditingInstructor(null);
      setInstructores([]); // Limpiar datos actuales
      setPage(1); // Reset page
      setHasMore(true); // Reset hasMore
      setRefreshKey(k => k + 1); // Forzar recarga
    } catch (error) {
      console.error("Error saving instructor:", error);
      // Error will be handled by form component
    }
  };

  const handleEdit = (instructor) => {
    setEditingInstructor(instructor);
    setShowForm(true);
  };

  const performDelete = async (id) => {
    try {
      const instructorToDelete = instructores.find(inst => inst.id === id);

      if (instructorToDelete) {
        const photoDeletionPromises = [];
        if (instructorToDelete.photo_perfil) {
          photoDeletionPromises.push(ApiService.removeInstructorPhoto(id, 'perfil'));
        }
        if (instructorToDelete.photo_vehicle) {
          photoDeletionPromises.push(ApiService.removeInstructorPhoto(id, 'vehicle'));
        }

        if (photoDeletionPromises.length > 0) {
          await Promise.allSettled(photoDeletionPromises);
        }
      }

      await ApiService.deleteInstructor(id);
      setInstructores([]); // Limpiar datos actuales
      setPage(1); // Reset page
      setHasMore(true); // Reset hasMore
      setRefreshKey(k => k + 1); // Forzar recarga
    } catch (error) {
      console.error("Error deleting instructor:", error);
      // Error will be handled by UI components
    } finally {
      setDialogState({ isOpen: false });
    }
  };

  const handleDeleteRequest = (id) => {
    setDialogState({
      isOpen: true,
      title: '¿ELIMINAR INSTRUCTOR?',
      description: 'Se eliminará el instructor y sus fotos asociadas de forma permanente. ¿Estás seguro de continuar?',
      onConfirm: () => performDelete(id),
      confirmText: 'SÍ, ELIMINAR'
    });
  };

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-5xl font-black text-foreground uppercase">Instructores</h1>
          <p className="text-muted-foreground mt-2 font-bold uppercase text-sm">
            Gestiona el personal de enseñanza y sus vehículos
          </p>
        </div>
        <Button
          onClick={() => { setEditingInstructor(null); setShowForm(true); }}
          className="neo-button bg-[var(--neo-green)] text-black hover:bg-green-400 px-6 py-3 text-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          NUEVO INSTRUCTOR
        </Button>
      </motion.div>

      <Card className="neo-card">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="BUSCAR POR NOMBRE, EMAIL, PLACA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="neo-input pl-10 font-bold uppercase text-lg h-12"
            />
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
              className="w-full max-w-4xl"
            >
              <InstructorForm
                instructor={editingInstructor}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6">
        <AnimatePresence>
          {instructores.map((instructor, index) => {
            if (instructores.length === index + 1) {
              return (
                <motion.div
                  ref={lastInstructorElementRef}
                  key={instructor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <InstructorCard
                    instructor={instructor}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest}
                  />
                </motion.div>
              );
            } else {
              return (
                <motion.div
                  key={instructor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <InstructorCard
                    instructor={instructor}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest}
                  />
                </motion.div>
              );
            }
          })}
        </AnimatePresence>

        {isLoading && (
          [...Array(PAGE_LIMIT)].map((_, i) => <InstructorCardSkeleton key={i} />)
        )}

        {!isLoading && instructores.length === 0 && (
          <Card className="neo-card text-center p-12">
            <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-black text-foreground uppercase">No se encontraron instructores</h3>
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
