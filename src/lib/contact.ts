export const CONTACT = {
  email: "masonthebestmason@gmail.com",
  phoneDisplay: "7940 1279",
  phoneIntl: "+35679401279",
  whatsapp: "35679401279",
};

export function whatsappLink(message: string) {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
}