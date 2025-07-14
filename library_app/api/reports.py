import frappe
from frappe import _

@frappe.whitelist()
def get_active_loans_report():
	"""Generate active loans report"""
	try:
		loans = frappe.db.sql("""
			SELECT l.name, l.book, b.title as book_title, b.author,
			       l.member, m.name1 as member_name, m.email, m.phone,
			       l.loan_date, l.return_date,
			       DATEDIFF(l.return_date, CURDATE()) as days_remaining,
			       CASE WHEN l.return_date < CURDATE() THEN 'Overdue'
			            WHEN DATEDIFF(l.return_date, CURDATE()) <= 3 THEN 'Due Soon'
			            ELSE 'Active' END as status
			FROM `tabLoan` l
			JOIN `tabBook` b ON l.book = b.name
			JOIN `tabMember` m ON l.member = m.name
			WHERE l.returned = 0
			ORDER BY l.return_date ASC
		""", as_dict=True)
		
		# Calculate statistics
		total_loans = len(loans)
		overdue_count = len([l for l in loans if l.status == 'Overdue'])
		due_soon_count = len([l for l in loans if l.status == 'Due Soon'])
		
		return {
			"success": True,
			"data": {
				"loans": loans,
				"statistics": {
					"total_active_loans": total_loans,
					"overdue_loans": overdue_count,
					"due_soon_loans": due_soon_count,
					"active_loans": total_loans - overdue_count - due_soon_count
				}
			}
		}
	except Exception as e:
		frappe.log_error(f"Error generating active loans report: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def get_overdue_books_report():
	"""Generate overdue books report"""
	try:
		overdue_loans = frappe.db.sql("""
			SELECT l.name, l.book, b.title as book_title, b.author,
			       l.member, m.name1 as member_name, m.email, m.phone,
			       l.loan_date, l.return_date,
			       DATEDIFF(CURDATE(), l.return_date) as days_overdue,
			       (DATEDIFF(CURDATE(), l.return_date) * 1.0) as estimated_fine
			FROM `tabLoan` l
			JOIN `tabBook` b ON l.book = b.name
			JOIN `tabMember` m ON l.member = m.name
			WHERE l.returned = 0 AND l.return_date < CURDATE()
			ORDER BY days_overdue DESC
		""", as_dict=True)
		
		# Calculate total estimated fines
		total_fines = sum(loan.estimated_fine for loan in overdue_loans)
		
		return {
			"success": True,
			"data": {
				"overdue_loans": overdue_loans,
				"statistics": {
					"total_overdue": len(overdue_loans),
					"total_estimated_fines": total_fines
				}
			}
		}
	except Exception as e:
		frappe.log_error(f"Error generating overdue books report: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def get_popular_books_report(limit=10):
	"""Generate popular books report based on loan frequency"""
	try:
		popular_books = frappe.db.sql("""
			SELECT b.name, b.title, b.author, b.category,
			       COUNT(l.name) as loan_count,
			       COUNT(CASE WHEN l.returned = 0 THEN 1 END) as current_loans,
			       COUNT(r.name) as reservation_count
			FROM `tabBook` b
			LEFT JOIN `tabLoan` l ON b.name = l.book
			LEFT JOIN `tabReservation` r ON b.name = r.book AND r.status = 'Pending'
			GROUP BY b.name, b.title, b.author, b.category
			ORDER BY loan_count DESC, reservation_count DESC
			LIMIT %(limit)s
		""", {"limit": limit}, as_dict=True)
		
		return {
			"success": True,
			"data": popular_books
		}
	except Exception as e:
		frappe.log_error(f"Error generating popular books report: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def get_member_activity_report(limit=10):
	"""Generate member activity report"""
	try:
		active_members = frappe.db.sql("""
			SELECT m.name, m.name1, m.membership_id, m.email,
			       COUNT(l.name) as total_loans,
			       COUNT(CASE WHEN l.returned = 0 THEN 1 END) as active_loans,
			       COUNT(CASE WHEN l.returned = 0 AND l.return_date < CURDATE() THEN 1 END) as overdue_loans,
			       MAX(l.loan_date) as last_loan_date
			FROM `tabMember` m
			LEFT JOIN `tabLoan` l ON m.name = l.member
			WHERE m.status = 'Active'
			GROUP BY m.name, m.name1, m.membership_id, m.email
			ORDER BY total_loans DESC, last_loan_date DESC
			LIMIT %(limit)s
		""", {"limit": limit}, as_dict=True)
		
		return {
			"success": True,
			"data": active_members
		}
	except Exception as e:
		frappe.log_error(f"Error generating member activity report: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def get_library_statistics():
	"""Get overall library statistics"""
	try:
		stats = {}
		
		# Book statistics
		stats['total_books'] = frappe.db.count('Book')
		stats['available_books'] = frappe.db.count('Book', {'is_available': 1})
		stats['books_on_loan'] = frappe.db.count('Book', {'is_available': 0})
		
		# Member statistics
		stats['total_members'] = frappe.db.count('Member')
		stats['active_members'] = frappe.db.count('Member', {'status': 'Active'})
		
		# Loan statistics
		stats['total_loans'] = frappe.db.count('Loan')
		stats['active_loans'] = frappe.db.count('Loan', {'returned': 0})
		stats['overdue_loans'] = frappe.db.sql("""
			SELECT COUNT(*) as count FROM `tabLoan` 
			WHERE returned = 0 AND return_date < CURDATE()
		""")[0][0]
		
		# Reservation statistics
		stats['pending_reservations'] = frappe.db.count('Reservation', {'status': 'Pending'})
		stats['ready_reservations'] = frappe.db.count('Reservation', {'status': 'Ready'})
		
		return {
			"success": True,
			"data": stats
		}
	except Exception as e:
		frappe.log_error(f"Error generating library statistics: {str(e)}")
		return {"success": False, "error": str(e)}
