'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { fetchProductsFromAirtable } from '@/lib/airtable';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface ProductCatalogProps {
  selectedPriceType: 'price1' | 'price2';
  onAddToCart: (product: Product, quantity: number, selectedColor: string) => void;
}

export default function ProductCatalog({ selectedPriceType, onAddToCart }: ProductCatalogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Initialize client-side state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selectedColors, setSelectedColors] = useState<{ [key: string]: string }>({});

  // Set client flag and load localStorage data
  useEffect(() => {
    setIsClient(true);
    
    // Load localStorage data only on client
    if (typeof window !== 'undefined') {
      const keyPrefix = selectedPriceType === 'price1' ? 'dn1' : 'dn2';
      
      const savedSearchTerm = localStorage.getItem(`searchTerm-${keyPrefix}`) || '';
      const savedBrand = localStorage.getItem(`selectedBrand-${keyPrefix}`);
      const savedQuantities = localStorage.getItem(`quantities-${keyPrefix}`);
      const savedColors = localStorage.getItem(`selectedColors-${keyPrefix}`);
      
      setSearchTerm(savedSearchTerm);
      setSelectedBrand(savedBrand ? JSON.parse(savedBrand) : null);
      setQuantities(savedQuantities ? JSON.parse(savedQuantities) : {});
      setSelectedColors(savedColors ? JSON.parse(savedColors) : {});
    }
  }, [selectedPriceType]);

  // Save search term to localStorage
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      const key = `searchTerm-${selectedPriceType === 'price1' ? 'dn1' : 'dn2'}`;
      localStorage.setItem(key, searchTerm);
    }
  }, [searchTerm, selectedPriceType, isClient]);

  // Save selected brand to localStorage
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      const key = `selectedBrand-${selectedPriceType === 'price1' ? 'dn1' : 'dn2'}`;
      localStorage.setItem(key, JSON.stringify(selectedBrand));
    }
  }, [selectedBrand, selectedPriceType, isClient]);

  // Save quantities to localStorage
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      const key = `quantities-${selectedPriceType === 'price1' ? 'dn1' : 'dn2'}`;
      localStorage.setItem(key, JSON.stringify(quantities));
    }
  }, [quantities, selectedPriceType, isClient]);

  // Save selected colors to localStorage
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      const key = `selectedColors-${selectedPriceType === 'price1' ? 'dn1' : 'dn2'}`;
      localStorage.setItem(key, JSON.stringify(selectedColors));
    }
  }, [selectedColors, selectedPriceType, isClient]);

  // Fetch real products from Airtable
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const airtableProducts = await fetchProductsFromAirtable();
        
        // Convert Airtable attachment objects to string URLs
        const convertedProducts = airtableProducts.map(product => ({
          ...product,
          imageURL: product.imageURL?.map(attachment => attachment.url) || [],
          imageURLs: product.imageURLs?.map(attachment => attachment.url) || []
        }));
        
        setProducts(convertedProducts);
        console.log('Loaded products:', convertedProducts);
        
        // Initialize quantities and colors for all products (only if not already set)
        const initialQuantities: { [key: string]: number } = { ...quantities };
        const initialColors: { [key: string]: string } = { ...selectedColors };
        
        convertedProducts.forEach((product: Product) => {
          if (!(product.id in initialQuantities)) {
            initialQuantities[product.id] = 1;
          }
          if (product.colors && product.colors.length > 0 && !(product.id in initialColors)) {
            initialColors[product.id] = product.colors[0];
          }
        });
        
        setQuantities(initialQuantities);
        setSelectedColors(initialColors);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Error al cargar productos. Por favor intente de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Get unique brands
  const availableBrands = [...new Set(products.map(p => p.brand))].sort();

  // Filter products based on search and selected brand
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBrand = selectedBrand === null || product.brand === selectedBrand;
    
    return matchesSearch && matchesBrand;
  });

  // Sort products alphabetically when "Todos" is selected
  const sortedProducts = selectedBrand === null 
    ? filteredProducts.sort((a, b) => {
        // First sort by brand alphabetically
        const brandComparison = a.brand.localeCompare(b.brand);
        if (brandComparison !== 0) {
          return brandComparison;
        }
        // Then sort by name alphabetically within the same brand
        return a.name.localeCompare(b.name);
      })
    : filteredProducts.sort((a, b) => {
        // Sort by name alphabetically when a specific brand is selected
        return a.name.localeCompare(b.name);
      });

  // Group products by brand
  const productsByBrand = sortedProducts.reduce((acc, product) => {
    if (!acc[product.brand]) {
      acc[product.brand] = [];
    }
    acc[product.brand].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const getProductCount = (brand: string) => {
    return products.filter(p => p.brand === brand).length;
  };

  // Format price with thousand separators using dots and no decimals
  const formatPrice = (price: number) => {
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const updateQuantity = (productId: string, change: number) => {
    setQuantities(prev => {
      const newQuantity = Math.max(1, (prev[productId] || 1) + change);
      return { ...prev, [productId]: newQuantity };
    });
  };

  const handleColorChange = (productId: string, color: string) => {
    setSelectedColors(prev => ({ ...prev, [productId]: color }));
  };

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1;
    const selectedColor = selectedColors[product.id] || '';
    onAddToCart(product, quantity, selectedColor);
    const price = selectedPriceType === 'price1' ? product.price1 : product.price2;
    const subtotal = price * quantity;
    const formattedSubtotal = Math.round(subtotal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    toast.success(`${product.name} agregado al carrito. Cantidad: ${quantity}, SubTotal Precio: $${formattedSubtotal}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 flex gap-4 items-center">
                <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-lg mb-2">Error al Cargar Productos</div>
          <div className="text-gray-500 text-sm">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2 sm:gap-0">
        <h2 className="text-2xl font-bold text-gray-900 w-full sm:w-auto mb-2 sm:mb-0">Catálogo de Productos</h2>
        {isClient && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <span className="sr-only">Buscar Productos</span>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 bg-white text-gray-900 placeholder-gray-400 transition-all"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4-4m0 0A7 7 0 104 4a7 7 0 0013 13z" />
                </svg>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Brand Buttons */}
      {isClient && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedBrand(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedBrand === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({products.length})
            </button>
            {availableBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedBrand === brand
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {brand} ({getProductCount(brand)})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="space-y-6">
        {Object.entries(productsByBrand).map(([brand, brandProducts]) => (
          <div key={brand} className="border-b border-gray-200 pb-6 last:border-b-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{brand}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brandProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  selectedPriceType={selectedPriceType}
                  onAddToCart={handleAddToCart}
                  formatPrice={formatPrice}
                  updateQuantity={updateQuantity}
                  handleColorChange={handleColorChange}
                  quantities={quantities}
                  selectedColors={selectedColors}
                  setModalImage={setModalImage}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-2xl max-h-2xl">
            <button
              onClick={() => setModalImage(null)}
              className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={modalImage}
              alt="Product"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  selectedPriceType: 'price1' | 'price2';
  onAddToCart: (product: Product, quantity: number, selectedColor: string) => void;
  formatPrice: (price: number) => string;
  updateQuantity: (productId: string, change: number) => void;
  handleColorChange: (productId: string, color: string) => void;
  quantities: { [key: string]: number };
  selectedColors: { [key: string]: string };
  setModalImage: React.Dispatch<React.SetStateAction<string | null>>;
}

function ProductCard({ product, selectedPriceType, onAddToCart, formatPrice, updateQuantity, handleColorChange, quantities, selectedColors, setModalImage }: ProductCardProps) {
  const price = selectedPriceType === 'price1' ? product.price1 : product.price2;

  const getImageUrl = () => {
    if (product.imageURLs && product.imageURLs.length > 0) {
      return product.imageURLs[0];
    }
    if (product.imageURL && product.imageURL.length > 0) {
      return product.imageURL[0];
    }
    return '/placeholder-product.svg';
  };

  const quantity = quantities[product.id] || 1;
  const selectedColor = selectedColors[product.id] || '';

  return (
    <div className="border border-gray-200 rounded-lg p-2 sm:p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Product Image */}
        <div className="flex-shrink-0 self-center sm:self-auto">
          <Image
            src={getImageUrl()}
            alt={product.name}
            className="w-20 h-20 aspect-square object-cover rounded-lg cursor-pointer ring-0 focus:ring-2 focus:ring-blue-400 hover:ring-2 hover:ring-blue-400 transition-all duration-150"
            width={80}
            height={80}
            onClick={() => setModalImage(getImageUrl())}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setModalImage(getImageUrl()); }}
            tabIndex={0}
            loading="lazy"
            onError={(e) => { e.currentTarget.src = '/placeholder-product.svg'; }}
          />
        </div>

        {/* Product Info & Button */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-1 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate max-w-full" title={product.name}>
                {product.name}
              </h3>
              <p className="text-xs text-gray-600 mb-0.5 truncate max-w-full">
                {product.brand}
                {product.productDescription && (
                  <span className="text-gray-500"> ({product.productDescription})</span>
                )}
              </p>
              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-1">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 w-16">Color:</span>
                    <div className="relative w-20 h-5 sm:w-28 sm:h-6">
                      <select
                        value={selectedColor}
                        onChange={(e) => handleColorChange(product.id, e.target.value)}
                        className="appearance-none w-full h-5 sm:h-6 text-xs border border-gray-300 rounded px-1 pr-5 sm:pr-7 text-black font-medium"
                      >
                        {product.colors.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2">
                        <svg className="w-2.5 h-2.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {/* Quantity Controls */}
              <div className="flex items-center mb-1">
                <span className="text-sm text-gray-600 w-16">Cantidad:</span>
                <div className="relative w-12 h-5 sm:w-16 sm:h-6">
                  <select
                    value={quantity}
                    onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) - quantity)}
                    className="appearance-none w-full h-5 sm:h-6 text-xs border border-gray-300 rounded px-1 pr-5 sm:pr-7 text-black font-medium"
                  >
                    {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2">
                    <svg className="w-2.5 h-2.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>
              {/* Price */}
              <div className="flex items-center mb-0.5">
                <span className="text-sm text-gray-600 w-16">Precio:</span>
                <span className="text-xs text-green-600 font-normal opacity-80">${formatPrice(price)}</span>
              </div>
              {/* SubTotal */}
              <div className="flex items-center mb-0.5">
                <span className="text-sm text-gray-600 w-16">SubTotal:</span>
                <span className={`font-bold text-base sm:text-lg ${selectedPriceType === 'price1' ? 'text-green-600' : 'text-blue-600'}`}>${formatPrice(price * quantity)}</span>
              </div>
            </div>
            {/* Add to Cart Button - always visible, below on mobile, right on desktop */}
            <div className="mt-1 sm:mt-0 sm:ml-4 flex-shrink-0">
              <button
                onClick={() => { onAddToCart(product, quantity, selectedColor); }}
                className={`w-full sm:w-auto px-2 py-1 sm:px-4 sm:py-2 rounded-md text-white text-xs sm:text-sm font-medium transition-all duration-100 active:scale-95 active:brightness-90 focus:outline-none focus:ring-2 focus:ring-blue-400 ${selectedPriceType === 'price1' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                tabIndex={0}
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 