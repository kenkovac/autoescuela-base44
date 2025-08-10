import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Printer } from "lucide-react";

export default function ContratoPDFExporter({ contrato, bloques, cliente, instructor }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
        return dateString;
    }
  };
  
  const formatHour12 = (hour24) => {
    if (!hour24) return '';
    const [hours, minutes] = hour24.split(':');
    if (isNaN(hours) || isNaN(minutes)) return '';
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };
  
  const generateHorariosRows = () => {
    // Si hay bloques específicos, úsalos
    if (bloques && bloques.length > 0) {
      return bloques.map(bloque => `
        <tr>
          <td>${['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'][bloque.dia_semana - 1] || 'N/A'}</td>
          <td>${formatHour12(bloque.hora_inicio)}</td>
          <td>${formatHour12(bloque.hora_fin)}</td>
          <td style="height: 30px; border: 1px solid #999;"></td>
          <td style="height: 30px; border: 1px solid #999;"></td>
        </tr>
      `).join('');
    }
    
    // Si no hay bloques pero hay horario genérico, crear 5 filas genéricas
    const horarioGenerico = contrato.horario || 'Por definir';
    const diasGenericos = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    
    return diasGenericos.map(dia => `
      <tr>
        <td>${dia}</td>
        <td colspan="2" style="text-align: center;">${horarioGenerico}</td>
        <td style="height: 30px; border: 1px solid #999;"></td>
        <td style="height: 30px; border: 1px solid #999;"></td>
      </tr>
    `).join('');
  };

  // Función para obtener datos del cliente (con fallback a propiedades del contrato)
  const getClienteData = () => {
    if (cliente && cliente.nombre) {
      return {
        nombre: cliente.nombre || 'N/A',
        telefono: cliente.telefono || contrato.telefono_cliente || 'N/A',
        documento: cliente.documento || contrato.documento_cliente || 'N/A',
        tipo_documento: cliente.tipo_documento || contrato.tipo_documento_cliente || 'V'
      };
    }
    
    // Fallback para contratos viejos
    return {
      nombre: contrato.nombre_cliente || contrato.cliente_nombre || 'N/A',
      telefono: contrato.telefono_cliente || 'N/A', 
      documento: contrato.documento_cliente || 'N/A',
      tipo_documento: contrato.tipo_documento_cliente || 'V'
    };
  };

  const generatePDF = () => {
    setIsGenerating(true);
    
    const clienteData = getClienteData();
    
    const pdfContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Contrato #${contrato.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
            body { 
              font-family: 'Roboto', Arial, sans-serif;
              font-size: 10px; 
              line-height: 1.4; 
              color: #333;
              background: white;
              margin: 0;
            }
            .page {
              padding: 2cm;
              width: 21cm;
              height: 29.7cm;
              box-sizing: border-box;
              position: relative;
              display: flex;
              flex-direction: column;
            }
            .header { 
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px; 
              margin-bottom: 20px;
            }
            .header-logos {
              flex: 0 0 60px;
            }
            .header-logos img {
              max-width: 100%;
              height: auto;
            }
            .header-text {
              text-align: center;
              flex-grow: 1;
            }
            .header-text h1, .header-text p {
              margin: 0;
              line-height: 1.2;
            }
            .header-text h1 {
              font-size: 14px;
              font-weight: 700;
            }
            .header-text p {
              font-size: 9px;
            }
            .section {
                border: 1px solid #ccc;
                padding: 10px;
                margin-bottom: 15px;
            }
            .section-title {
              font-size: 12px;
              font-weight: 700;
              margin: -10px -10px 10px -10px;
              padding: 5px 10px;
              background-color: #f2f2f2;
              border-bottom: 1px solid #ccc;
            }
            .info-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 5px 20px;
            }
            .info-item {
                display: flex;
            }
            .info-label {
                font-weight: 700;
                width: 100px;
                flex-shrink: 0;
            }
            .schedule-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
            }
            .schedule-table th, .schedule-table td {
                border: 1px solid #999;
                padding: 6px;
                text-align: left;
            }
            .schedule-table th {
                background-color: #e0e0e0;
                font-weight: 700;
            }
            .signature-section {
                margin-top: 30px;
                text-align: center;
            }
            .signature-section p {
                font-weight: 700;
                margin-bottom: 50px;
            }
            .signature-line {
                border-top: 1px solid #000;
                width: 250px;
                margin: 0 auto;
            }
            .terms-section {
                margin-top: 20px;
                font-size: 8px;
                text-align: justify;
                border-top: 1px solid #ccc;
                padding-top: 10px;
            }
            .terms-section h3 {
                font-size: 10px;
                text-align: center;
                margin-bottom: 5px;
            }
            .footer {
                position: absolute;
                bottom: 1cm;
                left: 2cm;
                right: 2cm;
                text-align: center;
                font-size: 9px;
                font-weight: 700;
                border-top: 1px solid #000;
                padding-top: 5px;
            }
            @media print {
              .page {
                margin: 0;
                padding: 1.5cm;
                box-shadow: none;
                border: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              <div class="header-logos">
                <img src="https://autoescuelaygestoriakovac.com.ve/img/logo/logoaut.png" alt="Logo Autoescuela" onerror="this.style.display='none';">
              </div>
              <div class="header-text">
                <h1>Autoescuela y Gestoría Kovac C.A.</h1>
                <p>RIF J-31703991-2</p>
                <p>Escuela de Transporte certificada INTT N° 220300736045</p>
                <p>Av. Ppal. del Bosque, Torre Credicard, Mini Centro Doral, Mezzanina, Local 56, Chacaíto - Tlf: (0414) 3150174 / (0414) 2584347</p>
              </div>
              <div class="header-logos">
                <img src="https://www.intt.gob.ve/inttweb/wp-content/uploads/2021/04/ET-01-1.png" alt="Logo INTT" onerror="this.style.display='none';">
              </div>
            </div>

            <div class="section">
                <div class="section-title">Datos Generales del Contrato</div>
                <div class="info-grid">
                    <div class="info-item"><span class="info-label">Contrato Nro:</span> ${contrato.id}</div>
                    <div class="info-item"><span class="info-label">Fecha:</span> ${formatDate(new Date())}</div>
                    <div class="info-item"><span class="info-label">Monto:</span> ${contrato.total} ${contrato.moneda}</div>
                    <div class="info-item"><span class="info-label">Método de Pago:</span> ${contrato.metodo_pago || ''}</div>
                    <div class="info-item"><span class="info-label">Tipo de Pago:</span> ${contrato.tipo_pago || ''}</div>
                    <div class="info-item"><span class="info-label">Método de Clase:</span> ${contrato.metodo_clase || ''}</div>
                    <div class="info-item"><span class="info-label">Modo de Clase:</span> ${contrato.modo_clase || ''}</div>
                    <div class="info-item"><span class="info-label">Punto de Encuentro:</span> ${contrato.punto_encuentro || ''}</div>
                    <div class="info-item" style="grid-column: 1 / -1;"><span class="info-label">Notas:</span> ${contrato.notas || ''}</div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Datos del Instructor</div>
                <div class="info-grid">
                    <div class="info-item"><span class="info-label">Nombre:</span> ${instructor?.nombre || ''}</div>
                    <div class="info-item"><span class="info-label">Teléfono:</span> ${instructor?.telefono || ''}</div>
                    <div class="info-item"><span class="info-label">Marca:</span> ${instructor?.marca_vehiculo || ''}</div>
                    <div class="info-item"><span class="info-label">Modelo:</span> ${instructor?.modelo_vehiculo || ''}</div>
                    <div class="info-item"><span class="info-label">Placa:</span> ${instructor?.placa_vehiculo || ''}</div>
                    <div class="info-item"><span class="info-label">Color:</span> ${instructor?.color_vehiculo || ''}</div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Datos del Alumno</div>
                <div class="info-grid">
                    <div class="info-item"><span class="info-label">Nombre:</span> ${clienteData.nombre}</div>
                    <div class="info-item"><span class="info-label">Teléfono:</span> ${clienteData.telefono}</div>
                    <div class="info-item" style="grid-column: 1 / -1;"><span class="info-label">Cédula:</span> ${clienteData.tipo_documento} - ${clienteData.documento}</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Horario de Clases</div>
                <p><strong>Fecha de Inicio:</strong> ${formatDate(contrato.fecha_inicio)}</p>
                <table class="schedule-table">
                  <thead>
                    <tr>
                      <th>Día</th>
                      <th>Hora Inicio</th>
                      <th>Hora Fin</th>
                      <th>Firma Alumno</th>
                      <th>Firma Instructor</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${generateHorariosRows()}
                  </tbody>
                </table>
            </div>

            <div class="signature-section">
                <p>HAGO CONSTAR QUE HE RECIBIDO EL CURSO DE MANEJO PRÁCTICO A MI ENTERA SATISFACCIÓN.</p>
                <div class="signature-line"></div>
            </div>

            <div class="terms-section">
                <h3>Términos y Condiciones</h3>
                <p>
                La asistencia a clases es obligatoria. Las clases se realizan a la hora y días fijados. En caso de inasistencia del alumno, se entiende por vista la clase. El pago del curso debe estar completo previo a dicho contrato. En caso de saldo restante se deberá cancelar el primer día de clases. Las clases de manejo serán de hora y media (1 ½) por día, es decir, 45 minutos c/u., que empezarán cuando el alumno se monte en el vehículo, hasta que se baje del mismo.
                </p>
            </div>
            
            <div class="footer">
              Contrato de Clases (Original)
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      printWindow.focus();
      // Pequeña demora para asegurar que todo el contenido (incluyendo imágenes) se cargue
      setTimeout(() => {
        printWindow.print();
        // Opcional: printWindow.close();
      }, 500);
    } else {
      alert("Por favor, habilita las ventanas emergentes para imprimir el contrato.");
    }

    setIsGenerating(false);
  };

  return (
    <Button 
      onClick={generatePDF} 
      disabled={isGenerating}
      className="neo-button bg-accent text-black w-full"
    >
      {isGenerating ? "GENERANDO..." : (
        <>
          <Printer className="w-4 h-4 mr-2"/>
          IMPRIMIR CONTRATO
        </>
      )}
    </Button>
  );
}