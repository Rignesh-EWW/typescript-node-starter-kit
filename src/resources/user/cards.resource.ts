import { CardEntity } from "@/domain/entities/card.entity";
// export const formatCardResponse = (card: CardEntity) => ({
//   user_id: card.user_id,
//   card_holder_name: card.card_holder_name,
//   exp_date_month: card.exp_date_month,
//   exp_date_year: card.exp_date_year,
//   formated_card_no: card.formated_card_no,
//   token: card.token,
//   status: card.status,
//   is_default: card.is_default,
// });

// import { CardEntity } from "@/domain/entities/card.entity";
import { decrypt } from "@/utils/encryption";
export const formatCardResponse = (card: CardEntity) => ({
  id: card.id,
  user_id: card.user_id,
  card_holder_name: card.card_holder_name
    ? decrypt(card.card_holder_name)
    : null,
  exp_date_month: card.exp_date_month ? decrypt(card.exp_date_month) : null,
  exp_date_year: card.exp_date_year ? decrypt(card.exp_date_year) : null,
  formated_card_no: card.formated_card_no
    ? decrypt(card.formated_card_no)
    : null,
  token: card.token,
  status: card.status,
  is_default: card.is_default,
  card_type: card.card_type,
});

export const formatCardList = (list: CardEntity[]) =>
  list.map(formatCardResponse);
