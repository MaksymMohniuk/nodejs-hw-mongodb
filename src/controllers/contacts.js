import {
  createContact,
  getAllContacts,
  getContactById,
  upsertContact,
  deleteContact,
} from '../services/contacts.js';
import createHttpError from 'http-errors';
import { parsedPaginationParams } from '../utils/parsePaginationParams.js';

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsedPaginationParams(req.query);
  const contacts = await getAllContacts({ page, perPage });
  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactByIdController = async (req, res, next) => {
  const id = req.params.contactId;
  const contact = await getContactById(id);

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
  const { body } = req;
  const contact = await createContact(body);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: contact,
  });
};

export const patchContactController = async (req, res, next) => {
  const { body } = req;
  const { contactId } = req.params;
  const result = await upsertContact(contactId, body);
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
  const contact = await deleteContact(contactId);

  if (!contact) {
    const error = createHttpError(404, 'Contact not found');
    next(error);
    return;
  }
  res.status(204).send();
};
