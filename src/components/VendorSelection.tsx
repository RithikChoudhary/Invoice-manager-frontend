import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { vendorsAPI } from '../services/api';


interface Vendor {
  _id: string;
  name: string;
  display_name: string;
  category: string;
  typical_email_domains: string[];
  is_global: boolean;
  usage_count: number;
}

interface UserPreferences {
  selected_vendors: Array<{
    vendor_id: string;
    vendor_name: string;
    email_domains: string[];
    is_custom: boolean;
  }>;
  custom_vendors: Array<{
    vendor_id: string;
    vendor_name: string;
    email_domains: string[];
    category: string;
    is_custom: boolean;
  }>;
  scan_settings: {
    days_back: number;
    include_attachments: boolean;
    auto_scan_enabled: boolean;
  };
}

const VendorSelection: React.FC = () => {
  const {  isAuthenticated, loading } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [selectedVendorIds, setSelectedVendorIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // New vendor form
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: '',
    email_domains: [''],
    category: 'software'
  });

  useEffect(() => {
    if (!loading && isAuthenticated) {
      loadData();
    } else if (!loading && !isAuthenticated) {
      setIsLoading(false);
    }
  }, [isAuthenticated, loading]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load available vendors and user preferences in parallel
      const [vendorsResponse, preferencesResponse] = await Promise.all([
        vendorsAPI.getAvailable(),
        vendorsAPI.getUserPreferences()
      ]);

      setVendors(vendorsResponse);
      setUserPreferences(preferencesResponse.data); // Fix: Extract the actual data

      const actualPreferences = preferencesResponse.data; // The real preferences data

      console.log('📊 Loaded data:', {
        vendorsCount: vendorsResponse.data?.length,
        preferences: preferencesResponse.data,
        actualPreferencesData: actualPreferences,
        selectedVendorsInPrefs: actualPreferences?.selected_vendors?.length || 0
      });

      // Set selected vendor IDs - Fix: Use the correct data path
      if (actualPreferences?.selected_vendors && actualPreferences.selected_vendors.length > 0) {
        const selectedIds = new Set<string>(
          actualPreferences.selected_vendors.map((v: any) => v.vendor_id)
        );
        console.log('✅ Setting selected vendor IDs:', Array.from(selectedIds));
        console.log('🔍 First few selected vendors:', actualPreferences.selected_vendors.slice(0, 3));
        
        // Debug: Check if vendor IDs match available vendors
        console.log('🔍 Available vendor IDs (first 5):', vendorsResponse.slice(0, 5).map((v: any) => v._id));
        console.log('🔍 Selected IDs vs Available ID format match check:');
        selectedIds.forEach(id => {
          const foundVendor = vendorsResponse.find((v: any) => v._id === id);
          console.log(`   ${id}: ${foundVendor ? '✅ FOUND' : '❌ NOT FOUND'}`);
        });
        
        setSelectedVendorIds(selectedIds);
      } else {
        console.log('⚠️ No selected vendors found in preferences');
        console.log('🔍 Full response structure:', preferencesResponse.data);
        console.log('🔍 Actual preferences data:', actualPreferences);
      }

    } catch (err: any) {
      console.error('Error loading vendor data:', err);
      setError(err.response?.data?.detail || 'Failed to load vendor data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVendorToggle = (vendorId: string) => {
    const newSelected = new Set(selectedVendorIds);
    if (newSelected.has(vendorId)) {
      newSelected.delete(vendorId);
    } else {
      newSelected.add(vendorId);
    }
    setSelectedVendorIds(newSelected);
  };

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const selectedVendorIdsArray = Array.from(selectedVendorIds);
      console.log('🔍 Saving preferences:', {
        selectedVendorIds: selectedVendorIdsArray,
        count: selectedVendorIdsArray.length
      });

      // const selectedVendors = selectedVendorIdsArray.map(vendorId => {
      //   const vendor = vendors.find(v => v._id === vendorId);
      //   return {
      //     vendor_id: vendorId,
      //     vendor_name: vendor?.display_name || vendor?.name || 'Unknown',
      //     email_domains: vendor?.typical_email_domains || [],
      //     is_custom: !vendor?.is_global
      //   };
      // });

      const payload = {
        selected_vendors: selectedVendorIdsArray,
        custom_vendors: userPreferences?.custom_vendors || [],
        scan_settings: userPreferences?.scan_settings
      };

      console.log('📤 Sending payload:', payload);

      const response = await vendorsAPI.savePreferences(payload);
      console.log('✅ Save response:', response.data);

      alert('Vendor preferences saved successfully!');
      
      // Reload preferences to get updated data
      await loadData();

    } catch (err: any) {
      console.error('Error saving preferences:', err);
      setError(err.response?.data?.detail || 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCustomVendor = async () => {
    try {
      setError(null);
      
      // Validate form
      if (!newVendor.name.trim()) {
        setError('Vendor name is required');
        return;
      }
      
      const validDomains = newVendor.email_domains.filter(domain => domain.trim());
      if (validDomains.length === 0) {
        setError('At least one email domain is required');
        return;
      }

      await vendorsAPI.addCustomVendor({
        name: newVendor.name,
        email_domains: validDomains,
        category: newVendor.category
      });

      // Reset form and reload data
      setNewVendor({ name: '', email_domains: [''], category: 'software' });
      setShowAddVendor(false);
      await loadData();
      
      alert('Custom vendor added successfully!');

    } catch (err: any) {
      console.error('Error adding custom vendor:', err);
      setError(err.response?.data?.detail || 'Failed to add custom vendor');
    }
  };

  const addEmailDomainField = () => {
    setNewVendor(prev => ({
      ...prev,
      email_domains: [...prev.email_domains, '']
    }));
  };

  const updateEmailDomain = (index: number, value: string) => {
    setNewVendor(prev => ({
      ...prev,
      email_domains: prev.email_domains.map((domain, i) => i === index ? value : domain)
    }));
  };

  const removeEmailDomain = (index: number) => {
    setNewVendor(prev => ({
      ...prev,
      email_domains: prev.email_domains.filter((_, i) => i !== index)
    }));
  };

  // Show authentication prompt if not logged in
  if (!loading && !isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            Authentication Required
          </h2>
          <p className="text-yellow-700 mb-4">
            Please log in to manage your vendor preferences and access the invoice scanning system.
          </p>
          <a
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (loading || isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading vendor preferences...</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter vendors based on search term
  const filteredVendors = vendors.filter(vendor => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = (vendor.display_name || vendor.name || '').toLowerCase().includes(searchLower);
    const categoryMatch = (vendor.category || '').toLowerCase().includes(searchLower);
    const domainMatch = (vendor.typical_email_domains || []).some((domain: string) => 
      domain.toLowerCase().includes(searchLower)
    );
    
    return nameMatch || categoryMatch || domainMatch;
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Vendor Preferences</h1>
        <p className="text-gray-600">
          Select the vendors you want to scan for invoices. Only emails from your selected vendors will be processed.
        </p>
      </div>

      {/* Selected Vendors Summary */}
      {selectedVendorIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-1">
                📋 {selectedVendorIds.size} Vendors Selected
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedVendorIds).slice(0, 5).map(vendorId => {
                  const vendor = vendors.find(v => v._id === vendorId);
                  return (
                    <span
                      key={vendorId}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {vendor?.display_name || vendor?.name || 'Unknown'}
                    </span>
                  );
                })}
                {selectedVendorIds.size > 5 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    +{selectedVendorIds.size - 5} more
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleSavePreferences}
              disabled={isSaving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Selected Vendors Summary */}
      {selectedVendorIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">
            Selected Vendors ({selectedVendorIds.size})
          </h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedVendorIds).map(vendorId => {
              const vendor = vendors.find(v => v._id === vendorId);
              return (
                <span
                  key={vendorId}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {vendor?.display_name || vendor?.name}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Vendors */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Available Vendors ({filteredVendors.length} of {vendors.length})
          </h2>
          <button
            onClick={() => setShowAddVendor(!showAddVendor)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            + Add Custom Vendor
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search vendors by name, category, or email domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Add Custom Vendor Form */}
        {showAddVendor && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Add Custom Vendor</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., My Custom SaaS"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newVendor.category}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="software">Software</option>
                  <option value="cloud">Cloud</option>
                  <option value="billing">Billing</option>
                  <option value="marketing">Marketing</option>
                  <option value="analytics">Analytics</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Domains *
              </label>
              {newVendor.email_domains.map((domain, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => updateEmailDomain(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., billing@vendor.com"
                  />
                  {newVendor.email_domains.length > 1 && (
                    <button
                      onClick={() => removeEmailDomain(index)}
                      className="text-red-600 hover:text-red-700 px-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addEmailDomainField}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                + Add another domain
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddCustomVendor}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Vendor
              </button>
              <button
                onClick={() => setShowAddVendor(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Vendor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor._id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedVendorIds.has(vendor._id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleVendorToggle(vendor._id)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">
                  {vendor.display_name || vendor.name}
                </h3>
                <input
                  type="checkbox"
                  checked={selectedVendorIds.has(vendor._id)}
                  onChange={() => handleVendorToggle(vendor._id)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              
              <p className="text-sm text-gray-600 mb-2 capitalize">
                {vendor.category}
              </p>
              
              {vendor.typical_email_domains.length > 0 && (
                <div className="text-xs text-gray-500">
                  <p className="font-medium mb-1">Email domains:</p>
                  <div className="flex flex-wrap gap-1">
                    {vendor.typical_email_domains.slice(0, 2).map((domain, index) => (
                      <span key={index} className="bg-gray-100 px-2 py-1 rounded">
                        {domain}
                      </span>
                    ))}
                    {vendor.typical_email_domains.length > 2 && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        +{vendor.typical_email_domains.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {!vendor.is_global && (
                <div className="mt-2">
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                    Custom
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {vendors.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No vendors available. Please check your connection or contact support.
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSavePreferences}
          disabled={isSaving || selectedVendorIds.size === 0}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isSaving || selectedVendorIds.size === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSaving ? 'Saving...' : `Save ${selectedVendorIds.size} Selected Vendors`}
        </button>
      </div>
    </div>
  );
};

export default VendorSelection; 