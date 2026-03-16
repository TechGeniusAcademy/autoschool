export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: boolean;
  admin_response?: string;
  responded_at?: Date;
  responded_by?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateContactMessageData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface UpdateContactMessageData {
  is_read?: boolean;
  admin_response?: string;
  responded_by?: number;
}
