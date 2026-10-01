"""Extract the employee handbook DOCX into browser-friendly data and image assets.

Run with the bundled workspace Python runtime.  The source handbook is read-only;
the generated data file and assets are deterministic build outputs for the app.

本脚本除了忠实搬运正文与图片之外，还做三件事（依据见 docx 取证报告）：

1. 抽取 Word 浮动文本框（形状）里的文字。python-docx 的 ``CT_P.text`` 只读
   ``w:r``/``w:hyperlink`` 直接子节点，读不到 ``wps:txbx/w:txbxContent``，
   原稿里 403 个段落、约 3.5 万字的流程步骤与注意事项因此被静默丢弃。
2. 还原 Word 自动编号（``w:numPr``）。原稿 129 个段落的序号由 Word 生成，
   文字里没有“1.”“2.”，读者会看到“1、2 没编号，3 却有编号”的错乱。
3. 按一张内置的《源缺陷修正表》（见 ``SOURCE_FIXES`` 与下方各常量）修掉
   Word 原稿自身的录入/结构缺陷。docx 是只读事实源，不能改，只能在提取时
   按 body 下标（idx）逐条白名单修正，每条都注明 docx 依据。

    idx 定位口径：``word/document.xml`` 里 ``w:body`` 的第 N 个 ``w:p``/``w:tbl``
    子元素（从 0 计），与取证报告 / index2.json 的 ``i`` 字段一致。
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
from pathlib import Path
from typing import Iterator, Optional, Union
from zipfile import ZipFile

from docx import Document
from docx.oxml.ns import qn
from docx.table import Table
from docx.text.paragraph import Paragraph
from lxml import etree


HEADING_LEVELS = {
    "Heading 2": 1,
    "Heading 3": 2,
    "Heading 4": 3,
    "Heading 5": 4,
    "Heading 6": 5,
}

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "mc": "http://schemas.openxmlformats.org/markup-compatibility/2006",
    "wps": "http://schemas.microsoft.com/office/word/2010/wordprocessingShape",
    "wpg": "http://schemas.microsoft.com/office/word/2010/wordprocessingGroup",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "wp": "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
}

# 同一行形状的纵坐标容差（EMU，1 英寸 = 914400）。流程图里同一排的方框
# 纵坐标会差几磅，先按容差归行，再行内从左到右，才是“从上到下、从左到右”。
ROW_TOLERANCE_EMU = 180000


# ---------------------------------------------------------------------------
# 源缺陷修正表（每条都附 docx idx 依据；docx 只读，只能在提取时修）
# ---------------------------------------------------------------------------

# 修正 1：docx idx 1285 是第二次粘贴出来的「3.2.4开立、回收存款证明」标题，
# 其下 idx 1287-1290 的 4 块存折内容与 3.2.3补换发存折 末尾 idx 1280-1283
# 逐字重复。整段跳过；保留 idx 1291 的第二个 3.2.4（真正的存款证明正文）。
# 修正 7（其一）：docx idx 1435「联名存款账户」与 idx 1434「3.2.6联名存款账户」
# 都是 Heading 5，是作者把同一个标题写了两遍。丢掉无编号的那个，
# 内容自然归入 3.2.6。
DROP_ITEMS = {
    1285: "重复标题：与 idx 1291 的 3.2.4 逐字相同（取证 C1）",
    1287: "冗余正文：与 idx 1280 重复（取证 C1）",
    1288: "冗余正文：与 idx 1281 重复（取证 C1）",
    1289: "冗余正文：与 idx 1282 重复（取证 C1）",
    1290: "冗余正文：与 idx 1283 重复（取证 C1）",
    1435: "空壳合并：与 idx 1434「3.2.6联名存款账户」同名重复标题（取证 C5①）",
}

# 修正 2：docx idx 751「3.业务完成后追踪号一定要记得追平。」被误设成 Heading 5，
# 它其实是 2.3.1信用卡强制扣划并冻结 的第 3 条业务完结注意事项。
# 不再成节点，文字并回 2.3.1 的块列表末尾。
DEMOTE_HEADING_TO_PARAGRAPH = {
    751: "假标题：实为 2.3.1 的第 3 条注意事项，docx 样式误设 Heading 5（取证 C2）",
}

# 修正 8：docx idx 1635「11034目前一级分行渠运部门不同意审批办理…」是蓝字评审
# 意见，被误设成 Heading 5，与 idx 1634「3.3.3.自定义优先级转账还款」同级，
# 导致 3.3.3 成空壳。降为 3.3.3 节点内的第一个 notice 块。
DEMOTE_HEADING_TO_NOTICE = {
    1635: "评审意见：蓝字，docx 样式误设 Heading 5，导致 3.3.3 空壳（取证 C5②）",
}

# 修正 9：docx idx 3470/3504 被设成 Heading 4，与 idx 3469「3.5对公金融产品」
# 同级；按编号语义应是 3.5 的子节点，强制降为 level 4（Heading 5 的级别）。
HEADING_LEVEL_OVERRIDES = {
    3470: (4, "层级修正：3.5.1 应为 3.5 的子节点，docx 误设 Heading 4（取证 C5③）"),
    3504: (4, "层级修正：3.5.2 应为 3.5 的子节点，docx 误设 Heading 4（取证 C5③）"),
}

# 修正 3：docx idx 2016 原文是半角逗号「4,3,1西联签约及解约」，纯录入笔误。
# 键为 clean_heading() 之后的标题文本。
TITLE_REWRITES = {
    2016: ("4.3.1西联签约及解约", "编号笔误：docx 原文为半角逗号 4,3,1（取证 C3）"),
}

# 修正 4/5/6/10（其四）：正文小节标题的录入笔误与编辑标注。
# 键为 clean_text() 之后的段落文本。
TEXT_REWRITES = {
    997: ("三.业务完结注意事项", "笔误：docx 原文「三,业务完结注意事项」半角逗号（取证 C4）"),
    2232: ("二.操作流程", "笔误：docx 原文「.操作流程」漏「二」，上文 idx 2228 为「一、客户环节」（取证 C4）"),
    3070: ("三.业务完结注意事项", "笔误：docx 原文「三.业务结束注意事项」（取证 C4）"),
    3156: ("三.业务完结注意事项", "编辑标注：docx 原文「三.业务完结注意事项（删除）」整行红字+黄底（取证 B2⑤）"),
    3557: ("三.业务完结注意事项", "错字：docx 原文「三.业务完完结注意事项」多一个「完」（取证 C4）"),
}

# 修正 10（其四，续）：idx 3156 剥掉的「（删除）」不丢弃，改成紧随其后的可见提示。
APPEND_NOTICE_AFTER = {
    3156: ("（原稿此节标注：删除）", "编辑标注降噪：保留原稿意图但不混进小节标题（取证 B2⑤）"),
}

# 修正 10：标题尾部的编辑标注（全部是正文文本，不是批注、不是修订）。
# 从标题剥出来，改挂成该节点的第一个 notice 块，标题只留业务名。
# 键为 clean_heading() 之后的标题文本；值为 (新标题, notice 文本, 依据)。
TITLE_NOTICE_SPLITS = {
    940: (
        "3.1.3对公存取现",
        "此模块为对私模块，建议删除。（建议还是保留）",
        "编辑标注：蓝字+黄底，排在【更新人：陈羽】之后（取证 B2①）",
    ),
    1617: (
        "3.3.2消费分期放款",
        "无此类业务，建议删除（建议保留）",
        "编辑标注：蓝字+黄底，排在【更新人：罗煜】之后（取证 B2②）",
    ),
    1686: (
        "4.1.1外币代兑换",
        "（放到结售汇最后）",
        "编辑标注：整行黄底的排版待办（取证 B2③）",
    ),
}

# 规范三 + 修正 2：split_embedded_heading() 拆出的 notice 原先挂到「拆分前的旧栈顶」，
# 而当时的旧栈顶正是 idx 751 造出来的假节点，网页上彻底不可见。
# 默认改为挂到「拆出后新建的节点」；下表按 idx 指定例外。
# idx 752：「备注：目前系统已实现自动扣划，无冻结、无余额的情况下进行核呆冻结。」
# 讲的是核呆冻结，属于 2.3.1信用卡强制扣划并冻结，而不是新标题 2.3.2信用卡核查还款。
SPLIT_NOTICE_TO_PREVIOUS = {
    752: "备注内容属于上一节 2.3.1（核呆冻结），不属于新标题 2.3.2（取证 C2）",
}

# 明确不动（取证结论，列在这里防止后人“顺手修”）：
#   idx 1883「4.2.4 TT前台待修改（TT打印、查询）」整行原样 —— 无任何格式标记，
#            节内正文正是“汇款待修改”的处理流程，是业务名不是编辑标注（取证 B2④）。
#   idx 3152「（四）注意事项」—— 属于完整的（一）…（四）序列，是合法括号编号（取证 C4）。
#   对私篇从 2 起编 —— docx 里确实没有第 1 章，不是漏提取（取证 C6）。
#   idx 197 / 1438 / 2642 / 2692 / 1159-1165 等编辑性正文 —— 保守保留原文。
#   Word 批注（39 条，word/comments.xml）—— 维持不提取。

SOURCE_FIXES = {
    "dropItems": DROP_ITEMS,
    "demoteHeadingToParagraph": DEMOTE_HEADING_TO_PARAGRAPH,
    "demoteHeadingToNotice": DEMOTE_HEADING_TO_NOTICE,
    "headingLevelOverrides": {k: v[1] for k, v in HEADING_LEVEL_OVERRIDES.items()},
    "titleRewrites": {k: v[1] for k, v in TITLE_REWRITES.items()},
    "textRewrites": {k: v[1] for k, v in TEXT_REWRITES.items()},
    "appendNoticeAfter": {k: v[1] for k, v in APPEND_NOTICE_AFTER.items()},
    "titleNoticeSplits": {k: v[2] for k, v in TITLE_NOTICE_SPLITS.items()},
    "splitNoticeToPrevious": SPLIT_NOTICE_TO_PREVIOUS,
}


# ---------------------------------------------------------------------------
# 通用工具
# ---------------------------------------------------------------------------


def iter_blocks(document: Document) -> Iterator[tuple[int, Union[Paragraph, Table]]]:
    """Yield ``(idx, block)`` for body paragraphs and tables in document order.

    ``idx`` 与取证报告 / index2.json 的 body 下标一致，修正表按它定位。
    """
    body = document.element.body
    index = 0
    for child in body.iterchildren():
        if child.tag == qn("w:p"):
            yield index, Paragraph(child, document)
            index += 1
        elif child.tag == qn("w:tbl"):
            yield index, Table(child, document)
            index += 1


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.replace(" ", " ")).strip()


def clean_heading(value: str) -> str:
    value = clean_text(value)
    value = re.sub(r"【(?:更新人|撰写人)[^】]*】", "", value)
    return re.sub(r"\s+", " ", value).strip(" -—")


def image_names(paragraph: Paragraph, document: Document) -> list[str]:
    names: list[str] = []
    for element in [*paragraph._p.xpath(".//a:blip"), *paragraph._p.xpath(".//*[local-name()='imagedata']")]:
        relationship_id = element.get(qn("r:embed")) or element.get(qn("r:id"))
        if not relationship_id:
            continue
        part = document.part.related_parts.get(relationship_id)
        if not part:
            continue
        name = Path(str(part.partname)).name
        if name not in names:
            names.append(name)
    return names


def table_block(table: Table, document: Document) -> dict:
    rows = []
    images: list[str] = []
    for row in table.rows:
        row_values = []
        for cell in row.cells:
            value = "\n".join(clean_text(paragraph.text) for paragraph in cell.paragraphs if clean_text(paragraph.text))
            row_values.append(value)
            for paragraph in cell.paragraphs:
                for name in image_names(paragraph, document):
                    if name not in images:
                        images.append(name)
        if any(row_values):
            rows.append(row_values)
    block = {"kind": "table", "rows": rows}
    if images:
        block["images"] = images
    return block


def add_block(target: dict, block: dict) -> None:
    target.setdefault("blocks", []).append(block)


def is_editorial_heading(title: str) -> bool:
    return title.startswith("（") or title.startswith("(")


def split_embedded_heading(title: str) -> tuple[str, str]:
    match = re.match(r"^(备注[：:].*?)(\d+(?:[.,，]\d+)+(?:[.,，]\d+)*.*)$", title)
    return (match.group(1).strip(), match.group(2).strip()) if match else ("", title)


# ---------------------------------------------------------------------------
# 形状（浮动文本框）文字抽取
# ---------------------------------------------------------------------------


def _tag(element) -> tuple[str, str]:
    qname = etree.QName(element)
    return qname.namespace or "", qname.localname


def _int(value, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _under_fallback(element) -> bool:
    """mc:Fallback（VML）与 mc:Choice（wps）装的是同一份文字，两支都取会重复一遍。"""
    node = element.getparent()
    while node is not None:
        namespace, local = _tag(node)
        if namespace == NS["mc"] and local == "Fallback":
            return True
        node = node.getparent()
    return False


def _shape_position(txbx) -> Optional[tuple[float, float]]:
    """返回形状的 (y, x) 偏移（EMU）。取不到时返回 None，调用方退回 XML 顺序。"""
    node = txbx
    wsp = None
    while node is not None:
        namespace, local = _tag(node)
        if namespace == NS["wps"] and local == "wsp":
            wsp = node
            break
        node = node.getparent()
    if wsp is None:
        return None

    offset = wsp.find("wps:spPr/a:xfrm/a:off", NS)
    x = float(_int(offset.get("x"))) if offset is not None else 0.0
    y = float(_int(offset.get("y"))) if offset is not None else 0.0

    node = wsp.getparent()
    while node is not None:
        namespace, local = _tag(node)
        if namespace == NS["wpg"] and local in ("wgp", "grpSp"):
            # 组合内子形状用的是 chOff/chExt 子坐标系，先换算回父坐标系再比较。
            xfrm = node.find("wpg:grpSpPr/a:xfrm", NS)
            if xfrm is not None:
                group_off = xfrm.find("a:off", NS)
                group_ext = xfrm.find("a:ext", NS)
                child_off = xfrm.find("a:chOff", NS)
                child_ext = xfrm.find("a:chExt", NS)
                if None not in (group_off, group_ext, child_off, child_ext):
                    scale_x = _int(child_ext.get("cx"), 1) or 1
                    scale_y = _int(child_ext.get("cy"), 1) or 1
                    x = _int(group_off.get("x")) + (x - _int(child_off.get("x"))) * _int(group_ext.get("cx")) / scale_x
                    y = _int(group_off.get("y")) + (y - _int(child_off.get("y"))) * _int(group_ext.get("cy")) / scale_y
        elif namespace == NS["wp"] and local == "anchor":
            horizontal = node.find("wp:positionH/wp:posOffset", NS)
            vertical = node.find("wp:positionV/wp:posOffset", NS)
            if horizontal is not None and horizontal.text:
                x += _int(horizontal.text)
            if vertical is not None and vertical.text:
                y += _int(vertical.text)
            return (y, x)
        elif namespace == NS["wp"] and local == "inline":
            return (y, x)
        node = node.getparent()
    return (y, x)


def _txbx_text(txbx) -> str:
    """按 w:p 拼行。CT_P.text 只取 w:r/w:hyperlink，嵌套文本框不会重复计入。"""
    lines = []
    for paragraph in txbx.findall("w:p", NS):
        line = clean_text(paragraph.text)
        if line:
            lines.append(line)
    return "\n".join(lines)


def _order_shapes(shapes: list[dict]) -> list[dict]:
    """先按纵坐标归行（容差 ROW_TOLERANCE_EMU），行内再从左到右；坐标缺失退回 XML 顺序。"""
    if any(shape["pos"] is None for shape in shapes):
        return shapes
    ordered = sorted(shapes, key=lambda shape: (shape["pos"][0], shape["pos"][1], shape["order"]))
    rows: list[list[dict]] = []
    row_top: Optional[float] = None
    for shape in ordered:
        top = shape["pos"][0]
        if row_top is None or top - row_top > ROW_TOLERANCE_EMU:
            rows.append([])
            row_top = top
        rows[-1].append(shape)
    result: list[dict] = []
    for row in rows:
        result.extend(sorted(row, key=lambda shape: (shape["pos"][1], shape["order"])))
    return result


def shape_blocks(paragraph: Paragraph) -> tuple[list[dict], bool]:
    """抽取锚在该段落上的所有形状文字，返回 (blocks, 是否退回了 XML 顺序)。"""
    shapes: list[dict] = []
    for order, txbx in enumerate(paragraph._p.findall(".//w:txbxContent", NS)):
        if _under_fallback(txbx):
            continue
        text = _txbx_text(txbx)
        if not text:
            continue  # 空形状 / 纯装饰（箭头、连接线）跳过
        shapes.append({"order": order, "pos": _shape_position(txbx), "text": text})
    if not shapes:
        return [], False
    fell_back = any(shape["pos"] is None for shape in shapes)
    return [{"kind": "paragraph", "text": shape["text"], "shape": True} for shape in _order_shapes(shapes)], fell_back


# ---------------------------------------------------------------------------
# Word 自动编号还原
# ---------------------------------------------------------------------------

CHINESE_DIGITS = "零一二三四五六七八九"
CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳"
# 本文档 numbering.xml 实际用到的 numFmt 只有这 6 种（普查见 report 的 numberingFormats）。
SUPPORTED_NUM_FORMATS = {
    "decimal",
    "chineseCounting",
    "decimalEnclosedCircleChinese",
    "upperLetter",
    "lowerLetter",
    "lowerRoman",
}
# 同一 numId 的编号段之间隔了这么多 body 项，就认为是两段互不相干的列表。
NUM_RUN_GAP = 12


def _chinese_counting(value: int) -> Optional[str]:
    if not 1 <= value <= 99:
        return None
    if value < 10:
        return CHINESE_DIGITS[value]
    tens, ones = divmod(value, 10)
    head = "十" if tens == 1 else CHINESE_DIGITS[tens] + "十"
    return head + (CHINESE_DIGITS[ones] if ones else "")


def _letters(value: int) -> Optional[str]:
    if value < 1:
        return None
    result = ""
    while value > 0:
        value, remainder = divmod(value - 1, 26)
        result = chr(ord("a") + remainder) + result
    return result


def _roman(value: int) -> Optional[str]:
    if not 1 <= value <= 3999:
        return None
    table = ((1000, "m"), (900, "cm"), (500, "d"), (400, "cd"), (100, "c"), (90, "xc"),
             (50, "l"), (40, "xl"), (10, "x"), (9, "ix"), (5, "v"), (4, "iv"), (1, "i"))
    result = ""
    for amount, glyph in table:
        while value >= amount:
            result += glyph
            value -= amount
    return result


def format_number(number_format: str, value: int) -> Optional[str]:
    if number_format == "decimal":
        return str(value)
    if number_format == "chineseCounting":
        return _chinese_counting(value)
    if number_format == "decimalEnclosedCircleChinese":
        return CIRCLED[value - 1] if 1 <= value <= len(CIRCLED) else None
    if number_format == "upperLetter":
        letters = _letters(value)
        return letters.upper() if letters else None
    if number_format == "lowerLetter":
        return _letters(value)
    if number_format == "lowerRoman":
        return _roman(value)
    return None


def load_numbering(source: Path) -> dict:
    """读 word/numbering.xml，返回 {numId: {ilvl: {numFmt, lvlText, start}}}。"""
    with ZipFile(source) as archive:
        if "word/numbering.xml" not in archive.namelist():
            return {}
        root = etree.fromstring(archive.read("word/numbering.xml"))

    abstract: dict[str, dict[int, dict]] = {}
    for node in root.findall("w:abstractNum", NS):
        levels: dict[int, dict] = {}
        for level in node.findall("w:lvl", NS):
            ilvl = _int(level.get(qn("w:ilvl")), -1)
            number_format = level.find("w:numFmt", NS)
            level_text = level.find("w:lvlText", NS)
            start = level.find("w:start", NS)
            levels[ilvl] = {
                "numFmt": number_format.get(qn("w:val")) if number_format is not None else None,
                "lvlText": level_text.get(qn("w:val")) if level_text is not None else None,
                "start": _int(start.get(qn("w:val")), 1) if start is not None else 1,
            }
        abstract[node.get(qn("w:abstractNumId"))] = levels

    numbering: dict[str, dict[int, dict]] = {}
    for node in root.findall("w:num", NS):
        num_id = node.get(qn("w:numId"))
        abstract_id = node.find("w:abstractNumId", NS)
        levels = {k: dict(v) for k, v in abstract.get(abstract_id.get(qn("w:val")) if abstract_id is not None else "", {}).items()}
        for override in node.findall("w:lvlOverride", NS):
            ilvl = _int(override.get(qn("w:ilvl")), -1)
            start_override = override.find("w:startOverride", NS)
            if ilvl in levels and start_override is not None:
                levels[ilvl]["start"] = _int(start_override.get(qn("w:val")), 1)
        numbering[num_id] = levels
    return numbering


def paragraph_numbering(paragraph: Paragraph) -> Optional[tuple[str, int]]:
    number_properties = paragraph._p.find("w:pPr/w:numPr", NS)
    if number_properties is None:
        return None
    num_id = number_properties.find("w:numId", NS)
    if num_id is None:
        return None
    value = num_id.get(qn("w:val"))
    if not value or value == "0":
        return None
    ilvl = number_properties.find("w:ilvl", NS)
    return value, _int(ilvl.get(qn("w:val")) if ilvl is not None else 0, 0)


class NumberingRestorer:
    """按 Word 语义维护每个 numId 的计数器，把序号还原成段落文字前缀。

    保守口径（宁缺毋错）——以下情况一律放弃还原：
      * numFmt 不在 SUPPORTED_NUM_FORMATS 里；
      * 同一个 numId 的编号段落被拆成了多段（相邻两处相隔 > NUM_RUN_GAP 个 body 项），
        此时 Word 的连续计数会和上下文里手打的编号打架，无法确认哪个对；
      * 段落是标题（还原会改动节点标题）或没有文字。
    """

    def __init__(self, numbering: dict, usable_num_ids: set[str]):
        self.numbering = numbering
        self.usable = usable_num_ids
        self.counters: dict[tuple[str, int], int] = {}
        self.applied: list[dict] = []
        self.skipped: list[dict] = []

    def prefix(self, index: int, num_id: str, ilvl: int, text: str) -> str:
        level = self.numbering.get(num_id, {}).get(ilvl)
        if not level or level.get("numFmt") not in SUPPORTED_NUM_FORMATS or not level.get("lvlText"):
            self.skipped.append({"idx": index, "numId": num_id, "reason": "numFmt/lvlText 缺失或不支持"})
            return text
        if num_id not in self.usable:
            self.skipped.append({"idx": index, "numId": num_id, "reason": "同一 numId 的编号段落被拆成多段，计数不可确认"})
            return text

        key = (num_id, ilvl)
        self.counters[key] = self.counters.get(key, level["start"] - 1) + 1
        # 进入下级前先把更深层计数器清掉（本文档 ilvl 全为 0，留作通用性）。
        for existing in list(self.counters):
            if existing[0] == num_id and existing[1] > ilvl:
                del self.counters[existing]

        rendered = level["lvlText"]
        for placeholder_level in range(ilvl + 1):
            token = f"%{placeholder_level + 1}"
            if token not in rendered:
                continue
            counter = self.counters.get((num_id, placeholder_level))
            glyph = format_number(self.numbering[num_id][placeholder_level]["numFmt"], counter) if counter else None
            if glyph is None:
                self.skipped.append({"idx": index, "numId": num_id, "reason": "上级计数不可用"})
                return text
            rendered = rendered.replace(token, glyph)
        result = clean_text(rendered + text)
        self.applied.append({"idx": index, "numId": num_id, "ilvl": ilvl, "prefix": rendered, "text": result})
        return result


def usable_num_ids(document: Document) -> tuple[set[str], dict[str, list[list[int]]]]:
    """普查每个 numId 的编号段落分布，只有集中在一段里的才允许还原。"""
    positions: dict[str, list[int]] = {}
    for index, item in iter_blocks(document):
        if isinstance(item, Table):
            continue
        numbering = paragraph_numbering(item)
        if numbering:
            positions.setdefault(numbering[0], []).append(index)
    runs: dict[str, list[list[int]]] = {}
    usable: set[str] = set()
    for num_id, indexes in positions.items():
        grouped = [[indexes[0]]]
        for previous, current in zip(indexes, indexes[1:]):
            if current - previous > NUM_RUN_GAP:
                grouped.append([current])
            else:
                grouped[-1].append(current)
        runs[num_id] = grouped
        if len(grouped) == 1:
            usable.add(num_id)
    return usable, runs


# ---------------------------------------------------------------------------
# 手册结构
# ---------------------------------------------------------------------------


def build_handbook(document: Document, restorer: NumberingRestorer) -> tuple[dict, dict]:
    root = {"title": "新员工上岗手册", "children": [], "blocks": []}
    stack: list[tuple[int, dict]] = [(0, root)]
    stats = {
        "shapeBlockCount": 0,
        "shapeCharCount": 0,
        "shapeParagraphCount": 0,
        "shapeXmlOrderFallbacks": [],
        "appliedFixes": [],
    }

    def note_fix(name: str, index: int, detail: str) -> None:
        stats["appliedFixes"].append({"fix": name, "idx": index, "detail": detail})

    for index, item in iter_blocks(document):
        if index in DROP_ITEMS:
            note_fix("dropItem", index, DROP_ITEMS[index])
            continue

        if isinstance(item, Table):
            add_block(stack[-1][1], table_block(item, document))
            continue

        text = clean_text(item.text)
        images = image_names(item, document)
        level = HEADING_LEVELS.get(item.style.name)

        if index in HEADING_LEVEL_OVERRIDES and level:
            level, reason = HEADING_LEVEL_OVERRIDES[index]
            note_fix("headingLevelOverride", index, reason)

        if index in DEMOTE_HEADING_TO_NOTICE and level and text:
            add_block(stack[-1][1], {"kind": "notice", "text": clean_heading(text)})
            note_fix("demoteHeadingToNotice", index, DEMOTE_HEADING_TO_NOTICE[index])
            level = None
            text = ""
        elif index in DEMOTE_HEADING_TO_PARAGRAPH and level and text:
            note_fix("demoteHeadingToParagraph", index, DEMOTE_HEADING_TO_PARAGRAPH[index])
            level = None

        shapes, fell_back = shape_blocks(item)
        if shapes:
            stats["shapeParagraphCount"] += 1
            stats["shapeBlockCount"] += len(shapes)
            stats["shapeCharCount"] += sum(len(block["text"]) for block in shapes)
            if fell_back:
                stats["shapeXmlOrderFallbacks"].append(index)

        if level and text:
            title = clean_heading(text)
            note, title = split_embedded_heading(title)
            previous_target = stack[-1][1]
            if index in TITLE_NOTICE_SPLITS:
                title, extracted, reason = TITLE_NOTICE_SPLITS[index]
                note_fix("titleNoticeSplit", index, reason)
            else:
                extracted = ""
            if index in TITLE_REWRITES:
                title, reason = TITLE_REWRITES[index]
                note_fix("titleRewrite", index, reason)
            if is_editorial_heading(title):
                if note:
                    add_block(previous_target, {"kind": "notice", "text": note})
                add_block(previous_target, {"kind": "notice", "text": title, "images": images})
                for block in shapes:
                    add_block(previous_target, block)
                continue
            while stack and stack[-1][0] >= level:
                stack.pop()
            section = {"title": title, "children": [], "blocks": []}
            stack[-1][1]["children"].append(section)
            stack.append((level, section))
            if note:
                # 规范三：默认挂到拆出后新建的节点；SPLIT_NOTICE_TO_PREVIOUS 里的例外挂回上一节。
                if index in SPLIT_NOTICE_TO_PREVIOUS:
                    add_block(previous_target, {"kind": "notice", "text": note})
                    note_fix("splitNoticeToPrevious", index, SPLIT_NOTICE_TO_PREVIOUS[index])
                else:
                    add_block(section, {"kind": "notice", "text": note})
            if extracted:
                add_block(section, {"kind": "notice", "text": extracted})
            if images:
                add_block(section, {"kind": "images", "items": images})
            for block in shapes:
                add_block(section, block)
            continue

        if index in TEXT_REWRITES and text:
            text, reason = TEXT_REWRITES[index]
            note_fix("textRewrite", index, reason)
        else:
            numbering = paragraph_numbering(item)
            if numbering and text:
                text = restorer.prefix(index, numbering[0], numbering[1], text)

        if text or images:
            block = {"kind": "paragraph", "text": text}
            if images:
                block["images"] = images
            add_block(stack[-1][1], block)

        if index in APPEND_NOTICE_AFTER:
            notice, reason = APPEND_NOTICE_AFTER[index]
            add_block(stack[-1][1], {"kind": "notice", "text": notice})
            note_fix("appendNoticeAfter", index, reason)

        for block in shapes:
            add_block(stack[-1][1], block)

    return root, stats


def extract_media(source: Path, asset_dir: Path) -> list[str]:
    if asset_dir.exists():
        shutil.rmtree(asset_dir)
    asset_dir.mkdir(parents=True, exist_ok=True)
    names = []
    with ZipFile(source) as archive:
        for member in archive.namelist():
            if not member.startswith("word/media/") or member.endswith("/"):
                continue
            name = Path(member).name
            (asset_dir / name).write_bytes(archive.read(member))
            names.append(name)
    return sorted(names)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("--data-output", type=Path, required=True)
    parser.add_argument("--asset-dir", type=Path, required=True)
    parser.add_argument("--report-output", type=Path, required=True)
    args = parser.parse_args()

    document = Document(args.source)
    numbering = load_numbering(args.source)
    usable, runs = usable_num_ids(document)
    restorer = NumberingRestorer(numbering, usable)
    handbook, stats = build_handbook(document, restorer)
    media = extract_media(args.source, args.asset_dir)
    payload = {
        "version": "2026-02-05",
        "title": "新员工上岗手册",
        "sourceTitle": args.source.stem,
        "mediaBase": "assets/employee-handbook/",
        "content": handbook,
    }
    args.data_output.parent.mkdir(parents=True, exist_ok=True)
    args.data_output.write_text(
        "/* 由 tools/extract_employee_handbook.py 从新员工上岗手册生成，请勿手工编辑。 */\n"
        f"window.EMPLOYEE_HANDBOOK = Object.freeze({json.dumps(payload, ensure_ascii=False, separators=(',', ':'))});\n",
        encoding="utf-8",
    )

    def count_sections(section: dict) -> int:
        return sum(1 + count_sections(child) for child in section.get("children", []))

    def count_blocks(section: dict) -> int:
        return len(section.get("blocks", [])) + sum(count_blocks(child) for child in section.get("children", []))

    def referenced_media(section: dict) -> set[str]:
        names: set[str] = set()
        for block in section.get("blocks", []):
            names.update(block.get("images", []))
            names.update(block.get("items", []))
        for child in section.get("children", []):
            names.update(referenced_media(child))
        return names

    referenced = referenced_media(handbook)
    number_formats = sorted({
        level["numFmt"]
        for num_id, levels in numbering.items()
        for level in levels.values()
        if level.get("numFmt") and num_id in runs
    })
    report = {
        "source": str(args.source),
        "rootCategories": [child["title"] for child in handbook["children"]],
        "sectionCount": count_sections(handbook),
        "blockCount": count_blocks(handbook),
        "paragraphCount": len(document.paragraphs),
        "tableCount": len(document.tables),
        "inlineShapeCount": len(document.inline_shapes),
        "mediaCount": len(media),
        "mediaBytes": sum((args.asset_dir / name).stat().st_size for name in media),
        "referencedMediaCount": len(referenced),
        "unreferencedMedia": sorted(set(media) - referenced),
        "shapeParagraphCount": stats["shapeParagraphCount"],
        "shapeBlockCount": stats["shapeBlockCount"],
        "shapeCharCount": stats["shapeCharCount"],
        "shapeXmlOrderFallbacks": stats["shapeXmlOrderFallbacks"],
        "numberingFormats": number_formats,
        "numberingRestored": len(restorer.applied),
        "numberingSkipped": restorer.skipped,
        "numberingSkippedNumIds": sorted(set(runs) - usable, key=int),
        "numberingRuns": {k: [[r[0], r[-1], len(r)] for r in v] for k, v in sorted(runs.items(), key=lambda kv: int(kv[0]))},
        "numberingApplied": restorer.applied,
        "appliedFixes": stats["appliedFixes"],
        "sourceFixes": SOURCE_FIXES,
    }
    args.report_output.parent.mkdir(parents=True, exist_ok=True)
    args.report_output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: v for k, v in report.items() if k not in ("numberingApplied", "appliedFixes", "sourceFixes", "numberingRuns")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
