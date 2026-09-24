/* 刷刷 XLSX 读取器：只读取本地文件，不上传数据。 */
(function () {
  "use strict";

  const decoder = new TextDecoder("utf-8");
  const signatures = { local: 0x04034b50, central: 0x02014b50, end: 0x06054b50 };

  function error(message) {
    const result = new Error(message);
    result.userMessage = message;
    return result;
  }

  function findEndOfCentralDirectory(bytes) {
    for (let index = Math.max(0, bytes.length - 0xffff - 22); index <= bytes.length - 22; index += 1) {
      if (new DataView(bytes.buffer, bytes.byteOffset + index, 4).getUint32(0, true) === signatures.end) return index;
    }
    throw error("这不是可识别的 .xlsx 文件");
  }

  async function inflate(bytes, compression) {
    if (compression === 0) return bytes;
    if (compression !== 8) throw error("该 Excel 文件使用了不支持的压缩方式");
    if (typeof DecompressionStream !== "function") throw error("当前浏览器版本不支持读取 .xlsx，请升级浏览器后重试");
    try {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      return new Uint8Array(await new Response(stream).arrayBuffer());
    } catch (_error) {
      throw error("Excel 文件解压失败，请确认文件未损坏");
    }
  }

  async function unzip(buffer) {
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);
    const end = findEndOfCentralDirectory(bytes);
    const entries = view.getUint16(end + 10, true);
    let offset = view.getUint32(end + 16, true);
    const files = new Map();
    for (let count = 0; count < entries; count += 1) {
      if (view.getUint32(offset, true) !== signatures.central) throw error("Excel 文件目录损坏");
      const compression = view.getUint16(offset + 10, true);
      const compressedSize = view.getUint32(offset + 20, true);
      const nameLength = view.getUint16(offset + 28, true);
      const extraLength = view.getUint16(offset + 30, true);
      const commentLength = view.getUint16(offset + 32, true);
      const localOffset = view.getUint32(offset + 42, true);
      const name = decoder.decode(bytes.slice(offset + 46, offset + 46 + nameLength));
      if (view.getUint32(localOffset, true) !== signatures.local) throw error("Excel 文件内容损坏");
      const localNameLength = view.getUint16(localOffset + 26, true);
      const localExtraLength = view.getUint16(localOffset + 28, true);
      const dataStart = localOffset + 30 + localNameLength + localExtraLength;
      files.set(name, await inflate(bytes.slice(dataStart, dataStart + compressedSize), compression));
      offset += 46 + nameLength + extraLength + commentLength;
    }
    return files;
  }

  function xmlDocument(bytes, filename) {
    if (!bytes) throw error(`Excel 文件缺少 ${filename}`);
    const doc = new DOMParser().parseFromString(decoder.decode(bytes), "application/xml");
    if (doc.querySelector("parsererror")) throw error(`无法读取 Excel 中的 ${filename}`);
    return doc;
  }

  function elementsByName(element, name) {
    return [...element.getElementsByTagName("*")].filter((node) => node.localName === name);
  }

  function firstByName(element, name) {
    return elementsByName(element, name)[0] || null;
  }

  function cellColumn(reference) {
    const letters = String(reference || "").match(/[A-Z]+/i)?.[0]?.toUpperCase() || "";
    return [...letters].reduce((value, letter) => value * 26 + letter.charCodeAt(0) - 64, 0) - 1;
  }

  function cellValue(cell, sharedStrings) {
    const type = cell.getAttribute("t");
    if (type === "inlineStr") return firstByName(cell, "is")?.textContent || "";
    const raw = firstByName(cell, "v")?.textContent || "";
    if (type === "s") return sharedStrings[Number(raw)] || "";
    if (type === "b") return raw === "1" ? "TRUE" : "FALSE";
    return raw;
  }

  function sheetRows(bytes, sharedStrings) {
    const doc = xmlDocument(bytes, "工作表");
    return elementsByName(doc, "row").map((row) => {
      const values = [];
      elementsByName(row, "c").forEach((cell) => { values[cellColumn(cell.getAttribute("r"))] = cellValue(cell, sharedStrings); });
      return values;
    });
  }

  async function readWorkbook(file) {
    if (!file || !/\.xlsx$/i.test(file.name || "")) throw error("请选择 .xlsx 格式的 Excel 文件");
    const files = await unzip(await file.arrayBuffer());
    const sharedStrings = files.has("xl/sharedStrings.xml")
      ? elementsByName(xmlDocument(files.get("xl/sharedStrings.xml"), "共享文本"), "si").map((item) => item.textContent || "")
      : [];
    const workbook = xmlDocument(files.get("xl/workbook.xml"), "工作簿");
    const relationships = xmlDocument(files.get("xl/_rels/workbook.xml.rels"), "工作簿关系");
    const targets = new Map(elementsByName(relationships, "Relationship").map((item) => [item.getAttribute("Id"), item.getAttribute("Target")]));
    const sheets = elementsByName(workbook, "sheet").map((sheet) => {
      const relationId = sheet.getAttribute("r:id") || sheet.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id");
      const target = targets.get(relationId);
      if (!target) return null;
      const path = target.startsWith("/") ? target.slice(1) : `xl/${target.replace(/^\.\//, "")}`;
      return { name: sheet.getAttribute("name") || "题库", rows: sheetRows(files.get(path), sharedStrings) };
    }).filter(Boolean);
    if (!sheets.length) throw error("Excel 文件中没有可读取的工作表");
    return sheets;
  }

  window.XlsxImport = Object.freeze({ readWorkbook });
}());
