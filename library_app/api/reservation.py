import frappe
from frappe import _

@frappe.whitelist()
def create_reservation(book, member):
	"""Create a new reservation"""
	try:
		# Check if book is available
		book_doc = frappe.get_doc("Book", book)
		if book_doc.is_available:
			return {"success": False, "error": "Book is currently available. No reservation needed."}
		
		# Check for existing reservation
		existing = frappe.get_all("Reservation",
			filters={
				"book": book,
				"member": member,
				"status": ["in", ["Pending", "Ready"]]
			},
			limit=1
		)
		
		if existing:
			return {"success": False, "error": "You already have a reservation for this book"}
		
		reservation = frappe.get_doc({
			"doctype": "Reservation",
			"book": book,
			"member": member,
			"status": "Pending"
		})
		reservation.insert()
		
		return {
			"success": True,
			"data": reservation.as_dict(),
			"message": "Reservation created successfully"
		}
	except Exception as e:
		frappe.log_error(f"Error creating reservation: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def get_member_reservations(member):
	"""Get all reservations for a member"""
	try:
		reservations = frappe.db.sql("""
			SELECT r.name, r.book, b.title as book_title, b.author,
			       r.reserve_date, r.status, r.expiry_date,
			       (SELECT COUNT(*) FROM `tabReservation` r2 
			        WHERE r2.book = r.book AND r2.status = 'Pending' 
			        AND r2.reserve_date < r.reserve_date) + 1 as queue_position
			FROM `tabReservation` r
			JOIN `tabBook` b ON r.book = b.name
			WHERE r.member = %(member)s
			ORDER BY r.reserve_date DESC
		""", {"member": member}, as_dict=True)
		
		return {
			"success": True,
			"data": reservations
		}
	except Exception as e:
		frappe.log_error(f"Error fetching reservations: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def cancel_reservation(reservation_id):
	"""Cancel a reservation"""
	try:
		reservation = frappe.get_doc("Reservation", reservation_id)
		
		if reservation.status in ["Fulfilled", "Cancelled", "Expired"]:
			return {"success": False, "error": f"Cannot cancel {reservation.status.lower()} reservation"}
		
		reservation.status = "Cancelled"
		reservation.save()
		
		# If this was a ready reservation, move to next in queue
		if reservation.status == "Ready":
			book = frappe.get_doc("Book", reservation.book)
			book.process_reservations()
		
		return {
			"success": True,
			"message": "Reservation cancelled successfully"
		}
	except frappe.DoesNotExistError:
		return {"success": False, "error": "Reservation not found"}
	except Exception as e:
		frappe.log_error(f"Error cancelling reservation {reservation_id}: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def get_book_reservations(book):
	"""Get all reservations for a book"""
	try:
		reservations = frappe.db.sql("""
			SELECT r.name, r.member, m.name1 as member_name, m.email,
			       r.reserve_date, r.status, r.expiry_date
			FROM `tabReservation` r
			JOIN `tabMember` m ON r.member = m.name
			WHERE r.book = %(book)s AND r.status IN ('Pending', 'Ready')
			ORDER BY r.reserve_date ASC
		""", {"book": book}, as_dict=True)
		
		return {
			"success": True,
			"data": reservations
		}
	except Exception as e:
		frappe.log_error(f"Error fetching book reservations: {str(e)}")
		return {"success": False, "error": str(e)}
