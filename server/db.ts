import fs from 'fs';
import path from 'path';

export interface Author {
  id: number;
  name: string;
  biography: string;
  nationality: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  floor_section: string;
  description: string;
}

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
  member_id: string; // e.g. STU-1001, LIB-0001
  name: string;
  email: string;
  password?: string;
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
  issue_date: string; // YYYY-MM-DD
  due_date: string; // YYYY-MM-DD
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

export interface DatabaseState {
  authors: Author[];
  categories: Category[];
  books: Book[];
  members: Member[];
  borrowings: Borrowing[];
  reservations: Reservation[];
  announcements: Announcement[];
}

const DATA_FILE = path.resolve(process.cwd(), 'library_data.json');

const INITIAL_AUTHORS: Author[] = [
  { id: 1, name: "Dr. A. P. J. Abdul Kalam", nationality: "Indian", biography: "Renowned aerospace scientist and the 11th President of India, author of inspirational autobiographies and scientific works." },
  { id: 2, name: "Stuart Russell & Peter Norvig", nationality: "American", biography: "Pioneering computer scientists and authors of the standard global textbook on Artificial Intelligence." },
  { id: 3, name: "Robert C. Martin", nationality: "American", biography: "Software engineer and author of the Agile Software Development Series, known as 'Uncle Bob'." },
  { id: 4, name: "Herbert Schildt", nationality: "American", biography: "Leading authority on C, C++, and Java programming with millions of copies sold worldwide." },
  { id: 5, name: "F. Scott Fitzgerald", nationality: "American", biography: "Iconic novelist of the Jazz Age, author of The Great Gatsby." },
  { id: 6, name: "Harper Lee", nationality: "American", biography: "Pulitzer Prize winning novelist, celebrated author of To Kill a Mockingbird." },
  { id: 7, name: "Yuval Noah Harari", nationality: "Israeli", biography: "Historian, philosopher, and professor at the Hebrew University of Jerusalem." },
  { id: 8, name: "Andrew S. Tanenbaum", nationality: "American-Dutch", biography: "Computer scientist, researcher, author of foundational books on Computer Networks and Operating Systems." },
  { id: 9, name: "Thomas H. Cormen et al.", nationality: "American", biography: "Authors of Introduction to Algorithms (CLRS), the standard algorithms guide worldwide." },
  { id: 10, name: "Jane Austen", nationality: "British", biography: "Acclaimed English novelist famous for romantic fiction and social commentary." },
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: "Computer Science & AI", slug: "computer-science", floor_section: "Floor 2, Wing A", description: "Algorithms, machine learning, systems, and software engineering" },
  { id: 2, name: "Programming & Web", slug: "programming", floor_section: "Floor 2, Wing B", description: "Java, Python, C++, web development and programming languages" },
  { id: 3, name: "Biography & Inspiration", slug: "biography", floor_section: "Floor 1, Wing C", description: "Lives of inspiring scientists, leaders, and thinkers" },
  { id: 4, name: "Literature & Classics", slug: "literature", floor_section: "Floor 1, Wing A", description: "World classics, historical fiction, and award-winning novels" },
  { id: 5, name: "History & Philosophy", slug: "history", floor_section: "Floor 3, Wing B", description: "Human history, anthropology, civilization and philosophy" },
  { id: 6, name: "Electronics & Networks", slug: "networking", floor_section: "Floor 2, Wing C", description: "Hardware architectures, protocols, routing and distributed computing" },
];

