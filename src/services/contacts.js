import { Contact } from '../db/Contact.js';

export const getAllContacts = async () => {
  return await Contact.find({});
};

export const getContactById = async (id) => {
  return await Contact.findById(id);
};

export const createContact = async (payload) => {
  const contact = await Contact.create(payload);
  return contact;
};
