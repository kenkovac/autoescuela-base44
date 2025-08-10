import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function GestoriaFilters({ onFilterChange }) {
  const handleFilterChange = (key, value) => {
    onFilterChange(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <Select 
        onValueChange={(value) => handleFilterChange("tipo_tramite", value)}
      >
        <SelectTrigger className="neo-input w-full md:w-40 h-12 font-bold uppercase">
          <SelectValue placeholder="TRÁMITE" />
        </SelectTrigger>
        <SelectContent className="neo-card border-4 border-border">
          <SelectItem value="all" className="font-bold">TODOS</SelectItem>
          <SelectItem value="Duplicado" className="font-bold">DUPLICADO</SelectItem>
          <SelectItem value="Renovación" className="font-bold">RENOVACIÓN</SelectItem>
          <SelectItem value="Primera vez" className="font-bold">PRIMERA VEZ</SelectItem>
          <SelectItem value="Cambio categoría" className="font-bold">CAMBIO CATEGORÍA</SelectItem>
        </SelectContent>
      </Select>

      <Select 
        onValueChange={(value) => handleFilterChange("moneda", value)}
      >
        <SelectTrigger className="neo-input w-full md:w-40 h-12 font-bold uppercase">
          <SelectValue placeholder="MONEDA" />
        </SelectTrigger>
        <SelectContent className="neo-card border-4 border-border">
          <SelectItem value="all" className="font-bold">TODAS</SelectItem>
          <SelectItem value="USD" className="font-bold">USD</SelectItem>
          <SelectItem value="EUR" className="font-bold">EUR</SelectItem>
          <SelectItem value="VES" className="font-bold">VES</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}