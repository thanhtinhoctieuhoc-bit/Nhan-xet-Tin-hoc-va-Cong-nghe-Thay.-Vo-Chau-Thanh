
export type Subject = "Tin học" | "Công nghệ";
export type Grade = 3 | 4 | 5;
export type FeedbackLength = "1_cau" | "2_cau" | "3_cau" | "tu_dong";

export interface BulkOutput {
  markdown_table: string;
  csv_export: string;
  xlsx_note: string;
}