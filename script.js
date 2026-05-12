const ORDER_ENDPOINT = ""; // Ovde ubaci endpoint za upis u tabelu (npr. Google Apps Script Web App URL).
const DELIVERY_FEE = 500;

const PRICE_LIST = {
  "Ginger Tape (1/2/3 pakovanja)": {
    "1 pakovanje": 990,
    "2 pakovanja": 1790,
    "3 pakovanja": 2490,
  },
  "Temperature Tape (1/2/3 pakovanja)": {
    "1 pakovanje": 890,
    "2 pakovanja": 1590,
    "3 pakovanja": 2190,
  },
};

const form = document.getElementById("orderForm");
const productSelect = document.getElementById("product");
const quantitySelect = document.getElementById("quantity");
const totalPreview = document.getElementById("orderTotalPreview");
const placementNote = document.getElementById("placementNote");

productSelect.addEventListener("change", function () {
  syncOrderUi();
});
quantitySelect.addEventListener("change", updateTotalPreview);

syncOrderUi();

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

  const basePrice = getBasePrice(data.product, data.quantity);
  if (basePrice === null) {
    alert("Izaberi validnu kombinaciju proizvoda i količine.");
    return;
  }

  const payload = {
    ...data,
    basePrice,
    deliveryFee: DELIVERY_FEE,
    totalPrice: basePrice + DELIVERY_FEE,
    submittedAt: new Date().toISOString(),
  };

  submitOrder(payload)
    .then(function () {
      form.reset();
      syncOrderUi();
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
    "Cena proizvoda",
    "Dostava",
    "Ukupno",
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
        row.basePrice,
        row.deliveryFee,
        row.totalPrice,
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

function getBasePrice(product, quantity) {
  if (!product) {
    return null;
  }

  if (isFamilyPackage(product)) {
    return 2990;
  }

  if (!quantity) {
    return null;
  }

  const productPrices = PRICE_LIST[product];
  if (!productPrices) {
    return null;
  }

  return productPrices[quantity] ?? null;
}

function formatRsd(amount) {
  return `${new Intl.NumberFormat("sr-RS").format(amount)} RSD`;
}

function updateTotalPreview() {
  const basePrice = getBasePrice(productSelect.value, quantitySelect.value);

  if (basePrice === null) {
    totalPreview.textContent =
      "Izaberi proizvod i količinu da vidiš cenu sa dostavom.";
    return;
  }

  const total = basePrice + DELIVERY_FEE;
  totalPreview.innerHTML =
    `Cena proizvoda: ${formatRsd(basePrice)}<br>` +
    `Dostava: ${formatRsd(DELIVERY_FEE)}<br>` +
    `<strong>Ukupno za plaćanje: ${formatRsd(total)}</strong>`;
}

function isFamilyPackage(product) {
  return product.startsWith("Paket za kuću");
}

function updatePlacementNote() {
  const product = productSelect.value;

  if (product.startsWith("Ginger Tape")) {
    placementNote.textContent =
      "Savet: Ginger Tape može na više mesta tela. Temperature Tape ide na čelo.";
    return;
  }

  if (product.startsWith("Temperature Tape")) {
    placementNote.textContent =
      "Savet: Temperature Tape ide na čelo. Ginger Tape može na više mesta tela.";
    return;
  }

  if (isFamilyPackage(product)) {
    placementNote.textContent =
      "Savet za paket: Ginger Tape koristi na više mesta tela, Temperature Tape ide na čelo.";
    return;
  }
}

function syncOrderUi() {
  if (isFamilyPackage(productSelect.value)) {
    quantitySelect.value = "";
    quantitySelect.disabled = true;
    quantitySelect.required = false;
  } else {
    quantitySelect.disabled = false;
    quantitySelect.required = true;
  }

  updatePlacementNote();
  updateTotalPreview();
}
