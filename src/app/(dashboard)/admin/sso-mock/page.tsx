'use client';

import { useState, useEffect } from 'react';
import PopupDialog from '@/components/shared/PopupDialog';
import { Edit2, Trash2, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SSOAccount {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  id_number?: string;
  course?: string;
  department?: string;
  role?: string;
  handled_categories?: string;
  is_registered?: boolean;
}

export default function SSOMockPage() {
  const [accounts, setAccounts] = useState<SSOAccount[]>([]);
  const [departments, setDepartments] = useState<string[]>([
    'Facilities Management', 
    'IT Support', 
    'Academic Affairs', 
    'Student Services'
  ]);
  const [courses, setCourses] = useState<string[]>([
    'BS Computer Science',
    'BS Information Technology',
    'BS Information Systems',
    'BS Computer Engineering',
    'BS Entertainment and Multimedia Computing'
  ]);
  type TabType = 'STUDENT' | 'ADMIN' | 'HANDLER' | 'FACULTY' | 'STAFF';
  const [activeTab, setActiveTab] = useState<TabType>('STUDENT');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<SSOAccount>>({});
  const [simpleInputValue, setSimpleInputValue] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sso-mock', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data as SSOAccount[]);
      } else {
        console.error('Failed to fetch accounts');
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const filteredAccounts = accounts.filter(acc => {
    const computedRole = acc.role || 'STUDENT'; // Fallback just in case
    const matchesTab = computedRole === activeTab;
    const fullName = `${acc.first_name} ${acc.last_name}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchQuery.toLowerCase()) || 
      acc.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getCategoryFromDepartment = (dept: string) => {
    switch (dept) {
      case 'Facilities Management': return 'FACILITIES';
      case 'IT Support': return 'IT_SUPPORT';
      case 'Academic Affairs': return 'ACADEMIC_AFFAIRS';
      case 'Student Services': return 'STUDENT_SERVICES';
      default: return 'FACILITIES';
    }
  };

  const handleOpenModal = (account?: SSOAccount) => {
    if (account) {
      setEditingId(account.id);
      setFormData({ ...account });
    } else {
      setEditingId(null);
      const defaultDept = departments.length > 0 ? departments[0] : undefined;
      setFormData({ 
        status: 'ACTIVE',
        course: activeTab === 'STUDENT' && courses.length > 0 ? courses[0] : undefined,
        department: defaultDept,
        role: activeTab as string,
        handled_categories: activeTab === 'HANDLER' && defaultDept ? getCategoryFromDepartment(defaultDept) : undefined
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {

    if (!formData.email || !formData.first_name || !formData.last_name) {
      alert("Please fill in all required fields (Name and Email).");
      return;
    }

    const payload = {
      ...formData,
      email: formData.email.trim().toLowerCase()
    };

    try {
      if (editingId) {
        await fetch('/api/sso-mock', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editingId })
        });
      } else {
        await fetch('/api/sso-mock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred while saving the account.');
    }
    
    fetchAccounts();
    setIsModalOpen(false);
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/sso-mock?id=${deleteId}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
      alert('An error occurred while deleting the account.');
    }
    fetchAccounts();
    setIsDeleteModalOpen(false);
    setDeleteId(null);
  };


  return (
    <div className="flex flex-col h-auto md:h-full font-poppins w-full min-h-full shrink-0">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-wide">
            SSO Whitelist Manager
          </h1>
          <p className="text-gray-500 text-sm font-bold mt-2 uppercase tracking-wide">
            Manage who is allowed to sign up and what role they receive
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex flex-wrap bg-gray-100 p-1 rounded-lg w-full gap-1">
          <button onClick={() => setActiveTab('STUDENT')} className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === 'STUDENT' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}>Students</button>
          <button onClick={() => setActiveTab('ADMIN')} className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === 'ADMIN' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}>Admins</button>
          <button onClick={() => setActiveTab('HANDLER')} className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === 'HANDLER' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}>Handlers</button>
          <button onClick={() => setActiveTab('FACULTY')} className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === 'FACULTY' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}>Faculty</button>
          <button onClick={() => setActiveTab('STAFF')} className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === 'STAFF' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}>Staff</button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <input type="text" placeholder={`Search ${activeTab.toLowerCase()}s...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black shadow-sm" />
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-[#E50000] hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors uppercase tracking-wide shadow-sm whitespace-nowrap">
            <Plus className="w-4 h-4" />
            Add Whitelist Entry
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-visible md:overflow-auto custom-scrollbar pb-10 bg-white border border-gray-200 rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200">
            <tr>
              <th className="py-4 px-4 font-black text-black text-xs uppercase tracking-wider">Name</th>
              <th className="py-4 px-4 font-black text-black text-xs uppercase tracking-wider">Mapúa Email</th>
              <th className="py-4 px-4 font-black text-black text-xs uppercase tracking-wider text-center">Status</th>
              {activeTab === 'STUDENT' ? (
                <>
                  <th className="py-4 px-4 font-black text-black text-xs uppercase tracking-wider">ID Number</th>
                  <th className="py-4 px-4 font-black text-black text-xs uppercase tracking-wider">Course</th>
                </>
              ) : (
                <>
                  <th className="py-4 px-4 font-black text-black text-xs uppercase tracking-wider">Department</th>
                  <th className="py-4 px-4 font-black text-black text-xs uppercase tracking-wider">Role</th>
                </>
              )}
              <th className="py-4 px-4 font-black text-black text-xs uppercase tracking-wider text-center w-[120px]">Actions</th>
            </tr>
          </thead>
          <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10 font-bold">LOADING...</td></tr>
              ) : filteredAccounts.map((acc) => (
                <tr key={acc.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-sm text-gray-800 font-bold">{acc.first_name} {acc.last_name}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {acc.email} 
                    {acc.is_registered && <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded">REGISTERED</span>}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${acc.status === 'ACTIVE' ? 'bg-[#D1F0D4] text-[#10B981]' : 'bg-[#FFBFC4] text-[#E50000]'}`}>{acc.status}</span>
                  </td>
                  
                  {activeTab === 'STUDENT' ? (
                    <>
                      <td className="py-4 px-4 text-sm text-gray-600 font-mono">{acc.id_number}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{acc.course}</td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 px-4 text-sm text-gray-600">{acc.department || 'N/A'}</td>
                      <td className="py-4 px-4"><span className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-[10px] font-bold uppercase tracking-wider">{acc.role || 'ADMIN'}</span></td>
                    </>
                  )}

                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => handleOpenModal(acc)} className="text-gray-400 hover:text-black transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button 
                        onClick={() => !acc.is_registered && confirmDelete(acc.id)} 
                        disabled={acc.is_registered}
                        className={`${acc.is_registered ? 'opacity-30 cursor-not-allowed text-gray-300' : 'text-gray-400 hover:text-[#E50000] transition-colors'}`} 
                        title={acc.is_registered ? 'Cannot delete an account that is already registered' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <PopupDialog isOpen={isModalOpen} hideHeader={true} maxWidth="max-w-xl" onClose={() => setIsModalOpen(false)} footer={
          <div className="w-full flex justify-end gap-3 px-4 pb-2 mt-4">
            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-black rounded-lg font-bold text-sm transition-colors uppercase">Cancel</button>
            <button onClick={handleSave} className="px-5 py-2.5 bg-[#10B981] hover:bg-green-600 text-white rounded-lg font-bold text-sm transition-colors uppercase">
              {editingId ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        }>
        <div className="flex flex-col px-2 sm:px-4 pt-2">
          <h2 className="text-2xl font-black text-black mb-6 uppercase tracking-wide">
            {editingId ? 'Edit Whitelist Entry' : 'New Whitelist Entry'}
          </h2>
          
          <div className="flex flex-col gap-4">

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-gray-600 font-black text-xs uppercase">First Name *</label>
                    <input type="text" value={formData.first_name || ''} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-gray-600 font-black text-xs uppercase">Last Name *</label>
                    <input type="text" value={formData.last_name || ''} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-gray-600 font-black text-xs uppercase">Mapúa Email *</label>
                    <input type="email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} disabled={!!editingId} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-gray-600 font-black text-xs uppercase">Account Status</label>
                    <select value={formData.status || 'ACTIVE'} onChange={(e) => setFormData({...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE'})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>

                {formData.role === 'STUDENT' ? (
                  <div className="flex flex-col sm:flex-row gap-4 w-full p-4 bg-gray-50 rounded-lg border border-gray-200 mt-2">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-gray-600 font-black text-xs uppercase">Student ID Number</label>
                      <input type="text" value={formData.id_number || ''} onChange={(e) => setFormData({...formData, id_number: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-gray-600 font-black text-xs uppercase">Course / Program</label>
                      <select value={formData.course || ''} onChange={(e) => setFormData({...formData, course: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                        {courses.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mt-2">
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-gray-600 font-black text-xs uppercase">Department</label>
                        <select value={formData.department || ''} onChange={(e) => {
                          const newDept = e.target.value;
                          setFormData({
                            ...formData, 
                            department: newDept,
                            ...(formData.role === 'HANDLER' ? { handled_categories: getCategoryFromDepartment(newDept) } : {})
                          });
                        }} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                          {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-gray-600 font-black text-xs uppercase">Role</label>
                        <select value={formData.role || 'HANDLER'} onChange={(e) => {
                          const newRole = e.target.value;
                          setFormData({
                            ...formData, 
                            role: newRole,
                            ...(newRole === 'HANDLER' && formData.department ? { handled_categories: getCategoryFromDepartment(formData.department) } : {})
                          });
                        }} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                          <option value="ADMIN">ADMIN</option>
                          <option value="HANDLER">HANDLER</option>
                          <option value="STAFF">STAFF</option>
                          <option value="FACULTY">FACULTY</option>
                        </select>
                      </div>
                    </div>
                    {formData.role === 'HANDLER' && (
                      <div className="flex flex-col gap-1.5 w-full opacity-70">
                        <label className="text-gray-600 font-black text-xs uppercase">Handled Categories <span className="lowercase text-gray-400 font-normal ml-1">(Auto-assigned by department)</span></label>
                        <select disabled value={formData.handled_categories || 'FACILITIES'} onChange={(e) => setFormData({...formData, handled_categories: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 cursor-not-allowed text-gray-600">
                          <option value="FACILITIES">FACILITIES</option>
                          <option value="ACADEMIC_AFFAIRS">ACADEMIC_AFFAIRS</option>
                          <option value="IT_SUPPORT">IT_SUPPORT</option>
                          <option value="STUDENT_SERVICES">STUDENT_SERVICES</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}
          </div>
        </div>
      </PopupDialog>

      {/* Delete Confirmation Popup */}
      <PopupDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteId(null);
        }}
        hideHeader={true}
        maxWidth="max-w-md"
        footer={
          <div className="w-full flex justify-end gap-3 px-4 pb-2 mt-4">
            <button 
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteId(null);
              }} 
              className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-black rounded-lg font-bold text-sm transition-colors uppercase"
            >
              Cancel
            </button>
            <button 
              onClick={executeDelete} 
              className="px-5 py-2.5 bg-[#E50000] hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors uppercase flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          </div>
        }
      >
        <div className="flex flex-col px-2 sm:px-4 pt-2 text-center">
          <div className="w-16 h-16 bg-red-100 text-[#E50000] rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-black mb-2 uppercase tracking-wide">
            Delete Entry?
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Are you sure you want to delete this whitelist entry? Users matched to this will no longer be able to sign up or log in correctly. This action cannot be undone.
          </p>
        </div>
      </PopupDialog>
    </div>
  );
}
