#!/usr/bin/env python3
"""Inspect actual guided HTML against source characters and source style spans."""
from html.parser import HTMLParser
from pathlib import Path
from collections import Counter, defaultdict
import json
import re
import sys

class Element:
    def __init__(self, tag='root', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []
    def has(self, name):
        return name in self.attrs.get('class', '').split()
    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Element): yield from child.walk()
    def find(self, name):
        return [n for n in self.walk() if n.has(name)]

class Parser(HTMLParser):
    VOID = set('area base br col embed hr img input link meta param source track wbr'.split())
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.root = Element(); self.stack = [self.root]
        self.feed(html); self.close()
    def handle_starttag(self, tag, attrs):
        node = Element(tag, attrs); self.stack[-1].children.append(node)
        if tag not in self.VOID: self.stack.append(node)
    def handle_startendtag(self, tag, attrs):
        self.stack[-1].children.append(Element(tag, attrs))
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, 0, -1):
            if self.stack[i].tag == tag: self.stack = self.stack[:i]; return
    def handle_data(self, value): self.stack[-1].children.append(value)

def styles(span):
    value = {}
    if span.get('color'): value['color'] = span['color'].upper()
    if span.get('highlight') or span.get('shading'): value['background-color'] = (span.get('highlight') or span.get('shading')).upper()
    if isinstance(span.get('bold'), bool): value['font-weight'] = '700' if span['bold'] else '400'
    deco = [css for field, css in [('underline','underline'), ('strike','line-through')] if span.get(field) is True]
    if deco or isinstance(span.get('underline'), bool) or isinstance(span.get('strike'), bool): value['text-decoration'] = ' '.join(deco) or 'none'
    return value

def expected(text, formatting=None):
    spans = (formatting or {}).get('spans', [])
    chars = []; offset = 0
    for char in text:
        found = next((span for span in spans if span['start'] <= offset < span['end']), None)
        chars.append((char, styles(found) if found else {})); offset += len(char.encode('utf-16-le'))//2
    return chars

def actual(node, semantic=False, inherited=None):
    inherited = inherited or {}
    if isinstance(node, str): return [(c, inherited) for c in node]
    if node.tag == 'br': return [('\n', inherited)]
    if semantic:
        if node.has('check-card'):
            return [part for raw in node.find('check-raw') for part in actual(raw, False, inherited)]
        if node.tag in ('figure', 'caption') or node.has('risk-tag') or node.has('stage-notice') or node.has('quote-context'): return []
    effective = dict(inherited)
    if node.has('source-format'):
        effective.update({k.strip(): v.strip().upper() if v.strip().startswith('#') else v.strip()
            for piece in node.attrs.get('style','').split(';') if ':' in piece for k,v in [piece.split(':',1)]})
    return [part for child in node.children for part in actual(child, semantic, effective)]

def compact(chars): return [(c,s) for c,s in chars if not c.isspace()]
def words(chars): return ''.join(c for c,_ in chars)
def images(root): return [n.attrs.get('src') for n in root.walk() if n.tag == 'img']
def source_images(blocks): return ['assets/employee-handbook/'+name for block in blocks for name in block.get('images',[])]
def root(html): return Parser(html).root
def plain(node): return words(actual(node))
def figure_pairs(tree):
    return [(images(figure)[0], ''.join(plain(n)for n in figure.find('figure-label')))for figure in tree.walk()if figure.tag=='figure'and images(figure)]
def material_values(tree):
    return [(tuple(words(compact(actual(n)))for n in card.find('check-raw')),
             tuple(words(compact(actual(n)))for n in card.find('check-text')))for card in tree.find('check-card')]

def excerpt_expected(node,ref):
    fmt=node['formatting'].get('blocks',{}).get(str(ref['sourceIndex']),{})
    if ref['field']=='rows':
        fmt=fmt.get('cells',[])[ref['rowIndex']][ref['cellIndex']]if fmt.get('cells')else{}
        source=node['blocks'][ref['sourceIndex']]['rows'][ref['rowIndex']][ref['cellIndex']]
    else:source=node['blocks'][ref['sourceIndex']].get('text','')
    prefix=source.encode('utf-16-le')[:ref['start']*2].decode('utf-16-le')
    fragment=source.encode('utf-16-le')[ref['start']*2:ref['end']*2].decode('utf-16-le')
    if fragment!=ref['text']:fail('excerpt source identity',node['key'])
    return expected(source,fmt)[len(prefix):len(prefix)+len(fragment)]

