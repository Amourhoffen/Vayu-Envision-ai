import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, auth

security = HTTPBearer(auto_error=False)

# Initialize Firebase Admin if credentials exist
firebase_creds_path = os.environ.get("FIREBASE_CREDENTIALS_JSON")
if firebase_creds_path and os.path.exists(firebase_creds_path):
    cred = credentials.Certificate(firebase_creds_path)
    firebase_admin.initialize_app(cred)
    FIREBASE_INITIALIZED = True
    print("Firebase Admin initialized successfully.")
else:
    FIREBASE_INITIALIZED = False
    print("WARNING: Firebase credentials not found. Authentication will be bypassed or fail.")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verifies the Firebase JWT token."""
    if not FIREBASE_INITIALIZED:
        # Fallback for local development without Firebase
        print("Bypassing Auth: Firebase not initialized.")
        return {"uid": "local_mock_user", "email": "mock@envision.ai"}

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Missing authentication token"
        )
        
    try:
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

from sqlalchemy.orm import Session
from database import get_db
import models

def get_current_user(
    decoded_token: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Fetches the internal User object based on the Firebase token."""
    uid = decoded_token.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid token payload")
        
    user = db.query(models.User).filter(models.User.firebase_uid == uid).first()
    if not user:
        if not FIREBASE_INITIALIZED and uid == "local_mock_user":
            user = models.User(firebase_uid=uid, username="MockCitizen", name="Mock User", eco_points=150)
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            raise HTTPException(status_code=404, detail="User not found in DB")
        
    return user
