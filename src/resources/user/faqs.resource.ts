export const formatFaqsResponse = (data: any[]) => {
  return data.map((item) => ({
    question: item.question,
    answer: item.answer,
  }));
};
