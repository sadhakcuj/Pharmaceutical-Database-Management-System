# Pharmaceutical Database Management System
Pharmaceutical Database Management System
A robust, scalable, and secure platform for managing comprehensive pharmaceutical data within pharmacy businesses, clinics, and research facilities.

Overview
The Pharmaceutical Database Management System (PDMS) is designed to facilitate the efficient handling of pharmaceutical operations—including inventory, suppliers, staff, patients, prescriptions, transactions, and compliance reporting. By leveraging advanced database technologies, this system ensures reliable, auditable, and scalable data processes suitable for real-world deployment.

Key Features
Integrated Inventory Management: Monitor medicine stock, batch tracking, manufacturing and expiry dates.

Supplier & Manufacturer Relations: Maintain detailed profiles to streamline procurement and auditing.

Employee & Patient Administration: Securely record, update, and query personnel and patient data for smooth pharmacy operations.

Prescription Management: Digitally handle doctor’s prescriptions and dispensing histories, including validation and allocation.

Billing & Financial Tracking: Automate and secure billing, sales, and invoice generation for accurate financial records.

Regulatory Compliance: Structured to meet prevailing pharmaceutical regulations and streamline audits.

Data Security & Recovery: Implements role-based access and offers backup and restore procedures for maximum data integrity.

Custom Reporting & Analytics: Analyze sales, inventory status, medicines nearing expiry, and other key metrics through customizable queries.

Notification System: Automated alerts for low stock, expired medicines, and critical operational updates.

Modular Schema: Easily extensible to accommodate new requirements or integrate with external applications.

Technology Stack
Layer	Technologies Supported
Database	PostgreSQL, MySQL
Query Language	SQL
Interface	Command-line, Python scripts, JDBC, PHP
Scripts	Table creation, data loading, cleanup
Getting Started
Prerequisites
PostgreSQL or MySQL database server

SQL client tools (e.g., pgAdmin, phpMyAdmin, or MySQL shell)

Setup Instructions
Clone the Repository

Create a new database (e.g., pharmacy).

Schema Deployment

Execute CREATE.sql to provision all tables as per the defined schema.

Data Loading

Run LOAD_sample.sql for demo purposes or individual scripts (e.g., Manufacturer.sql, Supplier.sql) for production data.

Duplicate/Cleanup Operations

Use DELETE.sql to remove redundant records and perform routine maintenance.

Database Entities
Entity	Description
Manufacturer	Pharmaceutical product manufacturers
Supplier	Medicine wholesalers and distributors
Pharmacy	Physical or virtual pharmacy outlets
Employee	Pharmacists and support staff
Patient	Patient/customer health and contact records
Medicine	Product details, pricing, expiry, stock
Prescription	Physician-issued medication records
Bill	Purchase, sales, and transaction records
Contribution Guidelines
We welcome contributions to enhance the PDMS project! Please fork the repository, create feature branches, and submit pull requests. For bug reports, suggestions, or questions, open an issue in this repository.

License
This project is licensed under the MIT License.

Contact & Support
For documentation, schema details, or support, please refer to the scripts in the repository or open an issue directly on GitHub.

Empowering pharmacies with systematic, secure, and scalable database management solutions.
