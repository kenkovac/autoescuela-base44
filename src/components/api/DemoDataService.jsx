// Servicio de datos de demostración para desarrollo
class DemoDataService {
  constructor() {
    this.initializeData();
  }

  initializeData() {
    // Solo inicializar si no existen datos
    if (!localStorage.getItem('demo_clientes')) {
      // Datos de clientes de demostración
      const clientes = [
        {
          id: 1,
          nombre: "Juan Pérez González",
          correo: "juan.perez@email.com",
          telefono: "+57 300 1234567",
          cedula: "1234567890",
          fecha_nacimiento: "1990-05-15",
          tipo_licencia: "B",
          estado: "activo",
          contacto_emergencia_nombre: "María Pérez",
          contacto_emergencia_telefono: "+57 300 7654321",
          notas: "Cliente muy responsable y puntual",
          created_date: "2024-01-15T10:00:00Z",
          updated_date: "2024-01-15T10:00:00Z"
        },
        {
          id: 2,
          nombre: "María García López",
          correo: "maria.garcia@email.com",
          telefono: "+57 310 9876543",
          cedula: "0987654321",
          fecha_nacimiento: "1985-08-20",
          tipo_licencia: "A1",
          estado: "completado",
          contacto_emergencia_nombre: "Carlos García",
          contacto_emergencia_telefono: "+57 310 1111111",
          notas: "Completó el curso exitosamente",
          created_date: "2024-01-10T09:00:00Z",
          updated_date: "2024-02-15T16:00:00Z"
        },
        {
          id: 3,
          nombre: "Carlos Rodríguez Mesa",
          correo: "carlos.rodriguez@email.com",
          telefono: "+57 320 5555555",
          cedula: "5555555555",
          fecha_nacimiento: "1992-12-03",
          tipo_licencia: "C",
          estado: "suspendido",
          contacto_emergencia_nombre: "Ana Rodríguez",
          contacto_emergencia_telefono: "+57 320 6666666",
          notas: "Suspendido por faltas repetidas",
          created_date: "2024-01-20T14:00:00Z",
          updated_date: "2024-02-01T11:00:00Z"
        }
      ];

      // Datos de instructores de demostración
      const instructores = [
        {
          id: 1,
          nombre: "Roberto Silva Martínez",
          telefono: "+57 300 1111111",
          email: "roberto.silva@autoescuela.com",
          photo_perfil: "https://ui-avatars.com/api/?name=Roberto+Silva&background=3b82f6&color=fff&size=200",
          photo_vehicle: "https://placehold.co/300x200/10b981/fff/png?text=Veh%C3%ADculo+1",
          placa_vehiculo: "ABC-123",
          marca_vehiculo: "Chevrolet",
          modelo_vehiculo: "Spark GT",
          color_vehiculo: "Blanco",
          estado: "activo",
          created_date: "2023-12-01T08:00:00Z",
          updated_date: "2024-01-15T08:00:00Z"
        },
        {
          id: 2,
          nombre: "Laura Mendoza Castro",
          telefono: "+57 310 2222222",
          email: "laura.mendoza@autoescuela.com",
          photo_perfil: "https://ui-avatars.com/api/?name=Laura+Mendoza&background=ec4899&color=fff&size=200",
          photo_vehicle: "https://placehold.co/300x200/f59e0b/fff/png?text=Veh%C3%ADculo+2",
          placa_vehiculo: "DEF-456",
          marca_vehiculo: "Nissan",
          modelo_vehiculo: "March",
          color_vehiculo: "Rojo",
          estado: "activo",
          created_date: "2023-11-15T08:00:00Z",
          updated_date: "2024-01-10T08:00:00Z"
        },
        {
          id: 3,
          nombre: "Miguel Torres Vargas",
          telefono: "+57 320 3333333",
          email: "miguel.torres@autoescuela.com",
          photo_perfil: "https://ui-avatars.com/api/?name=Miguel+Torres&background=10b981&color=fff&size=200",
          photo_vehicle: "https://placehold.co/300x200/ef4444/fff/png?text=Veh%C3%ADculo+3",
          placa_vehiculo: "GHI-789",
          marca_vehiculo: "Hyundai",
          modelo_vehiculo: "i10",
          color_vehiculo: "Azul",
          estado: "inactivo",
          created_date: "2023-10-01T08:00:00Z",
          updated_date: "2023-12-20T08:00:00Z"
        }
      ];

      // Datos de contratos de demostración
      const contratos = [
        {
          id: 1,
          numero: "CT-001-2024",
          cliente_id: 1,
          cliente_nombre: "Juan Pérez González",
          fk_instructor: 1,
          instructor_nombre: "Roberto Silva Martínez",
          total: 650000,
          horario: "Lunes a Viernes 8:00-12:00",
          fecha_inicio: "2024-01-20",
          fecha_fin: "2024-03-20",
          metodo_pago: "transferencia",
          tipo_pago: "cuotas",
          metodo_clase: "presencial",
          punto_encuentro: "Sede Principal - Calle 15 #20-30",
          modo_clase: "individual",
          estado: "activo",
          notas: "Cliente prefiere clases matutinas",
          created_date: "2024-01-15T10:00:00Z",
          updated_date: "2024-01-15T10:00:00Z"
        },
        {
          id: 2,
          numero: "CT-002-2024",
          cliente_id: 2,
          cliente_nombre: "María García López",
          fk_instructor: 2,
          instructor_nombre: "Laura Mendoza Castro",
          total: 480000,
          horario: "Martes y Jueves 14:00-18:00",
          fecha_inicio: "2024-01-10",
          fecha_fin: "2024-02-28",
          metodo_pago: "efectivo",
          tipo_pago: "contado",
          metodo_clase: "presencial",
          punto_encuentro: "Sede Norte - Carrera 50 #80-20",
          modo_clase: "individual",
          estado: "finalizado",
          notas: "Curso completado exitosamente",
          created_date: "2024-01-05T14:00:00Z",
          updated_date: "2024-02-28T16:00:00Z"
        },
        {
          id: 3,
          numero: "CT-003-2024",
          cliente_id: 3,
          cliente_nombre: "Carlos Rodríguez Mesa",
          fk_instructor: 1,
          instructor_nombre: "Roberto Silva Martínez",
          total: 750000,
          horario: "Sábados 9:00-17:00",
          fecha_inicio: "2024-01-22",
          fecha_fin: "2024-04-22",
          metodo_pago: "tarjeta",
          tipo_pago: "mensual",
          metodo_clase: "presencial",
          punto_encuentro: "Sede Principal - Calle 15 #20-30",
          modo_clase: "individual",
          estado: "suspendido",
          notas: "Suspendido por faltas del estudiante",
          created_date: "2024-01-18T09:00:00Z",
          updated_date: "2024-02-01T11:00:00Z"
        }
      ];

      // Datos de gestoria ventas de demostración
      const gestoriaVentas = [
        {
          id: 1,
          cliente_nombre: "Ana Sofía Ramírez",
          cliente_cedula: "1111111111",
          cliente_telefono: "+57 300 4444444",
          tipo_servicio: "duplicado",
          categoria_licencia: "B",
          fecha_solicitud: "2024-01-25",
          fecha_entrega: "2024-02-10",
          total_venta: 85000,
          estado: "completado",
          notas: "Duplicado por pérdida de documento",
          created_date: "2024-01-25T10:30:00Z",
          updated_date: "2024-02-10T15:00:00Z"
        },
        {
          id: 2,
          cliente_nombre: "Diego Fernando Castillo",
          cliente_cedula: "2222222222",
          cliente_telefono: "+57 310 5555555",
          tipo_servicio: "renovacion",
          categoria_licencia: "A1",
          fecha_solicitud: "2024-01-28",
          fecha_entrega: "2024-02-15",
          total_venta: 120000,
          estado: "en_proceso",
          notas: "Renovación por vencimiento",
          created_date: "2024-01-28T11:15:00Z",
          updated_date: "2024-02-01T09:00:00Z"
        },
        {
          id: 3,
          cliente_nombre: "Patricia Morales Jiménez",
          cliente_cedula: "3333333333",
          cliente_telefono: "+57 320 6666666",
          tipo_servicio: "primera_vez",
          categoria_licencia: "C",
          fecha_solicitud: "2024-02-01",
          fecha_entrega: "2024-02-20",
          total_venta: 200000,
          estado: "pendiente",
          notas: "Primera licencia de conducir",
          created_date: "2024-02-01T16:45:00Z",
          updated_date: "2024-02-01T16:45:00Z"
        }
      ];

      // Datos de movimientos contables de demostración
      const movimientosContables = [
        {
          id: 1,
          fecha: "2024-01-15",
          descripcion: "Pago contrato CT-001-2024 - Juan Pérez González",
          debe: 650000,
          haber: 0,
          saldo: 650000,
          tipo_movimiento: "contrato",
          referencia_id: "1",
          estado: "confirmado",
          created_date: "2024-01-15T10:00:00Z"
        },
        {
          id: 2,
          fecha: "2024-01-10",
          descripcion: "Pago contrato CT-002-2024 - María García López",
          debe: 480000,
          haber: 0,
          saldo: 1130000,
          tipo_movimiento: "contrato",
          referencia_id: "2",
          estado: "confirmado",
          created_date: "2024-01-10T14:00:00Z"
        },
        {
          id: 3,
          descripcion: "Venta gestoría duplicado - Ana Sofía Ramírez",
          fecha: "2024-01-25",
          debe: 85000,
          haber: 0,
          saldo: 1215000,
          tipo_movimiento: "gestoria",
          referencia_id: "1",
          estado: "confirmado",
          created_date: "2024-01-25T10:30:00Z"
        },
        {
          id: 4,
          fecha: "2024-01-30",
          descripcion: "Pago combustible vehículos",
          debe: 0,
          haber: 150000,
          saldo: 1065000,
          tipo_movimiento: "gasto",
          referencia_id: null,
          estado: "confirmado",
          created_date: "2024-01-30T17:00:00Z"
        }
      ];

      // Guardar en localStorage
      localStorage.setItem('demo_clientes', JSON.stringify(clientes));
      localStorage.setItem('demo_instructores', JSON.stringify(instructores));
      localStorage.setItem('demo_contratos', JSON.stringify(contratos));
      localStorage.setItem('demo_gestoria_ventas', JSON.stringify(gestoriaVentas));
      localStorage.setItem('demo_movimientos_contables', JSON.stringify(movimientosContables));
    }
  }

