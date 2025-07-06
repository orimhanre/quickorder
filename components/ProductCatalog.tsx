'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { fetchProductsFromAirtable } from '@/lib/airtable';

interface ProductCatalogProps {
  selectedPriceType: 'price1' | 'price2';
  onAddToCart: (product: Product, quantity: number, selectedColor: string) => void;
}

export default function ProductCatalog({ selectedPriceType, onAddToCart }: ProductCatalogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selectedColors, setSelectedColors] = useState<{ [key: string]: string }>({});
  const [modalImage, setModalImage] = useState<string | null>(null);

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
        
        // Initialize quantities and colors for all products
        const initialQuantities: { [key: string]: number } = {};
        const initialColors: { [key: string]: string } = {};
        
        convertedProducts.forEach((product: Product) => {
          initialQuantities[product.id] = 1;
          if (product.colors && product.colors.length > 0) {
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

  // Group products by brand
  const productsByBrand = filteredProducts.reduce((acc, product) => {
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
    return Math.round(price).toLocaleString('de-DE');
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
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Catálogo de Productos</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Buscar Productos:</span>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Brand Buttons */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedBrand(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedBrand === brand
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {brand} ({getProductCount(brand)})
            </button>
          ))}
        </div>
      </div>

      {/* Products Display - Single Column Layout */}
      {selectedBrand === null ? (
        // Show all products grouped by brand
        <div className="space-y-8">
          {Object.entries(productsByBrand)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([brand, brandProducts]) => (
              <div key={brand} className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 border-b pb-2">
                  {brand}
                </h3>
                <div className="space-y-4">
                  {brandProducts
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((product) => (
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
      ) : (
        // Show products for selected brand
        <div className="space-y-4">
          {filteredProducts
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((product) => (
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
      )}

      {/* Modal for image preview */}
      {modalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setModalImage(null)}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            <img src={modalImage} alt="Vista previa" className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg" />
            <button
              onClick={() => setModalImage(null)}
              className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition-colors"
              aria-label="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
    return '/placeholder-product.jpg';
  };

  const quantity = quantities[product.id] || 1;
  const selectedColor = selectedColors[product.id] || '';

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <img
            src={getImageUrl()}
            alt={product.name}
            className="w-20 h-20 object-cover rounded-lg cursor-pointer"
            onClick={() => setModalImage(getImageUrl())}
            onError={(e) => {
              e.currentTarget.src = '/placeholder-product.jpg';
            }}
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                {product.brand}
                {product.productDescription && (
                  <span className="text-gray-500"> ({product.productDescription})</span>
                )}
              </p>
              
              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 w-16">Color:</span>
                    <select
                      value={selectedColor}
                      onChange={(e) => handleColorChange(product.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1 text-black font-medium"
                    >
                      {product.colors.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Quantity Controls */}
              <div className="flex items-center mb-3">
                <span className="text-sm text-gray-600 w-16">Cantidad:</span>
                <select
                  value={quantity}
                  onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) - quantity)}
                  className="text-xs border border-gray-300 rounded px-2 py-1 text-black font-medium"
                >
                  {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="flex items-center mb-3">
                <span className="text-sm text-gray-600 w-16">Precio:</span>
                <span className={`font-bold text-lg ${selectedPriceType === 'price1' ? 'text-green-600' : 'text-blue-600'}`}>
                  ${formatPrice(price)}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="ml-4">
              <button
                onClick={() => onAddToCart(product, quantity, selectedColor)}
                className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${
                  selectedPriceType === 'price1'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
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