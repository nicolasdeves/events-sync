from fastapi import FastAPI
from fastapi.responses import FileResponse
from fpdf import FPDF
from fastapi.responses import FileResponse

import uuid
import os
import sqlite3

app = FastAPI()

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
    arquivo TEXT NOT NULL
);
""")
conn.commit()
conn.close()

@app.post("/gerar-certificado/{nome}")
def gerar_certificado(nome: str):
    certificado_uuid = str(uuid.uuid4())
    arquivo_pdf = os.path.join(PASTA_ARQUIVOS, f"{certificado_uuid}.pdf") 

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 24)
    pdf.cell(0, 20, "Certificado de Participação", ln=True, align='C')
    pdf.ln(20)
    pdf.set_font("Arial", '', 16)
    pdf.multi_cell(0, 10, f"Certificamos que {nome} participou do nosso evento.")
    pdf.output(arquivo_pdf)

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO certificados (uuid, nome, arquivo) VALUES (?, ?, ?)",
                   (certificado_uuid, nome, arquivo_pdf))
    conn.commit()
    conn.close()

    return {"uuid": certificado_uuid, "arquivo": arquivo_pdf}


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


