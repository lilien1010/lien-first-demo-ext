// @ts-check
// src/index.js

/**
 * Runs the billing address function
 * @param {Object} input - GraphQL query response
 * @returns {Object} - Function result with operations
 */
export function run(input) {
  const { cart } = input;
  console.log('cart', cart);
  // Get customer from cart
  const customer = cart?.buyerIdentity?.customer;
  if (!customer) {
    console.log('No customer found');
    return { operations: [] };
  }

  try {
    // Get billing address from metafields
    // const lastBillingAddress = getLastBillingAddressFromMetafields(customer);
    
    // if (!lastBillingAddress) {
    //   console.log('No saved billing address found');
    //   return { operations: [] };
    // }

    // Return the fill operation
    return {
      operations: [{
        fill: {
          address: {
            type: "BILLING",
            address: {
              firstName: 'liam',
              lastName: 'smith',
              address1: '123 main st',
              address2: 'apt 1',
              city: 'Singapore',
              country: 'Singapore',
              zip: '533867'
            }
          }
        }
      }]
    };

  } catch (error) {
    console.error('Error in billing address function:', error);
    return { operations: [] };
  }
}

/**
 * Extract billing address from customer metafields
 * @param {Object} customer - Customer object from GraphQL
 * @returns {Object|null} - Billing address or null
 */
function getLastBillingAddressFromMetafields(customer) {
  console.log('customer', customer);  
  try { 

    if (!customer.metafield) {
      return null;
    }

    // Parse the stored address
    const storedAddress = JSON.parse(billingMetafield.value);
    
    // Validate required fields
    if (!isValidAddress(storedAddress)) {
      console.error('Invalid stored address format');
      return null;
    }

    return storedAddress;
  } catch (error) {
    console.error('Error parsing stored billing address:', error);
    return null;
  }
}

/**
 * Validate address object
 * @param {Object} address - Address to validate
 * @returns {boolean} - Whether address is valid
 */
function isValidAddress(address) {
  const requiredFields = [
    'firstName',
    'lastName',
    'address1',
    'address2',
    'city',
    'country',
    'zip'
  ];

  return requiredFields.every(field => {
    const value = address[field];
    return value && typeof value === 'string' && value.trim() !== '';
  });
}