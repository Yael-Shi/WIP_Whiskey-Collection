import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // ודא נתיב נכון

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar'; 
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import { UserCircle2, Mail, Edit3, Save, AlertCircle, Camera, CheckCircle, Shield } from 'lucide-react';

// דמה של פונקציות API - החלף בקריאות API אמיתיות
const updateUserProfileApi = async (userId, profileData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // הדמיה של עדכון
      console.log(`Updating profile for user ${userId}:`, profileData);
      if (profileData.fullName === "Error Test") {
          reject(new Error("שגיאת בדיקה בעדכון הפרופיל."));
          return;
      }
      const updatedUser = {
        // ...פרטי משתמש קיימים
        id: userId,
        ...profileData, // דרוס עם הנתונים החדשים
        updated_at: new Date().toISOString(),
      };
      resolve(updatedUser);
    }, 1200);
  });
};

// דמה של פונקציית העלאת תמונה
const uploadAvatarApi = async (file) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log("Avatar uploaded (mock), URL:", reader.result.substring(0,50) + "...");
                resolve({ imageUrl: reader.result }); // מחזירים URL דמה (במציאות זה יהיה URL מהשרת)
            };
            reader.readAsDataURL(file);
        }, 1000);
    });
};


export default function ProfilePage() {
  const { user, loadingAuth, updateUserContext, isAuthenticated } = useAuth(); // updateUserContext היא פונקציה שתצטרך להוסיף ל-AuthContext
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '', // בדרך כלל אימייל לא ניתן לעריכה ישירות בפרופיל
    bio: '', // שדה לדוגמה
    avatarUrl: '' // URL לתמונת הפרופיל
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // אם המשתמש לא מאומת, נתב אותו לדף הבית או התחברות
  useEffect(() => {
    if (!loadingAuth && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loadingAuth, navigate]);


  // אתחול הטופס עם פרטי המשתמש מהקונטקסט
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        bio: user.bio || '', // אם יש שדה כזה במשתמש שלך
        avatarUrl: user.avatarUrl || ''
      });
      setAvatarPreview(user.avatarUrl || '');
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); // נקה שגיאות קודמות בעת שינוי
    setSuccessMessage('');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    if (!formData.fullName.trim()) {
        setError("שם מלא הוא שדה חובה.");
        setIsSubmitting(false);
        return;
    }

    let newAvatarUrl = formData.avatarUrl;

    try {
        // 1. אם נבחר קובץ תמונה חדש, העלה אותו
        if (avatarFile) {
            const uploadResponse = await uploadAvatarApi(avatarFile);
            newAvatarUrl = uploadResponse.imageUrl;
        }

        // 2. הכן את הנתונים לעדכון הפרופיל
        const profileDataToUpdate = {
            fullName: formData.fullName,
            bio: formData.bio,
            avatarUrl: newAvatarUrl,
            // אל תשלח את האימייל אם הוא לא ניתן לעריכה
        };
        
        // 3. קרא ל-API לעדכון הפרופיל
        const updatedUserFromApi = await updateUserProfileApi(user.id, profileDataToUpdate);
        
        // 4. עדכן את הקונטקסט עם המשתמש המעודכן
        if (updateUserContext) {
          // ודא שהאובייקט שאתה מעביר ל-updateUserContext תואם למבנה המשתמש בקונטקסט
          // זה עשוי לכלול רק את השדות שהשתנו, או את כל אובייקט המשתמש מהשרת
          updateUserContext({ 
            ...user, // שמור פרטים קיימים שלא השתנו (כמו email, role, etc.)
            ...updatedUserFromApi // דרוס עם הפרטים המעודכנים מה-API
          });
        } else {
            console.warn("updateUserContext function is not available in AuthContext. User state might be stale.");
        }
        
        setSuccessMessage('הפרופיל עודכן בהצלחה!');
        setIsEditing(false);
        setAvatarFile(null); // נקה את הקובץ שנבחר

    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || 'שגיאה בעדכון הפרופיל. אנא נסה שוב.');
      // אם הייתה שגיאה, החזר את התצוגה המקדימה של האווטאר לקודמת
      setAvatarPreview(user?.avatarUrl || '');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // אחזר את הנתונים המקוריים מהמשתמש הנוכחי
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || ''
      });
      setAvatarPreview(user.avatarUrl || '');
    }
    setAvatarFile(null);
    setError('');
    setSuccessMessage('');
  };

  if (loadingAuth || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]" dir="rtl">
        <LoadingSpinner size="lg" message="טוען פרופיל..." />
      </div>
    );
  }
  
  const userInitial = formData.fullName ? formData.fullName.charAt(0).toUpperCase() : (formData.email ? formData.email.charAt(0).toUpperCase() : 'U');

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 lg:p-8 space-y-8" dir="rtl">
      <header className="pb-6 border-b dark:border-gray-700">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">הפרופיל שלי</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">עדכן את פרטי החשבון והעדפות התצוגה שלך.</p>
      </header>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle size={20}/> {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4 text-green-700 dark:text-green-300 flex items-center gap-2">
          <CheckCircle size={20}/> {successMessage}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg">
        {/* כותרת הפרופיל עם אווטאר */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-6 border-b dark:border-gray-700">
            <div className="relative group">
                <Avatar 
                    src={avatarPreview} 
                    alt={formData.fullName || 'אווטאר'} 
                    fallbackText={userInitial}
                    size="xl" // או גודל אחר שתגדיר בקומפוננטת Avatar
                    className="ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-amber-500"
                />
                {isEditing && (
                    <label 
                        htmlFor="avatar-upload" 
                        className="absolute -bottom-2 -right-2 rtl:-left-2 rtl:-right-auto bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-full cursor-pointer shadow-md transition-all opacity-0 group-hover:opacity-100"
                        title="שנה תמונת פרופיל"
                    >
                        <Camera size={18} />
                        <input 
                            type="file" 
                            id="avatar-upload" 
                            accept="image/*" 
                            onChange={handleAvatarChange} 
                            className="hidden"
                        />
                    </label>
                )}
            </div>
            <div className="text-center sm:text-right rtl:sm:text-left flex-grow">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{formData.fullName || 'משתמש רשום'}</h2>
                <p className="text-gray-500 dark:text-gray-400">{formData.email}</p>
                {user.role && (
                  <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 dark:bg-sky-800/50 dark:text-sky-200">
                    <Shield size={14} className="mr-1 rtl:ml-1"/>
                    {user.role === 'admin' ? 'אדמין מערכת' : 'משתמש רשום'}
                  </span>
                )}
            </div>
            {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" className="sm:ml-auto rtl:sm:mr-auto dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    <Edit3 className="ml-2 rtl:mr-2 h-4 w-4"/> ערוך פרופיל
                </Button>
            )}
        </div>

        {/* תוכן הפרופיל - תצוגה או טופס עריכה */}
        <div className="p-6 space-y-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  שם מלא <span className="text-red-500">*</span>
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full dark:bg-gray-700 dark:border-gray-600"
                  placeholder="הקלד את שמך המלא"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="email_display" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  כתובת אימייל (לא ניתן לשינוי)
                </label>
                <Input
                  id="email_display"
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full bg-gray-100 dark:bg-gray-700/50 dark:border-gray-600 cursor-not-allowed"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  קצת עליי (אופציונלי)
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  placeholder="ספר קצת על עצמך ועל אהבתך לוויסקי..."
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t dark:border-gray-700">
                <Button type="submit" className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white" disabled={isSubmitting}>
                  {isSubmitting ? <LoadingSpinner size="sm" className="ml-2 rtl:mr-2" textColor="text-white"/> : <Save className="ml-2 rtl:mr-2 h-4 w-4" />}
                  שמור שינויים
                </Button>
                <Button type="button" variant="outline" className="w-full sm:w-auto dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" onClick={handleCancelEdit} disabled={isSubmitting}>
                  ביטול
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">שם מלא</h3>
                <p className="text-gray-800 dark:text-gray-100">{formData.fullName || '-'}</p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">אימייל</h3>
                <p className="text-gray-800 dark:text-gray-100">{formData.email}</p>
              </div>
              {formData.bio && (
                <div>
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">קצת עליי</h3>
                    <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap">{formData.bio}</p>
                </div>
              )}
              <div>
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">תאריך הצטרפות</h3>
                <p className="text-gray-800 dark:text-gray-100">{user.created_at ? new Date(user.created_at).toLocaleDateString('he-IL') : 'לא ידוע'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* אפשר להוסיף כאן קטעים נוספים של הגדרות, לדוגמה: */}
      {/* 
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">הגדרות נוספות</h2>
          <p className="text-gray-600 dark:text-gray-400">כאן יהיו הגדרות כגון ניהול התראות, העדפות תצוגה וכו'.</p>
      </div>
      */}
    </div>
  );
}