import React, { useState, useEffect } from 'react';
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

import TastingForm from '@/components/tasting/TastingForm';

import {
  ArrowLeft,
  Edit3,
  Star,
  CalendarDays,
  Palette,
  MessageSquare,
  FileText,
  Tag,
  Trash2,
  Share2,
  Eye,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// --- Mock API functions - replace with actual API calls ---
const fetchTastingByIdApi = async (tastingId) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const mockTastings = {
        t1: {
          id: 't1',
          whiskey_id: 'w1',
          whiskeyName: 'Lagavulin 16 Year Old', // Added whiskey name for example
          rating: 4.5,
          tasting_date: '2024-07-15',
          setting: 'ערב רגוע בבית, ליד האח',
          glassware: 'גלנקיירן (Glencairn)',
          color: 'ענבר עמוק',
          nose_notes: ['כבול', 'עשן מדורה', 'מלח ים', 'אצות', 'צימוקים'],
          nose_manual:
            'ריח עשיר ומורכב, מעושן מאוד אך לא אגרסיבי. מתיקות פירותית מתחת לעשן.',
          palate_notes: ['שוקולד מריר', 'פלפל שחור', 'תאנים', 'עור', 'מאלט'],
          palate_manual:
            'טעם מלא וסמיך. הכבול משתלב היטב עם מתיקות עדינה ורמזים של תבלינים.',
          finish_notes: ['ארוכה', 'חמימה', 'מעושנת', 'מתובלת'],
          finish_manual:
            'סיומת ארוכה מאוד, משאירה טעם מעושן ונעים עם חמימות מתפשטת.',
          overall_impression:
            'טעימה פשוט פנומנלית. הוויסקי הזה אף פעם לא מאכזב. כל לגימה היא חוויה.',
          image_url:
            'https://via.placeholder.com/400/A0522D/FFFFFF?text=Tasting+Details',
          created_at: '2024-07-15T20:00:00Z',
          updated_at: '2024-07-15T20:00:00Z',
        },
        t2: {
          // Another example tasting
          id: 't2',
          whiskey_id: 'w2',
          whiskeyName: 'Glenfiddich 12 Year Old',
          rating: 3.8,
          tasting_date: '2024-06-20',
          setting: 'עם חברים, אחרי ארוחת ערב',
          glassware: 'טמבלר / אולד פאשנד',
          color: 'זהב חיוור',
          nose_notes: ['תפוח ירוק', 'אגס', 'פרחוני', 'דבש'],
          palate_notes: ['דבש', 'וניל', 'אלון קלוי', 'פירות הדר'],
          finish_notes: ['בינונית', 'נקייה', 'מתוקה'],
          overall_impression:
            'ויסקי נעים וקליל, טוב ליומיום. לא מורכב מדי אבל מספק.',
        },
      };
      const tasting = mockTastings[tastingId];
      if (tasting) {
        resolve(tasting);
      } else {
        reject(new Error('Tasting not found'));
      }
    }, 500);
  });

const updateTastingApi = async (tastingId, tastingData) =>
  new Promise((resolve) => {
    setTimeout(() => {
      const updatedTasting = {
        ...tastingData,
        id: tastingId,
        updated_at: new Date().toISOString(),
      };
      console.log('Tasting updated (mock):', updatedTasting);
      resolve(updatedTasting);
    }, 800);
  });

const deleteTastingApi = async (tastingId) =>
  new Promise((resolve) => {
    setTimeout(() => {
      console.log('Tasting deleted (mock):', tastingId);
      resolve(true);
    }, 600);
  });

// Function to fetch all whiskeys from the collection (for the edit form dropdown)
const fetchWhiskeysForDropdownApi = async () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 'w1', name: 'Lagavulin 16 Year Old' },
        { id: 'w2', name: 'Glenfiddich 12 Year Old' },
        { id: 'w3', name: 'Ardbeg Uigeadail' },
        { id: 'w4', name: 'Yamazaki 12 Year Old' },
      ]);
    }, 300);
  });
// --- End mock API functions ---

