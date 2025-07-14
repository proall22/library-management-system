import frappe
from datetime import date, timedelta

def send_overdue_notifications():
	"""Send email notifications for overdue books"""
	try:
		# Get all overdue loans
		overdue_loans = frappe.db.sql("""
			SELECT l.name, l.book, b.title as book_title, b.author,
			       l.member, m.name1 as member_name, m.email,
			       l.loan_date, l.return_date,
			       DATEDIFF(CURDATE(), l.return_date) as days_overdue
			FROM `tabLoan` l
			JOIN `tabBook` b ON l.book = b.name
			JOIN `tabMember` m ON l.member = m.name
			WHERE l.returned = 0 AND l.return_date < CURDATE()
		""", as_dict=True)
		
		for loan in overdue_loans:
			send_overdue_email(loan)
		
		# Process expired reservations
		process_expired_reservations()
		
		frappe.db.commit()
		print(f"Processed {len(overdue_loans)} overdue notifications")
		
	except Exception as e:
		frappe.log_error(f"Error in overdue notifications: {str(e)}")

def send_overdue_email(loan):
	"""Send overdue email to member"""
	try:
		fine_per_day = frappe.db.get_single_value("Library Settings", "fine_per_day") or 1.0
		total_fine = loan.days_overdue * fine_per_day
		
		subject = f"Overdue Book: {loan.book_title}"
		message = f"""
		Dear {loan.member_name},
		
		This is a reminder that the following book is overdue:
		
		Book: {loan.book_title} by {loan.author}
		Loan Date: {loan.loan_date}
		Due Date: {loan.return_date}
		Days Overdue: {loan.days_overdue}
		Fine Amount: ${total_fine:.2f}
		
		Please return the book as soon as possible to avoid additional fines.
		
		Best regards,
		Library Management System
		"""
		
		frappe.sendmail(
			recipients=[loan.email],
			subject=subject,
			message=message
		)
		
		# Log the notification
		frappe.get_doc({
			"doctype": "Communication",
			"communication_type": "Email",
			"subject": subject,
			"content": message,
			"sent_or_received": "Sent",
			"reference_doctype": "Loan",
			"reference_name": loan.name
		}).insert(ignore_permissions=True)
		
	except Exception as e:
		frappe.log_error(f"Error sending overdue email for loan {loan.name}: {str(e)}")

def process_expired_reservations():
	"""Process expired reservations"""
	try:
		expired_reservations = frappe.get_all("Reservation",
			filters={
				"status": "Ready",
				"expiry_date": ["<", date.today()]
			}
		)
		
		for res in expired_reservations:
			reservation = frappe.get_doc("Reservation", res.name)
			reservation.status = "Expired"
			reservation.save()
			
			# Process next in queue
			book = frappe.get_doc("Book", reservation.book)
			book.process_reservations()
		
		print(f"Processed {len(expired_reservations)} expired reservations")
		
	except Exception as e:
		frappe.log_error(f"Error processing expired reservations: {str(e)}")

def send_reservation_reminders():
	"""Send reminders for ready reservations expiring soon"""
	try:
		tomorrow = date.today() + timedelta(days=1)
		
		expiring_reservations = frappe.db.sql("""
			SELECT r.name, r.book, b.title as book_title, b.author,
			       r.member, m.name1 as member_name, m.email,
			       r.expiry_date
			FROM `tabReservation` r
			JOIN `tabBook` b ON r.book = b.name
			JOIN `tabMember` m ON r.member = m.name
			WHERE r.status = 'Ready' AND r.expiry_date = %(tomorrow)s
		""", {"tomorrow": tomorrow}, as_dict=True)
		
		for reservation in expiring_reservations:
			frappe.sendmail(
				recipients=[reservation.email],
				subject=f"Reservation Expiring Tomorrow: {reservation.book_title}",
				message=f"""
				Dear {reservation.member_name},
				
				This is a reminder that your reservation for "{reservation.book_title}" by {reservation.author} 
				will expire tomorrow ({reservation.expiry_date}).
				
				Please collect your book today to avoid losing your reservation.
				
				Best regards,
				Library Management System
				"""
			)
		
		print(f"Sent {len(expiring_reservations)} reservation reminders")
		
	except Exception as e:
		frappe.log_error(f"Error sending reservation reminders: {str(e)}")
