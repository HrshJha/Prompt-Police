from fastapi import APIRouter, HTTPException

from app.api.schemas import PredictRequest, PredictResponse
from app.inference.pipeline import get_pipeline

router = APIRouter(tags=["prediction"])


@router.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest) -> PredictResponse:
    prompt = payload.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt must not be empty.")

    result = get_pipeline().predict(prompt)
    return PredictResponse(**result)
