
import React, { useMemo } from 'react';
import type { BulkOutput } from '../types';
import DownloadIcon from './icons/DownloadIcon';
import EmptyStateIcon from './icons/EmptyStateIcon';

interface ResultDisplayProps {
  error: string | null;
  bulkResult: BulkOutput | null;
}

const parseMarkdownTable = (markdown: string): { headers: string[], rows: string[][] } => {
    if (!markdown) return { headers: [], rows: [] };
    
    const lines = markdown.trim().split('\n');
    const headers = lines[0]?.split('|').map(h => h.trim()).filter(Boolean) || [];
    const rows = lines.slice(2).map(line => 
        line.split('|').map(cell => cell.trim()).filter(Boolean)
    );
    
    return { headers, rows };
};


const ResultDisplay: React.FC<ResultDisplayProps> = ({ error, bulkResult }) => {
  const { headers, rows } = useMemo(() => 
    bulkResult ? parseMarkdownTable(bulkResult.markdown_table) : { headers: [], rows: [] },
    [bulkResult]
  );

  const handleDownloadCsv = () => {
    if (!bulkResult?.csv_export) return;

    const blob = new Blob(["\uFEFF" + bulkResult.csv_export], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "ket_qua_nhan_xet.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-r-lg" role="alert">
        <p className="font-bold">Đã xảy ra lỗi</p>
        <p>{error}</p>
      </div>
    );
  }

  if (bulkResult && headers.length > 0) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Bảng kết quả hàng loạt</h3>
          <button
            onClick={handleDownloadCsv}
            className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium py-1.5 px-3 rounded-lg transition-colors"
          >
            <DownloadIcon />
            <span>Tải xuống CSV</span>
          </button>
        </div>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs text-gray-800 uppercase bg-gray-100">
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index} scope="col" className="px-4 py-3 font-semibold">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="bg-white border-b last:border-b-0 hover:bg-gray-50">
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className={`px-4 py-3 ${headers[cellIndex]?.toLowerCase() === 'nhận xét' ? 'min-w-[250px]' : ''}`}>
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </div>
         <p className="mt-4 text-sm text-gray-600 bg-sky-50 p-3 rounded-lg border border-sky-200 flex items-center space-x-2">
            <span>💡</span>
            <span>{bulkResult.xlsx_note}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="text-center text-gray-500 min-h-[300px] flex flex-col items-center justify-center space-y-4 p-4">
        <EmptyStateIcon />
        <h3 className="text-lg font-semibold text-gray-700">Sẵn sàng nhận xét</h3>
        <p className="max-w-xs mx-auto">Nhập thông tin của học sinh và nhấn "Tạo nhận xét" để AI bắt đầu làm việc.</p>
    </div>
  );
};

export default ResultDisplay;
