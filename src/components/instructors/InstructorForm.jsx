import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Save, UserCheck, Trash2 } from "lucide-react";

export default function InstructorForm({ instructor, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: instructor?.nombre || "",
    telefono: instructor?.telefono || "",
    email: instructor?.email || "",
    photo_perfil: instructor?.photo_perfil || "",
    photo_vehicle: instructor?.photo_vehicle || "",
    placa_vehiculo: instructor?.placa_vehiculo || "",
    marca_vehiculo: instructor?.marca_vehiculo || "",
    modelo_vehiculo: instructor?.modelo_vehiculo || "",
    color_vehiculo: instructor?.color_vehiculo || "",
  });
  
  const [photoFiles, setPhotoFiles] = useState({ perfil: null, vehiculo: null });
  const [previews, setPreviews] = useState({ perfil: instructor?.photo_perfil, vehiculo: instructor?.photo_vehicle });
  const [photosToDelete, setPhotosToDelete] = useState({ perfil: false, vehiculo: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData, photoFiles, photosToDelete);
    setIsSubmitting(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleFileChange = (type, e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFiles(prev => ({ ...prev, [type]: file }));
      setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
      // Si selecciona una nueva foto, cancelar la eliminación
      setPhotosToDelete(prev => ({ ...prev, [type]: false }));
      // Limpiar el campo del formulario si había una foto anterior
      setFormData(prev => ({ ...prev, [`photo_${type === 'perfil' ? 'perfil' : 'vehicle'}`]: '' }));
    }
  };

  const handleDeletePhoto = (type) => {
    const photoField = type === 'perfil' ? 'photo_perfil' : 'photo_vehicle';
    
    // Marcar para eliminación
    setPhotosToDelete(prev => ({ ...prev, [type]: true }));
    
    // Limpiar preview y archivo seleccionado
    setPreviews(prev => ({ ...prev, [type]: null }));
    setPhotoFiles(prev => ({ ...prev, [type]: null }));
    
    // Limpiar el campo del formulario
    setFormData(prev => ({ ...prev, [photoField]: '' }));
    
    // Limpiar el input file
    const fileInput = document.getElementById(`photo_${photoField}`);
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const cancelDeletePhoto = (type) => {
    const photoField = type === 'perfil' ? 'photo_perfil' : 'photo_vehicle';
    const originalPhoto = instructor?.[photoField];
    
    // Cancelar eliminación
    setPhotosToDelete(prev => ({ ...prev, [type]: false }));
    
    // Restaurar foto original si existe
    if (originalPhoto) {
      setPreviews(prev => ({ ...prev, [type]: originalPhoto }));
      setFormData(prev => ({ ...prev, [photoField]: originalPhoto }));
    }
  };

  const getPhotoPreview = (type) => {
    const isMarkedForDeletion = photosToDelete[type];
    
    if (isMarkedForDeletion) {
      return type === 'perfil' 
        ? 'https://placehold.co/100x100/ef4444/fff/png?text=ELIMINAR'
        : 'https://placehold.co/100x100/ef4444/fff/png?text=ELIMINAR';
    }
    
    return previews[type] || (type === 'perfil' 
      ? 'https://placehold.co/100x100/fbbf24/000/png?text=Perfil'
      : 'https://placehold.co/100x100/3b82f6/fff/png?text=Auto');
  };

  const hasExistingPhoto = (type) => {
    const photoField = type === 'perfil' ? 'photo_perfil' : 'photo_vehicle';
    return instructor?.[photoField] && instructor[photoField] !== '';
  };

  return (
    <Card className="w-full max-h-[90vh] overflow-y-auto neo-card">
      <CardHeader className="border-b-4 border-border">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase">
            <UserCheck className="w-6 h-6 text-accent" />
            {instructor ? "EDITAR INSTRUCTOR" : "NUEVO INSTRUCTOR"}
          </CardTitle>
          <Button onClick={onCancel} className="neo-button bg-destructive text-destructive-foreground p-2"><X className="w-5 h-5" /></Button>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-8 grid md:grid-cols-2 gap-8">
          
          {/* Columna Información Personal */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-foreground uppercase">Información Personal</h3>
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-black uppercase">Nombre (Opcional)</Label>
              <Input id="nombre" value={formData.nombre} onChange={(e) => handleChange("nombre", e.target.value)} className="neo-input h-12 font-bold" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-black uppercase">Email (Opcional)</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className="neo-input h-12 font-bold" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-sm font-black uppercase">Teléfono (Opcional)</Label>
              <Input id="telefono" value={formData.telefono} onChange={(e) => handleChange("telefono", e.target.value)} className="neo-input h-12 font-bold" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo_perfil" className="text-sm font-black uppercase">Foto Perfil</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={getPhotoPreview('perfil')} 
                    alt="Preview" 
                    className={`w-20 h-20 object-cover neo-card border-2 border-border ${photosToDelete.perfil ? 'opacity-50' : ''}`} 
                  />
                  {photosToDelete.perfil && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 neo-card border-2 border-border">
                      <span className="text-white font-black text-xs">ELIMINAR</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Input 
                    id="photo_photo_perfil" 
                    type="file" 
                    onChange={(e) => handleFileChange('perfil', e)} 
                    className="neo-input file:neo-button file:bg-accent file:text-black file:mr-4 file:h-full" 
                    disabled={photosToDelete.perfil}
                  />
                  {hasExistingPhoto('perfil') && (
                    <div className="flex gap-2">
                      {photosToDelete.perfil ? (
                        <Button
                          type="button"
                          onClick={() => cancelDeletePhoto('perfil')}
                          className="neo-button bg-secondary text-foreground text-xs px-3 py-1"
                        >
                          CANCELAR ELIMINACIÓN
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => handleDeletePhoto('perfil')}
                          className="neo-button bg-destructive text-destructive-foreground text-xs px-3 py-1"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          ELIMINAR FOTO
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Columna Vehículo */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-foreground uppercase">Información del Vehículo</h3>
            <div className="space-y-2">
              <Label htmlFor="placa_vehiculo" className="text-sm font-black uppercase">Placa (Opcional)</Label>
              <Input id="placa_vehiculo" value={formData.placa_vehiculo} onChange={(e) => handleChange("placa_vehiculo", e.target.value)} className="neo-input h-12 font-bold" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marca_vehiculo" className="text-sm font-black uppercase">Marca (Opcional)</Label>
              <Input id="marca_vehiculo" value={formData.marca_vehiculo} onChange={(e) => handleChange("marca_vehiculo", e.target.value)} className="neo-input h-12 font-bold" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelo_vehiculo" className="text-sm font-black uppercase">Modelo (Opcional)</Label>
              <Input id="modelo_vehiculo" value={formData.modelo_vehiculo} onChange={(e) => handleChange("modelo_vehiculo", e.target.value)} className="neo-input h-12 font-bold" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color_vehiculo" className="text-sm font-black uppercase">Color (Opcional)</Label>
              <Input id="color_vehiculo" value={formData.color_vehiculo} onChange={(e) => handleChange("color_vehiculo", e.target.value)} className="neo-input h-12 font-bold" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo_vehicle" className="text-sm font-black uppercase">Foto Vehículo</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={getPhotoPreview('vehiculo')} 
                    alt="Preview" 
                    className={`w-20 h-20 object-cover neo-card border-2 border-border ${photosToDelete.vehiculo ? 'opacity-50' : ''}`} 
                  />
                  {photosToDelete.vehiculo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 neo-card border-2 border-border">
                      <span className="text-white font-black text-xs">ELIMINAR</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Input 
                    id="photo_photo_vehicle" 
                    type="file" 
                    onChange={(e) => handleFileChange('vehiculo', e)} 
                    className="neo-input file:neo-button file:bg-accent file:text-black file:mr-4 file:h-full" 
                    disabled={photosToDelete.vehiculo}
                  />
                  {hasExistingPhoto('vehiculo') && (
                    <div className="flex gap-2">
                      {photosToDelete.vehiculo ? (
                        <Button
                          type="button"
                          onClick={() => cancelDeletePhoto('vehiculo')}
                          className="neo-button bg-secondary text-foreground text-xs px-3 py-1"
                        >
                          CANCELAR ELIMINACIÓN
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => handleDeletePhoto('vehiculo')}
                          className="neo-button bg-destructive text-destructive-foreground text-xs px-3 py-1"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          ELIMINAR FOTO
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <div className="border-t-4 border-border px-8 py-6 flex justify-end gap-4">
          <Button type="button" onClick={onCancel} disabled={isSubmitting} className="neo-button bg-secondary text-foreground font-black uppercase">CANCELAR</Button>
          <Button type="submit" disabled={isSubmitting} className="neo-button bg-accent text-black font-black uppercase">
            {isSubmitting ? "GUARDANDO..." : <><Save className="w-4 h-4 mr-2" /> {instructor ? "ACTUALIZAR" : "CREAR"} INSTRUCTOR</>}
          </Button>
        </div>
      </form>
    </Card>
  );
}