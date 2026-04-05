export const generateId = (prefix: string, existingIds: string[]): string => {
  let newIdNum = 1;
  while (existingIds.includes(`${prefix}${newIdNum.toString().padStart(3, '0')}`)) {
    newIdNum++;
  }
  return `${prefix}${newIdNum.toString().padStart(3, '0')}`;
};