payload = json.loads(Path(sys.argv[1]).read_text())
failures = defaultdict(list); counts = Counter()
def fail(kind, key, detail=None):
    item = {'key':key}
    if detail is not None: item['detail'] = detail
    if len(failures[kind]) < 40: failures[kind].append(item)
    counts['failure:'+kind] += 1
def compare(got, wanted, key, mode):
    a,b = compact(got),compact(wanted)
    if words(a) != words(b):
        fail(mode+' text',key,{'actual':words(a)[:220],'expected':words(b)[:220]}); return
    if a != b:
        mismatches = [{'offset':i,'char':x[0],'actual':x[1],'expected':y[1]} for i,(x,y) in enumerate(zip(a,b)) if x!=y]
        fail(mode+' styles',key,mismatches[:8])
    counts['checkedCharacters'] += len(b)

def quote_context(quote,ref,key):
    contexts=quote.find('quote-context')
    wanted=['适用情形：'+ref['branchTitle']]if ref.get('branchTitle')else[]
    if [plain(context)for context in contexts]!=wanted:fail('excerpt branch context provenance',key)
    counts['branchContextLabels']+=len(contexts)

def badges_match_source(container,entries,key):
    allowed={code for entry in entries for code in entry['codes']}
    for badge in container.find('code-badge'):
        code=badge.attrs.get('data-code','')
        if code not in allowed or plain(badge)!=code or code=='000000':
            fail('transaction badge is not grounded in its original source line',key,code)
        counts['transactionBadges']+=1
        if code in ('H001','1010'):counts['shortTransactionBadge:'+code]+=1