  // Métodos para obtener datos
  getClientes() {
    return JSON.parse(localStorage.getItem('demo_clientes') || '[]');
  }

  getCliente(id) {
    const clientes = this.getClientes();
    return clientes.find(c => c.id === parseInt(id));
  }

  createCliente(clienteData) {
    const clientes = this.getClientes();
    const newCliente = {
      ...clienteData,
      id: Date.now(),
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    };
    clientes.push(newCliente);
    localStorage.setItem('demo_clientes', JSON.stringify(clientes));
    return newCliente;
  }

  updateCliente(id, clienteData) {
    const clientes = this.getClientes();
    const index = clientes.findIndex(c => c.id === parseInt(id));
    if (index !== -1) {
      clientes[index] = {
        ...clientes[index],
        ...clienteData,
        updated_date: new Date().toISOString()
      };
      localStorage.setItem('demo_clientes', JSON.stringify(clientes));
      return clientes[index];
    }
    throw new Error('Cliente no encontrado');
  }

  deleteCliente(id) {
    const clientes = this.getClientes();
    const filtered = clientes.filter(c => c.id !== parseInt(id));
    localStorage.setItem('demo_clientes', JSON.stringify(filtered));
    return { message: 'Cliente eliminado exitosamente' };
  }

  // Métodos para instructores
  getInstructores() {
    return JSON.parse(localStorage.getItem('demo_instructores') || '[]');
  }

