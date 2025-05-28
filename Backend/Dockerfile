
# # שימוש בדימוי Python רשמי
# FROM python:3.11-slim

# # הגדרת תיקיית עבודה
# WORKDIR /app

# # העתקת קובץ התלויות
# COPY requirements.txt .

# # התקנת תלויות
# RUN pip install --no-cache-dir -r requirements.txt

# # העתקת קוד הפרויקט
# COPY . .

# # חשיפת הפורט
# EXPOSE 8000

# # הגדרת משתנה סביבה
# ENV PYTHONUNBUFFERED=1

# # פקודת ההרצה
# CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]

FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/

# Make sure wait-for-it script is executable
RUN apt-get update && apt-get install -y bash
COPY wait-for-db.sh /wait-for-db.sh
RUN chmod +x /wait-for-db.sh

CMD ["/wait-for-db.sh", "db", "5432", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]