import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MovimientosFilters({ onFilterChange, monedas = [] }) {
  const handleFilterChange = (key, value) => {
    onFilterChange(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <Select 
        onValueChange={(value) => handleFilterChange("tipo_movimiento", value)}
      >
        <SelectTrigger className="neo-input w-full md:w-40 h-12 font-bold uppercase">
          <SelectValue placeholder="TIPO" />
        </SelectTrigger>
        <SelectContent className="neo-card border-4 border-border">
          <SelectItem value="all" className="font-bold">TODOS</SelectItem>
          <SelectItem value="ingreso" className="font-bold">INGRESOS</SelectItem>
          <SelectItem value="gasto" className="font-bold">GASTOS</SelectItem>
          <SelectItem value="ajuste" className="font-bold">AJUSTES</SelectItem>
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
          {monedas.map(moneda => (
            <SelectItem key={moneda} value={moneda} className="font-bold">{moneda}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}