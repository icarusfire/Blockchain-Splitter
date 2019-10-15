Generic version of Splinter. Supports multiple users to be added/removed to receive ether.
 - The owner of the contract can add/remove more than 3 users to list.
 - If a user in this list sends ether to be splitted, amount will be splitted to (total_number_of_users_registered_in_contract - 1). 
 - Some flags are added but not yet implemented:
     Enable/disable users who can receive/split ether.
	 An admin flag so this user can add/remove other users to this list
	 