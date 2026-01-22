#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script: converte-arquivos-csharp-em-txt-unico (versão 1.1)
Descrição:
  Percorre recursivamente um projeto C#, concatena todos os .cs
  num único .txt e separa cada arquivo por blocos-comentário contendo
  caminho relativo, namespace e nome do tipo definido (classe, struct, etc.).

Uso:
  python converte_cs_em_txt_unico.py [caminho/do/projeto]
"""

import os
import sys
import argparse
import re
from datetime import datetime
from typing import List, Optional


def gerar_arvore_diretorios(startpath: str) -> str:
    """Gera a árvore de diretórios a partir de startpath, ignorando bin/obj."""
    linhas = []
    for root, dirs, _ in os.walk(startpath):
        # Ignora diretórios de build e versionamento
        dirs[:] = [d for d in dirs if d.lower() not in ('bin', 'obj', '.git')]
        level = root.replace(startpath, '').count(os.sep)
        indent = ' ' * 4 * level
        linhas.append(f"{indent}{os.path.basename(root)}/")
        dirs.sort()
    return "\n".join(linhas)


def read_file(path: str) -> str:
    """Tenta ler arquivo usando várias codificações para evitar UnicodeDecodeError."""
    encodings = ('utf-8', 'utf-8-sig', 'latin-1', 'cp1252')
    for enc in encodings:
        try:
            with open(path, encoding=enc) as f:
                return f.read()
        except UnicodeDecodeError:
            continue
    # fallback ignorando erros
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()


def extrair_namespace(txt: str) -> Optional[str]:
    """Extrai o namespace declarado no arquivo C#."""
    m = re.search(r'^\s*namespace\s+([\w\.]+)', txt, re.MULTILINE)
    return m.group(1) if m else None


def extrair_nome_tipo(txt: str) -> Optional[str]:
    """Extrai o nome do primeiro tipo definido (class, struct, interface, record)."""
    m = re.search(r'\b(class|struct|interface|record)\s+(\w+)', txt)
    return m.group(2) if m else None


def listar_arquivos_cs(pasta: str) -> List[str]:
    """Lista todos os arquivos .cs na pasta e subpastas, ignorando bin/obj/.git."""
    arquivos = []
    for root, dirs, files in os.walk(pasta):
        dirs[:] = [d for d in dirs if d.lower() not in ('bin', 'obj', '.git')]
        for f in files:
            if f.endswith('.cs'):
                arquivos.append(os.path.join(root, f))
    return sorted(arquivos)


def main() -> None:
    parser = argparse.ArgumentParser(
        description='Concatena todos os arquivos .cs em um único .txt com anotações.'
    )
    parser.add_argument('project_path', nargs='?',
                        help='(Opcional) Caminho da pasta raiz do projeto C#')
    args = parser.parse_args()

    projeto = args.project_path or input(
        'Informe o caminho da pasta do projeto C#: '
    ).strip()

    if not os.path.isdir(projeto):
        print(f"Erro: '{projeto}' não é um diretório válido.")
        sys.exit(1)

    saida = 'convertidosCsemTxt.txt'
    agora = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    arquivos_cs = listar_arquivos_cs(projeto)

    linha_sep = '//' + '―' * 100 + '\n'

    with open(saida, 'w', encoding='utf-8') as out:

        # Cabeçalho global
        out.write('// Script: converte-arquivos-csharp-em-txt-unico (v1.1)\n')
        out.write(f'// Data de criação do arquivo de saída: {agora}\n\n')

        out.write('// Estrutura de diretórios do projeto:\n')
        out.write(gerar_arvore_diretorios(projeto) + '\n\n')

        out.write('// Arquivos encontrados (Namespace.Tipo => caminho relativo):\n')
        for arq in arquivos_cs:
            rel = os.path.relpath(arq, projeto)
            txt = read_file(arq)
            nome_tipo = extrair_nome_tipo(txt) or os.path.splitext(os.path.basename(arq))[0]
            namespace = extrair_namespace(txt)
            fqn = f"{namespace}.{nome_tipo}" if namespace else nome_tipo
            out.write(f'// {fqn} => {rel}\n')
        out.write('\n')

        # Conteúdo de cada arquivo
        for arq in arquivos_cs:
            rel = os.path.relpath(arq, projeto)
            conteudo = read_file(arq)

            nome_tipo = extrair_nome_tipo(conteudo) or os.path.splitext(os.path.basename(arq))[0]
            namespace = extrair_namespace(conteudo) or '(namespace padrão)'

            # Bloco de separação + metadados
            out.write('\n\n\n')  # 3 linhas em branco entre arquivos
            out.write(linha_sep)
            out.write(f"// Caminho: {rel}\n")
            out.write(f"// Namespace: {namespace}\n")
            out.write(f"// Tipo: {nome_tipo}\n")
            out.write(linha_sep + '\n')

            out.write(conteudo.rstrip())  # remove linha em branco no final do arquivo
            out.write('\n')  # mantém separação suave

    print(f"Concluído! Arquivo de saída gerado: {saida}")


if __name__ == '__main__':
    main()
