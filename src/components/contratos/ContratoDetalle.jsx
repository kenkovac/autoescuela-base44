import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  X,
  FileText,
  Trash2,
} from "lucide-react";
import ApiService from "../api/ApiService";
import ConfirmationDialog from "../ui/ConfirmationDialog";
import ContratoInfo from "./ContratoInfo";
import BloquesContratoTab from "./BloquesContratoTab";
import MovimientosContablesTab from "./MovimientosContablesTab";
import ContratoPDFExporter from "./ContratoPDFExporter";

const TABS = {
    GENERAL: 'general',
    BLOQUES: 'bloques',
    MOVIMIENTOS: 'movimientos',
    EXPORTAR: 'exportar',
};

export default function ContratoDetalle({ contratoId, onClose, onContratoDeleted }) {
  const [contrato, setContrato] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS.GENERAL);
  const [dialogState, setDialogState] = useState({ isOpen: false });

  useEffect(() => {
    const fetchContrato = async () => {
      try {
        setIsLoading(true);
        const data = await ApiService.getContrato(contratoId);
        setContrato(data);
        setError(null);
      } catch (err) {
        setError("No se pudo cargar el contrato.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContrato();
  }, [contratoId]);

  const handleDeleteRequest = () => {
    setDialogState({
      isOpen: true,
      title: '¿ELIMINAR CONTRATO?',
      description: 'Esta acción es irreversible y eliminará el contrato junto con sus movimientos y horarios. ¿Continuar?',
      onConfirm: performDelete,
      confirmText: 'SÍ, ELIMINAR',
    });
  };

  const performDelete = async () => {
    try {
      // The API should handle cascading deletes. If not, logic must be added here.
      await ApiService.deleteContrato(contratoId);
      if(onContratoDeleted) onContratoDeleted();
      onClose();
    } catch (err) {
      console.error("Error deleting contrato:", err);
    } finally {
      setDialogState({ isOpen: false });
    }
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case TABS.GENERAL:
        return <ContratoInfo contrato={contrato} />;
      case TABS.BLOQUES:
        return <BloquesContratoTab contratoId={contratoId} onDataChange={() => {}} />;
      case TABS.MOVIMIENTOS:
        return <MovimientosContablesTab contrato={contrato} />;
      case TABS.EXPORTAR:
        return <ContratoPDFExporter
            contrato={contrato}
            instructor={contrato?.instructor}
            cliente={contrato?.cliente}
            bloques={contrato?.bloques || []}
          />;
      default:
        return null;
    }
  };
  
  if (isLoading) return <Card className="w-full h-full flex items-center justify-center neo-card"><p className="font-bold uppercase">Cargando...</p></Card>;
  if (error) return <Card className="w-full h-full flex items-center justify-center neo-card"><p className="text-destructive font-bold uppercase">{error}</p></Card>;
  if (!contrato) return null;

  return (
    <>
      <Card className="w-full h-full neo-card flex flex-col">
        <CardHeader className="border-b-4 border-border">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase">
              <FileText className="w-6 h-6 text-accent" />
              DETALLE CONTRATO #{contrato.id}
            </CardTitle>
            <div className="flex items-center gap-2">
                <Button onClick={handleDeleteRequest} variant="destructive" className="neo-button">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                </Button>
                <Button onClick={onClose} className="neo-button bg-secondary text-foreground p-2">
                    <X className="w-5 h-5" />
                </Button>
            </div>
          </div>
          <div className="pt-4 flex border-t-2 border-border/10 mt-4">
            <button onClick={() => setActiveTab(TABS.GENERAL)} className={`px-4 py-2 font-black uppercase ${activeTab === TABS.GENERAL ? 'bg-accent text-black' : 'bg-secondary'}`}>General</button>
            <button onClick={() => setActiveTab(TABS.BLOQUES)} className={`px-4 py-2 font-black uppercase ${activeTab === TABS.BLOQUES ? 'bg-accent text-black' : 'bg-secondary'}`}>Horarios</button>
            <button onClick={() => setActiveTab(TABS.MOVIMIENTOS)} className={`px-4 py-2 font-black uppercase ${activeTab === TABS.MOVIMIENTOS ? 'bg-accent text-black' : 'bg-secondary'}`}>Contabilidad</button>
             <button onClick={() => setActiveTab(TABS.EXPORTAR)} className={`px-4 py-2 font-black uppercase ${activeTab === TABS.EXPORTAR ? 'bg-accent text-black' : 'bg-secondary'}`}>Exportar</button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto bg-slate-50">
          {renderTabContent()}
        </CardContent>
      </Card>
      <ConfirmationDialog
        isOpen={dialogState.isOpen}
        onCancel={() => setDialogState({ isOpen: false })}
        onConfirm={dialogState.onConfirm}
        title={dialogState.title}
        description={dialogState.description}
        confirmText={dialogState.confirmText}
      />
    </>
  );
}