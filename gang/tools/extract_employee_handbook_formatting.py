"""Extract source formatting without rewriting handbook text or media.

This imports the existing extractor unchanged and traces its block creation in
memory. Output offsets use JavaScript UTF-16 units and each entry includes the
exact existing text as a guard. Source corrections are aligned only within the
one originating paragraph; unmatched characters are reported, never styled by
guessing or by a global phrase search.
"""
from __future__ import annotations

import argparse
from collections import Counter
from difflib import SequenceMatcher
import hashlib
import importlib.util
import json
from pathlib import Path
import re
from zipfile import ZipFile

from docx import Document
from docx.oxml.ns import qn
from docx.table import Table
from lxml import etree

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
      "a": "http://schemas.openxmlformats.org/drawingml/2006/main"}
HIGHLIGHTS = {
    "black": "000000", "blue": "0000FF", "cyan": "00FFFF", "green": "00FF00",
    "magenta": "FF00FF", "red": "FF0000", "yellow": "FFFF00", "white": "FFFFFF",
    "darkBlue": "000080", "darkCyan": "008080", "darkGreen": "008000",
    "darkMagenta": "800080", "darkRed": "800000", "darkYellow": "808000",
    "darkGray": "808080", "lightGray": "C0C0C0",
}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def val(node, attribute="val"):
    return node.get(qn("w:" + attribute)) if node is not None else None


def rgb(value):
    return "#" + value.upper() if value and re.fullmatch(r"[0-9a-fA-F]{6}", value) else None


def utf16_length(text):
    return len(text.encode("utf-16-le")) // 2


def clean_rich(chars):
    """Exactly the source extractor's clean_text, retaining character origins."""
    out = []
    for char, style in chars:
        if char.isspace():
            if out and out[-1][0] != " ":
                out.append((" ", style))
        else:
            out.append((char, style))
    if out and out[-1][0] == " ":
        out.pop()
    return out


def rich_text(chars):
    return "".join(char for char, _ in chars)


def joined_rich(parts):
    out = []
    for part in parts:
        if not part:
            continue
        if out:
            out.append(("\n", {}))
        out.extend(part)
    return out


