import { GoogleGenAI } from "@google/genai";
import { db, Book } from "./db.js";

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

export interface ChatResponse {
  reply: string;
  matchedBooks?: Book[];
  suggestedQuestions?: string[];
  intent?: 'search' | 'policy' | 'availability' | 'recommendation' | 'general';
  isFallback?: boolean;
}

const LIBRARY_POLICIES = `
LIBRARY POLICIES & OPERATING PROCEDURES:
1. Loan Period: 14 days for undergraduate and postgraduate students. Faculty members receive 28 days.
2. Borrowing Quota: Up to 3 books simultaneously for students; up to 15 books for faculty/librarians.
3. Renewals: Maximum 2 renewals per book allowed, provided no other user has placed a hold reservation.
4. Overdue Fines: Accrues at $0.50 per day past the due date. Accounts with unpaid fines exceeding $10.00 are temporarily restricted from new checkouts.
5. Reservations: When all copies of a book are checked out, members may reserve the book. When a copy is returned, the next student on the waitlist has 48 hours to collect it from the front circulation desk.
6. Return Procedure: Books may be dropped off at the 24/7 automated return drop-box outside Floor 1 or handed directly to the front circulation desk during staffed hours.
7. Operating Hours: Main Reading Hall open Monday-Saturday: 8:00 AM - 10:00 PM; Extended 24/7 during mid-term and final examination periods. Sunday: 10:00 AM - 6:00 PM.
8. Safety & Accuracy: The assistant must NEVER fabricate book availability, shelf locations, or call numbers. Only quote data from verified library catalog records.
`;

export async function processLibraryChat(
  message: string,
  history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [],
  memberId?: number
): Promise<ChatResponse> {
  const query = message.trim();
  const allBooks = db.getBooks();

  // Pre-filter catalog books relevant to user query keywords
  const queryLower = query.toLowerCase();
  const matchedBooks = allBooks.filter(b => {
    return (
      b.title.toLowerCase().includes(queryLower) ||
      b.author_name.toLowerCase().includes(queryLower) ||
      b.category_name.toLowerCase().includes(queryLower) ||
      b.tags.some(t => queryLower.includes(t)) ||
      (queryLower.includes('java') && b.tags.includes('java')) ||
      (queryLower.includes('kalam') && b.author_name.toLowerCase().includes('kalam')) ||
      (queryLower.includes('ai') && b.tags.includes('ai')) ||
      (queryLower.includes('algorithm') && b.tags.includes('algorithms')) ||
      (queryLower.includes('clean code') && b.title.toLowerCase().includes('clean code'))
    );
  });

  // Fetch student status if logged in
  let memberContext = "Guest user (not logged in).";
  if (memberId) {
    const studentDash = db.getStudentDashboard(memberId);
    if (studentDash) {
      memberContext = `Logged in member: ${studentDash.member.name} (ID: ${studentDash.member.member_id}, Role: ${studentDash.member.role}).
Active loans: ${studentDash.activeLoans.length} of ${studentDash.member.max_allowed_books} limit.
Current loan titles: ${studentDash.activeLoans.map(l => `"${l.book_title}" (Due: ${l.due_date}, Status: ${l.status})`).join('; ') || 'None'}.
Unpaid fines: $${studentDash.totalFines.toFixed(2)}.`;
    }
  }

  const catalogSummary = allBooks.map(b =>
    `[ID: ${b.id}] "${b.title}" by ${b.author_name} | Category: ${b.category_name} | Call No: ${b.call_number} | Shelf: ${b.shelf_location} | Status: ${b.available_copies > 0 ? `Available (${b.available_copies}/${b.total_copies} copies)` : `Currently Borrowed (0/${b.total_copies} copies on shelf)`} | ISBN: ${b.isbn}`
  ).join('\n');

  const systemInstruction = `
You are the intelligent AI Assistant for SNJB's College of Engineering (SNJB COE) Central Library System.
Your role is to assist engineering students, researchers, faculty, and librarians with natural language book discovery, availability checks, shelf location guidance, borrowing/returning rules, and personalized academic recommendations.

${LIBRARY_POLICIES}

LIVE VERIFIED LIBRARY CATALOG SNAPSHOT (Current accurate inventory):
${catalogSummary}

CURRENT USER CONTEXT:
${memberContext}

STRICT SAFETY & ACCURACY RULES:
1. Always base all availability, shelf locations (e.g., 'Rack B-03, Shelf 2'), call numbers (e.g., 'PROG.JAV.SCH.2021'), and copy counts strictly on the verified catalog snapshot above.
2. NEVER hallucinate or invent books that do not exist in the catalog. If a requested book is not in the library catalog, state clearly: "We currently do not have that title in our SNJB COE Central Library collection. Please consult the librarian desk to submit an inter-library loan request or acquisition suggestion."
3. When discussing book availability:
   - If copies > 0, state that it is available, specify the exact shelf location and call number, and invite them to borrow or reserve it.
   - If available_copies == 0, state that all copies are currently checked out, and explain that they can place a hold reservation to be next in line.
4. Keep answers concise, polite, well-formatted with markdown bullet points, and highlight key terms like shelf numbers or due dates in bold.
5. If the user asks about library rules (fines, loan periods, renewals), explain the exact policies provided.
6. Recommend books based on user interests or queries using the books from the catalog.
`;

  const client = getAiClient();

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          ...history.slice(-4), // keep last few turns for conversational context
          {
            role: "user",
            parts: [{ text: query }]
          }
        ],
        config: {
          systemInstruction,
          temperature: 0.3, // low temperature for high factual accuracy
        }
      });

      const replyText = response.text || "I am here to assist with your library needs. How can I help you today?";

      return {
        reply: replyText,
        matchedBooks: matchedBooks.slice(0, 4),
        suggestedQuestions: generateSuggestions(query),
        intent: detectIntent(query),
        isFallback: false
      };
    } catch (err) {
      console.error("Gemini API error in library chat, using intelligent factual fallback:", err);
    }
  }

  // Deterministic high-precision factual fallback mode (Offline or when GEMINI_API_KEY is not configured)
  return fallbackLibraryAssistant(query, allBooks, memberContext);
}

