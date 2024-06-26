import {visit} from "unist-util-visit";
import {toString} from "hast-util-to-string";

/**
 * @typedef {Object} TocItem
 * @property {string} title
 * @property {string} id
 * @property {number} level
 * @property {TocItem[]} [children]
 */

/**
 * @param tree {Root}
 * @param title {string}
 * @return {TocItem|undefined}
 */
function extractToc(tree, title) {
  const toc = {title, id: '', depth: 1, children: []};
  const children = toc.children;
  let current;
  visit(tree, /**@param node {Element}*/(node) => node.tagName?.match(/h[2-4]/),
    /**
     * @param heading {Element}
     * @param index {number}
     * @param parent {Element}
     */
    (heading, index, parent) => {
      const item = {
        title: toString(heading),
        id: heading.properties.id || parent.properties.id,
        level: heading.tagName.match(/h([1-6])/)[1] - 0
      };
      if (item.level > current?.level) {
        current.children = current.children || [];
        current.children.push(item);
      } else {
        children.push(item);
        current = item;
      }
    });
  if (children.length === 0) {
    return undefined;
  }
  return toc;
}

/** @returns {Processor} */
export default function extractMeta() {
  return (tree, vfile) => {
    if (tree.children[0]?.tagName === 'h1') {
      vfile.data.title = toString(tree.children[0]);
    }
    vfile.data.toc = extractToc(tree, vfile.data.title);
  };
}