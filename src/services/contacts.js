import { Contact } from '../db/Contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortOrder = 'asc',
  sortBy = '_id',
  filter = {},
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;
  const contactsQuery = Contact.find();
  const { type, isFavourite } = parseFilterParams(filter);
  if (type !== null && type !== undefined) {
    contactsQuery.where('type').equals(type);
  }
  if (isFavourite !== null && isFavourite !== undefined) {
    contactsQuery.where('isFavourite').equals(isFavourite);
  }
  const contactsCount = await Contact.countDocuments();
  const contacts = await contactsQuery
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder })
    .exec();
  const paginationData = calculatePaginationData(contactsCount, page, perPage);

  return {
    data: contacts,
    ...paginationData,
  };
};

export const getContactById = async (id) => {
  return await Contact.findById(id);
};

export const createContact = async (payload) => {
  const contact = await Contact.create(payload);
  return contact;
};

export const upsertContact = async (id, payload) => {
  const contact = await Contact.findByIdAndUpdate(id, payload);
  return contact;
};

export const deleteContact = async (contactId) => {
  const contact = await Contact.findOneAndDelete({ _id: contactId });
  return contact;
};
