import React, { useState, useEffect } from 'react';
import { supabase, UnclaimedProperty, Template } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';

const OrderHistory: React.FC = () => {
  const { user } = useAuth();
  const [letters, setLetters] = useState<UnclaimedProperty[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLetters();
      fetchTemplates();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLetters = async () => {
    try {
      const { data, error } = await supabase
        .from('unclaimed_property')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLetters(data || []);
    } catch (error) {
      console.error('Error fetching letters:', error);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="w-5 h-5 text-gray-500" />;
      case 'submitted':
        return <Mail className="w-5 h-5 text-blue-500" />;
      case 'mailed':
        return <Truck className="w-5 h-5 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'text-gray-500 bg-gray-100';
      case 'submitted':
        return 'text-blue-600 bg-blue-100';
      case 'mailed':
        return 'text-orange-600 bg-orange-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-red-600 bg-red-100';
    }
  };

  const getTemplateName = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    return template?.name || 'Unknown Template';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
        <p className="text-gray-600">Track the status of your letter orders</p>
      </div>

      {letters.length === 0 ? (
        <div className="text-center py-16">
          <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600 mb-6">Start by creating your first letter</p>
          <a
            href="/create-letter"
            className="btn-primary"
          >
            Create Letter
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {letters.map((letter) => (
            <div key={letter.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                                         {getStatusIcon(letter.mail_status)}
                     <div>
                       <h3 className="font-semibold text-lg">
                         {letter.recipient_name}
                       </h3>
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(letter.mail_status)}`}>
                         {letter.mail_status.charAt(0).toUpperCase() + letter.mail_status.slice(1)}
                       </span>
                     </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recipient</h4>
                                         <div className="text-gray-600">
                     <p className="font-medium">{letter.recipient_name}</p>
                     <p>{letter.address.street}</p>
                     <p>
                       {letter.address.city}, {letter.address.state} {letter.address.zip_code}
                     </p>
                     <p>{letter.address.country || 'USA'}</p>
                   </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                      <div className="text-gray-600 space-y-1">
                        <p>Order Date: {formatDate(letter.created_at)}</p>
                                               <p>Amount: ${letter.amount.toFixed(2)}</p>
                       <p>Service: {letter.required_service}</p>
                       <p>Record ID: {letter.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Letter Preview</h4>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-32 overflow-y-auto">
                                           <p className="text-sm text-gray-600">
                       State: {letter.state_of_property} | Amount: ${letter.amount.toFixed(2)} | Service: {letter.required_service}
                     </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
