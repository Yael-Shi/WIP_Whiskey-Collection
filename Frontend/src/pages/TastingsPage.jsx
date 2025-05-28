import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // ודא נתיב נכון

// ייבוא קומפוננטות UI
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select'; // נניח שזו קומפוננטה שלך
import { Modal } from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// ייבוא קומפוננטות טעימה וויסקי (לשמות ויסקי)
import TastingList from '../components/tasting/TastingList';
import TastingForm from '../components/tasting/TastingForm';
// import { fetchWhiskeysForDropdown } from '../services/api'; // או פונקציה דומה

// ייבוא אייקונים
import { PlusCircle, Search, Filter, X, SlidersHorizontal, Star, CalendarDays } from 'lucide-react';

// --- דמה של פונקציות API - החלף בקריאות API אמיתיות ---
const fetchWhiskeysForDropdownApi = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: 'w1', name: 'Lagavulin 16 Year Old' },
        { id: 'w2', name: 'Glenfiddich 12 Year Old' },
        { id: 'w3', name: 'Ardbeg Uigeadail' },
        { id: 'w4', name: 'Yamazaki 12 Year Old' },
        // ...עוד ויסקי מהאוסף
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
          whiskey_id: 'w1', // מקושר ל-Lagavulin
          rating: 4.5, // יכול להיות 1-5 או 1-100, התאם לטופס
          tasting_date: '2024-07-15',
          notes: 'מעושן מאוד, כבול, יוד, מתיקות קלה של פירות יבשים.',
          color: 'ענבר עמוק',
          nose_notes: ['כבול', 'עשן מדורה', 'מלח ים'],
          palate_notes: ['שוקולד מריר', 'פלפל שחור', 'תאנים'],
          finish_notes: ['ארוכה', 'חמימה', 'מעושנת'],
          image_url: 'https://via.placeholder.com/150/A0522D/FFFFFF?text=Tasting1'
        },
        {
          id: 't2',
          whiskey_id: 'w2', // מקושר ל-Glenfiddich
          rating: 3.8,
          tasting_date: '2024-06-20',
          notes: 'פירותי, קליל, רמזים של אגס ותפוח. סיומת בינונית.',
          color: 'זהב חיוור',
          nose_notes: ['תפוח ירוק', 'אגס', 'פרחוני'],
          palate_notes: ['דבש', 'וניל', 'אלון קלוי'],
          finish_notes: ['בינונית', 'נקייה'],
        },
        {
          id: 't3',
          whiskey_id: 'w4', // מקושר ל-Yamazaki
          rating: 5,
          tasting_date: '2024-05-01',
          notes: 'מורכב מאוד, פירות טרופיים, תבלינים עדינים, אלון יפני (מיזונארה). פשוט מעולה.',
          color: 'זהב עמוק',
          nose_notes: ['אננס', 'קוקוס', 'קטורת'],
          palate_notes: ['משמש', 'וניל', 'אגוז מוסקט', 'אלון מיזונארה'],
          finish_notes: ['ארוכה מאוד', 'מתובלת', 'פירותית'],
          image_url: 'https://via.placeholder.com/150/B8860B/FFFFFF?text=TastingYam'
        },
      ];

      let filteredTastings = mockTastings;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        // כאן נצטרך לקשר ל-whiskeyName אם הוא זמין, או לסנן רק לפי notes
        filteredTastings = filteredTastings.filter(t =>
          t.notes?.toLowerCase().includes(searchLower)
          // או (whiskeyMap[t.whiskey_id]?.name.toLowerCase().includes(searchLower))
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
            return new Date(b.tasting_date) - new Date(a.tasting_date);
          case 'tasting_date_asc':
            return new Date(a.tasting_date) - new Date(b.tasting_date);
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
// --- סוף דמה של פונקציות API ---


export default function TastingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State variables
  const [tastings, setTastings] = useState([]);
  const [whiskeysForFilter, setWhiskeysForFilter] = useState([]); // רשימת ויסקי לטופס ולפילטר
  const [whiskeyMap, setWhiskeyMap] = useState({}); // מיפוי ID לשם ויסקי
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState(''); // חיפוש בהערות, שם ויסקי
  const [selectedWhiskeyFilter, setSelectedWhiskeyFilter] = useState('all');
  const [minRatingFilter, setMinRatingFilter] = useState('all'); // 1-5 או 1-100
  const [sortBy, setSortBy] = useState('tasting_date_desc');
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTasting, setEditingTasting] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preselectedWhiskeyId, setPreselectedWhiskeyId] = useState(null);


  // טען ויסקי עבור פילטרים וטפסים
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
        setError("שגיאה בטעינת רשימת הוויסקי לפילטרים.");
      }
    };
    loadWhiskeys();
  }, []);
  
  // טען טעימות מה-API
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
      setError("שגיאה בטעינת יומן הטעימות.");
    } finally {
      setLoading(false);
    }
  };

  // טען נתונים כאשר הפילטרים משתנים
  useEffect(() => {
    if (Object.keys(whiskeyMap).length > 0 || whiskeysForFilter.length === 0) { // טען טעימות רק אחרי שיש מיפוי ויסקי או אם אין ויסקי כלל
        loadTastings();
    }
  }, [searchTerm, selectedWhiskeyFilter, minRatingFilter, sortBy, whiskeyMap]);

  // בדוק אם יש פרמטר URL לפתיחת המודל
  useEffect(() => {
    const addParam = searchParams.get('add');
    const whiskeyIdParam = searchParams.get('whiskeyId');
    if (addParam === 'true') {
      if (whiskeyIdParam) {
        setPreselectedWhiskeyId(whiskeyIdParam);
      }
      setEditingTasting(null); // ודא שמדובר בהוספה
      setShowAddModal(true);
    } else {
      setPreselectedWhiskeyId(null);
    }
  }, [searchParams]);

  // פונקציות לטיפול באירועים
  const handleAddTasting = () => {
    setEditingTasting(null);
    setPreselectedWhiskeyId(null);
    setShowAddModal(true);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('add', 'true');
    newParams.delete('whiskeyId'); // נקה אם היה
    setSearchParams(newParams);
  };

  const handleEditTasting = (tasting) => {
    setEditingTasting(tasting);
    setPreselectedWhiskeyId(null);
    setShowAddModal(true);
  };

  const handleDeleteTasting = async (tastingId) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק טעימה זו?")) {
      return;
    }
    try {
      await deleteTastingFromApi(tastingId);
      await loadTastings(); // רענן את הרשימה
    } catch (err) {
      console.error("Error deleting tasting:", err);
      alert(err.message || "שגיאה במחיקת הטעימה.");
    }
  };
  
  const handleViewTastingDetails = (tastingId) => {
    navigate(`/tastings/${tastingId}`);
  };

  const handleSaveTasting = async (tastingData) => {
    setIsSubmitting(true);
    setError('');
    try {
      if (editingTasting) {
        await updateTastingInApi(editingTasting.id, tastingData);
      } else {
        await saveTastingToApi(tastingData);
      }
      setShowAddModal(false);
      setEditingTasting(null);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('add');
      newParams.delete('whiskeyId');
      setSearchParams(newParams);
      await loadTastings(); // רענן את הרשימה
    } catch (err) {
      console.error("Error saving tasting:", err);
      setError(err.message || "שגיאה בשמירת הטעימה.");
      // השאר את המודל פתוח כדי שהמשתמש יראה את השגיאה
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingTasting(null);
    setPreselectedWhiskeyId(null);
    setError(''); // נקה שגיאות מהטופס
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('add');
    newParams.delete('whiskeyId');
    setSearchParams(newParams);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedWhiskeyFilter('all');
    setMinRatingFilter('all');
    setSortBy('tasting_date_desc');
  };

  const hasActiveFilters = searchTerm || selectedWhiskeyFilter !== 'all' || minRatingFilter !== 'all';

  // שם ויסקי לפי ID (עבור TastingList)
  const getWhiskeyNameById = (whiskeyId) => {
    return whiskeyMap[whiskeyId] || 'ויסקי לא ידוע';
  };

  if (loading && tastings.length === 0 && Object.keys(whiskeyMap).length === 0) { // הצג טעינה ראשונית
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]" dir="rtl">
        <LoadingSpinner size="lg" message="טוען יומן טעימות..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6" dir="rtl">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">
            יומן הטעימות שלי
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {tastings.length} טעימות מתועדות
          </p>
        </div>
        <Button onClick={handleAddTasting} className="bg-sky-600 hover:bg-sky-700 text-white">
          <PlusCircle className="ml-2 rtl:mr-2 h-5 w-5" />
          הוסף טעימה
        </Button>
      </header>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="חפש בהערות טעימה, שם ויסקי..."
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
            {showFilters ? 'הסתר פילטרים' : 'הצג פילטרים'}
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ויסקי ספציפי
              </label>
              <Select value={selectedWhiskeyFilter} onChange={(e) => setSelectedWhiskeyFilter(e.target.value)}>
                <option value="all">כל הוויסקי</option>
                {whiskeysForFilter.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                דירוג מינימלי (1-5)
              </label>
              <Select value={minRatingFilter} onChange={(e) => setMinRatingFilter(e.target.value)}>
                <option value="all">כל הדירוגים</option>
                {[1, 2, 3, 3.5, 4, 4.5, 5].map(r => (
                  <option key={r} value={r.toString()}>{r}+ כוכבים</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                מיון לפי
              </label>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="tasting_date_desc">תאריך (חדש לישן)</option>
                <option value="tasting_date_asc">תאריך (ישן לחדש)</option>
                <option value="rating_desc">דירוג (גבוה לנמוך)</option>
                <option value="rating_asc">דירוג (נמוך לגבוה)</option>
              </Select>
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700 mt-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">פילטרים פעילים</span>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="ml-1 rtl:mr-1 h-4 w-4" />
              נקה הכל
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <TastingList
        tastings={tastings}
        whiskeyMap={whiskeyMap} // שולחים את המיפוי במקום פונקציה
        loading={loading}
        onEdit={handleEditTasting}
        onDelete={handleDeleteTasting}
        onViewDetails={handleViewTastingDetails}
        emptyStateMessage={
          hasActiveFilters
            ? "לא נמצאו טעימות התואמות לחיפוש. נסה לשנות את הפילטרים."
            : "עדיין לא תיעדת טעימות. הוסף את החוויה הראשונה שלך!"
        }
        pageNameForAdd="TastingsPage" // לצורך כפתור "הוסף" בתוך הקומפוננטה אם אין טעימות
      />

      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={handleCloseModal}
          title={editingTasting ? `עריכת טעימה של ${getWhiskeyNameById(editingTasting.whiskey_id)}` : "הוספת טעימה חדשה"}
          size="2xl" // או גודל אחר שמתאים לטופס טעימה
        >
          <TastingForm
            initialTasting={editingTasting}
            whiskeys={whiskeysForFilter} // שלח את רשימת הוויסקי לטופס
            preselectedWhiskeyId={preselectedWhiskeyId}
            onSubmit={handleSaveTasting}
            onCancel={handleCloseModal}
            isSubmitting={isSubmitting}
            // error={error} // אפשר להעביר שגיאה ספציפית לטופס אם יש
          />
        </Modal>
      )}
    </div>
  );
}
