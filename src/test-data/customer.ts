export type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export const createCustomer = (): Customer => {
  // Use a timestamp so every run gets a unique account on the demo store.
  const seed = Date.now();

  return {
    firstName: 'QA',
    lastName: `Architect${seed}`,
    email: `qa.architect.${seed}@example.com`,
    password: `SpreeDemo!${seed}`
  };
};
