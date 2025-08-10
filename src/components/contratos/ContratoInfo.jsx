import React from 'react';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  FileText,
  Calendar,
  User,
  DollarSign,
  Clock,
  CreditCard,
  Building2,
  MapPin,
  List,
  Table,
  Info,
  UserCheck,
  Car,
  FileSignature
} from "lucide-react";

export default function ContratoInfo({ contrato }) {
    if (!contrato) return null;

    return (
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-secondary neo-card border-2 border-border">
                    <div className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <span className="text-xs font-black text-muted-foreground uppercase">CLIENTE</span>
                    </div>
                    <p className="font-black text-foreground uppercase">{contrato.cliente?.nombre || 'No disponible'}</p>
                </div>
                <div className="p-4 bg-secondary neo-card border-2 border-border">
                    <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="w-5 h-5 text-muted-foreground" />
                        <span className="text-xs font-black text-muted-foreground uppercase">INSTRUCTOR</span>
                    </div>
                    <p className="font-black text-foreground uppercase">{contrato.instructor?.nombre || 'No disponible'}</p>
                </div>
                <div className="p-4 bg-secondary neo-card border-2 border-border">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-muted-foreground" />
                        <span className="text-xs font-black text-muted-foreground uppercase">VALOR TOTAL ({contrato.moneda})</span>
                    </div>
                    <p className="font-black text-foreground uppercase">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: contrato.moneda || 'USD' }).format(contrato.total || 0)}
                    </p>
                </div>
                <div className="p-4 bg-secondary neo-card border-2 border-border">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <span className="text-xs font-black text-muted-foreground uppercase">INICIO</span>
                    </div>
                    <p className="font-black text-foreground uppercase">
                        {contrato.fecha_inicio ? format(new Date(contrato.fecha_inicio), 'd MMM yyyy', { locale: es }) : 'No definida'}
                    </p>
                </div>
                <div className="p-4 bg-secondary neo-card border-2 border-border">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <span className="text-xs font-black text-muted-foreground uppercase">FIN</span>
                    </div>
                    <p className="font-black text-foreground uppercase">
                        {contrato.fecha_fin ? format(new Date(contrato.fecha_fin), 'd MMM yyyy', { locale: es }) : 'No definida'}
                    </p>
                </div>
            </div>

            <div className="mt-8">
                <h4 className="text-lg font-black uppercase text-foreground mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    DETALLES ADICIONALES
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-secondary neo-card border-2 border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="w-5 h-5 text-muted-foreground" />
                            <span className="text-xs font-black text-muted-foreground uppercase">MÉTODO PAGO</span>
                        </div>
                        <p className="font-black text-foreground uppercase">{contrato.metodo_pago || 'No disponible'}</p>
                    </div>
                    <div className="p-4 bg-secondary neo-card border-2 border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <Car className="w-5 h-5 text-muted-foreground" />
                            <span className="text-xs font-black text-muted-foreground uppercase">TIPO DE CLASE</span>
                        </div>
                        <p className="font-black text-foreground uppercase">{contrato.metodo_clase || 'No disponible'}</p>
                    </div>
                    <div className="p-4 bg-secondary neo-card border-2 border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-5 h-5 text-muted-foreground" />
                            <span className="text-xs font-black text-muted-foreground uppercase">MODO DE CLASE</span>
                        </div>
                        <p className="font-black text-foreground uppercase">{contrato.modo_clase || 'No disponible'}</p>
                    </div>
                    {contrato.horario && (
                        <div className="p-4 bg-secondary neo-card border-2 border-border">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-5 h-5 text-muted-foreground" />
                                <span className="text-xs font-black text-muted-foreground uppercase">HORARIO</span>
                            </div>
                            <p className="font-black text-foreground uppercase">{contrato.horario}</p>
                        </div>
                    )}
                    <div className="p-4 bg-secondary neo-card border-2 border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-5 h-5 text-muted-foreground" />
                            <span className="text-xs font-black text-muted-foreground uppercase">PUNTO DE ENCUENTRO</span>
                        </div>
                        <p className="font-black text-foreground uppercase">{contrato.punto_encuentro || 'No disponible'}</p>
                    </div>
                    <div className="p-4 bg-secondary neo-card border-2 border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <FileSignature className="w-5 h-5 text-muted-foreground" />
                            <span className="text-xs font-black text-muted-foreground uppercase">TIPO DE PAGO</span>
                        </div>
                        <p className="font-black text-foreground uppercase">{contrato.tipo_pago || 'No disponible'}</p>
                    </div>
                    {contrato.total_instructor > 0 && (
                        <div className="p-4 bg-secondary neo-card border-2 border-border">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-5 h-5 text-muted-foreground" />
                                <span className="text-xs font-black text-muted-foreground uppercase">PAGO INSTRUCTOR</span>
                            </div>
                            <p className="font-black text-foreground uppercase text-red-600">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: contrato.moneda || 'USD' }).format(contrato.total_instructor)}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <h4 className="text-lg font-black uppercase text-foreground mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    NOTAS
                </h4>
                <div className="p-4 bg-secondary neo-card border-2 border-border min-h-[80px]">
                    <p className="text-sm font-bold text-foreground whitespace-pre-wrap">{contrato.notas || 'Sin notas.'}</p>
                </div>
            </div>
        </div>
    );
}