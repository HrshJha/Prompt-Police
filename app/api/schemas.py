from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="User prompt to classify.")


class PredictResponse(BaseModel):
    prediction: str = Field(..., pattern="^(SAFE|ADVERSARIAL)$")
    confidence: float = Field(..., ge=0.0, le=1.0)
