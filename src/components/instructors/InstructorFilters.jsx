import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function InstructorFilters({ filters, onFiltersChange }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <Select 
          value={filters.status} 
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
            <SelectItem value="on_leave">De baja</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Select 
        value={filters.specialty} 
        onValueChange={(value) => handleFilterChange("specialty", value)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Especialidad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="B">Licencia B</SelectItem>
          <SelectItem value="A1">Licencia A1</SelectItem>
          <SelectItem value="A2">Licencia A2</SelectItem>
          <SelectItem value="A">Licencia A</SelectItem>
          <SelectItem value="C1">Licencia C1</SelectItem>
          <SelectItem value="C">Licencia C</SelectItem>
          <SelectItem value="D1">Licencia D1</SelectItem>
          <SelectItem value="D">Licencia D</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}