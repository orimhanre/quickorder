'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">QuickOrder</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenido a QuickOrder
          </h2>
          <p className="text-xl text-gray-600">
            Seleccione el formulario que desea usar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* DistriNaranjos Formulario 1 */}
          <Link href="/DistriNaranjos1" className="block">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  DistriNaranjos
                </h3>
                <p className="text-lg font-semibold text-green-600 mb-4">
                  Formulario 1
                </p>
                <p className="text-gray-600">
                  Acceda al primer formulario de DistriNaranjos para crear pedidos
                </p>
              </div>
            </div>
          </Link>

          {/* DistriNaranjos Formulario 2 */}
          <Link href="/DistriNaranjos2" className="block">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  DistriNaranjos
                </h3>
                <p className="text-lg font-semibold text-blue-600 mb-4">
                  Formulario 2
                </p>
                <p className="text-gray-600">
                  Acceda al segundo formulario de DistriNaranjos para crear pedidos
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Seleccione el formulario que corresponda a su tipo de pedido
          </p>
        </div>
      </div>
    </div>
  );
}
