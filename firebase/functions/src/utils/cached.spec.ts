import {cached} from "./cached";
import * as sinon from "sinon";
import expect from "expect";

describe("cached", () => {
  it("only calls callback once and returns correct value", () => {
    const callback = sinon.fake.returns(42);
    const cachedCallback = cached(callback);

    for (let i = 0; i < 3; i++) {
      expect(cachedCallback()).toBe(42);
    }

    sinon.assert.calledOnce(callback);
  });
});
