import io
import logging

from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import pdfplumber

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nlp")

MODEL_NAME = "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"

app = FastAPI(title="CreditPath NLP")

model: SentenceTransformer | None = None
model_ready = False


@app.on_event("startup")
def load_model() -> None:
    global model, model_ready
    logger.info("Cargando modelo %s", MODEL_NAME)
    model = SentenceTransformer(MODEL_NAME)
    model_ready = True
    logger.info("Modelo listo (dim=%d)", model.get_sentence_embedding_dimension())


class EmbedRequest(BaseModel):
    text: str


class EmbedResponse(BaseModel):
    embedding: list[float]


class EmbedPdfResponse(BaseModel):
    text: str
    embedding: list[float]


@app.get("/health")
def health():
    if not model_ready:
        raise HTTPException(status_code=503, detail="model not ready")
    return {"status": "ok"}


def _embed(text: str) -> list[float]:
    if model is None:
        raise HTTPException(status_code=503, detail="model not ready")
    text = (text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="text vacío")
    vec = model.encode(text, normalize_embeddings=True)
    return vec.tolist()


@app.post("/embed", response_model=EmbedResponse)
def embed(req: EmbedRequest):
    return EmbedResponse(embedding=_embed(req.text))


class EmbedBatchRequest(BaseModel):
    texts: list[str]


class EmbedBatchResponse(BaseModel):
    embeddings: list[list[float]]


@app.post("/embed-batch", response_model=EmbedBatchResponse)
def embed_batch(req: EmbedBatchRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="model not ready")
    texts = [t.strip() for t in req.texts if t.strip()]
    if not texts:
        raise HTTPException(status_code=400, detail="texts vacío")
    vecs = model.encode(texts, normalize_embeddings=True)
    return EmbedBatchResponse(embeddings=[v.tolist() for v in vecs])


@app.post("/embed-pdf", response_model=EmbedPdfResponse)
async def embed_pdf(file: UploadFile = File(...)):
    if file.content_type not in {"application/pdf", "application/octet-stream"} and not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="se esperaba un archivo PDF")
    raw = await file.read()
    try:
        with pdfplumber.open(io.BytesIO(raw)) as pdf:
            text = "\n".join((page.extract_text() or "") for page in pdf.pages)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"no se pudo extraer texto del PDF: {exc}")
    text = text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="PDF sin texto extraíble")
    return EmbedPdfResponse(text=text, embedding=_embed(text))
