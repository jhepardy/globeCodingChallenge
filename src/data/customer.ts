export type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export const createCustomer = (variant: 'Standard' | 'Premium'): Customer => {
  // Use a timestamp so every run gets a unique account on the demo store.
  const seed = Date.now();
  const variantLabel = variant.toLowerCase();

  return {
    firstName: 'QAUser',
    lastName: `${variant}-${seed}`,
    email: `qauser.${variantLabel}.${seed}@example.com`,
    password: `SpreeDemo!${seed}`
  };
};
