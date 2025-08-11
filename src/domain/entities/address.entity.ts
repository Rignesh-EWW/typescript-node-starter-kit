export class AddressEntity {
  constructor(
    public readonly id: number,
    public readonly user_id: number | null,
    public readonly address_type: string,
    public readonly full_address: string | null,
    public readonly lat: string | null,
    public readonly lng: string | null,
    public readonly house_number: string | null,
    public readonly status: boolean,
    public readonly is_default: boolean
  ) {}
}
