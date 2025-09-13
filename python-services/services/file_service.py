#!/usr/bin/env python3
"""
File Service - Python Brain
Handles all file upload, download, storage, and management
"""

import logging
import os
import hashlib
import mimetypes
from datetime import datetime
from typing import Dict, List, Any, Optional
import secrets
import uuid

logger = logging.getLogger(__name__)

class FileService:
    """File service handling all file operations and storage"""

    def __init__(self, nodejs_connector=None):
        self.nodejs_connector = nodejs_connector
        self.upload_dir = "/tmp/smartstart_uploads"
        self.max_file_size = 50 * 1024 * 1024  # 50MB
        self.allowed_extensions = {
            'images': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
            'documents': ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
            'spreadsheets': ['.xls', '.xlsx', '.csv'],
            'presentations': ['.ppt', '.pptx'],
            'archives': ['.zip', '.rar', '.7z', '.tar', '.gz'],
            'videos': ['.mp4', '.avi', '.mov', '.wmv', '.flv'],
            'audio': ['.mp3', '.wav', '.flac', '.aac']
        }
        self._ensure_upload_dir()
        logger.info("📁 File Service initialized")

    def upload_file(self, file_data: bytes, filename: str, user_id: str, 
                   file_type: str = 'document', metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Upload and store a file"""
        try:
            # Validate file size
            if len(file_data) > self.max_file_size:
                return {
                    "success": False,
                    "message": f"File too large. Maximum size: {self.max_file_size // (1024*1024)}MB",
                    "error_code": "FILE_TOO_LARGE"
                }

            # Validate file extension
            file_ext = os.path.splitext(filename)[1].lower()
            if not self._is_allowed_extension(file_ext, file_type):
                return {
                    "success": False,
                    "message": f"File type not allowed: {file_ext}",
                    "error_code": "INVALID_FILE_TYPE"
                }

            # Generate unique file ID and path
            file_id = str(uuid.uuid4())
            file_hash = hashlib.sha256(file_data).hexdigest()
            safe_filename = self._sanitize_filename(filename)
            file_path = os.path.join(self.upload_dir, f"{file_id}_{safe_filename}")

            # Save file to disk
            with open(file_path, 'wb') as f:
                f.write(file_data)

            # Get file metadata
            file_size = len(file_data)
            mime_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'

            # Create file record
            file_record = {
                "id": file_id,
                "original_name": filename,
                "stored_name": f"{file_id}_{safe_filename}",
                "file_path": file_path,
                "file_size": file_size,
                "mime_type": mime_type,
                "file_hash": file_hash,
                "file_type": file_type,
                "user_id": user_id,
                "uploaded_at": datetime.now().isoformat(),
                "metadata": metadata or {}
            }

            # Store file record in database
            if self.nodejs_connector:
                result = self.nodejs_connector.create_file_record(file_record)
                if not result.get('success'):
                    # Clean up file if database save fails
                    os.remove(file_path)
                    return result

            return {
                "success": True,
                "message": "File uploaded successfully",
                "data": {
                    "file_id": file_id,
                    "filename": filename,
                    "file_size": file_size,
                    "mime_type": mime_type,
                    "file_type": file_type,
                    "uploaded_at": file_record['uploaded_at']
                }
            }

        except Exception as e:
            logger.error(f"File upload error: {e}")
            return {
                "success": False,
                "message": "File upload failed",
                "error": str(e)
            }

    def download_file(self, file_id: str, user_id: str) -> Dict[str, Any]:
        """Download a file by ID"""
        try:
            # Get file record from database
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            file_result = self.nodejs_connector.get_file_record(file_id)
            if not file_result.get('success'):
                return file_result

            file_record = file_result['data']
            
            # Check if user has permission to download
            if file_record.get('user_id') != user_id:
                # Check if user has admin permissions
                user_result = self.nodejs_connector.get_user(user_id)
                if not user_result.get('success') or user_result['data'].get('role') not in ['ADMIN', 'SUPER_ADMIN']:
                    return {
                        "success": False,
                        "message": "Access denied",
                        "error_code": "ACCESS_DENIED"
                    }

            # Check if file exists on disk
            file_path = file_record['file_path']
            if not os.path.exists(file_path):
                return {
                    "success": False,
                    "message": "File not found on disk",
                    "error_code": "FILE_NOT_FOUND"
                }

            # Read file data
            with open(file_path, 'rb') as f:
                file_data = f.read()

            return {
                "success": True,
                "data": {
                    "file_data": file_data,
                    "filename": file_record['original_name'],
                    "mime_type": file_record['mime_type'],
                    "file_size": file_record['file_size']
                }
            }

        except Exception as e:
            logger.error(f"File download error: {e}")
            return {
                "success": False,
                "message": "File download failed",
                "error": str(e)
            }

    def get_file_info(self, file_id: str, user_id: str) -> Dict[str, Any]:
        """Get file information without downloading"""
        try:
            # Get file record from database
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            file_result = self.nodejs_connector.get_file_record(file_id)
            if not file_result.get('success'):
                return file_result

            file_record = file_result['data']
            
            # Check if user has permission to view
            if file_record.get('user_id') != user_id:
                # Check if user has admin permissions
                user_result = self.nodejs_connector.get_user(user_id)
                if not user_result.get('success') or user_result['data'].get('role') not in ['ADMIN', 'SUPER_ADMIN']:
                    return {
                        "success": False,
                        "message": "Access denied",
                        "error_code": "ACCESS_DENIED"
                    }

            return {
                "success": True,
                "data": {
                    "file_id": file_record['id'],
                    "filename": file_record['original_name'],
                    "file_size": file_record['file_size'],
                    "mime_type": file_record['mime_type'],
                    "file_type": file_record['file_type'],
                    "uploaded_at": file_record['uploaded_at'],
                    "metadata": file_record.get('metadata', {})
                }
            }

        except Exception as e:
            logger.error(f"Get file info error: {e}")
            return {
                "success": False,
                "message": "Failed to get file info",
                "error": str(e)
            }

    def list_user_files(self, user_id: str, file_type: str = None, 
                       page: int = 1, limit: int = 50) -> Dict[str, Any]:
        """List files for a user"""
        try:
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            # Get files from database
            files_result = self.nodejs_connector.get_user_files(
                user_id, file_type, page, limit
            )
            if not files_result.get('success'):
                return files_result

            files = files_result['data']['files']
            total = files_result['data']['total']

            # Format file list
            file_list = []
            for file_record in files:
                file_list.append({
                    "file_id": file_record['id'],
                    "filename": file_record['original_name'],
                    "file_size": file_record['file_size'],
                    "mime_type": file_record['mime_type'],
                    "file_type": file_record['file_type'],
                    "uploaded_at": file_record['uploaded_at']
                })

            return {
                "success": True,
                "data": {
                    "files": file_list,
                    "pagination": {
                        "page": page,
                        "limit": limit,
                        "total": total,
                        "pages": (total + limit - 1) // limit
                    }
                }
            }

        except Exception as e:
            logger.error(f"List files error: {e}")
            return {
                "success": False,
                "message": "Failed to list files",
                "error": str(e)
            }

    def delete_file(self, file_id: str, user_id: str) -> Dict[str, Any]:
        """Delete a file"""
        try:
            # Get file record from database
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            file_result = self.nodejs_connector.get_file_record(file_id)
            if not file_result.get('success'):
                return file_result

            file_record = file_result['data']
            
            # Check if user has permission to delete
            if file_record.get('user_id') != user_id:
                # Check if user has admin permissions
                user_result = self.nodejs_connector.get_user(user_id)
                if not user_result.get('success') or user_result['data'].get('role') not in ['ADMIN', 'SUPER_ADMIN']:
                    return {
                        "success": False,
                        "message": "Access denied",
                        "error_code": "ACCESS_DENIED"
                    }

            # Delete file from disk
            file_path = file_record['file_path']
            if os.path.exists(file_path):
                os.remove(file_path)

            # Delete file record from database
            delete_result = self.nodejs_connector.delete_file_record(file_id)
            if not delete_result.get('success'):
                return delete_result

            return {
                "success": True,
                "message": "File deleted successfully"
            }

        except Exception as e:
            logger.error(f"Delete file error: {e}")
            return {
                "success": False,
                "message": "File deletion failed",
                "error": str(e)
            }

    def generate_upload_url(self, user_id: str, file_type: str = 'document', 
                           expires_in: int = 3600) -> Dict[str, Any]:
        """Generate a pre-signed upload URL"""
        try:
            # Generate upload token
            upload_token = secrets.token_urlsafe(32)
            expires_at = datetime.now().timestamp() + expires_in

            # Store upload token in database
            if self.nodejs_connector:
                self.nodejs_connector.store_upload_token(
                    upload_token, user_id, file_type, expires_at
                )

            return {
                "success": True,
                "data": {
                    "upload_token": upload_token,
                    "expires_at": expires_at,
                    "expires_in": expires_in,
                    "max_file_size": self.max_file_size,
                    "allowed_extensions": self.allowed_extensions.get(file_type, [])
                }
            }

        except Exception as e:
            logger.error(f"Generate upload URL error: {e}")
            return {
                "success": False,
                "message": "Failed to generate upload URL",
                "error": str(e)
            }

    def upload_with_token(self, upload_token: str, file_data: bytes, 
                         filename: str) -> Dict[str, Any]:
        """Upload file using pre-signed token"""
        try:
            # Validate upload token
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            token_result = self.nodejs_connector.get_upload_token(upload_token)
            if not token_result.get('success'):
                return {
                    "success": False,
                    "message": "Invalid or expired upload token",
                    "error_code": "INVALID_UPLOAD_TOKEN"
                }

            token_data = token_result['data']
            user_id = token_data['user_id']
            file_type = token_data['file_type']

            # Upload file
            return self.upload_file(file_data, filename, user_id, file_type)

        except Exception as e:
            logger.error(f"Upload with token error: {e}")
            return {
                "success": False,
                "message": "Upload with token failed",
                "error": str(e)
            }

    def _ensure_upload_dir(self):
        """Ensure upload directory exists"""
        if not os.path.exists(self.upload_dir):
            os.makedirs(self.upload_dir, exist_ok=True)

    def _is_allowed_extension(self, file_ext: str, file_type: str) -> bool:
        """Check if file extension is allowed for the file type"""
        allowed_exts = self.allowed_extensions.get(file_type, [])
        return file_ext in allowed_exts

    def _sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for safe storage"""
        # Remove or replace dangerous characters
        safe_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_."
        return ''.join(c for c in filename if c in safe_chars)

    def get_storage_stats(self, user_id: str = None) -> Dict[str, Any]:
        """Get storage statistics"""
        try:
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            stats_result = self.nodejs_connector.get_file_storage_stats(user_id)
            if not stats_result.get('success'):
                return stats_result

            stats = stats_result['data']

            return {
                "success": True,
                "data": {
                    "total_files": stats.get('total_files', 0),
                    "total_size": stats.get('total_size', 0),
                    "file_types": stats.get('file_types', {}),
                    "storage_used_mb": round(stats.get('total_size', 0) / (1024 * 1024), 2)
                }
            }

        except Exception as e:
            logger.error(f"Get storage stats error: {e}")
            return {
                "success": False,
                "message": "Failed to get storage stats",
                "error": str(e)
            }
