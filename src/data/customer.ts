export type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export const createCustomer = (variant: 'Standard' | 'Premium' | 'Regression'): Customer => {
  // Use a timestamp so every run gets a unique account on the demo store.
  const seed = Date.now();
  const variantLabel = variant.toLowerCase();

  if (variant === 'Regression') {
    return {
      firstName: 'Regression',
      lastName: `QA-${seed}`,
      email: `regression.qa.${seed}@example.com`,
      password: `SpreeDemo!${seed}`
    };
  }

  return {
    firstName: 'QAUser',
    lastName: `${variant}-${seed}`,
    email: `qauser.${variantLabel}.${seed}@example.com`,
    password: `SpreeDemo!${seed}`
  };
};
