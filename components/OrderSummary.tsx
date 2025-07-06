'use client';

import { useState } from 'react';
import { CartItem, Client } from '@/types';

interface OrderSummaryProps {
  cartItems: CartItem[];
  client: Client;
  selectedPriceType: 'price1' | 'price2';
  onGeneratePDF: (comentario: string) => void;
  loading?: boolean;
}

export default function OrderSummary({ 
  cartItems, 
  client, 
  selectedPriceType, 
  onGeneratePDF, 
  loading = false 
}: OrderSummaryProps) {
  const [comentario, setComentario] = useState(client.comentario || '');

  // Format price with thousand separators using dots and no decimals
  const formatPrice = (price: number) => {
    return Math.round(price).toLocaleString('de-DE');
  };

  const total = cartItems.reduce((sum, item) => {
    const price = item.selectedPrice === 'price1' ? item.product.price1 : item.product.price2;
    return sum + (price * item.quantity);
  }, 0);

  const getPriceColor = () => {
    return selectedPriceType === 'price1' ? 'text-green-600' : 'text-blue-600';
  };

  const getPriceLabel = () => {
    return selectedPriceType === 'price1' ? 'Precio 1' : 'Precio 2';
  };

  const handleGeneratePDF = () => {
    onGeneratePDF(comentario);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumen del Pedido</h2>
      
      {/* Client Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Información del Cliente</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {client.companyName && (
              <div>
                <span className="font-medium text-gray-700">Empresa / Tienda:</span>
                <span className="ml-2 text-gray-900">{client.companyName}</span>
              </div>
            )}
            {client.identification && (
              <div>
                <span className="font-medium text-gray-700">Cédula:</span>
                <span className="ml-2 text-gray-900">{client.identification}</span>
              </div>
            )}
            {client.name && (
              <div>
                <span className="font-medium text-gray-700">Nombre(s):</span>
                <span className="ml-2 text-gray-900">{client.name}</span>
              </div>
            )}
            {client.surname && (
              <div>
                <span className="font-medium text-gray-700">Apellido(s):</span>
                <span className="ml-2 text-gray-900">{client.surname}</span>
              </div>
            )}
            {client.phone && (
              <div>
                <span className="font-medium text-gray-700">Teléfono:</span>
                <span className="ml-2 text-gray-900">{client.phone}</span>
              </div>
            )}
            {client.department && (
              <div>
                <span className="font-medium text-gray-700">Departamento:</span>
                <span className="ml-2 text-gray-900">{client.department}</span>
              </div>
            )}
            {client.address && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Calle / Carretera:</span>
                <span className="ml-2 text-gray-900">{client.address}</span>
              </div>
            )}
            {client.city && (
              <div>
                <span className="font-medium text-gray-700">Ciudad / Pueblo:</span>
                <span className="ml-2 text-gray-900">{client.city}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Información Adicional</h3>
        <div>
          <label htmlFor="comentario" className="block text-sm font-medium text-gray-700 mb-1">
            Comentarios/Observaciones
          </label>
          <textarea
            id="comentario"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-black"
            placeholder="Ingrese comentarios adicionales u observaciones"
          />
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Artículos del Pedido</h3>
        <div className="space-y-3">
          {cartItems.map((item, index) => {
            const price = item.selectedPrice === 'price1' ? item.product.price1 : item.product.price2;
            const priceColor = item.selectedPrice === 'price1' ? 'text-green-600' : 'text-blue-600';
            
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">{item.product.brand}</p>
                    {item.product.productDescription && (
                      <p className="text-xs text-gray-500 mt-1">{item.product.productDescription}</p>
                    )}
                    {item.selectedColor && (
                      <p className="text-xs text-gray-500">Color: {item.selectedColor}</p>
                    )}
                    {item.product.colors && item.product.colors.length > 0 && !item.selectedColor && (
                      <p className="text-xs text-gray-500">Colores Disponibles: {item.product.colors.join(', ')}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Cant: {item.quantity}</span>
                      <span className={`font-bold ${priceColor}`}>
                        ${formatPrice(price)}
                      </span>
                    </div>
                    <div className={`text-sm font-semibold ${priceColor}`}>
                      Total: ${formatPrice(price * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Type and Total */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-green-600">TOTAL PRECIO:</span>
          <span className={`text-2xl font-bold ${getPriceColor()}`}>
            ${formatPrice(total)}
          </span>
        </div>
      </div>

      {/* Send Order Button */}
      <button
        onClick={handleGeneratePDF}
        disabled={loading || cartItems.length === 0}
        className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
          loading || cartItems.length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : selectedPriceType === 'price1'
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Enviando Pedido...' : 'Enviar Pedido a DistriNaranjos'}
      </button>

      {cartItems.length === 0 && (
        <p className="text-center text-gray-500 text-sm mt-2">
          Agregue productos al carrito para generar un pedido
        </p>
      )}
    </div>
  );
} 