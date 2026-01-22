#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script: converte-codigo-em-txt-unico (versão 10)
Descrição:
  Percorre recursivamente um projeto Next.js (ou similar), concatena todos os
  arquivos .java, .ts, .js e .tsx em um único .txt, separando cada arquivo
  por blocos-comentário contendo caminho relativo, tipo e nome do arquivo.
  Ignora qualquer diretório node_modules e arquivos .d.ts.
  No início do arquivo de saída, imprime a estrutura de diretórios inline,
  e sempre sobrescreve o arquivo anterior, removendo-o se já existir.
"""

import os
import sys
import argparse
import re
from datetime import datetime
from typing import List, Optional

# ───────────────────────── Funções utilitárias ────────────────────────── #

def gerar_arvore_diretorios(startpath: str) -> str:
    linhas = []
    for root, dirs, _ in os.walk(startpath):
        # remove node_modules para não entrar
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        # pula qualquer raiz dentro de node_modules
        if 'node_modules' in root.split(os.sep):
            continue
        level = root.replace(startpath, '').count(os.sep)
        indent = ' ' * 4 * level
        linhas.append(f"{indent}{os.path.basename(root)}/")
    return "\n".join(linhas)


def gerar_arvore_inline(startpath: str) -> str:
    """
    Gera uma representação inline da hierarquia de pastas,
    ignorando node_modules.
    """
    caminhos = []
    for root, dirs, _ in os.walk(startpath):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if 'node_modules' in root.split(os.sep):
            continue
        rel_root = os.path.relpath(root, startpath)
        caminhos.append(rel_root if rel_root != '.' else os.path.basename(startpath))
    return ' > '.join(sorted(caminhos))


def extrair_nome_classe_java(txt: str) -> Optional[str]:
    m = re.search(r'\bclass\s+(\w+)', txt)
    return m.group(1) if m else None


def extrair_pacote_java(txt: str) -> Optional[str]:
    m = re.search(r'^\s*package\s+([\w\.]+)\s*;', txt, re.MULTILINE)
    return m.group(1) if m else None


def listar_arquivos_codigo(pasta: str) -> List[str]:
    """
    Busca arquivos com extensões:
      - .java
      - .ts, .js
      - .tsx
    Ignora:
      - diretórios node_modules
      - arquivos .d.ts
    """
    exts = (".java", ".ts", ".js", ".tsx")
    arquivos: List[str] = []

    for root, dirs, files in os.walk(pasta):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if 'node_modules' in root.split(os.sep):
            continue
        for f in files:
            lname = f.lower()
            if lname.endswith('.d.ts'):
                continue
            if any(lname.endswith(ext) for ext in exts):
                arquivos.append(os.path.join(root, f))

    return sorted(arquivos)

# ──────────────────────────── Programa principal ───────────────────────── #

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Concatena .java, .ts, .js e .tsx em um único .txt com anotações."
    )
    parser.add_argument("project_path", nargs="?",
                        help="(Opcional) Caminho da pasta raiz do projeto")
    args = parser.parse_args()

    projeto = args.project_path or input(
        "Informe o caminho da pasta do projeto: ").strip()

    if not os.path.isdir(projeto):
        print(f"Erro: '{projeto}' não é um diretório válido.")
        sys.exit(1)

    saida = "convertidoCodigoEmTxt.txt"
    # Remove arquivo anterior para evitar repetições
    if os.path.exists(saida):
        try:
            os.remove(saida)
        except Exception as e:
            print(f"Aviso: não foi possível remover '{saida}': {e}")

    agora = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    arquivos = listar_arquivos_codigo(projeto)

    linha_sep = "//" + "―" * 100 + "\n"

    with open(saida, "w", encoding="utf-8") as out:
        # Cabeçalho
        out.write("// Script: converte-codigo-em-txt-unico (v10)\n")
        out.write(f"// Gerado em: {agora}\n\n")

        # Estrutura inline
        inline = gerar_arvore_inline(projeto)
        out.write(f"// Diretórios (inline): {inline}\n\n")

        # Estrutura completa
        out.write("// Diretórios (multi-line):\n")
        out.write(gerar_arvore_diretorios(projeto))
        out.write("\n\n")

        # Lista de arquivos
        out.write("// Arquivos encontrados (tipo => caminho relativo):\n")
        for arq in arquivos:
            rel = os.path.relpath(arq, projeto)
            ext = os.path.splitext(arq)[1].lower().lstrip('.')
            out.write(f"// {ext} => {rel}\n")
        out.write("\n")

        # Conteúdo
        for arq in arquivos:
            rel = os.path.relpath(arq, projeto)
            ext = os.path.splitext(arq)[1].lower()
            try:
                conteudo = open(arq, encoding="utf-8").read()
            except Exception as e:
                print(f"Aviso: não foi possível ler '{rel}': {e}")
                continue

            if ext == ".java":
                classe = extrair_nome_classe_java(conteudo) or os.path.splitext(os.path.basename(arq))[0]
                pacote = extrair_pacote_java(conteudo) or "(default package)"
                info = f"package {pacote} | class {classe}"
            else:
                nome = os.path.splitext(os.path.basename(arq))[0]
                info = f"arquivo {nome}{ext}"

            out.write(linha_sep)
            out.write(f"// {rel} | {info}\n")
            out.write(linha_sep + "\n")
            out.write(conteudo.rstrip())
            out.write("\n\n")

    print(f"Concluído! Arquivo de saída: {saida}")

if __name__ == "__main__":
    main()
