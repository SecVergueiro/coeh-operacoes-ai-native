"""Exporta as células originais do XLSX para consulta, sem alterar a fonte."""
import json
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

def main():
    with ZipFile(ROOT / "dados/originais/mensagens-ficticias-coeh.xlsx") as archive:
        strings = []
        if "xl/sharedStrings.xml" in archive.namelist():
            strings = ["".join(node.itertext()) for node in ET.fromstring(archive.read("xl/sharedStrings.xml")).findall("s:si", NS)]
        sheet = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
        rows = {}
        for row in sheet.findall(".//s:sheetData/s:row", NS):
            cells = []
            for cell in row.findall("s:c", NS):
                value = cell.find("s:v", NS)
                text = value.text if value is not None else "".join(cell.itertext())
                cells.append(strings[int(text)] if cell.get("t") == "s" else text)
            if int(row.get("r")) > 1:
                rows[row.get("r")] = cells
    (ROOT / "painel/mensagens.js").write_text("window.COEH_MESSAGES = " + json.dumps(rows, ensure_ascii=False).replace("</", "<\\/") + ";\n", encoding="utf-8")
    print(f"{len(rows)} mensagens exportadas da fonte original")

if __name__ == "__main__":
    main()
