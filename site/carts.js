const { downloadJSON, today } = require("./js/misc");
const model = require("./model");
require("./views");

function newCart() {
    let name = prompt("Name für Warenkorb eingeben:");
    if (!name || name.trim().length == 0) return;
    name = name.trim();
    if (model.carts.carts.some((cart) => cart.name === name)) {
        alert("Warenkorb mit Namen '" + name + "' existiert bereits");
        return;
    }
    model.carts.add(name);
    location.href = `cart.html?name=${encodeURIComponent(name)}`;
}

function isIterable(obj) {
    return typeof obj[Symbol.iterator] === "function";
}

function importCart(importedCart) {
    const items = [];
    for (const cartItem of importedCart.items) {
        const item = model.items.lookup[cartItem.store + cartItem.id];
        if (!item) continue;
        items.push(item);
    }
    importedCart.items = items;

    const index = model.carts.carts.findIndex((cart) => cart.name === importedCart.name);
    if (index != -1) {
        let newName = importedCart.name;
        while (true) {
            newName = prompt(
                "Warenkorb '" + importedCart.name + " existiert bereits. Bitte einen anderen Namen für den zu importierenden Warenkorb eingeben",
                importedCart.name + today()
            );
            if (!newName || newName.trim().length == 0) return;
            newName = newName.trim();
            if (newName != importedCart.name) {
                importedCart.name = newName;
                model.carts.carts.push(importedCart);
                break;
            }
        }
    } else {
        model.carts.carts.push(importedCart);
    }
    model.carts.save();
}

function importCarts(importedCarts) {
    if (isIterable(importedCarts)) {
        importedCarts.forEach((cart) => importCart(cart));
    } else {
        importCart(importedCarts);
    }
}

(async () => {
    await model.load();
    document.querySelector("#carts").model = model.carts;
    document.querySelector("#new").addEventListener("click", () => newCart());
    document.querySelector("#export").addEventListener("click", () => downloadJSON("carts.json", model.carts.carts));
    document.querySelector("#import").addEventListener("click", () => document.querySelector("#fileInput").click());
    document.querySelector("#fileInput").addEventListener("change", function (event) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const importedCarts = JSON.parse(event.target.result);
            importCarts(importedCarts);
        };
        reader.readAsText(event.target.files[0]);
    });
    document.querySelector('[x-id="loader"]').classList.add("hidden");
})();
