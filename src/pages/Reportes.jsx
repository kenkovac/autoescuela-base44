
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  DollarSign,
  AlertCircle,
  UserCheck,
  Building2
} from "lucide-react";
import { motion } from "framer-motion";
import ApiService from "../components/api/ApiService";

export default function Reportes() {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalContratos: 0,
    totalInstructores: 0,
    totalGestoriaVentas: 0,
    clientesDelMes: 0,
    contratosDelMes: 0,
    gestoriaVentasDelMes: 0,
    movimientosDelMes: [],
    ingresosPorMoneda: {},
    gastosPorMoneda: {},
    loading: true
  });

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      // Get current month date range
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const startDateStr = startOfMonth.toISOString().split('T')[0];
      const endDateStr = endOfMonth.toISOString().split('T')[0];

      // Fetch all data concurrently
      const [
        clientesRes,
        instructoresRes,
        contratosRes,
        gestoriaVentasRes,
        movimientosRes
      ] = await Promise.all([
        ApiService.getClientes({ limit: 10000, skipCache: true }),
        ApiService.getInstructores({ limit: 10000, skipCache: true }),
        ApiService.getContratos({ limit: 10000, skipCache: true }),
        ApiService.getGestoriaVentas({ limit: 10000, skipCache: true }),
        ApiService.getMovimientosContables({ limit: 10000, skipCache: true })
      ]);

      const clientes = clientesRes.data || [];
      const instructores = instructoresRes.data || [];
      const contratos = contratosRes.data || [];
      const gestoriaVentas = gestoriaVentasRes.data || [];
      const movimientos = movimientosRes.data || [];

      // Filter data for current month based on created_at
      const clientesDelMes = clientes.filter(c => {
        const createdAt = new Date(c.created_at);
        return createdAt >= startOfMonth && createdAt <= endOfMonth;
      });

      const contratosDelMes = contratos.filter(c => {
        const createdAt = new Date(c.created_at);
        return createdAt >= startOfMonth && createdAt <= endOfMonth;
      });

      const gestoriaVentasDelMes = gestoriaVentas.filter(g => {
        const createdAt = new Date(g.created_at);
        return createdAt >= startOfMonth && createdAt <= endOfMonth;
      });

      // Filter movimientos for current month based on 'fecha' field
      const movimientosDelMes = movimientos.filter(m => {
        const movimientoDate = new Date(m.fecha);
        return movimientoDate >= startOfMonth && movimientoDate <= endOfMonth;
      });

      // Calculate income and expenses by currency from current month's movements
      const ingresosPorMoneda = {};
      const gastosPorMoneda = {};

      movimientosDelMes.forEach(movimiento => {
        const moneda = movimiento.moneda || 'USD';
        
        // Para ingresos: tipo_movimiento 'ingreso' O cualquier movimiento con debe > 0
        if (movimiento.tipo_movimiento === 'ingreso' || parseFloat(movimiento.debe) > 0) {
          if (!ingresosPorMoneda[moneda]) ingresosPorMoneda[moneda] = 0;
          ingresosPorMoneda[moneda] += parseFloat(movimiento.debe) || 0;
        }
        
        // Para gastos: tipo_movimiento 'gasto' O cualquier movimiento con haber > 0
        if (movimiento.tipo_movimiento === 'gasto' || parseFloat(movimiento.haber) > 0) {
          if (!gastosPorMoneda[moneda]) gastosPorMoneda[moneda] = 0;
          gastosPorMoneda[moneda] += parseFloat(movimiento.haber) || 0;
        }
      });

      setStats({
        totalClientes: clientes.length,
        totalContratos: contratos.length,
        totalInstructores: instructores.length,
        totalGestoriaVentas: gestoriaVentas.length,
        clientesDelMes: clientesDelMes.length,
        contratosDelMes: contratosDelMes.length,
        gestoriaVentasDelMes: gestoriaVentasDelMes.length,
        movimientosDelMes,
        ingresosPorMoneda,
        gastosPorMoneda,
        loading: false
      });
    } catch (error) {
      console.error('Error loading report data:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const getCurrentMonthName = () => {
    return new Date().toLocaleDateString('es-ES', { 
      month: 'long', 
      year: 'numeric' 
    }).toUpperCase();
  };

  const getNetBalanceByMoneda = () => {
    const netBalance = {};
    const allMonedas = new Set([
      ...Object.keys(stats.ingresosPorMoneda),
      ...Object.keys(stats.gastosPorMoneda)
    ]);

    allMonedas.forEach(moneda => {
      const ingresos = stats.ingresosPorMoneda[moneda] || 0;
      const gastos = stats.gastosPorMoneda[moneda] || 0;
      netBalance[moneda] = ingresos - gastos;
    });

    return netBalance;
  };

  const netBalanceByMoneda = getNetBalanceByMoneda();

  return (
    <div className="p-6 space-y-8 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-5xl font-black text-foreground uppercase mb-4">
          REPORTES
        </h1>
        <p className="text-xl font-bold text-muted-foreground uppercase tracking-wider">
          Dashboard de Analytics y Estadísticas - {getCurrentMonthName()}
        </p>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="neo-card bg-[var(--neo-blue)]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-black text-black uppercase">TOTAL CLIENTES</p>
                  <p className="text-3xl font-black text-black">{stats.totalClientes}</p>
                  <p className="text-xs font-bold text-black/70 mt-1">
                    +{stats.clientesDelMes} este mes
                  </p>
                </div>
                <Users className="w-8 h-8 text-black" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="neo-card bg-[var(--neo-green)]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-black text-black uppercase">INSTRUCTORES</p>
                  <p className="text-3xl font-black text-black">{stats.totalInstructores}</p>
                  <p className="text-xs font-bold text-black/70 mt-1">activos</p>
                </div>
                <UserCheck className="w-8 h-8 text-black" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="neo-card bg-[var(--neo-yellow)]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-black text-black uppercase">TOTAL CONTRATOS</p>
                  <p className="text-3xl font-black text-black">{stats.totalContratos}</p>
                  <p className="text-xs font-bold text-black/70 mt-1">
                    +{stats.contratosDelMes} este mes
                  </p>
                </div>
                <FileText className="w-8 h-8 text-black" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="neo-card bg-[var(--neo-pink)]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-black text-black uppercase">GESTORÍAS</p>
                  <p className="text-3xl font-black text-black">{stats.totalGestoriaVentas}</p>
                  <p className="text-xs font-bold text-black/70 mt-1">
                    +{stats.gestoriaVentasDelMes} este mes
                  </p>
                </div>
                <Building2 className="w-8 h-8 text-black" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Financial Reports by Currency */}
      {Object.keys(stats.ingresosPorMoneda).length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="neo-card">
              <CardHeader className="border-b-4 border-border">
                <CardTitle className="text-xl font-black text-foreground uppercase flex items-center gap-3">
                  <TrendingUp className="w-6 h-6" />
                  INGRESOS DEL MES
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {Object.entries(stats.ingresosPorMoneda).map(([moneda, total]) => (
                  <div key={moneda} className="flex justify-between items-center p-4 bg-secondary neo-card border-2 border-border">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="font-black text-foreground uppercase">{moneda}</span>
                    </div>
                    <span className="text-xl font-black text-green-600">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: moneda
                      }).format(total)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="neo-card">
              <CardHeader className="border-b-4 border-border">
                <CardTitle className="text-xl font-black text-foreground uppercase flex items-center gap-3">
                  <TrendingDown className="w-6 h-6" />
                  GASTOS DEL MES
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {Object.keys(stats.gastosPorMoneda).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="font-bold text-muted-foreground uppercase">Sin gastos registrados</p>
                  </div>
                ) : (
                  Object.entries(stats.gastosPorMoneda).map(([moneda, total]) => (
                    <div key={moneda} className="flex justify-between items-center p-4 bg-secondary neo-card border-2 border-border">
                      <div className="flex items-center gap-3">
                        <TrendingDown className="w-5 h-5 text-red-600" />
                        <span className="font-black text-foreground uppercase">{moneda}</span>
                      </div>
                      <span className="text-xl font-black text-red-600">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: moneda
                        }).format(total)}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Net Balance by Currency */}
      {Object.keys(netBalanceByMoneda).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-3xl font-black text-foreground uppercase mb-6 text-center">
            BALANCE NETO DEL MES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(netBalanceByMoneda).map(([moneda, balance], index) => (
              <motion.div
                key={moneda}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <Card className={`neo-card ${balance >= 0 ? 'bg-[var(--neo-green)]' : 'bg-[var(--neo-red)]'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-black uppercase ${balance >= 0 ? 'text-black' : 'text-white'}`}>
                          BALANCE {moneda}
                        </p>
                        <p className={`text-3xl font-black ${balance >= 0 ? 'text-black' : 'text-white'}`}>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: moneda
                          }).format(Math.abs(balance))}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {balance >= 0 ? 
                            <TrendingUp className="w-3 h-3 text-black" /> : 
                            <TrendingDown className="w-3 h-3 text-white" />
                          }
                          <p className={`text-xs font-bold ${balance >= 0 ? 'text-black/70' : 'text-white/70'}`}>
                            {balance >= 0 ? 'Positivo' : 'Negativo'}
                          </p>
                        </div>
                      </div>
                      <BarChart3 className={`w-8 h-8 ${balance >= 0 ? 'text-black' : 'text-white'}`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Activity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-accent/10 border-4 border-accent p-6 neo-card"
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-accent" />
          <div>
            <h3 className="font-black text-foreground uppercase">RESUMEN DE ACTIVIDAD</h3>
            <p className="text-sm font-bold text-muted-foreground">
              {stats.movimientosDelMes.length} movimientos contables registrados este mes. 
              Sistema conectado y sincronizado.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
