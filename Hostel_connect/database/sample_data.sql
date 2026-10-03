USE hostel_connect;

-- Insert Users with Valid Bcrypt Hashes:
-- Admin@123 -> $2a$10$ux2vzf8LnVtJBKdkUGBV9OmDCeiNugzS7H8eyFK9lqjyOWotHUoiO
-- Warden@123 -> $2a$10$hOqcfoye63Uw/WWqLHuabelwcPn7bHN9gdb4GXzjabCUDevhBbBgK
-- Student@123 -> $2a$10$txvGylNf8akco2kHV3kiouaQ0JjWNrM8kz/amv/AUx5KX6SvR0Rmq
INSERT INTO users(name,email,password,role,phone) VALUES
('System Admin','admin@hostelconnect.com','$2a$10$ux2vzf8LnVtJBKdkUGBV9OmDCeiNugzS7H8eyFK9lqjyOWotHUoiO','admin','9000000001'),
('Ravi Kumar','warden@hostelconnect.com','$2a$10$hOqcfoye63Uw/WWqLHuabelwcPn7bHN9gdb4GXzjabCUDevhBbBgK','warden','9000000002'),
('Dhanush Varma','dhanush@student.com','$2a$10$txvGylNf8akco2kHV3kiouaQ0JjWNrM8kz/amv/AUx5KX6SvR0Rmq','student','9000000003'),
('Rahul Sharma','rahul@student.com','$2a$10$txvGylNf8akco2kHV3kiouaQ0JjWNrM8kz/amv/AUx5KX6SvR0Rmq','student','9000000004'),
('Demo Student','student@hostelconnect.com','$2a$10$txvGylNf8akco2kHV3kiouaQ0JjWNrM8kz/amv/AUx5KX6SvR0Rmq','student','9000000005');

INSERT INTO hostels(name,location,gender,total_rooms,description,warden_id,contact_phone)
VALUES
('Sunrise Boys Hostel','North Campus Quadrant','Boys',100,'Primary undergraduate boys residence hall with sports amenities and study rooms.',2,'9000000002'),
('Moonlight Girls Hostel','South Campus Quadrant','Girls',80,'Secure residential facility for women students with 24/7 security and Wi-Fi.',2,'9000000006'),
('Skyline International Hostel','East Campus Block','Co-ed',50,'International students residence with attached air-conditioned suites.',2,'9000000007');

INSERT INTO rooms(hostel_id,room_number,floor_number,room_type,capacity,current_occupancy,status,price_per_semester)
VALUES
(1,'101',1,'Double',2,2,'Fully Occupied',45000),
(1,'102',1,'Double',2,1,'Partially Occupied',45000),
(1,'103',1,'Single',1,0,'Available',55000),
(1,'201',2,'Triple',3,0,'Available',40000),
(1,'202',2,'Four-Sharing',4,0,'Available',35000),
(2,'101',1,'Double',2,0,'Available',45000),
(2,'102',1,'Single',1,0,'Available',55000);

INSERT INTO students(user_id,student_id,course,department,year_of_study,phone,gender,guardian_name,guardian_phone,address,hostel_id,room_id)
VALUES
(3,'STU001','B.Tech','Computer Science',2,'9000000003','Male','Parent One','9111111111','Hyderabad, Telangana',1,1),
(4,'STU002','B.Tech','Computer Science',2,'9000000004','Male','Parent Two','9222222222','Hyderabad, Telangana',1,1),
(5,'STU003','B.Tech','Information Technology',1,'9000000005','Male','Parent Three','9333333333','Bangalore, Karnataka',1,2);

INSERT INTO allocations(student_id,hostel_id,room_id,allocation_date,status,remarks)
VALUES
(1,1,1,CURDATE(),'Active','Initial semester allocation'),
(2,1,1,CURDATE(),'Active','Initial semester allocation'),
(3,1,2,CURDATE(),'Active','Room 102 assignment');

