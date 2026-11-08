const venueConfig = {
    amphitheater: { id: 'zone-amphitheater', name: 'Balcony Amphitheater', rows: 4, seatsPerRow: 20, price: 30 },
    rearLeft:     { id: 'zone-rear-left', name: 'Rear Left', rows: 5, seatsPerRow: 12, price: 50 },
    rearCenter:   { id: 'zone-rear-center', name: 'Rear Center', rows: 5, seatsPerRow: 16, price: 50 },
    rearRight:    { id: 'zone-rear-right', name: 'Rear Right', rows: 5, seatsPerRow: 12, price: 50 },
    frontLeft:    { id: 'zone-front-left', name: 'Front Left', rows: 5, seatsPerRow: 10, price: 80 },
    frontCenter:  { id: 'zone-front-center', name: 'Front Center', rows: 5, seatsPerRow: 14, price: 100 },
    frontRight:   { id: 'zone-front-right', name: 'Front Right', rows: 5, seatsPerRow: 10, price: 80 }
};
let seatsData = [];

function initializeVenueData() {
    for (const key in venueConfig) {
        const zone = venueConfig[key];
        
        for (let row = 1; row <= zone.rows; row++) {
            for (let seat = 1; seat <= zone.seatsPerRow; seat++) {
                const seatId = `${zone.id}-r${row}-s${seat}`;
                const isUnavailable = Math.random() < 0.1;
                seatsData.push({
                    id: seatId,
                    zoneId: zone.id,
                    zoneName: zone.name,
                    row: row,
                    seatNum: seat,
                    price: zone.price,
                    status: isUnavailable ? 'unavailable' : 'available'
                });
            }
        }
    }
}
function renderVenue() {
    for (const key in venueConfig) {
        const zone = venueConfig[key];
        const container = document.getElementById(zone.id);
        if (container) {
            container.style.gridTemplateColumns = `repeat(${zone.seatsPerRow}, 1fr)`;
        }
    }

    seatsData.forEach(seat => {
        const container = document.getElementById(seat.zoneId);
        
        if (container) {
            const seatBtn = document.createElement('button');
            seatBtn.classList.add('seat');
            seatBtn.id = seat.id;
            
            seatBtn.title = `${seat.zoneName} | Row ${seat.row}, Seat ${seat.seatNum} | $${seat.price}`;

            if (seat.status === 'unavailable') {
                seatBtn.classList.add('seat-unavailable');
                seatBtn.disabled = true;
            }

            seatBtn.dataset.seatId = seat.id;

            if (seat.zoneId !== 'zone-amphitheater') {
                const zoneKey = seat.zoneId.replace('zone-', '').replace(/-([a-z])/g, g => g[1].toUpperCase());
                const seatsInRow = venueConfig[zoneKey]?.seatsPerRow || 12;
                const colIndex = (seat.seatNum - 1) % seatsInRow;
                const centerCol = (seatsInRow - 1) / 2;
                const offsetFromCenter = colIndex - centerCol;

                const archDrop = Math.pow(offsetFromCenter, 2) * 0.45;
                const seatAngle = offsetFromCenter * 1.5;

                seatBtn.style.transform = `translateY(${archDrop}px) rotate(${seatAngle}deg)`;
            } else {
                seatBtn.style.transform = 'none';
            }

            container.appendChild(seatBtn);
        }
    });
}

let currentInspectedSeatId = null;
function setupEventListeners() {
    const venueContainer = document.getElementById('venue-container');
    
    venueContainer.addEventListener('click', (event) => {
        // Only trigger if the clicked element has the 'seat' class
        if (event.target.classList.contains('seat')) {
            const seatId = event.target.dataset.seatId;
            inspectSeat(seatId);
        }
    });
}

function inspectSeat(seatId) {
    // finding the matching seat object
    const seat = seatsData.find(s => s.id === seatId);
    
    if (!seat || seat.status === 'unavailable' || seat.status === 'in-cart') {
        return; 
    }

    //revert back to available if a seat is already inspected
    if (currentInspectedSeatId === seatId) {
        seat.status = 'available';
        document.getElementById(seat.id).classList.remove('seat-inspected');
        currentInspectedSeatId = null;
        clearInspectionPanel();
        return;
    }

    if (currentInspectedSeatId && currentInspectedSeatId !== seatId) {
        const prevSeat = seatsData.find(s => s.id === currentInspectedSeatId);
        
        if (prevSeat && prevSeat.status === 'inspected') {
            prevSeat.status = 'available';
            document.getElementById(prevSeat.id).classList.remove('seat-inspected');
        }
    }

    seat.status = 'inspected';
    document.getElementById(seat.id).classList.add('seat-inspected');
    
    currentInspectedSeatId = seat.id;

    updateInspectionPanel(seat);
}

