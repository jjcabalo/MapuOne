'use client';

import { useState, useEffect } from 'react';
import PopupDialog from '@/components/shared/PopupDialog';
import { X, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const getCategoryStyle = (cat: string) => {
  if (!cat) return 'bg-gray-200 text-gray-800';
  const upper = cat.toUpperCase();
  if (upper.includes('FACILITIES')) return 'bg-[#FFBFC4] text-[#E50000]';
  if (upper.includes('ACADEMIC')) return 'bg-[#9B9BE3] text-white';
  if (upper.includes('IT')) return 'bg-[#5BC0DE] text-white';
  if (upper.includes('STUDENT')) return 'bg-[#95C287] text-white';
  return 'bg-gray-200 text-gray-800';
};

const getPriorityStyle = (priority: string) => {
  switch (priority?.toUpperCase()) {
    case 'HIGH': return 'bg-[#FFBFC4] border-[#E50000]/30 text-[#E50000]';
    case 'MEDIUM': return 'bg-[#FFEFB3] border-[#FFCC00]/50 text-[#997A00]';
    case 'LOW': return 'bg-[#D1F0D4] border-[#10B981]/30 text-[#059669]';
    default: return 'bg-gray-100 border-gray-200 text-gray-700';
  }
};

interface Keyword {
  word: string;
  priority: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'CATEGORIES' | 'USER ACCOUNTS'>('CATEGORIES');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  const [categoryModalData, setCategoryModalData] = useState<any | 'NEW' | null>(null);
  
  const [userModalData, setUserModalData] = useState<any | null>(null);
  const [userModalRoleOpen, setUserModalRoleOpen] = useState(false);
  const [userModalCategories, setUserModalCategories] = useState<string[]>([]);

  const [modalKeywords, setModalKeywords] = useState<Keyword[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [newKeywordPriority, setNewKeywordPriority] = useState('MEDIUM');
  const [categorySelect, setCategorySelect] = useState('FACILITIES');

  const [toastMessage, setToastMessage] = useState<string>('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, 4000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch categories and keywords
    const { data: keywordsData } = await supabase.from('routing_keywords').select('*');
    
    const baseCategories: Record<string, any> = {
      'FACILITIES': { name: 'FACILITIES', rawCategory: 'FACILITIES', keywords: [] },
      'ACADEMIC_AFFAIRS': { name: 'ACADEMIC AFFAIRS', rawCategory: 'ACADEMIC_AFFAIRS', keywords: [] },
      'IT_SUPPORT': { name: 'IT SUPPORT', rawCategory: 'IT_SUPPORT', keywords: [] },
      'STUDENT_SERVICES': { name: 'STUDENT SERVICES', rawCategory: 'STUDENT_SERVICES', keywords: [] }
    };

    if (keywordsData) {
      keywordsData.forEach(curr => {
        if (!baseCategories[curr.category]) {
          baseCategories[curr.category] = { name: curr.category.replace('_', ' '), rawCategory: curr.category, keywords: [] };
        }
        baseCategories[curr.category].keywords.push({ word: curr.keyword, priority: curr.priority });
      });
    }
    setCategories(Object.values(baseCategories));

    // Fetch users
    const { data: usersData } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (usersData) {
      setUsers(usersData.map(u => ({
        id: u.id,
        name: `${u.first_name} ${u.last_name}`,
        department: u.department || 'None',
        role: u.role,
        handled_categories: u.handled_categories ? u.handled_categories.split(',') : [],
        email: u.email
      })));
    }
  };

  useEffect(() => {
    if (categoryModalData && categoryModalData !== 'NEW') {
      setModalKeywords(categoryModalData.keywords || []);
      setCategorySelect(categoryModalData.rawCategory);
    } else {
      setModalKeywords([]);
      setCategorySelect('FACILITIES');
    }
    setKeywordInput('');
    setNewKeywordPriority('MEDIUM');
  }, [categoryModalData]);

  useEffect(() => {
    if (userModalData) {
      setUserModalCategories(userModalData.handled_categories || []);
    } else {
      setUserModalCategories([]);
    }
  }, [userModalData?.id]);

  const handleAddKeyword = () => {
    const word = keywordInput.trim();
    if (word && !modalKeywords.find(k => k.word === word)) {
      setModalKeywords([...modalKeywords, { word, priority: newKeywordPriority }]);
      setKeywordInput('');
    }
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const saveCategory = async () => {
    if (!categorySelect) return;
    
    let finalKeywords = [...modalKeywords];
    if (keywordInput.trim() && !finalKeywords.find(k => k.word === keywordInput.trim())) {
      finalKeywords.push({ word: keywordInput.trim(), priority: newKeywordPriority });
    }

    // Clear existing for this category
    await supabase.from('routing_keywords').delete().eq('category', categorySelect);
    
    // Insert new
    if (finalKeywords.length > 0) {
      const inserts = finalKeywords.map(k => ({
        keyword: k.word,
        category: categorySelect,
        priority: k.priority
      }));
      await supabase.from('routing_keywords').insert(inserts);
    }
    
    setCategoryModalData(null);
    fetchData();
  };

  const saveUser = async () => {
    if (!userModalData) return;
    
    // Enforce that only Handlers and Admins have handled_categories
    const finalCategories = ['HANDLER', 'ADMIN'].includes(userModalData.role) 
      ? (userModalCategories.length > 0 ? userModalCategories[0] : null) 
      : null;

    const finalDepartment = ['HANDLER', 'ADMIN'].includes(userModalData.role) && finalCategories
      ? finalCategories.replace('_', ' ')
      : userModalData.department;

    const { error } = await supabase.from('users').update({
      role: userModalData.role,
      department: finalDepartment,
      handled_categories: finalCategories
    }).eq('id', userModalData.id);
    
    if (error) {
      showToast("Failed to update user. This is likely an RLS permission issue. Error: " + error.message);
      console.error(error);
      return;
    }
    
    setUserModalData(null);
    fetchData();
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full font-poppins w-full relative">
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-white border border-gray-200 shadow-xl rounded-lg px-6 py-4 flex items-center gap-3 transition-all duration-500 ease-in-out transform ${isToastVisible ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0 pointer-events-none'}`}>
        <AlertCircle className="w-5 h-5 text-[#E50000]" />
        <p className="text-sm font-bold text-gray-800">{toastMessage}</p>
      </div>

      <div className="flex-shrink-0 mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-wide mb-1">Settings</h1>
        <p className="text-gray-600 text-sm">Manage complaint categories, routing keywords, and administrator accounts.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveTab('CATEGORIES')} className={`px-6 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-colors ${activeTab === 'CATEGORIES' ? 'bg-black text-white' : 'bg-[#E5E5E5] text-gray-600 hover:bg-gray-300'}`}>
            CATEGORIES
          </button>
          <button onClick={() => setActiveTab('USER ACCOUNTS')} className={`px-6 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-colors ${activeTab === 'USER ACCOUNTS' ? 'bg-black text-white' : 'bg-[#E5E5E5] text-gray-600 hover:bg-gray-300'}`}>
            USER ACCOUNTS
          </button>
        </div>
        {activeTab === 'USER ACCOUNTS' && (
          <input type="text" placeholder="Search user..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg text-sm" />
        )}
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar pb-10">
        {activeTab === 'CATEGORIES' && (
          <div className="flex flex-col w-full min-w-[800px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-2 font-bold text-gray-500 text-xs uppercase w-[25%]">Category</th>
                  <th className="py-4 px-2 font-bold text-gray-500 text-xs uppercase w-[65%]">Routing Keywords & Priority</th>
                  <th className="py-4 px-2 font-bold text-gray-500 text-xs uppercase w-[10%] text-right"></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-2 align-top"><span className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase ${getCategoryStyle(cat.name)}`}>{cat.name}</span></td>
                    <td className="py-4 px-2 text-sm text-gray-700">
                      {cat.keywords.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          {['HIGH', 'MEDIUM', 'LOW'].map(priorityLevel => {
                            const kws = cat.keywords.filter((k: Keyword) => k.priority === priorityLevel);
                            if (kws.length === 0) return null;
                            return (
                              <div key={priorityLevel} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                                <span className={`text-[10px] font-black sm:w-16 sm:pt-1.5 tracking-wider uppercase ${priorityLevel === 'HIGH' ? 'text-[#E50000]' : priorityLevel === 'MEDIUM' ? 'text-[#997A00]' : 'text-[#059669]'}`}>
                                  {priorityLevel}
                                </span>
                                <div className="flex flex-wrap gap-2 flex-1">
                                  {kws.map((kw: Keyword, idx: number) => (
                                    <span key={idx} className={`border px-3 py-1 rounded-md text-[10px] font-black uppercase shadow-sm ${getPriorityStyle(kw.priority)}`}>
                                      {kw.word}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No routing keywords set</span>
                      )}
                    </td>
                    <td className="py-4 px-2 text-right align-top"><button onClick={() => setCategoryModalData(cat)} className="text-black font-black text-xs hover:text-primary uppercase">Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-8">
              <button onClick={() => setCategoryModalData('NEW')} className="bg-[#E50000] hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-sm uppercase flex items-center gap-2">
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
                  <th className="py-4 px-2 font-bold text-gray-500 text-xs uppercase w-[25%]">Name</th>
                  <th className="py-4 px-2 font-bold text-gray-500 text-xs uppercase w-[30%]">Department</th>
                  <th className="py-4 px-2 font-bold text-gray-500 text-xs uppercase w-[20%]">Role</th>
                  <th className="py-4 px-2 font-bold text-gray-500 text-xs uppercase w-[15%]">Status</th>
                  <th className="py-4 px-2 font-bold text-gray-500 text-xs uppercase w-[10%] text-right"></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-2 text-sm text-gray-800">{user.name}</td>
                    <td className="py-4 px-2 text-sm text-gray-800">
                      {user.department !== 'None' ? (
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getCategoryStyle(user.department)}`}>
                          {user.department}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">None</span>
                      )}
                    </td>
                    <td className="py-4 px-2 text-sm text-gray-800">{user.role}</td>
                    <td className="py-4 px-2"><span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase bg-[#D1F0D4] text-[#10B981]">ACTIVE</span></td>
                    <td className="py-4 px-2 text-right"><button onClick={() => setUserModalData(user)} className="text-black font-black text-xs hover:text-primary uppercase">Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PopupDialog isOpen={categoryModalData !== null} hideHeader={true} maxWidth="max-w-2xl" overflowVisible={true} footer={
        <div className="w-full flex justify-end gap-4 px-4 pb-2">
          <button onClick={() => setCategoryModalData(null)} className="px-6 py-3 bg-[#D4D4D4] text-black rounded-lg font-bold text-sm uppercase">Cancel</button>
          <button onClick={saveCategory} className="px-6 py-3 bg-[#E50000] text-white rounded-lg font-bold text-sm uppercase">{categoryModalData !== 'NEW' ? 'Save Category' : 'Create Category'}</button>
        </div>
      }>
        <div className="flex flex-col px-4 pt-2 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <h2 className="text-3xl font-black text-center mb-8">{categoryModalData !== 'NEW' ? 'Edit Category' : 'Add Category'}</h2>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-gray-600 font-black text-xs uppercase">Category Name</label>
              {categoryModalData === 'NEW' ? (
                <input 
                  type="text" 
                  value={categorySelect} 
                  onChange={e => setCategorySelect(e.target.value)} 
                  placeholder="e.g. HUMAN_RESOURCES"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white uppercase" 
                />
              ) : (
                <input 
                  type="text" 
                  value={categorySelect} 
                  disabled 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-100 uppercase" 
                />
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-gray-600 font-black text-xs uppercase">Routing Keywords (Per-Keyword Priority)</label>
              <div className="flex flex-col gap-3 w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
                
                {modalKeywords.length > 0 ? modalKeywords.map((kw, idx) => (
                  <div key={idx} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border rounded-lg shadow-sm ${getPriorityStyle(kw.priority)}`}>
                    <span className="font-black text-sm ml-1 uppercase">{kw.word}</span>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <select 
                        value={kw.priority} 
                        onChange={(e) => {
                          const newKws = [...modalKeywords];
                          newKws[idx].priority = e.target.value;
                          setModalKeywords(newKws);
                        }}
                        className={`px-3 py-1.5 border rounded-md text-xs font-bold focus:outline-none ${getPriorityStyle(kw.priority)} bg-white/50`}
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                      </select>
                      <button type="button" onClick={() => setModalKeywords(modalKeywords.filter((_, i) => i !== idx))} className="p-1.5 opacity-60 hover:opacity-100 hover:bg-white/50 rounded-md transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-gray-400 italic py-2 text-center">No keywords added yet.</p>
                )}
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                  <input type="text" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={handleKeywordKeyDown} placeholder="New keyword..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black" />
                  <div className="flex items-center gap-2">
                    <select value={newKeywordPriority} onChange={(e) => setNewKeywordPriority(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white font-bold w-32 focus:outline-none focus:border-black">
                      <option value="LOW">LOW PRIORITY</option>
                      <option value="MEDIUM">MEDIUM PRIORITY</option>
                      <option value="HIGH">HIGH PRIORITY</option>
                    </select>
                    <button type="button" onClick={handleAddKeyword} className="px-5 py-2 bg-black hover:bg-gray-800 text-white text-sm font-bold rounded-lg whitespace-nowrap transition-colors">Add</button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </PopupDialog>

      <PopupDialog isOpen={userModalData !== null} hideHeader={true} maxWidth="max-w-xl" overflowVisible={true} footer={
        <div className="w-full flex justify-end gap-4 px-4 pb-2">
          <button onClick={() => setUserModalData(null)} className="px-6 py-3 bg-[#D4D4D4] text-black rounded-lg font-bold text-sm uppercase">Cancel</button>
          <button onClick={saveUser} className="px-6 py-3 bg-[#E50000] text-white rounded-lg font-bold text-sm uppercase">Save Changes</button>
        </div>
      }>
        <div className="flex flex-col px-4 pt-2">
          <h2 className="text-3xl font-black text-center mb-10">Edit User Account</h2>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-gray-600 font-black text-xs uppercase">Full Name</label>
              <input type="text" defaultValue={userModalData ? userModalData.name : ''} disabled className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-gray-600 font-black text-xs uppercase">Email</label>
              <input type="text" defaultValue={userModalData ? userModalData.email : ''} disabled className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500" />
              <div className="flex justify-start mt-1">
                <button 
                  type="button"
                  onClick={async () => {
                    if (!userModalData || !userModalData.email) return;
                    const btn = document.getElementById('reset-btn-text');
                    if (btn) btn.innerText = 'Sending...';
                    
                    const { error } = await supabase.auth.resetPasswordForEmail(userModalData.email, {
                      redirectTo: `${window.location.origin}/update-password`,
                    });
                    
                    if (error) {
                      showToast(`Error: ${error.message}`);
                      if (btn) btn.innerText = 'Send reset password link';
                    } else {
                      showToast('Password reset link sent successfully!');
                      if (btn) btn.innerText = 'Send reset password link';
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold tracking-wide uppercase transition-colors"
                >
                  <span id="reset-btn-text">Send reset password link</span>
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col gap-2 w-full">
                <label className="text-gray-600 font-black text-xs uppercase">System Role</label>
                <div className="relative w-full z-40">
                  <button 
                    type="button" 
                    onClick={() => {
                      if (userModalData && userModalData.role === 'ADMIN') {
                        showToast("You cannot change the role of the System Admin.");
                        return;
                      }
                      setUserModalRoleOpen(!userModalRoleOpen);
                    }} 
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-left"
                  >
                    {userModalData ? userModalData.role : 'STUDENT'}
                    <span className="text-gray-400 text-[10px]">▶</span>
                  </button>
                  {userModalRoleOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col">
                      {['STUDENT', 'FACULTY', 'STAFF', 'HANDLER', 'ADMIN'].map((opt) => (
                        <button key={opt} type="button" onClick={() => { if (userModalData) setUserModalData({ ...userModalData, role: opt }); setUserModalRoleOpen(false); }} className="px-4 py-3 text-sm text-left hover:bg-gray-100">{opt}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {['HANDLER', 'ADMIN'].includes(userModalData ? userModalData.role : '') && (
              <div className="flex flex-col gap-2">
                <label className="text-gray-600 font-black text-xs uppercase">Department / Category Assignment</label>
                <div className="flex flex-col gap-2">
                  <select 
                    value={userModalCategories.length > 0 ? userModalCategories[0] : ''} 
                    onChange={(e) => { 
                      if (e.target.value) {
                        setUserModalCategories([e.target.value]); 
                        setUserModalData({...userModalData, department: e.target.value.replace('_', ' ')});
                      }
                    }} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="" disabled>Select Department/Category...</option>
                    {categories.map(c => (
                      <option key={c.rawCategory} value={c.rawCategory}>{c.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-500 italic uppercase">This sets both the user's Department and their Handled Category.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </PopupDialog>
    </div>
  );
}
