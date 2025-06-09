import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  Star,
  UploadCloud,
  Loader2,
  Save,
  XCircle,
} from 'lucide-react';

// Sample data - in a real app, this might come from an API or a shared constants file
const glasswareOptions = [
  'גלנקיירן (Glencairn)',
  'קופיטה (Copita) / כוס טוליפ',
  'טמבלר / אולד פאשנד / רוקס',
  'כוס יין לבן קטנה',
  'NEAT Glass',
  'אחר',
];
const whiskeyColors = [
  'שקוף לחלוטין (מים)',
  'קש חיוור מאוד',
  'קש',
  'זהב חיוור',
  'זהב',
  'זהב מלא / זהב עמוק',
  'ענבר',
  'נחושת / ברונזה',
  'אדמדם / חלודה',
  'מהגוני',
  'אגוז כהה / חום כהה',
  'כמעט שחור (נדיר)',
];
const tastingNotesCategories = {
  אף: [
    'פירותי (הדרים, תפוח)',
    'פירותי (פירות יער)',
    'פרחוני',
    'מתוק (דבש, וניל)',
    'חריף (קינמון)',
    'מעושן (כבול)',
    'עצי (אלון)',
    'דגני (לתת)',
    'ימי/מלוח',
  ],
  טעם: [
    'מתוק (קרמל, סוכר חום)',
    'פירותי (פירות אדומים, יבשים)',
    "חריף (פלפל, ג'ינג'ר)",
    'מעושן',
    'מריר (שוקולד, קפה)',
    'עצי',
    'אגוזי',
    'קרמי/חמאתי',
  ],
  סיומת: [
    'קצרה',
    'בינונית',
    'ארוכה',
    'יבשה',
    'מתוקה',
    'חריפה',
    'מעושנת',
    'חמימה',
  ],
};

// Helper to create a simple class name utility
const cn = (...classes) => classes.filter(Boolean).join(' ');

