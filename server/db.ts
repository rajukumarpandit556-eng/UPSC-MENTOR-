import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';
import type { Conversation, Message, SavedDoubt, User } from '../src/types';

const DATA_DIR = path.join(process.cwd(), '.data');
const LOCAL_DB_PATH = path.join(DATA_DIR, 'upsc_mentor_store.json');

const AUTH_SECRET = process.env.AUTH_SECRET || 'upsc_mentor_default_secret_2026';

interface LocalStore {
  users: Array<User & { passwordHash: string; salt: string }>;
  conversations: Conversation[];
  messages: Message[];
  savedDoubts: SavedDoubt[];
}

let pgPool: pg.Pool | null = null;
let usePostgres = false;

// In-memory / file cache
let localStore: LocalStore = {
  users: [],
  conversations: [],
  messages: [],
  savedDoubts: [],
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadLocalStore(): LocalStore {
  ensureDataDir();
  if (fs.existsSync(LOCAL_DB_PATH)) {
    try {
      const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.warn('Could not read local JSON store, initializing fresh store:', err);
    }
  }
  return {
    users: [],
    conversations: [],
    messages: [],
    savedDoubts: [],
  };
}

function saveLocalStore() {
  ensureDataDir();
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(localStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write local store to disk:', err);
  }
}

// Initial seed data for foundational UPSC concepts
function seedInitialData() {
  if (localStore.savedDoubts.length === 0) {
    const demoDoubt: SavedDoubt = {
      id: 'demo-art-32',
      question: 'Why does Article 32 itself constitute a Fundamental Right, unlike ordinary legal remedies?',
      subject: 'Polity',
      mode: 'normal',
      directAnswer:
        'Article 32 is a Fundamental Right (Right to Constitutional Remedies) under Part III, meaning the right to move the Supreme Court for enforcement of Fundamental Rights is itself guaranteed, not a mere statutory discretion.',
      hinglishExplanation:
        'Article 32 sirf ek court jane ka procedure nahi hai, balki khud ek Fundamental Right hai. Iska matlab yeh hai ki agar aapke Part III rights violate hote hain, toh Supreme Court aapko sunne se mana nahi kar sakti.',
      technicalExplanation:
        'Under Article 32, the right to approach the Supreme Court is guaranteed under Part III. Dr. B.R. Ambedkar termed Article 32 as the "Heart and Soul of the Constitution". While Article 226 gives High Courts discretionary writ powers for any purpose, Article 32 is non-discretionary for Fundamental Rights violation.',
      whyAndHow:
        'Without a guaranteed enforcement mechanism, Part III declarations would be mere moral exhortations (declaratory). By making the remedy itself a Fundamental Right, the framers placed the Supreme Court as the "Protector and Guarantor" of Fundamental Rights.',
      example:
        'In Romesh Thappar v. State of Madras (1950), the Supreme Court ruled that it cannot refuse an application under Article 32 on the ground that the petitioner should first approach the High Court under Article 226.',
      upscConnection: {
        syllabusPaper: 'GS Paper II: Indian Constitution — Historical Underpinnings, Evolution, Features, Amendments, Significant Provisions',
        relevance: 'Frequently tested in Prelims (direct statements on Article 32 vs 226) and Mains (judiciary & constitutional remedies).',
      },
      commonTraps: [
        'UPSC Trap: Claiming High Courts under Art 226 have narrower writ jurisdiction than Supreme Court under Art 32. In reality, Art 226 has wider territorial and subject-matter scope (FRs + other legal rights).',
        'UPSC Trap: Assuming Art 32 can be invoked to challenge ordinary violations of statutory law without infringing a Fundamental Right.',
      ],
      upscTakeaway: [
        'Art 32 is itself a Fundamental Right (Part III); Art 226 is a constitutional right (Part VI) but NOT a Fundamental Right.',
        'Art 32 remedy is guaranteed; Art 226 remedy is discretionary.',
        'Art 32 scope is limited exclusively to Fundamental Rights; Art 226 extends to FRs and "any other purpose" (statutory/legal rights).',
        'The Supreme Court is designated as the guarantor and protector of Fundamental Rights.',
      ],
      sources: [
        {
          title: 'Constitution of India — Article 32 & Article 226',
          organization: 'Ministry of Law and Justice / Legislative Department',
          url: 'https://legislative.gov.in/constitution-of-india/',
          verified: true,
          excerpt: 'Article 32(1): The right to move the Supreme Court by appropriate proceedings for the enforcement of the rights conferred by this Part is guaranteed.',
        },
        {
          title: 'Romesh Thappar v. The State of Madras (1950 SCR 594)',
          organization: 'Supreme Court of India',
          verified: true,
          excerpt: 'The Supreme Court is established as a protector and guarantor of fundamental rights and cannot refuse to entertain applications seeking protection.',
        },
      ],
      isMastered: false,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };
    localStore.savedDoubts.push(demoDoubt);
    saveLocalStore();
  }
}

export async function initDb() {
  localStore = loadLocalStore();
  seedInitialData();

  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && dbUrl.trim() !== '') {
    try {
      pgPool = new pg.Pool({
        connectionString: dbUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      });
      // Test connection
      const client = await pgPool.connect();
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          salt TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS conversations (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64),
          title TEXT NOT NULL,
          subject VARCHAR(64) NOT NULL,
          mode VARCHAR(64) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS messages (
          id VARCHAR(64) PRIMARY KEY,
          conversation_id VARCHAR(64) REFERENCES conversations(id) ON DELETE CASCADE,
          role VARCHAR(32) NOT NULL,
          content TEXT NOT NULL,
          doubt_type VARCHAR(64),
          structured_data JSONB,
          sources JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS saved_doubts (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64),
          conversation_id VARCHAR(64),
          question TEXT NOT NULL,
          subject VARCHAR(64) NOT NULL,
          mode VARCHAR(64) NOT NULL,
          direct_answer TEXT NOT NULL,
          hinglish_explanation TEXT,
          technical_explanation TEXT,
          why_and_how TEXT,
          example TEXT,
          upsc_connection JSONB,
          common_traps JSONB,
          upsc_takeaway JSONB,
          sources JSONB,
          is_mastered BOOLEAN DEFAULT FALSE,
          review_count INT DEFAULT 0,
          last_reviewed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      client.release();
      usePostgres = true;
      console.log('Successfully connected to PostgreSQL and initialized tables.');
    } catch (err) {
      console.warn('Could not connect to PostgreSQL DATABASE_URL. Falling back smoothly to local file persistence:', err);
      usePostgres = false;
    }
  } else {
    console.log('No DATABASE_URL supplied; using robust local file store (.data/upsc_mentor_store.json)');
  }
}

// Password hashing with crypto
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return { hash, salt: actualSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const checkHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(checkHash, 'hex'));
}