function clearInspectionPanel() {
    document.querySelector('.placeholder').hidden = false;
    document.getElementById('active-seat-details').hidden = true;
    document.getElementById('btn-add-to-cart').disabled = true;
}

function updateInspectionPanel(seat) {
    document.querySelector('.placeholder').hidden = true;
    document.getElementById('active-seat-details').hidden = false;

    document.getElementById('detail-zone').textContent = seat.zoneName;
    document.getElementById('detail-row').textContent = seat.row;
    document.getElementById('detail-seat').textContent = seat.seatNum;
    
    document.getElementById('detail-price').textContent = seat.price.toFixed(2);

    //add to cart button
    const addToCartBtn = document.getElementById('btn-add-to-cart');
    addToCartBtn.disabled = false;
}

let cart = [];

document.getElementById('btn-add-to-cart').addEventListener('click', (e) => {
    e.preventDefault();
    if (currentInspectedSeatId) {
        addToCart(currentInspectedSeatId);
    }
});

function addToCart(seatId) {
    const seat = seatsData.find(s => s.id === seatId);
    
    if (!seat || cart.some(item => item.id === seatId)) return;

    seat.status = 'in-cart';
    const seatBtn = document.getElementById(seat.id);
    seatBtn.classList.remove('seat-inspected');
    seatBtn.classList.add('seat-in-cart');

    cart.push(seat);

    currentInspectedSeatId = null;
    clearInspectionPanel();

    updateCartUI();
    saveToStorage();
}
//removing the seats in the cart
function clearAllCart() {
    cart.forEach(item => {
        const seat = seatsData.find(s => s.id === item.id);
        if (seat) {
            seat.status = 'available';
            const seatBtn = document.getElementById(seat.id);
            if (seatBtn) {
                seatBtn.classList.remove('seat-in-cart');
            }
        }
    });

    cart = [];

    updateCartUI();
    saveToStorage();
}

document.getElementById('btn-clear-cart').addEventListener('click', (e) => {
    e.preventDefault();
    clearAllCart();
});

function removeFromCart(seatId) {
    cart = cart.filter(item => item.id !== seatId);

    const seat = seatsData.find(s => s.id === seatId);
    if (seat) {
        seat.status = 'available';
        const seatBtn = document.getElementById(seat.id);
        seatBtn.classList.remove('seat-in-cart');
    }

    updateCartUI();
    saveToStorage();
}

