import CartParser from "./CartParser";

let parser, parse, validate, parseLine, calcTotal, createError;

beforeEach(() => {
  parser = new CartParser();

  parse = parser.parse.bind(parser);
  validate = parser.validate.bind(parser);
  parseLine = parser.parseLine.bind(parser);
  calcTotal = parser.calcTotal;
  createError = parser.createError;
}); 

describe("CartParser - unit tests", () => {
  describe("validate", () => {
    it("should push an error about unexpected naming of header", () => {
      const mockContents = `Product name, Quantity \n
		  Mollis consequat,9.00,2`;

      const expectedOutput = [
        {
          type: "header",
          row: 0,
          column: 1,
          message: 'Expected header to be named "Price" but received Quantity.'
        },
        {
          type: "header",
          row: 0,
          column: 2,
          message:
            'Expected header to be named "Quantity" but received undefined.'
        }
      ];

      expect(validate(mockContents)).toEqual(expectedOutput);
    });

    it("should push an error about unexpected row length", () => {
      const mockContents = `Product name, Price, Quantity \n
		  Mollis consequat, 9.00`;
      const expectedOutput = [
        {
          type: "row",
          row: 1,
          column: -1,
          message: "Expected row to have 3 cells but received 2."
        }
      ];

      expect(validate(mockContents)).toEqual(expectedOutput);
    });

    it("should push an error about cell", () => {
      const mockContents = `Product name, Price, Quantity \n
		  , 2 ,9.00`;
      const expectedOutput = [
        {
          type: "cell",
          row: 1,
          column: 0,
          message: 'Expected cell to be a nonempty string but received "".'
        }
      ];

      expect(validate(mockContents)).toEqual(expectedOutput);
    });

    it("should push an error about not positive number in a cell", () => {
      const mockContents = `Product name, Price, Quantity \n
		  Mollis consequat, 9.00, -3`;
      const expectedOutput = [
        {
          type: "cell",
          row: 1,
          column: 2,
          message: 'Expected cell to be a positive number but received "-3".'
        }
      ];

      expect(validate(mockContents)).toEqual(expectedOutput);
    });

    it("should push an error about NaN in a cell", () => {
      const mockContents = `Product name, Price, Quantity \n
		  Mollis consequat, 9.00, ${null}`;
      const expectedOutput = [
        {
          type: "cell",
          row: 1,
          column: 2,
          message: 'Expected cell to be a positive number but received "null".'
        }
      ];

      expect(validate(mockContents)).toEqual(expectedOutput);
    });

    it("should push an error about string in a number cell", () => {
      const mockContents = `Product name, Price, Quantity \n
		  Mollis consequat, 9.00, string`;
      const expectedOutput = [
        {
          type: "cell",
          row: 1,
          column: 2,
          message:
            'Expected cell to be a positive number but received "string".'
        }
      ];

      expect(validate(mockContents)).toEqual(expectedOutput);
    });

    it("should return an empty array without errors", () => {
      const mockContents = `Product name, Price, Quantity \n
		  Mollis consequat, 9.00, 2`;

      expect(validate(mockContents)).toStrictEqual([]);
    });
  });

  describe("parseLine", () => {
    it("should return a product item with id, price, quantity and name", () => {
      const mockData = "Condimentum aliquet,13.90,1";

      expect(parseLine(mockData)).toHaveProperty("id");
      expect(parseLine(mockData)).toHaveProperty("price", 13.9);
      expect(parseLine(mockData)).toHaveProperty("quantity", 1);
      expect(parseLine(mockData)).toHaveProperty("name", "Condimentum aliquet");
    });
  });

  describe("calcTotal", () => {
    const tests = [
      {
        result: 10,
        items: [
          {
            price: 2,
            quantity: 2
          },
          {
            price: 3,
            quantity: 2
          }
        ]
      }
    ];

    tests.forEach(test => {
      it("should return sum of price*quantity of all items", () => {
        expect(calcTotal(test.items)).toBe(test.result);
      });
    });
  });

  describe("createError", () => {
    it("should return an object describing error", () => {
      const mockData = {
        type: "header",
        row: 1,
        col: 1,
        message:
          'Expected header to be named "Quantity" but received undefined.'
      };

      expect(createError(mockData)).toHaveProperty(
        "type",
        "col",
        "message",
        "row"
      );
    });
  });
});

describe("CartParser - integration test", () => {
  let spy = spyConsole();

  it("should work", () => {
    expect(() => parse("samples/cart.csv")).not.toThrow("Validation failed!");
    expect(console.error).not.toHaveBeenCalled();

    expect(parse("samples/cart.csv")).toHaveProperty("total");
  });
});

function spyConsole() {
  let spy = {};

  beforeAll(() => {
    spy.console = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    spy.console.mockRestore();
  });

  return spy;
}
