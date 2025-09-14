#!/usr/bin/env python3
"""
SmartStart Python Brain - Production Startup Script
"""

import os
import sys
from clean_brain_fixed import app

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('NODE_ENV', 'production') != 'production'
    
    print(f"🚀 Starting SmartStart Python Brain on port {port}")
    print(f"🔧 Debug mode: {debug}")
    print(f"🌍 Environment: {os.getenv('NODE_ENV', 'development')}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
