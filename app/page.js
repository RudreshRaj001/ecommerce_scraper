'use client';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [category, setCategory] = useState('');
  const [availability, setAvailability] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [crawlStatus, setCrawlStatus] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [productsPerPage, setProductsPerPage] = useState(6);

  useEffect(() => {
    fetchProducts();
  }, [currentPage]); // Fetch products when page changes

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      if (category) params.append('category', category);
      if (availability) params.append('availability', availability);
      
      // Add pagination parameters
      const skip = (currentPage - 1) * productsPerPage;
      params.append('skip', skip.toString());
      params.append('limit', productsPerPage.toString());

      const res = await axios.get(`http://localhost:5000/api/products?${params.toString()}`);
      setProducts(res.data);
      
      // Get total count for pagination calculation
      // Note: If your API doesn't return a total count, you might need to modify the backend
      // or implement a separate endpoint to get the total count
      const countRes = await axios.get(`http://localhost:5000/api/products/count?${params.toString().replace(/skip=[^&]*&?|limit=[^&]*&?/g, '')}`);
      setTotalProducts(countRes.data.count || res.data.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerCrawl = async () => {
    setCrawlStatus('Crawling...');
    try {
      const res = await axios.post('http://localhost:5000/api/crawl');
      setCrawlStatus(res.data.message);
    } catch (err) {
      console.error(err);
      setCrawlStatus('Error during crawl');
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on new search
    fetchProducts();
  };

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Product Finder</h1>
          <p className="text-lg text-gray-600 mb-8">Find the perfect product for your needs</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                id="query"
                placeholder="Search products..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="minprice" className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <input
                id="minprice"
                type="number"
                placeholder="Min price"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="maxprice" className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <input
                id="maxprice"
                type="number"
                placeholder="Max price"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
            <div className="flex gap-2">
              <button 
                onClick={handleSearch} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out flex-1 sm:flex-none"
              >
                Search
              </button>
              <button 
                onClick={() => {
                  setQuery('');
                  setMinPrice('');
                  setMaxPrice('');
                  setCategory('');
                  setAvailability('');
                  setCurrentPage(1);
                }} 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out flex-1 sm:flex-none"
              >
                Reset
              </button>
            </div>
            
            <button 
              onClick={triggerCrawl} 
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out flex-1 sm:flex-none"
            >
              Trigger Crawl
            </button>
          </div>
          
          {crawlStatus && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
              {crawlStatus}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {products.map(product => (
                    <a
                      key={product.id}
                      href={`/product/${product.id}`}
                      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-200 flex flex-col h-full group"
                    >
                      <div className="h-48 overflow-hidden bg-gray-200">
                        <img 
                          src={product.image_url || '/placeholder.png'} 
                          alt={product.name} 
                          className="h-full w-full object-cover transform group-hover:scale-105 transition duration-300"
                          onError={(e) => {e.target.src = '/placeholder.png'}}
                        />
                      </div>
                      <div className="p-4 flex-grow">
                        <h2 className="font-semibold text-lg text-gray-800 mb-1 group-hover:text-indigo-600">{product.name}</h2>
                        <p className="font-bold text-indigo-600 text-xl mb-2">${parseFloat(product.price).toFixed(2)}</p>
                        <p className="text-sm text-gray-500 mb-2">
                          {product.availability === 'In Stock' ? (
                            <span className="text-green-600 font-medium">{product.availability}</span>
                          ) : (
                            <span className="text-red-600 font-medium">{product.availability}</span>
                          )}
                        </p>
                        {product.category && (
                          <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            {product.category}
                          </span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                        currentPage === 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                        currentPage === totalPages 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * productsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * productsPerPage, totalProducts)}
                        </span>{' '}
                        of <span className="font-medium">{totalProducts}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ${
                            currentPage === 1 
                              ? 'bg-gray-100 cursor-not-allowed' 
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* First page */}
                        {currentPage > 2 && (
                          <button
                            onClick={() => paginate(1)}
                            className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                          >
                            1
                          </button>
                        )}
                        
                        {/* Ellipsis */}
                        {currentPage > 3 && (
                          <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                            ...
                          </span>
                        )}
                        
                        {/* Previous page */}
                        {currentPage > 1 && (
                          <button
                            onClick={() => paginate(currentPage - 1)}
                            className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                          >
                            {currentPage - 1}
                          </button>
                        )}
                        
                        {/* Current page */}
                        <button
                          className="relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          {currentPage}
                        </button>
                        
                        {/* Next page */}
                        {currentPage < totalPages && (
                          <button
                            onClick={() => paginate(currentPage + 1)}
                            className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                          >
                            {currentPage + 1}
                          </button>
                        )}
                        
                        {/* Ellipsis */}
                        {currentPage < totalPages - 2 && (
                          <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                            ...
                          </span>
                        )}
                        
                        {/* Last page */}
                        {currentPage < totalPages - 1 && totalPages > 1 && (
                          <button
                            onClick={() => paginate(totalPages)}
                            className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                          >
                            {totalPages}
                          </button>
                        )}
                        
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ${
                            currentPage === totalPages 
                              ? 'bg-gray-100 cursor-not-allowed' 
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria or reset filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
