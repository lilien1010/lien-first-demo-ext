import {
  reactExtension,
  Text,
  useApplyDiscountCodeChange,
  usePickupLocationOptionTarget,
} from '@shopify/ui-extensions-react/checkout';
 
// 1. Choose an extension target
export default reactExtension(
  'purchase.checkout.pickup-location-option-item.render-after',
  () => <Extension />,
);

function Extension() {
  const applyDiscountCode = useApplyDiscountCodeChange(); 
  const applyPickupDiscount = async () => {
    const result = await applyDiscountCode({
      type: 'addDiscountCode',
      code: 'DISCOUNT110'
    });
    console.log("applyPickupDiscount now", result);
  }

  const removePickupDiscount = async () => {
    const result = await applyDiscountCode({
      type: 'removeDiscountCode',
      code: 'DISCOUNT110'
    });
    console.log("removePickupDiscount now", result);
  }

  const {
    isTargetSelected,
    pickupLocationOptionTarget,
  } = usePickupLocationOptionTarget();

  const title = pickupLocationOptionTarget?.title;
  const type = pickupLocationOptionTarget?.type;
  // ref: https://community.shopify.com/c/extensions/checkout-extensibility-extension-ui-app-infinite-re-rendering/m-p/2426161


  console.log("instructions of delivery", {isTargetSelected, pickupLocationOptionTarget} );

  isTargetSelected && type === 'pickup' ? applyPickupDiscount() : removePickupDiscount();

  if (isTargetSelected) {
    return <Text>Choose a pickup location: {title}</Text>;
  }

  return null;
}