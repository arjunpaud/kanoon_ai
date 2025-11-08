from pydantic import EmailStr
from sqlmodel import Field, SQLModel


class AccountBase(SQLModel):
    email: EmailStr = Field(
        index=True, unique=True, description="The email of user account"
    )


class Account(AccountBase, table=True):
    id: int | None = Field(
        default=None, primary_key=True, description="The unique identifier or pk"
    )
    password: str = Field(index=True, description="The password of user account")


class AccountPublic(AccountBase):
    id: int


class AccountCreate(AccountBase):
    password: str
    password2: str
