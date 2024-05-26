import { Contact } from '../db/Contact.js';

export const getAllContacts = async () => {
  return await Contact.find({});
};
