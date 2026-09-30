import { z } from "zod";

export const contactSchema = z.object({
  fullName: z.string().min(2, "Vui lòng nhập họ và tên"),
  companyName: z.string().optional(),
  phone: z.string().min(8, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  serviceType: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().max(5000).default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;
