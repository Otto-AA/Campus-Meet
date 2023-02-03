export const validateEmail = (email?: string): boolean =>
  !!email && /^\S+@\S+\.\S+$/.test(email);
