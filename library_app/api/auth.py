import frappe
from frappe import _
from frappe.auth import LoginManager
from frappe.utils import cint

@frappe.whitelist(allow_guest=True)
def login(usr, pwd):
	"""Custom login endpoint"""
	try:
		login_manager = LoginManager()
		login_manager.authenticate(user=usr, pwd=pwd)
		login_manager.post_login()
		
		user = frappe.get_doc("User", usr)
		
		# Get user roles
		roles = [role.role for role in user.roles]
		
		# Determine user type
		user_type = "member"
		if "System Manager" in roles:
			user_type = "admin"
		elif "Librarian" in roles:
			user_type = "librarian"
		
		return {
			"success": True,
			"message": "Login successful",
			"user": {
				"name": user.name,
				"full_name": user.full_name,
				"email": user.email,
				"roles": roles,
				"user_type": user_type
			}
		}
	except frappe.exceptions.AuthenticationError:
		return {"success": False, "error": "Invalid credentials"}
	except Exception as e:
		frappe.log_error(f"Login error: {str(e)}")
		return {"success": False, "error": "Login failed"}

@frappe.whitelist()
def logout():
	"""Custom logout endpoint"""
	try:
		frappe.local.login_manager.logout()
		return {"success": True, "message": "Logout successful"}
	except Exception as e:
		frappe.log_error(f"Logout error: {str(e)}")
		return {"success": False, "error": "Logout failed"}

@frappe.whitelist(allow_guest=True)
def register_member(full_name, email, password, phone=None):
	"""Register new library member"""
	try:
		# Check if user already exists
		if frappe.db.exists("User", email):
			return {"success": False, "error": "User with this email already exists"}
		
		# Generate membership ID
		membership_id = generate_membership_id()
		
		# Create User
		user = frappe.get_doc({
			"doctype": "User",
			"email": email,
			"first_name": full_name.split()[0],
			"last_name": " ".join(full_name.split()[1:]) if len(full_name.split()) > 1 else "",
			"full_name": full_name,
			"new_password": password,
			"user_type": "Website User"
		})
		user.insert(ignore_permissions=True)
		
		# Add Library Member role
		user.add_roles("Library Member")
		
		# Create Member record
		member = frappe.get_doc({
			"doctype": "Member",
			"name1": full_name,
			"membership_id": membership_id,
			"email": email,
			"phone": phone,
			"status": "Active"
		})
		member.insert(ignore_permissions=True)
		
		return {
			"success": True,
			"message": "Registration successful",
			"data": {
				"membership_id": membership_id,
				"email": email
			}
		}
	except Exception as e:
		frappe.log_error(f"Registration error: {str(e)}")
		return {"success": False, "error": str(e)}

def generate_membership_id():
	"""Generate unique membership ID"""
	from datetime import datetime
	
	year = datetime.now().year
	
	# Get the last membership ID for this year
	last_member = frappe.db.sql("""
		SELECT membership_id FROM `tabMember`
		WHERE membership_id LIKE %(pattern)s
		ORDER BY membership_id DESC
		LIMIT 1
	""", {"pattern": f"LIB-{year}-%"})
	
	if last_member:
		last_id = last_member[0][0]
		sequence = int(last_id.split('-')[2]) + 1
	else:
		sequence = 1
	
	return f"LIB-{year}-{sequence:03d}"

@frappe.whitelist()
def get_current_user():
	"""Get current user information"""
	try:
		if frappe.session.user == "Guest":
			return {"success": False, "error": "Not authenticated"}
		
		user = frappe.get_doc("User", frappe.session.user)
		roles = [role.role for role in user.roles]
		
		# Get member record if exists
		member = None
		if frappe.db.exists("Member", {"email": user.email}):
			member = frappe.get_doc("Member", {"email": user.email})
		
		user_type = "member"
		if "System Manager" in roles:
			user_type = "admin"
		elif "Librarian" in roles:
			user_type = "librarian"
		
		return {
			"success": True,
			"user": {
				"name": user.name,
				"full_name": user.full_name,
				"email": user.email,
				"roles": roles,
				"user_type": user_type,
				"member": member.as_dict() if member else None
			}
		}
	except Exception as e:
		frappe.log_error(f"Get current user error: {str(e)}")
		return {"success": False, "error": str(e)}

@frappe.whitelist()
def change_password(old_password, new_password):
	"""Change user password"""
	try:
		user = frappe.get_doc("User", frappe.session.user)
		
		# Verify old password
		if not user.check_password(old_password):
			return {"success": False, "error": "Current password is incorrect"}
		
		# Update password
		user.new_password = new_password
		user.save(ignore_permissions=True)
		
		return {"success": True, "message": "Password changed successfully"}
	except Exception as e:
		frappe.log_error(f"Change password error: {str(e)}")
		return {"success": False, "error": str(e)}
