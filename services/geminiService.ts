
import { GoogleGenAI, Type } from "@google/genai";
import type { BulkOutput, FeedbackLength } from '../types';
import { PROMPT_TEMPLATE } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const bulkOutputSchema = {
    type: Type.OBJECT,
    properties: {
        markdown_table: { type: Type.STRING },
        csv_export: { type: Type.STRING },
        xlsx_note: { type: Type.STRING }
    },
    required: ["markdown_table", "csv_export", "xlsx_note"]
};

const getLengthInstruction = (length: FeedbackLength): string => {
    const instructions = {
        '1_cau': 'QUY TẮC ĐỘ DÀI: Phải tạo nhận xét chỉ trong MỘT câu duy nhất. Nhận xét cần ngắn gọn, súc tích.',
        '2_cau': 'QUY TẮC ĐỘ DÀI: Phải tạo nhận xét gồm chính xác HAI câu. Câu đầu tiên tập trung vào điểm mạnh hoặc kiến thức đạt được. Câu thứ hai đưa ra gợi ý cải thiện hoặc lời động viên.',
        '3_cau': 'QUY TẮC ĐỘ DÀI: Phải tạo nhận xét gồm chính xác BA câu. Câu 1: Đánh giá về kiến thức. Câu 2: Đánh giá về kỹ năng thực hành. Câu 3: Lời khích lệ chung và định hướng phát triển.',
        'tu_dong': 'QUY TẮC ĐỘ DÀI: Tự động quyết định độ dài (từ 1 đến 3 câu) để có nhận xét phù hợp và tự nhiên nhất cho từng học sinh dựa trên điểm số và bối cảnh.'
    };
    return `
────────────────────────────────────────────────────────
${instructions[length]}
`;
};


export const generateBulkFeedback = async (csvData: string, feedbackLength: FeedbackLength): Promise<BulkOutput> => {
    const lengthInstruction = getLengthInstruction(feedbackLength);
    const finalPrompt = PROMPT_TEMPLATE.replace('{{LENGTH_INSTRUCTION}}', lengthInstruction);

    const prompt = `
${finalPrompt}

BẠN SẼ THỰC HIỆN YÊU CẦU SAU:
Tạo nhận xét hàng loạt cho danh sách học sinh được cung cấp dưới dạng văn bản CSV.

ĐẦU VÀO (danh sách học sinh, phân cách bởi dấu ","):
${csvData}

ĐẦU RA:
Bắt buộc trả về một đối tượng JSON hợp lệ duy nhất theo đúng cấu trúc đã định nghĩa, tuân thủ nghiêm ngặt "QUY TẮC ĐẦU RA CHO HÀNG LOẠT" và "QUY TẮC ĐỘ DÀI" đã được cung cấp trong vai trò của bạn.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: bulkOutputSchema,
                temperature: 0.7,
            }
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result as BulkOutput;

    } catch (error) {
        console.error("Lỗi khi gọi Gemini API (Bulk):", error);
        throw new Error("Không thể tạo nhận xét hàng loạt. Vui lòng kiểm tra lại định dạng dữ liệu.");
    }
};