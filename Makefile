# Makefile for Library Management System

.PHONY: init start stop install-app frontend-dev backend-dev

init:
	@echo "Initializing Library Management System..."
	chmod +x setup.sh
	./setup.sh
	@echo "Creating new site..."
	cd frappe-bench && bench new-site library.local --admin-password admin123
	@echo "Installing library app..."
	cd frappe-bench && bench get-app library_app ./library_app
	cd frappe-bench && bench --site library.local install-app library_app
	@echo "Setup complete!"

start:
	@echo "Starting backend..."
	cd frappe-bench && bench start &
	@echo "Starting frontend..."
	cd frontend && npm run dev

stop:
	@echo "Stopping services..."
	pkill -f "bench start"
	pkill -f "npm run dev"

install-app:
	cd frappe-bench && bench --site library.local install-app library_app

frontend-dev:
	cd frontend && npm install && npm run dev

backend-dev:
	cd frappe-bench && bench start
