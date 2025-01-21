
# Utility function to validate hexadecimal strings
def is_hex(s):
    try:
        bytes.fromhex(s)
        return True
    except ValueError:
        return False
