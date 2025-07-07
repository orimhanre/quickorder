'use client';

import { useState, useEffect, useRef } from 'react';
import { Product, CartItem, Client } from '@/types';
import ClientForm from './ClientForm';
import ProductCatalog from './ProductCatalog';
import OrderSummary from './OrderSummary';
import { toast } from 'react-hot-toast';

type Step = 'products' | 'client' | 'summary';

export default function DistriNaranjos2Form() {
  const [currentStep, setCurrentStep] = useState<Step>('products');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
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
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const selectedPriceType = 'price2';
  const cartModalContentRef = useRef<HTMLDivElement>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string>('pedido.pdf');
  const [showToastOverlay, setShowToastOverlay] = useState(false);

  // Initialize client-side state from localStorage
  useEffect(() => {
    setIsClient(true);
    
    // Load localStorage data only on client
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem('distriNaranjos2_step');
      const savedCart = localStorage.getItem('distriNaranjos2_cart');
      const savedClient = localStorage.getItem('distriNaranjos2_client');
      
      console.log('🔍 Loading DistriNaranjos2 localStorage data:', {
        savedStep,
        savedCart: savedCart ? JSON.parse(savedCart) : null,
        savedClient: savedClient ? JSON.parse(savedClient) : null
      });
      
      if (savedStep) {
        setCurrentStep(JSON.parse(savedStep));
      }
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
      if (savedClient) {
        setClient(JSON.parse(savedClient));
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      localStorage.setItem('distriNaranjos2_step', JSON.stringify(currentStep));
      console.log('💾 Saving DistriNaranjos2 step:', currentStep);
    }
  }, [currentStep, isClient]);

  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      localStorage.setItem('distriNaranjos2_cart', JSON.stringify(cartItems));
      console.log('💾 Saving DistriNaranjos2 cart:', cartItems.length, 'items');
    }
  }, [cartItems, isClient]);

  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      localStorage.setItem('distriNaranjos2_client', JSON.stringify(client));
      console.log('💾 Saving DistriNaranjos2 client:', client.name || 'empty');
    }
  }, [client, isClient]);

  const addToCart = (product: Product, quantity: number, selectedColor: string) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => 
        item.product.id === product.id && item.selectedColor === selectedColor
      );
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id && item.selectedColor === selectedColor
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        id: Date.now().toString(),
        product,
        quantity,
        selectedColor,
        selectedPrice: selectedPriceType
      }];
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client, cartItems, selectedPriceType, comentario }),
      });
      if (response.ok) {
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'pedido.pdf';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
          if (filenameMatch) filename = filenameMatch[1];
        }
        const cloudinaryURL = response.headers.get('X-Cloudinary-URL');
        if (cloudinaryURL) {
          setPdfUrl(cloudinaryURL);
          setPdfFilename(filename);
          setShowSuccessModal(true);
          setShowToastOverlay(true);
          toast.custom((t) => (
            <div
              className="flex flex-col gap-4 p-4 rounded-xl shadow-lg border-l-8 border-orange-500 relative min-w-[320px] max-w-[400px] bg-orange-400"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}
              role="alert"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-2xl">✔️</span>
                <div>
                  <div className="font-bold text-lg text-blue-700">¡Pedido enviado!</div>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = cloudinaryURL;
                    a.download = filename;
                    a.target = '_blank';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-base shadow-sm border border-blue-700"
                  aria-label="Descargar Pedido en PDF"
                >
                  ¡Descargar Pedido en PDF!
                </button>
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    setShowSuccessModal(false);
                    setShowToastOverlay(false);
                    setCurrentStep('products');
                    setCartItems([]);
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
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-base shadow-sm border border-red-700"
                  aria-label="Salir"
                >
                  ¡Salir!
                </button>
              </div>
            </div>
          ), { duration: 60000, position: 'bottom-center' });
          setTimeout(() => setShowToastOverlay(false), 60000);
        } else {
          toast.success('✅ ¡Pedido procesado exitosamente! El PDF se ha generado pero no se pudo subir a la nube.');
        }
        // Clear localStorage after successful order
        localStorage.removeItem('distriNaranjos2_step');
        localStorage.removeItem('distriNaranjos2_cart');
        localStorage.removeItem('distriNaranjos2_client');
        // Reset form state (handled in Salir button)
      } else {
        console.error('PDF generation failed');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToClient = () => {
    if (cartItems.length > 0) {
      setCurrentStep('client');
    }
  };

  const goBackToProducts = () => {
    setCurrentStep('products');
  };

  const goBackToClient = () => {
    setCurrentStep('client');
  };

  const goToStep = (step: Step) => {
    // Only allow navigation if conditions are met
    if (step === 'products') {
      setCurrentStep('products');
    } else if (step === 'client' && cartItems.length > 0) {
      setCurrentStep('client');
    } else if (step === 'summary' && cartItems.length > 0 && client.name) {
      setCurrentStep('summary');
    }
  };

  const formatPrice = (price: number) => {
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const totalPrice = cartItems.reduce((total, item) => {
    const price = item.selectedPrice === 'price1' ? item.product.price1 : item.product.price2;
    return total + (price * item.quantity);
  }, 0);

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm border-b z-40">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex flex-col items-center space-y-2">
            <h1 className="text-xl font-bold text-gray-900">DistriNaranjos</h1>
            {/* Step Indicator */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => goToStep('products')}
                className={`flex items-center transition-colors ${
                  currentStep === 'products' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                } ${cartItems.length > 0 ? 'cursor-pointer' : 'cursor-default'}`}
                disabled={cartItems.length === 0}
                aria-label="Ir a la sección de productos"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  currentStep === 'products' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  1
                </div>
                <span className="ml-1 text-xs font-medium">Productos</span>
              </button>
              <div className="w-6 h-0.5 bg-gray-300"></div>
              <button
                onClick={() => goToStep('client')}
                className={`flex items-center transition-colors ${
                  currentStep === 'client' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                } ${cartItems.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                disabled={cartItems.length === 0}
                aria-label="Ir a la sección de cliente"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  currentStep === 'client' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  2
                </div>
                <span className="ml-1 text-xs font-medium">Cliente</span>
              </button>
              <div className="w-6 h-0.5 bg-gray-300"></div>
              <button
                onClick={() => goToStep('summary')}
                className={`flex items-center transition-colors ${
                  currentStep === 'summary' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                } ${cartItems.length > 0 && client.name ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                disabled={cartItems.length === 0 || !client.name}
                aria-label="Ir a la sección de resumen"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  currentStep === 'summary' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  3
                </div>
                <span className="ml-1 text-xs font-medium">Resumen</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 pb-32">
        {currentStep === 'products' && (
          <div className="space-y-6">

            
            <div className="w-full">
              <ProductCatalog
                onAddToCart={addToCart}
                selectedPriceType={selectedPriceType}
              />
            </div>
          </div>
        )}

        {currentStep === 'client' && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <button
                onClick={goBackToProducts}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Volver a Productos
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <ClientForm 
                onSubmit={handleClientSubmit}
                initialClient={client}
                storageKeyPrefix="distriNaranjos2"
              />
            </div>
          </div>
        )}

        {currentStep === 'summary' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button
                onClick={goBackToClient}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Volver al Cliente
              </button>
            </div>
            <OrderSummary
              cartItems={cartItems}
              client={client}
              selectedPriceType={selectedPriceType}
              onGeneratePDF={handleGeneratePDF}
              loading={loading}
              totalColor="text-blue-600"
            />
          </div>
        )}
      </div>

      {/* Floating Cart Summary - Always visible except on summary page */}
      {currentStep !== 'summary' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-center">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Total Precio</div>
                <div className="text-2xl font-bold text-blue-600">${formatPrice(totalPrice)}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => setShowCartModal(true)}
                  className="relative bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  aria-label="Ver carrito"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  <span>Ver Carrito</span>
                </button>
                {cartItems.length > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg animate-pulse">
                    {cartItems.reduce((total, item) => total + item.quantity, 0)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Cart Modal */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
            <h3 className="text-lg font-bold text-gray-900">Carrito</h3>
            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={() => {
                    try {
                      localStorage.setItem('distriNaranjos2_saved_cart', JSON.stringify(cartItems));
                      toast.success('Carrito guardado correctamente.', { duration: 2000 });
                    } catch (e) {
                      toast.error('Error al guardar el carrito.');
                    }
                  }}
                  className="bg-blue-100 hover:bg-blue-200 text-black px-3 py-1 rounded-full text-xs font-medium"
                  aria-label="Guardar Carrito"
                >
                  Guardar Carrito
                </button>
              )}
              <button
                onClick={() => {
                  try {
                    const saved = localStorage.getItem('distriNaranjos2_saved_cart');
                    if (saved) {
                      setCartItems(JSON.parse(saved));
                      toast.success('Carrito cargado correctamente.', { duration: 2000 });
                      setTimeout(() => {
                        if (cartModalContentRef.current) {
                          cartModalContentRef.current.scrollTop = 0;
                        }
                      }, 100);
                    } else {
                      toast.error('No hay carrito guardado.');
                    }
                  } catch (e) {
                    toast.error('Error al cargar el carrito.');
                  }
                }}
                className="bg-yellow-100 hover:bg-yellow-200 text-black px-3 py-1 rounded-full text-xs font-medium"
                aria-label="Cargar Carrito Guardado"
              >
                Cargar Carrito
              </button>
              <button
                onClick={() => setShowCartModal(false)}
                className="text-gray-400 hover:text-gray-600 ml-2"
                aria-label="Cerrar carrito"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-scroll p-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f3f4f6' }} ref={cartModalContentRef}>
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg mb-2">Carrito Vacío</div>
                  <div className="text-gray-400 text-sm">Agregue productos para continuar</div>
                </div>
              ) : (
                <div className="space-y-4 pb-4">
                  {cartItems
                    .sort((a, b) => {
                      // First sort by brand alphabetically
                      const brandComparison = a.product.brand.localeCompare(b.product.brand);
                      if (brandComparison !== 0) {
                        return brandComparison;
                      }
                      // Then sort by name alphabetically within the same brand
                      return a.product.name.localeCompare(b.product.name);
                    })
                    .map((item) => {
                    const price = item.selectedPrice === 'price1' ? item.product.price1 : item.product.price2;
                    
                    const getImageUrl = () => {
                      if (item.product.imageURLs && item.product.imageURLs.length > 0) {
                        return item.product.imageURLs[0];
                      }
                      if (item.product.imageURL && item.product.imageURL.length > 0) {
                        return item.product.imageURL[0];
                      }
                      return '/placeholder-product.svg';
                    };

                    return (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-2 sm:p-4 hover:shadow-md transition-shadow relative">
                        {/* Remove Button - Top Right */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors z-10"
                          aria-label="Eliminar producto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        
                        <div className="flex items-center gap-2 sm:gap-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0 self-center sm:self-auto">
                            <img
                              src={getImageUrl()}
                              alt={item.product.name}
                              className="w-20 h-20 aspect-square object-cover rounded-lg"
                              onError={(e) => { e.currentTarget.src = '/placeholder-product.svg'; }}
                            />
                          </div>

                          {/* Product Info & Controls */}
                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 truncate max-w-full" title={item.product.name}>
                                  {item.product.name}
                                </h3>
                                <p className="text-xs text-gray-600 mb-0.5 truncate max-w-full">
                                  {item.product.brand}
                                  {item.product.productDescription && (
                                    <span className="text-gray-500"> ({item.product.productDescription})</span>
                                  )}
                                </p>
                                {/* Color Display */}
                                {item.selectedColor && (
                                  <div className="mb-0.5">
                                    <div className="flex items-center">
                                      <span className="text-sm text-gray-600 w-20">Color:</span>
                                      <span className="text-xs text-gray-900 font-medium">{item.selectedColor}</span>
                                    </div>
                                  </div>
                                )}
                                {/* Quantity Display */}
                                <div className="flex items-center mb-0.5">
                                  <span className="text-sm text-gray-600 w-20">Cantidad:</span>
                                  <span className="text-sm font-medium text-black">{item.quantity}</span>
                                </div>
                                {/* Price */}
                                <div className="flex items-center mb-0.5">
                                  <span className="text-sm text-gray-600 w-20">Precio:</span>
                                  <span className="text-xs text-blue-600 font-normal opacity-80">${formatPrice(price)}</span>
                                </div>
                                {/* SubTotal */}
                                <div className="flex items-center mb-0.5">
                                  <span className="text-sm text-gray-600 w-20">SubTotal:</span>
                                  <span className="font-bold text-base sm:text-lg text-blue-600">${formatPrice(price * item.quantity)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                </div>
              )}
            </div>
            {cartItems.length > 0 && (
              <div className="p-4 border-t bg-gray-50 flex-shrink-0">
                <button
                  onClick={() => {
                    setShowCartModal(false);
                    goToClient();
                  }}
                  className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors font-medium"
                  aria-label="Continuar al cliente"
                >
                  Continuar al Cliente
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showSuccessModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black bg-opacity-60"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl p-4 flex flex-col items-center gap-4 w-full max-w-xs">
              <span className="text-5xl text-blue-600">✔️</span>
              <div className="font-medium text-[18px] text-blue-700 text-center whitespace-nowrap">¡Pedido enviado exitosamente!</div>
            </div>
          </div>
        </>
      )}

      {showToastOverlay && <div className="fixed inset-0 z-40 bg-black bg-opacity-60"></div>}
    </div>
  );
} 