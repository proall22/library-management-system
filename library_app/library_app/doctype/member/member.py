# Copyright (c) 2025, Library Admin and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
import re

class Member(Document):
	def validate(self):
		"""Validate member data before saving"""
		self.validate_email()
		self.validate_phone()
		self.validate_membership_id()
	
	def validate_email(self):
		"""Validate email format"""
		if self.email:
			email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
			if not re.match(email_pattern, self.email):
				frappe.throw("Please enter a valid email address")
	
	def validate_phone(self):
		"""Validate phone number format"""
		if self.phone:
			# Remove all non-digit characters for validation
			phone_digits = re.sub(r'\D', '', self.phone)
			if len(phone_digits) < 10:
				frappe.throw("Phone number must be at least 10 digits long")
	
	def validate_membership_id(self):
		"""Validate membership ID format"""
		if self.membership_id:
			# Check if membership ID follows pattern (e.g., LIB-2025-001)
			if not re.match(r'^LIB-\d{4}-\d{3}$', self.membership_id):
				frappe.throw("Membership ID must follow format: LIB-YYYY-XXX (e.g., LIB-2025-001)")
	
	def before_save(self):
		"""Actions before saving the member"""
		if self.name1:
			self.name1 = self.name1.strip().title()
		if self.email:
			self.email = self.email.strip().lower()
	
	def get_active_loans(self):
		"""Get all active loans for this member"""
		return frappe.get_all("Loan",
			filters={
				"member": self.name,
				"returned": 0
			},
			fields=["name", "book", "loan_date", "return_date"]
		)
	
	def get_overdue_loans(self):
		"""Get all overdue loans for this member"""
		from datetime import date
		return frappe.get_all("Loan",
			filters={
				"member": self.name,
				"returned": 0,
				"return_date": ["<", date.today()]
			},
			fields=["name", "book", "loan_date", "return_date"]
		)
	
	def can_borrow_book(self):
		"""Check if member can borrow more books"""
		active_loans = len(self.get_active_loans())
		max_loans = frappe.db.get_single_value("Library Settings", "max_loans_per_member") or 5
		
		if active_loans >= max_loans:
			return False, f"Maximum loan limit ({max_loans}) reached"
		
		if self.status != "Active":
			return False, f"Member status is {self.status}"
		
		# Check for overdue books
		overdue_loans = self.get_overdue_loans()
		if overdue_loans:
			return False, "Cannot borrow new books while having overdue items"
		
		return True, "Can borrow"
