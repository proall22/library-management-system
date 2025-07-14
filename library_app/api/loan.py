import frappe
from frappe import _
from datetime import date, timedelta

@frappe.whitelist()
def get_all_loans(filters=None, fields=None, limit=20, start=0):
	"""Get all loans with optional filters"""
	try:
		if not fields:
			fields = ["name", "book", "member", "loan_date", "return_date", "returned", "fine_amount"]
		
		loans = frappe.get_all("Loan",
			filters=filters or {},
			fields=fields,
			limit=limit,
			start=start,
			order_by="loan_date desc"
		)
		
		return {
			"success": True,
			"data": loans,
			"total": frappe.db.count("Loan", filters or {})
		}
	except Exception as e:
		frappe.log_error(f"Error fetching loans: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def create_loan(book, member, return_date=None):
	"""Create a new loan"""
	try:
		# Validate book availability
		book_doc = frappe.get_doc("Book", book)
		if not book_doc.is_available:
			return {"success": False, "error": "Book is not available for loan"}
		
		# Validate member eligibility
		member_doc = frappe.get_doc("Member", member)
		can_borrow, message = member_doc.can_borrow_book()
		if not can_borrow:
			return {"success": False, "error": message}
		
		# Set default return date if not provided
		if not return_date:
			loan_period = frappe.db.get_single_value("Library Settings", "default_loan_period") or 14
			return_date = date.today() + timedelta(days=loan_period)
		
		loan = frappe.get_doc({
			"doctype": "Loan",
			"book": book,
			"member": member,
			"loan_date": date.today(),
			"return_date": return_date,
			"returned": 0
		})
		loan.insert()
		
		return {
			"success": True,
			"data": loan.as_dict(),
			"message": "Loan created successfully"
		}
	except Exception as e:
		frappe.log_error(f"Error creating loan: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def return_book(loan_id, actual_return_date=None):
	"""Process book return"""
	try:
		loan = frappe.get_doc("Loan", loan_id)
		
		if loan.returned:
			return {"success": False, "error": "Book already returned"}
		
		loan.returned = 1
		loan.actual_return_date = actual_return_date or date.today()
		loan.save()
		
		return {
			"success": True,
			"data": loan.as_dict(),
			"message": "Book returned successfully"
		}
	except frappe.DoesNotExistError:
		return {"success": False, "error": "Loan not found"}
	except Exception as e:
		frappe.log_error(f"Error returning book {loan_id}: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def get_active_loans():
	"""Get all active loans"""
	try:
		loans = frappe.db.sql("""
			SELECT l.name, l.book, b.title as book_title, l.member, m.name1 as member_name,
			       l.loan_date, l.return_date,
			       CASE WHEN l.return_date < CURDATE() THEN 1 ELSE 0 END as is_overdue,
			       DATEDIFF(CURDATE(), l.return_date) as days_overdue
			FROM `tabLoan` l
			JOIN `tabBook` b ON l.book = b.name
			JOIN `tabMember` m ON l.member = m.name
			WHERE l.returned = 0
			ORDER BY l.return_date ASC
		""", as_dict=True)
		
		return {
			"success": True,
			"data": loans
		}
	except Exception as e:
		frappe.log_error(f"Error fetching active loans: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def get_overdue_loans():
	"""Get all overdue loans"""
	try:
		loans = frappe.db.sql("""
			SELECT l.name, l.book, b.title as book_title, l.member, m.name1 as member_name,
			       m.email as member_email, l.loan_date, l.return_date,
			       DATEDIFF(CURDATE(), l.return_date) as days_overdue
			FROM `tabLoan` l
			JOIN `tabBook` b ON l.book = b.name
			JOIN `tabMember` m ON l.member = m.name
			WHERE l.returned = 0 AND l.return_date < CURDATE()
			ORDER BY l.return_date ASC
		""", as_dict=True)
		
		return {
			"success": True,
			"data": loans
		}
	except Exception as e:
		frappe.log_error(f"Error fetching overdue loans: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def extend_loan(loan_id, new_return_date):
	"""Extend loan return date"""
	try:
		loan = frappe.get_doc("Loan", loan_id)
		
		if loan.returned:
			return {"success": False, "error": "Cannot extend returned loan"}
		
		# Check if member has overdue books
		member = frappe.get_doc("Member", loan.member)
		overdue_loans = member.get_overdue_loans()
		
		# Allow extension only if no other overdue books
		other_overdue = [l for l in overdue_loans if l.name != loan_id]
		if other_overdue:
			return {"success": False, "error": "Cannot extend loan while having other overdue books"}
		
		loan.return_date = new_return_date
		loan.save()
		
		return {
			"success": True,
			"data": loan.as_dict(),
			"message": "Loan extended successfully"
		}
	except frappe.DoesNotExistError:
		return {"success": False, "error": "Loan not found"}
	except Exception as e:
		frappe.log_error(f"Error extending loan {loan_id}: {str(e)}")
		return {"success": False, "error": str(e)}
