# Copyright (c) 2025, Library Admin and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class Book(Document):
	def validate(self):
		"""Validate book data before saving"""
		if self.isbn and len(self.isbn) not in [10, 13]:
			frappe.throw("ISBN must be either 10 or 13 characters long")
	
	def before_save(self):
		"""Actions before saving the book"""
		if self.title:
			self.title = self.title.strip()
		if self.author:
			self.author = self.author.strip()
	
	def on_update(self):
		"""Actions after updating the book"""
		# Update loan status if book availability changes
		if self.has_value_changed('is_available'):
			self.update_loan_status()
	
	def update_loan_status(self):
		"""Update loan status based on book availability"""
		if not self.is_available:
			# Check if there's an active loan
			active_loan = frappe.get_all("Loan", 
				filters={
					"book": self.name,
					"returned": 0
				},
				limit=1
			)
			if not active_loan:
				# If no active loan but book is marked unavailable, 
				# it might be reserved or damaged
				pass
		else:
			# Book is available, check for reservations
			self.process_reservations()
	
	def process_reservations(self):
		"""Process pending reservations when book becomes available"""
		reservations = frappe.get_all("Reservation",
			filters={
				"book": self.name,
				"status": "Pending"
			},
			order_by="reserve_date asc",
			limit=1
		)
		
		if reservations:
			# Notify the first person in queue
			reservation = frappe.get_doc("Reservation", reservations[0].name)
			reservation.status = "Ready"
			reservation.save()
			
			# Send notification email
			self.send_reservation_ready_email(reservation)
	
	def send_reservation_ready_email(self, reservation):
		"""Send email notification when reserved book is ready"""
		member = frappe.get_doc("Member", reservation.member)
		
		frappe.sendmail(
			recipients=[member.email],
			subject=f"Reserved Book Ready: {self.title}",
			message=f"""
			Dear {member.name},
			
			Your reserved book "{self.title}" by {self.author} is now available for pickup.
			Please visit the library within 3 days to collect your book.
			
			Best regards,
			Library Management System
			"""
		)
