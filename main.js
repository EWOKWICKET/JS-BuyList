async function decrease(button) {
    const amount = button.parentElement.querySelector('.chosen-amount');

    if (amount.innerHTML > 0) {
        amount.innerHTML--;
    }
}

async function increase(button) {
    const product_name = button.closest('.product-controller').getAttribute('name');

    const amount = button.parentElement.querySelector('.chosen-amount');
    const amount_in_stock = document.querySelector('.product-list-panel').querySelector(`[name=${product_name}]`).querySelector('.amount');

    if (amount.innerHTML < amount_in_stock.innerHTML) {
        amount.innerHTML++;
    }
}

async function badgeAction(badge) {
    badgeClicked(badge);

    const products = document.querySelectorAll('.product-controller');

    products.forEach(async (product) => {
        if (product.dataset.bought === 'false') {
            const product_name = product.getAttribute('name');

            const chosen_amount = product.querySelector('.chosen-amount');
            if (chosen_amount.innerHTML == 0) {
                return;
            }
            const element_in_stock = document.querySelector('.item-container').querySelector(`[name=${product_name}]`);
            const amount_in_stock = element_in_stock.querySelector('.amount');
            const newAmount = amount_in_stock.innerHTML - chosen_amount.innerHTML;
            await updateBoughtItem(product_name, chosen_amount.innerHTML);
            if (newAmount > 0) {
                amount_in_stock.innerHTML = newAmount;
                chosen_amount.innerHTML = 0;
            } else {
                element_in_stock.remove();
                product.remove();
            }
        }
    });
}

async function badgeClicked(badge) {
    badge.style.backgroundColor = 'white';
    badge.style.color = 'black';
    setTimeout(() => {
        badge.style.backgroundColor = 'darkorchid';
        badge.style.color = 'white';
    }, 300);
}

async function updateBoughtItem(name, chosen_amount) {
    const item_container = document.querySelector('.item-container.bought-item').querySelector(`[name=${name}]`);
    if (item_container) {
        item_container.querySelector('.amount').innerHTML -= -1 * chosen_amount;
    } else {
        createBoughtItem(name, chosen_amount);
    }

    const bought_item = document.querySelectorAll('.product-controller.bought-item');

    for (item of bought_item) {
        if (item.getAttribute('name') == name) {
            item.querySelector('.chosen-amount').innerHTML -= -1 * chosen_amount
            return;
        }
    } 
    createBoughtProductController(name, chosen_amount);
}

async function deleteItem(item) {
    item.closest('.product-controller').remove();
}

async function addToCart() {
    const product_name = document.querySelector('.product-input').value.trim().toLowerCase();

    if (product_name && document.querySelector('.item-container').querySelector(`[name=${product_name}]`) && !document.querySelector('.product-controller-container').querySelector(`[name=${product_name}]`)) {
        createNotBoughtProductController(product_name)
    }
}

async function createBoughtItem(name, chosen_amount) {
    const product_item = document.createElement('span');
    product_item.className = 'product-item';
    product_item.setAttribute('name', name)
    product_item.innerHTML = `${_capitalizeFirstLetter(name)} <span class="amount">${chosen_amount}</span>`;

    const itemContainer = document.querySelector('.item-container.bought-item');

    itemContainer.appendChild(product_item);
}

function createNotBoughtProductController(product_name) {
    const productController = document.createElement('div');
    productController.className = 'product-controller';
    productController.setAttribute('name', product_name);
    productController.setAttribute('data-bought', 'false');
    productController.innerHTML = `
            <h3 class="product-title">${_capitalizeFirstLetter(product_name)}</h3>
            <span class="amount-controller">
                <button class="default decrement" data-tooltip="One less" onclick="decrease(this)">-</button>
                <span class="chosen-amount">0</span>
                <button class="default increment" data-tooltip="One more" onclick="increase(this)">+</button>
            </span>
            <span class="product-action-container">
                <div class="state">Not bought</div>
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
            <h3 class="product-title">${_capitalizeFirstLetter(product_name)}</h3>
            <span class="amount-controller">
                <span class="chosen-amount">${chosen_amount}</span>
            </span>
            <span class="product-action-container">
                <div class="state">Bought</div>
            </span>
        `;

    const product_controller_container = document.querySelector('.product-controller-container');

    product_controller_container.appendChild(productController);
}

function _capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
