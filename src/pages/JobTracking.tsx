import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, LetterJob, UnclaimedProperty, Template } from '../lib/supabase';
// import { escheatmentService } from '../services/escheatmentService'; // Will be used for advanced features
import toast from 'react-hot-toast';
import { 
  Mail, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertCircle, 
  Eye, 
  RefreshCw,
  FileText,
  DollarSign,
  MapPin
} from 'lucide-react';

const JobTracking: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<LetterJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<LetterJob | null>(null);
  const [jobRecords, setJobRecords] = useState<UnclaimedProperty[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchJobs();
      fetchTemplates();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('letter_jobs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchJobRecords = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('unclaimed_property')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobRecords(data || []);
    } catch (error) {
      console.error('Error fetching job records:', error);
      toast.error('Failed to load job records');
    }
  };

  const handleJobSelect = async (job: LetterJob) => {
    setSelectedJob(job);
    await fetchJobRecords(job.id);
  };

  const refreshJob = async (jobId: string) => {
    setRefreshing(true);
    try {
      await fetchJobs();
      if (selectedJob?.id === jobId) {
        await fetchJobRecords(jobId);
      }
      toast.success('Job status updated');
    } catch (error) {
      console.error('Error refreshing job:', error);
      toast.error('Failed to refresh job');
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Processing':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'Mailed':
        return <Mail className="w-5 h-5 text-orange-500" />;
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing':
        return 'text-blue-600 bg-blue-100';
      case 'Mailed':
        return 'text-orange-600 bg-orange-100';
      case 'Completed':
        return 'text-green-600 bg-green-100';
      case 'Failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getMailStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'Processing':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'In Transit':
        return <Truck className="w-4 h-4 text-orange-500" />;
      case 'Delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Returned':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'Failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMailStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'text-gray-600 bg-gray-100';
      case 'Processing':
        return 'text-blue-600 bg-blue-100';
      case 'In Transit':
        return 'text-orange-600 bg-orange-100';
      case 'Delivered':
        return 'text-green-600 bg-green-100';
      case 'Returned':
        return 'text-red-600 bg-red-100';
      case 'Failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTemplateName = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    return template?.name || 'Unknown Template';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getJobStatistics = (job: LetterJob) => {
    const stats = {
      total: job.total_records,
      processed: job.processed_records,
      mailed: job.mailed_records,
      returned: job.returned_records,
      completionRate: job.total_records > 0 ? (job.mailed_records / job.total_records) * 100 : 0
    };
    return stats;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Tracking Dashboard</h1>
        <p className="text-gray-600">Monitor your escheatment mail jobs and track individual letter status</p>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-16">
          <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs yet</h3>
          <p className="text-gray-600 mb-6">Start by creating your first escheatment mail job</p>
          <a
            href="/escheatment-upload"
            className="btn-primary"
          >
            Create Job
          </a>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Jobs List */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Mail Jobs</h2>
            <div className="space-y-4">
              {jobs.map((job) => {
                const stats = getJobStatistics(job);
                return (
                  <div
                    key={job.id}
                    className={`card cursor-pointer transition-all duration-200 ${
                      selectedJob?.id === job.id
                        ? 'ring-2 ring-primary-500 bg-primary-50'
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => handleJobSelect(job)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(job.status)}
                        <div>
                          <h3 className="font-semibold text-lg">{job.job_name}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          refreshJob(job.id);
                        }}
                        disabled={refreshing}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Records</p>
                        <p className="font-semibold">{stats.total}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Mailed</p>
                        <p className="font-semibold text-green-600">{stats.mailed}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Returned</p>
                        <p className="font-semibold text-red-600">{stats.returned}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Completion</p>
                        <p className="font-semibold">{stats.completionRate.toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Created: {formatDate(job.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Job Details */}
          <div className="lg:col-span-2">
            {selectedJob ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{selectedJob.job_name}</h2>
                  <button
                    onClick={() => refreshJob(selectedJob.id)}
                    disabled={refreshing}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Job Statistics */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-blue-600 mr-2" />
                      <div>
                        <p className="text-sm text-blue-600">Total Records</p>
                        <p className="text-2xl font-bold text-blue-900">{selectedJob.total_records}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm text-green-600">Mailed</p>
                        <p className="text-2xl font-bold text-green-900">{selectedJob.mailed_records}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      <div>
                        <p className="text-sm text-red-600">Returned</p>
                        <p className="text-2xl font-bold text-red-900">{selectedJob.returned_records}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-gray-600 mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">Template</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {getTemplateName(selectedJob.template_id || '')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Records List */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Individual Records</h3>
                  <div className="space-y-3">
                    {jobRecords.map((record) => (
                      <div key={record.id} className="card">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {getMailStatusIcon(record.mail_status)}
                              <h4 className="font-semibold">{record.recipient_name}</h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMailStatusColor(record.mail_status)}`}>
                                {record.mail_status}
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                record.required_service === 'Certified' 
                                  ? 'text-yellow-600 bg-yellow-100' 
                                  : 'text-blue-600 bg-blue-100'
                              }`}>
                                {record.required_service}
                              </span>
                            </div>
                            
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="text-gray-600">
                                  {record.address.street}, {record.address.city}, {record.address.state} {record.address.zip_code}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Amount: </span>
                                <span className="font-semibold">${record.amount.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">State: </span>
                                <span className="font-semibold">{record.state_of_property}</span>
                              </div>
                            </div>

                            {record.tracking_number && (
                              <div className="mt-2 text-sm">
                                <span className="text-gray-600">Tracking: </span>
                                <span className="font-mono">{record.tracking_number}</span>
                              </div>
                            )}

                            {record.returned_scan_url && (
                              <div className="mt-2">
                                <a
                                  href={record.returned_scan_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary-600 hover:text-primary-800 text-sm flex items-center"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Returned Mail Scan
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Job</h3>
                <p className="text-gray-600">Choose a job from the list to view detailed information</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobTracking;
