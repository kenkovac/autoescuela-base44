import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import SearchableCombobox from "../ui/SearchableCombobox";
import ApiService from "../api/ApiService";

export default function ContratoFilters({ onFilterChange }) {
  const [selectedCliente, setSelectedCliente] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState("");

  const handleFilterChange = (key, value) => {
    if (key === "cliente_id") {
      setSelectedCliente(value);
    } else if (key === "fk_instructor") {
      setSelectedInstructor(value);
    }
    
    onFilterChange(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSelectedCliente("");
    setSelectedInstructor("");
    onFilterChange({ cliente_id: "", fk_instructor: "" });
  };

  const clearClienteFilter = () => {
    setSelectedCliente("");
    onFilterChange(prev => ({ ...prev, cliente_id: "" }));
  };

  const clearInstructorFilter = () => {
    setSelectedInstructor("");
    onFilterChange(prev => ({ ...prev, fk_instructor: "" }));
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <div className="w-full md:w-48 relative">
        <SearchableCombobox
          apiFetchFunction={(params) => ApiService.getClientes(params)}
          value={selectedCliente}
          onChange={(value) => handleFilterChange("cliente_id", value)}
          placeholder="FILTRAR CLIENTE"
          searchPlaceholder="Buscar cliente..."
          displayRender={(item) => `${item.nombre} - ${item.documento}`}
          valueField="id"
          emptyMessage="No se encontraron clientes"
        />
        {selectedCliente && (
          <Button
            onClick={clearClienteFilter}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6 bg-muted hover:bg-destructive text-muted-foreground hover:text-white rounded-full z-10"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      <div className="w-full md:w-48 relative">
        <SearchableCombobox
          apiFetchFunction={(params) => ApiService.getInstructores(params)}
          value={selectedInstructor}
          onChange={(value) => handleFilterChange("fk_instructor", value)}
          placeholder="FILTRAR INSTRUCTOR"
          searchPlaceholder="Buscar instructor..."
          displayField="nombre"
          valueField="id"
          emptyMessage="No se encontraron instructores"
        />
        {selectedInstructor && (
          <Button
            onClick={clearInstructorFilter}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6 bg-muted hover:bg-destructive text-muted-foreground hover:text-white rounded-full z-10"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      <Button 
        onClick={clearFilters}
        className="neo-button bg-secondary text-foreground px-4 py-2 text-sm font-bold uppercase whitespace-nowrap"
        disabled={!selectedCliente && !selectedInstructor}
      >
        LIMPIAR FILTROS
      </Button>
    </div>
  );
}