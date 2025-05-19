import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient';

const REQUIRED_FIELDS = [
  'first_name', 'last_name', 'email', 'phone',
  'street_address', 'city', 'state', 'zip_code'
];

export default function Inventory() {
  const [view, setView] = useState('all'); // all | bought | for_sale
  const [leads, setLeads] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, [view, page, categoryFilter, statusFilter]);

  const fetchLeads = async () => {
    const {
      data: { session }
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;
    setUserId(user.id);

    let query = supabase.from('leads').select('*', { count: 'exact' }).order('created_at', { ascending: false });

    if (view === 'all') {
      query = query.eq('uploaded_by', user.id);
    } else if (view === 'bought') {
      query = query.eq('sold_to', user.id);
    } else if (view === 'for_sale') {
      query = query.eq('uploaded_by', user.id).eq('status', 'available').eq('type', 'aged');
    }

    if (categoryFilter) {
      query = query.eq('category', categoryFilter);
    }
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data, count, error } = await query.range((page - 1) * 100, page * 100 - 1);

    if (!error) {
      setLeads(data);
      setTotalPages(Math.ceil(count / 100));
    }
  };

  const handleToggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleStatusChange = async (lead, newStatus) => {
    if (lead.status === 'return' || lead.status === 'accepted') return;

    let updatePayload = { status: newStatus };

    if (newStatus === 'return') {
      const reason = prompt("Reason for return (e.g., wrong information):", "wrong information");
      if (!reason) return;
      updatePayload.reason_returned = reason;

      await supabase.rpc('increment_coins', {
        user_id: userId,
        coin_amount: 10,
      });

      await supabase.rpc('increment_coins', {
        user_id: lead.uploaded_by,
        coin_amount: -10,
      });
    }

    const { error } = await supabase
      .from('leads')
      .update(updatePayload)
      .eq('id', lead.id);

    if (!error) {
      setLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, ...updatePayload } : l))
      );
    }
  };

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6">
        <button onClick={() => setView('all')} className={`px-4 py-2 rounded border ${view === 'all' ? 'bg-blue-600 text-white' : 'bg-white'}`}>All Leads</button>
        <button onClick={() => setView('bought')} className={`px-4 py-2 rounded border ${view === 'bought' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Leads Bought</button>
        <button onClick={() => setView('for_sale')} className={`px-4 py-2 rounded border ${view === 'for_sale' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Leads Up For Sale</button>
      </div>

      <div className="flex gap-4 mb-6">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border px-3 py-2 rounded">
          <option value="">All Categories</option>
          <option value="solar">Solar</option>
          <option value="hvac">HVAC</option>
          <option value="roofing">Roofing</option>
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border px-3 py-2 rounded">
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="accepted">Accepted</option>
          <option value="return">Returned</option>
        </select>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            {REQUIRED_FIELDS.map(field => (
              <th key={field} className="border p-2 text-left capitalize">{field.replace(/_/g, ' ')}</th>
            ))}
            <th className="border p-2">Status</th>
            <th className="border p-2">Expand</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <React.Fragment key={lead.id}>
              <tr className="border-t">
                {REQUIRED_FIELDS.map(field => (
                  <td key={field} className="border px-2 py-1">{lead[field]}</td>
                ))}
                <td className="border px-2 py-1">
                  {view === 'bought' ? (
                    lead.status === 'return' || lead.status === 'accepted' ? (
                      <span className="capitalize">{lead.status}</span>
                    ) : (
                      <select
                        className="border p-1"
                        defaultValue="pending"
                        onChange={(e) => handleStatusChange(lead, e.target.value)}
                      >
                        <option value="pending" disabled>Set status</option>
                        <option value="accepted">Accepted</option>
                        <option value="return">Return</option>
                      </select>
                    )
                  ) : (
                    <span className="capitalize">{lead.status}</span>
                  )}
                </td>
                <td className="border px-2 py-1">
                  <button onClick={() => handleToggleExpand(lead.id)} className="text-blue-600 underline">
                    {expandedRow === lead.id ? 'Hide' : 'Show All'}
                  </button>
                </td>
              </tr>
              {expandedRow === lead.id && (
                <tr className="bg-gray-50">
                  <td colSpan={REQUIRED_FIELDS.length + 2} className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(lead).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <div className="font-semibold capitalize text-gray-600">{key.replace(/_/g, ' ')}</div>
                          <div className="text-gray-900">{value || '—'}</div>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
