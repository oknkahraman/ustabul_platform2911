import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedNavigation from '../../components/navigation/AuthenticatedNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import JobPostingCard from './components/JobPostingCard';
import ApplicationCard from './components/ApplicationCard';
import DashboardStats from './components/DashboardStats';
import QuickActions from './components/QuickActions';
import RecentActivity from './components/RecentActivity';
import { jobsAPI, employersAPI, applicationsAPI } from '../../utils/api';

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobFilter, setJobFilter] = useState('all');
  const [applicationFilter, setApplicationFilter] = useState('pending');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    activeJobs: 0,
    activeJobsTrend: 0,
    totalApplications: 0,
    applicationsTrend: 0,
    hiredWorkers: 0,
    hiredTrend: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mockActivities = [
  {
    type: "application",
    message: "Mehmet Yılmaz \'Deneyimli Kaynak Ustası\' ilanınıza başvurdu",
    timestamp: "2 saat önce"
  },
  {
    type: "hire",
    message: "Ali Çelik ile iş sözleşmesi onaylandı",
    timestamp: "5 saat önce"
  },
  {
    type: "checkin",
    message: "Hasan Öztürk işe giriş yaptı - Gebze OSB",
    timestamp: "1 gün önce"
  },
  {
    type: "completion",
    message: "CNC Torna Operatörü işi tamamlandı",
    timestamp: "2 gün önce"
  },
  {
    type: "rating",
    message: "Yeni değerlendirme aldınız: 5 yıldız",
    timestamp: "3 gün önce"
  }];

  useEffect(() => {
    fetchEmployerData();
  }, []);

  const fetchEmployerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const employerId = localStorage.getItem('userId');
      
      if (!employerId) {
        navigate('/login-registration');
        return;
      }

      // Fetch employer's job listings
      const jobsResponse = await jobsAPI?.getAllJobs({ employerId });
      setJobs(jobsResponse?.data?.jobs || []);

      // Fetch dashboard stats
      const statsResponse = await employersAPI?.getDashboardStats(employerId);
      setStats(statsResponse?.data || stats);

      // Fetch all applications for employer's jobs
      const jobIds = jobsResponse?.data?.jobs?.map(job => job?._id) || [];
      const allApplications = [];
      
      for (const jobId of jobIds) {
        const appResponse = await applicationsAPI?.getApplicationsByJob(jobId);
        allApplications?.push(...(appResponse?.data?.applications || []));
      }
      
      setApplications(allApplications);

    } catch (err) {
      console.error('Error fetching employer data:', err);
      setError(err?.userMessage || 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = () => {
    navigate('/job-creation');
  };

  const handleEditJob = (jobId) => {
    navigate(`/job-creation?id=${jobId}&mode=edit`);
  };

  const handleCloseJob = (jobId) => {
    console.log('Close job:', jobId);
  };

  const handleViewApplications = (jobId) => {
    navigate(`/job-detail-view?id=${jobId}&mode=employer`);
  };

  const handleApproveApplication = (applicationId) => {
    console.log('Approve application:', applicationId);
  };

  const handleRejectApplication = (applicationId) => {
    console.log('Reject application:', applicationId);
  };

  const handleViewWorkerProfile = (workerId) => {
    console.log('View worker profile:', workerId);
  };

  const handleViewAllApplications = () => {
    setActiveTab('applications');
  };

  const handleManageProfile = () => {
    navigate('/employer-profile-setup');
  };

  const handleLogout = () => {
    navigate('/homepage');
  };

  const jobFilterOptions = [
  { value: 'all', label: 'Tüm İlanlar' },
  { value: 'active', label: 'Aktif İlanlar' },
  { value: 'closed', label: 'Kapalı İlanlar' },
  { value: 'draft', label: 'Taslaklar' }];


  const applicationFilterOptions = [
  { value: 'pending', label: 'Bekleyen Başvurular' },
  { value: 'approved', label: 'Onaylanan' },
  { value: 'rejected', label: 'Reddedilen' },
  { value: 'all', label: 'Tümü' }];


  const filteredJobs = jobs?.filter((job) => {
    if (jobFilter === 'all') return true;
    return job?.status === jobFilter;
  });

  const filteredApplications = applications?.filter((app) => {
    if (applicationFilter === 'all') return true;
    // Adjust based on your API response structure
    return app?.status === applicationFilter || (applicationFilter === 'pending' && app?.status === 'submitted');
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AuthenticatedNavigation
          userRole="employer"
          userName={localStorage.getItem('fullName') || 'İşveren'}
          notificationCount={0}
          onLogout={handleLogout} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Yükleniyor...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AuthenticatedNavigation
          userRole="employer"
          userName={localStorage.getItem('fullName') || 'İşveren'}
          notificationCount={0}
          onLogout={handleLogout} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-error/10 border border-error rounded-lg p-6 text-center">
            <Icon name="AlertCircle" size={48} color="var(--color-error)" className="mx-auto mb-4" />
            <h3 className="text-lg font-heading font-semibold text-foreground mb-2">Hata</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="default" onClick={fetchEmployerData}>Tekrar Dene</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNavigation
        userRole="employer"
        userName={localStorage.getItem('fullName') || localStorage.getItem('companyName') || 'İşveren'}
        notificationCount={stats?.pendingApprovals || 0}
        onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            İşveren Paneli
          </h1>
          <p className="text-muted-foreground">
            İş ilanlarınızı yönetin ve başvuruları değerlendirin
          </p>
        </div>

        <DashboardStats stats={stats} />

        <QuickActions
          onCreateJob={handleCreateJob}
          onViewAllApplications={handleViewAllApplications}
          onManageProfile={handleManageProfile}
          onAction={() => {}} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg mb-6">
              <div className="border-b border-border">
                <div className="flex items-center justify-between p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('jobs')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-150 ease-out ${
                      activeTab === 'jobs' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`
                      }>

                      İş İlanları
                    </button>
                    <button
                      onClick={() => setActiveTab('applications')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-150 ease-out relative ${
                      activeTab === 'applications' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`
                      }>

                      Başvurular
                      {stats?.pendingApprovals > 0 &&
                      <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {stats?.pendingApprovals}
                        </span>
                      }
                    </button>
                  </div>

                  {activeTab === 'jobs' ?
                  <Select
                    options={jobFilterOptions}
                    value={jobFilter}
                    onChange={setJobFilter}
                    className="w-48" /> :


                  <Select
                    options={applicationFilterOptions}
                    value={applicationFilter}
                    onChange={setApplicationFilter}
                    className="w-48" />

                  }
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'jobs' ? (
                  <div className="space-y-4">
                    {filteredJobs?.length > 0 ? (
                      filteredJobs?.map((job) => (
                        <JobPostingCard
                          key={job?._id}
                          job={{
                            id: job?._id,
                            title: job?.title,
                            postedDate: new Date(job?.createdAt)?.toLocaleDateString('tr-TR', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            }),
                            location: `${job?.location?.city}, ${job?.location?.district}`,
                            salary: `${job?.budget?.min?.toLocaleString()} - ${job?.budget?.max?.toLocaleString()} TL`,
                            status: job?.status,
                            applicationCount: job?.applicationCount || 0,
                            newApplications: job?.newApplications || 0,
                            skills: job?.requiredSkills || []
                          }}
                          onEdit={handleEditJob}
                          onClose={handleCloseJob}
                          onViewApplications={handleViewApplications} />
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Icon name="Briefcase" size={64} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                        <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                          İlan Bulunamadı
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          {jobFilter === 'all' ?'Henüz hiç iş ilanı oluşturmadınız' :'Seçili filtreye uygun iş ilanı bulunmuyor'}
                        </p>
                        <Button variant="default" iconName="Plus" onClick={handleCreateJob}>
                          Yeni İlan Oluştur
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredApplications?.length > 0 ? (
                      filteredApplications?.map((application) => (
                        <ApplicationCard
                          key={application?._id}
                          application={application}
                          onApprove={handleApproveApplication}
                          onReject={handleRejectApplication}
                          onViewProfile={handleViewWorkerProfile} />
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Icon name="Users" size={64} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                        <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                          Başvuru Bulunamadı
                        </h3>
                        <p className="text-muted-foreground">
                          Henüz değerlendirilecek başvuru bulunmuyor
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <RecentActivity activities={mockActivities} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployerDashboard;