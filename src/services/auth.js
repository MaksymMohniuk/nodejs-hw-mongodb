import createHttpError from 'http-errors';
import { usersCollection } from '../db/user.js';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { sessionsCollection } from '../db/session.js';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env.js';
import { sendEmail } from '../utils/sendEmail.js';
import { JWT_SECRET, SMTP } from '../constants/index.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export const registerUser = async (payload) => {
  const user = await usersCollection.findOne({ email: payload.email });
  if (user) {
    throw createHttpError(409, 'Email in use');
  }
  const encryptedPassword = await bcrypt.hash(payload.password, 10);
  return await usersCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

export const loginUser = async (payload) => {
  const user = await usersCollection.findOne({ email: payload.email });
  if (!user) {
    throw createHttpError(401, 'User is not found');
  }
  const isEqual = await bcrypt.compare(payload.password, user.password);
  if (!isEqual) {
    throw createHttpError(401, 'Unauthorized');
  }
  await sessionsCollection.deleteOne({ userId: user._id });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return await sessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  });
};

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  };
};

export const refreshUsersSession = async ({ refreshToken }) => {
  const session = await sessionsCollection.findOne({
    refreshToken,
  });

  if (!session) {
    throw createHttpError('401', 'Session is not found!');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError('401', 'Session token is expired!');
  }

  const newSession = createSession();

  await sessionsCollection.deleteOne({ refreshToken });

  return await sessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const logoutUser = async (refreshToken) => {
  await sessionsCollection.deleteOne({ refreshToken });
};

export const requestResetToken = async (email) => {
  const user = await usersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User is not found');
  }
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    env(JWT_SECRET),
    { expiresIn: '15m' },
  );
  try {
    await sendEmail({
      to: email,
      from: env(SMTP.SMTP_USER),
      subject: 'Reset your password',
      html: `<p>Click <a href="${env(
        SMTP.APP_DOMAIN,
      )}/reset-password?token=${resetToken}">here</a> to reset your password!</p>`,
    });
  } catch (err) {
    console.log(err);
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};

export const resetPassword = async (payload) => {
  let entries;
  try {
    entries = jwt.verify(payload.token, env(JWT_SECRET));
  } catch (err) {
    if (err instanceof Error)
      throw createHttpError(401, 'Token is expired or invalid.');
    throw err;
  }

  const user = await usersCollection.findOne({
    email: entries.email,
    _id: entries.sub,
  });

  if (!user) {
    throw createHttpError(404, 'User is not found');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  await usersCollection.findOneAndUpdate(
    { _id: user._id },
    { password: encryptedPassword },
  );
};
