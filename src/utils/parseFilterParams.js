const parseContactType = (type) => {
  const isString = typeof type === 'string';
  if (!isString) return;
  const isType = (type) => ['work', 'home', 'personal'].includes(type);
  if (isType(type)) return type;
};

const parseBoolean = (isFavourite) => {
  if (typeof isFavourite !== 'boolean') return;
  return isFavourite;
};

export const parseFilterParams = (query) => {
  const { type, isFavourite } = query;
  const parsedType = parseContactType(type);
  const parsedIsFavourite = parseBoolean(isFavourite);

  return { type: parsedType, isFavourite: parsedIsFavourite };
};
