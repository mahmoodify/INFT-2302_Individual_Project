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

function init() {
    initializeVenueData();
    renderVenue();
}

init();