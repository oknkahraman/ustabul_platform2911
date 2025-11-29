import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedNavigation from '../../components/navigation/AuthenticatedNavigation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import Input from '../../components/ui/Input';
import { employersAPI } from '../../utils/api';

const EmployerProfileSetup = () => {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    taxNumber: '',
    taxOffice: '',
    companyLogo: null,
    logoPreview: '',
    city: '',
    district: '',
    neighborhood: '',
    street: '',
    buildingNumber: '',
    postalCode: ''
  });

  const [errors, setErrors] = useState({});

  const turkishCities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 
    'Gaziantep', 'Şanlıurfa', 'Kocaeli', 'Mersin', 'Diyarbakır', 'Hatay',
    'Manisa', 'Kayseri', 'Samsun', 'Balıkesir', 'Kahramanmaraş', 'Van',
    'Aydın', 'Denizli', 'Sakarya', 'Tekirdağ', 'Muğla', 'Eskişehir'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLogoUpload = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      if (file?.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, companyLogo: 'Dosya boyutu 2MB\'dan küçük olmalıdır' }));
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          companyLogo: file,
          logoPreview: reader?.result
        }));
        setErrors(prev => ({ ...prev, companyLogo: '' }));
      };
      reader?.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.companyName?.trim()) {
      newErrors.companyName = 'Şirket adı zorunludur';
    }

    if (!formData?.taxNumber?.trim()) {
      newErrors.taxNumber = 'Vergi numarası zorunludur';
    } else if (formData?.taxNumber?.length !== 10) {
      newErrors.taxNumber = 'Vergi numarası 10 haneli olmalıdır';
    } else if (!/^\d+$/?.test(formData?.taxNumber)) {
      newErrors.taxNumber = 'Vergi numarası sadece rakamlardan oluşmalıdır';
    }

    if (!formData?.taxOffice?.trim()) {
      newErrors.taxOffice = 'Vergi dairesi zorunludur';
    }

    if (!formData?.city) {
      newErrors.city = 'İl seçimi zorunludur';
    }

    if (!formData?.district?.trim()) {
      newErrors.district = 'İlçe zorunludur';
    }

    if (!formData?.neighborhood?.trim()) {
      newErrors.neighborhood = 'Mahalle zorunludur';
    }

    if (!formData?.street?.trim()) {
      newErrors.street = 'Cadde/Sokak zorunludur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const employerId = localStorage.getItem('userId');
      
      const profileData = {
        companyName: formData?.companyName,
        taxNumber: formData?.taxNumber,
        taxOffice: formData?.taxOffice,
        address: {
          city: formData?.city,
          district: formData?.district,
          neighborhood: formData?.neighborhood,
          street: formData?.street,
          buildingNumber: formData?.buildingNumber,
          postalCode: formData?.postalCode
        }
      };

      // TODO: Add logo upload to your API
      // For now, just update basic profile info
      await employersAPI?.updateEmployerProfile(employerId, profileData);
      
      // Save company name to localStorage
      localStorage.setItem('companyName', formData?.companyName);

      setShowSuccessModal(true);
      setTimeout(() => {
        navigate('/employer-dashboard');
      }, 2000);
      
    } catch (err) {
      console.error('Profile update error:', err);
      setErrors({ submit: err?.response?.data?.message || 'Profil güncellenirken bir hata oluştu' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNavigation
        userRole="employer"
        userName={localStorage.getItem('fullName') || 'İşveren'}
        notificationCount={0}
        onLogout={() => navigate('/homepage')}
      />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            İşveren Profili Oluştur
          </h1>
          <p className="text-muted-foreground">
            Temel şirket bilgilerinizi tamamlayarak kalifiye ustalara ulaşın
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 space-y-6">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Şirket Ünvanı <span className="text-error">*</span>
            </label>
            <Input
              name="companyName"
              value={formData?.companyName}
              onChange={handleInputChange}
              placeholder="Örn: Demir Metal A.Ş."
              error={errors?.companyName}
            />
            {errors?.companyName && (
              <p className="mt-1 text-sm text-error">{errors?.companyName}</p>
            )}
          </div>

          {/* Tax Number and Tax Office Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tax Number */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Vergi Numarası <span className="text-error">*</span>
              </label>
              <Input
                name="taxNumber"
                value={formData?.taxNumber}
                onChange={handleInputChange}
                placeholder="10 haneli vergi numarası"
                maxLength={10}
                error={errors?.taxNumber}
              />
              {errors?.taxNumber && (
                <p className="mt-1 text-sm text-error">{errors?.taxNumber}</p>
              )}
            </div>

            {/* Tax Office */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Vergi Dairesi <span className="text-error">*</span>
              </label>
              <Input
                name="taxOffice"
                value={formData?.taxOffice}
                onChange={handleInputChange}
                placeholder="Örn: Kadıköy Vergi Dairesi"
                error={errors?.taxOffice}
              />
              {errors?.taxOffice && (
                <p className="mt-1 text-sm text-error">{errors?.taxOffice}</p>
              )}
            </div>
          </div>

          {/* Company Logo */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Şirket Logosu
            </label>
            <div className="flex items-start gap-4">
              {formData?.logoPreview && (
                <div className="w-24 h-24 rounded-lg border-2 border-border overflow-hidden">
                  <img 
                    src={formData?.logoPreview} 
                    alt="Şirket logosu önizlemesi"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 cursor-pointer transition-colors"
                >
                  <Icon name="Upload" size={16} />
                  Logo Yükle
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG veya JPEG formatında, maksimum 2MB
                </p>
                {errors?.companyLogo && (
                  <p className="mt-1 text-sm text-error">{errors?.companyLogo}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
              Şirket Adresi <span className="text-error">*</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  İl <span className="text-error">*</span>
                </label>
                <select
                  name="city"
                  value={formData?.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Şehir seçin</option>
                  {turkishCities?.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors?.city && (
                  <p className="mt-1 text-sm text-error">{errors?.city}</p>
                )}
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  İlçe <span className="text-error">*</span>
                </label>
                <Input
                  name="district"
                  value={formData?.district}
                  onChange={handleInputChange}
                  placeholder="Örn: Kadıköy"
                  error={errors?.district}
                />
                {errors?.district && (
                  <p className="mt-1 text-sm text-error">{errors?.district}</p>
                )}
              </div>

              {/* Neighborhood */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mahalle <span className="text-error">*</span>
                </label>
                <Input
                  name="neighborhood"
                  value={formData?.neighborhood}
                  onChange={handleInputChange}
                  placeholder="Örn: Caferağa Mahallesi"
                  error={errors?.neighborhood}
                />
                {errors?.neighborhood && (
                  <p className="mt-1 text-sm text-error">{errors?.neighborhood}</p>
                )}
              </div>

              {/* Street */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cadde/Sokak <span className="text-error">*</span>
                </label>
                <Input
                  name="street"
                  value={formData?.street}
                  onChange={handleInputChange}
                  placeholder="Örn: Moda Caddesi"
                  error={errors?.street}
                />
                {errors?.street && (
                  <p className="mt-1 text-sm text-error">{errors?.street}</p>
                )}
              </div>

              {/* Building Number */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bina No
                </label>
                <Input
                  name="buildingNumber"
                  value={formData?.buildingNumber}
                  onChange={handleInputChange}
                  placeholder="Örn: 45"
                />
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Posta Kodu
                </label>
                <Input
                  name="postalCode"
                  value={formData?.postalCode}
                  onChange={handleInputChange}
                  placeholder="Örn: 34710"
                  maxLength={5}
                />
              </div>
            </div>
          </div>

          {errors?.submit && (
            <div className="bg-error/10 border border-error rounded-lg p-4">
              <p className="text-sm text-error">{errors?.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => navigate('/employer-dashboard')}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={isSubmitting}
              iconName={isSubmitting ? undefined : "Check"}
              iconPosition="right"
            >
              {isSubmitting ? 'Kaydediliyor...' : 'Profili Kaydet'}
            </Button>
          </div>
        </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border p-8 max-w-md w-full animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle2" size={32} color="var(--color-success)" />
              </div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                Profil Oluşturuldu!
              </h3>
              <p className="text-muted-foreground mb-6">
                Profiliniz başarıyla kaydedildi. Şimdi iş ilanı oluşturabilirsiniz.
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Clock" size={16} />
                <span>Gösterge paneline yönlendiriliyorsunuz...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerProfileSetup;