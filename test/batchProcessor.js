const BatchProcessor = artifacts.require("BatchProcessor");

contract("BatchProcessor", accounts => {
  it("should work", async () => {
    let batcher = await BatchProcessor.new();
  });
});