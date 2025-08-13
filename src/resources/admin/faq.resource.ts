export const formatFaq = (faq: any) => ({
  id: faq.id,
  question: faq.question,
  answer: faq.answer,
  status: faq.status,
  created_at: faq.created_at,
});

export const formatFaqList = (faqs: any[]) => faqs.map(formatFaq);
