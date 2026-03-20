'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Pharmacy {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  phone: string;
  rating: number;
  operatingHours: {
    open: string;
    close: string;
  };
  availableMedicine?: {
    name: string;
    quantity: number;
    price: number;
    manufacturer: string;
    category: string;
  };
  distance?: number;
}

export default function PharmacySearch({ prescription }: { prescription?: string[] }) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [city, setCity] = useState('');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);

  const dummyPharmacies: Pharmacy[] = [
    {
      _id: 'dummy-1',
      name: 'City Care Pharmacy',
      address: { street: '12 MG Road', city: 'Chennai', state: 'TN', pincode: '600001' },
      phone: '+91-98765-43210',
      rating: 4.6,
      operatingHours: { open: '09:00', close: '21:00' },
      availableMedicine: {
        name: 'Paracetamol 650mg',
        quantity: 24,
        price: 55,
        manufacturer: 'HealWell Labs',
        category: 'Analgesic',
      },
      distance: 1.2,
    },
    {
      _id: 'dummy-2',
      name: 'Green Cross Meds',
      address: { street: '45 Health Street', city: 'Bengaluru', state: 'KA', pincode: '560001' },
      phone: '+91-91234-56780',
      rating: 4.3,
      operatingHours: { open: '08:30', close: '22:00' },
      availableMedicine: {
        name: 'Amoxicillin 500mg',
        quantity: 4,
        price: 120,
        manufacturer: 'Medicare Pharma',
        category: 'Antibiotic',
      },
      distance: 3.5,
    },
    {
      _id: 'dummy-3',
      name: 'Neighborhood Pharmacy',
      address: { street: '7 Lake View', city: 'Hyderabad', state: 'TS', pincode: '500001' },
      phone: '+91-99876-54321',
      rating: 4.1,
      operatingHours: { open: '10:00', close: '20:00' },
      availableMedicine: {
        name: 'Metformin 500mg',
        quantity: 0,
        price: 95,
        manufacturer: 'GlucoseCare',
        category: 'Diabetes',
      },
      distance: 5.8,
    },
  ];

  useEffect(() => {
    if (prescription && prescription.length > 0) {
      setSearchTerm(prescription[0]);
      searchPharmacies(prescription[0]);
    }
  }, [prescription]);

  const searchPharmacies = async (medicine?: string) => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      
      if (medicine || searchTerm) {
        params.append('medicine', medicine || searchTerm);
      }
      
      if (city) {
        params.append('city', city);
      }

      const response = await fetch(`/api/pharmacies?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        const apiPharmacies: Pharmacy[] = data.pharmacies || [];

        const termLower = (medicine || searchTerm).trim().toLowerCase();
        const cityLower = city.trim().toLowerCase();

        const filteredDummy = dummyPharmacies.filter((p) => {
          if (cityLower && p.address.city.toLowerCase() !== cityLower) return false;
          if (!termLower) return true;
          const medName = p.availableMedicine?.name?.toLowerCase() || '';
          return medName.includes(termLower);
        });

        if (apiPharmacies.length === 0) {
          // Fallback to dummy data so UI is not empty in demo mode
          setPharmacies(filteredDummy);
        } else {
          setPharmacies(apiPharmacies);
        }
        setShowResults(true);
      } else {
        throw new Error('Failed to fetch pharmacies');
      }
    } catch (error) {
      console.error('Error searching pharmacies:', error);
      // Demo fallback when backend is empty/unavailable
      const termLower = (medicine || searchTerm).trim().toLowerCase();
      const cityLower = city.trim().toLowerCase();
      const filteredDummy = dummyPharmacies.filter((p) => {
        if (cityLower && p.address.city.toLowerCase() !== cityLower) return false;
        if (!termLower) return true;
        const medName = p.availableMedicine?.name?.toLowerCase() || '';
        return medName.includes(termLower);
      });

      setError('Failed to search pharmacies. Showing demo results instead.');
      setPharmacies(filteredDummy);
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchPharmacies();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { text: t('outOfStock'), color: 'text-red-600 bg-red-50' };
    if (quantity < 5) return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-50' };
    return { text: 'Available', color: 'text-green-600 bg-green-50' };
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">{t('pharmacy')}</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">{t('online')}</span>
        </div>
      </div>

      {/* Search Section */}
      <div className="space-y-4 mb-6">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('searchMedicines')}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : t('search')}
          </button>
        </div>

        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city for local results..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Results */}
      {showResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {pharmacies.length} pharmacies found
            </h3>
            {pharmacies.length === 0 && (
              <p className="text-sm text-gray-500">Try searching with different terms</p>
            )}
          </div>

          {pharmacies.map((pharmacy) => (
            <div key={pharmacy._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{pharmacy.name}</h4>
                  <p className="text-sm text-gray-600">
                    {pharmacy.address.street}, {pharmacy.address.city}, {pharmacy.address.state} {pharmacy.address.pincode}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">⭐</span>
                      <span>{pharmacy.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-500">📞</span>
                      <span>{pharmacy.phone}</span>
                    </div>
                    {pharmacy.distance && (
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500">📍</span>
                        <span>{pharmacy.distance.toFixed(1)} km</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    Open: {pharmacy.operatingHours.open} - {pharmacy.operatingHours.close}
                  </p>
                </div>
              </div>

              {pharmacy.availableMedicine && (
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium text-gray-900">
                        {pharmacy.availableMedicine.name}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {pharmacy.availableMedicine.manufacturer} • {pharmacy.availableMedicine.category}
                      </p>
                      <p className="text-sm text-gray-500">
                        {pharmacy.availableMedicine.quantity} units available
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{pharmacy.availableMedicine.price}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStockStatus(pharmacy.availableMedicine.quantity).color}`}>
                        {getStockStatus(pharmacy.availableMedicine.quantity).text}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-3">
                    <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                      Contact Pharmacy
                    </button>
                    <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                      Get Directions
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {showResults && pharmacies.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏪</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pharmacies found</h3>
          <p className="text-gray-600 mb-4">
            Try searching with different medicine names or locations
          </p>
        </div>
      )}
    </div>
  );
}
