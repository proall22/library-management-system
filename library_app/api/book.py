import frappe
from frappe import _

@frappe.whitelist()
def get_all_books(filters=None, fields=None, limit=20, start=0):
	"""Get all books with optional filters"""
	try:
		if not fields:
			fields = ["name", "title", "author", "isbn", "publish_date", "is_available", "category"]
		
		books = frappe.get_all("Book", 
			filters=filters or {},
			fields=fields,
			limit=limit,
			start=start,
			order_by="title asc"
		)
		
		return {
			"success": True,
			"data": books,
			"total": frappe.db.count("Book", filters or {})
		}
	except Exception as e:
		frappe.log_error(f"Error fetching books: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def get_book(book_id):
	"""Get single book details"""
	try:
		book = frappe.get_doc("Book", book_id)
		
		# Get current loan info if book is not available
		current_loan = None
		if not book.is_available:
			loan = frappe.get_all("Loan",
				filters={"book": book_id, "returned": 0},
				fields=["name", "member", "return_date"],
				limit=1
			)
			if loan:
				current_loan = loan[0]
		
		# Get reservation count
		reservation_count = frappe.db.count("Reservation", {
			"book": book_id,
			"status": "Pending"
		})
		
		return {
			"success": True,
			"data": {
				"book": book.as_dict(),
				"current_loan": current_loan,
				"reservation_count": reservation_count
			}
		}
	except frappe.DoesNotExistError:
		return {"success": False, "error": "Book not found"}
	except Exception as e:
		frappe.log_error(f"Error fetching book {book_id}: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def create_book(title, author, isbn=None, publish_date=None, description=None, category=None):
	"""Create a new book"""
	try:
		book = frappe.get_doc({
			"doctype": "Book",
			"title": title,
			"author": author,
			"isbn": isbn,
			"publish_date": publish_date,
			"description": description,
			"category": category,
			"is_available": 1
		})
		book.insert()
		
		return {
			"success": True,
			"data": book.as_dict(),
			"message": "Book created successfully"
		}
	except Exception as e:
		frappe.log_error(f"Error creating book: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def update_book(book_id, **kwargs):
	"""Update book details"""
	try:
		book = frappe.get_doc("Book", book_id)
		
		# Update allowed fields
		allowed_fields = ["title", "author", "isbn", "publish_date", "description", "category"]
		for field in allowed_fields:
			if field in kwargs:
				setattr(book, field, kwargs[field])
		
		book.save()
		
		return {
			"success": True,
			"data": book.as_dict(),
			"message": "Book updated successfully"
		}
	except frappe.DoesNotExistError:
		return {"success": False, "error": "Book not found"}
	except Exception as e:
		frappe.log_error(f"Error updating book {book_id}: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def delete_book(book_id):
	"""Delete a book"""
	try:
		# Check if book has active loans
		active_loans = frappe.get_all("Loan",
			filters={"book": book_id, "returned": 0},
			limit=1
		)
		
		if active_loans:
			return {"success": False, "error": "Cannot delete book with active loans"}
		
		# Check if book has pending reservations
		pending_reservations = frappe.get_all("Reservation",
			filters={"book": book_id, "status": "Pending"},
			limit=1
		)
		
		if pending_reservations:
			return {"success": False, "error": "Cannot delete book with pending reservations"}
		
		frappe.delete_doc("Book", book_id)
		
		return {
			"success": True,
			"message": "Book deleted successfully"
		}
	except frappe.DoesNotExistError:
		return {"success": False, "error": "Book not found"}
	except Exception as e:
		frappe.log_error(f"Error deleting book {book_id}: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def search_books(query, limit=10):
	"""Search books by title, author, or ISBN"""
	try:
		books = frappe.db.sql("""
			SELECT name, title, author, isbn, is_available
			FROM `tabBook`
			WHERE title LIKE %(query)s 
			   OR author LIKE %(query)s 
			   OR isbn LIKE %(query)s
			ORDER BY title
			LIMIT %(limit)s
		""", {
			"query": f"%{query}%",
			"limit": limit
		}, as_dict=True)
		
		return {
			"success": True,
			"data": books
		}
	except Exception as e:
		frappe.log_error(f"Error searching books: {str(e)}")
		return {"success": False, "error": str(e)}
