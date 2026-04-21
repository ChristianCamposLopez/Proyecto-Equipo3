import { db } from "@/config/db";

export type DeliveryAddress = {
  id: number;
  customer_id: number;
  street: string;
  exterior_number: string;
  interior_number: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  postal_code: string;
  references: string | null;
  created_at: string;
  updated_at: string;
};

export type DeliveryAddressInput = {
  street?: unknown;
  exteriorNumber?: unknown;
  interiorNumber?: unknown;
  neighborhood?: unknown;
  city?: unknown;
  state?: unknown;
  postalCode?: unknown;
  references?: unknown;
};

export type DeliveryAddressSnapshot = {
  street: string;
  exteriorNumber: string;
  interiorNumber: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  postalCode: string;
  references: string | null;
};

function cleanRequired(value: unknown, fieldName: string): string {
  const text = typeof value === "string" ? value.trim() : "";

  if (!text) {
    throw new Error(`${fieldName} es obligatorio`);
  }

  return text;
}

function cleanOptional(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();
  return text || null;
}

export function normalizeDeliveryAddressInput(input: DeliveryAddressInput): DeliveryAddressSnapshot {
  const postalCode = cleanRequired(input.postalCode, "El código postal");

  if (!/^\d{5}$/.test(postalCode)) {
    throw new Error("El código postal debe tener 5 dígitos");
  }

  return {
    street: cleanRequired(input.street, "La calle"),
    exteriorNumber: cleanRequired(input.exteriorNumber, "El número"),
    interiorNumber: cleanOptional(input.interiorNumber),
    neighborhood: cleanOptional(input.neighborhood),
    city: cleanRequired(input.city, "La ciudad"),
    state: cleanRequired(input.state, "El estado"),
    postalCode,
    references: cleanOptional(input.references),
  };
}

export async function listDeliveryAddresses(customerId: number): Promise<DeliveryAddress[]> {
  const result = await db.query(
    `SELECT
        id,
        customer_id,
        street,
        exterior_number,
        interior_number,
        neighborhood,
        city,
        state,
        postal_code,
        delivery_references AS references,
        created_at,
        updated_at
      FROM delivery_addresses
      WHERE customer_id = $1
      ORDER BY updated_at DESC, id DESC`,
    [customerId]
  );

  return result.rows as DeliveryAddress[];
}

export async function createDeliveryAddress(customerId: number, input: DeliveryAddressInput) {
  const address = normalizeDeliveryAddressInput(input);
  const result = await db.query(
    `INSERT INTO delivery_addresses (
        customer_id,
        street,
        exterior_number,
        interior_number,
        neighborhood,
        city,
        state,
        postal_code,
        delivery_references
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
    [
      customerId,
      address.street,
      address.exteriorNumber,
      address.interiorNumber,
      address.neighborhood,
      address.city,
      address.state,
      address.postalCode,
      address.references,
    ]
  );

  return result.rows[0] as DeliveryAddress;
}

export async function updateDeliveryAddress(customerId: number, addressId: number, input: DeliveryAddressInput) {
  const address = normalizeDeliveryAddressInput(input);
  const result = await db.query(
    `UPDATE delivery_addresses
      SET street = $1,
          exterior_number = $2,
          interior_number = $3,
          neighborhood = $4,
          city = $5,
          state = $6,
          postal_code = $7,
          delivery_references = $8,
          updated_at = NOW()
      WHERE id = $9 AND customer_id = $10
      RETURNING *`,
    [
      address.street,
      address.exteriorNumber,
      address.interiorNumber,
      address.neighborhood,
      address.city,
      address.state,
      address.postalCode,
      address.references,
      addressId,
      customerId,
    ]
  );

  if (!result.rows[0]) {
    throw new Error("Dirección de entrega no encontrada");
  }

  return result.rows[0] as DeliveryAddress;
}

export async function getDeliveryAddressSnapshot(customerId: number, addressId: number) {
  const result = await db.query(
    `SELECT
        street,
        exterior_number,
        interior_number,
        neighborhood,
        city,
        state,
        postal_code,
        delivery_references AS references
      FROM delivery_addresses
      WHERE id = $1 AND customer_id = $2`,
    [addressId, customerId]
  );

  const address = result.rows[0];
  if (!address) {
    throw new Error("Selecciona una dirección de entrega válida");
  }

  return {
    street: address.street,
    exteriorNumber: address.exterior_number,
    interiorNumber: address.interior_number,
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
    postalCode: address.postal_code,
    references: address.references,
  } satisfies DeliveryAddressSnapshot;
}
