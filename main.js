async function decrease(button) {
    const amount = button.parentElement.querySelector('.chosen-amount');

    if (amount.innerHTML > 0) {
        amount.innerHTML--;
    }
    updateButtons(button.parentElement);
}

async function increase(button) {
    const product_name = button.closest('.product-controller').getAttribute('name');

    const amount = button.parentElement.querySelector('.chosen-amount');
    const amount_in_stock = document.querySelector('.product-list-panel').querySelector(`[name=${product_name}]`).querySelector('.amount');

    if (amount.innerHTML < amount_in_stock.innerHTML) {
        amount.innerHTML++;
    }
    updateButtons(button.parentElement, amount_in_stock.innerHTML);
}

async function updateButtons(amountController, amountInStock = -1) {
    const decrementButton = amountController.querySelector('.decrement');
    const incrementButton = amountController.querySelector('.increment');
    const amount = amountController.querySelector('.chosen-amount').innerHTML;

    decrementButton.disabled = (amount == 0);
    incrementButton.disabled = (amount == amountInStock);
}

async function buyProduct(button) {
    const product = button.closest('.product-controller');

    const chosen_amount = product.querySelector('.chosen-amount');
    if (chosen_amount.innerHTML == 0) {
        return;
    }

    const product_name = product.getAttribute('name');

    const element_in_stock = document.querySelector('.item-container').querySelector(`[name=${product_name}]`);
    const amount_in_stock = element_in_stock.querySelector('.amount');
    const newAmount = amount_in_stock.innerHTML - chosen_amount.innerHTML;

    await updateItemsOnBuy(product_name, chosen_amount.innerHTML);
    if (newAmount > 0) {
        amount_in_stock.innerHTML = newAmount;
        chosen_amount.innerHTML = 0;
    } else {
        element_in_stock.remove();
    }

    product.remove();
}

async function updateItemsOnBuy(name, chosen_amount) {
    const item_container = document.querySelector('.item-container.bought-item').querySelector(`[name=${name}]`);
    if (item_container) {
        item_container.querySelector('.amount').innerHTML -= -1 * chosen_amount;
    } else {
        createBoughtItem(name, chosen_amount);
    }

    createBoughtProductController(name, chosen_amount);
}

async function returnProduct(button) {
    const product = button.closest('.product-controller');

    const chosen_amount = product.querySelector('.chosen-amount').innerHTML;
    const product_name = product.getAttribute('name');

    product.remove();
    updateItemsOnReturn(product_name, chosen_amount);
}

async function updateItemsOnReturn(product_name, chosen_amount) {
    createNotBoughtProductController(product_name, chosen_amount);

    const item_container_bought = document.querySelector('.item-container.bought-item').querySelector(`[name=${product_name}]`);
    const item_container_in_stock = document.querySelector('.item-container').querySelector(`[name=${product_name}]`)

    if (item_container_in_stock) {
        item_container_in_stock.querySelector('.amount').innerHTML -= -1 * chosen_amount;
    } else {
        createNotBoughtItem(product_name, chosen_amount);
    }

    item_container_bought.remove();
}

async function deleteItem(item) {
    item.closest('.product-controller').remove();
}

async function addToCart(event) {
    event.preventDefault();
    const input = document.querySelector('.product-input');
    const product_name = input.value.trim().toLowerCase();

    if (product_name && document.querySelector('.item-container').querySelector(`[name=${product_name}]`) && !document.querySelector('.product-controller-container').querySelector(`[name=${product_name}]`)) {
        createNotBoughtProductController(product_name);
        input.value = '';
    }

    input.focus();
}

async function createBoughtItem(name, amount) {
    const itemContainer = document.querySelector('.item-container.bought-item');
    itemContainer.append(await createItemContainer(name, amount));
}

async function createNotBoughtItem(name, amount) {
    const itemContainer = document.querySelector('.item-container');
    itemContainer.append(await createItemContainer(name, amount));
}

async function createItemContainer(name, amount) {
    const product_item = document.createElement('span');
    product_item.className = 'product-item';
    product_item.setAttribute('name', name)
    product_item.innerHTML = `${capitalizeFirstLetter(name)} <span class="amount">${amount}</span>`;
    return product_item;
}

function createNotBoughtProductController(product_name, chosen_amount = 1) {
    const productController = document.createElement('div');
    productController.className = 'product-controller';
    productController.setAttribute('name', product_name);
    productController.setAttribute('data-bought', 'false');
    productController.innerHTML = `
            <h3 class="product-title" onclick="rename(this)">${capitalizeFirstLetter(product_name)}</h3>
            <span class="amount-controller">
                <button class="default decrement" data-tooltip="One less" onclick="decrease(this)">-</button>
                <span class="chosen-amount">${chosen_amount}</span>
                <button class="default increment" data-tooltip="One more" onclick="increase(this)">+</button>
            </span>
            <span class="product-action-container">
                <button class="default state" data-tooltip="Add to cart" onclick="buyProduct(this)">Buy</button>
                <button class="default delete" data-tooltip="Delete from cart" onclick="deleteItem(this)">⨯</button>
            </span>
        `;

    const product_controller_container = document.querySelector('.product-controller-container');

    product_controller_container.prepend(productController);
}

function createBoughtProductController(product_name, chosen_amount) {
    const productController = document.createElement('div');
    productController.className = 'product-controller bought-item';
    productController.setAttribute('name', product_name);
    productController.setAttribute('data-bought', 'true');
    productController.innerHTML = `
            <h3 class="product-title">${capitalizeFirstLetter(product_name)}</h3>
            <span class="amount-controller">
                <span class="chosen-amount">${chosen_amount}</span>
            </span>
            <span class="product-action-container">
                <button class="default state" data-tooltip="Refund product" onclick="returnProduct(this)">Return</button>
            </span>
        `;

    const product_controller_container = document.querySelector('.product-controller-container');

    product_controller_container.appendChild(productController);
}

async function rename(title) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'product-rename-input';
    input.value = title.innerText;

    input.addEventListener('blur', () => {
        const newTitle = document.createElement('h3');
        newTitle.className = 'product-title';
        newTitle.textContent = capitalizeFirstLetter(input.value);
        newTitle.setAttribute('onclick', "rename(this)");

        const oldName = input.parentElement.getAttribute('name');
        const newName = input.value.toLowerCase();

        input.replaceWith(newTitle);
        renameAllOccurrences(oldName, newName);
    });

    title.replaceWith(input);
    input.focus();
}

async function renameAllOccurrences(oldName, newName) {
    const occurrences = document.querySelectorAll(`[name=${oldName}]`);
    occurrences.forEach((occurrence) => {
        occurrence.setAttribute('name', newName);

        if (occurrence.className == 'product-controller') {
            occurrence.querySelector('.product-title').textContent = capitalizeFirstLetter(newName);
        } else {
            occurrence.innerHTML = occurrence.innerHTML.replace(new RegExp(oldName, 'i'), capitalizeFirstLetter(newName));
        }
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.toLowerCase().slice(1);
}
