'use client';

import { useState } from 'react';
import PopupDialog from '@/components/shared/PopupDialog';
import { Edit2, Trash2, Plus } from 'lucide-react';

type AccountType = 'USER' | 'ADMIN';

interface SSOAccount {
  id: string;
  type: AccountType;
  firstName: string;
  lastName: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  password?: string; // Mock only, if active
  // User specific
  idNumber?: string;
  course?: string;
  // Admin specific
  department?: string;
  role?: string;
  handledCategories?: string;
}

const initialMockData: SSOAccount[] = [
  {
    id: '1',
    type: 'USER',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    email: 'jdelacruz@mymail.mapua.edu.ph',
    status: 'ACTIVE',
    password: 'password123',
    idNumber: '2026101111',
    course: 'BS Computer Science',
  },
  {
    id: '2',
    type: 'USER',
    firstName: 'Z',
    lastName: 'Pedregosa',
    email: 'zpedregosa@mymail.mapua.edu.ph',
    status: 'INACTIVE',
    idNumber: '2026102222',
    course: 'BS Information Technology',
  },
  {
    id: '3',
    type: 'ADMIN',
    firstName: 'L',
    lastName: 'Penaflor',
    email: 'lpenaflor@mapua.edu.ph',
    status: 'ACTIVE',
    password: 'adminpassword',
    department: 'Facilities Management',
    role: 'Staff',
    handledCategories: 'FACILITIES',
  },
  {
    id: '4',
    type: 'ADMIN',
    firstName: 'A',
    lastName: 'Francisco',
    email: 'afrancisco@mapua.edu.ph',
    status: 'ACTIVE',
    password: 'adminpassword',
    department: 'IT Support',
    role: 'Admin',
    handledCategories: 'IT TECHNICAL SUPPORT',
  }
];

