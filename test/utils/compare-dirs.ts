import * as dircompare from "dir-compare";

async function compareDirectories(path1, path2) {
  const options = { compareSize: true, compareContent: true };

  // Asynchronous
  return dircompare.compare(path1, path2, options);
}

function print(result) {
  if (result.same) {
    return true;
  }
  console.log("Directories are %s", result.same ? "identical" : "different");
  console.log(
    "Statistics - equal entries: %s, distinct entries: %s, left only entries: %s, right only entries: %s, differences: %s",
    result.equal,
    result.distinct,
    result.left,
    result.right,
    result.differences
  );

  result.diffSet.forEach(dif => {
    if (dif.state === "equal") {
      return;
    }
    console.log(
      "Difference - expected name: %s, expected type: %s, output name: %s, output type: %s, state: %s",
      dif.name1,
      dif.type1,
      dif.name2,
      dif.type2,
      dif.state
    );
  });
}

export { compareDirectories, print };
