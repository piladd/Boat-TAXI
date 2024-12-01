from flask import render_template, session, jsonify
from http import HTTPStatus
import connexion
import os
import sqlite3
import sqlite_query
from pathlib import Path


def generate_secret_key():
    """Генерация случайного секретного ключа"""
    return os.urandom(24)


BASE_DIR = Path(__file__).resolve().parent
DATA_USERS_PATH = BASE_DIR / "data.db"

app = connexion.App(__name__, specification_dir="./")
app.add_api("swagger.yml")

# Установка секретного ключа
app.app.secret_key = generate_secret_key()

# Проверка существования базы данных и создание таблиц
if not DATA_USERS_PATH.exists():
    print(f"База данных {DATA_USERS_PATH} не найдена. Она будет создана.")
    with sqlite3.connect(DATA_USERS_PATH) as conn:
        cur = conn.cursor()
        cur.execute(sqlite_query.create_table_users)
        cur.execute(sqlite_query.create_table_cards)
        conn.commit()


@app.route("/")
def index():
    """Отображение страницы логина"""
    return render_template("login.html")


@app.route("/main.html")
def main():
    """Главная страница с картой"""
    return render_template("main.html")


@app.route("/standart.html")
def standart():
    """Страница тарифа Standard"""
    return render_template("standart.html")


@app.route("/premium.html")
def premium():
    """Страница тарифа Premium"""
    return render_template("premium.html")


@app.route("/VIP.html")
def vip():
    """Страница тарифа VIP"""
    return render_template("VIP.html")


@app.route("/QA.html")
def qa():
    """Страница вопросов и ответов"""
    return render_template("QA.html")


@app.route("/credit_card.html")
def credit_card():
    """Страница добавления кредитной карты"""
    return render_template("credit_card.html")


@app.route("/get-user-id")
def get_user_id():
    """Возвращает ID текущего пользователя из сессии"""
    try:
        user_id = session.get("user_id", None)
        if user_id:
            return jsonify({"user_id": user_id})
        else:
            return jsonify({"error": "User not logged in"}), HTTPStatus.UNAUTHORIZED
    except Exception as e:
        return jsonify({"error": f"Ошибка сервера: {e}"}), HTTPStatus.INTERNAL_SERVER_ERROR


if __name__ == "__main__":
    app.run(host=os.getenv("FLASK_HOST", "127.0.0.1"), port=int(os.getenv("FLASK_PORT", 8000)))