const TastingDetailPage = () => {
  const { tastingId } = useParams();
  const navigate = useNavigate();
  // const { user } = useAuth(); // For specific permissions check

  // State variables for tasting data, whiskey list for form, loading, and error
  const [tasting, setTasting] = useState(null);
  const [whiskeysForForm, setWhiskeysForForm] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State variables for dialog visibility and submission status
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect hook to load tasting data and whiskeys for the form
  useEffect(() => {
    const loadTastingData = async () => {
      setLoading(true);
      setError('');
      try {
        const tastingData = await fetchTastingByIdApi(tastingId);
        setTasting(tastingData);

        // Load whiskey list for the edit form
        const whiskeysData = await fetchWhiskeysForDropdownApi();
        setWhiskeysForForm(whiskeysData);
      } catch (err) {
        console.error('Error loading tasting data:', err);
        setError(err.message || 'Error loading tasting details.');
      } finally {
        setLoading(false);
      }
    };

    if (tastingId) {
      loadTastingData();
    }
  }, [tastingId]);

  // Handler to open the edit dialog
  const handleEditTasting = () => {
    setShowEditDialog(true);
  };

  // Handler to save updated tasting data
  const handleSaveTasting = async (tastingData) => {
    setIsSubmitting(true);
    setError('');
    try {
      const updatedTasting = await updateTastingApi(tastingId, tastingData);
      // Update whiskey name if changed in the form
      const selectedWhiskey = whiskeysForForm.find(
        (w) => w.id === updatedTasting.whiskey_id,
      );
      setTasting({
        ...updatedTasting,
        whiskeyName: selectedWhiskey ? selectedWhiskey.name : 'Unknown Whiskey',
      });
      setShowEditDialog(false);
    } catch (err) {
      console.error('Error updating tasting:', err);
      setError(err.message || 'Error updating tasting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler to delete a tasting
  const handleDeleteTasting = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete this tasting of ${tasting?.whiskeyName || 'the whiskey'}?`,
      )
    ) {
      return;
    }
    try {
      await deleteTastingApi(tastingId);
      navigate('/tastings'); // Redirect to tastings list
    } catch (err) {
      console.error('Error deleting tasting:', err);
      alert(err.message || 'Error deleting tasting.');
    }
  };

  // Handler to share tasting details
  const handleShare = async () => {
    if (navigator.share && tasting) {
      try {
        await navigator.share({
          title: `Tasting of ${tasting.whiskeyName}`,
          text: `Check out my tasting of ${tasting.whiskeyName}, rating ${tasting.rating}/5!`,
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
  };

  // Helper function to render tasting notes sections
  const renderTastingNotesSection = (title, selectedNotes, manualNotes) => {
    if (!selectedNotes?.length && !manualNotes) return null;
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {title}
        </h3>
        {selectedNotes?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedNotes.map((note) => (
              <span
                key={note}
                className="px-2 py-1 bg-sky-100 text-sky-700 dark:bg-sky-800/50 dark:text-sky-300 rounded-full text-xs"
              >
                {note}
              </span>
            ))}
          </div>
        )}
        {manualNotes && (
          <p className="text-gray-600 dark:text-gray-400 text-sm italic whitespace-pre-wrap">
            {manualNotes}
          </p>
        )}
      </div>
    );
  };

  // Render loading spinner
  if (loading) {
    return (
      <div
        className="flex justify-center items-center min-h-[calc(100vh-200px)]"
        dir="rtl"
      >
        <LoadingSpinner size="lg" message="Loading tasting details..." />
      </div>
    );
  }

  // Render error message if tasting not found or error occurred
  if (error && !tasting) {
    return (
      <div className="text-center p-8" dir="rtl">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <Button onClick={() => navigate('/tastings')} variant="outline">
          <ArrowLeft className="ml-2 rtl:mr-2 h-4 w-4" />
          Back to Tasting Log
        </Button>
      </div>
    );
  }

  // Render "Tasting not found" if no tasting data
  if (!tasting) {
    return (
      <div className="text-center p-8" dir="rtl">
        <div className="text-gray-500 text-lg mb-4">Tasting not found</div>
        <Button onClick={() => navigate('/tastings')} variant="outline">
          <ArrowLeft className="ml-2 rtl:mr-2 h-4 w-4" />
          Back to Tasting Log
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6" dir="rtl">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          size="sm"
          className="self-start sm:self-center"
        >
          <ArrowLeft className="ml-2 rtl:mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-center sm:text-right rtl:sm:text-left flex-grow">
          <h1 className="text-2xl sm:text-3xl font-bold text-sky-700 dark:text-sky-300">
            Tasting of:{' '}
            <Link
              to={`/collection/${tasting.whiskey_id}`}
              className="hover:underline"
            >
              {tasting.whiskeyName || 'Unknown Whiskey'}
            </Link>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <CalendarDays className="inline-block h-4 w-4 ml-1 rtl:mr-1 rtl:ml-0" />
            {new Date(tasting.tasting_date).toLocaleDateString('he-IL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {tasting.setting && ` | ${tasting.setting}`}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            onClick={handleShare}
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-sky-600"
          >
            <Share2 className="h-5 w-5" />
            <span className="sr-only">Share</span>
          </Button>
          {tasting.rating && (
            <div className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-md">
              <Star className="h-5 w-5 fill-current" />
              <span className="font-bold text-lg">
                {tasting.rating.toFixed(1)}/5
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Main content area */}
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Left column: Image and quick actions */}
          <div className="md:col-span-1 space-y-4">
            {tasting.image_url ? (
              <img
                src={tasting.image_url}
                alt={`Tasting of ${tasting.whiskeyName}`}
                className="w-full h-auto max-h-80 object-contain rounded-lg border dark:border-gray-700"
              />
            ) : (
              <div className="w-full h-60 bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-lg">
                <FileText className="h-16 w-16 text-gray-400 dark:text-gray-500" />
              </div>
            )}
            <div className="space-y-2">
              <Button
                onClick={handleEditTasting}
                variant="outline"
                className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Edit3 className="ml-2 rtl:mr-2 h-4 w-4" />
                Edit Tasting
              </Button>
              {tasting.whiskey_id && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Link to={`/collection/${tasting.whiskey_id}`}>
                    <Eye className="ml-2 rtl:mr-2 h-4 w-4" />
                    View Whiskey
                  </Link>
                </Button>
              )}
              <Button
                onClick={handleDeleteTasting}
                variant="destructive-outline"
                className="w-full"
              >
                <Trash2 className="ml-2 rtl:mr-2 h-4 w-4" />
                Delete Tasting
              </Button>
            </div>
          </div>

          {/* Right column: Tasting details */}
          <div className="md:col-span-2 space-y-6">
            {tasting.color && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  <Palette className="inline-block h-5 w-5 ml-2 rtl:mr-2 text-sky-600 dark:text-sky-400" />
                  Color
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {tasting.color}
                </p>
              </div>
            )}
            {tasting.glassware && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  <Tag className="inline-block h-5 w-5 ml-2 rtl:mr-2 text-sky-600 dark:text-sky-400" />
                  Glassware
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {tasting.glassware}
                </p>
              </div>
            )}

            {renderTastingNotesSection(
              'Nose',
              tasting.nose_notes,
              tasting.nose_manual,
            )}
            {renderTastingNotesSection(
              'Palate',
              tasting.palate_notes,
              tasting.palate_manual,
            )}
            {renderTastingNotesSection(
              'Finish',
              tasting.finish_notes,
              tasting.finish_manual,
            )}

            {tasting.overall_impression && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <MessageSquare className="inline-block h-5 w-5 ml-2 rtl:mr-2 text-sky-600 dark:text-sky-400" />
                  Overall Impression
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {tasting.overall_impression}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit tasting dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[700px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              Edit Tasting of {tasting.whiskeyName}&apos;s
            </DialogTitle>
            <DialogDescription>
              Update tasting details here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <TastingForm
            initialTasting={tasting}
            whiskeys={whiskeysForForm}
            onSubmit={handleSaveTasting}
            onCancel={() => setShowEditDialog(false)}
            isLoadingExternal={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TastingDetailPage;
