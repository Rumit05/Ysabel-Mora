import { useApi, reactExtension, Text, BlockStack } from '@shopify/ui-extensions-react/checkout'; // Added BlockStack
import { useEffect, useState } from 'react';

// Define your GraphQL query
const ORDER_QUERY = `#graphql
  query GetOrder($orderId: ID!) {
    node(id: $orderId) {
      ... on Order {
        id
        name
        email
        totalPrice {
          amount
          currencyCode
        }
        lineItems(first: 10) {
          edges {
            node {
              title
              quantity
            }
          }
        }
      }
    }
  }
`;

export default reactExtension('purchase.thank-you.block.render', () => <ThankYouExtension />);

function ThankYouExtension() {
  // We no longer need the dynamic orderId from useApi(), but we still need the query function
  const { query } = useApi(); 
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define the fixed order ID
  const fixedOrderId = "gid://shopify/Order/6505968271565";

  useEffect(() => {
    // Check if query is available
    if (!query) return;

    const fetchOrder = async () => {
      try {
        // Fetch the order data using the query method, passing the fixed ID
        const result = await query(ORDER_QUERY, {
          variables: { orderId: fixedOrderId }, // Correctly assign the fixed ID to the orderId variable
        });

        if (result.errors) {
          throw new Error(result.errors.map(e => e.message).join(', '));
        }

        setOrderData(result.data.node);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [query]); // Only re-run if 'query' changes (which it won't)

  if (loading) return <Text>Loading order details...</Text>;
  if (error) return <Text appearance="critical">Error: {error}</Text>;
  if (!orderData) return null;

  return (
    <BlockStack>
      <Text>Order Name: {orderData.name}</Text>
      <Text>Total Price: {orderData.totalPrice.amount} {orderData.totalPrice.currencyCode}</Text>
      {/* Render other details */}
    </BlockStack>
  );
}



/*

import {
  reactExtension,
  BlockStack,
  Text,
  useExtensionApi
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

export default reactExtension("purchase.thank-you.block.render", () => <ThankYou />);

function ThankYou() {
  const { orderConfirmation, query } = useExtensionApi();
  const order = orderConfirmation.current.order;

  const [orderDetails, setOrderDetails] = useState(null);

  const orderId = order.id;   // This is correct
  const createdAt = order.createdAt;

  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        const { data } = await query(
          `query ($id: ID!) {
            order(id: $id) {
              id
              name
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              lineItems(first: 50) {
                edges {
                  node {
                    title
                    quantity
                  }
                }
              }
            }
          }`,
          {
          variables: { id: "gid://shopify/Order/6505968271565" }
          }
        );
                console.log("Fetched Order Detwwwails:", data);


        setOrderDetails(data?.order); // Correct data reference
        console.log("Fetched Order Details:", data);
      } catch (error) {
        console.error("Order Fetch Error:", error);
      }
    }

    fetchOrderDetails();
  }, [orderId, query]);

  return (
    <BlockStack spacing="base">
      <Text size="large" emphasis="bold">Thank you for your purchase!</Text>

      <Text>Order ID: {orderId}</Text>
      <Text>Created At: {createdAt}</Text>

      {orderDetails && (
        <BlockStack spacing="tight">
          <Text size="medium" emphasis="bold">Items Purchased:</Text>
          {orderDetails.lineItems.edges.map(({ node }, index) => (
            <Text key={index}>
              {node.title} × {node.quantity}
            </Text>
          ))}
        </BlockStack>
      )}
    </BlockStack>
  );
}
  */
