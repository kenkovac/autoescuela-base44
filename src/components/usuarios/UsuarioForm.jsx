
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Save, User, Eye, EyeOff, AlertCircle } from "lucide-react"; // Added AlertCircle

export default function UsuarioForm({ usuario, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: usuario?.name || "",
    email: usuario?.email || "",
    password: "",
    password_confirmation: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({}); // New state for errors

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Limpiar errores anteriores
    setErrors({});
    
    // Validaciones
    const newErrors = {};
    
    if (!usuario && !formData.password) {
      newErrors.password = "La contraseña es requerida para nuevos usuarios";
    }
    
    if (formData.password && formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Las contraseñas no coinciden";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = { ...formData };
      
      // No enviar campos de confirmación
      delete submitData.password_confirmation;
      
      // No enviar contraseña vacía en edición
      if (usuario && !formData.password) {
        delete submitData.password;
      }
      
      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ general: "Error al guardar usuario. Intenta nuevamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto neo-card">
      <CardHeader className="border-b-4 border-border">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase">
            <User className="w-6 h-6 text-accent" />
            {usuario ? "EDITAR USUARIO" : "NUEVO USUARIO"}
          </CardTitle>
          <Button onClick={onCancel} className="neo-button bg-destructive text-destructive-foreground p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="p-8 space-y-8">
          {/* Error General */}
          {errors.general && (
            <div className="bg-red-50 border-4 border-red-500 p-4 neo-card">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800 font-bold uppercase text-sm">{errors.general}</p>
              </div>
            </div>
          )}

          {/* Información Personal */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-foreground uppercase">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-black uppercase">Nombre Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  className="neo-input h-12 font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-black uppercase">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  className="neo-input h-12 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Contraseña */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-foreground uppercase">
              Contraseña {usuario && "(dejar vacío para no cambiar)"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-black uppercase">
                  {usuario ? "Nueva Contraseña" : "Contraseña *"}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    required={!usuario}
                    className={`neo-input h-12 font-bold pr-12 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 p-2 hover:bg-transparent"
                    variant="ghost"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm font-bold">{errors.password}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation" className="text-sm font-black uppercase">
                  Confirmar Contraseña {!usuario && "*"}
                </Label>
                <div className="relative">
                  <Input
                    id="password_confirmation"
                    type={showPasswordConfirm ? "text" : "password"}
                    value={formData.password_confirmation}
                    onChange={(e) => handleChange("password_confirmation", e.target.value)}
                    required={!usuario && formData.password}
                    className={`neo-input h-12 font-bold pr-12 ${errors.password_confirmation ? 'border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-2 top-2 p-2 hover:bg-transparent"
                    variant="ghost"
                  >
                    {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {errors.password_confirmation && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm font-bold">{errors.password_confirmation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>

        <div className="border-t-4 border-border px-8 py-6 flex justify-end gap-4">
          <Button type="button" onClick={onCancel} disabled={isSubmitting} className="neo-button bg-secondary text-foreground font-black uppercase">
            CANCELAR
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="neo-button bg-accent text-black font-black uppercase"
          >
            {isSubmitting ? "GUARDANDO..." : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {usuario ? "ACTUALIZAR" : "CREAR"} USUARIO
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
