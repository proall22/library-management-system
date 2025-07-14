# Copyright (c) 2025, Library Admin and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from datetime import date, timedelta

class Loan(Document):
	def validate(self):
		"""Validate loan data before saving"""
		self.validate_book_availability()
		self.validate_member_eligibility()
		self.validate_dates()
	
	def validate_book_availability(self):
		"""Check if book is available for loan"""
		if not self.returned:
			# Check if book is already on loan
			existing_loan = frappe.get_all("Loan",
				filters={
					"book": self.book,
					"returned": 0,
					"name": ["!=", self.name]
				},
				limit=1
			)
			
			if existing_loan:
				frappe.throw(f"Book '{self.book}' is already on loan")
			
			# Check book availability status
			book = frappe.get_doc("Book", self.book)
			if not book.is_available:
				frappe.throw(f"Book '{self.book}' is not available for loan")
	
	def validate_member_eligibility(self):
		"""Check if member is eligible to borrow"""
		member = frappe.get_doc("Member", self.member)
		can_borrow, message = member.can_borrow_book()
		
		if not can_borrow and not self.returned:
			frappe.throw(message)
	
	def validate_dates(self):
		"""Validate loan and return dates"""
		if self.return_date and self.loan_date:
			if self.return_date <= self.loan_date:
				frappe.throw("Return date must be after loan date")
		
		if self.actual_return_date and self.loan_date:
			if self.actual_return_date < self.loan_date:
				frappe.throw("Actual return date cannot be before loan date")
	
	def before_save(self):
		"""Actions before saving the loan"""
		if not self.return_date and self.loan_date:
			# Set default return date (14 days from loan date)
			loan_period = frappe.db.get_single_value("Library Settings", "default_loan_period") or 14
			self.return_date = self.loan_date + timedelta(days=loan_period)
		
		# Calculate fine if returned late
		if self.returned and self.actual_return_date and self.return_date:
			if self.actual_return_date > self.return_date:
				self.calculate_fine()
	
	def after_insert(self):
		"""Actions after creating new loan"""
		# Mark book as unavailable
		book = frappe.get_doc("Book", self.book)
		book.is_available = 0
		book.save()
	
	def on_update(self):
		"""Actions after updating loan"""
		if self.has_value_changed('returned') and self.returned:
			self.process_return()
	
	def process_return(self):
		"""Process book return"""
		# Set actual return date if not set
		if not self.actual_return_date:
			self.actual_return_date = date.today()
		
		# Mark book as available
		book = frappe.get_doc("Book", self.book)
		book.is_available = 1
		book.save()
		
		# Process any pending reservations
		book.process_reservations()
	
	def calculate_fine(self):
		"""Calculate fine for overdue return"""
		if self.actual_return_date and self.return_date:
			overdue_days = (self.actual_return_date - self.return_date).days
			if overdue_days > 0:
				fine_per_day = frappe.db.get_single_value("Library Settings", "fine_per_day") or 1.0
				self.fine_amount = overdue_days * fine_per_day
	
	def is_overdue(self):
		"""Check if loan is overdue"""
		if self.returned:
			return False
		return date.today() > self.return_date
	
	def days_overdue(self):
		"""Get number of days overdue"""
		if not self.is_overdue():
			return 0
		return (date.today() - self.return_date).days
