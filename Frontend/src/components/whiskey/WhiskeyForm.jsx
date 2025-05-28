import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Save, XCircle, AlertCircle, UploadCloud } from 'lucide-react';

// Sample data for regions and types - in a real app, this might come from an API or a shared constants file
const regions = [
  "סקוטלנד - היילנדס", "סקוטלנד - איילה", "סקוטלנד - ספייסייד", "סקוטלנד - לוולנדס",
  "סקוטלנד - קמפבלטאון", "סקוטלנד - איים", "אירלנד", "ארה״ב - קנטאקי (בורבון)",
  "ארה״ב - טנסי", "יפן", "קנדה", "הודו", "טייוואן", "אוסטרליה", "ישראל", "אחר"
];
const types = [
  "סינגל מאלט סקוטי", "בלנדד מאלט סקוטי", "בלנדד סקוטי", "בורבון",
  "וויסקי שיפון (Rye)", "סינגל פוט סטיל אירי", "וויסקי יפני", "אחר"
];

const getTodayDate = () => new Date().toISOString().split('T')[0];

export default function WhiskeyForm({ initialWhiskey, onSubmit, onCancel, isLoading: isSubmitting, apiError }) {
  const defaultFormState = {
    name: '',
    distillery: '', // In a standalone app, you might have a separate 'distillery' field or object
    age: '',
    abv: '',
    type: '',
    region: '',
    bottle_size_ml: 700,
    bottle_status: 100,
    purchase_price: '',
    purchase_date: getTodayDate(),
    notes: '',
    image_url: '', // Could be a URL string
    is_favorite: false,
    cask_type: '',
    barcode: '',
    country: '',
    // imageFile: null, // To hold the File object if user uploads a new image
  };

  const [formData, setFormData] = useState(initialWhiskey ? { ...defaultFormState, ...initialWhiskey } : defaultFormState);
  const [imagePreview, setImagePreview] = useState(initialWhiskey?.image_url || '');
  const [imageFile, setImageFile] = useState(null); // State for the actual file object
  const [internalApiError, setInternalApiError] = useState(apiError || '');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (initialWhiskey) {
      let updatedInitial = { ...defaultFormState, ...initialWhiskey };
      if (updatedInitial.purchase_date && !(typeof updatedInitial.purchase_date === 'string' && updatedInitial.purchase_date.match(/^\d{4}-\d{2}-\d{2}$/))) {
        try {
          updatedInitial.purchase_date = new Date(updatedInitial.purchase_date).toISOString().split('T')[0];
        } catch (e) {
          updatedInitial.purchase_date = getTodayDate();
        }
      } else if (!updatedInitial.purchase_date) {
        updatedInitial.purchase_date = getTodayDate();
      }
      if (typeof updatedInitial.bottle_status === 'string') {
        updatedInitial.bottle_status = parseFloat(updatedInitial.bottle_status.replace('%', '')) || 100;
      } else if (typeof updatedInitial.bottle_status !== 'number') {
        updatedInitial.bottle_status = 100;
      }
      setFormData(updatedInitial);
      setImagePreview(updatedInitial.image_url || '');
      setImageFile(null); // Reset image file on initial load/change
    } else {
      setFormData(defaultFormState);
      setImagePreview('');
      setImageFile(null);
    }
  }, [initialWhiskey]);

  useEffect(() => {
    setInternalApiError(apiError);
  }, [apiError]);

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setInternalApiError('');
    setFormErrors(prev => ({ ...prev, [name]: undefined }));
    setFormData((prev) => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setInternalApiError('');
    setFormErrors(prev => ({ ...prev, [name]: undefined }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file); // Store the File object
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Show preview
      };
      reader.readAsDataURL(file);
      // No need to clear formData.image_url here unless you want to prioritize uploaded file over existing URL
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, image_url: url }));
    setImagePreview(url);
    setImageFile(null); // Clear file if URL is manually entered
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "שם הוויסקי הוא שדה חובה.";
    if (!formData.distillery.trim()) errors.distillery = "שם המזקקה הוא שדה חובה.";
    if (formData.age && (isNaN(parseFloat(formData.age)) || parseFloat(formData.age) < 0)) errors.age = "גיל חייב להיות מספר חיובי או ריק.";
    if (formData.abv && (isNaN(parseFloat(formData.abv)) || parseFloat(formData.abv) < 0 || parseFloat(formData.abv) > 100)) errors.abv = "אחוז אלכוהול חייב להיות בין 0 ל-100 או ריק.";
    // Add more validations as needed
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInternalApiError('');
    if (!validateForm()) return;

    // In a standalone app, you'd prepare data for your API
    // This might involve creating FormData if you're uploading a file
    const dataToSubmit = { ...formData };
    
    // Convert numbers correctly
    dataToSubmit.age = dataToSubmit.age === '' ? null : parseFloat(dataToSubmit.age);
    dataToSubmit.abv = dataToSubmit.abv === '' ? null : parseFloat(dataToSubmit.abv);
    dataToSubmit.purchase_price = dataToSubmit.purchase_price === '' ? null : parseFloat(dataToSubmit.purchase_price);
    dataToSubmit.bottle_size_ml = dataToSubmit.bottle_size_ml === '' ? null : parseInt(dataToSubmit.bottle_size_ml);
    dataToSubmit.bottle_status = parseInt(dataToSubmit.bottle_status);

    // If there's an imageFile, you'd typically send it as FormData
    // or handle its upload separately and then save the URL.
    // For this example, we'll just pass it along to the onSubmit handler.
    if (imageFile) {
      // The `onSubmit` function will need to handle this `imageFile` (e.g., upload it)
      dataToSubmit.imageFile = imageFile;
    } else {
      dataToSubmit.imageFile = null; // Ensure it's explicitly null if not set
    }
    // The `image_url` field in formData will contain the existing or manually entered URL.
    // Your backend logic can decide whether to use `image_url` or the new `imageFile`.

    onSubmit(dataToSubmit); // Pass the data (including imageFile if present)
  };

  const commonInputClass = "dark:bg-gray-700 dark:border-gray-600 dark:placeholder:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed";
  const commonLabelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const errorTextClass = "text-xs text-red-600 dark:text-red-400 mt-1 flex items-center";

  const renderError = (fieldName) => {
    if (formErrors[fieldName]) {
      return <p className={errorTextClass}><AlertCircle size={14} className="ml-1 rtl:mr-1"/>{formErrors[fieldName]}</p>;
    }
    return null;
  };

  const isDisabled = isSubmitting; // No isUploadingImage for standalone

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1" dir="rtl">
      {internalApiError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md text-sm text-red-600 dark:text-red-300 flex items-center">
          <AlertCircle size={18} className="ml-2 rtl:mr-2 rtl:ml-0 flex-shrink-0"/>
          <span>{internalApiError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Name */}
        <div>
          <Label htmlFor="whiskey-name" className={commonLabelClass}>שם הוויסקי <span className="text-red-500">*</span></Label>
          <Input id="whiskey-name" name="name" value={formData.name} onChange={handleChange} required className={`${commonInputClass} ${formErrors.name ? 'border-red-500 dark:border-red-500' : ''}`} placeholder="לדוגמה: Ardbeg 10" disabled={isDisabled}/>
          {renderError('name')}
        </div>
        
        {/* Distillery */}
        <div>
          <Label htmlFor="whiskey-distillery" className={commonLabelClass}>מזקקה <span className="text-red-500">*</span></Label>
          <Input id="whiskey-distillery" name="distillery" value={formData.distillery} onChange={handleChange} required className={`${commonInputClass} ${formErrors.distillery ? 'border-red-500 dark:border-red-500' : ''}`} placeholder="לדוגמה: Lagavulin" disabled={isDisabled}/>
          {renderError('distillery')}
        </div>

        {/* Age */}
        <div>
          <Label htmlFor="whiskey-age" className={commonLabelClass}>גיל (שנים)</Label>
          <Input id="whiskey-age" name="age" type="number" min="0" value={formData.age} onChange={handleChange} placeholder="לדוגמה: 12 (ריק ל-NAS)" className={`${commonInputClass} ${formErrors.age ? 'border-red-500 dark:border-red-500' : ''}`} disabled={isDisabled}/>
          {renderError('age')}
        </div>

        {/* ABV */}
        <div>
          <Label htmlFor="whiskey-abv" className={commonLabelClass}>אחוז אלכוהול (ABV %)</Label>
          <Input id="whiskey-abv" name="abv" type="number" step="0.1" min="0" max="100" value={formData.abv} onChange={handleChange} placeholder="לדוגמה: 43.5" className={`${commonInputClass} ${formErrors.abv ? 'border-red-500 dark:border-red-500' : ''}`} disabled={isDisabled}/>
          {renderError('abv')}
        </div>

        {/* Type */}
        <div>
          <Label htmlFor="whiskey-type" className={commonLabelClass}>סוג הוויסקי</Label>
          <Select value={formData.type || ''} onValueChange={(value) => handleSelectChange('type', value)} disabled={isDisabled}>
            <SelectTrigger id="whiskey-type" className={`${commonInputClass} w-full ${formErrors.type ? 'border-red-500 dark:border-red-500' : ''}`}><SelectValue placeholder="בחר סוג..." /></SelectTrigger>
            <SelectContent className="dark:bg-gray-700">
              <SelectItem value="">ללא סוג</SelectItem>
              {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          {renderError('type')}
        </div>

        {/* Region */}
        <div>
          <Label htmlFor="whiskey-region" className={commonLabelClass}>אזור</Label>
          <Select value={formData.region || ''} onValueChange={(value) => handleSelectChange('region', value)} disabled={isDisabled}>
            <SelectTrigger id="whiskey-region" className={`${commonInputClass} w-full ${formErrors.region ? 'border-red-500 dark:border-red-500' : ''}`}><SelectValue placeholder="בחר אזור..." /></SelectTrigger>
            <SelectContent className="dark:bg-gray-700">
              <SelectItem value="">ללא אזור</SelectItem>
              {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          {renderError('region')}
        </div>

        {/* Country */}
        <div>
          <Label htmlFor="whiskey-country" className={commonLabelClass}>מדינה</Label>
          <Input id="whiskey-country" name="country" value={formData.country || ''} onChange={handleChange} placeholder="לדוגמה: סקוטלנד" className={commonInputClass} disabled={isDisabled}/>
          {renderError('country')}
        </div>

        {/* Cask Type */}
        <div>
          <Label htmlFor="whiskey-cask_type" className={commonLabelClass}>סוג חבית</Label>
          <Input id="whiskey-cask_type" name="cask_type" value={formData.cask_type || ''} onChange={handleChange} placeholder="לדוגמה: Ex-Bourbon, Sherry Oak" className={commonInputClass} disabled={isDisabled}/>
          {renderError('cask_type')}
        </div>
        
        {/* Bottle Size (ml) */}
        <div>
          <Label htmlFor="whiskey-bottle_size_ml" className={commonLabelClass}>גודל בקבוק (מ״ל)</Label>
          <Input id="whiskey-bottle_size_ml" name="bottle_size_ml" type="number" min="1" value={formData.bottle_size_ml} onChange={handleChange} placeholder="לדוגמה: 700" className={`${commonInputClass} ${formErrors.bottle_size_ml ? 'border-red-500 dark:border-red-500' : ''}`} disabled={isDisabled}/>
          {renderError('bottle_size_ml')}
        </div>

        {/* Bottle Status (%) */}
        <div>
          <Label htmlFor="whiskey-bottle_status" className={commonLabelClass}>אחוז נותר בבקבוק (%)</Label>
          <Input id="whiskey-bottle_status" name="bottle_status" type="number" min="0" max="100" value={formData.bottle_status} onChange={handleChange} placeholder="100" className={`${commonInputClass} ${formErrors.bottle_status ? 'border-red-500 dark:border-red-500' : ''}`} disabled={isDisabled}/>
          {renderError('bottle_status')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-2">
        {/* Purchase Price */}
        <div>
          <Label htmlFor="whiskey-purchase_price" className={commonLabelClass}>מחיר רכישה (₪)</Label>
          <Input id="whiskey-purchase_price" name="purchase_price" type="number" step="0.01" min="0" value={formData.purchase_price} onChange={handleChange} placeholder="לדוגמה: 250.90" className={`${commonInputClass} ${formErrors.purchase_price ? 'border-red-500 dark:border-red-500' : ''}`} disabled={isDisabled}/>
          {renderError('purchase_price')}
        </div>

        {/* Purchase Date */}
        <div>
          <Label htmlFor="whiskey-purchase_date" className={commonLabelClass}>תאריך רכישה</Label>
          <Input id="whiskey-purchase_date" name="purchase_date" type="date" value={formData.purchase_date} onChange={handleChange} className={`${commonInputClass} ${formErrors.purchase_date ? 'border-red-500 dark:border-red-500' : ''}`} disabled={isDisabled}/>
          {renderError('purchase_date')}
        </div>

        {/* Barcode */}
        <div>
          <Label htmlFor="whiskey-barcode" className={commonLabelClass}>ברקוד</Label>
          <Input id="whiskey-barcode" name="barcode" value={formData.barcode || ''} onChange={handleChange} placeholder="סרוק או הזן ברקוד" className={commonInputClass} disabled={isDisabled}/>
          {renderError('barcode')}
        </div>
      </div>
        
      {/* Notes */}
      <div className="pt-2">
        <Label htmlFor="whiskey-notes" className={commonLabelClass}>תיאור / הערות</Label>
        <Textarea id="whiskey-notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="תיאור כללי, רשמי טעימה אישיים, מאיפה נקנה וכו'" className={`${commonInputClass} min-h-[80px]`} disabled={isDisabled}/>
        {renderError('notes')}
      </div>
      
      {/* Image Upload / URL */}
      <div className="pt-2 space-y-3">
        <Label className={commonLabelClass}>תמונת הוויסקי</Label>
        <div className="flex flex-col sm:flex-row gap-3 items-start">
            <div className="flex-grow">
                <Label htmlFor="whiskey-image_url_input" className={`${commonLabelClass} text-xs`}>קישור לתמונה (URL)</Label>
                <Input 
                id="whiskey-image_url_input" 
                name="image_url" 
                type="url" 
                value={formData.image_url || ''} 
                onChange={handleImageUrlChange} 
                placeholder="https://example.com/image.jpg" 
                className={commonInputClass} 
                disabled={isDisabled}
                />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center pt-1 sm:pt-6">או</div>
            <div className="flex-grow">
                <Label htmlFor="whiskey-image_file_upload" className={`${commonLabelClass} text-xs`}>העלה קובץ</Label>
                <Input 
                id="whiskey-image_file_upload" 
                name="image_file_upload" // Name this differently if you want to avoid conflict with formData.image_url
                type="file" 
                accept="image/*"
                onChange={handleImageFileChange} 
                className={`${commonInputClass} file:mr-4 rtl:file:ml-4 rtl:file:mr-0 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 dark:file:bg-amber-800/30 dark:file:text-amber-200 dark:hover:file:bg-amber-700/40`}
                disabled={isDisabled}
                />
            </div>
        </div>

        {imagePreview && (
            <div className="mt-2 border dark:border-gray-600 rounded-md p-2 inline-block bg-gray-50 dark:bg-gray-700/30 max-w-[200px]">
                <img src={imagePreview} alt="תצוגה מקדימה" className="max-h-32 w-auto rounded"/>
            </div>
        )}
      </div>

      {/* Is Favorite */}
      <div className="flex items-center space-x-3 rtl:space-x-reverse pt-3">
        <Checkbox
          id="whiskey-is_favorite"
          name="is_favorite"
          checked={formData.is_favorite}
          onCheckedChange={(checked) => setFormData(prev => ({...prev, is_favorite: !!checked}))}
          disabled={isDisabled}
          className="dark:border-gray-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
        />
        <Label htmlFor="whiskey-is_favorite" className={`${commonLabelClass} mb-0 cursor-pointer`}>
          סמן כמועדף
        </Label>
      </div>

      {/* Submit/Cancel Buttons */}
      <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-6 border-t dark:border-gray-600 mt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isDisabled} className="dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-700 flex items-center gap-2">
          <XCircle size={18}/> ביטול
        </Button>
        <Button type="submit" disabled={isDisabled} className="bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600 min-w-[100px] flex items-center gap-2">
          {isSubmitting ? <Loader2 className="animate-spin h-5 w-5"/> : <><Save size={18}/> {initialWhiskey?.id ? 'עדכן ויסקי' : 'הוסף ויסקי'}</>}
        </Button>
      </div>
    </form>
  );
}