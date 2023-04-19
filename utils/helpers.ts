export const encodeString = (value: string) => {
  let encodedValue = "";

  for (let i = 0; i < value.length; i++) {
    encodedValue = `${encodedValue}${value.charCodeAt(i)}`;
  }

  return parseInt(encodedValue);
};
