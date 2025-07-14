#!/bin/bash

# Phase 1: Environment Setup for WSL Ubuntu
echo "Setting up Frappe environment..."

# Install system dependencies
sudo apt update
sudo apt install -y python3-dev python3-pip python3-venv nodejs npm mariadb-server redis-server

# Create Frappe environment
python3 -m venv ~/.frappe-env
source ~/.frappe-env/bin/activate

# Install frappe-bench
pip install frappe-bench

# Initialize bench
bench init --frappe-branch version-15 frappe-bench
cd frappe-bench

echo "Environment setup complete!"
