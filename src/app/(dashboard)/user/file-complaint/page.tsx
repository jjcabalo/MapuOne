'use client';

import { useState, useRef } from 'react';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PopupDialog from '@/components/shared/PopupDialog';

export default function FileComplaintPage() {
  const router = useRouter();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const categories = [
    'Facilities Management', 
    'Academic Affairs', 
    'Student Services', 
    'IT / Technical Support'
  ];

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
      e.target.value = '';
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessDialog(true);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full font-poppins relative">
      {/* Title & Info */}
      <div className="flex-shrink-0">
        <h1 className="text-3xl md:text-4xl font-black text-black mb-4 uppercase tracking-wide">
          File a Complaint
        </h1>
        <p className="text-black text-sm md:text-base leading-relaxed mb-10 max-w-5xl">
          Describe your concern in detail. The system pre-routes your case to the right office as you type, based on category and keywords — an administrator confirms the assignment before work begins.
        </p>
      </div>

      {/* Scrollable Form Area */}
      <div className="flex-1 md:overflow-y-auto pr-2 custom-scrollbar">
        <form className="flex flex-col gap-10 w-full pb-10" onSubmit={handleSubmit}>
          
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 w-full">
            
            {/* Category Side */}
            <div className="flex flex-col sm:flex-row gap-4 lg:w-[40%]">
              <label className="font-bold text-black text-sm uppercase sm:w-28 pt-4 flex-shrink-0">Category</label>
              
              <div className="relative w-full sm:max-w-[280px] h-fit self-start z-30">
                {/* Dropdown Toggle */}
                <button 
                  type="button" 
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-[#F8F9FA] rounded-xl shadow-[0_4px_15px_-3px_rgba(0,0,0,0.15)] border border-gray-100 text-sm font-medium text-black hover:bg-gray-200 transition-colors text-left"
                >
                  {selectedCategory || 'Select a Category'}
                  <span className={`text-gray-400 text-[10px] transform transition-transform ${isCategoryOpen ? 'rotate-90' : ''}`}>▶</span>
                </button>

                {/* Dropdown Menu */}
                {isCategoryOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-[#F8F9FA] rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
                    {categories.map((cat, index) => (
                      <button 
                        key={cat}
                        type="button" 
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsCategoryOpen(false);
                        }}
                        className={`flex items-center justify-between px-6 py-4 text-sm font-medium text-black hover:bg-gray-200 transition-colors text-left ${index !== categories.length - 1 ? 'border-b border-gray-200' : ''}`}
                      >
                        {cat}
                        {selectedCategory === cat && <span className="text-primary text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Subject & Upload Side */}
            <div className="flex flex-col gap-8 lg:w-[60%]">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="font-bold text-black text-sm uppercase sm:w-48 whitespace-nowrap">Subject</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g Aircon not working in Room 000"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:border-transparent text-sm text-black placeholder-gray-400 w-full"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 h-full">
                <label className="font-bold text-black text-sm uppercase sm:w-48 whitespace-nowrap pt-2">Supporting Documents</label>
                <div className="flex-1 flex flex-col gap-3 w-full">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border ${isDragging ? 'border-primary bg-red-50' : 'border-gray-300 bg-transparent hover:bg-gray-50'} border-dashed rounded-lg h-32 flex items-center justify-center cursor-pointer transition-colors px-4 text-center`}
                  >
                    <input 
                      type="file" 
                      multiple 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileSelect}
                    />
                    <p className="text-sm text-gray-500 pointer-events-none">
                      Drag photos or documents here, or <span className="font-bold text-black underline">browse files</span>
                    </p>
                  </div>
                  
                  {/* Selected Files Display */}
                  {files.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded-lg text-sm text-black">
                          <span className="truncate max-w-[85%]">{file.name}</span>
                          <button 
                            type="button" 
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 font-bold px-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description Area */}
          <div className="flex flex-col gap-3 mt-4">
            <div className="flex items-baseline gap-2">
              <label className="font-bold text-black text-sm uppercase">Description</label>
              <span className="text-xs text-gray-500">be specific — this is what routes your case</span>
            </div>
            <textarea 
              rows={8}
              required
              placeholder="Describe what happened, where, and when......"
              className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:border-transparent text-sm text-black placeholder-gray-400 resize-none"
            ></textarea>
          </div>

          {/* Footer Area */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-xs font-medium text-black">
              You'll get a case ID and email confirmation once submitted.
            </p>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full sm:w-auto text-white font-medium py-3 px-8 rounded-lg transition-colors text-sm text-center uppercase whitespace-nowrap ${
                isSubmitting ? 'bg-red-400 cursor-not-allowed' : 'bg-primary hover:bg-red-700'
              }`}
            >
              {isSubmitting ? 'SUBMITTING...' : 'SUBMIT COMPLAINT'}
            </button>
          </div>
        </form>
      </div>

      {/* Success Dialog Overlay */}
      <PopupDialog 
        isOpen={showSuccessDialog}
        hideHeader={true}
        maxWidth="max-w-2xl"
        footer={
          <>
            <button 
              type="button"
              onClick={() => router.push('/user/dashboard')}
              className="px-6 py-3 border-2 border-black text-black hover:bg-gray-100 rounded-lg font-bold text-sm transition-colors"
            >
              BACK TO DASHBOARD
            </button>
            <button 
              type="button"
              onClick={() => router.push('/user/my-cases')}
              className="px-6 py-3 bg-[#E50000] hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors"
            >
              VIEW CASE
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center pt-4">
          <div className="w-24 h-24 bg-[#D1F0D4] rounded-full flex items-center justify-center mb-6">
            <Check className="w-12 h-12 text-[#10B981]" strokeWidth={4} />
          </div>
          <h2 className="text-3xl font-black text-black mb-3">Complaint Submitted</h2>
          <p className="text-sm text-gray-700 text-center max-w-sm mb-8 leading-relaxed">
            Your case has been created and routed for review. A confirmation has been sent to your email.
          </p>
          
          <div className="w-full border border-gray-200 rounded-2xl p-6 text-left shadow-sm">
            <p className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-wider">Case ID</p>
            <p className="text-3xl font-black text-black mb-4">MO-00001</p>
            <div className="flex gap-3">
              <span className="px-4 py-1.5 bg-[#FFBFC4] text-[#E50000] rounded-md text-xs font-bold uppercase tracking-wide">
                {selectedCategory || 'FACILITIES'}
              </span>
              <span className="px-4 py-1.5 bg-[#FFBFC4] text-[#E50000] rounded-md text-xs font-bold uppercase tracking-wide">
                OPEN
              </span>
            </div>
          </div>
        </div>
      </PopupDialog>
    </div>
  );
}
