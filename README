babel-query queries a Babylon AST using a `esquery`-style syntax to define syntactic filters, and returning `@babel/traverse`-ready `NodePath`s.

Selector types:

* [Type](https://www.w3.org/TR/selectors-4/#type-selectors) `Identifier`
* [Wildcard](https://www.w3.org/TR/selectors-4/#the-universal-selector) `*`
* [Negation](https://www.w3.org/TR/selectors-4/#negation) `:not(Identifier, ExpressionStatement)`
* [Matches-Any](https://www.w3.org/TR/selectors-4/#matches) `:is(Identifier, ExpressionStatement)`
* [Relational](https://www.w3.org/TR/selectors-4/#relational) `:has(> Identiier.id)`
* Ancestry `CallStatement.body:is(BlockStatement).body.0`
* Attribute
* Root path `:root`
* `:nth-child`
    * `nth-child(3n+1)`
    * `first-child`
    * `last-child`
* Combinators
    * Descendant ` `
    * Child `>`
    * Next-sibling `+`
    * Subsequent-sibling `~`