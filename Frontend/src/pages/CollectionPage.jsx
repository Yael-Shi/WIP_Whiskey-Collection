import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  Loader2,
  PlusCircle,
  Search,
  Filter,
  X,
  SlidersHorizontal,
  Grid3X3,
  List,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

import WhiskeyList from '../components/whiskey/WhiskeyList';
import WhiskeyForm from '../components/whiskey/WhiskeyForm';

import { regions, types } from '../components/utils/whiskeyData';

import { useAuth } from '../contexts/AuthContext';

// דמה של פונקציות API - החלף בקריאות API אמיתיות
const fetchWhiskeysFromApi = async (
  filters = {},
  sortBy = 'name',
  page = 1,
  limit = 20,
) =>
  new Promise((resolve) => {
    setTimeout(() => {
      // דמה של נתוני ויסקי
      const mockWhiskeys = [
        {
          id: 'w1',
          name: 'Lagavulin 16 Year Old',
          distillery: 'Lagavulin',
          region: 'סקוטלנד - איילה',
          age: 16,
          type: 'סינגל מאלט',
          abv: 43.0,
          price: 450,
          bottle_status: 75,
          image_url:
            'https://via.placeholder.com/200/8B4513/FFFFFF?text=Lagavulin',
          is_favorite: true,
          purchase_date: '2024-01-15',
        },
        {
          id: 'w2',
          name: 'Glenfiddich 12 Year Old',
          distillery: 'Glenfiddich',
          region: 'סקוטלנד - ספייסייד',
          age: 12,
          type: 'סינגל מאלט',
          abv: 40.0,
          price: 280,
          bottle_status: 100,
          image_url:
            'https://via.placeholder.com/200/DAA520/FFFFFF?text=Glenfiddich',
          is_favorite: false,
          purchase_date: '2024-03-20',
        },
        {
          id: 'w3',
          name: 'Ardbeg Uigeadail',
          distillery: 'Ardbeg',
          region: 'סקוטלנד - איילה',
          age: null, // NAS - No Age Statement
          type: 'סינגל מאלט',
          abv: 54.2,
          price: 380,
          bottle_status: 90,
          image_url:
            'https://via.placeholder.com/200/2F4F4F/FFFFFF?text=Ardbeg',
          is_favorite: true,
          purchase_date: '2024-02-10',
        },
        {
          id: 'w4',
          name: 'Yamazaki 12 Year Old',
          distillery: 'Yamazaki',
          region: 'יפן',
          age: 12,
          type: 'סינגל מאלט',
          abv: 43.0,
          price: 1200,
          bottle_status: 60,
          image_url:
            'https://via.placeholder.com/200/CD853F/FFFFFF?text=Yamazaki',
          is_favorite: true,
          purchase_date: '2023-12-05',
        },
      ];

      // הדמה של סינון
      let filteredWhiskeys = mockWhiskeys;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredWhiskeys = filteredWhiskeys.filter(
          (w) =>
            w.name.toLowerCase().includes(searchLower) ||
            w.distillery.toLowerCase().includes(searchLower),
        );
      }

      if (filters.region && filters.region !== 'all') {
        filteredWhiskeys = filteredWhiskeys.filter(
          (w) => w.region === filters.region,
        );
      }

      if (filters.type && filters.type !== 'all') {
        filteredWhiskeys = filteredWhiskeys.filter(
          (w) => w.type === filters.type,
        );
      }

      if (filters.favorites) {
        filteredWhiskeys = filteredWhiskeys.filter((w) => w.is_favorite);
      }

      // הדמה של מיון
      filteredWhiskeys.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name, 'he');
          case 'name_desc':
            return b.name.localeCompare(a.name, 'he');
          case 'price':
            return (a.price || 0) - (b.price || 0);
          case 'price_desc':
            return (b.price || 0) - (a.price || 0);
          case 'age':
            return (a.age || 0) - (b.age || 0);
          case 'age_desc':
            return (b.age || 0) - (a.age || 0);
          case 'purchase_date':
            return new Date(a.purchase_date) - new Date(b.purchase_date);
          case 'purchase_date_desc':
            return new Date(b.purchase_date) - new Date(a.purchase_date);
          default:
            return 0;
        }
      });

      resolve({
        whiskeys: filteredWhiskeys,
        totalCount: filteredWhiskeys.length,
        currentPage: page,
        totalPages: Math.ceil(filteredWhiskeys.length / limit),
      });
    }, 600);
  });

