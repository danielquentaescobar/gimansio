'use client';
import React, { useEffect, useRef, useCallback } from 'react';
import '../../styles/modals.css';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md',
  closeOnOverlay = true,
  className = '',
  ...props 
}) => {
  const overlayRef = useRef(null);
  const isMouseDownOnOverlay = useRef(false);
  const closeTimeoutRef = useRef(null);
  const mouseDownTimeRef = useRef(null);

  // Prevenir scroll del fondo cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      // Guardar posición actual del scroll
      const scrollY = window.scrollY;
      
      // Aplicar estilos para prevenir scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restaurar el scroll al cerrar el modal
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Manejar tecla Escape para cerrar modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };
  
  // Mejorada detección de clics en el overlay con debounce
  const handleMouseDown = useCallback((e) => {
    if (e.target === overlayRef.current) {
      isMouseDownOnOverlay.current = true;
      mouseDownTimeRef.current = Date.now();
    } else {
      isMouseDownOnOverlay.current = false;
    }
  }, []);

  const handleMouseUp = useCallback((e) => {
    if (
      closeOnOverlay && 
      isMouseDownOnOverlay.current && 
      e.target === overlayRef.current &&
      mouseDownTimeRef.current
    ) {
      // Verificar que el clic no haya sido demasiado rápido (prevenir clics accidentales)
      const clickDuration = Date.now() - mouseDownTimeRef.current;
      
      if (clickDuration >= 100) { // Mínimo 100ms para considerar un clic intencional
        // Pequeño delay para asegurar que fue un clic intencional
        closeTimeoutRef.current = setTimeout(() => {
          onClose();
        }, 50);
      }
    }
    isMouseDownOnOverlay.current = false;
    mouseDownTimeRef.current = null;
  }, [closeOnOverlay, onClose]);

  // Prevenir el cierre accidental durante el movimiento del mouse
  const handleMouseMove = useCallback((e) => {
    // Si el mouse se mueve fuera del área del modal durante un drag, 
    // no considerarlo como intención de cerrar
    if (isMouseDownOnOverlay.current && e.target !== overlayRef.current) {
      isMouseDownOnOverlay.current = false;
    }
  }, []);

  // Cancelar cierre si el mouse entra al modal
  const handleMouseEnterModal = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);
  
  return (
    <div 
      ref={overlayRef}
      className="modal-overlay" 
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      title={closeOnOverlay ? "Haz clic fuera del modal para cerrar" : undefined}
      {...props}
    >
      <div 
        className={`modal-container ${sizes[size]} ${className}`}
        onMouseEnter={handleMouseEnterModal}
      >
        {title && (
          <div className="modal-header">
            <h3 id="modal-title" className="modal-title">{title}</h3>
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Cerrar modal"
              type="button"
              title="Cerrar modal (Esc)"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="modal-body">
          {children}
        </div>
        
        {footer && (
          <div className="modal-actions">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;