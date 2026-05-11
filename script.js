const ORDER_ENDPOINT = ""; // Ovde ubaci endpoint za upis u tabelu (npr. Google Apps Script Web App URL).

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

  const payload = {
    ...data,
    submittedAt: new Date().toISOString(),
  };

  submitOrder(payload)
    .then(function () {
      form.reset();
      alert("Porudžbina je uspešno sačuvana.");
    })
    .catch(function () {
      alert("Došlo je do greške pri čuvanju porudžbine.");
    });
});

async function submitOrder(payload) {
  if (ORDER_ENDPOINT.trim()) {
    // no-cors je praktičan za statičke sajtove i jednostavne webhook endpointe.
    await fetch(ORDER_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload),
    });
    return;
  }

  downloadCsv([payload]);
}

function downloadCsv(rows) {
  const headers = [
    "Datum",
    "Ime i prezime",
    "Telefon",
    "Adresa",
    "Grad",
    "Proizvod",
    "Kolicina",
    "Placanje",
    "Napomena",
  ];

  const csvRows = [
    headers.join(","),
    ...rows.map(function (row) {
      return [
        row.submittedAt,
        row.name,
        row.phone,
        row.address,
        row.city,
        row.product,
        row.quantity,
        row.payment,
        row.note || "/",
      ]
        .map(escapeCsvValue)
        .join(",");
    }),
  ];

  const blob = new Blob(["\ufeff" + csvRows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `porudzbina-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvValue(value) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replace(/"/g, '""')}"`;
}
