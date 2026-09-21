import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  initDb,
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  createToken,
  verifyToken,
  createConversation,
  getConversations,
  getConversationWithMessages,
  addMessage,
  deleteConversation,
  saveDoubt,
  getSavedDoubts,
  updateSavedDoubt,
  deleteSavedDoubt,
} from './server/db';
import { solveDoubt, analyzePYQ, evaluateMains } from './server/ai';
import type { StudyMode, Subject } from './src/types';

dotenv.config();

const PORT = 3000;
const app = express();

// Simple in-memory rate limiter
const requestCounts = new Map<string, { count: number; resetAt: number }>();
function rateLimit(limit: number = 60, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    const now = Date.now();
    const entry = requestCounts.get(ip);
    if (!entry || now > entry.resetAt) {
      requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (entry.count >= limit) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please wait a moment before sending more requests.',
      });
    }
    entry.count++;
    next();
  };
}

// Middleware
app.use(express.json({ limit: '5mb' }));
app.use(rateLimit(120, 60000));

// Auth extractor helper
async function authenticateOptional(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) return null;
  return await findUserById(payload.id);
}

// API Routes
// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'UPSC Mentor API',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
  });
});

// 2. Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }
    const user = await createUser(name.trim(), email.trim(), password);
    const token = createToken({ id: user.id, email: user.email });
    res.json({ token, user });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Failed to sign up.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = await findUserByEmail(email.trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = createToken({ id: user.id, email: user.email });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Login failed.' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const user = await authenticateOptional(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
});

// Demo Guest login for zero-friction testing
app.post('/api/auth/guest', async (req, res) => {
  try {
    const guestEmail = `aspirant_${Math.random().toString(36).substring(2, 8)}@upscmentor.internal`;
    const user = await createUser('Aspirant (Demo)', guestEmail, 'demo_aspirant_2026');
    const token = createToken({ id: user.id, email: user.email });
    res.json({ token, user });
  } catch (err: any) {
    res.status(500).json({ error: 'Guest login initialization failed.' });
  }
});

// 3. Doubt Solver / Conversation API
app.post('/api/doubts/ask', async (req, res) => {
  try {
    const { question, subject = 'Polity', mode = 'normal', conversationId } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question content cannot be empty.' });
    }

    const user = await authenticateOptional(req);
    let convId = conversationId;
    let priorHistory: { role: 'user' | 'assistant'; content: string }[] = [];

    // If conversationId is supplied, fetch existing conversation & message history
    if (convId) {
      const existingConv = await getConversationWithMessages(convId);
      if (existingConv && existingConv.messages) {
        priorHistory = existingConv.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
      }
    } else {
      // Create new conversation
      const title = question.trim().length > 60 ? question.trim().slice(0, 57) + '...' : question.trim();
      const newConv = await createConversation({
        userId: user?.id,
        title,
        subject: subject as Subject,
        mode: mode as StudyMode,
      });
      convId = newConv.id;
    }

    // Save user's message to DB
    const userMessage = await addMessage({
      conversationId: convId,
      role: 'user',
      content: question.trim(),
    });

    // Run real AI doubt solving with conversation context
    const structuredResponse = await solveDoubt(
      question.trim(),
      subject as Subject,
      mode as StudyMode,
      priorHistory
    );

    // Save assistant's response to DB
    const assistantMessage = await addMessage({
      conversationId: convId,
      role: 'assistant',
      content: structuredResponse.directAnswer,
      doubtType: structuredResponse.doubtType,
      structuredData: structuredResponse,
      sources: structuredResponse.verification?.sources || [],
    });

    const fullConv = await getConversationWithMessages(convId);

    res.json({
      conversation: fullConv,
      userMessage,
      assistantMessage,
      structuredResponse,
    });
  } catch (err: any) {
    console.error('Error in /api/doubts/ask:', err);
    res.status(500).json({ error: err?.message || 'Failed to process doubt.' });
  }
});

app.get('/api/conversations', async (req, res) => {
  try {
    const user = await authenticateOptional(req);
    const conversations = await getConversations(user?.id);
    res.json({ conversations });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve conversations.' });
  }
});

