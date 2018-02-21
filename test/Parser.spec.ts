import * as p from "parser-ts"
import * as c from "parser-ts/lib/char"
import * as s from "parser-ts/lib/string"
import "../src/index"

describe("Do/Let/Return", () => {
  describe("for Parser", () => {
    it("returns the same result as the equivalent chain pipeline", () => {
      const parser = c
        .many1(c.upper) // Parse a sequence of 1 or more upper case letters
        .chain(method =>
          s.spaces1 // Consume 1 or more spaces
            .chain(() => s.notSpaces1) // Parse a sequence of 1 or more non-whitespace characters
            .chain(path =>
              s.spaces1 // Consume 1 or more spaces
                .chain(() => s.string("HTTP/")) // Match the string "HTTP/"
                .chain(() => p.fold([c.many1(c.digit), s.string("."), c.many1(c.digit)])) // Parse the version string
                .chain(version =>
                  p.succeed({
                    // Return the final parsed value
                    method,
                    path,
                    version,
                  }),
                ),
            ),
        )

      const parser2 = c
        .many1(c.upper)
        .into("method") // Parse a sequence of 1 or more upper case letters
        .consume(s.spaces1) // Consume 1 or more spaces
        .parse("path", s.notSpaces1) // Parse a sequence of 1 or more non-whitespace characters
        .consume(s.spaces1) // Consume 1 or more spaces
        .consume(s.string("HTTP/")) // Match the string "HTTP/"
        .parse("version", p.fold([c.many1(c.digit), s.string("."), c.many1(c.digit)])) // Parse the version string

      expect(parser.run("GET /lol.gif HTTP/1.0")).toEqual(parser2.run("GET /lol.gif HTTP/1.0"))
    })
  })
})
