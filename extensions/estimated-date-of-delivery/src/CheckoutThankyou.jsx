import {
  reactExtension,
  BlockStack,
  Text,
  Banner,
  useExtensionApi,
  useApi
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

export default reactExtension("purchase.thank-you.block.render", () => <ThankYou />);

function ThankYou() {
  const { orderConfirmation } = useExtensionApi();
  const { settings } = useApi();

  const orderIdInfo = orderConfirmation.current.order.id;     
  const orderId = orderIdInfo.replace("OrderIdentity","Order");    
  console.log(orderId,"orderId111orderId")

  const orderNumber = orderConfirmation.current.number;

  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const response = await fetch(
          "https://brainboxinfoway.in/ysabelmora/estimated-date-of-delivery.php",
          {
            method: "POST",
            body: JSON.stringify({ orderId }),
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = await response.json();
        console.log("Order Data:", data);

        setOrderDetails(data);
      } catch (err) {
        console.error("Order fetch error", err);
      }
    }

    fetchDetails();
  }, [orderId]);

  // Business days logic
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

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  let finalMessage = null;

  const deliveryRange = settings.current?.date_of_delivery_range || "";
  const deliveryText = settings.current?.date_of_delivery_text || "";
  const createdAt = orderDetails?.data?.order?.createdAt;


  if ( deliveryRange.includes("-") && deliveryText && createdAt) {
    const [minDays, maxDays] = deliveryRange.split("-").map((n) => parseInt(n.trim(), 10));

    const firstDate = addBusinessDays(createdAt, minDays);
    const secondDate = addBusinessDays(createdAt, maxDays);

    finalMessage = deliveryText.replace("{first_date}", formatDate(firstDate)).replace("{second_date}", formatDate(secondDate));
  }

  return (
    <BlockStack spacing="base">

      {finalMessage ? (
        <Banner title="Estimated Delivery">
          <Text>{finalMessage}</Text>
        </Banner>
      ) : (
        <Banner title="Estimated Delivery (Setup Required)" status="warning">
          Unable to calculate delivery date. Please check app settings.
        </Banner>
      )}

      {orderDetails?.lineItems && (
        <BlockStack spacing="tight">
          <Text size="medium" emphasis="bold">Items Purchased:</Text>
          {orderDetails.lineItems.map((item, i) => (
            <Text key={i}>
              {item.title} × {item.quantity}
            </Text>
          ))}
        </BlockStack>
      )}
    </BlockStack>
  );
}