const INITIAL_BOOKS: Book[] = [
  {
    id: 1,
    isbn: "978-8173711466",
    title: "Wings of Fire: An Autobiography",
    author_id: 1,
    author_name: "Dr. A. P. J. Abdul Kalam",
    category_id: 3,
    category_name: "Biography & Inspiration",
    publication_year: 1999,
    publisher: "Universities Press",
    edition: "1st Edition",
    shelf_location: "Rack C-02, Shelf 3",
    call_number: "BIO.KAL.1999",
    total_copies: 5,
    available_copies: 3,
    description: "An inspiring autobiography recounting Dr. Kalam's journey from a humble childhood in Rameswaram to leading India's missile defense and space exploration programs.",
    cover_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80",
    tags: ["kalam", "autobiography", "inspiration", "space", "science", "leadership"]
  },
  {
    id: 2,
    isbn: "978-0134610993",
    title: "Artificial Intelligence: A Modern Approach",
    author_id: 2,
    author_name: "Stuart Russell & Peter Norvig",
    category_id: 1,
    category_name: "Computer Science & AI",
    publication_year: 2020,
    publisher: "Pearson",
    edition: "4th Edition",
    shelf_location: "Rack A-14, Shelf 1",
    call_number: "CS.AI.RUS.2020",
    total_copies: 6,
    available_copies: 2,
    description: "The authoritative, comprehensive overview of the theory and practice of AI, covering machine learning, search, neural networks, robotics, and probabilistic reasoning.",
    cover_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&auto=format&fit=crop&q=80",
    tags: ["ai", "artificial intelligence", "machine learning", "neural networks", "robotics", "algorithms"]
  },
  {
    id: 3,
    isbn: "978-0132350884",
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author_id: 3,
    author_name: "Robert C. Martin",
    category_id: 1,
    category_name: "Computer Science & AI",
    publication_year: 2008,
    publisher: "Prentice Hall",
    edition: "1st Edition",
    shelf_location: "Rack A-08, Shelf 4",
    call_number: "CS.SE.MAR.2008",
    total_copies: 4,
    available_copies: 0,
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Best practices for formatting, refactoring, and test-driven design.",
    cover_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=80",
    tags: ["clean code", "software engineering", "refactoring", "best practices", "uncle bob", "agile"]
  },
  {
    id: 4,
    isbn: "978-1260440232",
    title: "Java: The Complete Reference",
    author_id: 4,
    author_name: "Herbert Schildt",
    category_id: 2,
    category_name: "Programming & Web",
    publication_year: 2021,
    publisher: "McGraw Hill",
    edition: "12th Edition",
    shelf_location: "Rack B-03, Shelf 2",
    call_number: "PROG.JAV.SCH.2021",
    total_copies: 8,
    available_copies: 5,
    description: "Fully updated for Java SE 17, this definitive guide explains how to develop, compile, debug, and run Java programs with extensive coverage of OOP, Generics, and concurrency.",
    cover_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=80",
    tags: ["java", "programming", "oop", "software", "streams", "multithreading"]
  },
  {
    id: 5,
    isbn: "978-0262033848",
    title: "Introduction to Algorithms (CLRS)",
    author_id: 9,
    author_name: "Thomas H. Cormen et al.",
    category_id: 1,
    category_name: "Computer Science & AI",
    publication_year: 2009,
    publisher: "MIT Press",
    edition: "3rd Edition",
    shelf_location: "Rack A-01, Shelf 2",
    call_number: "CS.ALG.COR.2009",
    total_copies: 6,
    available_copies: 1,
    description: "The global benchmark text on data structures and algorithms, featuring rigorous mathematical foundations, dynamic programming, graph algorithms, and NP-completeness.",
    cover_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80",
    tags: ["algorithms", "data structures", "mit", "clrs", "graph theory", "sorting"]
  },
  {
    id: 6,
    isbn: "978-0130661029",
    title: "Computer Networks",
    author_id: 8,
    author_name: "Andrew S. Tanenbaum",
    category_id: 6,
    category_name: "Electronics & Networks",
    publication_year: 2011,
    publisher: "Pearson",
    edition: "5th Edition",
    shelf_location: "Rack C-10, Shelf 1",
    call_number: "NET.TAN.2011",
    total_copies: 5,
    available_copies: 3,
    description: "Classic introduction to computer networking principles, TCP/IP protocol suite, wireless networks, network security, and internet routing architectures.",
    cover_url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80",
    tags: ["networks", "tcp/ip", "protocols", "tanenbaum", "security", "routing"]
  },
  {
    id: 7,
    isbn: "978-0062316097",
    title: "Sapiens: A Brief History of Humankind",
    author_id: 7,
    author_name: "Yuval Noah Harari",
    category_id: 5,
    category_name: "History & Philosophy",
    publication_year: 2015,
    publisher: "Harper",
    edition: "1st Edition",
    shelf_location: "Rack D-05, Shelf 3",
    call_number: "HIS.HAR.2015",
    total_copies: 4,
    available_copies: 4,
    description: "A thrilling exploration of how an unremarkable ape became the ruler of planet Earth, traversing the Cognitive, Agricultural, and Scientific Revolutions.",
    cover_url: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=500&auto=format&fit=crop&q=80",
    tags: ["history", "sapiens", "anthropology", "evolution", "philosophy", "civilization"]
  },
  {
    id: 8,
    isbn: "978-0743273565",
    title: "The Great Gatsby",
    author_id: 5,
    author_name: "F. Scott Fitzgerald",
    category_id: 4,
    category_name: "Literature & Classics",
    publication_year: 1925,
    publisher: "Scribner",
    edition: "Reprint Edition",
    shelf_location: "Rack E-02, Shelf 2",
    call_number: "LIT.FIT.1925",
    total_copies: 6,
    available_copies: 5,
    description: "A portrait of the Jazz Age, telling the tragic story of Jay Gatsby and his obsessive pursuit of the unattainable Daisy Buchanan in 1920s Long Island.",
    cover_url: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=80",
    tags: ["literature", "classics", "gatsby", "fiction", "novel", "american literature"]
  },
  {
    id: 9,
    isbn: "978-0060935467",
    title: "To Kill a Mockingbird",
    author_id: 6,
    author_name: "Harper Lee",
    category_id: 4,
    category_name: "Literature & Classics",
    publication_year: 1960,
    publisher: "Harper Perennial",
    edition: "50th Anniversary Edition",
    shelf_location: "Rack E-04, Shelf 4",
    call_number: "LIT.LEE.1960",
    total_copies: 5,
    available_copies: 4,
    description: "Set in the American South during the Great Depression, an unforgettable novel of racial injustice and the destruction of innocence through the eyes of young Scout Finch.",
    cover_url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80",
    tags: ["classics", "literature", "pulitzer", "justice", "harper lee", "novel"]
  },
  {
    id: 10,
    isbn: "978-0141439518",
    title: "Pride and Prejudice",
    author_id: 10,
    author_name: "Jane Austen",
    category_id: 4,
    category_name: "Literature & Classics",
    publication_year: 1813,
    publisher: "Penguin Classics",
    edition: "Penguin Classics Ed.",
    shelf_location: "Rack E-01, Shelf 3",
    call_number: "LIT.AUS.1813",
    total_copies: 4,
    available_copies: 3,
    description: "The witty and charming battle of wits between Elizabeth Bennet and the arrogant Mr. Darcy in 19th-century English countryside society.",
    cover_url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=80",
    tags: ["classics", "romance", "austen", "literature", "british", "satire"]
  },
  {
    id: 11,
    isbn: "978-8122308365",
    title: "Ignited Minds: Unleashing the Power Within India",
    author_id: 1,
    author_name: "Dr. A. P. J. Abdul Kalam",
    category_id: 3,
    category_name: "Biography & Inspiration",
    publication_year: 2002,
    publisher: "Penguin India",
    edition: "1st Edition",
    shelf_location: "Rack C-02, Shelf 4",
    call_number: "BIO.KAL.2002",
    total_copies: 4,
    available_copies: 2,
    description: "Dr. Kalam addresses the youth of India, outlining a passionate blueprint for national development, education, scientific innovation, and spiritual strength.",
    cover_url: "https://images.unsplash.com/photo-1532012164546-f432f2e3777d?w=500&auto=format&fit=crop&q=80",
    tags: ["kalam", "youth", "inspiration", "india", "development", "leadership"]
  },
  {
    id: 12,
    isbn: "978-0131489066",
    title: "Effective Java",
    author_id: 4,
    author_name: "Joshua Bloch",
    category_id: 2,
    category_name: "Programming & Web",
    publication_year: 2018,
    publisher: "Addison-Wesley",
    edition: "3rd Edition",
    shelf_location: "Rack B-03, Shelf 3",
    call_number: "PROG.JAV.BLO.2018",
    total_copies: 4,
    available_copies: 2,
    description: "Essential best practices for the Java platform. Covers lambdas, streams, generics, enums, annotations, and defensive programming techniques.",
    cover_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80",
    tags: ["java", "best practices", "effective java", "programming", "generics", "streams"]
  }
];