export function createToken(payload: { id: string; email: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const data = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(`${header}.${data}`).digest('base64url');
  return `${header}.${data}.${signature}`;
}

export function verifyToken(token: string): { id: string; email: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, data, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(`${header}.${data}`).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    return { id: payload.id, email: payload.email };
  } catch {
    return null;
  }
}

// User CRUD
export async function createUser(name: string, email: string, passwordPlain: string): Promise<User> {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const { hash, salt } = hashPassword(passwordPlain);
  const id = 'usr_' + crypto.randomUUID().slice(0, 12);
  const createdAt = new Date().toISOString();

  if (usePostgres && pgPool) {
    await pgPool.query(
      'INSERT INTO users (id, name, email, password_hash, salt, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, name, email.toLowerCase().trim(), hash, salt, createdAt]
    );
  } else {
    localStore.users.push({
      id,
      name,
      email: email.toLowerCase().trim(),
      passwordHash: hash,
      salt,
      createdAt,
    });
    saveLocalStore();
  }

  return { id, name, email: email.toLowerCase().trim(), createdAt };
}

export async function findUserByEmail(email: string): Promise<(User & { passwordHash: string; salt: string }) | null> {
  const cleanEmail = email.toLowerCase().trim();
  if (usePostgres && pgPool) {
    const res = await pgPool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      salt: row.salt,
      createdAt: row.created_at.toISOString(),
    };
  } else {
    const u = localStore.users.find((user) => user.email === cleanEmail);
    return u || null;
  }
}

export async function findUserById(id: string): Promise<User | null> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      createdAt: row.created_at.toISOString(),
    };
  } else {
    const u = localStore.users.find((user) => user.id === id);
    if (!u) return null;
    return { id: u.id, name: u.name, email: u.email, createdAt: u.createdAt };
  }
}

