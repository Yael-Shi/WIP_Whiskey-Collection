import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

import { Card } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import {
  Search,
  Compass,
  TrendingUp,
  Star,
  Filter,
  X,
  MapPin,
  DollarSign,
  Sparkles,
  BookOpen,
  Users,
  Award,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { regions, types } from '../components/utils/whiskeyData'; // Ensure correct path

import { useAuth } from '../contexts/AuthContext'; // Ensure correct path

// --- ACTUAL API Functions (Placeholder for real implementation) ---
// These functions would make actual HTTP requests to your backend
const getPersonalizedRecommendationsApi = async (userId, preferences = {}) => {
  try {
    // Replace with your actual backend API endpoint
    const response = await fetch(
      `/api/recommendations/personalized?userId=${userId}&${new URLSearchParams(preferences)}`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch personalized recommendations:', error);
    // Fallback to mock data or return empty array if API fails
    return []; // Or throw error to be handled by caller
  }
};

const searchWhiskeysApi = async (searchParams) => {
  try {
    const queryString = new URLSearchParams(searchParams).toString();
    // Replace with your actual backend API endpoint
    const response = await fetch(`/api/whiskeys/search?${queryString}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data; // Expected: { results: [], totalFound: number, searchTime: number }
  } catch (error) {
    console.error('Failed to search whiskeys:', error);
    // Fallback to mock data or return empty results
    return { results: [], totalFound: 0, searchTime: 0 }; // Or throw error
  }
};

const getTrendingWhiskeysApi = async () => {
  try {
    // Replace with your actual backend API endpoint
    const response = await fetch('/api/whiskeys/trending');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Ensure each trending whiskey has a unique ID if your backend doesn't provide one
    return data.map((item, index) => ({
      ...item,
      id: item.id || `trending-${index}`,
    }));
  } catch (error) {
    console.error('Failed to fetch trending whiskeys:', error);
    // Fallback to mock data or return empty array
    return []; // Or throw error
  }
};

// --- Extracted Components to fix react/no-unstable-nested-components ---
const WhiskeyRecommendationCard = ({ recommendation }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
    <div className="flex flex-col md:flex-row">
      <div className="md:w-1/3 h-48 md:h-auto bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        {recommendation.whiskey.image_url ? (
          <img
            src={recommendation.whiskey.image_url}
            alt={recommendation.whiskey.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400 dark:text-gray-500">
            <Sparkles size={48} />
          </div>
        )}
      </div>
      <div className="md:w-2/3 p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {recommendation.whiskey.name}
          </h3>
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <Star size={16} fill="currentColor" />
            <span className="text-sm font-medium">
              {Math.round(recommendation.confidence * 100)}% התאמה
            </span>
          </div>
        </div>

        <div className="text-gray-600 dark:text-gray-400 mb-3">
          <p>
            <strong>{recommendation.whiskey.distillery}</strong> •{' '}
            {recommendation.whiskey.region}
          </p>
          <p>
            {recommendation.whiskey.type} • {recommendation.whiskey.abv}% ABV
          </p>
          {recommendation.whiskey.estimated_price && (
            <p className="flex items-center gap-1 mt-1">
              <DollarSign size={14} />
              מחיר מוערך: ~{recommendation.whiskey.estimated_price} ₪
            </p>
          )}
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {recommendation.whiskey.description}
        </p>

        <div className="mb-4">
          <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-2">
            <Award size={16} className="inline ml-1 rtl:mr-1" />
            מדוע מומלץ עבורך:
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {recommendation.reason}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {recommendation.tags.map((tag, index) => (
            <span
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white flex-1"
            onClick={() => {
              // Logic to add to wishlist or collection
              // console.log('Add to wishlist:', recommendation.whiskey.name);
            }}
          >
            <Heart size={16} className="ml-1 rtl:mr-1" />
            הוסף לרשימת משאלות
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Logic to find where to buy
              // console.log('Find where to buy:', recommendation.whiskey.name);
            }}
            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ExternalLink size={16} className="ml-1 rtl:mr-1" />
            איפה לקנות
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const WhiskeySearchResultCard = ({ whiskey }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
    <div className="flex">
      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
        {whiskey.image_url ? (
          <img
            src={whiskey.image_url}
            alt={whiskey.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Sparkles size={20} className="text-gray-400 dark:text-gray-500" />
        )}
      </div>
      <div className="p-4 flex-1">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-gray-800 dark:text-gray-100">
            {whiskey.name}
          </h4>
          {whiskey.rating && (
            <div className="flex items-center gap-1 text-yellow-500">
              <Star size={14} fill="currentColor" />
              <span className="text-sm">{whiskey.rating}</span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          {whiskey.distillery} • {whiskey.region}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {whiskey.type} • {whiskey.abv}% ABV
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
          {whiskey.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            ~{whiskey.estimated_price} ₪
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              whiskey.availability === 'זמין'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
            }`}
          >
            {whiskey.availability}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// --- Main DiscoverPage Component ---
const DiscoverPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Page states
  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations', 'search', 'trending'

  // Personalized recommendations
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Advanced search
  const [searchParams, setSearchParams] = useState({
    query: '',
    region: 'all',
    type: 'all',
    minPrice: '',
    maxPrice: '',
    minRating: '',
  });
  const [searchResults, setSearchResults] = useState({
    results: [],
    totalFound: 0,
    searchTime: 0,
  });
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Trending
  const [trendingWhiskeys, setTrendingWhiskeys] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(false);

  // Use useCallback for memoized functions to avoid re-creation on every render
  const loadPersonalizedRecommendations = useCallback(async () => {
    setLoadingRecommendations(true);
    try {
      // Pass a dummy user ID if user is not available, or handle authentication requirement
      const recs = await getPersonalizedRecommendationsApi(user?.id || 'guest');
      setRecommendations(recs);
    } catch (error) {
      // console.error removed due to no-console rule
      setRecommendations([]); // Set to empty on error
    } finally {
      setLoadingRecommendations(false);
    }
  }, [user?.id]); // Dependency on user.id

  const handleSearch = useCallback(async () => {
    setLoadingSearch(true);
    setSearchPerformed(true);
    try {
      const results = await searchWhiskeysApi(searchParams);
      setSearchResults(results); // Store the entire results object
    } catch (error) {
      // console.error removed due to no-console rule
      setSearchResults({ results: [], totalFound: 0, searchTime: 0 }); // Set to empty on error
    } finally {
      setLoadingSearch(false);
    }
  }, [searchParams]); // Dependency on searchParams

  const loadTrendingWhiskeys = useCallback(async () => {
    setLoadingTrending(true);
    try {
      const trending = await getTrendingWhiskeysApi();
      setTrendingWhiskeys(trending);
    } catch (error) {
      // console.error removed due to no-console rule
      setTrendingWhiskeys([]); // Set to empty on error
    } finally {
      setLoadingTrending(false);
    }
  }, []); // No dependencies

  // Load personalized recommendations on page load if authenticated
  useEffect(() => {
    if (isAuthenticated && activeTab === 'recommendations') {
      loadPersonalizedRecommendations();
    }
  }, [isAuthenticated, activeTab, loadPersonalizedRecommendations]); // Added loadPersonalizedRecommendations to dependencies

  // Load trending whiskeys when switching to the trending tab
  useEffect(() => {
    if (activeTab === 'trending') {
      loadTrendingWhiskeys();
    }
  }, [activeTab, loadTrendingWhiskeys]); // Added loadTrendingWhiskeys to dependencies

  const clearSearch = () => {
    setSearchParams({
      query: '',
      region: 'all',
      type: 'all',
      minPrice: '',
      maxPrice: '',
      minRating: '',
    });
    setSearchResults({ results: [], totalFound: 0, searchTime: 0 });
    setSearchPerformed(false);
  };

  // Helper function for rendering recommendation content
  const renderRecommendationContent = () => {
    if (!isAuthenticated) {
      return (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <Users
            size={48}
            className="mx-auto text-gray-400 dark:text-gray-500 mb-4"
          />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            התחבר לקבלת המלצות מותאמות
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            כדי לקבל המלצות מותאמות לטעמך, אנא התחבר לחשבון שלך
          </p>
          <Button
            onClick={() => navigate('/login')}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            התחבר עכשיו
          </Button>
        </div>
      );
    }

    if (loadingRecommendations) {
      return (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" message="מכין המלצות מותאמות עבורך..." />
        </div>
      );
    }

    if (recommendations.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <BookOpen
            size={48}
            className="mx-auto text-gray-400 dark:text-gray-500 mb-4"
          />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            בנה את הפרופיל שלך
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            הוסף ויסקי לאוסף ותעד טעימות כדי לקבל המלצות מותאמות אישית
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => navigate('/collection')}
              variant="outline"
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              עבור לאוסף
            </Button>
            <Button
              onClick={() => navigate('/tastings')}
              variant="outline"
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              הוסף טעימה
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {recommendations.map((rec) => (
          <WhiskeyRecommendationCard key={rec.id} recommendation={rec} />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-8" dir="rtl">
      {/* Page Header */}
      <header className="text-center pb-6 border-b dark:border-gray-700">
        <Compass className="w-16 h-16 mx-auto text-amber-500 dark:text-amber-400 mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">
          גלה ויסקי חדש
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          מצא את הבקבוק הבא שלך עם המלצות מותאמות אישית, חיפוש מתקדם ומגמות
          עדכניות
        </p>
      </header>

      {/* Tabs for Navigation */}
      <div className="flex flex-wrap justify-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
        <Button
          variant={activeTab === 'recommendations' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('recommendations')}
          className={
            activeTab === 'recommendations'
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'dark:text-gray-300 dark:hover:bg-gray-700'
          }
        >
          <Sparkles size={18} className="ml-2 rtl:mr-2" />
          המלצות מותאמות
        </Button>
        <Button
          variant={activeTab === 'search' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('search')}
          className={
            activeTab === 'search'
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'dark:text-gray-300 dark:hover:bg-gray-700'
          }
        >
          <Search size={18} className="ml-2 rtl:mr-2" />
          חיפוש מתקדם
        </Button>
        <Button
          variant={activeTab === 'trending' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('trending')}
          className={
            activeTab === 'trending'
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'dark:text-gray-300 dark:hover:bg-gray-700'
          }
        >
          <TrendingUp size={18} className="ml-2 rtl:mr-2" />
          מגמות ופופולריות
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              המלצות מותאמות עבורך
            </h2>
            {isAuthenticated && (
              <Button
                onClick={loadPersonalizedRecommendations}
                variant="outline"
                disabled={loadingRecommendations}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {loadingRecommendations ? (
                  <LoadingSpinner size="sm" className="ml-2 rtl:mr-2" />
                ) : (
                  '🔄'
                )}{' '}
                רענן המלצות
              </Button>
            )}
          </div>

          {renderRecommendationContent()}
        </div>
      )}

      {activeTab === 'search' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            חיפוש מתקדם
          </h2>

          {/* Search Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label
                  htmlFor="query-search"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  חיפוש חופשי
                </label>
                <Input
                  id="query-search"
                  type="text"
                  placeholder="שם ויסקי, מזקקה..."
                  value={searchParams.query}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, query: e.target.value })
                  }
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label
                  htmlFor="region-select"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  אזור
                </label>
                <Select
                  id="region-select"
                  value={searchParams.region}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, region: e.target.value })
                  }
                  className="dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="all">כל האזורים</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label
                  htmlFor="type-select"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  סוג
                </label>
                <Select
                  id="type-select"
                  value={searchParams.type}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, type: e.target.value })
                  }
                  className="dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="all">כל הסוגים</option>
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label
                  htmlFor="max-price-input"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  מחיר מקסימלי (₪)
                </label>
                <Input
                  id="max-price-input"
                  type="number"
                  placeholder="500"
                  value={searchParams.maxPrice}
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      maxPrice: e.target.value,
                    })
                  }
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label
                  htmlFor="min-price-input"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  מחיר מינימלי (₪)
                </label>
                <Input
                  id="min-price-input"
                  type="number"
                  placeholder="100"
                  value={searchParams.minPrice}
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      minPrice: e.target.value,
                    })
                  }
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label
                  htmlFor="min-rating-select"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  דירוג מינימלי
                </label>
                <Select
                  id="min-rating-select"
                  value={searchParams.minRating}
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      minRating: e.target.value,
                    })
                  }
                  className="dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">כל הדירוגים</option>
                  <option value="4.5">4.5+ כוכבים</option>
                  <option value="4.0">4.0+ כוכבים</option>
                  <option value="3.5">3.5+ כוכבים</option>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                disabled={loadingSearch}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {loadingSearch ? (
                  <LoadingSpinner size="sm" className="ml-2 rtl:mr-2" />
                ) : (
                  <Search size={18} className="ml-2 rtl:mr-2" />
                )}
                חפש
              </Button>
              <Button
                onClick={clearSearch}
                variant="outline"
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <X size={18} className="ml-2 rtl:mr-2" />
                נקה
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {loadingSearch && (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" message="מחפש ויסקי..." />
            </div>
          )}

          {searchPerformed && !loadingSearch && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                {searchResults.totalFound === 0
                  ? 'לא נמצאו תוצאות'
                  : `נמצאו ${searchResults.totalFound} תוצאות`}
                {searchResults.totalFound > 0 && (
                  <span className="text-gray-500 dark:text-gray-400 text-sm ml-2 rtl:mr-2">
                    {` (זמן חיפוש: ${searchResults.searchTime?.toFixed(2) || '0.00'} שנ')`}
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.results.map((whiskey) => (
                  <WhiskeySearchResultCard key={whiskey.id} whiskey={whiskey} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'trending' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              מגמות ופופולריות
            </h2>
            <Button
              onClick={loadTrendingWhiskeys}
              variant="outline"
              disabled={loadingTrending}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {loadingTrending ? (
                <LoadingSpinner size="sm" className="ml-2 rtl:mr-2" />
              ) : (
                '🔄'
              )}{' '}
              רענן
            </Button>
          </div>

          {loadingTrending ? (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" message="טוען מגמות..." />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                <TrendingUp
                  size={20}
                  className="ml-2 rtl:mr-2 text-amber-500"
                />
                הוויסקי הפופולריים ביותר השבוע
              </h3>
              <div className="space-y-3">
                {trendingWhiskeys.map((whiskey) => (
                  // Ensured each trending whiskey has an 'id' during fetch or here
                  <div
                    key={whiskey.id} // Use whiskey.id directly after ensuring it exists
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full flex items-center justify-center font-semibold text-sm">
                        {/* If you need index for numbering, keep it, but key should be ID */}
                        {trendingWhiskeys.indexOf(whiskey) + 1}
                      </span>
                      <span className="font-medium text-gray-800 dark:text-gray-100">
                        {whiskey.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {whiskey.mentions} אזכורים
                      </span>
                      <span
                        className={
                          // Simplified ternary: if trend starts with '+', it's green, else yellow (or other color for negative)
                          whiskey.trend.startsWith('+')
                            ? 'text-green-600 dark:text-green-400 font-medium'
                            : 'text-yellow-600 dark:text-yellow-400 font-medium'
                        }
                      >
                        {whiskey.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;
