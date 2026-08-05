// Formatting + delivery helpers now live in the shared @abdmall/core package
// (used by web and mobile). Re-exported here so existing "@/lib/format"
// imports keep working unchanged.
export {
  formatNaira,
  discountPercent,
  compactCount,
  deliveryFor,
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
} from "@abdmall/core";
