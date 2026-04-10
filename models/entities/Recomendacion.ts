// models/entities/Recomendacion.ts
export class Recomendacion {
  constructor(
    public id: number,
    public name: string,
    public descripcion: string,
    public base_price: string,
    public image_display: string,
    public score: number
  ) {}
}