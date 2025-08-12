export class ChatEntity {
  constructor(
    public readonly id: number,
    public readonly sender_type: string,
    public readonly sender_id: number,
    public readonly receiver_type: string,
    public readonly receiver_id: number,
    public readonly message: string,
    public readonly created_at: Date
  ) {}
}
