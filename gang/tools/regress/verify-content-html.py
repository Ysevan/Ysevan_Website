#!/usr/bin/env python3
"""Independent semantic inspection of actual baseline/candidate render output."""
import copy
import hashlib
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path


class Element:
    def __init__(self, tag='root', attrs=()):
        self.tag = tag
        self.attrs = dict(attrs)
        self.children = []

    def has(self, cls):
        return cls in self.attrs.get('class', '').split()

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Element):
                yield from child.walk()

    def find(self, cls):
        return [node for node in self.walk() if node.has(cls)]


class Parser(HTMLParser):
    VOID = set('area base br col embed hr img input link meta param source track wbr'.split())

    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.root = Element()
        self.stack = [self.root]
        self.feed(html)
        self.close()

    def handle_starttag(self, tag, attrs):
        node = Element(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in self.VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.stack[-1].children.append(Element(tag, attrs))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                self.stack = self.stack[:i]
                return

    def handle_data(self, text):
        self.stack[-1].children.append(text)


def compact(text):
    return re.sub(r'\s+', '', text)


def text(node, semantic=False):
    if isinstance(node, str):
        return node
    if semantic:
        if node.has('check-card'):
            raw = node.find('check-raw')
            return ''.join(text(item) for item in raw)
        if node.tag in ('figure', 'caption') or node.has('risk-tag'):
            return ''
    return ''.join(text(child, semantic) for child in node.children)


def table_values(root):
    return [[compact(text(cell)) for cell in node.walk() if cell.tag in ('td', 'th')] for node in root.walk() if node.tag == 'table']


def image_values(root):
    return [node.attrs.get('src', '') for node in root.walk() if node.tag == 'img']


def body_values(root):
    return [compact(text(node, True)) for node in root.find('document-body')]


def material_values(root):
    return [{
        'key': card.attrs.get('data-check-card'),
        'source': [compact(text(n)) for n in card.find('check-raw')],
        'items': [compact(text(n)) for n in card.find('check-text')],
        'indices': [n.attrs.get('data-check-index') for n in card.walk() if 'data-check-index' in n.attrs],
    } for card in root.find('check-card')]


def captions(root):
    return [compact(text(n)) for n in root.find('figure-label')]


def source_text(blocks):
    return compact(''.join(
        ''.join(str(cell or '') for row in block.get('rows', []) for cell in row)
        if block.get('kind') == 'table' else str(block.get('text', ''))
        for block in blocks
    ))


def source_images(blocks):
    return ['assets/employee-handbook/' + name for block in blocks for name in block.get('images', [])]


def print_text(node):
    if isinstance(node, str):
        return node
    if node.has('print-meta'):
        # The handbook version remains strict. Only the site's release label may change.
        return re.sub(r'(网站\s*)v\d+(?:\.\d+)*(?=\s|$)', r'\1<site-version>', text(node))
    return ''.join(print_text(child) for child in node.children)


def semantic(node):
    reader = Parser(node['reader']).root
    raw = Parser(node['raw']).root
    full_print = Parser(node['printWithImages']).root
    text_print = Parser(node['printWithoutImages']).root
    raw_docs = raw.find('raw-document')
    return {
        'body': body_values(reader),
        'raw': compact(text(raw_docs[0])) if len(raw_docs) == 1 else None,
        'rawImages': image_values(raw),
        'images': image_values(reader),
        'captions': captions(reader),
        'tables': table_values(reader),
        'materials': material_values(reader),
        'printBody': body_values(full_print),
        'printImages': image_values(full_print),
        'printCaptions': captions(full_print),
        'printTables': table_values(full_print),
        'printDocumentText': [compact(print_text(n)) for n in full_print.find('print-doc')],
        'noImagePrintBody': body_values(text_print),
        'noImagePrintImages': image_values(text_print),
        'noImagePrintTables': table_values(text_print),
        'noImagePrintDocumentText': [compact(print_text(n)) for n in text_print.find('print-doc')],
        'stageCount': len(reader.find('stage-section')),
    }


payload = json.loads(Path(sys.argv[1]).read_text())
checks = []
bad = {}
stats = {'businesses': len(payload['candidate']), 'materialCards': 0, 'materialItems': 0, 'renderedImages': 0, 'tables': 0}
fingerprints = []


def fail(kind, key):
    bad.setdefault(kind, []).append(key)


if len(payload['baseline']) != len(payload['candidate']):
    fail('nodeCount', 'all')

for base, candidate in zip(payload['baseline'], payload['candidate']):
    key = candidate['key']
    a, b = semantic(base), semantic(candidate)
    for field in a:
        if a[field] != b[field]:
            fail('baseline-' + field, key)
    if base['flow'] != candidate['flow']:
        fail('stage allocation/order', key)
    if base['figures'] != candidate['figures']:
        fail('lightbox registry', key)
    if base['cards'] != candidate['cards']:
        fail('material registry', key)
    if b['stageCount'] != 4:
        fail('four rendered stages', key)
    if b['raw'] != source_text(candidate['blocks']):
        fail('raw vs independent source text', key)
    if b['rawImages'] != source_images(candidate['blocks']):
        fail('raw vs independent source image order', key)
    stage_images = [image for stage in candidate['flow'] for image in source_images(stage['blocks'])]
    if b['images'] != stage_images or b['printImages'] != stage_images:
        fail('screen/print vs source stage images', key)
    if b['printBody'] != b['noImagePrintBody'] or b['printTables'] != b['noImagePrintTables']:
        fail('print image option changes text/tables', key)
    if b['noImagePrintImages']:
        fail('no-image printing still contains images', key)
    if len(candidate['cards']) != len(b['materials']):
        fail('material registry vs generated cards', key)
    for registered, card in zip(candidate['cards'], b['materials']):
        if registered['total'] != len(card['items']) or len(card['items']) != len(card['indices']) or not card['source']:
            fail('material item counts and raw source', key)
        if len(card['indices']) != len(set(card['indices'])):
            fail('duplicate material checkbox indices', key)
    stats['materialCards'] += len(b['materials'])
    stats['materialItems'] += sum(len(card['items']) for card in b['materials'])
    stats['renderedImages'] += len(b['images'])
    stats['tables'] += len(b['tables'])
    fingerprints.append({'key': key, 'title': candidate['title'], 'images': b['images'],
        'bodiesSha256': [hashlib.sha256(s.encode()).hexdigest() for s in b['body']],
        'rawSha256': hashlib.sha256((b['raw'] or '').encode()).hexdigest(),
        'materialCards': len(b['materials']), 'materialItems': sum(len(c['items']) for c in b['materials'])})

groups = {
    'all enhanced body text preserved against real baseline renderer': ['baseline-body'],
    'all original-reader text equals independent source blocks': ['baseline-raw', 'raw vs independent source text'],
    'all material raw text/checklist items/indices/registration preserved': ['baseline-materials', 'material registry', 'material registry vs generated cards', 'material item counts and raw source', 'duplicate material checkbox indices'],
    'all tables and repeated cell text preserved': ['baseline-tables'],
    'all stage allocation/order and four stage-section outputs preserved': ['stage allocation/order', 'four rendered stages', 'baseline-stageCount'],
    'all screen/raw/print image order and lightbox registration preserved': ['baseline-images', 'baseline-rawImages', 'baseline-printImages', 'raw vs independent source image order', 'screen/print vs source stage images', 'lightbox registry'],
    'all figure captions preserved': ['baseline-captions', 'baseline-printCaptions'],
    'both print variants preserve baseline body and tables': ['baseline-printBody', 'baseline-printTables', 'baseline-noImagePrintBody', 'baseline-noImagePrintTables'],
    'full printed document text preserved except print-meta website version': ['baseline-printDocumentText', 'baseline-noImagePrintDocumentText'],
    'print image toggle changes only image figure output': ['print image option changes text/tables', 'no-image printing still contains images', 'baseline-noImagePrintImages'],
}
covered = set()
for name, kinds in groups.items():
    detail = {kind: bad[kind] for kind in kinds if kind in bad}
    covered.update(kinds)
    checks.append({'name': name, 'ok': not detail, 'detail': detail or None})
for kind, keys in bad.items():
    if kind not in covered:
        checks.append({'name': kind, 'ok': False, 'detail': keys})

# Mutation controls: demonstrate that this comparator detects the classes of loss
# it claims to detect, including losses that can remain visually unobtrusive.
sample = next(n for n in payload['candidate'] if semantic(n)['materials'] and semantic(n)['images'])
normal = semantic(sample)
mutants = []
for label, field, old, new, detect in [
    ('dropped rendered source paragraph', 'raw', r'(<p class="raw-para">)[\s\S]*?(</p>)', r'\1\2', 'raw'),
    ('dropped checklist item text', 'reader', r'(<span class="check-text">)[\s\S]*?(</span>)', r'\1\2', 'materials'),
    ('dropped image element', 'reader', r'<img\b[^>]*>', '', 'images'),
    ('dropped printable section', 'printWithImages', r'<section class="print-stage">[\s\S]*?</section>', '', 'printBody'),
]:
    changed = copy.deepcopy(sample)
    changed[field], count = re.subn(old, new, changed[field], count=1)
    detected = count == 1 and semantic(changed)[detect] != normal[detect]
    mutants.append({'name': label, 'detected': detected})
checks.append({'name': 'negative controls detect paragraph/checklist/image/print losses', 'ok': all(m['detected'] for m in mutants), 'detail': mutants})
site_change = copy.deepcopy(sample)
site_change['printWithImages'], site_matches = re.subn(r'(<p class="print-meta">[^<]*网站\s*)v\d+(?:\.\d+)*', r'\1v999.0.0', site_change['printWithImages'], count=1)
handbook_change = copy.deepcopy(sample)
handbook_change['printWithImages'], handbook_matches = re.subn(r'(<p class="print-meta">手册版本)[^ ]+', r'\1BROKEN', handbook_change['printWithImages'], count=1)
checks.append({'name': 'print normalization permits site version but detects handbook version changes', 'ok': site_matches == 1 and handbook_matches == 1 and semantic(site_change)['printDocumentText'] == normal['printDocumentText'] and semantic(handbook_change)['printDocumentText'] != normal['printDocumentText']})
stats['uniqueRenderedImages'] = len({image for f in fingerprints for image in f['images']})
Path(sys.argv[1]).with_name('business-fingerprints.json').write_text(json.dumps(fingerprints, ensure_ascii=False, indent=2))
print(json.dumps({'checks': checks, 'stats': stats}, ensure_ascii=False))
sys.exit(0 if all(c['ok'] for c in checks) else 1)