export default function SSOMockPage() {
  const [accounts, setAccounts] = useState<SSOAccount[]>(initialMockData);
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
  const [activeTab, setActiveTab] = useState<AccountType | 'DEPARTMENT' | 'COURSE'>('USER');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<SSOAccount>>({});
  const [simpleInputValue, setSimpleInputValue] = useState('');

  const filteredAccounts = accounts.filter(acc => {
    if (activeTab === 'DEPARTMENT' || activeTab === 'COURSE') return false;
    const matchesTab = acc.type === activeTab;
    const fullName = `${acc.firstName} ${acc.lastName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchQuery.toLowerCase()) || 
      acc.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const filteredDepartments = departments.filter(d => d.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredCourses = courses.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleOpenModal = (account?: SSOAccount) => {
    if (activeTab === 'DEPARTMENT' || activeTab === 'COURSE') {
      setSimpleInputValue('');
      setIsModalOpen(true);
      return;
    }

    if (account) {
      setEditingId(account.id);
      setFormData(account);
    } else {
      setEditingId(null);
      // Pre-fill dropdowns with first available option to prevent empty state
      setFormData({ 
        type: activeTab as AccountType,
        course: activeTab === 'USER' && courses.length > 0 ? courses[0] : undefined,
        department: activeTab === 'ADMIN' && departments.length > 0 ? departments[0] : undefined,
        role: activeTab === 'ADMIN' ? 'Admin' : undefined
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (activeTab === 'DEPARTMENT') {
      if (simpleInputValue.trim() && !departments.includes(simpleInputValue.trim())) {
        setDepartments([...departments, simpleInputValue.trim()]);
      }
      setIsModalOpen(false);
      return;
    }
    if (activeTab === 'COURSE') {
      if (simpleInputValue.trim() && !courses.includes(simpleInputValue.trim())) {
        setCourses([...courses, simpleInputValue.trim()]);
      }
      setIsModalOpen(false);
      return;
    }

    if (editingId) {
      setAccounts(accounts.map(acc => acc.id === editingId ? { ...acc, ...formData } as SSOAccount : acc));
    } else {
      const newId = Math.random().toString(36).substr(2, 9);
      setAccounts([...accounts, { ...formData, id: newId } as SSOAccount]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this mock account?')) {
      setAccounts(accounts.filter(acc => acc.id !== id));
    }
  };

  const handleDeleteSimple = (item: string, type: 'DEPARTMENT' | 'COURSE') => {
    if (confirm(`Are you sure you want to delete this ${type.toLowerCase()}?`)) {
      if (type === 'DEPARTMENT') {
        setDepartments(departments.filter(d => d !== item));
      } else {
        setCourses(courses.filter(c => c !== item));
      }
    }
  };

  return (
    <div className="flex flex-col h-auto md:h-full font-poppins w-full min-h-full shrink-0">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-wide">
            Mapúa SSO Mock Database
          </h1>
          <p className="text-gray-500 text-sm font-bold mt-2 uppercase tracking-wide">
            Development Tool: Manage dummy accounts for authentication
          </p>
        </div>
      </div>

      {/* Controls: Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        
        {/* Tabs */}
        <div className="flex flex-wrap bg-gray-100 p-1 rounded-lg w-full md:w-auto gap-1">
          <button 
            onClick={() => setActiveTab('USER')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wide transition-colors ${
              activeTab === 'USER' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
            }`}
          >
            Students
          </button>
          <button 
            onClick={() => setActiveTab('ADMIN')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wide transition-colors ${
              activeTab === 'ADMIN' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
            }`}
          >
            Admins
          </button>
          <button 
            onClick={() => setActiveTab('DEPARTMENT')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wide transition-colors ${
              activeTab === 'DEPARTMENT' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
            }`}
          >
            Departments
          </button>
          <button 
            onClick={() => setActiveTab('COURSE')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wide transition-colors ${
              activeTab === 'COURSE' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
            }`}
          >
            Courses
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder={`Search ${activeTab.toLowerCase()}s...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black placeholder-gray-400 shadow-sm"
          />
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-[#E50000] hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors uppercase tracking-wide shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            {activeTab === 'DEPARTMENT' ? 'Add Dept' : activeTab === 'COURSE' ? 'Add Course' : 'Add Account'}
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-x-auto overflow-y-visible md:overflow-auto custom-scrollbar pb-10 bg-white border border-gray-200 rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200">
            <tr>
              {(activeTab === 'DEPARTMENT' || activeTab === 'COURSE') ? (
                <>
                  <th className="py-4 px-4 font-black text-black text-xs uppercase tracking-wider">{activeTab === 'DEPARTMENT' ? 'Department Name' : 'Course Name'}</th>
                  <th className="py-4 px-4 font-black text-black text-xs uppercase tracking-wider text-center w-[120px]">Actions</th>
                </>
              ) : (
                <>
                  <th className="py-4 px-4 font-black text-black text-xs uppercase tracking-wider">Name</th>
                  <th className="py-4 px-4 font-black text-black text-xs uppercase tracking-wider">Mapúa Email</th>
                  <th className="py-4 px-4 font-black text-black text-xs uppercase tracking-wider text-center">Status</th>
                  {activeTab === 'USER' ? (
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
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {(activeTab === 'DEPARTMENT' || activeTab === 'COURSE') ? (
              // Department or Course rendering
              (activeTab === 'DEPARTMENT' ? filteredDepartments : filteredCourses).map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-sm text-gray-800 font-bold">{item}</td>
                  <td className="py-4 px-4 text-center">
                    <button 
                      onClick={() => handleDeleteSimple(item, activeTab)}
                      className="text-gray-400 hover:text-[#E50000] transition-colors"
                      title={`Delete ${activeTab.toLowerCase()}`}
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              // Account rendering
              filteredAccounts.map((acc) => (
                <tr key={acc.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-sm text-gray-800 font-bold">{acc.firstName} {acc.lastName}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{acc.email}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      acc.status === 'ACTIVE' ? 'bg-[#D1F0D4] text-[#10B981]' : 'bg-[#FFBFC4] text-[#E50000]'
                    }`}>
                      {acc.status}
                    </span>
                  </td>
                  
                  {activeTab === 'USER' ? (
                    <>
                      <td className="py-4 px-4 text-sm text-gray-600 font-mono">{acc.idNumber}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{acc.course}</td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 px-4 text-sm text-gray-600">{acc.department}</td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-[10px] font-bold uppercase tracking-wider">
                          {acc.role}
                        </span>
                      </td>
                    </>
                  )}

                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => handleOpenModal(acc)}
                        className="text-gray-400 hover:text-black transition-colors"
                        title="Edit Account"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(acc.id)}
                        className="text-gray-400 hover:text-[#E50000] transition-colors"
                        title="Delete Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {((activeTab === 'USER' || activeTab === 'ADMIN') && filteredAccounts.length === 0) && (
          <div className="text-center py-16 text-gray-500 font-medium text-sm">
            No mock accounts found in this category.
          </div>
        )}
        {activeTab === 'DEPARTMENT' && filteredDepartments.length === 0 && (
          <div className="text-center py-16 text-gray-500 font-medium text-sm">
            No departments found.
          </div>
        )}
        {activeTab === 'COURSE' && filteredCourses.length === 0 && (
          <div className="text-center py-16 text-gray-500 font-medium text-sm">
            No courses found.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <PopupDialog
        isOpen={isModalOpen}
        hideHeader={true}
        maxWidth="max-w-xl"
        onClose={() => setIsModalOpen(false)}
        footer={
          <div className="w-full flex justify-end gap-3 px-4 pb-2 mt-4">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-black rounded-lg font-bold text-sm transition-colors uppercase tracking-wide"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-5 py-2.5 bg-[#10B981] hover:bg-green-600 text-white rounded-lg font-bold text-sm transition-colors uppercase tracking-wide"
            >
              {(activeTab === 'DEPARTMENT' || activeTab === 'COURSE') 
                ? 'Save' 
                : (editingId ? 'Save Changes' : 'Create Account')}
            </button>
          </div>
        }
      >
        <div className="flex flex-col px-2 sm:px-4 pt-2">
          <h2 className="text-2xl font-black text-black mb-6 uppercase tracking-wide">
            {activeTab === 'DEPARTMENT' ? 'New Department' : 
             activeTab === 'COURSE' ? 'New Course' :
             (editingId ? 'Edit Mock Account' : 'New Mock Account')}
          </h2>
          
          <div className="flex flex-col gap-4">
            
            {(activeTab === 'DEPARTMENT' || activeTab === 'COURSE') ? (
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-gray-600 font-black text-xs uppercase tracking-wide">
                  {activeTab === 'DEPARTMENT' ? 'Department Name *' : 'Course Name *'}
                </label>
                <input 
                  type="text" 
                  value={simpleInputValue}
                  onChange={(e) => setSimpleInputValue(e.target.value)}
                  placeholder={`Enter ${activeTab.toLowerCase()} name...`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black"
                />
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-gray-600 font-black text-xs uppercase tracking-wide">First Name *</label>
                    <input 
                      type="text" 
                      value={formData.firstName || ''}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-gray-600 font-black text-xs uppercase tracking-wide">Last Name *</label>
                    <input 
                      type="text" 
                      value={formData.lastName || ''}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-gray-600 font-black text-xs uppercase tracking-wide">Mapúa Email *</label>
                    <input 
                      type="email" 
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-gray-600 font-black text-xs uppercase tracking-wide">Account Status</label>
                    <select 
                      value={formData.status || 'ACTIVE'}
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE'})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black bg-white"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-gray-600 font-black text-xs uppercase tracking-wide">Account Type</label>
                    <select 
                      value={formData.type || 'USER'}
                      onChange={(e) => setFormData({...formData, type: e.target.value as AccountType})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black bg-white"
                    >
                      <option value="USER">Student / User</option>
                      <option value="ADMIN">Admin / Staff</option>
                    </select>
                  </div>
                  
                  {(!formData.status || formData.status === 'ACTIVE') ? (
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-gray-600 font-black text-xs uppercase tracking-wide">Mock Password *</label>
                      <input 
                        type="text" 
                        value={formData.password || ''}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="For dev testing only"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 hidden sm:block"></div>
                  )}
                </div>

                {/* Conditional Fields based on Account Type */}
                {formData.type === 'USER' ? (
                  <div className="flex flex-col sm:flex-row gap-4 w-full p-4 bg-gray-50 rounded-lg border border-gray-200 mt-2">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-gray-600 font-black text-xs uppercase tracking-wide">Student ID Number</label>
                      <input 
                        type="text" 
                        value={formData.idNumber || ''}
                        onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-gray-600 font-black text-xs uppercase tracking-wide">Course / Program</label>
                      <select 
                        value={formData.course || (courses.length > 0 ? courses[0] : '')}
                        onChange={(e) => setFormData({...formData, course: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black bg-white"
                      >
                        {courses.length === 0 && <option value="">No courses available</option>}
                        {courses.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mt-2">
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-gray-600 font-black text-xs uppercase tracking-wide">Department</label>
                        <select 
                          value={formData.department || (departments.length > 0 ? departments[0] : '')}
                          onChange={(e) => setFormData({...formData, department: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black bg-white"
                        >
                          {departments.length === 0 && <option value="">No departments available</option>}
                          {departments.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-gray-600 font-black text-xs uppercase tracking-wide">Role</label>
                        <select 
                          value={formData.role || 'Admin'}
                          onChange={(e) => setFormData({...formData, role: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black bg-white"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Staff">Staff</option>
                        </select>
                      </div>
                    </div>
                    {formData.role === 'Staff' && (
                      <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-gray-600 font-black text-xs uppercase tracking-wide">Handled Categories</label>
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-wrap gap-2 w-full p-2 border border-gray-300 rounded-lg bg-white min-h-[44px]">
                            {(!formData.handledCategories || formData.handledCategories.trim() === '') && (
                              <span className="text-gray-400 text-sm italic px-2">None selected</span>
                            )}
                            {(formData.handledCategories || '').split(',').map(c => c.trim()).filter(Boolean).map(cat => (
                              <div key={cat} className="flex items-center gap-1.5 px-3 py-1 bg-[#E50000] text-white rounded-md text-[10px] font-black uppercase tracking-wider">
                                {cat}
                                <button 
                                  onClick={() => {
                                    const newCats = (formData.handledCategories || '').split(',').map(c => c.trim()).filter(c => c && c !== cat);
                                    setFormData({...formData, handledCategories: newCats.join(', ')});
                                  }}
                                  className="hover:opacity-70 transition-opacity"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          <select 
                            value=""
                            onChange={(e) => {
                              if (!e.target.value) return;
                              const current = (formData.handledCategories || '').split(',').map(c => c.trim()).filter(Boolean);
                              if (!current.includes(e.target.value)) {
                                setFormData({...formData, handledCategories: [...current, e.target.value].join(', ')});
                              }
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary bg-white"
                          >
                            <option value="" disabled>+ Add Category...</option>
                            <option value="FACILITIES">FACILITIES</option>
                            <option value="ACADEMIC AFFAIRS">ACADEMIC AFFAIRS</option>
                            <option value="IT / TECH SUPPORT">IT / TECH SUPPORT</option>
                            <option value="STUDENT SERVICES">STUDENT SERVICES</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </PopupDialog>

    </div>
  );
}
