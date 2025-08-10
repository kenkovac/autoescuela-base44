import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, RefreshCw } from "lucide-react";

export default function QuickActions({ onRefresh }) {
  return (
    <div className="flex gap-4">
      <Button
        onClick={onRefresh}
        className="neo-button bg-secondary hover:bg-muted text-foreground font-black uppercase"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        ACTUALIZAR
      </Button>
      <Link to={createPageUrl("Clientes")}>
        <Button className="neo-button bg-accent hover:bg-accent text-black font-black uppercase">
          <Plus className="w-4 h-4 mr-2" />
          NUEVO CLIENTE
        </Button>
      </Link>
    </div>
  );
}