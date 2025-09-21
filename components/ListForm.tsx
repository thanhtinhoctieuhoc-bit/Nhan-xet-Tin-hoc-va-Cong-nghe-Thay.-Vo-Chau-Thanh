
import React, { useState, useRef } from 'react';
import type { Subject, Grade, FeedbackLength } from '../types';
import { SUBJECT_OPTIONS, GRADE_OPTIONS, FEEDBACK_LENGTH_OPTIONS } from '../constants';
import TrashIcon from './icons/TrashIcon';
import DownloadIcon from './icons/DownloadIcon';
import UploadIcon from './icons/UploadIcon';

interface Student {
  id: number;
  name: string;
  score: number | null;
}

interface ListFormProps {
  onGenerate: (csvData: string, feedbackLength: FeedbackLength) => void;
  isLoading: boolean;
}

const getRating = (score: number | null): 'T' | 'H' | 'C' | '-' => {
  if (score === null) return '-';
  if (score >= 9) return 'T';
  if (score >= 5) return 'H';
  return 'C';
};

const ListForm: React.FC<ListFormProps> = ({ onGenerate, isLoading }) => {
  const [subject, setSubject] = useState<Subject>('Tin học');
  const [grade, setGrade] = useState<Grade>(3);
  const [feedbackLength, setFeedbackLength] = useState<FeedbackLength>('tu_dong');
  const [newStudentName, setNewStudentName] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddStudent = () => {
    if (newStudentName.trim() === '') return;
    const newStudent: Student = {
      id: Date.now(),
      name: newStudentName.trim(),
      score: null, // Default score is null
    };
    setStudents(prev => [...prev, newStudent]);
    setNewStudentName('');
  };

  const handleUpdateScore = (id: number, score: number | null) => {
    let finalScore = score;
    if (finalScore !== null) {
      finalScore = Math.max(0, Math.min(10, finalScore));
    }
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, score: finalScore } : s))
    );
  };
  
  const handleDeleteStudent = (id: number) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleDownloadSample = () => {
    const csvContent = "STT,HoTen\n1,Nguyễn Văn An\n2,Trần Thị Bình";
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "mau_danh_sach_hoc_sinh.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const lines = text.trim().split('\n').slice(1); // Skip header
          const newStudents: Student[] = lines.map((line, index) => {
            const parts = line.split(',');
            // Assumes STT,HoTen format
            const name = (parts[1] || '').trim().replace(/"/g, ''); 
            return {
              id: Date.now() + index,
              name: name,
              score: null // Score is initially null
            };
          }).filter(s => s.name); // Filter out any empty rows
          setStudents(newStudents);
        }
      };
      reader.readAsText(file, 'UTF-8');
    }
    if (e.target) e.target.value = ''; // Reset input to allow re-uploading the same file
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validStudents = students.filter(s => s.score !== null);
    if (validStudents.length === 0) return;

    const studentLines = validStudents.map((student, index) => 
        `${index + 1},"${student.name.replace(/"/g, '""')}",${student.score},${subject},${grade}`
    );
    const newHeader = 'STT,HoTen,Diem,Subject,Grade';
    const augmentedCsvData = [newHeader, ...studentLines].join('\n');
    onGenerate(augmentedCsvData, feedbackLength);
  };

  const handleScoreKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextIndex = currentIndex + 1;
      if (nextIndex < students.length) {
        const nextStudent = students[nextIndex];
        const nextInput = document.getElementById(`score-input-${nextStudent.id}`);
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };
  
  const isSubmitDisabled = isLoading || students.length === 0 || students.some(s => s.score === null);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="list_subject" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Môn học</label>
          <select id="list_subject" name="subject" value={subject} onChange={(e) => setSubject(e.target.value as Subject)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-colors">
            {SUBJECT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="list_grade" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Lớp</label>
          <select id="list_grade" name="grade" value={grade} onChange={(e) => setGrade(Number(e.target.value) as Grade)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-colors">
            {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="list_length" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Độ dài</label>
          <select id="list_length" name="length" value={feedbackLength} onChange={(e) => setFeedbackLength(e.target.value as FeedbackLength)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-colors">
            {FEEDBACK_LENGTH_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Thêm học sinh</label>
        <div className="flex space-x-2 mb-3">
          <input
            type="text"
            id="new_student_name"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddStudent(); }}}
            className="flex-grow px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-colors"
            placeholder="Nhập họ tên rồi nhấn Thêm..."
          />
          <button
            type="button"
            onClick={handleAddStudent}
            className="bg-sky-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors shrink-0"
          >
            Thêm
          </button>
        </div>
        <div className="flex items-center space-x-3 text-sm">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv, text/csv" className="hidden" />
            <span className="text-gray-400">hoặc</span>
            <button 
                type="button" 
                onClick={handleUploadClick}
                className="flex items-center space-x-1.5 text-xs font-medium text-sky-600 hover:text-sky-800 hover:underline"
            >
                <UploadIcon />
                <span>Tải lên danh sách (.csv)</span>
            </button>
            <button 
                type="button" 
                onClick={handleDownloadSample}
                className="flex items-center space-x-1.5 text-xs font-medium text-sky-600 hover:text-sky-800 hover:underline"
            >
                <DownloadIcon />
                <span>Tải tệp mẫu</span>
            </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden min-h-[200px]">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-4 py-2 w-12 text-center">STT</th>
                  <th className="px-4 py-2">Họ và tên</th>
                  <th className="px-4 py-2 w-28">Điểm</th>
                  <th className="px-4 py-2 w-28">Xếp loại</th>
                  <th className="px-4 py-2 w-16 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="text-center text-gray-500 py-8 px-4">
                            Chưa có học sinh nào trong danh sách.
                        </td>
                    </tr>
                ) : (
                    students.map((student, index) => (
                    <tr key={student.id} className="bg-white hover:bg-gray-50">
                        <td className="px-4 py-2 text-center text-gray-500">{index + 1}</td>
                        <td className="px-4 py-2 font-medium text-gray-800">{student.name}</td>
                        <td className="px-4 py-2">
                        <input
                            type="number"
                            id={`score-input-${student.id}`}
                            aria-label={`Điểm của ${student.name}`}
                            value={student.score ?? ''}
                            onChange={(e) => handleUpdateScore(student.id, e.target.value === '' ? null : parseFloat(e.target.value))}
                            onKeyDown={(e) => handleScoreKeyDown(e, index)}
                            min="0"
                            max="10"
                            step="0.5"
                            className="w-20 px-2 py-1 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="Nhập điểm..."
                        />
                        </td>
                        <td className="px-4 py-2 font-semibold">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${getRating(student.score) === 'T' ? 'bg-green-100 text-green-800' : getRating(student.score) === 'H' ? 'bg-sky-100 text-sky-800' : getRating(student.score) === 'C' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
                                {getRating(student.score)}
                            </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                        <button
                            type="button"
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-gray-400 hover:text-red-600 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label={`Xóa ${student.name}`}
                        >
                           <TrashIcon />
                        </button>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
        </div>
      </div>
      
      <div>
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full bg-gradient-to-br from-sky-500 to-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:from-sky-600 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5 shadow-md"
        >
          {isLoading ? 'Đang xử lý...' : `Tạo ${students.filter(s=> s.score !== null).length > 0 ? students.filter(s=> s.score !== null).length : ''} nhận xét`}
        </button>
        {isSubmitDisabled && students.length > 0 && <p className="text-xs text-center mt-2 text-amber-700">Vui lòng nhập điểm cho tất cả học sinh trước khi tạo nhận xét.</p>}
      </div>
    </form>
  );
};

export default ListForm;
