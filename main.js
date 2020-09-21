const circleRadius = 5;
const depthLength = 100;
const spread = (depth, diff) => 300 / depth + Math.abs(diff) * 20;

const rootPosition = { x: window.innerWidth / 2, y: 20 };

const racketStringToTree = (str) => {
  str = str.replace(/\s+/g, " ").replace(/'\(\)/g, "(empty)");
  if (str === "(empty)") {
    return null;
  }
  const match = /^\(make-node\ (.*)\)$/;
  let matchResult = str.match(match);
  const children = matchResult[1];
  console.log(children);
  console.log(str);

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

      console.log(`left: ${left}\nright: ${right}`);

      return {
        ...(left === null ? {} : { left: racketStringToTree(left) }),
        ...(right === null ? {} : { right: racketStringToTree(right) }),
      };
    }
  }

  return null;
};

const root = racketStringToTree(
  `(make-node
 (make-node
  (make-node
   (make-node
    (make-node (make-node (make-node '() '()) (make-node '() '())) (make-node (make-node '() '()) (make-node '() '())))
    (make-node (make-node (make-node '() '()) (make-node '() '())) (make-node (make-node '() '()) (make-node '() '()))))
   (make-node
    (make-node (make-node (make-node '() '()) (make-node '() '())) (make-node (make-node '() '()) (make-node '() '())))
    (make-node (make-node (make-node '() '()) (make-node '() '())) (make-node (make-node '() '()) (make-node '() '())))))
  (make-node
   (make-node
    (make-node (make-node (make-node '() '()) (make-node '() '())) (make-node (make-node '() '()) (make-node '() '())))
    (make-node (make-node (make-node '() '()) (make-node '() '())) (make-node (make-node '() '()) (make-node '() '()))))
   (make-node
    (make-node (make-node (make-node '() '()) (make-node '() '())) (make-node (make-node '() '()) (make-node '() '())))
    (make-node (make-node (make-node '() '()) (make-node '() '())) (make-node (make-node '() '()) (make-node '() '()))))))
 (make-node
  (make-node
   (make-node (make-node (make-node '() '()) (make-node '() '())) (make-node (make-node '() '()) (make-node '() '())))
   (make-node (make-node (make-node '() '()) (make-node '() '())) (make-node (make-node '() '()) (make-node '() '()))))
  (make-node
   (make-node
    (make-node (make-node (make-node '() '()) (make-node '() '())) (make-node (make-node '() '()) (make-node '() '())))
    (make-node (make-node (make-node '() '()) (make-node '() '())) (make-node (make-node '() '()) (make-node '() '()))))
   (make-node
    (make-node (make-node '() '()) (make-node '() '()))
    (make-node (make-node (make-node '() '()) (make-node '() '())) (make-node (make-node '() '()) (make-node '() '())))))))`
);

console.log(root);

const drawPath = (from, to) => {
  const path = new paper.Path();
  path.strokeColor = "black";
  path.moveTo(new paper.Point(from.x, from.y));
  path.lineTo(new paper.Point(to.x, to.y));
};

const drawTree = (tree, { x, y }, depth = 0, diff = 0) => {
  if (tree === null) {
    return;
  }
  depth++;
  if (tree.left !== null) {
    const leftCoords = {
      x: x - spread(depth, diff - 1),
      y: y + depthLength,
    };

    drawPath({ x, y }, leftCoords);
    drawTree(tree.left, leftCoords, depth, diff - 1);
  }

  if (tree.right !== null) {
    const rightCoords = {
      x: x + spread(depth, diff + 1),
      y: y + depthLength,
    };

    drawPath({ x, y }, rightCoords);
    drawTree(tree.right, rightCoords, depth, diff + 1);
  }
  const node = new paper.Shape.Circle(new paper.Point(x, y), circleRadius);
  node.strokeColor = "black";
  node.fillColor = "white";
};

window.onload = () => {
  const canvas = document.getElementById("vizCanvas");
  paper.setup(canvas);

  drawTree(root, rootPosition);
};
