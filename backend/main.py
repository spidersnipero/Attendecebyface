from datetime import datetime
from collections import defaultdict
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Query
import os
from face.face_recognition import recognize_faces
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Date, UniqueConstraint
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from datetime import date
from typing import List, Optional
from pydantic import BaseModel

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Setup (SQLite for simplicity)
DATABASE_URL = "sqlite:///./attendance.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Table Model
class Attendance(Base):
    __tablename__ = "attendance"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    date = Column(Date, default=date.today)
    period = Column(Integer)

    # Ensure (name, date, period) is unique
    __table_args__ = (UniqueConstraint("name", "date", "period", name="unique_attendance"),)

class AttendanceRequest(BaseModel):
    names: List[str]
    period: int

# Create Table if it doesn't exist
Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

UPLOAD_DIR = os.path.expanduser("~/attendence_uploads")  
os.makedirs(UPLOAD_DIR, exist_ok=True)

# File Upload Route (with Attendance Marking)
@app.post("/uploadimage/")
async def upload_image(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, "image.jpeg")

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    absolute_file_path = os.path.abspath(file_path)
    detected_names = recognize_faces(absolute_file_path)  # Assume recognize_faces function is defined

    if "Unknown" in detected_names:
        detected_names.remove("Unknown")

    return {"detected_names": detected_names}

@app.post("/markattendance/")
async def mark_attendance(request: AttendanceRequest, db: Session = Depends(get_db)):
    today = date.today()
    added_count = 0

    for name in request.names:
        attendance_entry = Attendance(name=name, date=today, period=request.period)
        try:
            db.add(attendance_entry)
            db.commit()
            added_count += 1
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to mark attendance for {name}: {str(e)}")

    return {"message": f"{added_count} records added successfully!", "detected_names": request.names}


# ✅ Route: Get attendance on a specific date
@app.get("/attendance-by-date/")
async def get_attendance_by_date(date: str = Query(...), db: Session = Depends(get_db)):
    try:
        query_date = datetime.strptime(date, "%Y-%m-%d").date()  # Convert string to date
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    records = db.query(Attendance).filter(Attendance.date == query_date).all()

    return {"date": date, "attendance": [{"name": r.name, "period": r.period} for r in records]}


# ✅ Route: Get attendance of a specific person
@app.get("/attendance-by-name/")
async def get_attendance_by_name(name: str, db: Session = Depends(get_db)):
    records = db.query(Attendance).filter(Attendance.name == name).all()

    attendance_dict = defaultdict(lambda: {p: "Absent" for p in range(1, 9)})  # Initialize all periods as Absent

    for record in records:
        attendance_dict[record.date][record.period] = "Present"

    # Convert to list format for frontend
    attendance_data = [
        {"date": d.strftime("%Y-%m-%d"), "periods": p} for d, p in attendance_dict.items()
    ]

    return {"name": name, "attendance": attendance_data}