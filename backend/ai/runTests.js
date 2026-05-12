import testInputs from "./testInputs.json" assert { type: "json" };
import { extractBusinessData } from "./extractBusinessData.js";

async function runTests() {
  console.log("Running AI extraction tests...\n");

  for (const test of testInputs) {
    console.log("==============================");
    console.log(`Test: ${test.name}`);
    console.log("==============================");

    const result = await extractBusinessData(test.input);

    if (result.success) {
      console.log("Success:");
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.log("Failed:");
      console.log(result.errors);
    }

    console.log("\n");
  }
}

runTests();