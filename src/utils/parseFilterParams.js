const parseContactType = (type) => {
  const isString = typeof type === 'string';
  if (!isString) return;
  const isType = (type) => ['work', 'home', 'personal'].includes(type);
  if (isType(type)) return type;
};

const parseBoolean = (isFavourite) => {
  if (typeof isFavourite === 'boolean') return isFavourite;
  if (typeof isFavourite === 'string') {
    if (isFavourite.toLowerCase() === 'true') return true;
    if (isFavourite.toLowerCase() === 'false') return false;
  }
};

export const parseFilterParams = (query) => {
  const { contactType, isFavourite } = query;
  const parsedType = parseContactType(contactType);
  const parsedIsFavourite = parseBoolean(isFavourite);

  return { contactType: parsedType, isFavourite: parsedIsFavourite };
};
