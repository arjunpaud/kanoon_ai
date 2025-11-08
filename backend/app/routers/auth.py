from typing import Annotated
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_session
from app.passutils import get_password_hash
from app.models import Account, AccountCreate, AccountPublic

router = APIRouter(tags=["auth"], prefix="/api/auth")


@router.post("/register", response_model=AccountPublic)
def register_user_account(
    account: AccountCreate, session: Annotated[Session, Depends(get_session)]
):
    if not account.password == account.password2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Input passwords must match"
        )

    existing_account = session.exec(
        select(Account).where(Account.email == account.email)
    ).first()
    if existing_account:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Email is already in use"
        )

    db_account = Account.model_validate(account)
    hashed_password = get_password_hash(account.password)
    db_account.password = hashed_password

    try:
        session.add(db_account)
        session.commit()
        session.refresh(db_account)
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return db_account
