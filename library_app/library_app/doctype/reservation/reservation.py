# Copyright (c) 2025, Library Admin and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from datetime import date, timedelta

class Reservation(Document):
	def validate(self):
		"""Validate reservation data before saving"""
		self.validate_book_availability()
		self.validate_duplicate_reservation()
	
	def validate_book_availability(self):
		"""Check if book needs reservation"""
		book = frappe.get_doc("Book", self.book)
		if book.is_available and self.status == "Pending":
			frappe.throw(f"Book '{self.book}' is currently available. No reservation needed.")
	
	def validate_duplicate_reservation(self):
		"""Check for duplicate reservations by same member"""
		existing_reservation = frappe.get_all("Reservation",
			filters={
				"book": self.book,
				"member": self.member,
				"status": ["in", ["Pending", "Ready"]],
				"name": ["!=", self.name]
			},
			limit=1
		)
		
		if existing_reservation:
			frappe.throw(f"You already have a pending reservation for '{self.book}'")
	
	def before_save(self):
		"""Actions before saving reservation"""
		if self.status == "Ready" and not self.expiry_date:
			# Set expiry date (3 days from ready date)
			self.expiry_date = date.today() + timedelta(days=3)
	
	def after_insert(self):
		"""Actions after creating reservation"""
		# Send confirmation email
		self.send_reservation_confirmation()
	
	def on_update(self):
		"""Actions after updating reservation"""
		if self.has_value_changed('status'):
			if self.status == "Ready":
				self.send_ready_notification()
			elif self.status == "Expired":
				self.process_expiry()
	
	def send_reservation_confirmation(self):
		"""Send reservation confirmation email"""
		member = frappe.get_doc("Member", self.member)
		book = frappe.get_doc("Book", self.book)
		
		# Get queue position
		queue_position = self.get_queue_position()
		
		frappe.sendmail(
			recipients=[member.email],
			subject=f"Reservation Confirmed: {book.title}",
			message=f"""
			Dear {member.name1},
			
			Your reservation for "{book.title}" by {book.author} has been confirmed.
			
			Queue Position: {queue_position}
			Reservation Date: {self.reserve_date}
			
			You will be notified when the book becomes available.
			
			Best regards,
			Library Management System
			"""
		)
	
	def send_ready_notification(self):
		"""Send notification when book is ready"""
		member = frappe.get_doc("Member", self.member)
		book = frappe.get_doc("Book", self.book)
		
		frappe.sendmail(
			recipients=[member.email],
			subject=f"Book Ready for Pickup: {book.title}",
			message=f"""
			Dear {member.name1},
			
			Great news! Your reserved book "{book.title}" by {book.author} is now ready for pickup.
			
			Please collect your book by {self.expiry_date} or your reservation will expire.
			
			Best regards,
			Library Management System
			"""
		)
	
	def get_queue_position(self):
		"""Get position in reservation queue"""
		earlier_reservations = frappe.get_all("Reservation",
			filters={
				"book": self.book,
				"status": "Pending",
				"reserve_date": ["<", self.reserve_date]
			}
		)
		return len(earlier_reservations) + 1
	
	def process_expiry(self):
		"""Process expired reservation"""
		# Move to next person in queue
		next_reservation = frappe.get_all("Reservation",
			filters={
				"book": self.book,
				"status": "Pending"
			},
			order_by="reserve_date asc",
			limit=1
		)
		
		if next_reservation:
			next_res = frappe.get_doc("Reservation", next_reservation[0].name)
			next_res.status = "Ready"
			next_res.save()
