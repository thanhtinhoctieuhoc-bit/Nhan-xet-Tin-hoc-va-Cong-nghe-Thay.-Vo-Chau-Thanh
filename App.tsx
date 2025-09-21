
import React, { useState } from 'react';
import type { BulkOutput, FeedbackLength } from './types';
import { generateBulkFeedback } from './services/geminiService';
import Header from './components/Header';
import ListForm from './components/ListForm';
import BulkForm from './components/BulkForm';
import ResultDisplay from './components/ResultDisplay';
import Spinner from './components/Spinner';

type View = 'list' | 'csv';

const App: React.FC = () => {
  const [view, setView] = useState<View>('list');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkOutput | null>(null);

  const handleBulkGenerate = async (csvData: string, feedbackLength: FeedbackLength) => {
    setIsLoading(true);
    setError(null);
    setBulkResult(null);
    try {
      const result = await generateBulkFeedback(csvData, feedbackLength);
      setBulkResult(result);
    } catch (e) {
      setError(e instanceof Error ? `Lỗi: ${e.message}` : 'Đã xảy ra lỗi không xác định. Vui lòng kiểm tra định dạng dữ liệu và thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeTabClass = "bg-white text-sky-700 shadow-sm";
  const inactiveTabClass = "bg-transparent text-gray-500 hover:text-gray-800";

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="mb-6">
              <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                <button
                  onClick={() => setView('list')}
                  className={`px-5 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${view === 'list' ? activeTabClass : inactiveTabClass}`}
                  aria-pressed={view === 'list'}
                >
                  Nhận xét theo Danh sách
                </button>
                <button
                  onClick={() => setView('csv')}
                  className={`px-5 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${view === 'csv' ? activeTabClass : inactiveTabClass}`}
                  aria-pressed={view === 'csv'}
                >
                  Nhận xét Hàng loạt (CSV)
                </button>
              </div>
            </div>
            {view === 'list' ? (
              <ListForm onGenerate={handleBulkGenerate} isLoading={isLoading} />
            ) : (
              <BulkForm onGenerate={handleBulkGenerate} isLoading={isLoading} />
            )}
          </div>
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">Kết quả Nhận xét</h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-full min-h-[300px]">
                <Spinner />
              </div>
            ) : (
              <ResultDisplay error={error} bulkResult={bulkResult} />
            )}
          </div>
        </div>
        <footer className="text-center text-slate-500 mt-12 text-sm">
          <p>Phát triển bởi Thầy. Võ Châu Thanh</p>
          <p>Ứng dụng tuân thủ Thông tư 27/2020/TT-BGDĐT</p>
        </footer>
      </main>
    </div>
  );
};

export default App;