  getInstructor(id) {
    const instructores = this.getInstructores();
    return instructores.find(i => i.id === parseInt(id));
  }

  createInstructor(instructorData) {
    const instructores = this.getInstructores();
    const newInstructor = {
      ...instructorData,
      id: Date.now(),
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    };
    instructores.push(newInstructor);
    localStorage.setItem('demo_instructores', JSON.stringify(instructores));
    return newInstructor;
  }

  updateInstructor(id, instructorData) {
    const instructores = this.getInstructores();
    const index = instructores.findIndex(i => i.id === parseInt(id));
    if (index !== -1) {
      instructores[index] = {
        ...instructores[index],
        ...instructorData,
        updated_date: new Date().toISOString()
      };
      localStorage.setItem('demo_instructores', JSON.stringify(instructores));
      return instructores[index];
    }
    throw new Error('Instructor no encontrado');
  }

  deleteInstructor(id) {
    const instructores = this.getInstructores();
    const filtered = instructores.filter(i => i.id !== parseInt(id));
    localStorage.setItem('demo_instructores', JSON.stringify(filtered));
    return { message: 'Instructor eliminado exitosamente' };
  }

  // Métodos para contratos
  getContratos() {
    return JSON.parse(localStorage.getItem('demo_contratos') || '[]');
  }

