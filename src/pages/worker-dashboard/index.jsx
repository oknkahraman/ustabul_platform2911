import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedNavigation from '../../components/navigation/AuthenticatedNavigation';
import JobCard from './components/JobCard';
import ApplicationStatusCard from './components/ApplicationStatusCard';
import MetricsCard from './components/MetricsCard';
import FilterPanel from './components/FilterPanel';
import PortfolioQuickView from './components/PortfolioQuickView';
import NotificationPanel from './components/NotificationPanel';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    skillCategory: 'all',
    sortBy: 'distance',
    urgency: 'all',
    maxDistance: '50',
    resultCount: 12
  });

  // Get user info from localStorage
  const userName = localStorage.getItem('userName') || 'Kullanıcı';
  const userRole = localStorage.getItem('userRole') || 'worker';

  const [notifications, setNotifications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [portfolio, setPortfolio] = useState({
    totalImages: 0,
    verifiedImages: 0,
    pendingVerification: 0,
    completionRate: 0,
    recentImages: []
  });

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      // TODO: Implement API calls to fetch:
      // - User notifications
      // - Available jobs
      // - User applications
      // - User portfolio data
      
      // For now, initialize with empty data
      console.log('Fetching user data...');
    };

    fetchUserData();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      skillCategory: 'all',
      sortBy: 'distance',
      urgency: 'all',
      maxDistance: '50',
      resultCount: 12
    });
  };

  const handleViewJobDetails = (job) => {
    console.log('Viewing job details:', job);
  };

  const handleApplyToJob = (job) => {
    console.log('Applying to job:', job);
  };

  const handleViewApplicationDetails = (application) => {
    console.log('Viewing application details:', application);
  };

  const handleManagePortfolio = () => {
    navigate('/worker-profile-setup');
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications((prev) =>
    prev?.map((notification) =>
    notification?.id === notificationId ?
    { ...notification, read: true } :
    notification
    )
    );
  };

  const handleViewAllNotifications = () => {
    console.log('Viewing all notifications');
  };

  const handleLogout = () => {
    navigate('/homepage');
  };

  const unreadNotificationCount = notifications?.filter((n) => !n?.read)?.length;

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNavigation
        userRole={userRole}
        userName={userName}
        notificationCount={notifications?.filter((n) => !n?.read)?.length || 0}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Hoş Geldiniz, {userName}
          </h1>
          <p className="text-muted-foreground">
            Becerilerinize uygun iş fırsatlarını keşfedin ve başvurularınızı yönetin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            icon="Briefcase"
            label="Aktif Başvurular"
            value={applications?.filter(a => a?.status === 'pending')?.length?.toString() || "0"}
            subValue={`${applications?.filter(a => a?.status === 'pending')?.length || 0} onay bekliyor`}
            color="primary"
            trend={0}
          />

          <MetricsCard
            icon="CheckCircle2"
            label="Tamamlanan İşler"
            value={applications?.filter(a => a?.status === 'completed')?.length?.toString() || "0"}
            subValue="Son 6 ay"
            trend={0}
            color="success"
          />

          <MetricsCard
            icon="Star"
            label="Güvenilirlik Skoru"
            value="0.0"
            subValue="Henüz değerlendirme yok"
            trend={0}
            color="warning"
          />

          <MetricsCard
            icon="TrendingUp"
            label="Ortalama Kazanç"
            value="0 TL"
            subValue="Aylık ortalama"
            trend={0}
            color="accent"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
            />

            <div className="mb-4">
              <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                Size Uygun İş İlanları
              </h2>
              {jobs?.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {jobs?.map((job) => (
                      <JobCard
                        key={job?.id}
                        job={job}
                        onViewDetails={handleViewJobDetails}
                        onApply={handleApplyToJob}
                      />
                    ))}
                  </div>
                  <div className="flex justify-center mt-6">
                    <Button variant="outline" iconName="ChevronDown">
                      Daha Fazla İlan Göster
                    </Button>
                  </div>
                </>
              ) : (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <Icon name="Briefcase" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Henüz İş İlanı Bulunmuyor
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Şu anda size uygun aktif iş ilanı bulunmamaktadır. Lütfen daha sonra tekrar kontrol edin.
                  </p>
                  <Button variant="outline" onClick={handleResetFilters}>
                    Filtreleri Sıfırla
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {notifications?.length > 0 && (
              <NotificationPanel
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onViewAll={handleViewAllNotifications}
              />
            )}

            <PortfolioQuickView
              portfolio={portfolio}
              onManagePortfolio={handleManagePortfolio}
            />

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                Başvuru Durumları
              </h3>
              {applications?.length > 0 ? (
                <div className="space-y-3">
                  {applications?.map((application) => (
                    <ApplicationStatusCard
                      key={application?.id}
                      application={application}
                      onViewDetails={handleViewApplicationDetails}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon name="FileText" size={40} color="var(--color-muted-foreground)" className="mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Henüz başvuru yapmadınız
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-6">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="Lightbulb" size={20} color="var(--color-primary)" />
                </div>
                <div>
                  <h4 className="text-base font-heading font-semibold text-foreground mb-1">
                    Portfolyonuzu Güçlendirin
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Daha fazla doğrulanmış fotoğraf ekleyerek iş bulma şansınızı artırın
                  </p>
                  <Button variant="default" size="sm" onClick={handleManagePortfolio} iconName="Upload">
                    Fotoğraf Ekle
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkerDashboard;