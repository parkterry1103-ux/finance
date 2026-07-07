type XmlNode = {
  name: string;
  attributes: Record<string, string>;
  children: XmlNode[];
  text: string;
};

function decodeXmlText(value: string) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function localName(name: string) {
  if (!name.includes(':')) return name;
  const parts = name.split(':');
  return parts[parts.length - 1] ?? name;
}

function parseTag(rawTag: string) {
  const clean = rawTag.replace(/^</, '').replace(/\/?>$/, '').trim();
  const [rawName = '', ...rest] = clean.split(/\s+/);
  const attributes: Record<string, string> = {};
  const attrSource = rest.join(' ');
  const attrPattern = /([A-Za-z0-9_:\-.]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let match: RegExpExecArray | null;
  while ((match = attrPattern.exec(attrSource))) {
    attributes[localName(match[1])] = decodeXmlText(match[3] ?? match[4] ?? '');
  }
  return { name: localName(rawName), attributes };
}

export function parseXml(xml: string) {
  const root: XmlNode = { name: '#document', attributes: {}, children: [], text: '' };
  const stack: XmlNode[] = [root];
  const tokenPattern = /<!\[CDATA\[[\s\S]*?\]\]>|<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!DOCTYPE[\s\S]*?>|<[^>]+>|[^<]+/g;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(xml))) {
    const token = match[0];
    const current = stack[stack.length - 1] ?? root;
    if (token.startsWith('<!--') || token.startsWith('<?') || token.startsWith('<!DOCTYPE')) continue;
    if (token.startsWith('<![CDATA[')) {
      current.text += token.slice(9, -3);
      continue;
    }
    if (!token.startsWith('<')) {
      current.text += decodeXmlText(token);
      continue;
    }
    if (token.startsWith('</')) {
      const closing = localName(token.replace(/^<\//, '').replace(/>$/, '').trim());
      while (stack.length > 1) {
        const popped = stack.pop();
        if (popped?.name === closing) break;
      }
      continue;
    }
    const selfClosing = /\/>$/.test(token);
    const node = { ...parseTag(token), children: [], text: '' };
    current.children.push(node);
    if (!selfClosing) stack.push(node);
  }

  return root;
}

export function childrenByName(node: XmlNode | undefined, name: string) {
  return node?.children.filter((child) => child.name === name) ?? [];
}

export function firstChild(node: XmlNode | undefined, name: string) {
  return childrenByName(node, name)[0];
}

export function descendantText(node: XmlNode | undefined): string {
  if (!node) return '';
  const childText = node.children.map(descendantText).join('');
  return `${node.text}${childText}`.trim();
}

export function textAt(node: XmlNode | undefined, path: string[]) {
  let current = node;
  for (const part of path) current = firstChild(current, part);
  return descendantText(current) || null;
}

export function valueAt(node: XmlNode | undefined, path: string[]) {
  return textAt(node, [...path, 'value']);
}

export function collectFootnoteIds(node: XmlNode | undefined) {
  const ids = new Set<string>();
  const visit = (current: XmlNode | undefined) => {
    if (!current) return;
    if (current.name === 'footnoteId' && current.attributes.id) ids.add(current.attributes.id);
    current.children.forEach(visit);
  };
  visit(node);
  return Array.from(ids);
}