const saveWhiskeyToApi = async (whiskeyData) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.1) {
        // 10% סיכוי לכשל (לצורך בדיקה)
        reject(new Error('שגיאה בשמירת הוויסקי. נסה שוב.'));
        return;
      }
      const savedWhiskey = {
        ...whiskeyData,
        id: `w${Math.random().toString(36).substring(7)}`,
      };
      console.log('Whiskey saved (mock):', savedWhiskey);
      resolve(savedWhiskey);
    }, 1000);
  });

const updateWhiskeyInApi = async (whiskeyId, whiskeyData) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.05) {
        // 5% סיכוי לכשל
        reject(new Error('שגיאה בעדכון הוויסקי. נסה שוב.'));
        return;
      }
      const updatedWhiskey = { ...whiskeyData, id: whiskeyId };
      console.log('Whiskey updated (mock):', updatedWhiskey);
      resolve(updatedWhiskey);
    }, 800);
  });

const deleteWhiskeyFromApi = async (whiskeyId) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.05) {
        // 5% סיכוי לכשל
        reject(new Error('שגיאה במחיקת הוויסקי. נסה שוב.'));
        return;
      }
      console.log('Whiskey deleted (mock):', whiskeyId);
      resolve(true);
    }, 500);
  });

export default function CollectionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State variables
  const [whiskeys, setWhiskeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);

  // View states
  const [viewMode, setViewMode] = useState('grid'); // 'grid' או 'list'

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWhiskey, setEditingWhiskey] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // טען ויסקי מה-API
  const loadWhiskeys = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {
        search: searchTerm,
        region: regionFilter,
        type: typeFilter,
        favorites: showFavorites,
      };
      const result = await fetchWhiskeysFromApi(filters, sortBy);
      setWhiskeys(result.whiskeys);
    } catch (err) {
      console.error('Error loading whiskeys:', err);
      setError('שגיאה בטעינת אוסף הוויסקי.');
    } finally {
      setLoading(false);
    }
  };

  // טען נתונים כאשר הפילטרים משתנים
  useEffect(() => {
    loadWhiskeys();
  }, [searchTerm, regionFilter, typeFilter, showFavorites, sortBy]);

  // בדוק אם יש פרמטר URL לפתיחת המודל
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setShowAddModal(true);
    }
  }, [searchParams]);

  // פונקציות לטיפול באירועים
  const handleAddWhiskey = () => {
    setEditingWhiskey(null);
    setShowAddModal(true);
    // עדכן URL
    const newParams = new URLSearchParams(searchParams);
    newParams.set('add', 'true');
    setSearchParams(newParams);
  };

  const handleEditWhiskey = (whiskey) => {
    setEditingWhiskey(whiskey);
    setShowAddModal(true);
  };

  const handleDeleteWhiskey = async (whiskeyId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק ויסקי זה מהאוסף?')) {
      return;
    }

    try {
      await deleteWhiskeyFromApi(whiskeyId);
      await loadWhiskeys(); // רענן את הרשימה
    } catch (err) {
      console.error('Error deleting whiskey:', err);
      alert(err.message || 'שגיאה במחיקת הוויסקי.');
    }
  };

  const handleViewWhiskeyDetails = (whiskeyId) => {
    navigate(`/collection/${whiskeyId}`);
  };

  const handleSaveWhiskey = async (whiskeyData) => {
    setIsSubmitting(true);
    setError('');

    try {
      if (editingWhiskey) {
        await updateWhiskeyInApi(editingWhiskey.id, whiskeyData);
      } else {
        await saveWhiskeyToApi(whiskeyData);
      }

      setShowAddModal(false);
      setEditingWhiskey(null);
      // הסר פרמטר URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('add');
      setSearchParams(newParams);

      await loadWhiskeys(); // רענן את הרשימה
    } catch (err) {
      console.error('Error saving whiskey:', err);
      setError(err.message || 'שגיאה בשמירת הוויסקי.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingWhiskey(null);
    setError('');
    // הסר פרמטר URL
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('add');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRegionFilter('all');
    setTypeFilter('all');
    setShowFavorites(false);
    setSortBy('name');
  };

  const hasActiveFilters =
    searchTerm ||
    regionFilter !== 'all' ||
    typeFilter !== 'all' ||
    showFavorites;

  if (loading && whiskeys.length === 0) {
    return (
      <div
        className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center"
        dir="rtl"
      >
        <Loader2 className="h-10 w-10 animate-spin text-amber-600 mb-4" />{' '}
        {/* Adjust size and color as needed */}
        <p className="text-gray-700 dark:text-gray-300 text-lg">טוען אוסף...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6" dir="rtl">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">
            אוסף הוויסקי שלי
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {whiskeys.length} בקבוקים באוסף
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleAddWhiskey}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <PlusCircle className="ml-2 rtl:mr-2 h-5 w-5" />
            הוסף ויסקי
          </Button>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="חפש לפי שם ויסקי או מזקקה..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 rtl:pl-10 rtl:pr-3 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="dark:border-gray-600 dark:text-gray-300"
          >
            <SlidersHorizontal className="ml-2 rtl:mr-2 h-4 w-4" />
            {showFilters ? 'הסתר פילטרים' : 'הצג פילטרים'}
          </Button>

          {/* View Mode Toggle */}
          <div className="flex border rounded-md dark:border-gray-600">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-md rounded-l-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-md rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                אזור
              </label>
              <Select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                סוג
              </label>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                מיון לפי
              </label>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">שם (א-ת)</option>
                <option value="name_desc">שם (ת-א)</option>
                <option value="price">מחיר (נמוך לגבוה)</option>
                <option value="price_desc">מחיר (גבוה לנמוך)</option>
                <option value="age">גיל (צעיר לוותיק)</option>
                <option value="age_desc">גיל (ותיק לצעיר)</option>
                <option value="purchase_date">תאריך רכישה (ישן לחדש)</option>
                <option value="purchase_date_desc">
                  תאריך רכישה (חדש לישן)
                </option>
              </Select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={showFavorites}
                  onChange={(e) => setShowFavorites(e.target.checked)}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  רק מועדפים
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Active Filters and Clear */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700 mt-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              פילטרים פעילים
            </span>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="ml-1 rtl:mr-1 h-4 w-4" />
              נקה הכל
            </Button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Whiskey List */}
      <WhiskeyList
        whiskeys={whiskeys}
        viewMode={viewMode}
        loading={loading}
        onEdit={handleEditWhiskey}
        onDelete={handleDeleteWhiskey}
        onViewDetails={handleViewWhiskeyDetails}
        emptyStateMessage={
          hasActiveFilters
            ? 'לא נמצאו ויסקי התואמים לחיפוש. נסה לשנות את הפילטרים.'
            : 'עדיין לא הוספת ויסקי לאוסף. הוסף את הבקבוק הראשון שלך!'
        }
      />

      {/* Add/Edit Whiskey Modal */}
      {showAddModal && (
        <Dialog open={showAddModal} onOpenChange={handleCloseModal}>
          {' '}
          {/* 'open' prop controls visibility, 'onOpenChange' handles close */}
          <DialogContent className="sm:max-w-[425px]">
            {' '}
            {/* You had 'size="lg"', this needs to be translated to Tailwind CSS classes on DialogContent */}
            <DialogHeader>
              <DialogTitle>
                {editingWhiskey
                  ? `עריכת ${editingWhiskey.name}`
                  : 'הוספת ויסקי חדש'}
              </DialogTitle>
              {/* <DialogDescription>
                Optional description here if needed.
              </DialogDescription> */}
            </DialogHeader>
            <WhiskeyForm
              whiskey={editingWhiskey}
              onSubmit={handleSaveWhiskey}
              onCancel={handleCloseModal}
              isSubmitting={isSubmitting}
              error={error}
            />
            {/* If you have action buttons like "Save" or "Cancel" inside the dialog but outside WhiskeyForm, you'd put them here */}
            {/* <DialogFooter>
              <Button type="submit" form="whiskey-form">Save changes</Button>
            </DialogFooter> */}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
