export class CardEntity {
  constructor(
    public readonly id: number,
    public readonly user_id: number | null,
    public readonly card_holder_name: string | null,
    public readonly exp_date_month: string | null,
    public readonly exp_date_year: string | null,
    public readonly formated_card_no: string | null,
    public readonly token: string | null,
    public readonly status: boolean,
    public readonly is_default: boolean,
    public readonly card_type: string | null
  ) {}
}
