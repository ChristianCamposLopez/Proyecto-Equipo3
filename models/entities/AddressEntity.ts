// models/entities/AddressEntity.ts
export interface DeliveryAddress {
  id: number;
  customer_id: number;
  street: string;
  exterior_number: string;
  interior_number: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  postal_code: string;
  delivery_references: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AddressForm {
  street: string;
  exteriorNumber: string;
  interiorNumber: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  references: string;
}
