import {
  createContact,
  getAllContacts,
  getContactById,
  upsertContact,
  deleteContact,
} from '../services/contacts.js';
import createHttpError from 'http-errors';
import { parsedPaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { env } from '../utils/env.js';

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsedPaginationParams(req.query);
  const { sortOrder, sortBy } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);
  const contacts = await getAllContacts({
    page,
    perPage,
    sortOrder,
    sortBy,
    filter,
    userId: req.user._id,
  });
  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactByIdController = async (req, res, next) => {
  const id = req.params.contactId;
  const contact = await getContactById(id, req.user._id);

  if (!contact) {
    const error = createHttpError(404, 'Contact not found', {
      data: { message: 'Contact not found' },
    });
    next(error);
    return;
  }

  res.json({
    status: 200,
    message: `Successfully found contact with id ${id}!`,
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  const { body, user } = req;
  const photo = req.file;
  let photoUrl = await saveFileToCloudinary(photo);
  const contact = await createContact(
    {
      ...body,
      photo: photoUrl,
    },
    user._id,
  );

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: contact,
  });
};

export const patchContactController = async (req, res, next) => {
  const { body, user } = req;
  const { contactId } = req.params;
  const photo = req.file;
  let photoUrl = await saveFileToCloudinary(photo);
  if (photo) {
    if (env('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }
  const result = await upsertContact(contactId, user._id, {
    ...body,
    photo: photoUrl,
  });
  if (!result) {
    const error = createHttpError(404, 'Contact not found', {
      data: { message: 'Contact not found' },
    });
    next(error);
    return;
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: result,
  });
};

export const deleteContactController = async (req, res, next) => {
  const { contactId } = req.params;
  const { user } = req;
  const contact = await deleteContact(contactId, user._id);

  if (!contact) {
    const error = createHttpError(404, 'Contact not found');
    next(error);
    return;
  }
  res.status(204).send();
};
