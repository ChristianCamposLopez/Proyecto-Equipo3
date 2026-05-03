// models/entities/AddressEntity.ts
export interface DeliveryAddress {
  id: number;
  street: string;
  exterior_number: string;
  interior_number: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  postal_code: string;
  references: string | null;
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
