
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCheck,
  FileText,
  CreditCard,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  Plus,
  Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../components/utils"; 
import ApiService from "../components/api/ApiService";

// Importar componentes de formularios para las acciones rápidas
import ClienteForm from "../components/clientes/ClienteForm";
import ContratoForm from "../components/contratos/ContratoForm";
import GestoriaVentaForm from "../components/gestoria/GestoriaVentaForm";
import { useToast } from "../components/ui/ToastProvider";

export default function Dashboard() {
  const [stats, setStats] = useState({
    clientes: 0,
    instructores: 0,
    contratos: 0,
    gestoriaVentas: 0,
    ingresosPorMoneda: {},
    loading: true
  });

  const [showQuickAction, setShowQuickAction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await ApiService.getDashboardStats();
      
      // Calcular ingresos por moneda basados en los movimientos del mes actual
      const ingresosPorMoneda = {};
      
      // Usar los movimientos de ingreso del mes actual
      data.movimientosMesActual.forEach(movimiento => {
        const moneda = movimiento.moneda || 'USD';
        if (!ingresosPorMoneda[moneda]) ingresosPorMoneda[moneda] = 0;
        // El ingreso se registra en el campo 'debe'
        ingresosPorMoneda[moneda] += parseFloat(movimiento.debe || 0);
      });

      setStats({
        clientes: data.clientes.length,
        instructores: data.instructores.length,
        contratos: data.contratos.length,
        gestoriaVentas: data.gestoriaVentas.length,
        ingresosPorMoneda,
        loading: false
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const handleQuickActionSubmit = async (data, type) => {
    setIsSubmitting(true);
    let successMessage = '';
    try {
      switch (type) {
        case 'cliente':
          await ApiService.createCliente(data);
          successMessage = "Cliente creado con éxito.";
          break;
        case 'contrato':
          // Para contratos necesitamos manejar bloques también
          const { bloques, ...contratoData } = data;
          const newContrato = await ApiService.createContrato(contratoData);
          
          // Crear bloques si existen
          if (bloques && bloques.length > 0) {
            for (const bloque of bloques) {
              await ApiService.createBloqueContrato({
                ...bloque,
                contrato_id: newContrato.id
              });
            }
          }
          successMessage = "Contrato creado con éxito.";
          break;
        case 'gestoria':
          const nuevaGestoria = await ApiService.createGestoriaVenta(data);
          
          // Crear movimiento contable automático
          const cliente = await ApiService.getCliente(data.cliente_id);
          const movimientoData = {
            gestoria_venta_id: nuevaGestoria.id,
            fecha: data.fecha,
            descripcion: `Venta gestoría ${data.tipo_tramite} - ${cliente.nombre}`,
            tipo_movimiento: "ingreso",
            cuenta: "Caja",
            moneda: data.moneda,
            debe: parseFloat(data.monto),
            haber: 0,
            referencia: data.referencia_pago || `GV-${nuevaGestoria.id}`
          };
          await ApiService.createMovimientoContable(movimientoData);
          successMessage = "Venta de gestoría registrada con éxito.";
          break;
      }
      
      setShowQuickAction(null);
      loadDashboardData(); // Recargar datos
      addToast(successMessage, 'success');
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
      addToast(`Error al crear ${type}.`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statsCards = [
    {
      title: "CLIENTES TOTALES",
      value: stats.clientes,
      icon: Users,
      color: "var(--neo-blue)",
      change: "+12%",
      link: createPageUrl("Clientes")
    },
    {
      title: "INSTRUCTORES ACTIVOS",
      value: stats.instructores,
      icon: UserCheck,
      color: "var(--neo-green)",
      change: "+3%",
      link: createPageUrl("Instructores")
    },
    {
      title: "CONTRATOS VIGENTES",
      value: stats.contratos,
      icon: FileText,
      color: "var(--neo-yellow)",
      change: "+8%",
      link: createPageUrl("Contratos")
    },
    {
      title: "GESTORÍAS REALIZADAS",
      value: stats.gestoriaVentas,
      icon: Building2,
      color: "var(--neo-pink)",
      change: "+15%",
      link: createPageUrl("GestoriaVentas")
    }
  ];

  const quickActions = [
    {
      title: "NUEVO CLIENTE",
      description: "Registrar cliente nuevo",
      icon: Users,
      color: "var(--neo-blue)",
      action: () => setShowQuickAction('cliente')
    },
    {
      title: "NUEVO CONTRATO",
      description: "Crear contrato de enseñanza",
      icon: FileText,
      color: "var(--neo-green)",
      action: () => setShowQuickAction('contrato')
    },
    {
      title: "GESTORÍA VENTA",
      description: "Nueva venta de gestoría",
      icon: Building2,
      color: "var(--neo-yellow)",
      action: () => setShowQuickAction('gestoria')
    }
  ];

  return (
    <div className="p-6 space-y-8 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-6xl font-black text-foreground uppercase mb-4">DASHBOARD</h1>
        <p className="text-xl font-bold text-muted-foreground uppercase tracking-wider">
          Sistema de Administración
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={stat.link}>
              <Card className="neo-card h-32 overflow-hidden relative hover:shadow-xl transition-all duration-300 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-black text-muted-foreground uppercase tracking-wider">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-black text-foreground">
                        {stats.loading ? '...' : stat.value}
                      </p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-bold text-green-600">{stat.change}</span>
                      </div>
                    </div>
                    <div
                      className="w-12 h-12 border-3 border-border neo-card flex items-center justify-center"
                      style={{ backgroundColor: stat.color }}
                    >
                      <stat.icon className="w-6 h-6 text-black" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Ingresos por Moneda */}
      {Object.entries(stats.ingresosPorMoneda).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl font-black text-foreground uppercase mb-6 text-center">
            INGRESOS DEL MES ACTUAL
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(stats.ingresosPorMoneda).map(([moneda, total], index) => (
              <motion.div
                key={moneda}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Card className="neo-card bg-[var(--neo-green)]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-black text-black uppercase">TOTAL {moneda}</p>
                        <p className="text-3xl font-black text-black">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: moneda
                          }).format(total)}
                        </p>
                      </div>
                      <CreditCard className="w-8 h-8 text-black" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="neo-card">
            <CardHeader className="border-b-4 border-border">
              <CardTitle className="text-xl font-black text-foreground uppercase flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                ACCIONES RÁPIDAS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={action.title}
                    onClick={action.action}
                    className="neo-button p-4 text-black hover:shadow-xl transition-all duration-300 text-left"
                    style={{ backgroundColor: action.color }}
                    disabled={isSubmitting}
                  >
                    <div className="flex items-center gap-3">
                      <action.icon className="w-6 h-6" />
                      <div>
                        <p className="font-black text-lg uppercase">{action.title}</p>
                        <p className="text-sm font-bold opacity-75">{action.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="neo-card">
            <CardHeader className="border-b-4 border-border">
              <CardTitle className="text-xl font-black text-foreground uppercase flex items-center gap-3">
                <AlertCircle className="w-6 h-6" />
                ESTADO DEL SISTEMA
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-secondary border-2 border-border">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-foreground text-sm">
                      Conectado a la API
                    </p>
                    <p className="text-xs text-muted-foreground font-bold uppercase">
                      Sistema Operativo
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-secondary border-2 border-border">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-foreground text-sm">
                      Caché Activo
                    </p>
                    <p className="text-xs text-muted-foreground font-bold uppercase">
                      Optimizando Rendimiento
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-secondary border-2 border-border">
                  <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-foreground text-sm">
                      Datos Sincronizados
                    </p>
                    <p className="text-xs text-muted-foreground font-bold uppercase">
                      Última actualización: Ahora
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* API Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-green-50 border-4 border-green-400 p-4 neo-card"
      >
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-black text-green-800 uppercase">CONECTADO A LA API</h3>
            <p className="text-sm font-bold text-green-700">
              Sistema optimizado con caché inteligente - {Object.keys(stats.ingresosPorMoneda).length} moneda(s) activa(s)
            </p>
          </div>
        </div>
      </motion.div>

      {/* Modal para Acciones Rápidas */}
      <AnimatePresence>
        {showQuickAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              {showQuickAction === 'cliente' && (
                <ClienteForm
                  cliente={null}
                  onSubmit={(data) => handleQuickActionSubmit(data, 'cliente')}
                  onCancel={() => setShowQuickAction(null)}
                />
              )}
              {showQuickAction === 'contrato' && (
                <ContratoForm
                  contrato={null}
                  onSubmit={(contratoData, bloquesData) => 
                    handleQuickActionSubmit({ ...contratoData, bloques: bloquesData }, 'contrato')
                  }
                  onCancel={() => setShowQuickAction(null)}
                />
              )}
              {showQuickAction === 'gestoria' && (
                <GestoriaVentaForm
                  gestoria={null}
                  onSubmit={(data) => handleQuickActionSubmit(data, 'gestoria')}
                  onCancel={() => setShowQuickAction(null)}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
