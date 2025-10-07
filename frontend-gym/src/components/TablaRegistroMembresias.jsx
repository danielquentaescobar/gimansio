'use client';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import { usePagination } from '../hooks/usePagination';
import { SearchBar, Pagination } from './ui';
import '../styles/tables.css';
import '../styles/modals.css';

export default function TablaRegistroMembresias() {
  const [registros, setRegistros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [membresias, setMembresias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState(null);

  // Función de búsqueda específica para registro de membresías
  const searchRegistros = (data, searchTerm) => {
    if (!usuarios.length || !membresias.length) {
      // Si no están cargados los datos relacionados, búsqueda simple
      const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
      return data.filter(registro => {
        const searchableFields = [
          registro.id_registro?.toString() || '',
          registro.id_usuario?.toString() || '',
          registro.id_membresia?.toString() || '',
          registro.activo ? 'activo' : 'inactivo',
          new Date(registro.fecha_inicio).toLocaleDateString() || '',
          new Date(registro.fecha_fin).toLocaleDateString() || ''
        ].map(field => field.toString().toLowerCase());
        
        const searchableText = searchableFields.join(' ');
        return searchWords.every(word => searchableText.includes(word));
      });
    }
    
    // Búsqueda avanzada con datos relacionados
    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
    
    return data.filter(registro => {
      const usuario = usuarios.find(u => u.id_usuario === registro.id_usuario);
      const membresia = membresias.find(m => m.id_membresia === registro.id_membresia);
      const usuarioNombre = usuario ? `${usuario.nombre} ${usuario.apellido}` : '';
      const membresiaTipo = membresia ? membresia.tipo : '';
      
      const searchableFields = [
        registro.id_registro?.toString() || '',
        usuarioNombre,
        membresiaTipo,
        registro.activo ? 'activo' : 'inactivo',
        new Date(registro.fecha_inicio).toLocaleDateString() || '',
        new Date(registro.fecha_fin).toLocaleDateString() || ''
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
  } = usePagination(registros, 8, searchRegistros);

  const [formData, setFormData] = useState({
    id_usuario: '',
    id_membresia: '',
    fecha_inicio: '',
    fecha_fin: '',
    activo: true
  });

  useEffect(() => {
    fetchRegistros();
    fetchUsuarios();
    fetchMembresias();
  }, []);

  const fetchRegistros = async () => {
    setLoading(true);
    try {
      const res = await api.get('/registro-membresias');
      setRegistros(res.data);
      setError('');
    } catch (err) {
      setError('Error al cargar registros de membresías');
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch (err) {
      console.error('Error al cargar usuarios');
    }
  };

  const fetchMembresias = async () => {
    try {
      const res = await api.get('/membresias');
      setMembresias(res.data);
    } catch (err) {
      console.error('Error al cargar membresías');
    }
  };

  const getUsuarioNombre = (id) => {
    const usuario = usuarios.find(u => u.id_usuario === id);
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Usuario no encontrado';
  };

  const getMembresiaTipo = (id) => {
    const membresia = membresias.find(m => m.id_membresia === id);
    return membresia ? membresia.tipo : 'Membresía no encontrada';
  };

  const getMembresiaInfo = (id) => {
    const membresia = membresias.find(m => m.id_membresia === id);
    return membresia || { tipo: 'N/A', precio: 0, duracion_dias: 0 };
  };

  const calcularFechaFin = (fechaInicio, duracionDias) => {
    if (!fechaInicio || !duracionDias) return '';
    const fecha = new Date(fechaInicio);
    fecha.setDate(fecha.getDate() + parseInt(duracionDias));
    return fecha.toISOString().split('T')[0];
  };

  const createRegistro = async () => {
    try {
      setLoading(true);
      await api.post('/registro-membresias', formData);
      await fetchRegistros();
      setShowModal(false);
      resetForm();
      setError('');
      setSuccess('Registro de membresía creado exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al crear registro de membresía');
    } finally {
      setLoading(false);
    }
  };

  const updateRegistro = async () => {
    try {
      setLoading(true);
      await api.put(`/registro-membresias/${editingRegistro.id_registro}`, formData);
      await fetchRegistros();
      setShowModal(false);
      setEditingRegistro(null);
      resetForm();
      setError('');
      setSuccess('Registro de membresía actualizado exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al actualizar registro de membresía');
    } finally {
      setLoading(false);
    }
  };

  const deleteRegistro = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este registro de membresía?')) {
      try {
        setLoading(true);
        await api.delete(`/registro-membresias/${id}`);
        await fetchRegistros();
        setError('');
        setSuccess('Registro de membresía eliminado exitosamente');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Error al eliminar registro de membresía');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingRegistro) {
      await updateRegistro();
    } else {
      await createRegistro();
    }
  };

  const resetForm = () => {
    setFormData({
      id_usuario: '',
      id_membresia: '',
      fecha_inicio: '',
      fecha_fin: '',
      activo: true
    });
  };

  const openCreateModal = () => {
    setEditingRegistro(null);
    resetForm();
    setFormData({
      ...formData,
      fecha_inicio: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const openEditModal = (registro) => {
    setEditingRegistro(registro);
    setFormData({
      id_usuario: registro.id_usuario,
      id_membresia: registro.id_membresia,
      fecha_inicio: registro.fecha_inicio ? registro.fecha_inicio.split('T')[0] : '',
      fecha_fin: registro.fecha_fin ? registro.fecha_fin.split('T')[0] : '',
      activo: registro.activo
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRegistro(null);
    setError('');
    resetForm();
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calcularDiasRestantes = (fechaFin) => {
    if (!fechaFin) return 'N/A';
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diferencia = fin - hoy;
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    
    if (dias < 0) return 'Vencida';
    if (dias === 0) return 'Vence hoy';
    if (dias === 1) return '1 día';
    return `${dias} días`;
  };

  const getEstadoRegistro = (activo, fechaFin) => {
    if (!activo) return 'Inactivo';
    if (!fechaFin) return 'Activo';
    
    const hoy = new Date();
    const fin = new Date(fechaFin);
    
    if (fin < hoy) return 'Vencido';
    
    const diferencia = fin - hoy;
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    
    if (dias <= 7) return 'Por vencer';
    return 'Activo';
  };

  const handleMembresiaChange = (membresiaId) => {
    const membresia = membresias.find(m => m.id_membresia === parseInt(membresiaId));
    if (membresia && formData.fecha_inicio) {
      const fechaFin = calcularFechaFin(formData.fecha_inicio, membresia.duracion_dias);
      setFormData({
        ...formData,
        id_membresia: membresiaId,
        fecha_fin: fechaFin
      });
    } else {
      setFormData({
        ...formData,
        id_membresia: membresiaId
      });
    }
  };

  const handleFechaInicioChange = (fecha) => {
    const membresia = membresias.find(m => m.id_membresia === parseInt(formData.id_membresia));
    if (membresia) {
      const fechaFin = calcularFechaFin(fecha, membresia.duracion_dias);
      setFormData({
        ...formData,
        fecha_inicio: fecha,
        fecha_fin: fechaFin
      });
    } else {
      setFormData({
        ...formData,
        fecha_inicio: fecha
      });
    }
  };

  const getRegistrosActivos = () => {
    return registros.filter(registro => 
      registro.activo && 
      new Date(registro.fecha_fin) > new Date()
    ).length;
  };

  const getRegistrosVencidos = () => {
    return registros.filter(registro => 
      registro.activo && 
      new Date(registro.fecha_fin) <= new Date()
    ).length;
  };

  return (
    <div className="table-container h-full flex flex-col relative">
      {/* Header */}
      <div className="table-header flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="table-title">Registro de Membresías</h2>
          <div className="stats-number text-lg">{totalItems}</div>
          <span className="text-sm text-purple-300">
            {searchTerm ? 'resultados encontrados' : 'registros totales'}
          </span>
          <div className="flex items-center space-x-4 text-xs">
            <div className="text-green-400">
              {getRegistrosActivos()} activos
            </div>
            <div className="text-red-400">
              {getRegistrosVencidos()} vencidos
            </div>
          </div>
        </div>
        <div className="table-actions">
          <button
            onClick={fetchRegistros}
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
            + Nuevo Registro
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="px-6 py-4 border-b border-purple-700/30">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          placeholder="Buscar por usuario, membresía, estado..."
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
      {loading && registros.length === 0 && (
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
                <th>Usuario y Membresía</th>
                <th>Fechas</th>
                <th>Estado</th>
                <th>Tiempo Restante</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="text-purple-300">
                      {searchTerm ? 'No se encontraron registros que coincidan con la búsqueda' : 'No hay registros de membresías'}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((registro) => {
                  const estado = getEstadoRegistro(registro.activo, registro.fecha_fin);
                  const membresiaInfo = getMembresiaInfo(registro.id_membresia);
                  
                  return (
                    <tr key={registro.id_registro}>
                      <td>{registro.id_registro}</td>
                      <td>
                        <div className="font-medium text-white">
                          {getUsuarioNombre(registro.id_usuario)}
                        </div>
                        <div className="text-sm text-cyan-400">
                          {getMembresiaTipo(registro.id_membresia)}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${membresiaInfo.precio}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <div className="text-green-400">
                            Inicio: {formatFecha(registro.fecha_inicio)}
                          </div>
                          <div className="text-orange-400">
                            Fin: {formatFecha(registro.fecha_fin)}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${
                          estado === 'Activo' ? 'status-active' :
                          estado === 'Por vencer' ? 'status-pending' :
                          estado === 'Vencido' ? 'status-inactive' :
                          'status-inactive'
                        }`}>
                          {estado}
                        </span>
                      </td>
                      <td>
                        <div className={`font-medium ${
                          calcularDiasRestantes(registro.fecha_fin) === 'Vencida' ? 'text-red-400' :
                          calcularDiasRestantes(registro.fecha_fin).includes('día') && 
                          parseInt(calcularDiasRestantes(registro.fecha_fin)) <= 7 ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {calcularDiasRestantes(registro.fecha_fin)}
                        </div>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(registro)}
                            className="btn-secondary text-xs px-3 py-1"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteRegistro(registro.id_registro)}
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingRegistro ? 'Editar Registro de Membresía' : 'Nuevo Registro de Membresía'}
              </h3>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label className="form-label">Usuario</label>
                  <select
                    value={formData.id_usuario}
                    onChange={(e) => setFormData({...formData, id_usuario: e.target.value})}
                    className="form-select"
                    required
                  >
                    <option value="">Selecciona un usuario</option>
                    {usuarios.map((usuario) => (
                      <option key={usuario.id_usuario} value={usuario.id_usuario}>
                        {usuario.nombre} {usuario.apellido} - {usuario.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Membresía</label>
                  <select
                    value={formData.id_membresia}
                    onChange={(e) => handleMembresiaChange(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">Selecciona una membresía</option>
                    {membresias.map((membresia) => (
                      <option key={membresia.id_membresia} value={membresia.id_membresia}>
                        {membresia.tipo} - ${membresia.precio} ({membresia.duracion_dias} días)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Fecha de Inicio</label>
                    <input
                      type="date"
                      value={formData.fecha_inicio}
                      onChange={(e) => handleFechaInicioChange(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Fecha de Fin</label>
                    <input
                      type="date"
                      value={formData.fecha_fin}
                      onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.activo}
                      onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="form-label mb-0">Membresía activa</span>
                  </label>
                </div>

                {formData.fecha_inicio && formData.fecha_fin && (
                  <div className="p-3 bg-gray-800/50 rounded-md">
                    <p className="text-sm text-purple-300">
                      <strong>Vista previa:</strong>
                      <br />
                      Inicio: {formatFecha(formData.fecha_inicio)}
                      <br />
                      Fin: {formatFecha(formData.fecha_fin)}
                      <br />
                      Duración: {calcularDiasRestantes(formData.fecha_fin)} desde el inicio
                    </p>
                  </div>
                )}

                <div className="modal-actions">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Guardando...' : (editingRegistro ? 'Actualizar' : 'Crear')}
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