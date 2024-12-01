let map, fromMarker, toMarker, routeControl, currentDistance = 0;

// Список причалов
const piers = [
    { name: "Причал Парк Фили", coords: [55.74946, 37.475594] },
    { name: "Причал Карамышевский", coords: [55.768657, 37.487981] },
    { name: "Причал Сити – Центральный", coords: [55.746756, 37.542142] },
    { name: "Береговой", coords: [55.758117, 37.513424] },
    { name: "Причал Сердце Столицы", coords: [55.760657, 37.511384] },
    { name: "Причал Кутузовский", coords: [55.744389, 37.53831] },
    { name: "Причал Сити – Багратион", coords: [55.746313, 37.544945] },
    { name: "Причал Трёхгорный", coords: [55.754218, 37.563711] },
    { name: "Причал Киевский", coords: [55.744293, 37.572626] },
    { name: "Причал Воробьевы горы", coords: [55.711693, 37.546837] },
    { name: "Причал Андреевский", coords: [55.711598, 37.572267] },
    { name: "Причал Нескучный сад", coords: [55.722456, 37.590764] },
    { name: "Причал Крымский мост", coords: [55.732449, 37.596006] },
    { name: "Причал Патриарший", coords: [55.74392, 37.608042] },
    { name: "Причал Зарядье", coords: [55.749563, 37.629233] },
    { name: "Причал Красный Октябрь", coords: [55.745144, 37.610719] },
    { name: "Причал Китай-город / Устьинский", coords: [55.748491, 37.635838] },
    { name: "Причал Новоспасский", coords: [55.730291, 37.653432] },
    { name: "Пристань Автозаводский мост", coords: [55.70283, 37.62678] },
    { name: "Причал ЗИЛ", coords: [55.699959, 37.628762] },
    { name: "Причал Нагатинский", coords: [55.690368, 37.627949] },
    { name: "Южный речной вокзал", coords: [55.689517, 37.676502] },
    { name: "Причал Кленовый Бульвар", coords: [55.68632, 37.671702] },
    { name: "Нагатинский Затон", coords: [55.685906, 37.701082] },
    { name: "Коломенская набережная", coords: [55.684348, 37.710059] },
    { name: "Печатники", coords: [55.683945, 37.714116] }
];

// Получение элементов полей ввода и информации
const fromInput = document.getElementById('from-input');
const toInput = document.getElementById('to-input');
const routeInfo = document.getElementById('route-info');
const paymentMethodButton = document.getElementById('payment-method-button');
const paymentMethodValue = document.getElementById('payment-method-value');
const usernameElement = document.getElementById('username');
const userModal = document.getElementById('user-modal');
let paymentMethod;

// Функция для нахождения ближайшего причала к заданным координатам
function findClosestPier(lat, lng) {
    let closestPier = null;
    let minDistance = Infinity;

    piers.forEach(pier => {
        const distance = getDistance([lat, lng], pier.coords);
        if (distance < minDistance) {
            minDistance = distance;
            closestPier = pier;
        }
    });

    // Ограничим установку метки только в радиусе 0.5 км от причала
    return minDistance <= 0.5 ? closestPier : null;
}

// Функция для расчета расстояния между точками
function getDistance(coord1, coord2) {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Обновленная функция маршрута с учетом реки Москва
function updateRoute() {
    if (routeControl) {
        map.removeLayer(routeControl); // Удаляем предыдущий маршрут
    }

    if (fromMarker && toMarker) {
        const fromCoords = fromMarker.getLatLng();
        const toCoords = toMarker.getLatLng();

        // Устанавливаем начальный и конечный причалы
        const startPier = findClosestPier(fromCoords.lat, fromCoords.lng);
        const endPier = findClosestPier(toCoords.lat, toCoords.lng);

        if (!startPier || !endPier) {
            routeInfo.value = "Маршрут возможен только между причалами!";
            return;
        }

        // Обновляем маршрут с адресами
        const waypoints = [DG.latLng(...startPier.coords), DG.latLng(...endPier.coords)];
        routeControl = DG.Routing.control({
            waypoints,
            routeWhileDragging: false,
            createMarker: function (i, waypoint, n) {
                return DG.marker(waypoint.latLng, {
                    icon: DG.icon({
                        iconUrl: i === 0 ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41]
                    })
                });
            }
        }).addTo(map);

        // Расчет расстояния и времени с учетом движения по реке Москва
        currentDistance = getDistance(startPier.coords, endPier.coords) * 1.2; // Допустимая корректировка для маршрута по реке
        const duration = Math.round(currentDistance / 15 * 60); // Пример: 15 км/ч средняя скорость по воде
        const timeString = duration > 60 ? `${Math.floor(duration / 60)} ч ${duration % 60} мин` : `${duration} мин`;

        // Обновление информации о поездке
        routeInfo.value = `Расстояние: ${currentDistance.toFixed(1)} км, Время в пути: ${timeString}`;
    }
}

