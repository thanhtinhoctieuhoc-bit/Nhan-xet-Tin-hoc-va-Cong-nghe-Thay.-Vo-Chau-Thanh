
import React, { useState, useRef } from 'react';
import DownloadIcon from './icons/DownloadIcon';
import UploadIcon from './icons/UploadIcon';
import type { Subject, Grade, FeedbackLength } from '../types';
import { SUBJECT_OPTIONS, GRADE_OPTIONS, FEEDBACK_LENGTH_OPTIONS } from '../constants';

interface BulkFormProps {
  onGenerate: (csvData: string, feedbackLength: FeedbackLength) => void;
  isLoading: boolean;
}

const BulkForm: React.FC<BulkFormProps> = ({ onGenerate, isLoading }) => {
  const [subject, setSubject] = useState<Subject>('Tin học');
  const [grade, setGrade] = useState<Grade>(3);
  const [feedbackLength, setFeedbackLength] = useState<FeedbackLength>('tu_dong');
  const [csvData, setCsvData] = useState<string>('STT,HoTen,Diem\n');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = csvData.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length > 1) { // Only submit if there's more than a header
      const studentLines = lines.slice(1);
      const newHeader = 'STT,HoTen,Diem,Subject,Grade';
      const augmentedStudentLines = studentLines.map(line => `${line.trim()},${subject},${grade}`);
      const augmentedCsvData = [newHeader, ...augmentedStudentLines].join('\n');
      onGenerate(augmentedCsvData, feedbackLength);
    }
  };

  const handleDownloadSample = () => {
    const csvContent = "STT,HoTen,Diem\n";
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "mau_nhap_lieu_don_gian.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          setCsvData(text);
        }
      };
      reader.readAsText(file, 'UTF-8');
    }
    // Reset file input value to allow re-uploading the same file
    if (e.target) {
        e.target.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };


  const isSubmitDisabled = isLoading || csvData.trim().split('\n').filter(line => line.trim() !== '').length <= 1;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="bulk_subject" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Môn học</label>
          <select id="bulk_subject" name="subject" value={subject} onChange={(e) => setSubject(e.target.value as Subject)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-colors">
            {SUBJECT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="bulk_grade" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Lớp</label>
          <select id="bulk_grade" name="grade" value={grade} onChange={(e) => setGrade(Number(e.target.value) as Grade)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-colors">
            {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="bulk_length" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Độ dài</label>
          <select id="bulk_length" name="length" value={feedbackLength} onChange={(e) => setFeedbackLength(e.target.value as FeedbackLength)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-colors">
            {FEEDBACK_LENGTH_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="bulk_list" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Dữ liệu học sinh</label>
             <button type="button" onClick={handleDownloadSample} className="flex items-center space-x-1.5 text-xs font-medium text-sky-600 hover:text-sky-800 hover:underline">
                <DownloadIcon />
                <span>Tải tệp CSV mẫu (đơn giản)</span>
            </button>
        </div>
        <p className="text-xs text-gray-500 mb-3">Chỉ cần cung cấp 3 cột: <code className="bg-gray-100 text-gray-700 p-1 rounded">STT,HoTen,Diem</code></p>
        
        <div className="mb-3">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv, text/csv" className="hidden" />
          <button 
            type="button" 
            onClick={handleUploadClick}
            className="w-full flex justify-center items-center space-x-2 text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            <UploadIcon />
            <span>Chọn tệp từ máy tính (.csv)</span>
          </button>
        </div>

        <div className="relative my-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
                <span className="bg-white px-2 text-xs text-gray-500 uppercase">hoặc dán vào đây</span>
            </div>
        </div>

        <textarea
          id="bulk_list"
          name="bulk_list"
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
          className="w-full h-48 p-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-colors font-mono text-sm"
          placeholder="STT,HoTen,Diem&#10;1,Nguyễn Văn An,9&#10;2,Trần Thị Bình,7"
        ></textarea>
      </div>
      <div>
        <button type="submit" disabled={isSubmitDisabled} className="w-full bg-gradient-to-br from-sky-500 to-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:from-sky-600 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5 shadow-md">
          {isLoading ? 'Đang xử lý...' : 'Tạo nhận xét hàng loạt'}
        </button>
      </div>
    </form>
  );
};

export default BulkForm;