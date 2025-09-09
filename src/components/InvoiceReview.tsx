import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Invoice {
  _id: string;
  vendor_name: string;
  invoice_number?: string;
  invoice_date: string;
  total_amount: number;
  currency: string;
  status: string;
  confidence_score?: number;
  email_subject: string;
  email_sender: string;
}

const InvoiceReview: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    fetchInvoices();
  }, [page]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/invoices/pending-review?page=${page}&page_size=20`);
      setInvoices(response.data.invoices);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (invoiceId: string) => {
    try {
      await api.patch(`/invoices/${invoiceId}/review`, {
        is_valid: true
      });
      fetchInvoices();
    } catch (error) {
      console.error('Error approving invoice:', error);
    }
  };

  const handleReject = async (invoiceId: string, reason?: string) => {
    try {
      await api.patch(`/invoices/${invoiceId}/review`, {
        is_valid: false,
        reason: reason || 'Not a valid invoice'
      });
      fetchInvoices();
    } catch (error) {
      console.error('Error rejecting invoice:', error);
    }
  };

  const handleDelete = async (invoiceId: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.delete(`/invoices/${invoiceId}`);
        fetchInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingId(invoice._id);
    setEditData({
      vendor_name: invoice.vendor_name,
      total_amount: invoice.total_amount,
      invoice_date: invoice.invoice_date
    });
  };

  const handleSaveEdit = async (invoiceId: string) => {
    try {
      await api.patch(`/invoices/${invoiceId}/review`, editData);
      setEditingId(null);
      fetchInvoices();
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'gray';
    if (score >= 0.8) return 'green';
    if (score >= 0.5) return 'orange';
    return 'red';
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Invoice Review</h2>
      
      {invoices.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No invoices need review
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div key={invoice._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {editingId === invoice._id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editData.vendor_name}
                        onChange={(e) => setEditData({...editData, vendor_name: e.target.value})}
                        className="border p-1 rounded"
                        placeholder="Vendor name"
                      />
                      <input
                        type="number"
                        value={editData.total_amount}
                        onChange={(e) => setEditData({...editData, total_amount: parseFloat(e.target.value)})}
                        className="border p-1 rounded"
                        placeholder="Amount"
                      />
                      <input
                        type="date"
                        value={editData.invoice_date?.split('T')[0]}
                        onChange={(e) => setEditData({...editData, invoice_date: e.target.value})}
                        className="border p-1 rounded"
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold">{invoice.vendor_name}</h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {invoice.currency} {invoice.total_amount}
                      </p>
                      <p className="text-sm text-gray-600">
                        Invoice: {invoice.invoice_number || 'N/A'} | 
                        Date: {new Date(invoice.invoice_date).toLocaleDateString()}
                      </p>
                    </>
                  )}
                  
                  <div className="mt-2 text-sm text-gray-500">
                    <p>From: {invoice.email_sender}</p>
                    <p>Subject: {invoice.email_subject}</p>
                  </div>
                  
                  {invoice.confidence_score && (
                    <div className="mt-2">
                      <span 
                        className={`inline-block px-2 py-1 rounded text-sm text-white`}
                        style={{ backgroundColor: getConfidenceColor(invoice.confidence_score) }}
                      >
                        Confidence: {(invoice.confidence_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  {editingId === invoice._id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(invoice._id)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleApprove(invoice._id)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleEdit(invoice)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleReject(invoice._id)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleDelete(invoice._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {total > 20 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page * 20 >= total}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default InvoiceReview; 