// Функция добавления и анимации кораблей
function addBoatMarkers() {
    const boats = [
        { name: "Корабль 1", coords: [55.743644, 37.571795] },
        { name: "Корабль 2", coords: [55.735899, 37.594184] }
    ];

    boats.forEach(boat => {
        const boatMarker = DG.marker(boat.coords, {
            icon: DG.icon({
                iconUrl: '../static/icons/Ship.png',
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            })
        }).addTo(map).bindPopup(boat.name);
    });
}

// Инициализация карты
function initMap() {
    map = DG.map('map', {
        center: [55.7558, 37.6173],
        zoom: 11
    });

    // Добавление маркеров причалов
    piers.forEach(pier => {
        DG.marker(pier.coords).addTo(map).bindPopup(pier.name);
    });

    // Добавление кораблей на карту
    addBoatMarkers();

    // Обработчик клика на карте для установки начальной и конечной точек
    map.on('click', (event) => {
        const { lat, lng } = event.latlng;

        const closestPier = findClosestPier(lat, lng);
        if (!closestPier) {
            alert("Метки можно ставить только на причалах или рядом с ними (до 500 м).");
            return;
        }

        if (!fromMarker) {
            fromMarker = DG.marker(closestPier.coords, {
                draggable: true,
                icon: DG.icon({
                    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41]
                })
            })
                .addTo(map)
                .bindPopup("Начальная точка")
                .openPopup();
            fromMarker.on('dragend', updateRoute);
            fromInput.value = closestPier.name;
        } else if (!toMarker) {
            toMarker = DG.marker(closestPier.coords, {
                draggable: true,
                icon: DG.icon({
                    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41]
                })
            })
                .addTo(map)
                .bindPopup("Конечная точка")
                .openPopup();
            toMarker.on('dragend', updateRoute);
            toInput.value = closestPier.name;

            // Обновление маршрута
            updateRoute();
        }
    });

    // Добавление кнопок управления зумом
    const zoomInButton = document.querySelector('.zoom-in');
    const zoomOutButton = document.querySelector('.zoom-out');

    zoomInButton.addEventListener('click', function () {
        map.setZoom(map.getZoom() + 1);
    });

    zoomOutButton.addEventListener('click', function () {
        map.setZoom(map.getZoom() - 1);
    });
}

// Обработчики для опций способа оплаты
paymentMethodButton.addEventListener('click', function () {
    const paymentModal = document.getElementById('payment-modal');
    paymentModal.style.display = 'block';
});

const closeModalElements = document.querySelectorAll('.close-modal');
closeModalElements.forEach(function (element) {
    element.addEventListener('click', function () {
        const paymentModal = document.getElementById('payment-modal');
        paymentModal.style.display = 'none';
    });
});

// Закрытие модального окна при клике вне его области
window.addEventListener('click', function (event) {
    const paymentModal = document.getElementById('payment-modal');
    if (event.target == paymentModal) {
        paymentModal.style.display = 'none';
    }
});

// Обработчики для опций способа оплаты
document.querySelectorAll('.payment-option').forEach(function (option) {
    option.addEventListener('click', function () {
        const paymentMethodText = this.querySelector('.payment-option-text').textContent;
        const paymentMethodIcon = this.querySelector('.payment-option-icon').outerHTML;
        paymentMethod = this.getAttribute('data-value');

        paymentMethodValue.innerHTML = `${paymentMethodIcon} ${paymentMethodText}`;
        const paymentModal = document.getElementById('payment-modal');
        paymentModal.style.display = 'none';
    });
});


// Обновление цен в зависимости от расстояния
function updatePricesBasedOnDistance() {
    if (currentDistance > 0) {
        document.querySelectorAll('.tariff').forEach(function (tariff) {
            const tariffType = tariff.getAttribute('data-tariff-type');
            const price = calculatePrice(tariffType, currentDistance);
            tariff.querySelector('.tariff-price').textContent = `${price}₽`;
        });
    }
}

// Функция расчета стоимости поездки
function calculatePrice(tariffType, distance) {
    let pricePerKm, basePrice;
    switch (tariffType) {
        case 'Standart':
            pricePerKm = 20;
            basePrice = 555;
            break;
        case 'Premium':
            pricePerKm = 50;
            basePrice = 1555;
            break;
        case 'VIP':
            pricePerKm = 100;
            basePrice = 5555;
            break;
        default:
            return 0;
    }
    return (basePrice + distance * pricePerKm).toFixed(0);
}



// Запуск карты при загрузке страницы
document.addEventListener('DOMContentLoaded', initMap);