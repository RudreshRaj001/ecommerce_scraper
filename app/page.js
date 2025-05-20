"use client";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [category, setCategory] = useState("");
  const [availability, setAvailability] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [crawlStatus, setCrawlStatus] = useState("");

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
      if (query) params.append("q", query);
      if (minPrice) params.append("min_price", minPrice);
      if (maxPrice) params.append("max_price", maxPrice);
      if (category) params.append("category", category);
      if (availability) params.append("availability", availability);

      // Add pagination parameters
      const skip = (currentPage - 1) * productsPerPage;
      params.append("skip", skip.toString());
      params.append("limit", productsPerPage.toString());

      const res = await axios.get(
        `http://localhost:5000/api/products?${params.toString()}`
      );
      const result = Array.isArray(res.data) ? res.data : res.data.products;
      setProducts(result);
      const isLastPage = result.length < productsPerPage;
      if (isLastPage) {
        setTotalProducts((currentPage - 1) * productsPerPage + result.length);
      } else {
        setTotalProducts((currentPage + 1) * productsPerPage); // optimistic estimate
      }
      // Handle both formats

      // Get total count from the response header or data
      // Many APIs include total count in headers or response body
      if (res.data.total) {
        setTotalProducts(res.data.total);
      } else if (res.headers["x-total-count"]) {
        setTotalProducts(parseInt(res.headers["x-total-count"]));
      } else {
        // Fallback: If API doesn't provide total count, estimate based on current page results
        // This is not ideal but prevents the 404 error
        const isLastPage = res.data.length < productsPerPage;
        if (isLastPage) {
          setTotalProducts(
            (currentPage - 1) * productsPerPage + res.data.length
          );
        } else if (currentPage === 1) {
          // Can't accurately estimate total, just show what we have
          setTotalProducts(
            res.data.length > 0
              ? Math.max(productsPerPage * 2, res.data.length)
              : 0
          );
        }
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      // If error occurs, set products to empty array and total to zero
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };

  const triggerCrawl = async () => {
    setCrawlStatus("Crawling...");
    try {
      const res = await axios.post("http://localhost:5000/api/crawl");
      setCrawlStatus(res.data.message);
      // Refresh products after successful crawl
      fetchProducts();
    } catch (err) {
      console.error("Crawl error:", err);
      setCrawlStatus(
        "Error during crawl: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on new search
    fetchProducts();
  };

  const totalPages = Math.max(1, Math.ceil(totalProducts / productsPerPage));

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
            Product Finder
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Find the perfect product for your needs
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label
                htmlFor="query"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search
              </label>
              <input
                id="query"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="minprice"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Min Price
              </label>
              <input
                id="minprice"
                type="number"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="maxprice"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Max Price
              </label>
              <input
                id="maxprice"
                type="number"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
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
                  setQuery("");
                  setMinPrice("");
                  setMaxPrice("");
                  setCategory("");
                  setAvailability("");
                  setCurrentPage(1);
                  // Call fetchProducts after reset to update the view
                  setTimeout(fetchProducts, 0);
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
                  {products.map((product, index) => (
                    <a
                      key={product.id || index}
                      href={`/product/${product.id || index}`}
                      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-200 flex flex-col h-full group"
                    >
                      <div className="h-48 overflow-hidden bg-gray-200">
                        <img
                          src={product.image_url || "/placeholder.png"}
                          alt={product.name}
                          className="h-full w-full object-cover transform group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            e.target.src = "/placeholder.png";
                          }}
                        />
                      </div>
                      <div className="p-4 flex-grow">
                        <h2 className="font-semibold text-lg text-gray-800 mb-1 group-hover:text-indigo-600">
                          {product.name}
                        </h2>
                        <p className="font-bold text-indigo-600 text-xl mb-2">
                          ${parseFloat(product.price).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                          {product.availability === "In Stock" ? (
                            <span className="text-green-600 font-medium">
                              {product.availability}
                            </span>
                          ) : (
                            <span className="text-red-600 font-medium">
                              {product.availability}
                            </span>
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
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                    >
                      Previous
                    </button>

                    <span className="px-4 py-2">{`Page ${currentPage}`}</span>

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={products.length < productsPerPage}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No products found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search criteria or reset filters.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
