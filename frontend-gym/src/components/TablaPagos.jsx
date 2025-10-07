'use client';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { usePagination } from '../hooks/usePagination';
import { SearchBar, Pagination } from './ui';
import '../styles/tables.css';
import '../styles/modals.css';

export default function TablaPagos() {
  const [pagos, setPagos] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [membresias, setMembresias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPago, setEditingPago] = useState(null);
  
  // Estados para exportación
  const [showExportModal, setShowExportModal] = useState(false);
  const [filtroFecha, setFiltroFecha] = useState('todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoExportacion, setTipoExportacion] = useState('pdf');

  // Función de búsqueda específica para pagos
  const searchPagos = (data, searchTerm) => {
    if (!usuarios.length || !membresias.length || !registros.length) {
      // Si no están cargados los datos relacionados, búsqueda simple
      const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
      return data.filter(pago => {
        const searchableFields = [
          pago.id_pago?.toString() || '',
          pago.monto_pagado?.toString() || '',
          pago.estado_pago || '',
          pago.id_registro?.toString() || '',
          new Date(pago.fecha_pago).toLocaleDateString() || ''
        ].map(field => field.toString().toLowerCase());
        
        const searchableText = searchableFields.join(' ');
        return searchWords.every(word => searchableText.includes(word));
      });
    }
    
    // Búsqueda avanzada con datos relacionados
    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
    
    return data.filter(pago => {
      const registro = registros.find(r => r.id_registro === pago.id_registro);
      const usuario = registro ? usuarios.find(u => u.id_usuario === registro.id_usuario) : null;
      const membresia = registro ? membresias.find(m => m.id_membresia === registro.id_membresia) : null;
      
      const usuarioNombre = usuario ? `${usuario.nombre} ${usuario.apellido}` : '';
      const membresiaTipo = membresia ? membresia.tipo : '';
      
      const searchableFields = [
        pago.id_pago?.toString() || '',
        pago.monto_pagado?.toString() || '',
        pago.estado_pago || '',
        usuarioNombre,
        membresiaTipo,
        new Date(pago.fecha_pago).toLocaleDateString() || '',
        pago.id_registro?.toString() || ''
      ].map(field => field.toString().toLowerCase());
      
      const searchableText = searchableFields.join(' ');
      return searchWords.every(word => searchableText.includes(word));
    });
  };

  // Hook de paginación y búsqueda con función personalizada
  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    searchTerm,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
    handleSearch
  } = usePagination(pagos, 8, searchPagos);
  
  const [formData, setFormData] = useState({
    id_registro: '',
    fecha_pago: '',
    monto_pagado: '',
    estado_pago: 'Pendiente'
  });

  useEffect(() => {
    fetchPagos();
    fetchRegistros();
    fetchUsuarios();
    fetchMembresias();
  }, []);

  const fetchPagos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pagos');
      setPagos(res.data);
      setError('');
    } catch (err) {
      setError('Error al cargar pagos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistros = async () => {
    try {
      const res = await api.get('/registro-membresias');
      setRegistros(res.data);
    } catch (err) {
      console.error('Error al cargar registros:', err);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  };

  const fetchMembresias = async () => {
    try {
      const res = await api.get('/membresias');
      setMembresias(res.data);
    } catch (err) {
      console.error('Error al cargar membresías:', err);
    }
  };

  const getRegistroInfo = (idRegistro) => {
    const registro = registros.find(r => r.id_registro === idRegistro);
    if (!registro) return { usuario: 'N/A', membresia: 'N/A', precio: 'N/A' };

    const usuario = usuarios.find(u => u.id_usuario === registro.id_usuario);
    const membresia = membresias.find(m => m.id_membresia === registro.id_membresia);

    return {
      usuario: usuario ? `${usuario.nombre} ${usuario.apellido}` : 'N/A',
      membresia: membresia ? membresia.tipo : 'N/A',
      precio: membresia ? membresia.precio : 'N/A'
    };
  };

  const calcularTotalPagos = () => {
    return pagos.reduce((total, pago) => total + parseFloat(pago.monto_pagado || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingPago) {
        await api.put(`/pagos/${editingPago.id_pago}`, formData);
        setSuccess('Pago actualizado exitosamente');
      } else {
        await api.post('/pagos', formData);
        setSuccess('Pago registrado exitosamente');
      }
      
      fetchPagos();
      closeModal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al guardar pago');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este pago?')) {
      try {
        await api.delete(`/pagos/${id}`);
        setSuccess('Pago eliminado exitosamente');
        fetchPagos();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Error al eliminar pago');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const openCreateModal = () => {
    setEditingPago(null);
    setFormData({
      id_registro: '',
      fecha_pago: new Date().toISOString().split('T')[0],
      monto_pagado: '',
      estado_pago: 'Pendiente'
    });
    setShowModal(true);
  };

  const openEditModal = (pago) => {
    setEditingPago(pago);
    setFormData({
      id_registro: pago.id_registro || '',
      fecha_pago: pago.fecha_pago ? pago.fecha_pago.split('T')[0] : '',
      monto_pagado: pago.monto_pagado || '',
      estado_pago: pago.estado_pago || 'Pendiente'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPago(null);
    setError('');
  };

  // Función para filtrar pagos por fecha
  const filtrarPagosPorFecha = () => {
    let pagosFiltrados = [...pagos];
    const hoy = new Date();

    switch (filtroFecha) {
      case 'semana':
        const semanaAtras = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
        pagosFiltrados = pagos.filter(pago => 
          new Date(pago.fecha_pago) >= semanaAtras && new Date(pago.fecha_pago) <= hoy
        );
        break;
      case 'mes':
        const mesAtras = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());
        pagosFiltrados = pagos.filter(pago => 
          new Date(pago.fecha_pago) >= mesAtras && new Date(pago.fecha_pago) <= hoy
        );
        break;
      case 'personalizado':
        if (fechaInicio && fechaFin) {
          pagosFiltrados = pagos.filter(pago => {
            const fechaPago = new Date(pago.fecha_pago);
            return fechaPago >= new Date(fechaInicio) && fechaPago <= new Date(fechaFin);
          });
        }
        break;
      default:
        break;
    }

    return pagosFiltrados;
  };

  // Función para exportar a PDF
  const exportarPDF = () => {
    const pagosFiltrados = filtrarPagosPorFecha();
    const totalRecaudado = pagosFiltrados.reduce((sum, pago) => sum + parseFloat(pago.monto_pagado), 0);
    
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Reporte de Pagos - Gimnasio', 20, 20);

    doc.setFontSize(12);
    let textoFiltro = '';
    switch (filtroFecha) {
      case 'semana':
        textoFiltro = 'Filtro: Última semana';
        break;
      case 'mes':
        textoFiltro = 'Filtro: Último mes';
        break;
      case 'personalizado':
        textoFiltro = `Filtro: ${fechaInicio} a ${fechaFin}`;
        break;
      default:
        textoFiltro = 'Filtro: Todos los tiempos';
    }
    doc.text(textoFiltro, 20, 35);
    doc.text(`Total de pagos: ${pagosFiltrados.length}`, 20, 45);
    doc.text(`Total recaudado: $${totalRecaudado.toFixed(2)}`, 20, 55);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 20, 65);

    const tableData = pagosFiltrados.map(pago => {
      const registroInfo = getRegistroInfo(pago.id_registro);
      return [
        pago.id_pago,
        registroInfo.usuario,
        registroInfo.membresia,
        new Date(pago.fecha_pago).toLocaleDateString(),
        `$${parseFloat(pago.monto_pagado).toFixed(2)}`,
        pago.estado_pago
      ];
    });

    autoTable(doc, {
      head: [['ID', 'Cliente', 'Membresía', 'Fecha Pago', 'Monto', 'Estado']],
      body: tableData,
      startY: 75,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [99, 102, 241] }
    });

    const fechaArchivo = new Date().toISOString().split('T')[0];
    doc.save(`pagos_${filtroFecha}_${fechaArchivo}.pdf`);

    setShowExportModal(false);
    setSuccess('PDF exportado exitosamente');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Función para exportar a Excel
  const exportarExcel = () => {
    const pagosFiltrados = filtrarPagosPorFecha();
    const totalRecaudado = pagosFiltrados.reduce((sum, pago) => sum + parseFloat(pago.monto_pagado), 0);
    
    const datosExcel = pagosFiltrados.map(pago => {
      const registroInfo = getRegistroInfo(pago.id_registro);
      return {
        'ID Pago': pago.id_pago,
        'ID Registro': pago.id_registro,
        'Cliente': registroInfo.usuario,
        'Tipo Membresía': registroInfo.membresia,
        'Precio Membresía': registroInfo.precio ? `$${registroInfo.precio}` : 'N/A',
        'Fecha de Pago': new Date(pago.fecha_pago).toLocaleDateString(),
        'Monto Pagado': parseFloat(pago.monto_pagado).toFixed(2),
        'Estado del Pago': pago.estado_pago
      };
    });

    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pagos');

    const fechaArchivo = new Date().toISOString().split('T')[0];
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `pagos_${filtroFecha}_${fechaArchivo}.xlsx`);

    setShowExportModal(false);
    setSuccess('Excel exportado exitosamente');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleExportar = () => {
    if (tipoExportacion === 'pdf') {
      exportarPDF();
    } else {
      exportarExcel();
    }
  };

  return (
    <div className="table-container h-full flex flex-col relative">
      {/* Header */}
      <div className="table-header flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="table-title">Gestión de Pagos</h2>
          <div className="stats-number text-lg">{totalItems}</div>
          <span className="text-sm text-purple-300">
            {searchTerm ? 'resultados encontrados' : 'pagos registrados'}
          </span>
          <div className="text-sm text-cyan-400 font-medium">
            Total: ${calcularTotalPagos().toFixed(2)}
          </div>
        </div>
        <div className="table-actions">
          <button
            onClick={() => setShowExportModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar
          </button>
          <button
            onClick={fetchPagos}
            disabled={loading}
            className="btn-secondary flex items-center gap-2"
          >
            {loading ? (
              <div className="loading-spinner w-4 h-4"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Refrescar
          </button>
          <button
            onClick={openCreateModal}
            className="btn-primary"
          >
            + Registrar Pago
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="px-6 py-4 border-b border-purple-700/30">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          placeholder="Buscar por cliente, membresía, monto, estado..."
          className="max-w-md"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 alert alert-error">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mx-6 mt-4 alert alert-success">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && pagos.length === 0 && (
        <div className="px-6 py-8 text-center flex-1 flex items-center justify-center">
          <div>
            <div className="loading-spinner mx-auto mb-3"></div>
            <p className="text-purple-300">Cargando datos...</p>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="table-wrapper flex-1">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente y Membresía</th>
                <th>Fecha Pago</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="text-purple-300">
                      {searchTerm ? 'No se encontraron pagos que coincidan con la búsqueda' : 'No hay pagos registrados'}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((pago) => {
                  const registroInfo = getRegistroInfo(pago.id_registro);
                  return (
                    <tr key={pago.id_pago}>
                      <td>{pago.id_pago}</td>
                      <td>
                        <div className="font-medium text-white">
                          {registroInfo.usuario}
                        </div>
                        <div className="text-sm text-purple-300">
                          {registroInfo.membresia}
                        </div>
                        <div className="text-xs text-gray-500">
                          Registro #{pago.id_registro}
                        </div>
                      </td>
                      <td>{new Date(pago.fecha_pago).toLocaleDateString()}</td>
                      <td className="font-medium text-cyan-400">
                        ${parseFloat(pago.monto_pagado).toFixed(2)}
                      </td>
                      <td>
                        <span className={`status-badge ${
                          pago.estado_pago === 'Completo' ? 'status-active' :
                          pago.estado_pago === 'Pendiente' ? 'status-pending' :
                          pago.estado_pago === 'Parcial' ? 'status-pending' :
                          'status-inactive'
                        }`}>
                          {pago.estado_pago}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(pago)}
                            className="btn-secondary text-xs px-3 py-1"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(pago.id_pago)}
                            className="btn-danger text-xs px-3 py-1"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        startItem={startItem}
        endItem={endItem}
        itemsPerPage={8}
        onPageChange={goToPage}
        onNextPage={nextPage}
        onPrevPage={prevPage}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />

      {/* Modal de Exportación */}
      {showExportModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">Exportar Datos de Pagos</h3>
              <button
                className="modal-close"
                onClick={() => setShowExportModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="modal-form">
                <div className="form-group">
                  <label className="form-label">Filtro por fecha de pago:</label>
                  <select
                    value={filtroFecha}
                    onChange={(e) => setFiltroFecha(e.target.value)}
                    className="form-select"
                  >
                    <option value="todos">Todos los tiempos</option>
                    <option value="semana">Última semana</option>
                    <option value="mes">Último mes</option>
                    <option value="personalizado">Rango personalizado</option>
                  </select>
                </div>

                {filtroFecha === 'personalizado' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label className="form-label">Fecha inicio:</label>
                      <input
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Fecha fin:</label>
                      <input
                        type="date"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Formato de exportación:</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="pdf"
                        checked={tipoExportacion === 'pdf'}
                        onChange={(e) => setTipoExportacion(e.target.value)}
                        className="mr-2"
                      />
                      PDF
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="excel"
                        checked={tipoExportacion === 'excel'}
                        onChange={(e) => setTipoExportacion(e.target.value)}
                        className="mr-2"
                      />
                      Excel
                    </label>
                  </div>
                </div>

                <div className="p-3 bg-gray-800/50 rounded-md">
                  <p className="text-sm text-purple-300">
                    <strong>Vista previa:</strong> Se exportarán {filtrarPagosPorFecha().length} pagos
                    <br />
                    <strong>Total a exportar:</strong> ${filtrarPagosPorFecha().reduce((sum, pago) => sum + parseFloat(pago.monto_pagado), 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                onClick={handleExportar}
                disabled={filtroFecha === 'personalizado' && (!fechaInicio || !fechaFin)}
                className="btn-primary"
              >
                Exportar {tipoExportacion.toUpperCase()}
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Formulario */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingPago ? 'Editar Pago' : 'Registrar Pago'}
              </h3>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label className="form-label">Registro de Membresía</label>
                  <select
                    value={formData.id_registro}
                    onChange={(e) => setFormData({...formData, id_registro: e.target.value})}
                    className="form-select"
                    required
                  >
                    <option value="">Selecciona un registro</option>
                    {registros.map((registro) => {
                      const registroInfo = getRegistroInfo(registro.id_registro);
                      return (
                        <option key={registro.id_registro} value={registro.id_registro}>
                          #{registro.id_registro} - {registroInfo.usuario} - {registroInfo.membresia}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Fecha de Pago</label>
                    <input
                      type="date"
                      value={formData.fecha_pago}
                      onChange={(e) => setFormData({...formData, fecha_pago: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Monto Pagado</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.monto_pagado}
                      onChange={(e) => setFormData({...formData, monto_pagado: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Estado del Pago</label>
                  <select
                    value={formData.estado_pago}
                    onChange={(e) => setFormData({...formData, estado_pago: e.target.value})}
                    className="form-select"
                    required
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Completo">Completo</option>
                    <option value="Parcial">Parcial</option>
                  </select>
                </div>

                <div className="modal-actions">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Guardando...' : (editingPago ? 'Actualizar' : 'Guardar')}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}