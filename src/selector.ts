export type CombinatorType  = "sibling" | "adjacent" | "child" | "descendant";

export interface ListSelector {
    type: "list";
    list: Exclude<Selector, ListSelector>[];
}

export interface ComplexSelector {
    type: "complex";
    combinator: CombinatorType;
    left: Selector;
    right: Selector;
}

export interface CompoundSelector {
    type: "compound";
    list: Selector[];
}

export interface WildcardSelector {
    type: "wildcard";
}

export interface TypeSelector {
    type: "type";
    name: string;
}

export interface AncestrySelector {
    type: "ancestry";
    subject: Selector;
    path: ({
        key: string | number;
        specifier: AttributeSelector | PseudoSelector | null;
    })[];
}

export type AttributeBinOps =
    "=" |
    "!=" |
    ">" |
    "<" |
    ">=" |
    "<=" |
    "^=" |
    "$=" |
    "*=";

export interface AttributeSelector {
    type: "attribute",
    names: string[];
    operator?: AttributeBinOps;
    right?: string | number | RegExp;
}

export interface RootPseudoSelector {
    type: "root";
}

export type NodeClass =
    "statement" |
    "expression" |
    "declaration" |
    "function" |
    "pattern" |
    "scope";
export interface ClassPseudoSelector {
    type: "class";
    name: NodeClass;
}

export interface nthExpr {
    type: "nthExpr",
    multiplier: number;
    offset: number;
}

export interface IsPseudoSelector {
    type: "is";
    argument: Selector;
}

export interface NotPseudoSelector {
    type: "not";
    argument: Selector;
}

export interface HasPseudoSelector {
    type: "has";
    list: {
        combinator: CombinatorType;
        selector: Selector;
    }[];
}

export interface NthChildPseudoSelector {
    type: "nth-child";
    index: nthExpr;
}

export interface OnlyChildPseudoSelector {
    type: "only-child";
}

// internal-only
export interface SubjectPseudoSelector {
    type: "subject";
}

export type PseudoSelector =
    RootPseudoSelector |
    ClassPseudoSelector |
    IsPseudoSelector |
    NotPseudoSelector |
    HasPseudoSelector |
    NthChildPseudoSelector |
    OnlyChildPseudoSelector |
    SubjectPseudoSelector;

export type Selector =
    ListSelector |
    ComplexSelector |
    CompoundSelector |
    WildcardSelector |
    TypeSelector |
    AncestrySelector |
    AttributeSelector |
    PseudoSelector;