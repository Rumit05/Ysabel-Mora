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
  const { settings } = useApi();

  const dateOfDeliveryRange = settings.current?.date_of_delivery_range || "";
  const dateOfDeliveryText = settings.current?.date_of_delivery_text || "";

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

  const formatDate = (date) =>
  date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });


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
