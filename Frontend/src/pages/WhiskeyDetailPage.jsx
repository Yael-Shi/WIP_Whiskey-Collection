import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import LoadingSpinner from '@/components/ui/LoadingSpinner';

import WhiskeyForm from '@/components/whiskey/WhiskeyForm';
import TastingForm from '@/components/tasting/TastingForm';
import TastingList from '@/components/tasting/TastingList';

import {
  ArrowLeft,
  Edit3,
  GlassWater,
  Calendar,
  DollarSign,
  Percent,
  MapPin,
  Building2,
  Wine,
  Star,
  Heart,
  HeartOff,
  Share2,
  Trash2,
  Eye,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// --- Mock API functions ---
const fetchWhiskeyByIdApi = async (whiskeyId) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const mockWhiskeys = {
        w1: {
          id: 'w1',
          name: 'Lagavulin 16 Year Old',
          distillery: 'Lagavulin',
          region: 'סקוטלנד - איילה',
          age: 16,
          type: 'סינגל מאלט',
          abv: 43.0,
          price: 450,
          purchase_date: '2024-01-15',
          bottle_size: 700,
          bottle_status: 75,
          notes:
            'ויסקי מעושן וחזק, עם כבול בולט ורמזים של יוד ומלח ים. האהוב עליי מאיילה.',
          image_url:
            'https://via.placeholder.com/400/8B4513/FFFFFF?text=Lagavulin+16',
          is_favorite: true,
          public_notes: false,
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-07-10T14:22:00Z',
        },
        w2: {
          id: 'w2',
          name: 'Glenfiddich 12 Year Old',
          distillery: 'Glenfiddich',
          region: 'סקוטלנד - ספייסייד',
          age: 12,
          type: 'סינגל מאלט',
          abv: 40.0,
          price: 280,
          purchase_date: '2024-03-20',
          bottle_size: 700,
          bottle_status: 100,
          notes:
            'ויסקי קליל ופירותי, מתאים למתחילים. רמזים של תפוח ואגס עם וניל עדין.',
          image_url:
            'https://via.placeholder.com/400/DAA520/FFFFFF?text=Glenfiddich+12',
          is_favorite: false,
          public_notes: true,
        },
      };

      const whiskey = mockWhiskeys[whiskeyId];
      if (whiskey) {
        resolve(whiskey);
      } else {
        reject(new Error('Whiskey not found'));
      }
    }, 500);
  });

const fetchTastingsForWhiskeyApi = async (whiskeyId) =>
  new Promise((resolve) => {
    setTimeout(() => {
      const mockTastings = {
        w1: [
          {
            id: 't1',
            whiskey_id: 'w1',
            rating: 4.5,
            tasting_date: '2024-07-15',
            notes:
              'מעושן מאוד, כבול, יוד, מתיקות קלה של פירות יבשים. הטעימה הטובה ביותר עד כה.',
            color: 'ענבר עמוק',
            nose_notes: ['כבול', 'עשן מדורה', 'מלח ים', 'צמוקים'],
            palate_notes: ['שוקולד מריר', 'פלפל שחור', 'תאנים', 'עור'],
            finish_notes: ['ארוכה', 'חמימה', 'מעושנת'],
            image_url:
              'https://via.placeholder.com/150/A0522D/FFFFFF?text=Tasting1',
          },
          {
            id: 't2',
            whiskey_id: 'w1',
            rating: 4.2,
            tasting_date: '2024-04-10',
            notes:
              'טעימה שנייה - עדיין מעולה, אבל הפעם שמתי לב יותר לרמזי הפירות.',
            color: 'ענבר',
            nose_notes: ['כבול', 'צמוקים', 'וניל'],
            palate_notes: ['עשן', 'דבש', 'אגוזים'],
            finish_notes: ['ארוכה', 'מתובלת'],
          },
        ],
        w2: [],
      };
      resolve(mockTastings[whiskeyId] || []);
    }, 400);
  });

