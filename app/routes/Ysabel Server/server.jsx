export async function paymentMethodNameChange(graphql) {
  const response = await graphql(`
    mutation {
      paymentCustomizationCreate(
        paymentCustomization: {
          title: "Change Payment Method Name "
          enabled: true
          functionId: "0d61c018-9b37-46a0-b759-6a0fec1f9bae"
        }
      ) {
        paymentCustomization {
          id
        }
        userErrors {
          message
        }
      }
    }
  `);
  return response.json();
}
