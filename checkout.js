const itemId = new URLSearchParams(location.search).get("item");
const loading = document.querySelector("#loading");
const username = document.querySelector("#username");
const status = document.querySelector("#status");

async function loadOrder() {
  if (!itemId || !/^[a-z0-9-]+$/.test(itemId)) {
    loading.textContent = "Choose an item from the store to continue.";
    return;
  }

  const response = await fetch("store.html");
  if (!response.ok) throw new Error("Store unavailable");

  // Use the store cards as the source for product names, prices and artwork.
  const store = new DOMParser().parseFromString(await response.text(), "text/html");
  const buyLink = store.querySelector(`.buy[href="checkout.html?item=${itemId}"]`);
  if (!buyLink) {
    loading.textContent = "This item is unavailable. Please choose an item from the store.";
    return;
  }

  const product = buyLink.closest(".product");
  const name = product.querySelector("h3").textContent.trim();
  document.querySelector("#item").textContent = name;
  document.querySelector("#description").textContent = product.querySelector("p").textContent.trim();
  document.querySelector("#price").textContent = product.querySelector(".price").textContent.trim();

  const image = document.querySelector("#image");
  image.addEventListener("load", () => { image.hidden = false; });
  image.src = product.querySelector("img").getAttribute("src");

  try {
    const savedUsername = localStorage.getItem("lowerblockMinecraftUsername");
    if (/^[A-Za-z0-9_]{3,16}$/.test(savedUsername ?? "")) username.value = savedUsername;
  } catch {
    // Checkout can still accept a manually entered username when storage is blocked.
  }

  document.querySelector("#preview").addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = `Test order complete for ${username.value}. No payment was taken and no items were delivered.`;
  });
  username.addEventListener("input", () => { status.textContent = ""; });
  loading.hidden = true;
  document.querySelector("#order").hidden = false;
}

loadOrder().catch(() => {
  loading.textContent = "Couldn’t load checkout. Try refreshing or go back to the store.";
});
