import { Selector } from './selector.js';
import { NodePath } from '@babel/traverse';
export declare function parse(selector: string): Selector;
export interface QueryOptions {
}
export declare function traverse(path: NodePath, selector: Selector, visitor: (path: NodePath) => void, options: QueryOptions): void;
export declare function query(path: NodePath, selector: string | Selector, options?: QueryOptions): NodePath[];
