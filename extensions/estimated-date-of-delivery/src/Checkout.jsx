import {
  reactExtension,
  Banner,
  BlockStack,
  Text,
  useApi,
  useInstructions,
  useTranslate,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const { settings , localization } = useApi();
  const languageCode = localization.language.current.isoCode.split("-")[0];
  const esdateOfDeliveryText = settings.current.date_of_delivery_text_es?.trim() ?? "";
  const endateOfDeliveryText = settings.current.date_of_delivery_text_en?.trim() ?? "";
  const itdateOfDeliveryText = settings.current.date_of_delivery_text_it?.trim() ?? "";
  const frdateOfDeliveryText = settings.current.date_of_delivery_text_fr?.trim() ?? ""
  const ptdateOfDeliveryText = settings.current.date_of_delivery_text_pt?.trim() ?? ""

  let dateOfDeliveryText = "";
  if (languageCode === "es") {
    dateOfDeliveryText = esdateOfDeliveryText;
  } else if (languageCode === "en") {
    dateOfDeliveryText = endateOfDeliveryText;
  } else if (languageCode === "it") {
    dateOfDeliveryText = itdateOfDeliveryText;
  } else if (languageCode === "fr") {
    dateOfDeliveryText = frdateOfDeliveryText;
  } else if (languageCode === "pt") {
    dateOfDeliveryText = ptdateOfDeliveryText;
  }
  const dateOfDeliveryRange = settings.current?.date_of_delivery_range || "";

  // Prevent errors when settings not configured
  if (!dateOfDeliveryRange || !dateOfDeliveryRange.includes("-") || !dateOfDeliveryText) {
    return (
      <Banner title="Estimated Delivery (Setup Required)" status="warning">
        Please configure delivery range and message in the app settings.
      </Banner>
    );
  }

  // Parse & sanitize range safely
  const [minDays, maxDays] = dateOfDeliveryRange.split("-").map((n) => parseInt(n.trim(), 10));

  // Business-day calculation function
  function addBusinessDays(startDate, daysToAdd) {
    const date = new Date(startDate);
    while (daysToAdd > 0) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day !== 0 && day !== 6) {
        daysToAdd--;
      }
    }
    return date;
  }

  const today = new Date();
  const firstDate = addBusinessDays(today, minDays);
  const secondDate = addBusinessDays(today, maxDays);

  const formatDate = (date) => {
    const formatted = date.toLocaleDateString(languageCode, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return formatted.replace(/,/g, "");
  };


  // Replace placeholders safely
  const finalMessage = dateOfDeliveryText.replace("{first_date}", formatDate(firstDate)).replace("{second_date}", formatDate(secondDate));

  return (
    <BlockStack border={"dotted"} padding={"tight"}>
      <Banner title="Entrega estimada">
        <Text>{finalMessage}</Text>
      </Banner>
    </BlockStack>
  );
}
