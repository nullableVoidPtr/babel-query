import nearley from 'nearley';
import SelectorGrammar from './grammar.js';
import { ComplexSelector, Selector, SubjectPseudoSelector } from './selector.js';
import { Node, isType } from '@babel/types';
import babel_traverse, { NodePath, Scope, TraverseOptions } from '@babel/traverse';

export function parse(selector: string): Selector {
    const parser = new nearley.Parser(
        nearley.Grammar.fromCompiled(SelectorGrammar as any)
    );

    try {
        parser.feed(selector);
    } catch (parseError: any) {
        throw new Error(`Error at character ${parseError.offset}`);
    }

    if (parser.results.length === 0) {
        throw new Error(`Unexpected end of input`);
    }

    return parser.results[0];
}

export interface QueryOptions {
    scope?: Scope;
    noScope?: boolean;
    denylist?: (Node["type"])[];
}

function matches(path: NodePath, selector: Selector, options: QueryOptions, root?: NodePath, subject?: NodePath): boolean {
    if (!root) {
        root = path;
    }

    switch (selector.type) {
        case 'wildcard':
            return true;
        case 'type':
            return isType(path.type, selector.name);
        case 'list':
            return selector.list.some(
                s => matches(path, s, options, root, subject)
            );
        case 'compound':
            return selector.list.every(
                s => matches(path, s, options, root, subject)
            );
        case 'complex':
            switch (selector.combinator) {
                case 'sibling':
                    const prevSiblings = path.getAllPrevSiblings();
                    return prevSiblings.length !== 0 &&
                        matches(path, selector.right, options, root, subject) &&
                        prevSiblings.some(
                            p => matches(p, selector.left, options, root, subject)
                        );
                case 'adjacent':
                    const prevSibling = path.getPrevSibling();
                    return prevSibling &&
                        matches(path, selector.right, options, root, subject) &&
                        matches(prevSibling, selector.left, options, root, subject);
                case 'child':
                    const parentPath = path.parentPath;
                    return parentPath !== null &&
                        matches(path, selector.right, options, root, subject) &&
                        matches(parentPath, selector.left, options, root, subject);
                case 'descendant':
                    const ancestry = path.getAncestry().slice(1);
                    return ancestry.length !== 0 &&
                        matches(path, selector.right, options, root, subject) &&
                        ancestry.some(
                            p => matches(p, selector.left, options, root, subject)
                        );
            }
        case 'root':
            return path === root;
        case 'only-child':
            return path.inList && (path.container as object[]).length === 1;
        case 'not':
            return !matches(path, selector.argument, options, undefined, subject);
        case 'is':
            return matches(path, selector.argument, options, undefined, subject);
        case 'has':
            return selector.list.some(s => {
                switch (s.combinator) {
                    case 'sibling':
                        const nextSiblings = path.getAllNextSiblings();
                        return nextSiblings.length !== 0 &&
                            nextSiblings.some(
                                p => matches(p, s.selector, options, root, path)
                            );
                    case 'adjacent':
                        const nextSibling = path.getNextSibling();
                        return nextSibling &&
                            matches(nextSibling, s.selector, options, root, path);
                    case 'child':
                    case 'descendant':
                        let matched = false;
                        let selector = structuredClone(s.selector);
                        if (s.combinator == 'child') {
                            let current = selector;
                            while (current.type == 'complex') {
                                current = current.left;
                            }

                            current.left = <ComplexSelector>{
                                type: 'complex',
                                combinator: 'child',
                                left: <SubjectPseudoSelector>{
                                    type: 'subject',
                                },
                                right: current.left
                            }
                        }
                        path.traverse({
                            enter(p) {
                                if (matches(p, selector, options, root, path)) {
                                    matched = true;
                                    p.stop();
                                }
                            }
                        });
                        return matched;
                }
            });
        case 'ancestry':
            if (!matches(path, selector.subject, options, root)) {
                return false;
            }

            const ancestry = path.getAncestry();

            let pathI = selector.path.length - 1;
            for (let i = 0; i < ancestry.length; i++) {
                const currentNodePath = ancestry[i];
                let {key, specifier} = selector.path[pathI];

                if (currentNodePath.key !== key) {
                    return false;
                }
                if (specifier &&
                    !matches(currentNodePath, specifier, options, root)) {
                    return false;
                }

                if (--pathI < 0) {
                    return true;
                }


                if (typeof key === 'number') {
                    if (selector.path[pathI].specifier) {
                        return false;
                    }

                    if (!currentNodePath.inList) {
                        return false;
                    }

                    if (currentNodePath.listKey !== selector.path[pathI].key) {
                        return false;
                    }

                    if (--pathI < 0) {
                        return true;
                    }
                }
            }

            return true;
        case 'nth-child':
            if (!path.inList) {
                return false;
            }

            const index = path.key as number;
            const expected = selector.index;
            if (expected.multiplier > 0) {
                return (index - expected.offset) % expected.multiplier === 0;
            } else if (expected.multiplier < 0) {
                return (index + expected.offset) % expected.multiplier === 0;
            }

            return expected.offset === index;
        case 'attribute':
            let value: any = path.node;
            for (const key of selector.names) {
                if (!(key in value)) {
                    return false;
                }

                value = value[key];
            }

            if (!selector.operator) {
                return !!value;
            }

            const right = selector.right!;
            if (typeof right === 'object') {
                if (typeof value !== 'string') {
                    return false;
                }
                const match = right.test(value);
                switch (selector.operator) {
                    case '=':
                        return match;
                    case '!=':
                        return !match;
                    default:
                        throw new Error(`unexpected binary operator ${selector.operator}`)
                }
            }

            if (typeof value !== typeof right) {
                return false;
            }

            switch (selector.operator) {
                case '=':
                    return value === right; 
                case '!=':
                    return value !== right; 
                case '>':
                    return value > right; 
                case '<':
                    return value < right; 
                case '>=':
                    return value >= right; 
                case '<=':
                    return value <= right; 
                case '^=':
                    if (typeof value !== 'string') {
                        return false;
                    }

                    return value.startsWith(right as string);
                case '$=':
                    if (typeof value !== 'string') {
                        return false;
                    }

                    return value.endsWith(right as string);
                case '*=':
                    if (typeof value !== 'string') {
                        return false;
                    }

                    return value.includes(right as string);
            }
        case 'subject':
            return path === subject;
    }

    throw new Error("Unknown selector type");
}

