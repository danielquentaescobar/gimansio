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

export default function TablaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Estados para exportación
  const [showExportModal, setShowExportModal] = useState(false);
  const [filtroFecha, setFiltroFecha] = useState('todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoExportacion, setTipoExportacion] = useState('pdf');

  // Función de búsqueda específica para usuarios
  const searchUsuarios = (data, searchTerm) => {
    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
    
    return data.filter(usuario => {
      const searchableFields = [
        usuario.nombre || '',
        usuario.apellido || '',
        usuario.email || '',
        usuario.telefono || '',
        `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim(),
        new Date(usuario.fecha_nacimiento).toLocaleDateString() || '',
        new Date(usuario.fecha_registro).toLocaleDateString() || ''
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
  } = usePagination(usuarios, 8, searchUsuarios);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    telefono: '',
    email: '',
    fecha_registro: '',
    registrado_por: 1
  });

  useEffect(() => {
    const adminData = sessionStorage.getItem('admin');
    if (adminData) {
      const admin = JSON.parse(adminData);
      setFormData(prev => ({
        ...prev,
        registrado_por: admin.id_admin
      }));
    }
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
      setError('');
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingUser) {
        await api.put(`/usuarios/${editingUser.id_usuario}`, formData);
        setSuccess('Usuario actualizado exitosamente');
      } else {
        await api.post('/usuarios', formData);
        setSuccess('Usuario creado exitosamente');
      }
      
      fetchUsuarios();
      closeModal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al guardar usuario');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await api.delete(`/usuarios/${id}`);
        setSuccess('Usuario eliminado exitosamente');
        fetchUsuarios();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Error al eliminar usuario');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      nombre: '',
      apellido: '',
      fecha_nacimiento: '',
      telefono: '',
      email: '',
      fecha_registro: new Date().toISOString().split('T')[0],
      registrado_por: JSON.parse(sessionStorage.getItem('admin'))?.id_admin || 1
    });
    setShowModal(true);
  };

  const openEditModal = (usuario) => {
    setEditingUser(usuario);
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      fecha_nacimiento: usuario.fecha_nacimiento ? usuario.fecha_nacimiento.split('T')[0] : '',
      telefono: usuario.telefono,
      email: usuario.email,
      fecha_registro: usuario.fecha_registro ? usuario.fecha_registro.split('T')[0] : '',
      registrado_por: usuario.registrado_por
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setError('');
  };

  const filtrarUsuariosPorFecha = () => {
    let usuariosFiltrados = [...usuarios];
    const hoy = new Date();

    switch (filtroFecha) {
      case 'semana':
        const semanaAtras = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
        usuariosFiltrados = usuarios.filter(usuario => 
          new Date(usuario.fecha_registro) >= semanaAtras && new Date(usuario.fecha_registro) <= hoy
        );
        break;
      case 'mes':
        const mesAtras = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());
        usuariosFiltrados = usuarios.filter(usuario => 
          new Date(usuario.fecha_registro) >= mesAtras && new Date(usuario.fecha_registro) <= hoy
        );
        break;
      case 'personalizado':
        if (fechaInicio && fechaFin) {
          usuariosFiltrados = usuarios.filter(usuario => {
            const fechaRegistro = new Date(usuario.fecha_registro);
            return fechaRegistro >= new Date(fechaInicio) && fechaRegistro <= new Date(fechaFin);
          });
        }
        break;
      default:
        break;
    }

    return usuariosFiltrados;
  };

  const exportarPDF = () => {
    const usuariosFiltrados = filtrarUsuariosPorFecha();
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Reporte de Usuarios - Gimnasio', 20, 20);

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
    doc.text(`Total de usuarios: ${usuariosFiltrados.length}`, 20, 45);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 20, 55);

    const tableData = usuariosFiltrados.map(user => [
      user.id_usuario,
      user.nombre,
      user.apellido,
      user.email,
      user.telefono,
      user.fecha_nacimiento ? new Date(user.fecha_nacimiento).toLocaleDateString() : 'N/A',
      new Date(user.fecha_registro).toLocaleDateString()
    ]);

    autoTable(doc, {
      head: [['ID', 'Nombre', 'Apellido', 'Email', 'Teléfono', 'F. Nacimiento', 'F. Registro']],
      body: tableData,
      startY: 65,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    const fechaArchivo = new Date().toISOString().split('T')[0];
    doc.save(`usuarios_${filtroFecha}_${fechaArchivo}.pdf`);

    setShowExportModal(false);
    setSuccess('PDF exportado exitosamente');
    setTimeout(() => setSuccess(''), 3000);
  };

  const exportarExcel = () => {
    const usuariosFiltrados = filtrarUsuariosPorFecha();
    
    const datosExcel = usuariosFiltrados.map(user => ({
      'ID Usuario': user.id_usuario,
      'Nombre': user.nombre,
      'Apellido': user.apellido,
      'Email': user.email,
      'Teléfono': user.telefono,
      'Fecha de Nacimiento': user.fecha_nacimiento ? new Date(user.fecha_nacimiento).toLocaleDateString() : 'N/A',
      'Fecha de Registro': new Date(user.fecha_registro).toLocaleDateString(),
      'Registrado Por': user.registrado_por
    }));

    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');

    const resumenData = [
      ['REPORTE DE USUARIOS - GIMNASIO'],
      [''],
      ['Filtro aplicado:', filtroFecha === 'personalizado' ? `${fechaInicio} a ${fechaFin}` : filtroFecha],
      ['Total de usuarios:', usuariosFiltrados.length],
      ['Fecha de generación:', new Date().toLocaleDateString()],
      ['Hora de generación:', new Date().toLocaleTimeString()]
    ];

    const resumenSheet = XLSX.utils.aoa_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(wb, resumenSheet, 'Resumen');

    const fechaArchivo = new Date().toISOString().split('T')[0];
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `usuarios_${filtroFecha}_${fechaArchivo}.xlsx`);

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
          <h2 className="table-title">Gestión de Usuarios</h2>
          <div className="stats-number text-lg">{totalItems}</div>
          <span className="text-sm text-purple-300">
            {searchTerm ? 'resultados encontrados' : 'usuarios registrados'}
          </span>
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
            onClick={fetchUsuarios}
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
            + Agregar Usuario
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="px-6 py-4 border-b border-purple-700/30">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          placeholder="Buscar por nombre, apellido, email, teléfono..."
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
      {loading && usuarios.length === 0 && (
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
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>F. Nacimiento</th>
                <th>F. Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <div className="text-purple-300">
                      {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios registrados'}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((usuario) => (
                  <tr key={usuario.id_usuario}>
                    <td>{usuario.id_usuario}</td>
                    <td>{usuario.nombre} {usuario.apellido}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.telefono}</td>
                    <td>
                      {usuario.fecha_nacimiento 
                        ? new Date(usuario.fecha_nacimiento).toLocaleDateString() 
                        : 'N/A'
                      }
                    </td>
                    <td>{new Date(usuario.fecha_registro).toLocaleDateString()}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(usuario)}
                          className="btn-secondary text-xs px-3 py-1"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(usuario.id_usuario)}
                          className="btn-danger text-xs px-3 py-1"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
              <h3 className="modal-title">Exportar Datos de Usuarios</h3>
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
                  <label className="form-label">Filtro por fecha de registro:</label>
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
                    <strong>Vista previa:</strong> Se exportarán {filtrarUsuariosPorFecha().length} usuarios
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
                {editingUser ? 'Editar Usuario' : 'Agregar Usuario'}
              </h3>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Apellido</label>
                    <input
                      type="text"
                      value={formData.apellido}
                      onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      value={formData.fecha_nacimiento}
                      onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Fecha de Registro</label>
                    <input
                      type="date"
                      value={formData.fecha_registro}
                      onChange={(e) => setFormData({...formData, fecha_registro: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Guardar')}
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