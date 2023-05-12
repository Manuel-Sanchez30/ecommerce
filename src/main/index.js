const URL               = "https://ecommercebackend.fundamentos-29.repl.co";
const productsHTML      = document.querySelector(".products");
const iconCartHTML      = document.querySelector("#iconCart");
const cartHTML          = document.querySelector(".cart");
const cartProducts      = document.querySelector(".cart__products");
const cartTotalInfoHTML = document.querySelector(".cart__total__info");
const amountItems       = document.querySelector("#amountItems");
const btnBuy            = document.querySelector("#btn__buy");
const contentLoadingHTML= document.querySelector(".content__loading");
const iconMenuHTML      = document.querySelector(".iconMenu");
const menuHTML          = document.querySelector(".menu");
const iconThemeHTML     = document.querySelector(".iconTheme");
const headerHTML        = document.querySelector(".header");



function updateLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
}

async function getproducts(){

    try {
        const data = await fetch(URL)
        const res = await data.json()

        updateLocalStorage("products", res)

        return res;
    }
    catch (error) {
        console.error(error);
    } 

};

function printProducts(db){
    let html = "";

    db.products.forEach(({name, image, price, quantity, id, category}) => {
        
        html += `
        
        <div class="product ${category}" >
            <div class="product__image">
                <img src="${image}" alt="${name}">
            </div>
            <div class="product__body">
                <h4>${name} | <span>${category}</span></h4>
                <p>$${price}</p>
                <p class="${quantity ? "" : "soldOut"}">
                    <b>Stock </b>  ${quantity}
                </p>
                ${
                    quantity
                    ? `<i class='bx bx-plus' id="${id}"></i>`
                    : "<div></div>"
                }
                
                
            </div>
        </div>        

        `;

    });

    productsHTML.innerHTML = html;
};

function handleShowCart(){
    iconCartHTML.addEventListener("click", () =>{
        cartHTML.classList.toggle("cart__show")
    });
};

function printProductsCart(db){

    let html = "";

    Object.values(db.cart).forEach((item)=>{
        html += `

            <div class="cartItem">
                <div class="cartItem__img">                
                    <img src="${item.image}" alt="${name}">                
                </div>

                <div class="cartItem__body">

                    <h4>${item.name}</h4>
                    <p>$${item.price}.00 | subtotal: $${item.price * item.amount}.00</p>

                    <div class="cartItem__options" data-id="${item.id}">
                        <i class='bx bx-minus' ></i>
                        <span>${item.amount}</span>
                        <i class='bx bx-plus'></i>
                        <i class='bx bx-trash' ></i>
                    </div>

                </div>

                
            
            </div>
        
        `;
    });

    cartProducts.innerHTML = html;

};

function addProductsfromCart(db){

    productsHTML.addEventListener("click", (e)=>{

        
        if(e.target.classList.contains("bx-plus")){

            const productId = Number(e.target.id)

            const productFind = db.products.find( (product)=>{

                return product.id === productId
            } );

            if(db.cart[productId]){
                if(db.cart[productId].amount === db.cart[productId].quantity)
                return alert("producto sin stock")
                db.cart[productId].amount += 1
                
            }else{
                db.cart[productId] = structuredClone(productFind);
                db.cart[productId].amount = 1
            }

            
        }; 

        updateLocalStorage( "cart", db.cart);
        printTotal(db);
        printProductsCart(db)
        

    });

};

function handleCart(db){

    cartProducts.addEventListener("click", (e) => {

        if(e.target.classList.contains("bx-minus")){
            const productId = Number(e.target.parentElement.dataset.id)
            
            if(db.cart[productId].amount === 1){

                const response = confirm("desea eliminar este producto?")
                if(!response) return;

                delete db.cart[productId]
            }else{
                db.cart[productId].amount -= 1
            }

        }
        if(e.target.classList.contains("bx-plus")){
            const productId = Number(e.target.parentElement.dataset.id)

            if(db.cart[productId].amount === db.cart[productId].quantity)
                return alert("producto sin stock")
            db.cart[productId].amount += 1
        }
        if(e.target.classList.contains("bx-trash")){
            const productId = Number(e.target.parentElement.dataset.id)

            const response = confirm("desea eliminar este producto?")
                if(!response) return;
            
            delete db.cart[productId]
        }

        printProductsCart(db)
        updateLocalStorage("cart", db.cart)
        printTotal(db);
    })
    
};

function printTotal(db){

    let amountProducts = 0;
    let priceTotal = 0;

    Object.values(db.cart).forEach((item) => {
        amountProducts += item.amount;
        priceTotal += item.amount * item.price
    })

    let html = `

        <p>
            <b>items: ${amountProducts}</b>
        </p>
        <p>
            <b>Precio Total: $${priceTotal}.00</b>
        </p>

    `;

    cartTotalInfoHTML.innerHTML = html;
    amountItems.textContent = amountProducts;
};

function handleBuy(db){

    btnBuy.addEventListener("click", ()=>{

        if(!Object.values(db.cart).length)
        return alert("debes agregar productos")

        const newProducts = [];

        for(const product of db.products) {
        
            const productCart = db.cart[product.id];

            if(product.id === productCart?.id){
                newProducts.push({
                    ...product,
                    quantity: product.quantity - productCart.amount
                });
            }else{
                newProducts.push(product)
            }
        
        };

        db.products = newProducts;
        db.cart = {};

        updateLocalStorage("products", db.products);
        updateLocalStorage("cart", db.cart);

        printProducts(db);
        printProductsCart(db);
        printTotal(db);

    });


};

function filterProducts(){

    mixitup(".products", {
        selectors: {
            target: '.product'
        },
        animation: {
            duration: 300
        }
    });

};

function animationScroll(){
        
    let y = window.scrollY;
    

    if( y > 200 ){
        headerHTML.classList.add("content__navbar--scroll")
    }else{
        headerHTML.classList.remove("content__navbar--scroll")
    }
    
};

function windowLoad(){
    window.addEventListener("load",()=>{
        setTimeout(() => {
            contentLoadingHTML.classList.add("content__loading__none")    
        }, 1000);
    });
};

function showMenu() {
    iconMenuHTML.addEventListener("click",()=>{
        menuHTML.classList.toggle("menu__show")
    });
};

function darkMode(){
    iconThemeHTML.addEventListener("click",()=>{
        document.body.classList.toggle("darkMode")
    });
};

async function main() {

    const db = {
        products: JSON.parse( localStorage.getItem("products") ) || await getproducts(),
        cart: JSON.parse(localStorage.getItem("cart")) || {},
        
    }


    printProducts(db);
    handleShowCart();
    printProductsCart(db);
    addProductsfromCart(db);
    handleCart(db);
    printTotal(db);
    handleBuy(db);
    filterProducts();
    windowLoad();
    showMenu();
    darkMode()
    window.onscroll = ()=> animationScroll();    
    
};

main();