const updateWhiskeyApi = async (whiskeyId, whiskeyData) =>
  new Promise((resolve) => {
    setTimeout(() => {
      const updatedWhiskey = {
        ...whiskeyData,
        id: whiskeyId,
        updated_at: new Date().toISOString(),
      };
      console.log('Whiskey updated (mock):', updatedWhiskey);
      resolve(updatedWhiskey);
    }, 800);
  });

const deleteWhiskeyApi = async (whiskeyId) =>
  new Promise((resolve) => {
    setTimeout(() => {
      console.log('Whiskey deleted (mock):', whiskeyId);
      resolve(true);
    }, 600);
  });

const toggleFavoriteApi = async (whiskeyId, isFavorite) =>
  new Promise((resolve) => {
    setTimeout(() => {
      console.log(
        `Whiskey ${whiskeyId} favorite status changed to:`,
        isFavorite,
      );
      resolve({ id: whiskeyId, is_favorite: isFavorite });
    }, 300);
  });

const saveTastingToApi = async (tastingData) =>
  new Promise((resolve) => {
    setTimeout(() => {
      const savedTasting = {
        ...tastingData,
        id: `t${Math.random().toString(36).substring(7)}`,
      };
      console.log('Tasting saved (mock):', savedTasting);
      resolve(savedTasting);
    }, 900);
  });
// --- End mock API functions ---

