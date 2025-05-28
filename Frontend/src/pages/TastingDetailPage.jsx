import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // ודא נתיב נכון

import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// ייבוא קומפוננטות טעימה וויסקי
import TastingForm from '../components/tasting/TastingForm';
// import { fetchWhiskeyByIdApi } from '../services/api'; // אם צריך לשלוף שם ויסקי

// ייבוא אייקונים
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
  Link2
} from 'lucide-react';

// --- דמה של פונקציות API - החלף בקריאות API אמיתיות ---
const fetchTastingByIdApi = async (tastingId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const mockTastings = {
        't1': {
          id: 't1',
          whiskey_id: 'w1',
          whiskeyName: 'Lagavulin 16 Year Old', // הוספתי שם ויסקי ישירות לדוגמה
          rating: 4.5,
          tasting_date: '2024-07-15',
          setting: 'ערב רגוע בבית, ליד האח',
          glassware: 'גלנקיירן (Glencairn)',
          color: 'ענבר עמוק',
          nose_notes: ['כבול', 'עשן מדורה', 'מלח ים', 'אצות', 'צימוקים'],
          nose_manual: 'ריח עשיר ומורכב, מעושן מאוד אך לא אגרסיבי. מתיקות פירותית מתחת לעשן.',
          palate_notes: ['שוקולד מריר', 'פלפל שחור', 'תאנים', 'עור', 'מאלט'],
          palate_manual: 'טעם מלא וסמיך. הכבול משתלב היטב עם מתיקות עדינה ורמזים של תבלינים.',
          finish_notes: ['ארוכה', 'חמימה', 'מעושנת', 'מתובלת'],
          finish_manual: 'סיומת ארוכה מאוד, משאירה טעם מעושן ונעים עם חמימות מתפשטת.',
          overall_impression: 'טעימה פשוט פנומנלית. הוויסקי הזה אף פעם לא מאכזב. כל לגימה היא חוויה.',
          image_url: 'https://via.placeholder.com/400/A0522D/FFFFFF?text=Tasting+Details',
          created_at: '2024-07-15T20:00:00Z',
          updated_at: '2024-07-15T20:00:00Z'
        },
        't2': { // טעימה נוספת לדוגמה
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
          overall_impression: 'ויסקי נעים וקליל, טוב ליומיום. לא מורכב מדי אבל מספק.',
        }
      };
      const tasting = mockTastings[tastingId];
      if (tasting) {
        resolve(tasting);
      } else {
        reject(new Error('טעימה לא נמצאה'));
      }
    }, 500);
  });
};

const updateTastingApi = async (tastingId, tastingData) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const updatedTasting = { ...tastingData, id: tastingId, updated_at: new Date().toISOString() };
      console.log("Tasting updated (mock):", updatedTasting);
      resolve(updatedTasting);
    }, 800);
  });
};

const deleteTastingApi = async (tastingId) => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("Tasting deleted (mock):", tastingId);
      resolve(true);
    }, 600);
  });
};

// פונקציה לשליפת כל הוויסקי מהאוסף (עבור הטופס עריכה)
const fetchWhiskeysForDropdownApi = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: 'w1', name: 'Lagavulin 16 Year Old' },
        { id: 'w2', name: 'Glenfiddich 12 Year Old' },
        { id: 'w3', name: 'Ardbeg Uigeadail' },
        { id: 'w4', name: 'Yamazaki 12 Year Old' },
      ]);
    }, 300);
  });
};
// --- סוף דמה של פונקציות API ---


