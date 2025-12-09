from fastapi import FastAPI
from fastapi.responses import FileResponse
from fpdf import FPDF
from fastapi.responses import FileResponse
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

import uuid
import os
import sqlite3

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = "certificados.db"
PASTA_ARQUIVOS = "arquivos"
os.makedirs(PASTA_ARQUIVOS, exist_ok=True)

conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()
cursor.execute("""
CREATE TABLE IF NOT EXISTS certificados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL,
    nome TEXT NOT NULL,
    evento TEXT NOT NULL,
    arquivo TEXT NOT NULL,
    created_at TEXT NOT NULL
);
""")
conn.commit()
conn.close()

@app.post("/gerar-certificado/{evento}/{pessoa}")
def gerar_certificado(evento: str, pessoa: str):
    certificado_uuid = str(uuid.uuid4())
    arquivo_pdf = os.path.join(PASTA_ARQUIVOS, f"{certificado_uuid}.pdf")
    data_criacao = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    pdf = FPDF()
    pdf.add_page()

    # borda
    pdf.set_line_width(2)
    pdf.rect(10, 10, 190, 277)

    # título
    pdf.ln(30)
    pdf.set_font("Arial", "B", 26)
    pdf.cell(0, 20, "CERTIFICADO", ln=True, align="C")

    pdf.ln(15)

    # texto principal
    pdf.set_font("Arial", "", 14)
    pdf.multi_cell(
        0,
        10,
        "Certificamos, para os devidos fins, que",
        align="C"
    )

    pdf.ln(5)

    # nome da pessoa (destaque)
    pdf.set_font("Arial", "B", 20)
    pdf.cell(0, 15, pessoa.upper(), ln=True, align="C")

    pdf.ln(5)

    # evento
    pdf.set_font("Arial", "", 14)
    pdf.multi_cell(
        0,
        10,
        f"participou do evento\n\"{evento}\"",
        align="C"
    )

    pdf.ln(10)

    # texto final
    pdf.set_font("Arial", "", 12)
    pdf.multi_cell(
        0,
        8,
        "Este certificado é concedido como reconhecimento pela participação e envolvimento no evento.",
        align="C"
    )

    # data
    pdf.ln(20)
    pdf.set_font("Arial", "I", 11)
    data = datetime.now().strftime("%d/%m/%Y")
    pdf.cell(0, 10, f"Emitido em {data}", ln=True, align="C")
    pdf.cell(0, 10, f"Código de validação {certificado_uuid}", ln=True, align="C")

    pdf.output(arquivo_pdf)

    # salva no banco
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO certificados (uuid, nome, evento, arquivo, created_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        (certificado_uuid, pessoa, evento, arquivo_pdf, data_criacao)
    )
    conn.commit()
    conn.close()

    return {
        "uuid": certificado_uuid,
        "arquivo": arquivo_pdf
    }


@app.get("/baixar-certificado/{certificado_id}")
def baixar_certificado(certificado_id: str):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT arquivo FROM certificados WHERE uuid = ?", (certificado_id,))
    result = cursor.fetchone()
    conn.close()

    if not result:
        return {"erro": "Certificado não encontrado"}

    arquivo_pdf = result[0]
    arquivo_pdf = os.path.join(PASTA_ARQUIVOS, os.path.basename(arquivo_pdf))

    if not os.path.exists(arquivo_pdf):
        return {"erro": "Arquivo não encontrado"}

    return FileResponse(
        arquivo_pdf,
        media_type='application/pdf',
        headers={"Content-Disposition": f'inline; filename="{os.path.basename(arquivo_pdf)}"'}
    )

@app.get("/validar-certificado/{certificado_id}")
def validar_certificado(certificado_id: str):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT nome, evento, created_at, arquivo FROM certificados WHERE uuid = ?",
        (certificado_id,)
    )
    result = cursor.fetchone()
    conn.close()

    if not result:
        return {"valido": False, "mensagem": "Certificado não encontrado"}

    nome, evento, created_at, arquivo_pdf = result
    
    return {
        "valido": True,
        "nome": nome,
        "evento": evento,
        "data_criacao": created_at,
        "arquivo": arquivo_pdf
    }
