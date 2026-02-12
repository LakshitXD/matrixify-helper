/**
 * Shopify metafield types for Matrixify CSV column format.
 * @see https://shopify.dev/docs/apps/build/custom-data/metafields/list-of-data-types
 */
export const SHOPIFY_METAFIELD_TYPES = [
  "single_line_text_field",
  "multi_line_text_field",
  "rich_text_field",
  "number_integer",
  "number_decimal",
  "boolean",
  "date",
  "date_time",
  "url",
  "json",
  "color",
  "dimension",
  "volume",
  "weight",
  "rating",
  "money",
  "file_reference",
  "list.single_line_text_field",
  "list.multi_line_text_field",
  "list.rich_text_field",
  "list.number_integer",
  "list.number_decimal",
  "list.boolean",
  "list.date",
  "list.date_time",
  "list.url",
  "list.color",
  "list.dimension",
  "list.volume",
  "list.weight",
  "list.rating",
  "list.file_reference",
  "list.product_reference",
  "list.variant_reference",
  "list.page_reference",
  "list.collection_reference",
  "product_reference",
  "variant_reference",
  "page_reference",
  "collection_reference",
] as const;

export type ShopifyMetafieldType = (typeof SHOPIFY_METAFIELD_TYPES)[number];

export type MetafieldDef = {
  namespace: string;
  key: string;
  type: string;
  /** Optional: map from existing CSV column header */
  mapFromColumn?: string;
};

/**
 * Matrixify CSV column format for metafields: "Metafield: namespace.key [type]"
 */
export function toMatrixifyHeader(namespace: string, key: string, type: string): string {
  const n = (namespace || "custom").trim();
  const k = (key || "key").trim();
  const t = (type || "single_line_text_field").trim();
  return `Metafield: ${n}.${k} [${t}]`;
}
