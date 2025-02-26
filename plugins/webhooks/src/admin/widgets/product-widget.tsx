import { defineWidgetConfig } from "@medusajs/admin-sdk";

// The widget
const ProductWidget = () => {
  return (
    <div>
      <h2>Product Widget</h2>
    </div>
  );
};

// The widget's configurations
export const config = defineWidgetConfig({
  zone: "product.details.after",
});

export default ProductWidget;
