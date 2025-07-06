'use client';

import { useState } from 'react';
import { Product, Client, CartItem } from '../types';
import ProductCatalog from '../components/ProductCatalog';
import ClientForm from '../components/ClientForm';
import OrderSummary from '../components/OrderSummary';

export default function Home() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [selectedPriceType, setSelectedPriceType] = useState<'price1' | 'price2'>('price1');
  const [currentStep, setCurrentStep] = useState<'products' | 'client' | 'summary'>('products');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const addToCart = (product: Product, quantity: number, selectedColor: string) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => 
        item.product.id === product.id && item.selectedColor === selectedColor
      );
      
      if (existingItem) {
        return prev.map(item => 
          item.id === existingItem.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, {
          id: Date.now().toString(),
          product,
          quantity,
          selectedColor,
          selectedPrice: selectedPriceType
        }];
      }
    });
  };

  const updateCartItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      setCartItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleClientSubmit = (clientData: Client) => {
    setClient(clientData);
    setCurrentStep('summary');
  };

  const handleGeneratePDF = async (comentario: string) => {
    if (!client || cartItems.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client,
          cartItems,
          selectedPriceType,
          comentario
        }),
      });

      if (response.ok) {
        // Get filename from response headers
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'pedido.pdf'; // fallback
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        // Get Cloudinary URL from response headers
        const cloudinaryURL = response.headers.get('X-Cloudinary-URL');

        // Order is automatically sent to Firestore in the PDF generation API (if configured)
        if (cloudinaryURL) {
          const shouldDownloadPDF = confirm(
            '✅ Pedido procesado exitosamente.\n\n¿Desea descargar el PDF del pedido?'
          );
          
          if (shouldDownloadPDF) {
            // Create download link for the PDF
            const a = document.createElement('a');
            a.href = cloudinaryURL;
            a.download = filename;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        } else {
          // If Cloudinary upload failed, still show success message
          alert('✅ Pedido procesado exitosamente. El PDF se ha generado pero no se pudo subir a la nube.');
        }
      } else {
        console.error('PDF generation failed');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format price with thousand separators using dots and no decimals
  const formatPrice = (price: number) => {
    return Math.round(price).toLocaleString('de-DE');
  };

  if (currentStep === 'client') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <button
              onClick={() => setCurrentStep('products')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Volver a Productos
            </button>
          </div>
          <ClientForm onSubmit={handleClientSubmit} initialClient={client || undefined} />
        </div>
      </div>
    );
  }

  if (currentStep === 'summary') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <button
              onClick={() => setCurrentStep('client')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Volver al Formulario del Cliente
            </button>
          </div>
          <OrderSummary
            cartItems={cartItems}
            client={client!}
            selectedPriceType={selectedPriceType}
            onGeneratePDF={handleGeneratePDF}
            loading={loading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">QuickOrder</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedPriceType('price1')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    selectedPriceType === 'price1'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Precio 1
                </button>
                <button
                  onClick={() => setSelectedPriceType('price2')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    selectedPriceType === 'price2'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Precio 2
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Buscar Productos:</span>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Carrito: {cartItems.length} artículos</span>
                {cartItems.length > 0 && (
                  <button
                    onClick={() => setCurrentStep('client')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Continuar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Catalog */}
          <div className="lg:col-span-2">
            <ProductCatalog
              onAddToCart={addToCart}
              selectedPriceType={selectedPriceType}
            />
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Carrito</h2>
              
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg mb-2">Carrito Vacío</div>
                  <div className="text-gray-400 text-sm">Agregue productos para comenzar</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const price = item.selectedPrice === 'price1' ? item.product.price1 : item.product.price2;
                    const priceColor = item.selectedPrice === 'price1' ? 'text-green-600' : 'text-blue-600';
                    
                    return (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">{item.product.name}</h4>
                            <p className="text-xs text-gray-600">
                              {item.product.brand}
                              {item.product.productDescription && (
                                <span className="text-gray-500"> ({item.product.productDescription})</span>
                              )}
                            </p>
                            {item.selectedColor && (
                              <p className="text-xs text-gray-500">Color: {item.selectedColor}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ×
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-xs bg-white hover:bg-gray-50 text-gray-700 font-medium"
                            >
                              -
                            </button>
                            <span className="text-sm text-black font-medium min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-xs bg-white hover:bg-gray-50 text-gray-700 font-medium"
                            >
                              +
                            </button>
                          </div>
                          <div className={`text-sm font-semibold ${priceColor}`}>
                            ${formatPrice(price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Cart Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className={`text-xl font-bold ${
                        selectedPriceType === 'price1' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        ${formatPrice(cartItems.reduce((sum, item) => {
                          const price = item.selectedPrice === 'price1' ? item.product.price1 : item.product.price2;
                          return sum + (price * item.quantity);
                        }, 0))}
                      </span>
                    </div>
                  </div>
                  
                  {/* Continue Button */}
                  <button
                    onClick={() => setCurrentStep('client')}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Continuar al Formulario
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
