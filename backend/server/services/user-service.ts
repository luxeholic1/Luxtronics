import { Db, ObjectId } from 'mongodb';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { MongoUser } from '../models/mongo-models';

export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  orders: Array<{
    id: string;
    date: string;
    amount: string;
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  }>;
  createdAt: string;
  updatedAt: string;
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString('hex');
}

function toPublicUser(user: MongoUser & { _id: ObjectId }): PublicUser {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    orders: user.orders || [],
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export class UserService {
  constructor(private readonly db: Db) {}

  private usersCollection() {
    return this.db.collection<MongoUser>('users');
  }

  private sessionsCollection() {
    return this.db.collection('user_sessions');
  }

  async registerUser(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ token: string; user: PublicUser }> {
    const email = normalizeEmail(payload.email);
    const existing = await this.usersCollection().findOne({ email });
    if (existing) {
      throw new Error('User already exists with this email');
    }

    const now = new Date();
    const salt = randomBytes(16).toString('hex');
    const passwordHash = hashPassword(payload.password, salt);

    const userDoc: MongoUser = {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email,
      passwordHash,
      passwordSalt: salt,
      phone: payload.phone?.trim() || undefined,
      orders: [],
      createdAt: now,
      updatedAt: now,
    };

    const insertResult = await this.usersCollection().insertOne(userDoc);
    const savedUser = await this.usersCollection().findOne({ _id: insertResult.insertedId });

    if (!savedUser) {
      throw new Error('Failed to create user');
    }

    const token = await this.createSession(insertResult.insertedId);
    return { token, user: toPublicUser({ ...savedUser, _id: insertResult.insertedId }) };
  }

  async loginUser(email: string, password: string): Promise<{ token: string; user: PublicUser }> {
    const normalizedEmail = normalizeEmail(email);
    const user = await this.usersCollection().findOne({ email: normalizedEmail });

    if (!user || !user._id) {
      throw new Error('Invalid email or password');
    }

    const expectedHash = Buffer.from(user.passwordHash, 'hex');
    const providedHash = Buffer.from(hashPassword(password, user.passwordSalt), 'hex');

    if (expectedHash.length !== providedHash.length || !timingSafeEqual(expectedHash, providedHash)) {
      throw new Error('Invalid email or password');
    }

    const token = await this.createSession(user._id);
    return { token, user: toPublicUser(user as MongoUser & { _id: ObjectId }) };
  }

  async getUserByToken(token: string): Promise<PublicUser | null> {
    const session = await this.sessionsCollection().findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!session || !session.userId) {
      return null;
    }

    const userId = session.userId instanceof ObjectId ? session.userId : new ObjectId(session.userId);
    const user = await this.usersCollection().findOne({ _id: userId });
    if (!user || !user._id) {
      return null;
    }

    return toPublicUser(user as MongoUser & { _id: ObjectId });
  }

  async updateUserByToken(
    token: string,
    updates: { firstName?: string; lastName?: string; phone?: string }
  ): Promise<PublicUser> {
    const session = await this.sessionsCollection().findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!session || !session.userId) {
      throw new Error('Unauthorized');
    }

    const userId = session.userId instanceof ObjectId ? session.userId : new ObjectId(session.userId);

    const updateDoc: Partial<MongoUser> = {
      updatedAt: new Date(),
    };

    if (updates.firstName !== undefined) {
      updateDoc.firstName = updates.firstName.trim();
    }
    if (updates.lastName !== undefined) {
      updateDoc.lastName = updates.lastName.trim();
    }
    if (updates.phone !== undefined) {
      updateDoc.phone = updates.phone.trim();
    }

    await this.usersCollection().updateOne(
      { _id: userId },
      { $set: updateDoc }
    );

    const updatedUser = await this.usersCollection().findOne({ _id: userId });
    if (!updatedUser || !updatedUser._id) {
      throw new Error('User not found');
    }

    return toPublicUser(updatedUser as MongoUser & { _id: ObjectId });
  }

  async logout(token: string): Promise<void> {
    await this.sessionsCollection().deleteOne({ token });
  }

  private async createSession(userId: ObjectId): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

    await this.sessionsCollection().insertOne({
      token,
      userId,
      createdAt: now,
      expiresAt,
    });

    return token;
  }
}
