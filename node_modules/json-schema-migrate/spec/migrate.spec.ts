import assert = require("assert")
import {draft7, draft2019, draft2020, getAjv} from ".."
import schemaDraft4 = require("./fixtures/schema-draft-04.json")
import expectedSchemaDraft7 = require("./fixtures/expected-schema-from-draft-04-to-07.json")
import expectedSchemaDraft2019 = require("./fixtures/expected-schema-from-draft-04-to-2019.json")
import expectedSchemaDraft2020 = require("./fixtures/expected-schema-from-draft-04-to-2020.json")
import Ajv, {AnySchemaObject} from "ajv/dist/core"

function clone(schema: AnySchemaObject): AnySchemaObject {
  return JSON.parse(JSON.stringify(schema)) as AnySchemaObject
}

describe("migrate to draft-07 schema", () => {
  it("should migrate from draft-04 schema to draft-07 schema", () => {
    const schema = clone(schemaDraft4)
    draft7(schema)
    assert.deepStrictEqual(schema, expectedSchemaDraft7)
    const ajv = getAjv()
    assert(ajv instanceof Ajv)
    assert.strictEqual(ajv, getAjv())
  })

  it("should migrate from draft-04 schema to draft-2019-09 schema", () => {
    const schema = clone(schemaDraft4)
    draft2019(schema)
    assert.deepStrictEqual(schema, expectedSchemaDraft2019)
  })

  it("should migrate from draft-04 schema to draft-2020-12 schema", () => {
    const schema = clone(schemaDraft4)
    draft2020(schema)
    assert.deepStrictEqual(schema, expectedSchemaDraft2020)
  })

  describe("invalid schemas", () => {
    it("should throw if id is not a string", () => {
      assert.throws(() => draft7({id: 1}))
    })

    it("should throw if id has many #s", () => {
      assert.throws(() => draft2019({id: "schema#for#bar"}))
    })
  })
})