const TastingForm = ({
  initialTasting,
  onSubmit,
  onCancel,
  whiskeys = [], // Array of whiskey objects { id, name } for the select dropdown
  isLoadingWhiskeys = false, // To show loading state for whiskey select
  isSubmitting = false, // For external loading state during submission
  apiError = '', // For displaying errors from parent component
}) => {
  const defaultFormState = {
    whiskey_id: '',
    tasting_date: new Date().toISOString().split('T')[0],
    setting: '',
    glassware: glasswareOptions[0] || '',
    color: '',
    nose_notes: [],
    palate_notes: [],
    finish_notes: [],
    nose_manual: '',
    palate_manual: '',
    finish_manual: '',
    overall_impression: '',
    rating: 0, // 0-5 stars
    image_url: '',
    imageFile: null, // For new image upload
  };

  const [tasting, setTasting] = useState(defaultFormState);
  const [imagePreview, setImagePreview] = useState('');
  const [formError, setFormError] = useState(''); // Internal form validation errors

  useEffect(() => {
    if (initialTasting) {
      const populatedTasting = {
        ...defaultFormState,
        ...initialTasting,
        whiskey_id: initialTasting.whiskey_id?.toString() || '', // Ensure it's a string for select
        nose_notes: Array.isArray(initialTasting.nose_notes)
          ? initialTasting.nose_notes
          : [],
        palate_notes: Array.isArray(initialTasting.palate_notes)
          ? initialTasting.palate_notes
          : [],
        finish_notes: Array.isArray(initialTasting.finish_notes)
          ? initialTasting.finish_notes
          : [],
        rating:
          typeof initialTasting.rating === 'number' ? initialTasting.rating : 0,
        tasting_date: initialTasting.tasting_date
          ? new Date(initialTasting.tasting_date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        imageFile: null, // Reset file on edit
      };
      setTasting(populatedTasting);
      setImagePreview(initialTasting.image_url || '');
    } else {
      setTasting(defaultFormState); // Reset to default for new form
      setImagePreview('');
    }
  }, [initialTasting /* defaultFormState */]); // Warning: React Hook useEffect has a missing dependency: 'defaultFormState'. Either include it or remove the dependency array

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormError(''); // Clear general form error on change
    setTasting((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (name === 'image_url') {
      // If user types URL manually
      setImagePreview(value);
      setTasting((prev) => ({ ...prev, imageFile: null })); // Clear file if URL is typed
    }
  };

  const handleSelectChange = (name, value) => {
    setFormError('');
    setTasting((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (newRating) => {
    setTasting((prev) => ({ ...prev, rating: newRating }));
  };

  const handleMultiSelectChange = (categoryKey, noteValue, isChecked) => {
    setTasting((prev) => {
      const currentNotes = prev[categoryKey] || [];
      let updatedNotes;
      if (isChecked) {
        updatedNotes = [...currentNotes, noteValue];
      } else {
        updatedNotes = currentNotes.filter((n) => n !== noteValue);
      }
      return { ...prev, [categoryKey]: updatedNotes };
    });
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setTasting((prev) => ({ ...prev, imageFile: file, image_url: '' })); // Clear URL if file is chosen
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!tasting.whiskey_id) {
      setFormError('אנא בחר ויסקי לטעימה.');
      return false;
    }
    if (!tasting.tasting_date) {
      setFormError('אנא בחר תאריך טעימה.');
      return false;
    }
    // Add more validations if needed (e.g., rating required)
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(''); // Clear previous errors
    if (!validateForm()) return;

    // In a standalone app, you'd likely use FormData if imageFile exists
    const submissionData = { ...tasting };
    if (submissionData.imageFile) {
      // If you were submitting to an API that accepts FormData:
      // const formData = new FormData();
      // Object.keys(submissionData).forEach(key => {
      //   if (key === 'imageFile' && submissionData.imageFile) {
      //     formData.append('image', submissionData.imageFile); // 'image' is the field name for the file
      //   } else if (key !== 'imageFile' && submissionData[key] !== null && submissionData[key] !== undefined) {
      //     // Convert arrays to JSON strings or handle them as your API expects
      //     if (Array.isArray(submissionData[key])) {
      //         submissionData[key].forEach(item => formData.append(`${key}[]`, item));
      //     } else {
      //         formData.append(key, submissionData[key]);
      //     }
      //   }
      // });
      // onSubmit(formData); // Submit FormData
      console.warn(
        'Image file selected, but form is not configured for FormData submission in this standalone example. Passing plain object.',
      );
      onSubmit(submissionData); // For now, just pass the object with imageFile info
    } else {
      onSubmit(submissionData); // Submit plain object
    }
  };

  const commonInputClass =
    'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder:text-gray-400';
  const commonLabelClass =
    'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
  const sectionTitleClass =
    'text-xl font-semibold text-gray-800 dark:text-gray-200 border-b pb-2 mb-4 dark:border-gray-600';
  const noteGroupContainerClass =
    'p-4 border rounded-md dark:border-gray-600 bg-gray-50 dark:bg-gray-800/40 space-y-3';
  const checkboxGroupClass =
    'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-3';

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-1" dir="rtl">
      {(formError || apiError) && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md text-sm text-red-600 dark:text-red-300 flex items-center">
          <AlertCircle
            size={18}
            className="ml-2 rtl:mr-2 rtl:ml-0 flex-shrink-0"
          />
          <span>{formError || apiError}</span>
        </div>
      )}

      {/* Basic Information Section */}
      <section>
        <h3 className={sectionTitleClass}>מידע בסיסי</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div>
            <Label htmlFor="whiskey_id" className={commonLabelClass}>
              ויסקי <span className="text-red-500">*</span>
            </Label>
            {isLoadingWhiskeys ? (
              <div className="flex items-center justify-center h-10 border rounded-md dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50">
                <Loader2 className="animate-spin h-5 w-5 text-gray-500" />
              </div>
            ) : (
              <Select
                value={tasting.whiskey_id}
                onValueChange={(value) =>
                  handleSelectChange('whiskey_id', value)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className={cn(commonInputClass, 'w-full')}>
                  <SelectValue placeholder="בחר ויסקי מהאוסף..." />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:text-gray-200">
                  {whiskeys.length === 0 && (
                    <SelectItem value="" disabled>
                      אין ויסקי זמין
                    </SelectItem>
                  )}
                  {whiskeys.map((w) => (
                    <SelectItem
                      key={w.id}
                      value={w.id.toString()}
                      className="hover:bg-gray-600"
                    >
                      {w.name} {w.distillery ? `(${w.distillery})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div>
            <Label htmlFor="tasting_date" className={commonLabelClass}>
              תאריך טעימה <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tasting_date"
              name="tasting_date"
              type="date"
              value={tasting.tasting_date}
              onChange={handleChange}
              required
              className={commonInputClass}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="setting" className={commonLabelClass}>
              מקום / אווירה
            </Label>
            <Input
              id="setting"
              name="setting"
              value={tasting.setting}
              onChange={handleChange}
              placeholder="לדוגמה: בבית, עם חברים"
              className={commonInputClass}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="glassware" className={commonLabelClass}>
              סוג כוס
            </Label>
            <Select
              value={tasting.glassware}
              onValueChange={(value) => handleSelectChange('glassware', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className={cn(commonInputClass, 'w-full')}>
                <SelectValue placeholder="בחר סוג כוס..." />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700 dark:text-gray-200">
                {glasswareOptions.map((g) => (
                  <SelectItem key={g} value={g} className="hover:bg-gray-600">
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Appearance Section */}
      <section>
        <h3 className={sectionTitleClass}>מראה</h3>
        <div>
          <Label htmlFor="color" className={commonLabelClass}>
            צבע
          </Label>
          <Select
            value={tasting.color}
            onValueChange={(value) => handleSelectChange('color', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger className={cn(commonInputClass, 'w-full')}>
              <SelectValue placeholder="בחר צבע..." />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-700 dark:text-gray-200">
              {whiskeyColors.map((c) => (
                <SelectItem key={c} value={c} className="hover:bg-gray-600">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Tasting Notes Sections (Nose, Palate, Finish) */}
      {Object.entries(tastingNotesCategories).map(
        ([categoryDisplayName, notesList]) => {
          const categoryKeyMap = {
            אף: 'nose_notes',
            טעם: 'palate_notes',
            סיומת: 'finish_notes',
          };
          const manualKeyMap = {
            אף: 'nose_manual',
            טעם: 'palate_manual',
            סיומת: 'finish_manual',
          };

          const categoryKey = categoryKeyMap[categoryDisplayName];
          const manualKey = manualKeyMap[categoryDisplayName];

          const translatedDisplayName = {
            אף: 'אף (Nose)',
            טעם: 'חיך (Palate)',
            סיומת: 'סיומת (Finish)',
          }[categoryDisplayName];

          return (
            <section key={categoryKey}>
              <h3 className={sectionTitleClass}>{translatedDisplayName}</h3>
              <div className={noteGroupContainerClass}>
                <Label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  בחר רשמים:
                </Label>
                <div className={checkboxGroupClass}>
                  {notesList.map((noteValue) => (
                    <div
                      key={`${categoryKey}-${noteValue}`}
                      className="flex items-center space-x-2 rtl:space-x-reverse"
                    >
                      <Checkbox
                        id={`${categoryKey}-${noteValue.replace(/\s|\(|\)/g, '-')}`} // Create a unique ID
                        checked={(tasting[categoryKey] || []).includes(
                          noteValue,
                        )}
                        onCheckedChange={(checked) =>
                          handleMultiSelectChange(
                            categoryKey,
                            noteValue,
                            !!checked,
                          )
                        } // Ensure checked is boolean
                        disabled={isSubmitting}
                        className="dark:border-gray-500 data-[state=checked]:bg-sky-600 dark:data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-600 dark:data-[state=checked]:border-sky-500"
                      />
                      <Label
                        htmlFor={`${categoryKey}-${noteValue.replace(/\s|\(|\)/g, '-')}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300"
                      >
                        {noteValue}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <Label
                    htmlFor={manualKey}
                    className={`${commonLabelClass} mt-2`}
                  >
                    הערות נוספות על ה{categoryDisplayName}:
                  </Label>
                  <Textarea
                    id={manualKey}
                    name={manualKey}
                    placeholder="רשמים נוספים (חופשי)..."
                    value={tasting[manualKey] || ''}
                    onChange={handleChange}
                    className={cn(commonInputClass, 'min-h-[70px]')}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </section>
          );
        },
      )}

      {/* Summary and Rating Section */}
      <section>
        <h3 className={sectionTitleClass}>סיכום ודירוג</h3>
        <div className="space-y-5">
          <div>
            <Label htmlFor="overall_impression" className={commonLabelClass}>
              התרשמות כללית
            </Label>
            <Textarea
              id="overall_impression"
              name="overall_impression"
              value={tasting.overall_impression}
              onChange={handleChange}
              rows={4}
              placeholder="סיכום החוויה, מחשבות כלליות, האם תקנה שוב?"
              className={cn(commonInputClass, 'min-h-[100px]')}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label className={`${commonLabelClass} mb-2`}>
              דירוג (0-5 כוכבים)
            </Label>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              {[...Array(5)].map((_, i) => {
                const starValue = i + 1;
                return (
                  <Star
                    key={starValue}
                    onClick={() =>
                      !isSubmitting && handleRatingChange(starValue)
                    }
                    className={cn(
                      'h-8 w-8 transition-colors',
                      isSubmitting
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer',
                      tasting.rating >= starValue
                        ? 'text-yellow-400 fill-yellow-400 dark:text-yellow-400 dark:fill-yellow-400'
                        : 'text-gray-300 dark:text-gray-500 hover:text-yellow-300 dark:hover:text-yellow-500',
                    )}
                  />
                );
              })}
              {tasting.rating > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => !isSubmitting && handleRatingChange(0)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  disabled={isSubmitting}
                >
                  אפס דירוג
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              הדירוג הנוכחי: {tasting.rating || 'לא דורג'}
              {tasting.rating > 0 &&
                (tasting.rating === 1 ? ' כוכב' : ' כוכבים')}
            </p>
          </div>
        </div>
      </section>

      {/* Image Upload Section */}
      <section>
        <h3 className={sectionTitleClass}>תמונת טעימה (אופציונלי)</h3>
        <div className="space-y-3">
          <div>
            <Label
              htmlFor="image_url_manual_tasting"
              className={commonLabelClass}
            >
              קישור לתמונה (URL)
            </Label>
            <Input
              id="image_url_manual_tasting"
              name="image_url"
              type="url"
              value={tasting.image_url}
              onChange={handleChange}
              placeholder="הדבק קישור לתמונה..."
              className={commonInputClass}
              disabled={isSubmitting}
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center my-2">
            או
          </div>
          <div>
            <Label
              htmlFor="image_upload_tasting"
              className={cn(
                'flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg transition-colors',
                isSubmitting
                  ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800/30'
                  : 'cursor-pointer bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700',
              )}
            >
              {imagePreview ? (
                <div className="text-center p-2 max-h-full overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="תצוגה מקדימה"
                    className="max-h-24 mx-auto mb-1 rounded object-contain"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    בחר קובץ חדש להחלפה.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500 dark:text-gray-400">
                  <UploadCloud className="w-8 h-8 mb-2" />
                  <p className="mb-1 text-sm">
                    <span className="font-semibold">לחץ להעלאה</span> או גרור
                    קובץ
                  </p>
                  <p className="text-xs">PNG, JPG, GIF (מומלץ עד 2MB)</p>
                </div>
              )}
              <Input
                id="image_upload_tasting"
                type="file"
                className="hidden"
                onChange={handleImageFileChange}
                accept="image/png, image/jpeg, image/gif"
                disabled={isSubmitting}
              />
            </Label>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-6 border-t dark:border-gray-700/50 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <XCircle size={18} /> ביטול
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-sky-600 hover:bg-sky-700 text-white dark:bg-sky-500 dark:hover:bg-sky-600 min-w-[120px] flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <Save size={18} />
          )}
          {initialTasting?.id ? 'עדכן טעימה' : 'שמור טעימה'}
        </Button>
      </div>
    </form>
  );
};

export default TastingForm;