  createContrato(contratoData) {
    const contratos = this.getContratos();
    const newContrato = {
      ...contratoData,
      id: Date.now(),
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    };
    contratos.push(newContrato);
    localStorage.setItem('demo_contratos', JSON.stringify(contratos));

    // Crear movimiento contable automáticamente
    this.createMovimientoContable({
      fecha: new Date().toISOString().split('T')[0],
      descripcion: `Pago contrato ${newContrato.numero} - ${contratoData.cliente_nombre}`,
      debe: contratoData.total,
      haber: 0,
      tipo_movimiento: "contrato",
      referencia_id: newContrato.id.toString(),
      estado: "confirmado"
    });

    return newContrato;
  }

  updateContrato(id, contratoData) {
    const contratos = this.getContratos();
    const index = contratos.findIndex(c => c.id === parseInt(id));
    if (index !== -1) {
      contratos[index] = {
        ...contratos[index],
        ...contratoData,
        updated_date: new Date().toISOString()
      };
      localStorage.setItem('demo_contratos', JSON.stringify(contratos));
      return contratos[index];
    }
    throw new Error('Contrato no encontrado');
  }

  deleteContrato(id) {
    const contratos = this.getContratos();
    const filtered = contratos.filter(c => c.id !== parseInt(id));
    localStorage.setItem('demo_contratos', JSON.stringify(filtered));
    return { message: 'Contrato eliminado exitosamente' };
  }

  // Métodos para gestoria ventas
  getGestoriaVentas() {
    return JSON.parse(localStorage.getItem('demo_gestoria_ventas') || '[]');
  }

  createGestoriaVenta(gestoriaData) {
    const gestoriaVentas = this.getGestoriaVentas();
    const newGestoria = {
      ...gestoriaData,
      id: Date.now(),
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    };
    gestoriaVentas.push(newGestoria);
    localStorage.setItem('demo_gestoria_ventas', JSON.stringify(gestoriaVentas));

    // Crear movimiento contable automáticamente
    this.createMovimientoContable({
      fecha: new Date().toISOString().split('T')[0],
      descripcion: `Venta gestoría ${gestoriaData.tipo_servicio} - ${gestoriaData.cliente_nombre}`,
      debe: gestoriaData.total_venta,
      haber: 0,
      tipo_movimiento: "gestoria",
      referencia_id: newGestoria.id.toString(),
      estado: "confirmado"
    });

    return newGestoria;
  }

