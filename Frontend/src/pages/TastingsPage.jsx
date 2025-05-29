import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Ensure correct path to AuthContext

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Import tasting and whiskey components
import TastingList from '../components/tasting/TastingList';
import TastingForm from '../components/tasting/TastingForm';
// import { fetchWhiskeysForDropdown } from '../services/api'; // Or similar function for actual API calls

// Import icons from lucide-react
import { PlusCircle, Search, Filter, X, SlidersHorizontal, Star, CalendarDays } from 'lucide-react';

// --- Mock API functions - Replace with your actual API calls ---
const fetchWhiskeysForDropdownApi = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: 'w1', name: 'Lagavulin 16 Year Old' },
        { id: 'w2', name: 'Glenfiddich 12 Year Old' },
        { id: 'w3', name: 'Ardbeg Uigeadail' },
        { id: 'w4', name: 'Yamazaki 12 Year Old' },
        // ...add more whiskeys from your collection
      ]);
    }, 300);
  });
};

const fetchTastingsFromApi = async (filters = {}, sortBy = 'tasting_date_desc', page = 1, limit = 15) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const mockTastings = [
        {
          id: 't1',
          whiskey_id: 'w1', // Linked to Lagavulin
          rating: 4.5, // Can be 1-5 or 1-100, adapt to your form
          tasting_date: '2024-07-15',
          notes: 'Very smoky, peaty, iodine, slight sweetness of dried fruits.',
          color: 'Deep amber',
          nose_notes: ['Peat', 'Bonfire smoke', 'Sea salt'],
          palate_notes: ['Dark chocolate', 'Black pepper', 'Figs'],
          finish_notes: ['Long', 'Warm', 'Smoky'],
          image_url: 'https://via.placeholder.com/150/A0522D/FFFFFF?text=Tasting1'
        },
        {
          id: 't2',
          whiskey_id: 'w2', // Linked to Glenfiddich
          rating: 3.8,
          tasting_date: '2024-06-20',
          notes: 'Fruity, light, hints of pear and apple. Medium finish.',
          color: 'Pale gold',
          nose_notes: ['Green apple', 'Pear', 'Floral'],
          palate_notes: ['Honey', 'Vanilla', 'Light oak'],
          finish_notes: ['Medium', 'Clean'],
        },
        {
          id: 't3',
          whiskey_id: 'w4', // Linked to Yamazaki
          rating: 5,
          tasting_date: '2024-05-01',
          notes: 'Very complex, tropical fruits, delicate spices, Japanese oak (Mizunara). Simply excellent.',
          color: 'Deep gold',
          nose_notes: ['Pineapple', 'Coconut', 'Incense'],
          palate_notes: ['Apricot', 'Vanilla', 'Nutmeg', 'Mizunara oak'],
          finish_notes: ['Very long', 'Spicy', 'Fruity'],
          image_url: 'https://via.placeholder.com/150/B8860B/FFFFFF?text=TastingYam'
        },
      ];

      let filteredTastings = mockTastings;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        // You'll need to link to whiskeyName here if it's available, or filter only by notes
        filteredTastings = filteredTastings.filter(t =>
          t.notes?.toLowerCase().includes(searchLower)
          // Or (whiskeyMap[t.whiskey_id]?.name.toLowerCase().includes(searchLower))
        );
      }
      if (filters.whiskey_id && filters.whiskey_id !== 'all') {
        filteredTastings = filteredTastings.filter(t => t.whiskey_id === filters.whiskey_id);
      }
      if (filters.min_rating && filters.min_rating !== 'all') {
        filteredTastings = filteredTastings.filter(t => t.rating >= parseFloat(filters.min_rating));
      }

      filteredTastings.sort((a, b) => {
        switch (sortBy) {
          case 'tasting_date_desc':
            return new Date(b.tasting_date).getTime() - new Date(a.tasting_date).getTime();
          case 'tasting_date_asc':
            return new Date(a.tasting_date).getTime() - new Date(b.tasting_date).getTime();
          case 'rating_desc':
            return (b.rating || 0) - (a.rating || 0);
          case 'rating_asc':
            return (a.rating || 0) - (b.rating || 0);
          default:
            return 0;
        }
      });

      resolve({
        tastings: filteredTastings,
        totalCount: filteredTastings.length,
      });
    }, 700);
  });
};

const saveTastingToApi = async (tastingData) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const savedTasting = { ...tastingData, id: 't' + Math.random().toString(36).substring(7) };
      console.log("Tasting saved (mock):", savedTasting);
      resolve(savedTasting);
    }, 900);
  });
};

const updateTastingInApi = async (tastingId, tastingData) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const updatedTasting = { ...tastingData, id: tastingId };
      console.log("Tasting updated (mock):", updatedTasting);
      resolve(updatedTasting);
    }, 750);
  });
};

const deleteTastingFromApi = async (tastingId) => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("Tasting deleted (mock):", tastingId);
      resolve(true);
    }, 450);
  });
};
// --- End of mock API functions ---


