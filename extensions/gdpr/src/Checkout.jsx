import {
  reactExtension,
  useApi,
  useSettings,
  useBuyerJourneyIntercept,
  useLanguage,
  useApplyAttributeChange,
  Checkbox,
  Link,
  Text,
} from "@shopify/ui-extensions-react/checkout";
import { useState, useEffect } from "react";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const settings = useSettings();
  const { isoCode } = useLanguage();
  const [checked, setChecked] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Determine language suffix (e.g. 'es', 'en')
  // isoCode is usually like 'en-US' or 'en'
  const languageSuffix = isoCode?.split("-")[0]?.toLowerCase() || "en";

  // Get localized text and link strings from settings
  const textKey = `gdpr_text_${languageSuffix}`;
  const linkKey = `gdpr_link_${languageSuffix}`;
  
  // Fallbacks
  const text = String(settings[textKey] || settings[`gdpr_text_en`] || "");
  const linkSettings = String(settings[linkKey] || settings[`gdpr_link_en`] || "");

  // Parse URLs
  const getUrls = (linkStr) => {
    const urls = {};
    if (!linkStr) return urls;
    
    const lines = linkStr.split(/[\r\n]+/);
    lines.forEach(line => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex > 0) {
        const key = line.slice(0, separatorIndex).trim();
        const urlMatch = line.slice(separatorIndex + 1).match(/(https?:\/\/[^\s]+)/);
        if (key && urlMatch) {
          urls[key] = urlMatch[1];
        }
      }
    });
    
    return urls;
  };

  const urls = getUrls(linkSettings);

  // Block checkout
  // Block checkout
  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    const isRequired = settings.gdpr_checkbox === true || settings.gdpr_checkbox === "true";
    
    // Alert the developer/merchant if blocking is required but not allowed by the context
    if (isRequired && !canBlockProgress) {
      console.error("GDPR Extension Error: Blocking is enabled in settings but 'canBlockProgress' is false. Please enable 'Allow app to block checkout' in the Checkout Editor under 'Checkout behavior'.");
    }

    if (isRequired && canBlockProgress && !checked) {
      return {
        behavior: "block",
        reason: "Consent required",
        perform: (result) => {
           if (result.behavior === "block") {
             setValidationError("This field is required");
           }
        }
      };
    }
    return { behavior: "allow" };
  });

  useEffect(() => {
    if (checked) setValidationError("");
  }, [checked]);

  const renderContent = () => {
    if (!text) return null;
    
    const parts = text.split(/(\[[^\]]+\]|\([^)]+\))/g);

    return parts.map((part, index) => {
      const match = part.match(/^\[([^\]]+)\]$|^\(([^)]+)\)$/);
      if (match) {
        const rawKey = match[1] || match[2];
        const key = rawKey.trim();
        const url = urls[key] || urls[Object.keys(urls).find(k => k.toLowerCase() === key.toLowerCase())];
        
        if (url) {
          return (
            <Link key={index} to={url} external>
              {key}
            </Link>
          );
        }
      }
      return part;
    });
  };

  const applyAttributeChange = useApplyAttributeChange();

  const handleCheckboxChange = async (newChecked) => {
    setChecked(newChecked);
    
    // Check if storing values in the order is enabled
    const shouldStoreValue = settings.gdpr_value_checkbox === true || settings.gdpr_value_checkbox === "true";
    
    if (shouldStoreValue) {
      try {
        await applyAttributeChange({
          key: "GDPR",
          type: "updateAttribute",
          value: newChecked ? "true" : "false",
        });
      } catch (error) {
        console.error("Failed to update GDPR attribute", error);
      }
    }
  };

  return (
    <Checkbox 
      id="gdpr-checkbox"
      name="gdpr-checkbox"
      checked={checked} 
      onChange={handleCheckboxChange}
      error={validationError}
    >
      {renderContent()}
    </Checkbox>
  );
}