function detectIntent(q: string): 'search' | 'policy' | 'availability' | 'recommendation' | 'general' {
  const l = q.toLowerCase();
  if (l.includes('rule') || l.includes('procedure') || l.includes('fine') || l.includes('period') || l.includes('hour') || l.includes('return a book')) {
    return 'policy';
  }
  if (l.includes('available') || l.includes('copy') || l.includes('shelf') || l.includes('where is')) {
    return 'availability';
  }
  if (l.includes('recommend') || l.includes('suggest') || l.includes('best book') || l.includes('learning')) {
    return 'recommendation';
  }
  if (l.includes('find') || l.includes('search') || l.includes('books by') || l.includes('books on') || l.includes('do you have')) {
    return 'search';
  }
  return 'general';
}

function generateSuggestions(query: string): string[] {
  const l = query.toLowerCase();
  if (l.includes('java') || l.includes('programming')) {
    return [
      "Where is Effective Java located?",
      "Can I reserve Clean Code?",
      "What is the maximum loan period for students?"
    ];
  }
  if (l.includes('kalam') || l.includes('biography')) {
    return [
      "Are there copies of Wings of Fire available?",
      "What is the shelf location of Ignited Minds?",
      "How do I renew my borrowed books?"
    ];
  }
  if (l.includes('ai') || l.includes('artificial intelligence')) {
    return [
      "Check availability of AI: A Modern Approach",
      "Which algorithms books do you have?",
      "What happens if a book is returned late?"
    ];
  }
  return [
    "Do you have books on Artificial Intelligence?",
    "Find books written by A. P. J. Abdul Kalam",
    "What is the procedure for returning a book?",
    "Recommend some books for learning Java"
  ];
}

