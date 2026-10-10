import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { db } from './server/db.js';
import { processLibraryChat } from './server/ai.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // 1. AUTH ROUTES
  app.post('/api/auth/login', (req, res) => {
    const { email, password, role } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const member = db.getMemberByEmail(email);
    if (!member) {
      return res.status(401).json({ error: "Invalid credentials. Member not found." });
    }

    if (role && member.role !== role) {
      return res.status(403).json({ error: `Account role is '${member.role}', not '${role}'.` });
    }

    // In demo environment, verify matching password or fallback
    if (member.password && password && member.password !== password) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    const { password: _, ...memberWithoutPassword } = member;
    res.json({
      success: true,
      member: memberWithoutPassword
    });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, department, phone, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required." });
    }

    const existing = db.getMemberByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    const newMember = db.registerStudent({ name, email, department, phone, password });
    const { password: _, ...cleanMember } = newMember;
    res.json({
      success: true,
      member: cleanMember,
      message: "Student account created successfully."
    });
  });

  app.put('/api/members/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { name, department, phone, email } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required." });
    }
    const updated = db.updateMember(id, { name, department, phone, email });
    if (!updated) {
      return res.status(404).json({ error: "Member record not found." });
    }
    const { password: _, ...cleanMember } = updated;
    res.json({
      success: true,
      member: cleanMember,
      message: `Student profile updated to "${updated.name}".`
    });
  });

  // 2. BOOKS ROUTES
  app.get('/api/books', (req, res) => {
    const { search, category, status } = req.query as Record<string, string>;
    const books = db.getBooks({ search, category, status });
    res.json({ books });
  });

  app.get('/api/books/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const book = db.getBookById(id);
    if (!book) return res.status(404).json({ error: "Book not found." });
    res.json({ book });
  });

  app.post('/api/books', (req, res) => {
    const {
      title, author_name, category_name, isbn, publication_year,
      publisher, edition, shelf_location, call_number, total_copies,
      description, tags, cover_url
    } = req.body;

    if (!title || !author_name || !isbn || !shelf_location) {
      return res.status(400).json({ error: "Title, author, ISBN, and shelf location are required." });
    }

    const copies = parseInt(total_copies, 10) || 1;
    const newBook = db.addBook({
      title,
      author_name,
      author_id: 1, // linked
      category_name: category_name || "General Collection",
      category_id: 1,
      isbn,
      publication_year: parseInt(publication_year, 10) || new Date().getFullYear(),
      publisher: publisher || "University Academic Press",
      edition: edition || "1st Edition",
      shelf_location,
      call_number: call_number || `LIB.${Math.floor(100 + Math.random() * 900)}`,
      total_copies: copies,
      available_copies: copies,
      description: description || "No summary provided.",
      cover_url: cover_url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80",
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t: string) => t.trim()) : ['catalog'])
    });

    res.status(201).json({ success: true, book: newBook, message: "Book record added to library collection." });
  });

  app.put('/api/books/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const updated = db.updateBook(id, req.body);
    if (!updated) return res.status(404).json({ error: "Book not found." });
    res.json({ success: true, book: updated, message: "Book record updated successfully." });
  });

  app.delete('/api/books/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const deleted = db.deleteBook(id);
    if (!deleted) return res.status(404).json({ error: "Book not found." });
    res.json({ success: true, message: "Book removed from catalog." });
  });

  // 3. CIRCULATION OPERATIONS (BORROW, RETURN, RENEW, RESERVE)
  app.post('/api/borrow', (req, res) => {
    const { bookId, memberId } = req.body;
    if (!bookId || !memberId) {
      return res.status(400).json({ error: "bookId and memberId are required." });
    }
    const result = db.borrowBook(parseInt(bookId, 10), parseInt(memberId, 10));
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json(result);
  });

  app.post('/api/return', (req, res) => {
    const { borrowingId } = req.body;
    if (!borrowingId) {
      return res.status(400).json({ error: "borrowingId is required." });
    }
    const result = db.returnBook(parseInt(borrowingId, 10));
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json(result);
  });

  app.post('/api/renew', (req, res) => {
    const { borrowingId, memberId } = req.body;
    if (!borrowingId || !memberId) {
      return res.status(400).json({ error: "borrowingId and memberId are required." });
    }
    const result = db.renewBook(parseInt(borrowingId, 10), parseInt(memberId, 10));
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json(result);
  });

  app.post('/api/reserve', (req, res) => {
    const { bookId, memberId } = req.body;
    if (!bookId || !memberId) {
      return res.status(400).json({ error: "bookId and memberId are required." });
    }
    const result = db.reserveBook(parseInt(bookId, 10), parseInt(memberId, 10));
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json(result);
  });

  // 4. DASHBOARDS
  app.get('/api/student/dashboard/:memberId', (req, res) => {
    const memberId = parseInt(req.params.memberId, 10);
    const data = db.getStudentDashboard(memberId);
    if (!data) return res.status(404).json({ error: "Student not found." });
    res.json(data);
  });

  app.get('/api/librarian/dashboard', (_req, res) => {
    const data = db.getLibrarianDashboard();
    res.json(data);
  });

  app.post('/api/librarian/pay-fine', (req, res) => {
    const { borrowingId } = req.body;
    const ok = db.payFine(parseInt(borrowingId, 10));
    if (!ok) return res.status(404).json({ error: "Loan not found." });
    res.json({ success: true, message: "Fine marked as paid." });
  });

  // 5. AI CHATBOT ROUTE
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history, memberId } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Message is required." });
      }

      const response = await processLibraryChat(message, history || [], memberId);
      res.json(response);
    } catch (err: any) {
      console.error("Chat error:", err);
      res.status(500).json({
        reply: "I encountered a temporary issue querying the library database. Please ask the front desk librarian for immediate assistance.",
        isFallback: true
      });
    }
  });

  // 6. ANNOUNCEMENTS & POLICIES
  app.get('/api/announcements', (_req, res) => {
    res.json({ announcements: db.getState().announcements });
  });

  // 7. DATABASE & SQL SCRIPT EXPORT (FOR COLLEGE DEMO & DEPLOYMENT)
  app.get('/api/database/sql-schema', (_req, res) => {
    const schemaPath = path.resolve(__dirname, 'server', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf-8');
      res.json({ sql, filename: "snjb_coe_library_system.sql" });
    } else {
      res.status(404).json({ error: "SQL schema file not found." });
    }
  });

  app.post('/api/database/reset', (_req, res) => {
    db.resetToSample();
    res.json({ success: true, message: "Database reset to verified sample records." });
  });

  // 8. VITE MIDDLEWARE OR STATIC SERVING
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Library Assistant Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
