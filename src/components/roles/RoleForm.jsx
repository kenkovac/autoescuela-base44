import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Save, Shield } from "lucide-react";

export default function RoleForm({ role, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    display_name: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || "",
        display_name: role.display_name || ""
      });
    } else {
      setFormData({ name: "", display_name: "" });
    }
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  const handleChange = (field, value) => {
    let newName = value;
    if (field === 'display_name') {
      newName = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({ ...prev, name: newName, display_name: value }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Card className="w-full max-w-lg neo-card">
      <CardHeader className="border-b-4 border-border">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase">
            <Shield className="w-6 h-6 text-accent" />
            {role ? "EDITAR ROL" : "NUEVO ROL"}
          </CardTitle>
          <Button onClick={onCancel} className="neo-button bg-destructive text-destructive-foreground p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="display_name" className="text-sm font-black uppercase">Nombre a mostrar *</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => handleChange("display_name", e.target.value)}
              required
              className="neo-input h-12 font-bold"
              placeholder="Ej: Administrador del Sistema"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-black uppercase">Nombre (slug) *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              className="neo-input h-12 font-bold bg-secondary"
              placeholder="Ej: administrador-del-sistema"
            />
            <p className="text-xs text-muted-foreground font-bold">Este es el identificador único. Se genera automáticamente.</p>
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
                {role ? "ACTUALIZAR" : "CREAR"} ROL
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}