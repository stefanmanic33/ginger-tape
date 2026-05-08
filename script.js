const WHATSAPP_NUMBER = "381658005557"; // Promeni broj ovde. Format: 381 + broj bez prve nule.

const form = document.getElementById("orderForm");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const data = {
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    address: document.getElementById("address").value.trim(),
    city: document.getElementById("city").value.trim(),
    product: document.getElementById("product").value,
    quantity: document.getElementById("quantity").value,
    payment: document.getElementById("payment").value,
    note: document.getElementById("note").value.trim(),
  };

  const message = [
    "Nova Ginger Tape porudžbina:",
    "",
    `Ime i prezime: ${data.name}`,
    `Telefon: ${data.phone}`,
    `Adresa: ${data.address}`,
    `Grad: ${data.city}`,
    `Proizvod: ${data.product}`,
    `Količina: ${data.quantity}`,
    `Plaćanje: ${data.payment}`,
    `Napomena: ${data.note || "/"}`,
  ].join("\n");

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
});
