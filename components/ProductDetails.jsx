'use client';

import { useState } from 'react';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetails({ product }) {
  const [imgError, setImgError] = useState(false);

  const {
    name,
    price,
    description = 'No description available',
    image_url,
    availability,
    specifications,
  } = product;

  const formattedPrice = typeof price === 'number' ? price.toFixed(2) : parseFloat(price).toFixed(2);
  const isInStock = availability?.toLowerCase().includes('in stock');
  const availabilityClass = isInStock ? 'text-green-600' : 'text-red-600';

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Link>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Image */}
          <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden h-80">
            <img
              src={imgError ? '/placeholder.png' : (image_url || '/placeholder.png')}
              alt={name}
              className="h-full w-full object-contain"
              onError={() => setImgError(true)}
            />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="text-3xl font-bold text-indigo-600 mb-2 sm:mb-0">${formattedPrice}</div>
                <div className={`font-medium ${availabilityClass}`}>{availability}</div>
              </div>
            </div>

            {/* Cart Button */}
            <button
              className={`flex items-center justify-center px-6 py-4 rounded-md shadow-md text-white font-medium w-full ${
                isInStock ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={!isInStock}
              onClick={() => alert(`Added ${name} to cart!`)}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {isInStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="px-6 py-8 border-t border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold mb-4">Product Description</h2>
          <div className="prose max-w-none text-gray-700 whitespace-pre-line">{description}</div>
        </div>

        {/* Specifications */}
        {specifications && Object.keys(specifications).length > 0 && (
          <div className="px-6 py-8 border-t border-gray-200">
            <h2 className="text-xl font-bold mb-4">Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              {Object.entries(specifications).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <span className="font-medium text-gray-700 w-2/5">{key}:</span>
                  <span className="text-gray-600 w-3/5">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
