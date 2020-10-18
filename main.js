const circleRadius = 5;
const depthLength = 40;
const spread = (depth) => window.innerWidth / 2 ** (depth + 1);
const rootPosition = { x: window.innerWidth / 2, y: 70 };

const racketStringToTree = (str) => {
  str = str.replace(/\s+/g, " ").replace(/'\(\)/g, "(empty)");
  if (str === "(empty)") {
    return null;
  }
  const match = /^\(make-node\ (.*)\)$/;
  let matchResult = str.match(match);
  const children = matchResult[1];
  // split between left and right
  let brackets = 0;
  for (let i = 0; i < children.length; i++) {
    if (children[i] === "(") {
      brackets++;
      continue;
    }
    if (children[i] === ")") {
      brackets--;
    }

    if (brackets === 0) {
      const left = children.substring(0, i + 1);
      const right = children.substring(i + 2);
      return {
        ...(left === null ? {} : { left: racketStringToTree(left) }),
        ...(right === null ? {} : { right: racketStringToTree(right) }),
      };
    }
  }

  return null;
};

const treeHeight = (tree) => {
  if (tree === null) {
    return 0;
  }
  return 1 + Math.max(treeHeight(tree.left), treeHeight(tree.right));
};

const nodesInTree = (tree) => {
  if (tree === null) {
    return 0;
  }
  return 1 + nodesInTree(tree.left) + nodesInTree(tree.right);
};

const annotateTree = (tree, height) => {
  if (tree === null) {
    return tree;
  }
  if (height === undefined) {
    height = treeHeight(tree);
  }
  const fullNodes = 2 ** height - 1;
  const nodes = nodesInTree(tree);
  return {
    nodes,
    empties: fullNodes - nodes,
    left: annotateTree(tree.left, height - 1),
    right: annotateTree(tree.right, height - 1),
  };
};

const oldroot = racketStringToTree(
  `(make-node
 (make-node
  (make-node (make-node (make-node '() '()) (make-node '() (make-node '() '()))) (make-node (make-node '() '()) (make-node '() (make-node '() '()))))
  (make-node (make-node (make-node '() '()) (make-node '() (make-node '() '()))) (make-node (make-node '() '()) (make-node '() (make-node '() '())))))
 (make-node
  (make-node (make-node (make-node '() '()) (make-node '() (make-node '() '()))) (make-node (make-node '() '()) (make-node '() (make-node '() '()))))
  (make-node (make-node (make-node '() '()) (make-node '() (make-node '() '()))) (make-node (make-node '() (make-node '() '())) (make-node '() (make-node '() '()))))))`
);
oldroot.right = {
  left: {
    left: { left: null, right: { left: null, right: null } },
    right: { left: null, right: { left: null, right: null } },
  },
  right: {
    left: { left: null, right: { left: null, right: null } },
    right: {
      left: {
        left: null,
        right: null,
      },
      right: { left: null, right: null },
    },
  },
};

const root = {
  left: {
    left: {
      left: { left: null, right: null },
      right: { left: null, right: null },
    },
    right: { left: { left: null, right: null }, right: null },
  },
  right: { left: null, right: null },
};

const drawPath = (from, to) => {
  const path = new paper.Path();
  path.strokeColor = "black";
  path.moveTo(new paper.Point(from.x, from.y));
  path.lineTo(new paper.Point(to.x, to.y));
};

const drawTree = (tree, { x, y }, color = "black", depth = 0) => {
  if (tree === null) {
    return;
  }
  depth++;
  if (tree.left !== null) {
    const leftCoords = {
      x: x - spread(depth),
      y: y + depthLength,
    };

    drawPath({ x, y }, leftCoords);
    drawTree(tree.left, leftCoords, color, depth);
  }

  if (tree.right !== null) {
    const rightCoords = {
      x: x + spread(depth),
      y: y + depthLength,
    };

    drawPath({ x, y }, rightCoords);
    drawTree(tree.right, rightCoords, color, depth);
  }
  const node = new paper.Shape.Circle(new paper.Point(x, y), circleRadius);
  node.strokeColor = "black";
  node.fillColor = color;

  if (tree.nodes !== undefined) {
    const text = new paper.PointText(new paper.Point(x - 14, y));
    text.fontSize = 14;
    text.justification = "center";
    text.fillColor = "green";
    text.content = tree.nodes;
  }

  if (tree.empties !== undefined) {
    const text = new paper.PointText(new paper.Point(x + 14, y));
    text.fontSize = 14;
    text.justification = "center";
    text.fillColor = "red";
    text.content = tree.empties;
  }
};

const full = (tree) => {
  if (tree === null) {
    return true;
  }
  return (
    full(tree.left) &&
    full(tree.right) &&
    treeHeight(tree.left) === treeHeight(tree.right)
  );
};

const nodesAtHeight = (tree, height) => {
  if (tree === null) {
    return 0;
  }
  if (height === 1) {
    return 1;
  }
  return (
    nodesAtHeight(tree.left, height - 1) + nodesAtHeight(tree.right, height - 1)
  );
};

const fillTree = (tree, nodes) => {
  console.log(JSON.parse(JSON.stringify(tree)));
  if (tree === null || nodes === 0 || tree.empties === 0) {
    return tree;
  }
  if (tree.left === null && tree.right === null) {
    console.log(`uh oh both empty`);
    return tree;
  }
  if (nodes > 1) {
    console.log(`uh oh ${nodes}`);
  }
  if (tree.left === null) {
    return {
      left: { left: null, right: null },
      right: tree.right,
    };
  }
  if (tree.right === null) {
    return {
      left: tree.left,
      right: { left: null, right: null },
    };
  }
  if (tree.left.empties !== 0) {
    return { left: fillTree(tree.left), right: tree.right };
  }
  if (tree.right.empties !== 0) {
    return { left: tree.left, right: fillTree(tree.right) };
  }
};

const treeShrinkMin = (tree) => {
  tree = annotateTree(tree);
  switch (true) {
    case tree.left === null:
      return tree.right;
    case tree.right === null:
      return tree.left;
    case treeHeight(tree.left) > treeHeight(tree.right):
      return { left: treeShrinkMin(tree.left), right: tree.right };

    case treeHeight(tree.left) < treeHeight(tree.right):
      return { left: tree.left, right: treeShrinkMin(tree.right) };

    case nodesAtHeight(tree.left, treeHeight(tree.left)) <
      nodesAtHeight(tree.right, treeHeight(tree.right)):
      return { left: treeShrinkMin(tree.left), right: tree.right };

    default:
      return { left: tree.left, right: treeShrinkMin(tree.right) };
  }
};

const treeGrowMin = (tree) => {
  switch (true) {
    case tree === null:
      return {
        left: null,
        right: null,
      };
    case !full(tree.left):
      return {
        left: treeGrowMin(tree.left),
        right: tree.right,
      };
    case !full(tree.right):
      return {
        left: tree.left,
        right: treeGrowMin(tree.right),
      };

    case treeHeight(tree.left) < treeHeight(tree.right):
      return { left: treeGrowMin(tree.left), right: tree.right };

    default:
      return { left: tree.left, right: treeGrowMin(tree.right) };
  }
};

const tgmx = (tree, times) => {
  if (times === 0) {
    return tree;
  }
  return tgmx(treeGrowMin(tree), times - 1);
};

const tsmx = (tree, times) => {
  if (times === 0) {
    return tree;
  }
  return tsmx(treeShrinkMin(tree), times - 1);
};

const layers = [annotateTree(oldroot)];

const redraw = () => {
  paper.project.activeLayer.removeChildren();
  layers.forEach((tree, index) =>
    drawTree(
      tree,
      { x: rootPosition.x, y: rootPosition.y + index * 400 },
      "black" //new paper.Color(1 / (length - index), 0, 0)
    )
  );
};

window.onload = () => {
  const canvas = document.getElementById("vizCanvas");
  paper.setup(canvas);

  layers.push(annotateTree(tsmx(layers[0], 1)));
  redraw();
};
