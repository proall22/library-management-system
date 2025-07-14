import frappe
from frappe import _

@frappe.whitelist()
def get_all_members(filters=None, fields=None, limit=20, start=0):
	"""Get all members with optional filters"""
	try:
		if not fields:
			fields = ["name", "name1", "membership_id", "email", "phone", "status", "join_date"]
		
		members = frappe.get_all("Member",
			filters=filters or {},
			fields=fields,
			limit=limit,
			start=start,
			order_by="name1 asc"
		)
		
		return {
			"success": True,
			"data": members,
			"total": frappe.db.count("Member", filters or {})
		}
	except Exception as e:
		frappe.log_error(f"Error fetching members: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def get_member(member_id):
	"""Get single member details with loan history"""
	try:
		member = frappe.get_doc("Member", member_id)
		
		# Get active loans
		active_loans = frappe.get_all("Loan",
			filters={"member": member_id, "returned": 0},
			fields=["name", "book", "loan_date", "return_date"],
			order_by="loan_date desc"
		)
		
		# Get loan history
		loan_history = frappe.get_all("Loan",
			filters={"member": member_id, "returned": 1},
			fields=["name", "book", "loan_date", "return_date", "actual_return_date", "fine_amount"],
			order_by="loan_date desc",
			limit=10
		)
		
		# Get active reservations
		reservations = frappe.get_all("Reservation",
			filters={"member": member_id, "status": ["in", ["Pending", "Ready"]]},
			fields=["name", "book", "reserve_date", "status", "expiry_date"],
			order_by="reserve_date desc"
		)
		
		return {
			"success": True,
			"data": {
				"member": member.as_dict(),
				"active_loans": active_loans,
				"loan_history": loan_history,
				"reservations": reservations
			}
		}
	except frappe.DoesNotExistError:
		return {"success": False, "error": "Member not found"}
	except Exception as e:
		frappe.log_error(f"Error fetching member {member_id}: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def create_member(name1, membership_id, email, phone=None, address=None):
	"""Create a new member"""
	try:
		member = frappe.get_doc({
			"doctype": "Member",
			"name1": name1,
			"membership_id": membership_id,
			"email": email,
			"phone": phone,
			"address": address,
			"status": "Active"
		})
		member.insert()
		
		return {
			"success": True,
			"data": member.as_dict(),
			"message": "Member created successfully"
		}
	except Exception as e:
		frappe.log_error(f"Error creating member: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def update_member(member_id, **kwargs):
	"""Update member details"""
	try:
		member = frappe.get_doc("Member", member_id)
		
		# Update allowed fields
		allowed_fields = ["name1", "email", "phone", "address", "status"]
		for field in allowed_fields:
			if field in kwargs:
				setattr(member, field, kwargs[field])
		
		member.save()
		
		return {
			"success": True,
			"data": member.as_dict(),
			"message": "Member updated successfully"
		}
	except frappe.DoesNotExistError:
		return {"success": False, "error": "Member not found"}
	except Exception as e:
		frappe.log_error(f"Error updating member {member_id}: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def delete_member(member_id):
	"""Delete a member"""
	try:
		# Check if member has active loans
		active_loans = frappe.get_all("Loan",
			filters={"member": member_id, "returned": 0},
			limit=1
		)
		
		if active_loans:
			return {"success": False, "error": "Cannot delete member with active loans"}
		
		# Check if member has pending reservations
		pending_reservations = frappe.get_all("Reservation",
			filters={"member": member_id, "status": ["in", ["Pending", "Ready"]]},
			limit=1
		)
		
		if pending_reservations:
			return {"success": False, "error": "Cannot delete member with pending reservations"}
		
		frappe.delete_doc("Member", member_id)
		
		return {
			"success": True,
			"message": "Member deleted successfully"
		}
	except frappe.DoesNotExistError:
		return {"success": False, "error": "Member not found"}
	except Exception as e:
		frappe.log_error(f"Error deleting member {member_id}: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def search_members(query, limit=10):
	"""Search members by name, membership ID, or email"""
	try:
		members = frappe.db.sql("""
			SELECT name, name1, membership_id, email, status
			FROM `tabMember`
			WHERE name1 LIKE %(query)s 
			   OR membership_id LIKE %(query)s 
			   OR email LIKE %(query)s
			ORDER BY name1
			LIMIT %(limit)s
		""", {
			"query": f"%{query}%",
			"limit": limit
		}, as_dict=True)
		
		return {
			"success": True,
			"data": members
		}
	except Exception as e:
		frappe.log_error(f"Error searching members: {str(e)}")
		return {"success": False, "error": str(e)}