export default function TastingDetailPage() {
  const { tastingId } = useParams();
  const navigate = useNavigate();
  // const { user } = useAuth(); // אם צריך לבדוק הרשאות ספציפיות

  const [tasting, setTasting] = useState(null);
  const [whiskeysForForm, setWhiskeysForForm] = useState([]); // לרשימת הוויסקי בטופס העריכה
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadTastingData = async () => {
      setLoading(true);
      setError('');
      try {
        const tastingData = await fetchTastingByIdApi(tastingId);
        setTasting(tastingData);
        
        // טען רשימת ויסקי עבור טופס העריכה
        const whiskeysData = await fetchWhiskeysForDropdownApi();
        setWhiskeysForForm(whiskeysData);

      } catch (err) {
        console.error("Error loading tasting data:", err);
        setError(err.message || "שגיאה בטעינת פרטי הטעימה.");
      } finally {
        setLoading(false);
      }
    };

    if (tastingId) {
      loadTastingData();
    }
  }, [tastingId]);

  const handleEditTasting = () => {
    setShowEditModal(true);
  };

  const handleSaveTasting = async (tastingData) => {
    setIsSubmitting(true);
    setError('');
    try {
      const updatedTasting = await updateTastingApi(tastingId, tastingData);
      // עדכן את שם הוויסקי אם הוא השתנה בטופס
      const selectedWhiskey = whiskeysForForm.find(w => w.id === updatedTasting.whiskey_id);
      setTasting({ ...updatedTasting, whiskeyName: selectedWhiskey ? selectedWhiskey.name : 'ויסקי לא ידוע'});
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating tasting:", err);
      setError(err.message || "שגיאה בעדכון הטעימה.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTasting = async () => {
    if (!window.confirm(`האם אתה בטוח שברצונך למחוק טעימה זו של ${tasting?.whiskeyName || 'הוויסקי'}?`)) {
      return;
    }
    try {
      await deleteTastingApi(tastingId);
      navigate('/tastings'); // נתב חזרה לרשימת הטעימות
    } catch (err) {
      console.error("Error deleting tasting:", err);
      alert(err.message || "שגיאה במחיקת הטעימה.");
    }
  };

  const handleShare = async () => {
    if (navigator.share && tasting) {
      try {
        await navigator.share({
          title: `טעימה של ${tasting.whiskeyName}`,
          text: `בדוק את הטעימה שלי ל-${tasting.whiskeyName}, דירוג ${tasting.rating}/5!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Sharing failed:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('הקישור הועתק ללוח');
      } catch (err) {
        console.log('Copy failed:', err);
      }
    }
  };
  
  const renderTastingNotesSection = (title, selectedNotes, manualNotes) => {
    if (!selectedNotes?.length && !manualNotes) return null;
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
        {selectedNotes?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedNotes.map((note, index) => (
              <span key={index} className="px-2 py-1 bg-sky-100 text-sky-700 dark:bg-sky-800/50 dark:text-sky-300 rounded-full text-xs">
                {note}
              </span>
            ))}
          </div>
        )}
        {manualNotes && (
          <p className="text-gray-600 dark:text-gray-400 text-sm italic whitespace-pre-wrap">{manualNotes}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]" dir="rtl">
        <LoadingSpinner size="lg" message="טוען פרטי טעימה..." />
      </div>
    );
  }

  if (error && !tasting) {
    return (
      <div className="text-center p-8" dir="rtl">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <Button onClick={() => navigate('/tastings')} variant="outline">
          <ArrowLeft className="ml-2 rtl:mr-2 h-4 w-4" />
          חזור ליומן הטעימות
        </Button>
      </div>
    );
  }

  if (!tasting) {
    return (
      <div className="text-center p-8" dir="rtl">
        <div className="text-gray-500 text-lg mb-4">טעימה לא נמצאה</div>
        <Button onClick={() => navigate('/tastings')} variant="outline">
          <ArrowLeft className="ml-2 rtl:mr-2 h-4 w-4" />
          חזור ליומן הטעימות
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button onClick={() => navigate(-1)} variant="outline" size="sm" className="self-start sm:self-center">
          <ArrowLeft className="ml-2 rtl:mr-2 h-4 w-4" />
          חזרה
        </Button>
        <div className="text-center sm:text-right rtl:sm:text-left flex-grow">
          <h1 className="text-2xl sm:text-3xl font-bold text-sky-700 dark:text-sky-300">
            טעימה של: <Link to={`/collection/${tasting.whiskey_id}`} className="hover:underline">{tasting.whiskeyName || 'ויסקי לא ידוע'}</Link>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <CalendarDays className="inline-block h-4 w-4 ml-1 rtl:mr-1 rtl:ml-0" />
            {new Date(tasting.tasting_date).toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })}
            {tasting.setting && ` | ${tasting.setting}`}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
            <Button onClick={handleShare} variant="ghost" size="icon" className="text-gray-500 hover:text-sky-600">
                <Share2 className="h-5 w-5" />
                <span className="sr-only">שתף</span>
            </Button>
            {tasting.rating && (
                <div className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-md">
                    <Star className="h-5 w-5 fill-current" />
                    <span className="font-bold text-lg">{tasting.rating.toFixed(1)}/5</span>
                </div>
            )}
        </div>
      </div>

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
                alt={`טעימה של ${tasting.whiskeyName}`}
                className="w-full h-auto max-h-80 object-contain rounded-lg border dark:border-gray-700"
              />
            ) : (
              <div className="w-full h-60 bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-lg">
                <FileText className="h-16 w-16 text-gray-400 dark:text-gray-500" />
              </div>
            )}
             <div className="space-y-2">
                <Button onClick={handleEditTasting} variant="outline" className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                  <Edit3 className="ml-2 rtl:mr-2 h-4 w-4" />
                  ערוך טעימה
                </Button>
                {tasting.whiskey_id &&
                    <Button asChild variant="outline" className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                        <Link to={`/collection/${tasting.whiskey_id}`}>
                            <Eye className="ml-2 rtl:mr-2 h-4 w-4" />
                            צפה בוויסקי
                        </Link>
                    </Button>
                }
                <Button onClick={handleDeleteTasting} variant="destructive-outline" className="w-full">
                  <Trash2 className="ml-2 rtl:mr-2 h-4 w-4" />
                  מחק טעימה
                </Button>
            </div>
          </div>

          {/* Right column: Tasting details */}
          <div className="md:col-span-2 space-y-6">
            {tasting.color && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  <Palette className="inline-block h-5 w-5 ml-2 rtl:mr-2 text-sky-600 dark:text-sky-400" />
                  צבע
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{tasting.color}</p>
              </div>
            )}
            {tasting.glassware && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        <Tag className="inline-block h-5 w-5 ml-2 rtl:mr-2 text-sky-600 dark:text-sky-400" /> {/* סמל קצת שונה, לשקול אם מתאים */}
                        סוג כוס
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{tasting.glassware}</p>
                </div>
            )}

            {renderTastingNotesSection("אף (Nose)", tasting.nose_notes, tasting.nose_manual)}
            {renderTastingNotesSection("חיך (Palate)", tasting.palate_notes, tasting.palate_manual)}
            {renderTastingNotesSection("סיומת (Finish)", tasting.finish_notes, tasting.finish_manual)}

            {tasting.overall_impression && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <MessageSquare className="inline-block h-5 w-5 ml-2 rtl:mr-2 text-sky-600 dark:text-sky-400" />
                  התרשמות כללית
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {tasting.overall_impression}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={`עריכת טעימה של ${tasting.whiskeyName}`}
          size="2xl" // אפשר להתאים את גודל המודל לטופס הטעימות
        >
          <TastingForm
            initialTasting={tasting}
            whiskeys={whiskeysForForm} // שלח את רשימת הוויסקי המלאה
            onSubmit={handleSaveTasting}
            onCancel={() => setShowEditModal(false)}
            isLoadingExternal={isSubmitting}
          />
        </Modal>
      )}
    </div>
  );
}