export function traverse(
    node: NodePath | Node,
    selector: Selector,
    visitor: (path: NodePath) => void,
    options?: QueryOptions,
    scope?: Scope,
    state?: any,
    parentPath?: NodePath,
) {
    const traverseOptions: TraverseOptions = {};

    if (!options) {
        options = {};
    } else {
        if ('scope' in options) {
            traverseOptions.scope = options.scope;
        }
        if ('noScope' in options) {
            traverseOptions.noScope = options.noScope;
        }
        if ('denylist' in options) {
            traverseOptions.denylist = options.denylist;
        }
    }


    if ('parentPath' in node) {
        node.traverse({
            enter(current: NodePath) {
                if (matches(current, selector, options ?? {}, node)) {
                    visitor(current);
                }
            },
        });
    } else {
        babel_traverse.default(node, {
            ...traverseOptions,
            enter(path: NodePath) {
                path.skip();
                path.traverse({
                    enter(current: NodePath) {
                        if (matches(current, selector, options ?? {}, path)) {
                            visitor(current);
                        }
                    },
                });
            }
        }, scope, state, parentPath);
    }
}

export function query(
    node: NodePath | Node,
    selector: string | Selector,
    options?: QueryOptions,
    scope?: Scope,
    parentPath?: NodePath,
): NodePath[] {
    if (typeof selector === 'string') {
        selector = parse(selector);
    }

    const matches: NodePath[] = [];
    traverse(node, selector, (path) => matches.push(path), options);

    return matches;
}