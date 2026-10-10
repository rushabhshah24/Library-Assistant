export interface Book {
  id: number;
  isbn: string;
  title: string;
  author_id: number;
  author_name: string;
  category_id: number;
  category_name: string;
  publication_year: number;
  publisher: string;
  edition: string;
  shelf_location: string;
  call_number: string;
  total_copies: number;
  available_copies: number;
  description: string;
  cover_url: string;
  tags: string[];
}

export interface Member {
  id: number;
  member_id: string;
  name: string;
  email: string;
  role: 'student' | 'librarian';
  department: string;
  max_allowed_books: number;
  status: 'active' | 'suspended';
  phone: string;
}

export interface Borrowing {
  id: number;
  book_id: number;
  book_title: string;
  member_id: number;
  member_name: string;
  student_code: string;
  issue_date: string;
  due_date: string;
  return_date: string | null;
  renewal_count: number;
  status: 'active' | 'returned' | 'overdue';
  fine_amount: number;
  fine_paid: boolean;
}

export interface Reservation {
  id: number;
  book_id: number;
  book_title: string;
  member_id: number;
  member_name: string;
  student_code: string;
  reservation_date: string;
  status: 'waiting' | 'ready' | 'fulfilled' | 'cancelled';
  queue_position: number;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'notice' | 'rule' | 'hours' | 'event';
  date: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  matchedBooks?: Book[];
  suggestedQuestions?: string[];
  intent?: 'search' | 'policy' | 'availability' | 'recommendation' | 'general';
  isFallback?: boolean;
}
