/**
 * Ingresar dirección de entrega
 * Pruebas unitarias sobre validación y persistencia.
 */

const mockDbQuery = jest.fn();

jest.mock("@/config/db", () => ({
  db: {
    query: (...args: unknown[]) => mockDbQuery(...args),
  },
}));

import {
  createDeliveryAddress,
  normalizeDeliveryAddressInput,
} from "@/lib/deliveryAddresses";

describe("Ingresar dirección de entrega", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("normaliza una dirección válida y conserva los campos requeridos", () => {
    const normalized = normalizeDeliveryAddressInput({
      street: "  Av. Universidad ",
      exteriorNumber: " 1200 ",
      interiorNumber: " 4B ",
      neighborhood: " Xoco ",
      city: " Ciudad de México ",
      state: " CDMX ",
      postalCode: "03330",
      references: " Frente al parque ",
    });

    expect(normalized).toEqual({
      street: "Av. Universidad",
      exteriorNumber: "1200",
      interiorNumber: "4B",
      neighborhood: "Xoco",
      city: "Ciudad de México",
      state: "CDMX",
      postalCode: "03330",
      references: "Frente al parque",
    });
  });

  it("rechaza códigos postales que no tienen 5 dígitos", () => {
    expect(() =>
      normalizeDeliveryAddressInput({
        street: "Calle 5",
        exteriorNumber: "22",
        city: "Puebla",
        state: "Puebla",
        postalCode: "72A0",
      })
    ).toThrow("El código postal debe tener 5 dígitos");
  });

  it("guarda una dirección válida con los datos ya normalizados", async () => {
    mockDbQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 30,
          customer_id: 8,
          street: "Calle 5",
          exterior_number: "22",
          interior_number: null,
          neighborhood: "Centro",
          city: "Puebla",
          state: "Puebla",
          postal_code: "72000",
          references: null,
        },
      ],
    });

    const created = await createDeliveryAddress(8, {
      street: " Calle 5 ",
      exteriorNumber: " 22 ",
      neighborhood: " Centro ",
      city: " Puebla ",
      state: " Puebla ",
      postalCode: "72000",
    });

    expect(mockDbQuery).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO delivery_addresses"),
      [8, "Calle 5", "22", null, "Centro", "Puebla", "Puebla", "72000", null]
    );
    expect(created.id).toBe(30);
  });
});
