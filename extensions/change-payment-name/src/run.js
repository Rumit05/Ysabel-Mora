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
  // Extract the language ISO code and normalize it (e.g., pt-PT -> PT_PT)
  const locale = input.localization?.language?.isoCode || 'EN';
  const normalizedLocale = locale.toUpperCase().replace("-", "_");

  // Hardcoded include names for matching the payment method to rename
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

  // Fallback translations if metafield is not set
  const translations = {
    EN: {
      paymentMethodName: "Other local payment methods",
    },
    ES: {
      paymentMethodName: "Otros métodos de pago locales",
    },
    FR: {
      paymentMethodName: "Vous pouvez également payer via les moyens de paiement locaux disponibles.",
    },
    IT: {
      paymentMethodName: "Altri metodi di pago locali",
    },
    PT_PT: {
      paymentMethodName: "Outros métodos de pagamento locais",
    },
  };

  // Get translations from shop metafield
  const metafieldValue = input.shop?.metafield?.value;
  
  // Try to get fallback from hardcoded translations using normalized locale
  let translatedName = translations[normalizedLocale]?.paymentMethodName || 
                       translations[normalizedLocale.split("_")[0]]?.paymentMethodName || 
                       translations['EN']?.paymentMethodName || 
                       "Other local payment methods";

  if (metafieldValue) {
    try {
      // The metafield is a list of strings: ["ES : Value", "FR : Value"]
      const translationList = JSON.parse(metafieldValue);
      if (Array.isArray(translationList)) {
        // Find the entry that matches the current locale
        // Format: "LOCALE : Value"
        const entry = translationList.find(t => {
          const parts = t.split(":");
          if (parts.length < 2) return false;
          // Normalize the key in the metafield string (e.g., PT-PT -> PT_PT)
          const key = parts[0].trim().toUpperCase().replace("-", "_");
          return key === normalizedLocale || key === normalizedLocale.split("_")[0];
        });

        if (entry) {
          const parts = entry.split(":");
          translatedName = parts.slice(1).join(":").trim();
        } else {
          // Fallback: search for EN in the list if current locale not found
          const enEntry = translationList.find(t => t.trim().toUpperCase().startsWith("EN :"));
          if (enEntry) {
            const parts = enEntry.split(":");
            translatedName = parts.slice(1).join(":").trim();
          }
        }
      }
    } catch (e) {
      console.error("Error parsing metafield translation value:", e);
    }
  }

  // Log the current locale and translated name for debugging
  console.log(`Locale: ${locale}, Normalized: ${normalizedLocale}, Translated Name: ${translatedName}`);

  // Find the payment method to rename
  // We use the normalized locale (e.g., PT_PT) to look up the matching string
  const nameToMatch = changeName[normalizedLocale]?.paymentMethodNameInclude || 
                      changeName[normalizedLocale.split("_")[0]]?.paymentMethodNameInclude;

  const changePaymentMethodName = input.paymentMethods
    .find(method => nameToMatch && method.name.includes(nameToMatch));

  // Log the matching payment method for debugging
  if (changePaymentMethodName) {
    console.log(`Matched Payment Method: ${changePaymentMethodName.name}`);
  } else {
    console.log(`No matching payment method found for name like: ${nameToMatch}`);
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
