'use client';

import { useState, useEffect } from 'react';
import PopupDialog from '@/components/shared/PopupDialog';
import { X } from 'lucide-react';

// Consistent category colors
const getCategoryStyle = (cat: string) => {
  switch (cat) {
    case 'FACILITIES':
      return 'bg-[#FFBFC4] text-[#E50000]';
    case 'ACADEMIC AFFAIRS':
      return 'bg-[#9B9BE3] text-white'; // Darker text or white text depending on contrast
    case 'IT / TECH SUPPORT':
      return 'bg-[#5BC0DE] text-white';
    case 'STUDENT SERVICES':
      return 'bg-[#95C287] text-white';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

const mockCategories = [
  { id: 1, name: 'FACILITIES', keywords: 'aircon, broken, classroom, lighting', priority: 'Low' },
  { id: 2, name: 'ACADEMIC AFFAIRS', keywords: 'grade, professor, subject, enrollment', priority: 'Medium' },
  { id: 3, name: 'IT / TECH SUPPORT', keywords: 'login, portal, system, wifi', priority: 'High' },
  { id: 4, name: 'STUDENT SERVICES', keywords: 'scholarship, clearance, ID, registrar', priority: 'High' },
];

const mockUsers = [
  { id: 1, name: 'A. Francisco', department: 'Student Services', role: 'Admin', status: 'ACTIVE' },
  { id: 2, name: 'L. Penaflor', department: 'Facilities', role: 'Admin', status: 'ACTIVE' },
  { id: 3, name: 'Z. Pedregosa', department: 'Tech Support', role: 'Admin', status: 'INACTIVE' },
  { id: 4, name: 'J. Dela Cruz', department: 'IT - O', role: 'Student', status: 'ACTIVE' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'CATEGORIES' | 'USER ACCOUNTS'>('CATEGORIES');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Category Modal State: null = closed, 'NEW' = Add Mode, or an object = Edit Mode
  const [categoryModalData, setCategoryModalData] = useState<typeof mockCategories[0] | 'NEW' | null>(null);
  const [categoryModalPriorityOpen, setCategoryModalPriorityOpen] = useState(false);

  // User Modal State: null = closed, object = Edit Mode
  const [userModalData, setUserModalData] = useState<typeof mockUsers[0] | null>(null);
  const [userModalRoleOpen, setUserModalRoleOpen] = useState(false);
  const [userModalStatusOpen, setUserModalStatusOpen] = useState(false);
  const [userModalDeptOpen, setUserModalDeptOpen] = useState(false);
  const [userModalCategories, setUserModalCategories] = useState<string[]>([]);

  // Keyword Tag Input State
  const [modalKeywords, setModalKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');

  // Sync keywords when modal opens
  useEffect(() => {
    if (categoryModalData && categoryModalData !== 'NEW') {
      const words = categoryModalData.keywords.split(',').map(k => k.trim()).filter(Boolean);
      setModalKeywords(words);
    } else {
      setModalKeywords([]);
    }
    setKeywordInput('');
  }, [categoryModalData]);

  // Sync user categories
  useEffect(() => {
    setUserModalCategories([]);
  }, [userModalData]);

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newWord = keywordInput.trim();
      if (newWord && !modalKeywords.includes(newWord)) {
        setModalKeywords([...modalKeywords, newWord]);
      }
      setKeywordInput('');
    } else if (e.key === 'Backspace' && keywordInput === '' && modalKeywords.length > 0) {
      // Remove last keyword on backspace if input is empty
      setModalKeywords(modalKeywords.slice(0, -1));
    }
  };

  const removeKeyword = (wordToRemove: string) => {
    setModalKeywords(modalKeywords.filter(w => w !== wordToRemove));
  };

  const filteredUsers = mockUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full font-poppins w-full">
      
      {/* Header */}
      <div className="flex-shrink-0 mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-wide mb-1">
          Settings
        </h1>
        <p className="text-gray-600 text-sm">
          Manage complaint categories, routing keywords, and administrator accounts.
        </p>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('CATEGORIES')}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-colors ${
              activeTab === 'CATEGORIES' 
                ? 'bg-black text-white' 
                : 'bg-[#E5E5E5] text-gray-600 hover:bg-gray-300'
            }`}
          >
            CATEGORIES
          </button>
          <button
            onClick={() => setActiveTab('USER ACCOUNTS')}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-colors ${
              activeTab === 'USER ACCOUNTS' 
                ? 'bg-black text-white' 
                : 'bg-[#E5E5E5] text-gray-600 hover:bg-gray-300'
            }`}
          >
            USER ACCOUNTS
          </button>
        </div>

        {/* Search Bar (Only visible on User Accounts tab) */}
        {activeTab === 'USER ACCOUNTS' && (
          <input
            type="text"
            placeholder="Search user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-sm text-black placeholder-gray-400 shadow-sm"
          />
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar pb-10">
        
        {activeTab === 'CATEGORIES' && (
          <div className="flex flex-col w-full min-w-[800px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-2 font-bold text-gray-500 text-xs uppercase tracking-wider w-[25%]">Category</th>
                  <th className="py-4 px-2 font-bold text-gray-500 text-xs uppercase tracking-wider w-[45%]">Routing Keywords</th>
                  <th className="py-4 px-2 font-bold text-gray-500 text-xs uppercase tracking-wider w-[20%]">Default Priority</th>
                  <th className="py-4 px-2 font-bold text-gray-500 text-xs uppercase tracking-wider w-[10%] text-right"></th>
                </tr>
              </thead>
              <tbody>
                {mockCategories.map((cat) => (
                  <tr key={cat.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-2">
                      <span className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider inline-block ${getCategoryStyle(cat.name)}`}>
                        {cat.name}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-sm text-gray-700">{cat.keywords}</td>
                    <td className="py-4 px-2 text-sm text-gray-700">{cat.priority}</td>
                    <td className="py-4 px-2 text-right">
                      <button 
                        onClick={() => setCategoryModalData(cat)}
                        className="text-black font-black text-xs hover:text-primary uppercase tracking-wide"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-8">
              <button 
                onClick={() => setCategoryModalData('NEW')}
                className="bg-[#E50000] hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-sm transition-colors uppercase tracking-wide shadow-sm flex items-center gap-2"
              >
                <span className="text-lg leading-none mb-0.5">+</span> Add Category
              </button>
            </div>
          </div>
        )}

        {activeTab === 'USER ACCOUNTS' && (
          <div className="flex flex-col w-full min-w-[800px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-2 font-bold text-gray-500 text-xs uppercase tracking-wider w-[25%]">Name</th>
                  <th className="py-4 px-2 font-bold text-gray-500 text-xs uppercase tracking-wider w-[30%]">Department</th>
                  <th className="py-4 px-2 font-bold text-gray-500 text-xs uppercase tracking-wider w-[20%]">Role</th>
                  <th className="py-4 px-2 font-bold text-gray-500 text-xs uppercase tracking-wider w-[15%]">Status</th>
                  <th className="py-4 px-2 font-bold text-gray-500 text-xs uppercase tracking-wider w-[10%] text-right"></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-2 text-sm text-gray-800">{user.name}</td>
                    <td className="py-4 px-2 text-sm text-gray-800">{user.department}</td>
                    <td className="py-4 px-2 text-sm text-gray-800">{user.role}</td>
                    <td className="py-4 px-2">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
                        user.status === 'ACTIVE' ? 'bg-[#D1F0D4] text-[#10B981]' : 'bg-[#FFBFC4] text-[#E50000]'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <button 
                        onClick={() => setUserModalData(user)}
                        className="text-black font-black text-xs hover:text-primary uppercase tracking-wide"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-20 text-gray-500 font-medium text-sm">
                No users match your search.
              </div>
            )}
          </div>
        )}

      </div>

      {/* Dynamic Category Popup Dialog (Handles Add & Edit) */}
      <PopupDialog
        isOpen={categoryModalData !== null}
        hideHeader={true}
        maxWidth="max-w-xl"
        overflowVisible={true}
        footer={
          <div className="w-full flex justify-end gap-4 px-4 pb-2">
            <button 
              onClick={() => setCategoryModalData(null)}
              className="px-6 py-3 bg-[#D4D4D4] hover:bg-gray-400 text-black rounded-lg font-bold text-sm transition-colors uppercase tracking-wide"
            >
              Cancel
            </button>
            <button 
              onClick={() => setCategoryModalData(null)}
              className="px-6 py-3 bg-[#E50000] hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors uppercase tracking-wide"
            >
              {categoryModalData !== 'NEW' ? 'Save Category' : 'Create Category'}
            </button>
          </div>
        }
      >
        <div className="flex flex-col px-4 pt-2">
          <h2 className="text-3xl font-black text-black text-center mb-10">
            {categoryModalData !== 'NEW' ? 'Edit Category' : 'Add Category'}
          </h2>
          
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-gray-600 font-black text-xs uppercase tracking-wide">Category Name</label>
              <select 
                defaultValue={categoryModalData !== 'NEW' && categoryModalData ? categoryModalData.name : ''}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:border-transparent text-sm text-black bg-white"
              >
                <option value="" disabled>Select Department</option>
                <option value="FACILITIES">Facilities</option>
                <option value="ACADEMIC AFFAIRS">Academic Affairs</option>
                <option value="IT / TECH SUPPORT">IT / Tech Support</option>
                <option value="STUDENT SERVICES">Student Services</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-600 font-black text-xs uppercase tracking-wide">Routing Keywords</label>
              
              <div className="flex flex-wrap gap-2 w-full p-2 border border-gray-300 rounded-lg bg-white min-h-[48px] focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary focus-within:border-transparent">
                {modalKeywords.map(word => (
                  <div key={word} className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 border border-gray-200 rounded-md text-sm font-medium text-gray-700">
                    {word}
                    <button 
                      onClick={() => removeKeyword(word)}
                      className="text-gray-400 hover:text-[#E50000] hover:bg-red-50 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                <input 
                  type="text" 
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordKeyDown}
                  placeholder={modalKeywords.length === 0 ? "Type a keyword and press Space..." : ""}
                  className="flex-1 min-w-[150px] bg-transparent focus:outline-none text-sm text-black px-2 py-1"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-600 font-black text-xs uppercase tracking-wide">Default Priority</label>
              <div className="relative w-48 z-40">
                <button 
                  type="button" 
                  onClick={() => setCategoryModalPriorityOpen(!categoryModalPriorityOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-black hover:bg-gray-50 transition-colors text-left"
                >
                  {categoryModalData !== 'NEW' && categoryModalData ? categoryModalData.priority.toUpperCase() : 'LOW'}
                  <span className={`text-gray-400 text-[10px] transform transition-transform ${categoryModalPriorityOpen ? 'rotate-90' : ''}`}>▶</span>
                </button>
                {categoryModalPriorityOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-[0_4px_15px_-3px_rgba(0,0,0,0.15)] border border-gray-200 overflow-hidden flex flex-col z-50">
                    {['LOW', 'MEDIUM', 'HIGH'].map((opt, i, arr) => (
                      <button 
                        key={opt} type="button" 
                        onClick={() => { 
                          if (categoryModalData !== 'NEW' && categoryModalData) {
                            setCategoryModalData({ ...categoryModalData, priority: opt });
                          }
                          setCategoryModalPriorityOpen(false); 
                        }}
                        className={`flex items-center justify-between px-4 py-3 text-sm font-medium text-black hover:bg-gray-100 transition-colors text-left ${i !== arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                      >
                        {opt}
                        {((categoryModalData !== 'NEW' && categoryModalData ? categoryModalData.priority.toUpperCase() : 'LOW') === opt) && <span className="text-primary text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PopupDialog>

      {/* Edit User Popup Dialog */}
      <PopupDialog
        isOpen={userModalData !== null}
        hideHeader={true}
        maxWidth="max-w-xl"
        overflowVisible={true}
        footer={
          <div className="w-full flex justify-end gap-4 px-4 pb-2">
            <button 
              onClick={() => setUserModalData(null)}
              className="px-6 py-3 bg-[#D4D4D4] hover:bg-gray-400 text-black rounded-lg font-bold text-sm transition-colors uppercase tracking-wide"
            >
              Cancel
            </button>
            <button 
              onClick={() => setUserModalData(null)}
              className="px-6 py-3 bg-[#E50000] hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors uppercase tracking-wide"
            >
              Save Changes
            </button>
          </div>
        }
      >
        <div className="flex flex-col px-4 pt-2">
          <h2 className="text-3xl font-black text-black text-center mb-10">Edit User Account</h2>
          
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-gray-600 font-black text-xs uppercase tracking-wide">Full Name</label>
              <input 
                type="text" 
                defaultValue={userModalData ? userModalData.name : ''}
                disabled
                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-1">Name is synced from MapuOne SSO</span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-600 font-black text-xs uppercase tracking-wide">Email</label>
              <input 
                type="text" 
                defaultValue={userModalData ? `${userModalData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@mapua.edu.ph` : ''}
                disabled
                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col gap-2 w-full">
                <label className="text-gray-600 font-black text-xs uppercase tracking-wide">System Role</label>
                <div className="relative w-full z-40">
                  <button 
                    type="button" 
                    onClick={() => setUserModalRoleOpen(!userModalRoleOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-black hover:bg-gray-50 transition-colors text-left"
                  >
                    {userModalData ? userModalData.role : 'Student'}
                    <span className={`text-gray-400 text-[10px] transform transition-transform ${userModalRoleOpen ? 'rotate-90' : ''}`}>▶</span>
                  </button>
                  {userModalRoleOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col z-50">
                      {['Student', 'Admin', 'Staff'].map((opt, i, arr) => (
                        <button 
                          key={opt} type="button" 
                          onClick={() => { 
                            if (userModalData) {
                              setUserModalData({ ...userModalData, role: opt });
                            }
                            setUserModalRoleOpen(false); 
                          }}
                          className={`flex items-center justify-between px-4 py-3 text-sm font-medium text-black hover:bg-gray-100 transition-colors text-left ${i !== arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                        >
                          {opt}
                          {((userModalData ? userModalData.role : 'Student') === opt) && <span className="text-primary text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <label className="text-gray-600 font-black text-xs uppercase tracking-wide">Account Status</label>
                <div className="relative w-full z-30">
                  <button 
                    type="button" 
                    onClick={() => setUserModalStatusOpen(!userModalStatusOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-black hover:bg-gray-50 transition-colors text-left"
                  >
                    {userModalData ? userModalData.status : 'ACTIVE'}
                    <span className={`text-gray-400 text-[10px] transform transition-transform ${userModalStatusOpen ? 'rotate-90' : ''}`}>▶</span>
                  </button>
                  {userModalStatusOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col z-50">
                      {['ACTIVE', 'INACTIVE'].map((opt, i, arr) => (
                        <button 
                          key={opt} type="button" 
                          onClick={() => { 
                            if (userModalData) {
                              setUserModalData({ ...userModalData, status: opt });
                            }
                            setUserModalStatusOpen(false); 
                          }}
                          className={`flex items-center justify-between px-4 py-3 text-sm font-medium text-black hover:bg-gray-100 transition-colors text-left ${i !== arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                        >
                          {opt}
                          {((userModalData ? userModalData.status : 'ACTIVE') === opt) && <span className="text-primary text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col gap-2 w-full">
                <label className="text-gray-600 font-black text-xs uppercase tracking-wide">Assigned Department</label>
                <div className="relative w-full z-20">
                  <button 
                    type="button" 
                    onClick={() => setUserModalDeptOpen(!userModalDeptOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-black hover:bg-gray-50 transition-colors text-left"
                  >
                    {userModalData ? userModalData.department : 'Student Services'}
                    <span className={`text-gray-400 text-[10px] transform transition-transform ${userModalDeptOpen ? 'rotate-90' : ''}`}>▶</span>
                  </button>
                  {userModalDeptOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col z-50">
                      {['Student Services', 'Facilities', 'Tech Support', 'IT - O', 'Academic Affairs', 'None'].map((opt, i, arr) => (
                        <button 
                          key={opt} type="button" 
                          onClick={() => { 
                            if (userModalData) {
                              setUserModalData({ ...userModalData, department: opt });
                            }
                            setUserModalDeptOpen(false); 
                          }}
                          className={`flex items-center justify-between px-4 py-3 text-sm font-medium text-black hover:bg-gray-100 transition-colors text-left ${i !== arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                        >
                          {opt}
                          {((userModalData ? userModalData.department : 'Student Services') === opt) && <span className="text-primary text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <label className="text-gray-600 font-black text-xs uppercase tracking-wide">Handled Categories</label>
                
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2 w-full p-2 border border-gray-300 rounded-lg bg-white min-h-[48px]">
                    {userModalCategories.length === 0 && (
                      <span className="text-gray-400 text-sm italic px-2 py-1">No categories handled</span>
                    )}
                    {userModalCategories.map(cat => (
                      <div key={cat} className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getCategoryStyle(cat)}`}>
                        {cat}
                        <button 
                          onClick={() => setUserModalCategories(userModalCategories.filter(c => c !== cat))}
                          className="hover:opacity-70 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <select 
                    value=""
                    onChange={(e) => {
                      if (e.target.value && !userModalCategories.includes(e.target.value)) {
                        setUserModalCategories([...userModalCategories, e.target.value]);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary bg-white"
                  >
                    <option value="" disabled>+ Add Category...</option>
                    {mockCategories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2 pt-6 border-t border-gray-100">
              <label className="text-gray-600 font-black text-xs uppercase tracking-wide">Security</label>
              <button 
                type="button"
                className="w-full sm:w-auto self-start px-5 py-2.5 border-2 border-[#E50000] text-[#E50000] hover:bg-[#E50000] hover:text-white rounded-lg font-bold text-sm transition-colors uppercase tracking-wide mt-1"
              >
                Send Password Reset Link
              </button>
            </div>
          </div>
        </div>
      </PopupDialog>

    </div>
  );
}
