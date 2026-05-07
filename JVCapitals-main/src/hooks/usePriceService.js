import { useState, useEffect, useCallback } from 'react';
import { priceService } from '../services/priceService';

export const usePriceService = () => {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Ethereum price
  const fetchEthereumPrice = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const price = await priceService.getEthereumPrice();
      setPrices(prev => ({ ...prev, ethereum: price }));
      return price;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch multiple prices
  const fetchPrices = useCallback(async (cryptoIds = ['ethereum']) => {
    setLoading(true);
    setError(null);
    
    try {
      const newPrices = await priceService.getPrices(cryptoIds);
      setPrices(prev => ({ ...prev, ...newPrices }));
      return newPrices;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch Ethereum price on mount
  useEffect(() => {
    fetchEthereumPrice();
  }, [fetchEthereumPrice]);

  // Refresh prices
  const refreshPrices = useCallback(() => {
    return fetchEthereumPrice();
  }, [fetchEthereumPrice]);

  // Clear cache
  const clearCache = useCallback(() => {
    priceService.clearCache();
  }, []);

  return {
    prices,
    ethereumPrice: prices.ethereum,
    loading,
    error,
    fetchEthereumPrice,
    fetchPrices,
    refreshPrices,
    clearCache,
  };
};
