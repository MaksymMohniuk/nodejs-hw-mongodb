import createHttpError from 'http-errors';
import { sessionsCollection } from '../db/session.js';
import { usersCollection } from '../db/user.js';

export const authanticate = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    next(createHttpError(401, 'Please provide Authorization header'));
    return;
  }

  const bearer = authHeader.split(' ')[0];
  const token = authHeader.split(' ')[1];
  if (!bearer || !token) {
    next(createHttpError(401, 'Auth header should be of type Bearer'));
    return;
  }

  const session = await sessionsCollection.findOne({ accessToken: token });
  if (!session) {
    next(createHttpError(401, 'Session not found'));
    return;
  }
  const isAccessTokenExpired =
    new Date() > new Date(session.accessTokenValidUntil);
  if (!isAccessTokenExpired) {
    next(createHttpError(401, 'Access token expired!'));
    return;
  }

  const user = usersCollection.findById(session.userId);
  if (!user) {
    next(createHttpError(401, 'User is not found!'));
    return;
  }

  req.user = user;
  next();
};
