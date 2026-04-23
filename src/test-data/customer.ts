export type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export const createCustomer = (): Customer => {
  const seed = Date.now();

  return {
    firstName: 'QA',
    lastName: `Architect${seed}`,
    email: `qa.architect.${seed}@example.com`,
    password: `SpreeDemo!${seed}`
  };
};
