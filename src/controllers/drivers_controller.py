import sqlite3
import random
from pathlib import Path
import sqlite_query

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DRIVERS_PATH = BASE_DIR / "data.db"


def generate_car_number(region_code="77"):
    valid_letters = "АВЕКМНОРСТУХ"
    car_number = "".join(random.choices(valid_letters, k=1))  # Первая буква
    car_number += "".join(random.choices("0123456789", k=3))  # Три цифры
    car_number += "".join(random.choices(valid_letters, k=2))  # Две буквы
    car_number += region_code
    return car_number


male_first_names = [
    "Иван",
    "Петр",
    "Александр",
    "Дмитрий",
    "Михаил",
    "Сергей",
    "Николай",
    "Андрей",
    "Алексей",
    "Владимир",
]
male_last_names = [
    "Иванов",
    "Петров",
    "Сидоров",
    "Кузнецов",
    "Смирнов",
    "Попов",
    "Васильев",
    "Павлов",
    "Семенов",
    "Голубев",
]
male_patronymics = [
    "Иванович",
    "Петрович",
    "Александрович",
    "Дмитриевич",
    "Михайлович",
    "Сергеевич",
    "Николаевич",
    "Андреевич",
    "Алексеевич",
    "Владимирович",
]


def generate_male_full_name():
    first_name = random.choice(male_first_names)
    last_name = random.choice(male_last_names)
    patronymic = random.choice(male_patronymics)
    return f"{last_name} {first_name} {patronymic}"


car_models = {
    "Standart": [
        {"name": "Пескарь", "image": "/static/icons/for-standart.webp"},
    ],
    "Premium": [
        {
            "name": "Вобла",
            "image": "/static/icons/for-premium.jpg",
        },
    ],
    "VIP": [
        {"name": "Белуга", 
         "image": "/static/icons/for-vip.jpg"
        },

    ],
}


def generate_table():
    drivers_data = []
    driver_statuses = ["busy"] * 15 + ["free"] * 85
    for _ in range(200):
        full_name = generate_male_full_name()
        car_category = random.choice(["Standart", "Premium", "VIP"])
        car_model_info = random.choice(car_models[car_category])
        car_model = car_model_info["name"]
        car_image = car_model_info["image"]
        car_number = generate_car_number()
        status = random.choice(driver_statuses)
        total_trips = random.randint(50, 2000)
        average_rating = round(random.uniform(4.7, 5.0), 2)
        drivers_data.append(
            (
                full_name,
                car_model,
                car_image,
                car_category,
                car_number,
                status,
                total_trips,
                average_rating,
            )
        )
    return drivers_data


conn = sqlite3.connect(DATA_DRIVERS_PATH)
cur = conn.cursor()

cur.execute(sqlite_query.create_table_drivers)
drivers_data = generate_table()
cur.executemany(sqlite_query.insert_drivers, drivers_data)

conn.commit()
cur.close()
conn.close()
