import {useEffect, useState} from 'react';

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
    const response = await fetch('https://api.ipify.org/?format=json&22callback=' + token);
    
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

  const {query, shop} = useApi();
  const token = useCheckoutToken(); 
  console.log("token", token, {query, shop} );
  const applyShippingAddressChange = useApplyShippingAddressChange();
  const shippingAddress = useShippingAddress();
 /*
    Key talking points:
    1 - checkout admin API is becoming legacy, use checkout ui extension instead
    2 - as ui extension is in webworker, it has a different context, cannot get the url,cookie, cartID directly
    3 - have to use 3rd API to sync info between checkout and ui extension and 3rd API.

    Suggestion:
    1 - export cart ID to the ui extension, so can use it in ui extension
    2 - need to have graphql API of checkout API to replace rest API
      https://shopify.dev/docs/api/admin-rest/unstable/resources/checkout 
    3 -   
 */

  setTimeout(() => {
    // try to get remote address every 2 seconds to apply the changes

    fetchAddressData(token).then(remoteAddressObj => {  
    const remoteAddress = remoteAddressObj.address1 
      const updatedAddress = {
        ...remoteAddressObj,
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
  },2000)

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