class SourceStyles:
    def __init__(self, archive):
        styles = etree.fromstring(archive.read("word/styles.xml"))
        self.styles = {val(n, "styleId"): n for n in styles.findall("w:style", NS)}
        default = styles.find("w:docDefaults/w:rPrDefault/w:rPr", NS)
        self.default_style = next((k for k, n in self.styles.items()
                                   if val(n, "type") == "paragraph" and val(n, "default") == "1"), None)
        self.themes = {}
        if "word/theme/theme1.xml" in archive.namelist():
            theme = etree.fromstring(archive.read("word/theme/theme1.xml"))
            scheme = theme.find("a:themeElements/a:clrScheme", NS)
            if scheme is not None:
                for n in scheme:
                    child = next(iter(n), None)
                    if child is not None:
                        self.themes[etree.QName(n).localname] = child.get("lastClr") or child.get("val")
        self.defaults = self.apply({}, default)
        self.cache = {}

    def color(self, node, fill=False):
        if node is None:
            return None
        value = val(node, "fill" if fill else "val")
        theme = val(node, "themeFill" if fill else "themeColor")
        aliases = {"text1": "dk1", "text2": "dk2", "background1": "lt1", "background2": "lt2"}
        if theme:
            value = self.themes.get(aliases.get(theme, theme), value)
        color = rgb(value)
        if not color:
            return None
        channels = [int(color[i:i + 2], 16) for i in (1, 3, 5)]
        shade = val(node, "themeFillShade" if fill else "themeShade")
        tint = val(node, "themeFillTint" if fill else "themeTint")
        if shade:
            channels = [round(c * int(shade, 16) / 255) for c in channels]
        if tint:
            channels = [round(c + (255 - c) * int(tint, 16) / 255) for c in channels]
        return "#" + "".join(f"{c:02X}" for c in channels)

    def apply(self, inherited, rpr, style_definition=False):
        result = dict(inherited)
        if rpr is None:
            return result
        for tag, key in (("b", "bold"), ("strike", "strike")):
            node = rpr.find("w:" + tag, NS)
            if node is not None:
                on = val(node) not in ("0", "false", "off")
                # OOXML toggle properties toggle in styles, set directly in runs.
                if style_definition:
                    if on:
                        result[key] = not result.get(key, False)
                else:
                    result[key] = on
        underline = rpr.find("w:u", NS)
        if underline is not None:
            result["underline"] = val(underline) not in ("none", "0", "false", "off")
        node = rpr.find("w:color", NS)
        if node is not None:
            color = self.color(node)
            if color:
                result["color"] = color
            else:
                result.pop("color", None)
        node = rpr.find("w:highlight", NS)
        if node is not None:
            name = val(node)
            if name in HIGHLIGHTS:
                result["highlight"] = "#" + HIGHLIGHTS[name]
            elif name == "none":
                result.pop("highlight", None)
            else:
                raise ValueError("Unsupported source highlight: " + str(name))
        node = rpr.find("w:shd", NS)
        if node is not None:
            color = self.color(node, fill=True)
            if color:
                result["shading"] = color
            else:
                result.pop("shading", None)
        return result

    def chain(self, style_id, seen=()):
        if not style_id or style_id not in self.styles:
            return []
        if style_id in seen:
            raise ValueError("Cyclic source style: " + style_id)
        node = self.styles[style_id]
        parent = val(node.find("w:basedOn", NS))
        return self.chain(parent, seen + (style_id,)) + [node.find("w:rPr", NS)]

    def paragraph(self, paragraph):
        p_style = val(paragraph.find("w:pPr/w:pStyle", NS)) or self.default_style
        inherited = dict(self.defaults)
        for rpr in self.chain(p_style):
            inherited = self.apply(inherited, rpr, True)
        chars = []
        # Same direct run/hyperlink scope as CT_P.text; nested text boxes are
        # extracted separately and must never be duplicated here.
        for run in paragraph.xpath("./w:r | ./w:hyperlink/w:r"):
            rpr = run.find("w:rPr", NS)
            style = dict(inherited)
            for definition in self.chain(val(rpr.find("w:rStyle", NS)) if rpr is not None else None):
                style = self.apply(style, definition, True)
            style = self.apply(style, rpr)
            chars.extend((char, style) for char in (run.text or ""))
        expected = re.sub(r"\s+", " ", str(paragraph.text or "").replace("\xa0", " ")).strip()
        result = clean_rich(chars)
        if rich_text(result) != expected:
            raise ValueError("Source run extraction differs from CT_P.text")
        return result

    def cell_background(self, cell, table):
        for path, node in (("w:tcPr/w:shd", cell._tc), ("w:tblPr/w:shd", table._tbl)):
            shd = node.find(path, NS)
            if shd is not None:
                return self.color(shd, fill=True)
        return None


