import { Contact } from '../db/Contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortOrder = 'asc',
  sortBy = '_id',
  filter = {},
  userId,
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;
  const contactsQuery = Contact.find(userId);
  const { contactType, isFavourite } = parseFilterParams(filter);
  if (contactType !== null && contactType !== undefined) {
    contactsQuery.where('contactType').equals(contactType);
  }
  if (isFavourite !== null && isFavourite !== undefined) {
    contactsQuery.where('isFavourite').equals(isFavourite);
  }
  const contactsCount = await Contact.countDocuments(userId);
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

export const getContactById = async (id, userId) => {
  return await Contact.findById({ _id: id, userId });
};

export const createContact = async (payload, userId) => {
  const contact = await Contact.create({ ...payload, userId });
  return contact;
};

export const upsertContact = async (id, payload, userId) => {
  const contact = await Contact.findByIdAndUpdate(
    { _id: id, userId },
    payload,
    { new: true },
  );
  return contact;
};

export const deleteContact = async (contactId, userId) => {
  const contact = await Contact.findOneAndDelete({ _id: contactId, userId });
  return contact;
};