INSERT INTO fees(student_id,fee_type,amount,due_date,payment_date,payment_status,transaction_id,payment_method,invoice_number,academic_semester)
VALUES
(1,'Hostel Fee',45000,'2026-10-01','2026-09-01','Paid','TXN-HOSTEL-98210','Online / UPI','INV1001','2026 Semester 1'),
(1,'Mess Fee',18000,'2026-10-15','2026-09-02','Paid','TXN-MESS-44321','Net Banking','INV1002','2026 Semester 1'),
(2,'Hostel Fee',45000,'2026-10-01',NULL,'Pending',NULL,'None','INV1003','2026 Semester 1'),
(3,'Hostel Fee',45000,'2026-10-01',NULL,'Pending',NULL,'None','INV1004','2026 Semester 1');

INSERT INTO complaints(student_id,title,category,description,priority,status,resolution_notes)
VALUES
(1,'WiFi Problem','Internet','Internet is slow in Room 101 during evening peak hours.','Medium','In Progress','Technician dispatched to replace router.'),
(2,'Water Leakage','Water','Water leakage near 1st floor bathroom sink.','High','Submitted',''),
(3,'Ceiling Fan Noise','Maintenance','Fan in Room 102 makes loud clicking noise.','Low','Resolved','Bearing greased and fixed.');

INSERT INTO complaint_timeline(complaint_id,status,note)
VALUES
(1,'Submitted','Complaint filed by resident.'),
(1,'In Review','Warden acknowledged issue.'),
(1,'In Progress','Campus IT network team assigned.'),
(2,'Submitted','Complaint filed by resident.'),
(3,'Submitted','Complaint filed by resident.'),
(3,'Resolved','Repaired on site.');

INSERT INTO announcements(title,message,target_audience,priority,created_by)
VALUES
('Hostel General Assembly','All residents must attend the hostel meeting this Friday at 6:30 PM in the Common Hall.','All Students','Important',1),
('Mess Menu Revision','New breakfast and dinner items have been added starting Monday. Check the digital mess planner.','All Students','Normal',1);

INSERT INTO notifications(user_id,title,message,type,link)
VALUES
(3,'Room Allocated','Your room allocation for Sunrise Boys Hostel (Room 101) is complete.','room','/student/dashboard'),
(4,'Fee Reminder','Your hostel fee payment of Rs 45,000 is pending. Due date: 2026-10-01.','fee','/student/fees'),
(5,'Welcome to Campus','Your digital student profile has been verified and registered.','system','/student/dashboard');

INSERT INTO mess_menus(day_of_week,meal_type,food_items,category,calories,timing)
VALUES
('Monday','Breakfast',JSON_ARRAY('Idli','Sambar','Coconut Chutney','Tea / Coffee'),'Vegetarian',420,'07:30 AM - 09:30 AM'),
('Monday','Lunch',JSON_ARRAY('Steamed Rice','Dal Tadka','Mix Vegetable Curry','Curd','Papad'),'Vegetarian',680,'12:30 PM - 02:30 PM'),
('Monday','Dinner',JSON_ARRAY('Phulka / Chapati','Paneer Butter Masala','Jeera Rice','Gulab Jamun'),'Vegetarian',720,'07:30 PM - 09:30 PM'),
('Tuesday','Breakfast',JSON_ARRAY('Masala Dosa','Sambar','Filter Coffee'),'Vegetarian',450,'07:30 AM - 09:30 AM'),
('Tuesday','Lunch',JSON_ARRAY('Rice','Sambar','Aloo Fry','Rasam','Curd'),'Vegetarian',650,'12:30 PM - 02:30 PM'),
('Tuesday','Dinner',JSON_ARRAY('Roti','Egg Curry / Veg Kofta','Veg Pulao','Ice Cream'),'Both',750,'07:30 PM - 09:30 PM');

INSERT INTO meal_attendance(student_id,attendance_date,meal_type,status)
VALUES
(1,CURDATE(),'Breakfast','Present'),
(2,CURDATE(),'Breakfast','Present'),
(3,CURDATE(),'Breakfast','Present');