const INITIAL_MEMBERS: Member[] = [
  {
    id: 1,
    member_id: "STU-2024-101",
    name: "Arpita Shah",
    email: "student@university.edu",
    password: "password123",
    role: "student",
    department: "Computer Engineering",
    max_allowed_books: 3,
    status: "active",
    phone: "+91 98765 43210"
  },
  {
    id: 2,
    member_id: "STU-2024-102",
    name: "Rohan Patil",
    email: "priya@university.edu",
    password: "password123",
    role: "student",
    department: "Electronics & Computer Eng.",
    max_allowed_books: 3,
    status: "active",
    phone: "+91 98765 12345"
  },
  {
    id: 3,
    member_id: "LIB-2024-001",
    name: "Dr. Eleanor Vance",
    email: "librarian@university.edu",
    password: "adminpassword",
    role: "librarian",
    department: "Library Services & Archives",
    max_allowed_books: 15,
    status: "active",
    phone: "+1 (555) 987-6543"
  }
];

const INITIAL_BORROWINGS: Borrowing[] = [
  {
    id: 1,
    book_id: 3, // Clean Code (0 available)
    book_title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    member_id: 1, // Arpita
    member_name: "Arpita Shah",
    student_code: "STU-2024-101",
    issue_date: "2026-09-20",
    due_date: "2026-10-04", // overdue relative to current 2026-10-10
    return_date: null,
    renewal_count: 0,
    status: "overdue",
    fine_amount: 3.00, // 6 days * $0.50
    fine_paid: false
  },
  {
    id: 2,
    book_id: 2, // AI Modern Approach
    book_title: "Artificial Intelligence: A Modern Approach",
    member_id: 1, // Arpita
    member_name: "Arpita Shah",
    student_code: "STU-2024-101",
    issue_date: "2026-10-02",
    due_date: "2026-10-16",
    return_date: null,
    renewal_count: 1,
    status: "active",
    fine_amount: 0,
    fine_paid: false
  },
  {
    id: 3,
    book_id: 5, // Introduction to Algorithms
    book_title: "Introduction to Algorithms (CLRS)",
    member_id: 2, // Rohan
    member_name: "Rohan Patil",
    student_code: "STU-2024-102",
    issue_date: "2026-09-28",
    due_date: "2026-10-12",
    return_date: null,
    renewal_count: 0,
    status: "active",
    fine_amount: 0,
    fine_paid: false
  }
];