// Conversation CRUD
export async function createConversation(conv: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Conversation> {
  const id = 'conv_' + crypto.randomUUID().slice(0, 12);
  const now = new Date().toISOString();
  const newConv: Conversation = {
    id,
    userId: conv.userId,
    title: conv.title,
    subject: conv.subject,
    mode: conv.mode,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };

  if (usePostgres && pgPool) {
    await pgPool.query(
      'INSERT INTO conversations (id, user_id, title, subject, mode, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, conv.userId || null, conv.title, conv.subject, conv.mode, now, now]
    );
  } else {
    localStore.conversations.unshift(newConv);
    saveLocalStore();
  }

  return newConv;
}

export async function getConversations(userId?: string): Promise<Conversation[]> {
  if (usePostgres && pgPool) {
    let query = 'SELECT * FROM conversations';
    const params: any[] = [];
    if (userId) {
      query += ' WHERE user_id = $1 OR user_id IS NULL';
      params.push(userId);
    }
    query += ' ORDER BY updated_at DESC';
    const res = await pgPool.query(query, params);
    return res.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      subject: row.subject,
      mode: row.mode,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    }));
  } else {
    return localStore.conversations
      .filter((c) => !userId || !c.userId || c.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
}

export async function getConversationWithMessages(conversationId: string): Promise<Conversation | null> {
  if (usePostgres && pgPool) {
    const cRes = await pgPool.query('SELECT * FROM conversations WHERE id = $1', [conversationId]);
    if (cRes.rows.length === 0) return null;
    const cRow = cRes.rows[0];
    const mRes = await pgPool.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversationId]
    );
    const messages: Message[] = mRes.rows.map((m) => ({
      id: m.id,
      conversationId: m.conversation_id,
      role: m.role,
      content: m.content,
      doubtType: m.doubt_type,
      structuredData: m.structured_data,
      sources: m.sources,
      createdAt: m.created_at.toISOString(),
    }));
    return {
      id: cRow.id,
      userId: cRow.user_id,
      title: cRow.title,
      subject: cRow.subject,
      mode: cRow.mode,
      createdAt: cRow.created_at.toISOString(),
      updatedAt: cRow.updated_at.toISOString(),
      messages,
    };
  } else {
    const conv = localStore.conversations.find((c) => c.id === conversationId);
    if (!conv) return null;
    const messages = localStore.messages.filter((m) => m.conversationId === conversationId);
    return { ...conv, messages };
  }
}

export async function addMessage(msg: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
  const id = 'msg_' + crypto.randomUUID().slice(0, 12);
  const now = new Date().toISOString();
  const newMsg: Message = {
    id,
    conversationId: msg.conversationId,
    role: msg.role,
    content: msg.content,
    doubtType: msg.doubtType,
    structuredData: msg.structuredData,
    sources: msg.sources,
    createdAt: now,
  };

  if (usePostgres && pgPool) {
    await pgPool.query(
      'INSERT INTO messages (id, conversation_id, role, content, doubt_type, structured_data, sources, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        id,
        msg.conversationId,
        msg.role,
        msg.content,
        msg.doubtType || null,
        JSON.stringify(msg.structuredData || null),
        JSON.stringify(msg.sources || []),
        now,
      ]
    );
    await pgPool.query('UPDATE conversations SET updated_at = $1 WHERE id = $2', [now, msg.conversationId]);
  } else {
    localStore.messages.push(newMsg);
    const conv = localStore.conversations.find((c) => c.id === msg.conversationId);
    if (conv) {
      conv.updatedAt = now;
    }
    saveLocalStore();
  }

  return newMsg;
}

export async function deleteConversation(conversationId: string): Promise<boolean> {
  if (usePostgres && pgPool) {
    await pgPool.query('DELETE FROM conversations WHERE id = $1', [conversationId]);
    return true;
  } else {
    localStore.conversations = localStore.conversations.filter((c) => c.id !== conversationId);
    localStore.messages = localStore.messages.filter((m) => m.conversationId !== conversationId);
    saveLocalStore();
    return true;
  }
}

