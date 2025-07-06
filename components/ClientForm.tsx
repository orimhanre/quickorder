'use client';

import React, { useState } from 'react';
import { Client } from '@/types';

interface ClientFormProps {
  onSubmit: (client: Client) => void;
  loading?: boolean;
  selectedPriceType: 'price1' | 'price2';
}

export default function ClientForm({ onSubmit, loading = false, selectedPriceType }: ClientFormProps) {
  const [client, setClient] = useState<Client>({
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

  return (
    <div className="rounded-lg shadow-lg p-6 bg-white">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-red-600"
                placeholder="Ingrese la empresa o tienda"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Ingrese la cédula"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Ingrese el nombre(s)"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Ingrese el apellido(s)"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-600"
                placeholder="Ingrese el número de teléfono"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-amber-700"
                placeholder="Ingrese la calle o carretera"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-amber-700"
                placeholder="Ingrese la ciudad o pueblo"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-amber-700"
                placeholder="Ingrese el departamento"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-green-600 resize-none"
              placeholder="Ingrese comentarios adicionales u observaciones"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Procesando...' : 'Continuar al Resumen del Pedido'}
          </button>
        </div>
      </form>
    </div>
  );
} 