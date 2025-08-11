export const formatAppLinkResponse = (data: any[]) => {
  return data.map((item) => ({
    name: item.name,
    show_name: item.show_name,
    for: item.for,
    type: item.type,
    value: item.value,
  }));
};