function fallbackLibraryAssistant(query: string, allBooks: Book[], memberContext: string): ChatResponse {
  const q = query.toLowerCase();

  // 1. Books by A.P.J. Abdul Kalam
  if (q.includes('kalam') || q.includes('abdul kalam')) {
    const kalamBooks = allBooks.filter(b => b.author_name.toLowerCase().includes('kalam'));
    const bookList = kalamBooks.map(b =>
      `• **${b.title}** (${b.publication_year})\n  - **Availability**: ${b.available_copies} of ${b.total_copies} copies available\n  - **Shelf Location**: \`${b.shelf_location}\`\n  - **Call Number**: \`${b.call_number}\`\n  - *Description*: ${b.description}`
    ).join('\n\n');

    return {
      reply: `Yes, we have **${kalamBooks.length} titles** written by **Dr. A. P. J. Abdul Kalam** in our Biography & Inspiration collection (Floor 1, Wing C):\n\n${bookList}\n\nYou can borrow available copies directly using your student ID, or reserve a copy online if all are checked out.`,
      matchedBooks: kalamBooks,
      suggestedQuestions: [
        "Where is Wings of Fire located?",
        "How many days can I borrow books for?",
        "Recommend books on Science & Technology"
      ],
      intent: 'search',
      isFallback: true
    };
  }

  // 2. Books on Artificial Intelligence
  if (q.includes('artificial intelligence') || q.includes(' ai ') || q.startsWith('ai ') || q.endsWith(' ai') || q === 'ai' || q.includes('machine learning')) {
    const aiBooks = allBooks.filter(b => b.category_id === 1 || b.tags.includes('ai'));
    const bookList = aiBooks.map(b =>
      `• **${b.title}** by ${b.author_name}\n  - **Availability**: ${b.available_copies > 0 ? `🟢 Available (${b.available_copies}/${b.total_copies} copies)` : '🔴 Checked Out (0 copies on shelf)'}\n  - **Shelf Location**: \`${b.shelf_location}\`\n  - **Call Number**: \`${b.call_number}\``
    ).join('\n\n');

    return {
      reply: `We have excellent titles in our **Computer Science & Artificial Intelligence** collection located on **Floor 2, Wing A**:\n\n${bookList}\n\nOur top recommendation for academic coursework is Stuart Russell & Peter Norvig's authoritative textbook.`,
      matchedBooks: aiBooks,
      suggestedQuestions: [
        "Can I reserve Clean Code?",
        "Where is Introduction to Algorithms located?",
        "What is the late return fine?"
      ],
      intent: 'search',
      isFallback: true
    };
  }

  // 3. Recommend books for learning Java
  if (q.includes('java')) {
    const javaBooks = allBooks.filter(b => b.tags.includes('java') || b.title.toLowerCase().includes('java'));
    const bookList = javaBooks.map(b =>
      `• **${b.title}** by ${b.author_name}\n  - **Edition**: ${b.edition}\n  - **Status**: ${b.available_copies > 0 ? `🟢 ${b.available_copies} copies on shelf` : '🔴 All copies currently checked out'}\n  - **Location**: \`${b.shelf_location}\` (Call No: \`${b.call_number}\`)\n  - **Ideal For**: ${b.title.includes('Complete Reference') ? 'Beginners to intermediate learners needing full syntax and API coverage' : 'Experienced developers mastering best practices and design patterns'}`
    ).join('\n\n');

    return {
      reply: `For learning and mastering **Java**, I highly recommend these titles from our Programming section (Floor 2, Wing B):\n\n${bookList}\n\nBoth are standard references for university computer science curriculums.`,
      matchedBooks: javaBooks,
      suggestedQuestions: [
        "How many copies of Java Complete Reference are left?",
        "What are the library hours today?",
        "How do I renew my active loans?"
      ],
      intent: 'recommendation',
      isFallback: true
    };
  }

  // 4. Return procedure / rules
  if (q.includes('return') || q.includes('returning') || q.includes('procedure')) {
    return {
      reply: `### Book Return Procedure & Policies\n\n1. **Drop-off Locations**:\n   - **Circulation Desk** on Floor 1 during standard open hours (8:00 AM - 10:00 PM).\n   - **24/7 Automated Return Drop Box** located at the main library entrance for after-hours returns.\n2. **Checking Status**:\n   - Books are scanned upon deposit and instantly removed from your active loans.\n   - You will receive a return receipt timestamp in your student portal.\n3. **Overdue Fines**:\n   - Late returns accrue an overdue penalty of **$0.50 per calendar day**.\n   - If another student is waiting in the reservation queue for the returned book, they are immediately notified for pickup!`,
      matchedBooks: [],
      suggestedQuestions: [
        "How can I renew my books?",
        "What are the library hours during exams?",
        "How many books can a student borrow?"
      ],
      intent: 'policy',
      isFallback: true
    };
  }

  // 5. General search by title / keyword
  const keywordMatches = allBooks.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.author_name.toLowerCase().includes(q) ||
    b.tags.some(t => q.includes(t))
  );

  if (keywordMatches.length > 0) {
    const list = keywordMatches.map(b =>
      `• **${b.title}** by ${b.author_name}\n  - **Status**: ${b.available_copies > 0 ? `🟢 Available (${b.available_copies} copies)` : '🔴 All copies borrowed'}\n  - **Shelf Location**: \`${b.shelf_location}\`\n  - **Call Number**: \`${b.call_number}\``
    ).join('\n\n');

    return {
      reply: `I found **${keywordMatches.length} matching item(s)** in the university catalog:\n\n${list}\n\nWould you like more details, shelf navigation guidance, or assistance reserving one of these?`,
      matchedBooks: keywordMatches,
      suggestedQuestions: [
        "What is the checkout policy?",
        "Are study halls open on weekends?",
        "Recommend books in computer science"
      ],
      intent: 'search',
      isFallback: true
    };
  }

  // Default welcome response
  return {
    reply: `Welcome to the **SNJB COE Central Library Assistant**! I can help you with:\n\n• **Finding Books & Authors**: Search by title, author name (e.g., *Dr. A. P. J. Abdul Kalam*), or subject.\n• **Checking Real-Time Availability**: View exact copies, shelf locations (e.g., *Rack A-14*), and call numbers.\n• **Curated Engineering Recommendations**: Get textbook suggestions for Java, AI, Algorithms, Data Structures, and syllabus requirements.\n• **Circulation Rules**: Inquire about loan periods (14 days), renewals (max 2), and overdue fines ($0.50/day).\n\nFeel free to type your question or use the voice microphone button to speak naturally!`,
    matchedBooks: allBooks.slice(0, 3),
    suggestedQuestions: [
      "Do you have books on Artificial Intelligence?",
      "Find books written by A. P. J. Abdul Kalam",
      "Which programming books are available?",
      "What is the procedure for returning a book?"
    ],
    intent: 'general',
    isFallback: true
  };
}
