import sqlite3
import os

DB_NAME = 'data/campus_surveillance.db'

def create_db():
    with sqlite3.connect(DB_NAME) as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS students (
                roll_no TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                semester TEXT,
                department TEXT,
                subject TEXT,
                mobile_number TEXT,
                photo_path TEXT
            )''')

def add_student():
    print("\n--- Add New Student ---")
    roll = input("Roll No:   ")
    name = input("Name:      ")
    sem  = input("Semester:  ")
    dept = input("Department:")
    sub  = input("Subject:   ")
    mob  = input("Mobile No: ")
    img  = input("Image Name (ali.jpg): ")
    path = os.path.join("data/Known_students", img)

    with sqlite3.connect(DB_NAME) as conn:
        try:
            conn.execute('''INSERT INTO students VALUES (?,?,?,?,?,?,?)''', 
                         (roll, name, sem, dept, sub, mob, path))
            print("✅ Student added.")
        except sqlite3.IntegrityError:
            print("❌ Error: Roll number already exists.")

def update_student():
    """Updates specific details of an existing student."""
    roll = input("\nEnter the Roll No of the student to update: ")
    
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM students WHERE roll_no = ?", (roll,))
        if not cursor.fetchone():
            print("❌ Student not found.")
            return

        print("Leave blank to keep current value.")
        new_name = input("New Name: ")
        new_sem  = input("New Semester: ")
        new_mob  = input("New Mobile: ")

        # Update only the fields provided by the user
        if new_name:
            conn.execute("UPDATE students SET name = ? WHERE roll_no = ?", (new_name, roll))
        if new_sem:
            conn.execute("UPDATE students SET semester = ? WHERE roll_no = ?", (new_sem, roll))
        if new_mob:
            conn.execute("UPDATE students SET mobile_number = ? WHERE roll_no = ?", (new_mob, roll))
        
        print("✅ Record updated successfully.")

def delete_student():
    """Removes a student record from the database."""
    roll = input("\nEnter Roll No to DELETE: ")
    confirm = input(f"Are you sure you want to delete {roll}? (y/n): ")
    
    if confirm.lower() == 'y':
        with sqlite3.connect(DB_NAME) as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM students WHERE roll_no = ?", (roll,))
            if cursor.rowcount > 0:
                print("✅ Student record removed.")
            else:
                print("❌ No student found with that Roll No.")

def search_student():
    query = input("\nEnter Name or Roll Number: ")
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM students WHERE name = ? OR roll_no = ?", (query, query))
        result = cursor.fetchone()
    
    if result:
        print(f"\n✅ Found: {result[1]} | Roll: {result[0]} | Dept: {result[3]}")
    else:
        print("❌ Not found.")

def main_menu():
    create_db()
    while True:
        print("\n" + "-"*25)
        print(" 1. Add a student")
        print(" 2. Update a student")
        print(" 3. Delete a student")
        print(" 4. Search student")
        print(" 5. Exit")
        print("-"*25)
        
        choice = input("Enter choice (12345): ")
        
        if choice == '1': add_student()
        elif choice == '2': update_student()
        elif choice == '3': delete_student()
        elif choice == '4': search_student()
        elif choice == '5': break
        else: print("Invalid choice.")

if __name__ == "__main__":
    main_menu()