'use client';

import React, { useState, useEffect } from 'react';
import { Client } from '@/types';
import { toast } from 'react-hot-toast';

interface ClientFormProps {
  onSubmit: (client: Client) => void;
  loading?: boolean;
  initialClient?: Client;
  storageKeyPrefix: string; // 'distriNaranjos1' or 'distriNaranjos2'
}

export default function ClientForm({ onSubmit, loading = false, initialClient, storageKeyPrefix }: ClientFormProps) {
  const [client, setClient] = useState<Client>(() => initialClient || {
    companyName: '',
    identification: '',
    name: '',
    surname: '',
    phone: '',
    address: '',
    city: '',
    department: '',
    comentario: ''
  });

  useEffect(() => {
    if (initialClient) {
      setClient({
        companyName: initialClient.companyName || '',
        identification: initialClient.identification || '',
        name: initialClient.name || '',
        surname: initialClient.surname || '',
        phone: initialClient.phone || '',
        address: initialClient.address || '',
        city: initialClient.city || '',
        department: initialClient.department || '',
        comentario: initialClient.comentario || ''
      });
    }
  }, [initialClient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(client);
  };

  const handleInputChange = (field: keyof Client, value: string) => {
    setClient(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save client to localStorage (always visible, always saves)
  const handleSaveClient = () => {
    try {
      localStorage.setItem(`${storageKeyPrefix}_saved_client`, JSON.stringify(client));
      toast.success('Cliente guardado correctamente.');
    } catch (e) {
      toast.error('Error al guardar el cliente.');
    }
  };

  // Load client from localStorage (always visible, always loads last saved)
  const handleLoadClient = () => {
    try {
      const saved = localStorage.getItem(`${storageKeyPrefix}_saved_client`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setClient(parsed);
        onSubmit(parsed); // sync parent state
        toast.success('Cliente cargado correctamente.');
      } else {
        toast.error('No hay cliente guardado.');
      }
    } catch (e) {
      toast.error('Error al cargar el cliente.');
    }
  };

  return (
    <div className="rounded-lg shadow-lg p-6 bg-white">
      {/* Save/Load Buttons */}
      <div className="flex justify-end gap-2 mb-2">
        <button
          onClick={handleLoadClient}
          type="button"
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 ${storageKeyPrefix === 'distriNaranjos1' ? 'bg-yellow-100 hover:bg-yellow-200 text-black border-yellow-200' : 'bg-yellow-100 hover:bg-yellow-200 text-black border-yellow-200'}`}
          aria-label="Cargar Cliente Guardado"
        >
          Cargar Cliente
        </button>
        <button
          onClick={handleSaveClient}
          type="button"
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${storageKeyPrefix === 'distriNaranjos1' ? 'bg-green-100 hover:bg-green-200 text-black border-green-200 focus:ring-green-400' : 'bg-blue-100 hover:bg-blue-200 text-black border-blue-200 focus:ring-blue-400'}`}
          aria-label="Guardar Cliente"
        >
          Guardar Cliente
        </button>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Información del Cliente</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Data Section */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Datos del Cliente</h3>
            <button
              type="button"
              onClick={() => {
                setClient({
                  companyName: '',
                  identification: '',
                  name: '',
                  surname: '',
                  phone: '',
                  address: '',
                  city: '',
                  department: '',
                  comentario: ''
                });
              }}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Limpiar
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                Empresa / Tienda
              </label>
              <input
                type="text"
                id="companyName"
                value={client.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-600 focus:border-2 text-red-600 transition-all duration-200 ease-in-out focus:!border-red-600"
                placeholder="Ingrese la empresa o tienda"
                aria-label="Empresa o Tienda"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="identification" className="block text-sm font-medium text-gray-700 mb-1">
                Cédula
              </label>
              <input
                type="text"
                id="identification"
                value={client.identification}
                onChange={(e) => handleInputChange('identification', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black focus:border-2 text-black transition-all duration-200 ease-in-out focus:!border-black"
                placeholder="Ingrese la cédula"
                aria-label="Cédula"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre(s)
              </label>
              <input
                type="text"
                id="name"
                value={client.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black focus:border-2 text-black transition-all duration-200 ease-in-out focus:!border-black"
                placeholder="Ingrese el nombre(s)"
                autoCapitalize="words"
                aria-label="Nombre(s)"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">
                Apellido(s)
              </label>
              <input
                type="text"
                id="surname"
                value={client.surname}
                onChange={(e) => handleInputChange('surname', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black focus:border-2 text-black transition-all duration-200 ease-in-out focus:!border-black"
                placeholder="Ingrese el apellido(s)"
                autoCapitalize="words"
                aria-label="Apellido(s)"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                value={client.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:border-2 text-blue-600 transition-all duration-200 ease-in-out focus:!border-blue-600"
                placeholder="Ingrese el número de teléfono"
                aria-label="Teléfono"
                aria-required="true"
              />
            </div>
          </div>
        </div>

        {/* Client Address Section */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Dirección del Cliente</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Calle / Carretera
              </label>
              <input
                type="text"
                id="address"
                value={client.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-amber-700 focus:border-2 text-amber-700 transition-all duration-200 ease-in-out focus:!border-amber-700"
                placeholder="Ingrese la calle o carretera"
                aria-label="Calle o Carretera"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad / Pueblo
              </label>
              <input
                type="text"
                id="city"
                value={client.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-amber-700 focus:border-2 text-amber-700 transition-all duration-200 ease-in-out focus:!border-amber-700"
                placeholder="Ingrese la ciudad o pueblo"
                aria-label="Ciudad o Pueblo"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Departamento
              </label>
              <input
                type="text"
                id="department"
                value={client.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-amber-700 focus:border-2 text-amber-700 transition-all duration-200 ease-in-out focus:!border-amber-700"
                placeholder="Ingrese el departamento"
                aria-label="Departamento"
                aria-required="true"
              />
            </div>
          </div>
        </div>

        {/* Observations Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Observaciones</h3>
          <div>
            <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-1">
              Comentarios
            </label>
            <textarea
              id="observations"
              rows={3}
              value={client.comentario}
              onChange={(e) => handleInputChange('comentario', e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 focus:border-2 text-green-600 resize-none transition-all duration-200 ease-in-out focus:!border-green-600"
              placeholder="Ingrese comentarios adicionales u observaciones"
              aria-label="Comentarios u Observaciones"
              aria-required="false"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-3 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Procesando...' : 'Continuar al Resumen del Pedido'}
          </button>
        </div>
      </form>
    </div>
  );
} 