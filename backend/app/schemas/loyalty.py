from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional

class LoyaltyTransactionInDB(BaseModel):
    TransactionID: int
    Amount: int
    TransactionType: str
    Description: str
    CreatedAt: datetime
    model_config = ConfigDict(from_attributes=True)

class LoyaltyAccountInDB(BaseModel):
    AccountID: int
    Balance: int
    transactions: List[LoyaltyTransactionInDB] = []
    model_config = ConfigDict(from_attributes=True)

class AwardPointsRequest(BaseModel):
    qr_string: str
    amount: int
    description: str