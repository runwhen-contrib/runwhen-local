Expression
  = head:Term tail:(_ ("|" / "&" / "^") _ Term)* {
      return !!tail.reduce((result, element) => {
      	switch (element[1]) {
          case "|": return result | element[3];
          case "&": return result & element[3];
          case "^": return result ^ element[3];
        }
      }, head);
    }

Term
  = "!" term:Term { return !term; }
  / "(" _ expr:Expression _ ")" { return expr; }
  / Token

Token
  = _ token:$[^ \t\n\r()!|&^]+
    &{ return options.queryPattern.test(token); }
    { return options.checkFn(token); }

_ "whitespace"
  = [ \t\n\r]*