class FormattingTrace:
    def __init__(self, extractor, styles):
        self.e = extractor
        self.styles = styles
        self.current = None
        self.sources = {}
        self.heading_sources = []
        self.alignment_audit = []
        self.proofs = 0
        self.stats = Counter()

    def heading(self, index, item):
        if isinstance(item, Table) or index in self.e.DROP_ITEMS:
            return
        level = self.e.HEADING_LEVELS.get(item.style.name)
        text = self.e.clean_text(item.text)
        if not level or not text or index in self.e.DEMOTE_HEADING_TO_NOTICE or index in self.e.DEMOTE_HEADING_TO_PARAGRAPH:
            return
        _, title = self.e.split_embedded_heading(self.e.clean_heading(text))
        if index in self.e.TITLE_NOTICE_SPLITS:
            title = self.e.TITLE_NOTICE_SPLITS[index][0]
        if index in self.e.TITLE_REWRITES:
            title = self.e.TITLE_REWRITES[index][0]
        if not self.e.is_editorial_heading(title):
            self.heading_sources.append((title, {"source": {"bodyIndex": index}, "chars": self.styles.paragraph(item._p)}))

    def run(self, document, restorer):
        originals = {name: getattr(self.e, name) for name in ("iter_blocks", "shape_blocks", "table_block", "add_block")}

        def blocks(doc):
            for index, item in originals["iter_blocks"](doc):
                self.current = (index, item)
                self.heading(index, item)
                yield index, item

        def shapes(paragraph):
            result, fallback = originals["shape_blocks"](paragraph)
            items = []
            for order, txbx in enumerate(paragraph._p.findall(".//w:txbxContent", self.e.NS)):
                if self.e._under_fallback(txbx):
                    continue
                chars = joined_rich([self.styles.paragraph(p) for p in txbx.findall("w:p", self.e.NS)])
                if chars:
                    items.append({"order": order, "pos": self.e._shape_position(txbx), "chars": chars})
            items = self.e._order_shapes(items)
            if len(result) != len(items):
                raise ValueError("Source textbox count differs from extractor")
            for block, shape in zip(result, items):
                if block["text"] != rich_text(shape["chars"]):
                    raise ValueError("Source textbox text/order differs from extractor")
                self.sources[id(block)] = {"source": {"bodyIndex": self.current[0], "shapeIndex": shape["order"]}, "chars": shape["chars"]}
            return result, fallback

        def table(table, doc):
            block = originals["table_block"](table, doc)
            rows = []
            for row in table.rows:
                cells = []
                for cell in row.cells:
                    chars = joined_rich([self.styles.paragraph(p._p) for p in cell.paragraphs])
                    cells.append({"chars": chars, "background": self.styles.cell_background(cell, table)})
                if any(rich_text(c["chars"]) for c in cells):
                    rows.append(cells)
            if [[rich_text(c["chars"]) for c in row] for row in rows] != block["rows"]:
                raise ValueError("Source table text/order differs from extractor")
            self.sources[id(block)] = {"source": {"bodyIndex": self.current[0]}, "cells": rows}
            return block

        def add(target, block):
            if id(block) not in self.sources:
                index, item = self.current
                self.sources[id(block)] = {"source": {"bodyIndex": index}, "chars": self.styles.paragraph(item._p)}
            originals["add_block"](target, block)

        self.e.iter_blocks, self.e.shape_blocks, self.e.table_block, self.e.add_block = blocks, shapes, table, add
        try:
            return self.e.build_handbook(document, restorer)
        finally:
            for name, function in originals.items():
                setattr(self.e, name, function)

    def align(self, target, record, location):
        source = rich_text(record["chars"])
        output = [(char, {}) for char in target]
        index = record["source"]["bodyIndex"]
        if index in self.e.APPEND_NOTICE_AFTER and target == self.e.APPEND_NOTICE_AFTER[index][0]:
            # This notice is newly authored by the established source fix. Only
            # the literal deleted annotation comes from Word; matching generic
            # characters such as 注 elsewhere in the paragraph would be wrong.
            if source.count("删除") != 1 or target.count("删除") != 1:
                raise ValueError("Source deletion-note provenance changed")
            pairs = [(source.index("删除"), target.index("删除"), 2)]
            mode = "generated-notice-explicit-source-token"
        elif source == target:
            pairs = [(0, 0, len(source))]
            mode = "identical"
        elif target and source.count(target) == 1:
            pairs = [(source.index(target), 0, len(target))]
            mode = "exact-source-substring"
        elif source and target.endswith(source):
            pairs = [(0, len(target) - len(source), len(source))]
            mode = "source-with-generated-prefix"
        else:
            known = set(self.e.TEXT_REWRITES) | set(self.e.TITLE_REWRITES) | set(self.e.TITLE_NOTICE_SPLITS) | set(self.e.APPEND_NOTICE_AFTER)
            heading_cleanup = target == self.e.clean_heading(source)
            if target and index not in known and not heading_cleanup:
                raise ValueError(f"Unrecognized source transformation at {location}: {index}")
            pairs = [(m.a, m.b, m.size) for m in SequenceMatcher(None, source, target, autojunk=False).get_matching_blocks() if m.size]
            mode = "heading-cleanup-equal-characters-only" if heading_cleanup else "known-source-fix-equal-characters-only"
        mapped_source, mapped_target = set(), set()
        for old, new, size in pairs:
            if source[old:old + size] != target[new:new + size]:
                raise AssertionError("Non-identical formatting character mapping")
            for offset in range(size):
                output[new + offset] = (target[new + offset], dict(record["chars"][old + offset][1]))
                mapped_source.add(old + offset)
                mapped_target.add(new + offset)
                self.proofs += 1
        if mode != "identical":
            self.alignment_audit.append({"location": location, **record["source"], "mode": mode,
                "sourceText": source, "targetText": target,
                "unmappedTargetRanges": self.ranges(target, set(range(len(target))) - mapped_target),
                "omittedSourceRanges": self.ranges(source, set(range(len(source))) - mapped_source)})
        return self.spans(output)

    @staticmethod
    def ranges(text, positions):
        ranges = []
        for i in sorted(positions):
            if ranges and ranges[-1][1] == i:
                ranges[-1][1] = i + 1
            else:
                ranges.append([i, i + 1])
        return [{"start": utf16_length(text[:a]), "end": utf16_length(text[:b]), "text": text[a:b]} for a, b in ranges]

    def spans(self, chars):
        spans = []
        offset = 0
        for char, style in chars:
            end = offset + utf16_length(char)
            if style:
                if spans and spans[-1]["end"] == offset and {k: v for k, v in spans[-1].items() if k not in ("start", "end")} == style:
                    spans[-1]["end"] = end
                else:
                    spans.append({"start": offset, "end": end, **style})
                for key, value in style.items():
                    self.stats[key + ("OffCharacters" if value is False else "Characters")] += 1
            offset = end
        self.stats["spans"] += len(spans)
        return spans

    def metadata(self, handbook):
        nodes = {}
        headings = iter(self.heading_sources)
        def visit(section, path):
            key = "-".join(map(str, path)) if path else "$root"
            entry = {"blocks": {}}
            if path:
                title, record = next(headings)
                if title != section["title"]:
                    raise ValueError(f"Heading provenance mismatch at {key}: {title}")
                entry["title"] = {"text": title, "spans": self.align(title, record, key + "/title"), "source": record["source"]}
            for index, block in enumerate(section.get("blocks", [])):
                record = self.sources[id(block)]
                location = key + "/" + str(index)
                if block.get("kind") == "table":
                    cells = []
                    for row_index, row in enumerate(record["cells"]):
                        cellrow = []
                        for col_index, cell in enumerate(row):
                            text = block["rows"][row_index][col_index]
                            info = {"text": text, "spans": self.align(text, {**record, "chars": cell["chars"]}, f"{location}/cell/{row_index}/{col_index}")}
                            if cell["background"]:
                                info["background"] = cell["background"]
                            cellrow.append(info)
                        cells.append(cellrow)
                    entry["blocks"][str(index)] = {"source": record["source"], "cells": cells}
                    self.stats["tables"] += 1
                else:
                    text = block.get("text", "")
                    spans = self.align(text, record, location) if text else []
                    if spans:
                        entry["blocks"][str(index)] = {"text": text, "spans": spans, "source": record["source"]}
                        self.stats["formattedBlocks"] += 1
                        if block.get("shape"):
                            self.stats["formattedTextboxes"] += 1
            if entry["blocks"] or entry.get("title"):
                nodes[key] = entry
            for i, child in enumerate(section.get("children", [])):
                visit(child, path + [i])
        visit(handbook, [])
        if next(headings, None) is not None:
            raise ValueError("Unconsumed source heading provenance")
        return nodes


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("--data", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()
    if args.output.resolve() in (args.data.resolve(), args.source.resolve()) or args.report.resolve() in (args.data.resolve(), args.source.resolve()):
        raise ValueError("Refusing to overwrite source or handbook data")
    source_bytes, data_bytes = args.source.read_bytes(), args.data.read_bytes()
    wrapper = re.fullmatch(r"\s*/\*.*?\*/\s*window\.EMPLOYEE_HANDBOOK\s*=\s*Object\.freeze\((.*)\);\s*", data_bytes.decode(), re.S)
    if not wrapper:
        raise ValueError("Unexpected handbook data wrapper")
    data = json.loads(wrapper.group(1))
    extractor_path = Path(__file__).with_name("extract_employee_handbook.py")
    extractor_bytes = extractor_path.read_bytes()
    spec = importlib.util.spec_from_file_location("handbook_source_extractor", extractor_path)
    extractor = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(extractor)
    with ZipFile(args.source) as archive:
        styles = SourceStyles(archive)
        xml = etree.fromstring(archive.read("word/document.xml"))
        counts = {name: dict(Counter(val(n) or "true" for n in xml.findall(".//w:" + name, NS))) for name in ("highlight", "color", "b", "shd")}
        highlight_scopes = {}
        for node in xml.findall(".//w:highlight", NS):
            owner = node.getparent().getparent()
            if owner.tag != qn("w:r"):
                scope = "paragraph-mark"
            elif any(etree.QName(a).localname == "Fallback" for a in owner.iterancestors()):
                scope = "fallback-duplicate-run"
            elif any(str(text or "").strip() for text in owner.xpath("./w:t/text()", namespaces=NS)):
                scope = "text-run"
            else:
                scope = "drawing-anchor-or-empty-run"
            highlight_scopes.setdefault(scope, Counter())[val(node)] += 1
        media = {Path(name).name: sha(archive.read(name)) for name in archive.namelist() if name.startswith("word/media/") and not name.endswith("/")}
    local_media = {p.name: sha(p.read_bytes()) for p in (args.data.parent / "assets/employee-handbook").iterdir() if p.is_file()}
    if media != local_media:
        raise ValueError("DOCX images differ from existing handbook assets")
    document = Document(args.source)
    restorer = extractor.NumberingRestorer(extractor.load_numbering(args.source), extractor.usable_num_ids(document)[0])
    trace = FormattingTrace(extractor, styles)
    handbook, extraction_stats = trace.run(document, restorer)
    if handbook != data["content"]:
        raise ValueError("DOCX content differs from existing handbook data; refusing to attach formatting")
    nodes = trace.metadata(handbook)
    payload = {"schemaVersion": 1, "offsetUnit": "utf16", "handbookVersion": data["version"],
        "sourceDataSha256": sha(data_bytes), "sourceDocxSha256": sha(source_bytes), "nodes": nodes}
    if args.source.read_bytes() != source_bytes or args.data.read_bytes() != data_bytes or extractor_path.read_bytes() != extractor_bytes:
        raise ValueError("An input changed during formatting extraction")
    report = {"verdict": "PASS", "contentIdentical": True, "sourceImageHashesIdentical": True, "imageCount": len(media),
        "sourceXmlCounts": counts, "stats": dict(trace.stats), "exactMappedCharacters": trace.proofs,
        "sourceHighlightScopes": {key: dict(value) for key, value in highlight_scopes.items()},
        "sourceDataSha256": sha(data_bytes), "sourceDocxSha256": sha(source_bytes),
        "alignmentAudit": trace.alignment_audit, "appliedSourceFixes": extraction_stats["appliedFixes"],
        "notes": ["Offsets are UTF-16 half-open ranges into the exact text stored beside each span.",
            "Only identical source characters receive formatting; generated numbering/correction text has no guessed formatting.",
            "Black/white colors and explicit bold-off are preserved, as are non-default colors/highlights.",
            "Table cells follow the existing extractor including repeated merged-cell values; cell background is explicit tcPr/tblPr shading.",
            "Paragraph-mark properties and fallback duplicate textboxes are excluded, matching the text extractor's actual characters."]}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text("/* 原件格式元数据；由 tools/extract_employee_handbook_formatting.py 生成，不改写正文。 */\nwindow.EMPLOYEE_HANDBOOK_FORMATTING = Object.freeze(" + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ");\n")
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"verdict": "PASS", "output": str(args.output), "report": str(args.report), "stats": report["stats"], "exactMappedCharacters": trace.proofs}, ensure_ascii=False))


if __name__ == "__main__":
    main()
