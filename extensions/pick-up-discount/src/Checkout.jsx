import {
  reactExtension,
  Banner,
  BlockStack,
  Checkbox,
  Text,
  useApi,
  useApplyAttributeChange,
  useInstructions,
  useTranslate,
  useShippingAddress,
  useApplyShippingAddressChange,
  useCheckoutToken,
} from "@shopify/ui-extensions-react/checkout";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

// fetch address data from  api, ipify.org is mock api
async function fetchAddressData(token) {
  try {
    const response = await fetch('https://api.ipify.org/?format=json&callback=' + token);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json(); 
    return data; 
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

function Extension() {
  const translate = useTranslate();
  const instructions = useInstructions();
  const applyAttributeChange = useApplyAttributeChange();

  const token = useCheckoutToken(); 
  console.log("token", token);
  const shippingAddress = useShippingAddress();
  const applyShippingAddressChange = useApplyShippingAddressChange();


  // 2. Check instructions for feature availability, see https://shopify.dev/docs/api/checkout-ui-extensions/apis/cart-instructions for details
  if (!instructions.attributes.canUpdateAttributes) {
    // For checkouts such as draft order invoices, cart attributes may not be allowed
    // Consider rendering a fallback UI or nothing at all, if the feature is unavailable
    return (
      <Banner title="pick-up-discount" status="warning">
        Use this extension to pickup to apply discount
      </Banner>
    );
  }
  fetchAddressData(token).then(obj => { 
  console.log("ip obj=", obj,shippingAddress);
  const remoteAddress = obj.ip
    // Assuming the API returns updated address information
    const updatedAddress = {
      ...shippingAddress,
      // Update fields based on API response
      address1: remoteAddress,
      city: obj.city || shippingAddress.city,
      zip: '533867',
      last_name: 'Lien',
      first_name: 'Li',
      // Add other fields as necessary
    };

    if (shippingAddress.address1 !== remoteAddress) {
      // Apply the updated shipping address
      applyShippingAddressChange({
        type: 'updateShippingAddress',
        address: updatedAddress,
      }).then(result => {
        console.log("applyShippingAddressChange result", result);
      });
    }
  });
  // 3. Render a UI
  return (
    <BlockStack border={"dotted"} padding={"tight"}>
      <Banner title="pick-up-discount">
        <Text emphasis="italic">Lien‘s Shop  </Text>
      </Banner>
      <Checkbox onChange={onCheckboxChange}>
        {translate("iWouldLikeAFreeGiftWithMyOrder")}
      </Checkbox>
    </BlockStack>
  );

  async function onCheckboxChange(isChecked) {
    // 4. Call the API to modify checkout
    const result = await applyAttributeChange({
      key: "requestedFreeGift",
      type: "updateAttribute",
      value: isChecked ? "yes" : "no",
    });
    console.log("applyAttributeChange result", result);
  }
}