app.get('/api/conversations/:id', async (req, res) => {
  try {
    const conv = await getConversationWithMessages(req.params.id);
    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }
    res.json({ conversation: conv });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve conversation.' });
  }
});

app.delete('/api/conversations/:id', async (req, res) => {
  try {
    await deleteConversation(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete conversation.' });
  }
});

// 4. PYQ Lab API
app.post('/api/pyq/analyze', async (req, res) => {
  try {
    const { pyq, year = '2023', subject = 'Polity', examType = 'Prelims', selectedOption, studentReasoning } = req.body;
    if (!pyq || !pyq.trim()) {
      return res.status(400).json({ error: 'PYQ text is required.' });
    }

    const analysis = await analyzePYQ({
      pyq: pyq.trim(),
      year: year.toString(),
      subject: subject as Subject,
      examType: examType === 'Mains' ? 'Mains' : 'Prelims',
      selectedOption: selectedOption?.trim(),
      studentReasoning: studentReasoning?.trim() || '',
    });

    res.json({ analysis });
  } catch (err: any) {
    console.error('Error in /api/pyq/analyze:', err);
    res.status(500).json({ error: err?.message || 'PYQ analysis failed.' });
  }
});

// 5. Mains Lab API
app.post('/api/mains/evaluate', async (req, res) => {
  try {
    const { question, gsPaper = 'GS 2', year = '2024', wordLimit = 250, studentAnswer } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Mains question is required.' });
    }
    if (!studentAnswer || !studentAnswer.trim()) {
      return res.status(400).json({ error: 'Student answer is required for evaluation.' });
    }

    const evaluation = await evaluateMains({
      question: question.trim(),
      gsPaper,
      year: year.toString(),
      wordLimit: Number(wordLimit) || 250,
      studentAnswer: studentAnswer.trim(),
    });

    res.json({ evaluation });
  } catch (err: any) {
    console.error('Error in /api/mains/evaluate:', err);
    res.status(500).json({ error: err?.message || 'Mains answer evaluation failed.' });
  }
});

// 6. Saved Doubts (Revision System)
app.get('/api/saved-doubts', async (req, res) => {
  try {
    const user = await authenticateOptional(req);
    const doubts = await getSavedDoubts(user?.id);
    res.json({ doubts });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve saved doubts.' });
  }
});

app.post('/api/saved-doubts', async (req, res) => {
  try {
    const user = await authenticateOptional(req);
    const {
      question,
      subject = 'Polity',
      mode = 'normal',
      directAnswer,
      hinglishExplanation,
      technicalExplanation,
      whyAndHow,
      example,
      upscConnection,
      commonTraps,
      upscTakeaway = [],
      sources = [],
      conversationId,
    } = req.body;

    if (!question || !directAnswer) {
      return res.status(400).json({ error: 'Question and direct answer are required to save a doubt.' });
    }

    const saved = await saveDoubt({
      userId: user?.id,
      conversationId,
      question: question.trim(),
      subject: subject as Subject,
      mode: mode as StudyMode,
      directAnswer: directAnswer.trim(),
      hinglishExplanation,
      technicalExplanation,
      whyAndHow,
      example,
      upscConnection,
      commonTraps,
      upscTakeaway,
      sources,
    });

    res.json({ savedDoubt: saved });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save doubt.' });
  }
});

app.patch('/api/saved-doubts/:id', async (req, res) => {
  try {
    const { isMastered, reviewCount, lastReviewedAt } = req.body;
    const updated = await updateSavedDoubt(req.params.id, {
      isMastered,
      reviewCount,
      lastReviewedAt: lastReviewedAt || new Date().toISOString(),
    });
    if (!updated) {
      return res.status(404).json({ error: 'Saved doubt not found.' });
    }
    res.json({ savedDoubt: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update saved doubt.' });
  }
});

app.delete('/api/saved-doubts/:id', async (req, res) => {
  try {
    await deleteSavedDoubt(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete saved doubt.' });
  }
});

// Catch-all for API 404
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

async function startServer() {
  await initDb();

  // Mount Vite or static server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UPSC Mentor server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