const WhiskeyDetailPage = () => {
  const { whiskeyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State variables
  const [whiskey, setWhiskey] = useState(null);
  const [tastings, setTastings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddTastingDialog, setShowAddTastingDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load whiskey and tastings data on mount
  useEffect(() => {
    const loadWhiskeyData = async () => {
      setLoading(true);
      setError('');
      try {
        const [whiskeyData, tastingsData] = await Promise.all([
          fetchWhiskeyByIdApi(whiskeyId),
          fetchTastingsForWhiskeyApi(whiskeyId),
        ]);
        setWhiskey(whiskeyData);
        setTastings(tastingsData);
      } catch (err) {
        console.error('Error loading whiskey data:', err);
        setError(err.message || 'Error loading whiskey details.');
      } finally {
        setLoading(false);
      }
    };

    if (whiskeyId) {
      loadWhiskeyData();
    }
  }, [whiskeyId]);

  // Event handlers using useCallback for stability and to prevent unnecessary re-renders
  const handleEditWhiskey = useCallback(() => {
    setShowEditDialog(true);
  }, []);

  const handleSaveWhiskey = useCallback(
    async (whiskeyData) => {
      setIsSubmitting(true);
      setError('');
      try {
        const updatedWhiskey = await updateWhiskeyApi(whiskeyId, whiskeyData);
        setWhiskey(updatedWhiskey);
        setShowEditDialog(false);
      } catch (err) {
        console.error('Error updating whiskey:', err);
        setError(err.message || 'Error updating whiskey.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [whiskeyId], // Dependency on whiskeyId
  );

  const handleDeleteWhiskey = useCallback(async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${whiskey?.name}? This will also delete all associated tastings.`,
      )
    ) {
      return;
    }
    try {
      await deleteWhiskeyApi(whiskeyId);
      navigate('/collection');
    } catch (err) {
      console.error('Error deleting whiskey:', err);
      alert(err.message || 'Error deleting whiskey.');
    }
  }, [whiskeyId, whiskey?.name, navigate]); // Dependencies on whiskeyId, whiskey.name, navigate

  const handleToggleFavorite = useCallback(async () => {
    try {
      const newFavoriteStatus = !whiskey.is_favorite;
      await toggleFavoriteApi(whiskeyId, newFavoriteStatus);
      setWhiskey((prev) => ({ ...prev, is_favorite: newFavoriteStatus }));
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Error updating favorite status.');
    }
  }, [whiskeyId, whiskey?.is_favorite]); // Dependencies on whiskeyId, whiskey.is_favorite

  const handleAddTasting = useCallback(() => {
    setShowAddTastingDialog(true);
  }, []);

  const handleSaveTasting = useCallback(
    async (tastingData) => {
      setIsSubmitting(true);
      setError('');
      try {
        const savedTasting = await saveTastingToApi({
          ...tastingData,
          whiskey_id: whiskeyId,
        });
        setTastings((prev) => [savedTasting, ...prev]);
        setShowAddTastingDialog(false);
      } catch (err) {
        console.error('Error saving tasting:', err);
        setError(err.message || 'Error saving tasting.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [whiskeyId], // Dependency on whiskeyId
  );

  const handleViewTastingDetails = useCallback(
    (tastingId) => {
      navigate(`/tastings/${tastingId}`);
    },
    [navigate], // Dependency on navigate
  );

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: whiskey?.name, // Added optional chaining
          text: `Check out ${whiskey?.name} from ${whiskey?.distillery}`, // Added optional chaining
          url: window.location.href,
        });
      } catch (err) {
        console.log('Sharing failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard');
      } catch (err) {
        console.log('Copy failed:', err);
      }
    }
  }, [whiskey?.name, whiskey?.distillery]); // Dependencies on whiskey.name and whiskey.distillery

  // Helper function to get bottle status class name
  const getBottleStatusClass = (status) => {
    if (status > 50) {
      return 'bg-green-500';
    }
    if (status > 20) {
      return 'bg-yellow-500';
    }
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div
        className="flex justify-center items-center min-h-[calc(100vh-200px)]"
        dir="rtl"
      >
        <LoadingSpinner size="lg" message="Loading whiskey details..." />
      </div>
    );
  }

  if (error && !whiskey) {
    return (
      <div className="text-center p-8" dir="rtl">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <Button onClick={() => navigate('/collection')} variant="outline">
          <ArrowLeft className="ml-2 rtl:mr-2 h-4 w-4" />
          Back to Collection
        </Button>
      </div>
    );
  }

  if (!whiskey) {
    return (
      <div className="text-center p-8" dir="rtl">
        <div className="text-gray-500 text-lg mb-4">Whiskey not found</div>
        <Button onClick={() => navigate('/collection')} variant="outline">
          <ArrowLeft className="ml-2 rtl:mr-2 h-4 w-4" />
          Back to Collection
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8" dir="rtl">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => navigate('/collection')}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="ml-2 rtl:mr-2 h-4 w-4" />
          חזור לאוסף
        </Button>
        <div className="flex items-center gap-2">
          <Button onClick={handleShare} variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleToggleFavorite}
            variant="ghost"
            size="sm"
            className={whiskey.is_favorite ? 'text-red-500' : 'text-gray-400'}
          >
            {whiskey.is_favorite ? (
              <Heart className="h-5 w-5 fill-current" />
            ) : (
              <HeartOff className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Image and basic info */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {whiskey.image_url ? (
              <img
                src={whiskey.image_url}
                alt={whiskey.name}
                className="w-full h-80 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  // Added a check for nextSibling to prevent potential errors
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'flex';
                  }
                }}
              />
            ) : (
              <div className="w-full h-80 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Wine className="h-16 w-16 text-gray-400" />
              </div>
            )}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {whiskey.name}
                </h1>
                {whiskey.is_favorite && (
                  <Heart className="h-6 w-6 text-red-500 fill-current" />
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Building2 className="h-4 w-4 ml-2 rtl:mr-2" />
                  {whiskey.distillery}
                </div>
                {whiskey.region && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4 ml-2 rtl:mr-2" />
                    {whiskey.region}
                  </div>
                )}
                {whiskey.age && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 ml-2 rtl:mr-2" />
                    {whiskey.age} שנים
                  </div>
                )}
                {whiskey.abv && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Percent className="h-4 w-4 ml-2 rtl:mr-2" />
                    {whiskey.abv}% אלכוהול
                  </div>
                )}
                {whiskey.price && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <DollarSign className="h-4 w-4 ml-2 rtl:mr-2" />₪
                    {whiskey.price}
                  </div>
                )}
              </div>

              {/* Bottle status */}
              {whiskey.bottle_status !== undefined && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>נותר בבקבוק</span>
                    <span>{whiskey.bottle_status}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getBottleStatusClass(
                        whiskey.bottle_status,
                      )}`}
                      style={{ width: `${whiskey.bottle_status}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-2 pt-4">
                <Button
                  onClick={handleEditWhiskey}
                  variant="outline"
                  className="w-full"
                >
                  <Edit3 className="ml-2 rtl:mr-2 h-4 w-4" />
                  ערוך פרטים
                </Button>
                <Button
                  onClick={handleAddTasting}
                  className="w-full bg-sky-600 hover:bg-sky-700"
                >
                  <GlassWater className="ml-2 rtl:mr-2 h-4 w-4" />
                  הוסף טעימה
                </Button>
                <Button
                  onClick={handleDeleteWhiskey}
                  variant="outline"
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="ml-2 rtl:mr-2 h-4 w-4" />
                  מחק ויסקי
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Details and tastings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {whiskey.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                תיאור והערות
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                {whiskey.notes}
              </p>
            </div>
          )}

          {/* Additional details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              פרטים נוספים
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {whiskey.type && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    סוג:
                  </span>
                  <span className="mr-2 rtl:ml-2 text-gray-600 dark:text-gray-400">
                    {whiskey.type}
                  </span>
                </div>
              )}
              {whiskey.bottle_size && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    גודל בקבוק:
                  </span>
                  <span className="mr-2 rtl:ml-2 text-gray-600 dark:text-gray-400">
                    {whiskey.bottle_size} מ&quot;ל
                  </span>
                </div>
              )}
              {whiskey.purchase_date && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    תאריך רכישה:
                  </span>
                  <span className="mr-2 rtl:ml-2 text-gray-600 dark:text-gray-400">
                    {new Date(whiskey.purchase_date).toLocaleDateString(
                      'he-IL',
                    )}
                  </span>
                </div>
              )}
              {whiskey.created_at && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    נוסף לאוסף:
                  </span>
                  <span className="mr-2 rtl:ml-2 text-gray-600 dark:text-gray-400">
                    {new Date(whiskey.created_at).toLocaleDateString('he-IL')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tastings section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                טעימות ({tastings.length})
              </h2>
              <Button
                onClick={handleAddTasting}
                size="sm"
                className="bg-sky-600 hover:bg-sky-700"
              >
                <GlassWater className="ml-2 rtl:mr-2 h-4 w-4" />
                הוסף טעימה
              </Button>
            </div>

            {tastings.length > 0 ? (
              <TastingList
                tastings={tastings}
                whiskeyMap={{ [whiskeyId]: whiskey.name }}
                loading={false}
                onViewDetails={handleViewTastingDetails}
                emptyStateMessage="No tastings recorded for this whiskey yet."
              />
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <GlassWater className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>עדיין לא תיעדת טעימות לויסקי זה.</p>
                <Button
                  onClick={handleAddTasting}
                  className="mt-4 bg-sky-600 hover:bg-sky-700"
                >
                  הוסף טעימה ראשונה
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit whiskey dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[700px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת {whiskey.name}</DialogTitle>
            <DialogDescription>
              Update whiskey details here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <WhiskeyForm
            initialWhiskey={whiskey}
            onSubmit={handleSaveWhiskey}
            onCancel={() => setShowEditDialog(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Add tasting dialog */}
      <Dialog
        open={showAddTastingDialog}
        onOpenChange={setShowAddTastingDialog}
      >
        <DialogContent className="sm:max-w-[700px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>טעימה חדשה של {whiskey.name}</DialogTitle>
            <DialogDescription>
              Enter the tasting details for the whiskey.
            </DialogDescription>
          </DialogHeader>
          <TastingForm
            whiskeys={[{ id: whiskey.id, name: whiskey.name }]}
            preselectedWhiskeyId={whiskeyId}
            onSubmit={handleSaveTasting}
            onCancel={() => setShowAddTastingDialog(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WhiskeyDetailPage;
