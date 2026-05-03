// models/entities/RestaurantEntity.ts

export class RestaurantEntity {
  public id: number;
  public owner_user_id: number;
  public name: string;
  public logo_url?: string;
  public latitude?: number;
  public longitude?: number;
  public tax_id?: string;
  public is_active: boolean;

  constructor(
    id: number,
    owner_user_id: number,
    name: string,
    tax_id?: string,
    is_active: boolean = true,
    latitude?: number,
    longitude?: number,
    logo_url?: string
  ) {
    this.id = id;
    this.owner_user_id = owner_user_id;
    this.name = name;
    this.is_active = is_active;
    this.latitude = latitude;
    this.longitude = longitude;
    this.tax_id = tax_id;
    this.logo_url = logo_url;
  }
}

export interface RestaurantHours {
  id?: number;
  restaurant_id: number;
  day_of_week: number;
  open_time: string;
  close_time: string;
}