const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 1,
    book_id: 3, // Clean code
    book_title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    member_id: 2, // Rohan reserved it
    member_name: "Rohan Patil",
    student_code: "STU-2024-102",
    reservation_date: "2026-10-05",
    status: "waiting",
    queue_position: 1
  }
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    title: "Mid-Term Extended Study Hours",
    content: "The library Main Reading Hall will remain open 24/7 starting Monday next week. Free coffee will be served after 10 PM in the study café.",
    type: "hours",
    date: "2026-10-08"
  },
  {
    id: 2,
    title: "Overdue Policy Reminder",
    content: "Standard student loan period is 14 days with up to 2 renewals (unless reserved by another student). Overdue fines accrue at $0.50 per day.",
    type: "rule",
    date: "2026-10-01"
  },
  {
    id: 3,
    title: "New AI & Data Science Collection Added",
    content: "Over 40 new hardcovers on generative AI, deep learning, and transformer architectures have been cataloged in Floor 2, Wing A.",
    type: "notice",
    date: "2026-09-25"
  }
];

class DatabaseManager {
  private state: DatabaseState;

  constructor() {
    this.state = this.load();
  }

  private load(): DatabaseState {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Failed to read database file, initializing defaults", e);
    }

    const defaultState: DatabaseState = {
      authors: INITIAL_AUTHORS,
      categories: INITIAL_CATEGORIES,
      books: INITIAL_BOOKS,
      members: INITIAL_MEMBERS,
      borrowings: INITIAL_BORROWINGS,
      reservations: INITIAL_RESERVATIONS,
      announcements: INITIAL_ANNOUNCEMENTS
    };
    this.save(defaultState);
    return defaultState;
  }

  private save(state: DatabaseState) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
      console.error("Error saving database file", e);
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public getBooks(query?: { search?: string; category?: string; status?: string }): Book[] {
    let result = [...this.state.books];
    if (query?.search) {
      const q = query.search.toLowerCase().trim();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author_name.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q) ||
        b.category_name.toLowerCase().includes(q) ||
        b.call_number.toLowerCase().includes(q) ||
        b.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (query?.category && query.category !== 'all') {
      result = result.filter(b => b.category_name.toLowerCase().includes(query.category!.toLowerCase()));
    }
    if (query?.status) {
      if (query.status === 'available') {
        result = result.filter(b => b.available_copies > 0);
      } else if (query.status === 'borrowed') {
        result = result.filter(b => b.available_copies === 0);
      }
    }
    return result;
  }

  public getBookById(id: number): Book | undefined {
    return this.state.books.find(b => b.id === id);
  }

  public addBook(bookData: Omit<Book, 'id'>): Book {
    const newId = this.state.books.length > 0 ? Math.max(...this.state.books.map(b => b.id)) + 1 : 1;
    const newBook: Book = {
      ...bookData,
      id: newId
    };
    this.state.books.unshift(newBook);
    this.save(this.state);
    return newBook;
  }

  public updateBook(id: number, updates: Partial<Book>): Book | null {
    const idx = this.state.books.findIndex(b => b.id === id);
    if (idx === -1) return null;
    this.state.books[idx] = { ...this.state.books[idx], ...updates };
    this.save(this.state);
    return this.state.books[idx];
  }

  public deleteBook(id: number): boolean {
    const idx = this.state.books.findIndex(b => b.id === id);
    if (idx === -1) return false;
    this.state.books.splice(idx, 1);
    this.save(this.state);
    return true;
  }

  public getMemberByEmail(email: string): Member | undefined {
    return this.state.members.find(m => m.email.toLowerCase() === email.toLowerCase());
  }

  public getMemberById(id: number): Member | undefined {
    return this.state.members.find(m => m.id === id);
  }

  public getMemberByCode(code: string): Member | undefined {
    return this.state.members.find(m => m.member_id.toLowerCase() === code.toLowerCase());
  }

  public updateMember(id: number, updates: Partial<Member>): Member | null {
    const idx = this.state.members.findIndex(m => m.id === id);
    if (idx === -1) return null;
    this.state.members[idx] = { ...this.state.members[idx], ...updates };

    // Synchronize student name across active loans and reservations
    if (updates.name) {
      this.state.borrowings.forEach(b => {
        if (b.member_id === id) {
          b.member_name = updates.name!;
        }
      });
      this.state.reservations.forEach(r => {
        if (r.member_id === id) {
          r.member_name = updates.name!;
        }
      });
    }

    this.save(this.state);
    return this.state.members[idx];
  }

  public registerStudent(data: { name: string; email: string; department: string; phone: string; password?: string }): Member {
    const newId = this.state.members.length > 0 ? Math.max(...this.state.members.map(m => m.id)) + 1 : 1;
    const studentCode = `STU-2024-${String(100 + newId).padStart(3, '0')}`;
    const newMember: Member = {
      id: newId,
      member_id: studentCode,
      name: data.name,
      email: data.email,
      password: data.password || 'password123',
      role: 'student',
      department: data.department || 'General Studies',
      max_allowed_books: 3,
      status: 'active',
      phone: data.phone || '+1 (555) 000-0000'
    };
    this.state.members.push(newMember);
    this.save(this.state);
    return newMember;
  }

  public borrowBook(bookId: number, memberId: number): { success: boolean; message: string; borrowing?: Borrowing } {
    const book = this.getBookById(bookId);
    const member = this.getMemberById(memberId);

    if (!book) return { success: false, message: "Book record not found." };
    if (!member) return { success: false, message: "Member record not found." };
    if (member.status !== 'active') return { success: false, message: "Member account is suspended." };

    // Check active borrowings count
    const activeBorrowings = this.state.borrowings.filter(b => b.member_id === memberId && (b.status === 'active' || b.status === 'overdue'));
    if (activeBorrowings.length >= member.max_allowed_books) {
      return {
        success: false,
        message: `Limit reached: Maximum ${member.max_allowed_books} books allowed simultaneously for your account.`
      };
    }

    // Check if member already has an active loan of this book
    const alreadyHas = activeBorrowings.some(b => b.book_id === bookId);
    if (alreadyHas) {
      return { success: false, message: "You already have an active loan copy of this book." };
    }

    if (book.available_copies <= 0) {
      return { success: false, message: "No copies currently available on shelf. You can place a reservation instead." };
    }

    // Decrement available copies
    book.available_copies -= 1;

    // Issue dates
    const today = new Date();
    const issueDateStr = today.toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days loan period
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const newBorrowingId = this.state.borrowings.length > 0 ? Math.max(...this.state.borrowings.map(b => b.id)) + 1 : 1;
    const borrowing: Borrowing = {
      id: newBorrowingId,
      book_id: book.id,
      book_title: book.title,
      member_id: member.id,
      member_name: member.name,
      student_code: member.member_id,
      issue_date: issueDateStr,
      due_date: dueDateStr,
      return_date: null,
      renewal_count: 0,
      status: 'active',
      fine_amount: 0,
      fine_paid: false
    };

    this.state.borrowings.unshift(borrowing);

    // If member had a reservation, fulfill it
    const resIdx = this.state.reservations.findIndex(r => r.book_id === bookId && r.member_id === memberId && r.status === 'waiting');
    if (resIdx !== -1) {
      this.state.reservations[resIdx].status = 'fulfilled';
    }

    this.save(this.state);
    return { success: true, message: `"${book.title}" successfully issued. Due date is ${dueDateStr}.`, borrowing };
  }

  public returnBook(borrowingId: number): { success: boolean; message: string; fineAccrued: number } {
    const borrowing = this.state.borrowings.find(b => b.id === borrowingId);
    if (!borrowing) return { success: false, message: "Borrowing transaction not found.", fineAccrued: 0 };
    if (borrowing.status === 'returned') return { success: false, message: "This book has already been returned.", fineAccrued: 0 };

    const today = new Date();
    const returnDateStr = today.toISOString().split('T')[0];
    borrowing.return_date = returnDateStr;
    borrowing.status = 'returned';

    // Calculate fine if overdue (due_date < return_date)
    const dueDate = new Date(borrowing.due_date);
    let fine = 0;
    if (today > dueDate) {
      const diffTime = Math.abs(today.getTime() - dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fine = diffDays * 0.50; // $0.50/day
      borrowing.fine_amount = fine;
    }

    // Increment available book copies
    const book = this.getBookById(borrowing.book_id);
    if (book) {
      book.available_copies = Math.min(book.total_copies, book.available_copies + 1);

      // Check if any reservation waiting for this book
      const nextReservation = this.state.reservations.find(r => r.book_id === book.id && r.status === 'waiting');
      if (nextReservation) {
        nextReservation.status = 'ready';
      }
    }

    this.save(this.state);
    return {
      success: true,
      message: `"${borrowing.book_title}" returned successfully.${fine > 0 ? ` An overdue fine of $${fine.toFixed(2)} was registered.` : ''}`,
      fineAccrued: fine
    };
  }

  public renewBook(borrowingId: number, memberId: number): { success: boolean; message: string; newDueDate?: string } {
    const borrowing = this.state.borrowings.find(b => b.id === borrowingId && b.member_id === memberId);
    if (!borrowing) return { success: false, message: "Loan record not found." };
    if (borrowing.status === 'returned') return { success: false, message: "Book has already been returned." };

    if (borrowing.renewal_count >= 2) {
      return { success: false, message: "Renewal limit exceeded. Books can be renewed a maximum of 2 times." };
    }

    // Check if another member has reserved this book
    const hasWaitingReservations = this.state.reservations.some(r => r.book_id === borrowing.book_id && r.status === 'waiting' && r.member_id !== memberId);
    if (hasWaitingReservations) {
      return { success: false, message: "Cannot renew: Another student has placed a hold reservation on this book." };
    }

    // Extend due date by 14 days from previous due date or today
    const currentDue = new Date(borrowing.due_date);
    currentDue.setDate(currentDue.getDate() + 14);
    const newDueDateStr = currentDue.toISOString().split('T')[0];

    borrowing.due_date = newDueDateStr;
    borrowing.renewal_count += 1;
    borrowing.status = 'active';

    this.save(this.state);
    return { success: true, message: `Renewed successfully! New due date is ${newDueDateStr}.`, newDueDate: newDueDateStr };
  }

  public reserveBook(bookId: number, memberId: number): { success: boolean; message: string; queuePosition?: number } {
    const book = this.getBookById(bookId);
    const member = this.getMemberById(memberId);
    if (!book || !member) return { success: false, message: "Invalid book or member." };

    // Check if copies are available right now
    if (book.available_copies > 0) {
      return { success: false, message: "Copies are currently available on shelf. You can directly borrow it!" };
    }

    // Check if already reserved
    const existing = this.state.reservations.find(r => r.book_id === bookId && r.member_id === memberId && (r.status === 'waiting' || r.status === 'ready'));
    if (existing) {
      return { success: false, message: `You already hold reservation #${existing.queue_position} for this book.` };
    }

    const waitingReservations = this.state.reservations.filter(r => r.book_id === bookId && r.status === 'waiting');
    const queuePos = waitingReservations.length + 1;

    const newResId = this.state.reservations.length > 0 ? Math.max(...this.state.reservations.map(r => r.id)) + 1 : 1;
    const reservation: Reservation = {
      id: newResId,
      book_id: book.id,
      book_title: book.title,
      member_id: member.id,
      member_name: member.name,
      student_code: member.member_id,
      reservation_date: new Date().toISOString().split('T')[0],
      status: 'waiting',
      queue_position: queuePos
    };

    this.state.reservations.push(reservation);
    this.save(this.state);

    return {
      success: true,
      message: `Reservation confirmed for "${book.title}". You are #${queuePos} in the waitlist.`,
      queuePosition: queuePos
    };
  }

  public getStudentDashboard(memberId: number) {
    const member = this.getMemberById(memberId);
    if (!member) return null;

    const loans = this.state.borrowings.filter(b => b.member_id === memberId);
    const activeLoans = loans.filter(b => b.status === 'active' || b.status === 'overdue');
    const pastLoans = loans.filter(b => b.status === 'returned');
    const reservations = this.state.reservations.filter(b => b.member_id === memberId);
    const totalFines = loans.reduce((acc, b) => (!b.fine_paid ? acc + b.fine_amount : acc), 0);

    // Recommended books based on past loans & department
    const borrowedCategoryIds = new Set(loans.map(l => {
      const b = this.getBookById(l.book_id);
      return b ? b.category_id : null;
    }).filter(Boolean));

    let recommended = this.state.books.filter(b => borrowedCategoryIds.has(b.category_id) && !activeLoans.some(al => al.book_id === b.id));
    if (recommended.length === 0) {
      recommended = this.state.books.slice(0, 4);
    }

    return {
      member,
      activeLoans,
      pastLoans,
      reservations,
      totalFines,
      recommended: recommended.slice(0, 4)
    };
  }

  public getLibrarianDashboard() {
    const totalBooks = this.state.books.length;
    const totalCopies = this.state.books.reduce((acc, b) => acc + b.total_copies, 0);
    const availableCopies = this.state.books.reduce((acc, b) => acc + b.available_copies, 0);
    const borrowedCopies = totalCopies - availableCopies;
    const totalMembers = this.state.members.length;

    const activeLoans = this.state.borrowings.filter(b => b.status === 'active' || b.status === 'overdue');
    const overdueLoans = this.state.borrowings.filter(b => b.status === 'overdue');
    const totalFinesDue = this.state.borrowings.reduce((acc, b) => (!b.fine_paid ? acc + b.fine_amount : acc), 0);

    const pendingReservations = this.state.reservations.filter(r => r.status === 'waiting' || r.status === 'ready');

    return {
      stats: {
        totalTitles: totalBooks,
        totalCopies,
        availableCopies,
        borrowedCopies,
        activeBorrowers: activeLoans.length,
        overdueCount: overdueLoans.length,
        totalMembers,
        totalFinesDue
      },
      recentBorrowings: this.state.borrowings.slice(0, 10),
      overdueLoans,
      pendingReservations,
      members: this.state.members,
      categories: this.state.categories
    };
  }

  public payFine(borrowingId: number): boolean {
    const b = this.state.borrowings.find(x => x.id === borrowingId);
    if (!b) return false;
    b.fine_paid = true;
    b.fine_amount = 0;
    this.save(this.state);
    return true;
  }

  public resetToSample() {
    this.state = {
      authors: INITIAL_AUTHORS,
      categories: INITIAL_CATEGORIES,
      books: INITIAL_BOOKS,
      members: INITIAL_MEMBERS,
      borrowings: INITIAL_BORROWINGS,
      reservations: INITIAL_RESERVATIONS,
      announcements: INITIAL_ANNOUNCEMENTS
    };
    this.save(this.state);
  }
}

export const db = new DatabaseManager();