for base,node in zip(payload['baseline'],payload['candidate']):
    key=node['key']; blocks=node['blocks']; fm=node['formatting']; counts['businesses']+=1
    if (key,node['title'],blocks)!=(base['key'],base['title'],base['blocks']): fail('business/source changed',key)
    assigned=[i for phase in node['flow'] for i in phase['sourceIndices']]
    if sorted(assigned)!=list(range(len(blocks))): fail('source blocks not assigned exactly once',key,assigned)
    for phase in node['flow']:
        if phase['blocks']!=[blocks[i]for i in phase['sourceIndices']]: fail('phase block identity',key)
    reader,raw,printed,no_images,continuous=map(root,[node['reader'],node['raw'],node['printWithImages'],node['printWithoutImages'],node['continuous']])
    if len(reader.find('stage-section'))!=4:fail('four sections',key)
    if len([n for n in reader.find('stage-section')if 'hidden' not in n.attrs])!=1:fail('guided one visible section',key)
    if any('hidden'in n.attrs for n in continuous.find('stage-section')):fail('continuous section hidden',key)
    if images(raw)!=source_images(blocks):fail('raw image order',key)
    staged_images=source_images([block for phase in node['flow']for block in phase['blocks']])
    if images(reader)!=staged_images or images(printed)!=staged_images:fail('screen/print image order',key)
    if [f['src']for f in node['figures']]!=staged_images:fail('lightbox image registration',key)
    if Counter(figure_pairs(reader))!=Counter(figure_pairs(root(base['reader']))):fail('original figure caption content',key)
    if images(no_images):fail('no-image print contains pictures',key)
    counts['renderedImages']+=len(staged_images)
    counts['consumedCaptionBlocks']+=sum(line['consumed']for line in node['expectedLines'])
    if Counter(material_values(reader))!=Counter(material_values(root(base['reader']))):fail('baseline material labels/order unchanged',key)
    entries=node['transactionEntries']
    operation_buttons=[n for group in reader.find('operation-index')for n in group.walk()if n.tag=='button']
    if len(operation_buttons)!=len(entries):fail('transaction index entry count',key)
    for button,entry in zip(operation_buttons,entries):
        if (button.attrs.get('data-source-jump'),button.attrs.get('data-source-line-jump'))!=(str(entry['sourceIndex']),str(entry['lineIndex'])):
            fail('transaction index original source jump',key)
        labels=[plain(n)for n in button.children if isinstance(n,Element)and n.tag in ('b','span')]
        wanted=[' / '.join(entry['codes']),(entry['branchTitle']+' · 'if entry.get('branchTitle')else'')+entry['text']]
        if labels!=wanted:fail('transaction index original entry labels',key,labels)
        if '000000'in entry['codes']:fail('default password entered transaction index',key)
        # Also validates each reference against its actual source text/cell.
        excerpt_expected(node,entry)
        counts['transactionEntries']+=1
    if not node['legacyChecksIgnored']:fail('old phase-relative material state reused',key)
    sourcecards=reader.find('check-card')
    registry=[{'cardKey':card.attrs['data-check-card'],'total':len(card.find('check-text'))}for card in sourcecards]
    if registry!=node['cards']:fail('material registry counts actual source cards only',key)
    if registry:
        section=root(node['aside']).find('qc-docs')
        button=next((n for group in section for n in group.walk()if n.tag=='button'),None)
        bi,li=registry[0]['cardKey'].split('.')
        if button is None or button.attrs.get('data-source-jump')!=bi or button.attrs.get('data-source-line-jump')!=li:fail('material tools link first actual source card',key)
    # Raw DOM must exactly preserve all original source blocks, including repeated table cells.
    source_chars=[]
    for bi,block in enumerate(blocks):
        formatting=fm.get('blocks',{}).get(str(bi),{})
        gotroot=root(node['rawBlocks'][bi])
        if block.get('kind')=='table':
            cellnodes=[n for n in gotroot.walk()if n.tag in ('td','th')]
            wantedcells=[(value,formatting.get('cells',[])[ri][ci]if formatting.get('cells')else None)
                for ri,row in enumerate(block['rows'])for ci,value in enumerate(row)]
            if len(cellnodes)!=len(wantedcells):fail('raw table cell count',key+'/'+str(bi))
            for ci,(cell,(value,fmt))in enumerate(zip(cellnodes,wantedcells)):
                wanted=expected(value,fmt);compare(actual(cell),wanted,f'{key}/{bi}/cell/{ci}','raw');source_chars+=wanted
            counts['tables']+=1
        else:
            wanted=expected(block.get('text',''),formatting)
            paragraphs=gotroot.find('raw-para')
            compare([c for p in paragraphs for c in actual(p)],wanted,f'{key}/{bi}','raw');source_chars+=wanted
    compare([p for n in raw.find('raw-document')for p in actual(n)],source_chars,key,'raw document')
    # Title formatting is cropped from the original title, not a global word lookup.
    titleformat=fm.get('title',{})
    title_start=node['sourceTitle'].find(node['title']);title_end=title_start+len(node['title'])
    titlechars=expected(node['sourceTitle'],titleformat)[title_start:title_end]
    for label,tree in [('screen',reader),('raw',raw),('print',printed)]:
        h1=next(n for n in tree.walk()if n.tag=='h1');compare(actual(h1),titlechars,key,label+' title')
    # Source line wrappers are body-only: excerpts and navigation copies are excluded.
    for label,tree in [('screen',reader),('print',printed),('no-image print',no_images),('continuous',continuous)]:
        wrappers=defaultdict(list)
        for body in tree.find('document-body'):
            for n in body.walk():
                if 'data-source-index'in n.attrs:
                    wrappers[(int(n.attrs['data-source-index']),int(n.attrs['data-source-line']))].append(n)
        for line in node['expectedLines']:
            bi,li=line['sourceIndex'],line['lineIndex'];block=blocks[bi];fmt=fm.get('blocks',{}).get(str(bi),{})
            if line['table']:
                tables=[t for wrap in wrappers[(bi,li)]for t in wrap.walk()if t.tag=='table']
                if not block.get('rows'):
                    if tables:fail(label+' empty source table acquired content',f'{key}/{bi}')
                    continue
                if len(tables)!=1:fail(label+' table occurrence',f'{key}/{bi}',len(tables));continue
                cells=[n for n in tables[0].walk()if n.tag in ('td','th')]
                target=[(value,fmt.get('cells',[])[ri][ci]if fmt.get('cells')else None,ri,ci)for ri,row in enumerate(block['rows'])for ci,value in enumerate(row)]
                if len(cells)!=len(target):fail(label+' table cells',f'{key}/{bi}')
                for ci,(cell,(value,cf,ri,column))in enumerate(zip(cells,target)):
                    compare(actual(cell),expected(value,cf),f'{key}/{bi}/cell/{ci}',label)
                    if label=='screen':badges_match_source(cell,[entry for entry in entries if entry['sourceIndex']==bi and entry['field']=='rows'and entry['rowIndex']==ri and entry['cellIndex']==column],f'{key}/{bi}/cell/{ci}')
                continue
            if line['consumed'] or not line['text'].strip():continue
            lines=block.get('text','').split('\n')if block.get('shape')else[block.get('text','')]
            offset=sum(len(part)+1 for part in lines[:li]);wanted=expected(block.get('text',''),fmt)[offset:offset+len(line['text'])]
            candidates=[n for n in wrappers[(bi,li)]if words(compact(actual(n,True)))]
            if len(candidates)!=1:fail(label+' source line occurrence',f'{key}/{bi}/{li}',len(candidates));continue
            compare(actual(candidates[0],True),wanted,f'{key}/{bi}/{li}',label)
            if label=='screen':
                badges_match_source(candidates[0],[entry for entry in entries if entry['sourceIndex']==bi and entry['field']=='text'and entry['lineIndex']==li],f'{key}/{bi}/{li}')
                # Independently check each visible material label/segment against
                # its scoped source position, not just its full hidden raw copy.
                for card in candidates[0].find('check-card'):
                    fragments=card.find('def-label')[:1]+card.find('check-text');cursor=0
                    for part in fragments:
                        value=plain(part);start=line['text'].find(value,cursor)
                        if start<0:fail('material fragment not source slice',f'{key}/{bi}/{li}',value);continue
                        compare(actual(part),wanted[start:start+len(value)],f'{key}/{bi}/{li}','material fragment');cursor=start+len(value)
                    inputs=[n.attrs['data-check-index']for n in card.walk()if 'data-check-index'in n.attrs]
                    if inputs!=[str(i)for i in range(len(card.find('check-text')))]:fail('material checkbox indices',f'{key}/{bi}/{li}')
                    counts['materialCards']+=1;counts['materialItems']+=len(inputs)
    for quote in node['quotes']:
        ref=quote['ref']
        quote_tree=root(quote['html'])
        quote_context(quote_tree,ref,key+'/'+str(ref['sourceIndex']))
        para=next(n for n in quote_tree.walk()if n.tag=='p')
        compare(actual(para),excerpt_expected(node,ref),key+'/'+str(ref['sourceIndex']),'excerpt');counts['excerpts']+=1
    prep=[quote for group in reader.find('before-notes')for quote in group.find('source-quote')]
    if len(prep)!=len(node['preparationRefs']):fail('actual preparation excerpt count',key)
    for quote,ref in zip(prep,node['preparationRefs']):
        quote_context(quote,ref,key+'/'+str(ref['sourceIndex']))
        wanted=excerpt_expected(node,ref)
        para=next(n for n in quote.walk()if n.tag=='p')
        compare(actual(para),wanted,key+'/'+str(ref['sourceIndex']),'actual preparation full source')
        for card in quote.find('preparation-materials'):
            if any(n.tag=='input'for n in card.walk())or card.find('check-card'):fail('preparation excerpt creates duplicate checkbox',key)
            head=next(n for n in card.walk()if n.tag=='b')
            fragments=[head]+[n for n in card.walk()if n.tag=='li'];cursor=0
            for part in fragments:
                value=plain(part);start=ref['text'].find(value,cursor)
                if start<0:fail('preparation fragment not exact source slice',key,value);continue
                compare(actual(part),wanted[start:start+len(value)],key+'/'+str(ref['sourceIndex']),'preparation material fragment');cursor=start+len(value)
            counts['preparationMaterialCards']+=1;counts['preparationMaterialItems']+=len(fragments)-1

if len(payload['candidate'])!=81 or len(payload['baseline'])!=81:fail('81 businesses','all')
for code in ('H001','1010'):
    if not counts['shortTransactionBadge:'+code]:fail('short transaction code missing from actual source badges','all',code)
checks=[{'name':kind,'ok':False,'failures':counts['failure:'+kind]}for kind in failures]
if not checks:checks=[{'name':name,'ok':True}for name in ['81 business/source identities', 'all source blocks assigned exactly once', 'guided/continuous sections', 'source line and table text conserved in all render modes', 'source colors/highlights/bold remain on exact source characters', 'materials retain source text/styles and indices', 'raw document/title formatting', 'excerpt formatting is exact scoped source slice', 'screen/raw/print/lightbox original image order', 'excerpt branch context is separate source-linked interface text', 'transaction entries and badges retain exact source provenance, short codes and password exclusion']]
print(json.dumps({'checks':checks,'failures':dict(failures),'stats':{k:v for k,v in counts.items()if not k.startswith('failure:')}},ensure_ascii=False))