function updateCartUI() {
    const cartList = document.getElementById('cart-items-list');
    const totalDisplay = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('btn-checkout');
    
    //clearing the DOM list
    cartList.innerHTML = '';

    if (cart.length === 0) {
        cartList.innerHTML = '<li class="empty-cart-message">Your cart is empty.</li>';
        totalDisplay.textContent = '0.00';
        checkoutBtn.disabled = true;
        return;
    }

    cart.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.zoneName} (R${item.row}, S${item.seatNum})</span>
            <span>$${item.price.toFixed(2)}</span>
            <button class="remove-btn" data-id="${item.id}" style="background:none; border:none; color:red; cursor:pointer; font-weight:bold;">X</button>
        `;
        cartList.append(li);
    });

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    totalDisplay.textContent = total.toFixed(2);
    checkoutBtn.disabled = false;

    //removing buttons by event listeners
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            removeFromCart(e.target.dataset.id);
        });
    });
}

function saveToStorage() {
    //stringify the array to store in localStorage
    localStorage.setItem('myTicketCart', JSON.stringify(cart));
}

function loadFromStorage() {
    const savedCart = localStorage.getItem('myTicketCart');
    if (savedCart) {
        //parsing back to array
        const parsedCart = JSON.parse(savedCart);
        
        parsedCart.forEach(savedItem => {
            cart.push(savedItem);
            
            const seat = seatsData.find(s => s.id === savedItem.id);
            if (seat) {
                seat.status = 'in-cart';
                const seatBtn = document.getElementById(seat.id);
                if (seatBtn) {
                    seatBtn.classList.remove('seat-unavailable');
                    seatBtn.disabled = false;
                    seatBtn.classList.add('seat-in-cart');
                }
            }
        });
        updateCartUI();
    }
}

const DEFAULT_SCALE = 0.65;
const MIN_SCALE = 0.35;
const MAX_SCALE = 1.8;
const STEP_SCALE = 0.15;
const STEP_PAN = 60;

let currentScale = DEFAULT_SCALE;
let currentPanX = 0;
let currentPanY = 0;

function applyMapTransform() {
    const venueContainer = document.getElementById('venue-container');
    if (!venueContainer) return;

    venueContainer.style.transform = `translate(calc(-50% + ${currentPanX}px), calc(-50% + ${currentPanY}px)) scale(${currentScale})`;
}

function setupNavigationControls() {
    //zoom In
    document.getElementById('btn-zoom-in').addEventListener('click', () => {
        if (currentScale < MAX_SCALE) {
            currentScale = Math.min(MAX_SCALE, currentScale + STEP_SCALE);
            applyMapTransform();
        }
    });

    //zoom Out
    document.getElementById('btn-zoom-out').addEventListener('click', () => {
        if (currentScale > MIN_SCALE) {
            currentScale = Math.max(MIN_SCALE, currentScale - STEP_SCALE);
            applyMapTransform();
        }
    });

    //move Up
    document.getElementById('btn-move-up').addEventListener('click', () => {
        currentPanY += STEP_PAN;
        applyMapTransform();
    });

    //move Down
    document.getElementById('btn-move-down').addEventListener('click', () => {
        currentPanY -= STEP_PAN;
        applyMapTransform();
    });

    //move Left
    document.getElementById('btn-move-left').addEventListener('click', () => {
        currentPanX += STEP_PAN;
        applyMapTransform();
    });

    //move Right
    document.getElementById('btn-move-right').addEventListener('click', () => {
        currentPanX -= STEP_PAN;
        applyMapTransform();
    });

    //reset/center View
    document.getElementById('btn-reset-view').addEventListener('click', () => {
        currentScale = DEFAULT_SCALE;
        currentPanX = 0;
        currentPanY = 0;
        applyMapTransform();
    });
    //for bonus task, to initialize the function we call it here
    setupMouseNavigation();
}

//the bonus part, mouse wheel zoom and other things
function setupMouseNavigation() {
    const viewport = document.getElementById('map-viewport');
    if (!viewport) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;

    //Mouse Drag
    viewport.addEventListener('mousedown', (e) => {
        if (e.target.tagName.toLowerCase() === 'button') return;
        isDragging = true;
        startX = e.clientX - currentPanX;
        startY = e.clientY - currentPanY;
        viewport.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        currentPanX = e.clientX - startX;
        currentPanY = e.clientY - startY;
        applyMapTransform();
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            viewport.style.cursor = 'grab';
        }
    });

    //wheel Zoom
    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            currentScale = Math.min(MAX_SCALE, currentScale + 0.08);
        } else {
            currentScale = Math.max(MIN_SCALE, currentScale - 0.08);
        }
        applyMapTransform();
    }, { passive: false });
}
//checkout process
function processCheckout() {
    const totalAmount = document.getElementById('cart-total').textContent;
    const ticketCount = cart.length;

    cart.forEach(item => {
        const seat = seatsData.find(s => s.id === item.id);
        if (seat) {
            seat.status = 'unavailable';
            const seatBtn = document.getElementById(seat.id);
            if (seatBtn) {
                seatBtn.classList.remove('seat-in-cart', 'seat-inspected');
                seatBtn.classList.add('seat-unavailable');
                seatBtn.disabled = true;
            }
        }
    });

    cart = [];

    updateCartUI();
    saveToStorage();

    alert(`Success! You have purchased ${ticketCount} ticket(s) for $${totalAmount}.`);
}

document.getElementById('btn-checkout').addEventListener('click', (e) => {
    e.preventDefault();
    if (cart.length > 0) {
        processCheckout();
    }
});

function init() {
    initializeVenueData();
    renderVenue();
    setupEventListeners();
    setupNavigationControls();
    loadFromStorage();
}

init();