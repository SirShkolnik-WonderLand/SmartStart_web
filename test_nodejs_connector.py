#!/usr/bin/env python3
"""
Test NodeJSConnector import and functionality
"""

import sys
import os

# Add the services directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'python-services', 'services'))

try:
    from nodejs_connector import NodeJSConnector
    print("✅ NodeJSConnector imported successfully")
    
    # Test the connector
    connector = NodeJSConnector()
    print("✅ NodeJSConnector initialized successfully")
    
    # Test database connection
    if connector.test_connection():
        print("✅ Database connection test successful")
        
        # Test a simple query
        result = connector.query("SELECT COUNT(*) FROM \"User\"")
        print(f"✅ Query test successful: {result}")
    else:
        print("❌ Database connection test failed")
        
except ImportError as e:
    print(f"❌ NodeJSConnector import failed: {e}")
except Exception as e:
    print(f"❌ NodeJSConnector error: {e}")