export default function TastingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State variables for data and loading
  const [tastings, setTastings] = useState([]);
  const [whiskeysForFilter, setWhiskeysForFilter] = useState([]); // List of whiskeys for the form and filter dropdowns
  const [whiskeyMap, setWhiskeyMap] = useState({}); // Map of whiskey IDs to names for easy lookup
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State variables for filters
  const [searchTerm, setSearchTerm] = useState(''); // Search in tasting notes, whiskey name
  const [selectedWhiskeyFilter, setSelectedWhiskeyFilter] = useState('all');
  const [minRatingFilter, setMinRatingFilter] = useState('all'); // Filter by minimum rating (e.g., 1-5 or 1-100)
  const [sortBy, setSortBy] = useState('tasting_date_desc'); // Sorting preference
  const [showFilters, setShowFilters] = useState(false); // Toggle visibility of filter section

  // State variables for Dialog (formerly Modal)
  const [showAddDialog, setShowAddDialog] = useState(false); // Controls visibility of the add/edit dialog
  const [editingTasting, setEditingTasting] = useState(null); // Stores tasting data if editing an existing one
  const [isSubmitting, setIsSubmitting] = useState(false); // Indicates if form is currently submitting
  const [preselectedWhiskeyId, setPreselectedWhiskeyId] = useState(null); // Pre-selects a whiskey in the form, often from a URL param


  // Effect to load whiskeys for filter and form dropdowns on component mount
  useEffect(() => {
    const loadWhiskeys = async () => {
      try {
        const fetchedWhiskeys = await fetchWhiskeysForDropdownApi();
        setWhiskeysForFilter(fetchedWhiskeys || []);
        const map = {};
        (fetchedWhiskeys || []).forEach(w => { map[w.id] = w.name; });
        setWhiskeyMap(map);
      } catch (err) {
        console.error("Error fetching whiskeys for filter:", err);
        setError("Error loading whiskey list for filters.");
      }
    };
    loadWhiskeys();
  }, []);
  
  // Function to load tastings from the API based on current filters and sort order
  const loadTastings = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {
        search: searchTerm,
        whiskey_id: selectedWhiskeyFilter,
        min_rating: minRatingFilter,
      };
      const result = await fetchTastingsFromApi(filters, sortBy);
      setTastings(result.tastings);
    } catch (err) {
      console.error("Error loading tastings:", err);
      setError("Error loading tasting log.");
    } finally {
      setLoading(false);
    }
  };

  // Effect to re-load tastings whenever filter or sort states change
  useEffect(() => {
    // Only load tastings after the whiskey map is available, or if there are no whiskeys
    if (Object.keys(whiskeyMap).length > 0 || whiskeysForFilter.length === 0) {
        loadTastings();
    }
  }, [searchTerm, selectedWhiskeyFilter, minRatingFilter, sortBy, whiskeyMap]);

  // Effect to check URL parameters for opening the add tasting dialog
  useEffect(() => {
    const addParam = searchParams.get('add');
    const whiskeyIdParam = searchParams.get('whiskeyId');
    if (addParam === 'true') {
      if (whiskeyIdParam) {
        setPreselectedWhiskeyId(whiskeyIdParam);
      }
      setEditingTasting(null); // Ensure this is for adding a new tasting
      setShowAddDialog(true);
    } else {
      setPreselectedWhiskeyId(null);
    }
  }, [searchParams]);

  // Event handler to open the add new tasting dialog
  const handleAddTasting = () => {
    setEditingTasting(null); // Clear any existing tasting data
    setPreselectedWhiskeyId(null); // Clear any pre-selected whiskey
    setShowAddDialog(true);
    // Update URL parameters to reflect the dialog state
    const newParams = new URLSearchParams(searchParams);
    newParams.set('add', 'true');
    newParams.delete('whiskeyId'); // Remove whiskeyId if present
    setSearchParams(newParams);
  };

  // Event handler to open the edit tasting dialog
  const handleEditTasting = (tasting) => {
    setEditingTasting(tasting); // Set the tasting data to be edited
    setPreselectedWhiskeyId(null); // No pre-selection when editing
    setShowAddDialog(true);
  };

  // Event handler to delete a tasting
  const handleDeleteTasting = async (tastingId) => {
    if (!window.confirm("Are you sure you want to delete this tasting?")) {
      return;
    }
    try {
      await deleteTastingFromApi(tastingId);
      await loadTastings(); // Refresh the tasting list after deletion
    } catch (err) {
      console.error("Error deleting tasting:", err);
      alert(err.message || "Error deleting the tasting.");
    }
  };
  
  // Event handler to navigate to tasting details page
  const handleViewTastingDetails = (tastingId) => {
    navigate(`/tastings/${tastingId}`);
  };

  // Event handler to save (add or update) a tasting
  const handleSaveTasting = async (tastingData) => {
    setIsSubmitting(true);
    setError('');
    try {
      if (editingTasting) {
        await updateTastingInApi(editingTasting.id, tastingData);
      } else {
        await saveTastingToApi(tastingData);
      }
      setShowAddDialog(false); // Close the dialog on successful save
      setEditingTasting(null); // Clear editing state
      // Clean up URL parameters after dialog closes
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('add');
      newParams.delete('whiskeyId');
      setSearchParams(newParams);
      await loadTastings(); // Refresh the tasting list after saving
    } catch (err) {
      console.error("Error saving tasting:", err);
      setError(err.message || "Error saving the tasting.");
      // Keep the dialog open for the user to see the error message
    } finally {
      setIsSubmitting(false);
    }
  };

  // Event handler to close the add/edit dialog
  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingTasting(null);
    setPreselectedWhiskeyId(null);
    setError(''); // Clear any errors displayed in the form
    // Clean up URL parameters
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('add');
    newParams.delete('whiskeyId');
    setSearchParams(newParams);
  };
  
  // Function to clear all applied filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedWhiskeyFilter('all');
    setMinRatingFilter('all');
    setSortBy('tasting_date_desc');
  };

  // Check if any filters are currently active
  const hasActiveFilters = searchTerm || selectedWhiskeyFilter !== 'all' || minRatingFilter !== 'all';

  // Helper function to get whiskey name by ID from the map
  const getWhiskeyNameById = (whiskeyId) => {
    return whiskeyMap[whiskeyId] || 'Unknown Whiskey';
  };

  // Show a loading spinner if data is being fetched initially
  if (loading && tastings.length === 0 && Object.keys(whiskeyMap).length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]" dir="rtl">
        <LoadingSpinner size="lg" message="Loading tasting log..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6" dir="rtl">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">
            My Tasting Log
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {tastings.length} documented tastings
          </p>
        </div>
        <Button onClick={handleAddTasting} className="bg-sky-600 hover:bg-sky-700 text-white">
          <PlusCircle className="ml-2 rtl:mr-2 h-5 w-5" />
          Add Tasting
        </Button>
      </header>

      {/* Search and Filters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search tasting notes, whiskey name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 rtl:pl-10 rtl:pr-3 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="dark:border-gray-600 dark:text-gray-300"
          >
            <SlidersHorizontal className="ml-2 rtl:mr-2 h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Specific Whiskey
              </label>
              <Select value={selectedWhiskeyFilter} onChange={(e) => setSelectedWhiskeyFilter(e.target.value)}>
                <option value="all">All Whiskeys</option>
                {whiskeysForFilter.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minimum Rating (1-5)
              </label>
              <Select value={minRatingFilter} onChange={(e) => setMinRatingFilter(e.target.value)}>
                <option value="all">All Ratings</option>
                {[1, 2, 3, 3.5, 4, 4.5, 5].map(r => (
                  <option key={r} value={r.toString()}>{r}+ stars</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort by
              </label>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="tasting_date_desc">Date (Newest to Oldest)</option>
                <option value="tasting_date_asc">Date (Oldest to Newest)</option>
                <option value="rating_desc">Rating (High to Low)</option>
                <option value="rating_asc">Rating (Low to High)</option>
              </Select>
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700 mt-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active Filters</span>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="ml-1 rtl:mr-1 h-4 w-4" />
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Tasting List Component */}
      <TastingList
        tastings={tastings}
        whiskeyMap={whiskeyMap} // Pass the map instead of a function for better performance
        loading={loading}
        onEdit={handleEditTasting}
        onDelete={handleDeleteTasting}
        onViewDetails={handleViewTastingDetails}
        emptyStateMessage={
          hasActiveFilters
            ? "No tastings found matching the search. Try changing the filters."
            : "You haven't logged any tastings yet. Add your first experience!"
        }
        pageNameForAdd="TastingsPage" // Used for an "Add" button within the component if no tastings are present
      />

      {/* Add/Edit Tasting Dialog */}
      {showAddDialog && (
        <Dialog // Main Dialog component
          open={showAddDialog} // 'open' prop controls visibility
          onOpenChange={setShowAddDialog} // Callback for when the open state changes (e.g., user clicks outside)
        >
          <DialogContent className="sm:max-w-[425px] md:max-w-[700px] lg:max-w-[900px]"> {/* Adjust max-width as needed */}
            <DialogHeader>
              <DialogTitle>
                {editingTasting ? `Edit Tasting of ${getWhiskeyNameById(editingTasting.whiskey_id)}` : "Add New Tasting"}
              </DialogTitle>
              <DialogDescription>
                {editingTasting ? "Make changes to your tasting details here." : "Fill in the details for your new tasting entry."}
              </DialogDescription>
            </DialogHeader>
            <TastingForm
              initialTasting={editingTasting}
              whiskeys={whiskeysForFilter} // Pass the list of whiskeys to the form
              preselectedWhiskeyId={preselectedWhiskeyId}
              onSubmit={handleSaveTasting}
              onCancel={handleCloseDialog} // Function to close the dialog
              isSubmitting={isSubmitting}
              // error={error} // You can pass a specific error to the form if needed
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}