// @ts-check

// Use JSDoc annotations for type safety
/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

// The configured entrypoint for the 'purchase.payment-customization.run' extension target
/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  // Extract the language ISO code
  const locale = input.localization?.language?.isoCode || 'EN'; // Default to 'EN' if no localization

  const changeName = {
    EN: {
      paymentMethodNameInclude: "Pay by card or other payment methods",
    },
    ES: {
      paymentMethodNameInclude: "Pagar con tarjeta u otros métodos de pago",
    },
    FR: {
      paymentMethodNameInclude: "Payer par carte ou autres méthodes",
    },
    IT: {
      paymentMethodNameInclude: "Paga con carta o altri metodi",
    },
    PT_PT: {
      paymentMethodNameInclude: "Pague com cartão ou outros métodos",
    },
    // Add more languages if needed
  };

  // Example: Translation object (can be extended or imported from JSON)
  const translations = {
    EN: {
      paymentMethodName: "Other local payment methods",
    },
    ES: {
      paymentMethodName: "Otros métodos de pago locales",
    },
    FR: {
      paymentMethodName: "Autres méthodes de paiement locales",
    },
    IT: {
      paymentMethodName: "Altri metodi di pago locali",
    },
    PT_PT: {
      paymentMethodName: "Outros métodos de pagamento locais", // Corrected translation for PT
    },
    // Add more languages if needed
  };

  // Get translated payment method name based on the locale
  const translatedName = translations[locale]?.paymentMethodName || translations['EN'].paymentMethodName;

  // Log the current locale and translated name for debugging
  console.log(`Locale: ${locale}, Translated Name: ${translatedName}`);

  // Find the payment method to rename
  const changePaymentMethodName = input.paymentMethods
    .find(method => method.name.includes(changeName[locale]?.paymentMethodNameInclude));

  // Log the matching payment method for debugging
  if (changePaymentMethodName) {
    console.log(`Matched Payment Method: ${changePaymentMethodName.name}`);
  } else {
    console.log("No matching payment method found.");
  }

  if (!changePaymentMethodName) {
    return NO_CHANGES;
  }

  return {
    operations: [{
      rename: {
        paymentMethodId: changePaymentMethodName.id,
        name: translatedName
      }
    }]
  };
}