  updateGestoriaVenta(id, gestoriaData) {
    const gestoriaVentas = this.getGestoriaVentas();
    const index = gestoriaVentas.findIndex(g => g.id === parseInt(id));
    if (index !== -1) {
      gestoriaVentas[index] = {
        ...gestoriaVentas[index],
        ...gestoriaData,
        updated_date: new Date().toISOString()
      };
      localStorage.setItem('demo_gestoria_ventas', JSON.stringify(gestoriaVentas));
      return gestoriaVentas[index];
    }
    throw new Error('Gestoria venta no encontrada');
  }

  deleteGestoriaVenta(id) {
    const gestoriaVentas = this.getGestoriaVentas();
    const filtered = gestoriaVentas.filter(g => g.id !== parseInt(id));
    localStorage.setItem('demo_gestoria_ventas', JSON.stringify(filtered));
    return { message: 'Gestoria venta eliminada exitosamente' };
  }

  // Métodos para movimientos contables
  getMovimientosContables() {
    return JSON.parse(localStorage.getItem('demo_movimientos_contables') || '[]');
  }

  getMovimientosContratoId(contratoId) {
    const movimientos = this.getMovimientosContables();
    return movimientos.filter(m => m.tipo_movimiento === 'contrato' && m.referencia_id === contratoId.toString());
  }

  getMovimientosGestoriaId(gestoriaId) {
    const movimientos = this.getMovimientosContables();
    return movimientos.filter(m => m.tipo_movimiento === 'gestoria' && m.referencia_id === gestoriaId.toString());
  }

  createMovimientoContable(movimientoData) {
    const movimientos = this.getMovimientosContables();
    const newMovimiento = {
      ...movimientoData,
      id: Date.now(),
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    };

    // Calcular saldo
    const ultimoSaldo = movimientos.length > 0 ? 
      movimientos[movimientos.length - 1].saldo : 0;
    newMovimiento.saldo = ultimoSaldo + (movimientoData.debe || 0) - (movimientoData.haber || 0);

    movimientos.push(newMovimiento);
    localStorage.setItem('demo_movimientos_contables', JSON.stringify(movimientos));
    return newMovimiento;
  }

  updateMovimientoContable(id, movimientoData) {
    const movimientos = this.getMovimientosContables();
    const index = movimientos.findIndex(m => m.id === parseInt(id));
    if (index !== -1) {
      movimientos[index] = {
        ...movimientos[index],
        ...movimientoData,
        updated_date: new Date().toISOString()
      };
      localStorage.setItem('demo_movimientos_contables', JSON.stringify(movimientos));
      return movimientos[index];
    }
    throw new Error('Movimiento contable no encontrado');
  }

  deleteMovimientoContable(id) {
    const movimientos = this.getMovimientosContables();
    const filtered = movimientos.filter(m => m.id !== parseInt(id));
    localStorage.setItem('demo_movimientos_contables', JSON.stringify(filtered));
    return { message: 'Movimiento contable eliminado exitosamente' };
  }

  // Método para limpiar todos los datos (útil para testing)
  clearAllData() {
    localStorage.removeItem('demo_clientes');
    localStorage.removeItem('demo_instructores');
    localStorage.removeItem('demo_contratos');
    localStorage.removeItem('demo_gestoria_ventas');
    localStorage.removeItem('demo_movimientos_contables');
    this.initializeData();
  }

  // Método para upload de fotos (simulado)
  async uploadPhoto(type, file) {
    // Simular delay de upload
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          url: `https://ui-avatars.com/api/?name=${encodeURIComponent(file.name)}&background=random&size=300`
        });
      }, 1000);
    });
  }
}

export default new DemoDataService();