// Saved Doubts CRUD
export async function saveDoubt(doubt: Omit<SavedDoubt, 'id' | 'createdAt' | 'reviewCount'>): Promise<SavedDoubt> {
  const id = 'dbt_' + crypto.randomUUID().slice(0, 12);
  const now = new Date().toISOString();
  const newDoubt: SavedDoubt = {
    ...doubt,
    id,
    reviewCount: 0,
    isMastered: false,
    createdAt: now,
  };

  if (usePostgres && pgPool) {
    await pgPool.query(
      `INSERT INTO saved_doubts (
        id, user_id, conversation_id, question, subject, mode, direct_answer,
        hinglish_explanation, technical_explanation, why_and_how, example,
        upsc_connection, common_traps, upsc_takeaway, sources, is_mastered, review_count, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
      [
        id,
        doubt.userId || null,
        doubt.conversationId || null,
        doubt.question,
        doubt.subject,
        doubt.mode,
        doubt.directAnswer,
        doubt.hinglishExplanation || null,
        doubt.technicalExplanation || null,
        doubt.whyAndHow || null,
        doubt.example || null,
        JSON.stringify(doubt.upscConnection || null),
        JSON.stringify(doubt.commonTraps || []),
        JSON.stringify(doubt.upscTakeaway || []),
        JSON.stringify(doubt.sources || []),
        false,
        0,
        now,
      ]
    );
  } else {
    localStore.savedDoubts.unshift(newDoubt);
    saveLocalStore();
  }

  return newDoubt;
}

export async function getSavedDoubts(userId?: string): Promise<SavedDoubt[]> {
  if (usePostgres && pgPool) {
    let query = 'SELECT * FROM saved_doubts';
    const params: any[] = [];
    if (userId) {
      query += ' WHERE user_id = $1 OR user_id IS NULL';
      params.push(userId);
    }
    query += ' ORDER BY created_at DESC';
    const res = await pgPool.query(query, params);
    return res.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      conversationId: r.conversation_id,
      question: r.question,
      subject: r.subject,
      mode: r.mode,
      directAnswer: r.direct_answer,
      hinglishExplanation: r.hinglish_explanation,
      technicalExplanation: r.technical_explanation,
      whyAndHow: r.why_and_how,
      example: r.example,
      upscConnection: r.upsc_connection,
      commonTraps: r.common_traps,
      upscTakeaway: r.upsc_takeaway,
      sources: r.sources,
      isMastered: r.is_mastered,
      reviewCount: r.review_count,
      lastReviewedAt: r.last_reviewed_at ? r.last_reviewed_at.toISOString() : undefined,
      createdAt: r.created_at.toISOString(),
    }));
  } else {
    return localStore.savedDoubts
      .filter((d) => !userId || !d.userId || d.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export async function updateSavedDoubt(id: string, updates: Partial<SavedDoubt>): Promise<SavedDoubt | null> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('SELECT * FROM saved_doubts WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const cur = res.rows[0];
    const isMastered = updates.isMastered !== undefined ? updates.isMastered : cur.is_mastered;
    const reviewCount = updates.reviewCount !== undefined ? updates.reviewCount : cur.review_count;
    const lastReviewedAt = updates.lastReviewedAt ? new Date(updates.lastReviewedAt) : cur.last_reviewed_at;

    await pgPool.query(
      'UPDATE saved_doubts SET is_mastered = $1, review_count = $2, last_reviewed_at = $3 WHERE id = $4',
      [isMastered, reviewCount, lastReviewedAt, id]
    );
    const updated = await pgPool.query('SELECT * FROM saved_doubts WHERE id = $1', [id]);
    const r = updated.rows[0];
    return {
      id: r.id,
      userId: r.user_id,
      conversationId: r.conversation_id,
      question: r.question,
      subject: r.subject,
      mode: r.mode,
      directAnswer: r.direct_answer,
      hinglishExplanation: r.hinglish_explanation,
      technicalExplanation: r.technical_explanation,
      whyAndHow: r.why_and_how,
      example: r.example,
      upscConnection: r.upsc_connection,
      commonTraps: r.common_traps,
      upscTakeaway: r.upsc_takeaway,
      sources: r.sources,
      isMastered: r.is_mastered,
      reviewCount: r.review_count,
      lastReviewedAt: r.last_reviewed_at ? r.last_reviewed_at.toISOString() : undefined,
      createdAt: r.created_at.toISOString(),
    };
  } else {
    const doubt = localStore.savedDoubts.find((d) => d.id === id);
    if (!doubt) return null;
    Object.assign(doubt, updates);
    saveLocalStore();
    return doubt;
  }
}

export async function deleteSavedDoubt(id: string): Promise<boolean> {
  if (usePostgres && pgPool) {
    await pgPool.query('DELETE FROM saved_doubts WHERE id = $1', [id]);
    return true;
  } else {
    localStore.savedDoubts = localStore.savedDoubts.filter((d) => d.id !== id);
    saveLocalStore();
    return true;
  }
}
